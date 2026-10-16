// API do CRM da NEXA para sistemas de fora (hoje, o Sales Coach).
//
// Autenticação: "Authorization: Bearer nexa_…", um token gerado em Ajustes →
// Integrações. Só o hash fica no banco (public.integracao_tokens); o token pode
// ser revogado a qualquer momento. Deploy com verify_jwt = false: quem chama não
// tem login do Supabase, a função confere o token ela mesma.
//
// Uma ação por chamada (POST { action, ... }):
//   info        nome da conta, para conferir a conexão
//   campos      campos que podem ser gravados na oportunidade
//   criar_campo cria um campo do Sales Coach (fica em config/integracao)
//   por_email   oportunidades ligadas ao e-mail (e contas-alvo ainda sem oportunidade)
//   buscar      oportunidades e contas-alvo pelo nome da empresa ou do contato
//   negocio     uma oportunidade com os valores dos campos. "conta:<id>" vira
//               oportunidade aqui (a reunião aconteceu, então a conta respondeu)
//   atualizar   grava campos na oportunidade
//   nota        anotação na oportunidade (e marca a última interação)
//   tarefa      vira o próximo passo da oportunidade, com data
import { createClient } from 'jsr:@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const H = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const resp = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: H });
class Erro extends Error { constructor(msg: string, public status = 400) { super(msg); } }

// deno-lint-ignore no-explicit-any
type Doc = Record<string, any>;

async function sha(s: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const novoId = () => [...crypto.getRandomValues(new Uint8Array(10))].map((x) => x.toString(16).padStart(2, '0')).join('');
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const addDias = (iso: string, n: number) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const norm = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const txt = (v: unknown, max = 500) => String(v ?? '').trim().slice(0, max);

// Domínios de e-mail pessoais: não servem para achar a empresa.
const PESSOAIS = new Set(['gmail.com', 'hotmail.com', 'outlook.com', 'live.com', 'yahoo.com', 'yahoo.com.br', 'icloud.com', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'msn.com', 'proton.me', 'protonmail.com']);
const dominioEmail = (e: string) => { const d = e.split('@')[1]?.toLowerCase() ?? ''; return d && !PESSOAIS.has(d) ? d : ''; };
const dominioSite = (s: unknown) => String(s ?? '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];

/** Campos nativos da oportunidade que o Sales Coach pode preencher. */
const NATIVOS = [
  { key: 'qtd', label: 'Usuários ou colaboradores', type: 'number', options: null },
  { key: 'proximoPasso', label: 'Próximo passo', type: 'text', options: null },
  { key: 'dataProximo', label: 'Data do próximo passo', type: 'date', options: null },
  { key: 'obs', label: 'Observações, dor, motivo de perda', type: 'text', options: null },
];

async function ler(col: string): Promise<{ id: string; data: Doc }[]> {
  const out: { id: string; data: Doc }[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await db.from('docs').select('path, data').eq('col', col).range(de, de + 999);
    if (error) throw new Erro('Não foi possível ler o CRM.', 500);
    out.push(...data.map((r) => ({ id: r.path.split('/').pop()!, data: r.data as Doc })));
    if (data.length < 1000) break;
  }
  return out;
}
async function doc(path: string): Promise<Doc | null> {
  const { data } = await db.from('docs').select('data').eq('path', path).maybeSingle();
  return (data?.data as Doc) ?? null;
}
async function gravar(path: string, data: Doc) {
  const { error } = await db.from('docs').upsert({ path, data }, { onConflict: 'path' });
  if (error) throw new Erro('Não foi possível gravar no CRM.', 500);
}

async function config() {
  const geral = (await doc('config/geral')) ?? {};
  const integ = (await doc('config/integracao')) ?? {};
  const nomes: Record<string, string> = {
    1: 'Em cadência', 2: 'Conversa iniciada', 3: 'Diagnóstico agendado', 4: 'Diagnóstico feito', 5: 'Proposta enviada',
    6: 'Negociação', 7: 'Ganho', 8: 'Perdido', 9: 'Nutrir',
  };
  for (const k in geral.etapas ?? {}) if (geral.etapas[k]?.nome) nomes[k] = geral.etapas[k].nome;
  return { etapas: nomes, campos: (integ.campos ?? []) as Doc[] };
}

/** Status no formato que o Sales Coach entende: "ongoing" é aberto. */
const status = (etapa: number) => etapa === 7 ? 'won' : etapa === 8 ? 'lost' : etapa === 9 ? 'paused' : 'ongoing';
function negocio(id: string, o: Doc, etapas: Record<string, string>, chaves: string[] = []) {
  const fields: Doc = {};
  for (const k of chaves) fields[k] = k.startsWith('sc_') ? (o.salesCoach ?? {})[k] ?? null : o[k] ?? null;
  return { id, name: `${o.empresa ?? 'Sem empresa'} · ${o.produto || 'oportunidade'} · ${etapas[o.etapa] ?? ''}`.replace(/ · $/, ''), status: status(+o.etapa || 2), fields };
}
const contaComoNegocio = (id: string, c: Doc) => ({
  id: `conta:${id}`, name: `${c.empresa ?? 'Sem empresa'} · conta-alvo (vira oportunidade ao vincular)`, status: 'ongoing', fields: {},
});

// Mesma regra de produto do CRM: escolhido na conta ou sugerido pela nota de encaixe.
function produtoConta(c: Doc) {
  if (c.produto) return c.produto;
  const v = +c.vendedores || 0, k = +c.colaboradores || 0;
  const sc = (v >= 5 && v <= 60 ? 2 : v >= 3 ? 1 : 0) + (c.online ? 2 : 0) + (c.crm ? 1 : 0);
  const at = (k >= 50 && k <= 1000 ? 2 : k > 1000 ? 1 : 0) + (c.rh ? 2 : 0) + (String(c.gatilho ?? '').trim() ? 1 : 0);
  return Math.max(sc, at) < 3 ? 'Fábrica de soluções' : sc >= at ? 'Sales Coach' : 'Atlas Clima';
}

/** A conta teve reunião: cria a oportunidade em "Diagnóstico feito", como o botão "Respondeu" faria. */
async function virarOportunidade(contaId: string): Promise<string> {
  const c = await doc('contas/' + contaId);
  if (!c) throw new Erro('Conta-alvo não encontrada no CRM.', 404);
  if (c.oppId && await doc('oportunidades/' + c.oppId)) return c.oppId;
  const prod = produtoConta(c), d = hoje(), etapa = 4, agora = new Date().toISOString();
  const hist: Doc = {}; for (let k = 2; k <= etapa; k++) hist[k] = d;
  const opp: Doc = {
    contaId, empresa: c.empresa ?? '', segmento: c.segmento ?? '', porte: c.porte ?? '', produto: prod,
    contato: c.decisor ?? '', cargo: c.cargo ?? '', canal: 'Sales Coach',
    qtd: prod === 'Atlas Clima' || prod === 'Atlas 360' ? (c.colaboradores ?? '') : prod === 'Sales Coach' ? (c.vendedores ?? '') : '',
    primeiroContato: c.inicioCadencia || d, ultimaInteracao: d, etapa, hist,
    proximoPasso: 'Mandar proposta ou marcar demo', dataProximo: addDias(d, 2), obs: c.obs ?? '',
    criadoEm: agora, atualizadoEm: agora, criadoPor: 'Sales Coach',
  };
  const id = novoId();
  await gravar('oportunidades/' + id, opp);
  await gravar('contas/' + contaId, { ...c, status: 'oportunidade', oppId: id, atualizadoEm: agora });
  return id;
}

async function oportunidade(id: string) {
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) throw new Erro('Oportunidade inválida.', 404);
  const o = await doc('oportunidades/' + id);
  if (!o) throw new Erro('Oportunidade não encontrada no CRM.', 404);
  return o;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return resp({ error: 'Use POST.' }, 405);
  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
    if (!/^nexa_[A-Za-z0-9]{20,}$/.test(token)) throw new Erro('Token ausente ou inválido.', 401);
    const { data: tk } = await db.from('integracao_tokens').select('id, nome, revogado_em').eq('hash', await sha(token)).maybeSingle();
    if (!tk || tk.revogado_em) throw new Erro('Token inválido ou revogado. Gere outro em Ajustes → Integrações.', 401);
    db.from('integracao_tokens').update({ ultimo_uso: new Date().toISOString() }).eq('id', tk.id).then(() => {}, () => {});

    const body = await req.json().catch(() => ({}));
    const cfg = await config();
    const chaves = Array.isArray(body.campos) ? body.campos.map(String) : [];

    switch (String(body.action ?? '')) {
      case 'info':
        return resp({ conta: 'NEXA Comercial', token: tk.nome });

      case 'campos':
        return resp({ campos: [...NATIVOS, ...cfg.campos.map(({ key, label, type, options }) => ({ key, label, type, options: options ?? null }))] });

      case 'criar_campo': {
        const label = txt(body.label, 120), type = ['number', 'text', 'date', 'option', 'hyperlink'].includes(body.type) ? body.type : 'text';
        if (!label) throw new Erro('Informe o nome do campo.');
        const existente = cfg.campos.find((c) => c.label === label);
        if (existente) return resp({ campo: existente });
        const campo = { key: 'sc_' + novoId().slice(0, 10), label, type, options: type === 'option' && Array.isArray(body.options) ? body.options.map((o: unknown) => txt(o, 80)) : null };
        await gravar('config/integracao', { campos: [...cfg.campos, campo] });
        return resp({ campo });
      }

      case 'por_email': {
        const email = txt(body.email, 200).toLowerCase();
        if (!email.includes('@')) return resp({ negocios: [] });
        const [contas, opps] = await Promise.all([ler('contas'), ler('oportunidades')]);
        const dom = dominioEmail(email);
        let achadas = contas.filter((c) => String(c.data.email ?? '').toLowerCase() === email);
        if (!achadas.length && dom) achadas = contas.filter((c) => dominioEmail(String(c.data.email ?? '')) === dom || dominioSite(c.data.site) === dom);
        const ids = new Set(achadas.map((c) => c.id)), empresas = new Set(achadas.map((c) => norm(c.data.empresa)));
        const doEmail = opps.filter((o) => ids.has(o.data.contaId) || empresas.has(norm(o.data.empresa)) || achadas.some((c) => c.data.oppId === o.id));
        const semOpp = achadas.filter((c) => !c.data.oppId && !doEmail.some((o) => o.data.contaId === c.id) && !['descartada'].includes(c.data.status));
        const negocios = [...doEmail.map((o) => negocio(o.id, o.data, cfg.etapas)), ...semOpp.map((c) => contaComoNegocio(c.id, c.data))];
        return resp({ negocios: negocios.sort((a, b) => Number(b.status === 'ongoing') - Number(a.status === 'ongoing')) });
      }

      case 'buscar': {
        const termo = norm(body.termo);
        if (termo.length < 2) return resp({ negocios: [] });
        const [contas, opps] = await Promise.all([ler('contas'), ler('oportunidades')]);
        const bate = (d: Doc) => norm(`${d.empresa} ${d.contato ?? ''} ${d.decisor ?? ''}`).includes(termo);
        const os = opps.filter((o) => bate(o.data)).sort((a, b) => Number((+b.data.etapa || 2) <= 6) - Number((+a.data.etapa || 2) <= 6));
        const cs = contas.filter((c) => bate(c.data) && !c.data.oppId && c.data.status !== 'descartada');
        return resp({ negocios: [...os.map((o) => negocio(o.id, o.data, cfg.etapas)), ...cs.map((c) => contaComoNegocio(c.id, c.data))].slice(0, 15) });
      }

      case 'negocio': {
        let id = txt(body.id, 80);
        if (id.startsWith('conta:')) id = await virarOportunidade(id.slice(6));
        return resp({ negocio: negocio(id, await oportunidade(id), cfg.etapas, chaves) });
      }

      case 'atualizar': {
        const id = txt(body.id, 80), o = await oportunidade(id), v = body.valores ?? {};
        const sc: Doc = { ...(o.salesCoach ?? {}) };
        for (const [k, val] of Object.entries(v)) {
          if (k.startsWith('sc_')) { if (cfg.campos.some((c) => c.key === k)) sc[k] = typeof val === 'number' ? val : txt(val, 2000); }
          else if (k === 'qtd') { if (!isNaN(Number(val))) o.qtd = Number(val); }
          else if (k === 'dataProximo') { if (/^\d{4}-\d{2}-\d{2}/.test(String(val))) o.dataProximo = String(val).slice(0, 10); }
          else if (k === 'proximoPasso' || k === 'obs') o[k] = txt(val, k === 'obs' ? 5000 : 300);
        }
        await gravar('oportunidades/' + id, { ...o, salesCoach: sc, atualizadoEm: new Date().toISOString() });
        return resp({ ok: true });
      }

      case 'nota': {
        const id = txt(body.id, 80), o = await oportunidade(id), texto = txt(body.texto, 8000);
        if (!texto) throw new Erro('Anotação vazia.');
        const anot = [...(o.anotacoes ?? []), { em: hoje(), texto, origem: 'Sales Coach' }].slice(-50);
        await gravar('oportunidades/' + id, { ...o, anotacoes: anot, ultimaInteracao: hoje(), atualizadoEm: new Date().toISOString() });
        return resp({ ok: true });
      }

      case 'tarefa': {
        const id = txt(body.id, 80), o = await oportunidade(id), nome = txt(body.nome, 300);
        const venc = /^\d{4}-\d{2}-\d{2}$/.test(String(body.vencimento)) ? String(body.vencimento) : addDias(hoje(), 2);
        if (!nome) throw new Erro('Tarefa sem nome.');
        const desc = txt(body.descricao, 4000);
        const anot = desc ? [...(o.anotacoes ?? []), { em: hoje(), texto: `Próximo passo sugerido pelo Sales Coach: ${nome}\n${desc}`, origem: 'Sales Coach' }].slice(-50) : o.anotacoes;
        await gravar('oportunidades/' + id, { ...o, proximoPasso: nome, dataProximo: venc, ...(anot ? { anotacoes: anot } : {}), atualizadoEm: new Date().toISOString() });
        return resp({ ok: true });
      }

      default:
        throw new Erro('Ação desconhecida.');
    }
  } catch (e) {
    if (e instanceof Erro) return resp({ error: e.message }, e.status);
    console.error('integracao:', e);
    return resp({ error: 'Erro inesperado no CRM.' }, 500);
  }
});
