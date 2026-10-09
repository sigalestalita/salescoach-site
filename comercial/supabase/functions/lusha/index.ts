// Ponte entre o CRM e a API v3 do Lusha.
// A chave fica só aqui, no segredo LUSHA_API_KEY (Supabase → Edge Functions → Secrets).
// Só atende quem está logado e tem papel admin ou vendas, e não deixa gastar mais
// créditos no mês do que o limite definido em public.lusha_config.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const LUSHA = 'https://api.lusha.com';
const ORIGENS = ['https://crm.nexatech.ia.br', 'http://localhost:8000', 'http://127.0.0.1:8000'];
const FILTROS_CONTATO = ['departments', 'seniority', 'countries', 'locations', 'existingDataPoints'];
const FILTROS_EMPRESA = ['sizes', 'industriesLabels', 'revenues'];

function cabecalhos(req: Request) {
  const o = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ORIGENS.includes(o) ? o : ORIGENS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
  };
}
const lista = (v: unknown, max = 25) => (Array.isArray(v) ? v : []).map(x => String(x).trim()).filter(Boolean).slice(0, max);
const inicioMes = () => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString(); };

async function lusha(chave: string, metodo: string, caminho: string, corpo?: unknown) {
  const r = await fetch(LUSHA + caminho, {
    method: metodo,
    headers: { 'api_key': chave, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  let dados: any = null; try { dados = JSON.parse(texto); } catch { dados = { message: texto.slice(0, 300) }; }
  return { status: r.status, dados };
}

function mensagemErro(status: number, dados: any): string {
  if (status === 401) return 'A chave do Lusha foi recusada. Confira o segredo LUSHA_API_KEY no Supabase.';
  if (status === 402) return 'A conta do Lusha está sem créditos para esta operação.';
  if (status === 403) return 'O Lusha recusou o acesso: ' + (dados?.message || 'recurso fora do plano ou API v3 não liberada para a conta.');
  if (status === 429) return 'Muitas consultas seguidas ao Lusha. Espere um minuto e tente de novo.';
  return 'O Lusha respondeu com erro ' + status + (dados?.message ? ': ' + dados.message : '.');
}

Deno.serve(async (req) => {
  const h = cabecalhos(req);
  const resp = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status, headers: h });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  if (req.method !== 'POST') return resp({ erro: 'Use POST.' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!, anon = Deno.env.get('SUPABASE_ANON_KEY')!, servico = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const usuarioDb = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const { data: u } = await usuarioDb.auth.getUser();
  if (!u?.user) return resp({ erro: 'Entre no CRM para usar o Lusha.' }, 401);
  const { data: papel } = await usuarioDb.rpc('meu_papel');
  if (papel !== 'admin' && papel !== 'vendas') return resp({ erro: 'Seu papel no CRM não permite usar o Lusha.' }, 403);

  const chave = Deno.env.get('LUSHA_API_KEY');
  if (!chave) return resp({ erro: 'A chave do Lusha ainda não foi configurada no Supabase (segredo LUSHA_API_KEY).', semChave: true }, 503);

  const db = createClient(url, servico);
  const gastoNoMes = async () => {
    const { data } = await db.from('lusha_uso').select('creditos').gte('criado_em', inicioMes());
    return (data ?? []).reduce((s: number, r: any) => s + Number(r.creditos || 0), 0);
  };
  const limite = async () => { const { data } = await db.from('lusha_config').select('limite_mensal').eq('id', 1).single(); return Number(data?.limite_mensal ?? 0); };
  const registra = (acao: string, quantidade: number, creditos: number, detalhe: unknown) =>
    db.from('lusha_uso').insert({ usuario: u.user!.email, acao, quantidade, creditos, detalhe });
  const cabe = async (estimativa: number) => { const [g, l] = await Promise.all([gastoNoMes(), limite()]); return { ok: g + estimativa <= l, gasto: g, limite: l }; };

  let corpo: any = {};
  try { corpo = await req.json(); } catch { return resp({ erro: 'Pedido sem JSON.' }, 400); }

  try {
    switch (corpo.acao) {
      case 'uso': {
        const [g, l, conta] = await Promise.all([gastoNoMes(), limite(), lusha(chave, 'GET', '/v3/account/usage')]);
        return resp({ gastoNoMes: g, limiteMensal: l, papel, conta: conta.status === 200 ? conta.dados : null, erroConta: conta.status === 200 ? null : mensagemErro(conta.status, conta.dados) });
      }

      case 'filtros': {
        const tipo = String(corpo.tipo || ''), q = corpo.query ? '?query=' + encodeURIComponent(String(corpo.query).slice(0, 256)) : '';
        const base = FILTROS_CONTATO.includes(tipo) ? '/v3/contacts/prospecting/filters/' : FILTROS_EMPRESA.includes(tipo) ? '/v3/companies/prospecting/filters/' : null;
        if (!base) return resp({ erro: 'Filtro desconhecido.' }, 400);
        const r = await lusha(chave, 'GET', base + tipo + q);
        return r.status === 200 ? resp(r.dados) : resp({ erro: mensagemErro(r.status, r.dados) }, r.status);
      }

      case 'buscar': {
        const f = corpo.filtros || {}, tamanho = Math.min(50, Math.max(10, Number(corpo.tamanho) || 25)), pagina = Math.min(1000, Math.max(0, Number(corpo.pagina) || 0));
        const estimativa = Math.ceil(tamanho / 25);
        const c = await cabe(estimativa);
        if (!c.ok) return resp({ erro: `Limite do mês atingido: ${c.gasto} de ${c.limite} créditos usados. Um admin pode aumentar o limite.`, limite: true }, 409);
        const contatos: any = { locations: lista(f.estados, 27).length ? lista(f.estados, 27).map(e => ({ country: 'Brazil', state: e })) : [{ country: 'Brazil' }] };
        if (lista(f.cargos).length) contatos.jobTitles = lista(f.cargos);
        if (Array.isArray(f.senioridades) && f.senioridades.length) contatos.seniorityIds = f.senioridades.map(Number).filter(Number.isFinite).slice(0, 10);
        if (lista(f.departamentos).length) contatos.departments = lista(f.departamentos);
        if (f.comEmail) contatos.existingDataPoints = ['work_email'];
        const empresas: any = {};
        if (lista(f.empresas).length) empresas.names = lista(f.empresas, 50);
        if (lista(f.dominios).length) empresas.domains = lista(f.dominios, 50);
        if (Array.isArray(f.tamanhos) && f.tamanhos.length) empresas.sizes = f.tamanhos.slice(0, 10).map((t: any) => ({ min: Number(t.min) || 1, ...(t.max ? { max: Number(t.max) } : {}) }));
        if (lista(f.setores).length) empresas.industriesLabels = lista(f.setores);
        const pedido: any = {
          pagination: { page: pagina, size: tamanho },
          filters: { contacts: { include: contatos } },
          options: { maxContactsPerCompany: Math.min(10, Math.max(1, Number(f.porEmpresa) || 3)) },
        };
        if (Object.keys(empresas).length) pedido.filters.companies = { include: empresas };
        const r = await lusha(chave, 'POST', '/v3/contacts/prospecting', pedido);
        if (r.status !== 200) return resp({ erro: mensagemErro(r.status, r.dados) }, r.status);
        const cobrado = Number(r.dados?.billing?.creditsCharged ?? estimativa);
        await registra('buscar', (r.dados?.results || []).length, cobrado, { filtros: f, pagina });
        return resp({ ...r.dados, gastoNoMes: c.gasto + cobrado, limiteMensal: c.limite });
      }

      case 'revelar': {
        const ids = lista(corpo.ids, 25), campos = lista(corpo.campos, 2).filter(x => x === 'emails' || x === 'phones');
        if (!ids.length || !campos.length) return resp({ erro: 'Escolha os contatos e o que revelar.' }, 400);
        const estimativa = ids.length * ((campos.includes('emails') ? 1 : 0) + (campos.includes('phones') ? 5 : 0));
        const c = await cabe(estimativa);
        if (!c.ok) return resp({ erro: `Isso pode custar até ${estimativa} créditos e passaria do limite do mês (${c.gasto} de ${c.limite} usados).`, limite: true }, 409);
        const r = await lusha(chave, 'POST', '/v3/contacts/enrich', { ids, reveal: campos, waterfallEnabled: false });
        if (r.status !== 200) return resp({ erro: mensagemErro(r.status, r.dados) }, r.status);
        const cobrado = Number(r.dados?.billing?.creditsCharged ?? estimativa);
        await registra('revelar', ids.length, cobrado, { ids, campos });
        return resp({ ...r.dados, gastoNoMes: c.gasto + cobrado, limiteMensal: c.limite });
      }

      default:
        return resp({ erro: 'Ação desconhecida.' }, 400);
    }
  } catch (e) {
    return resp({ erro: 'Não foi possível falar com o Lusha agora. Tente de novo em instantes.', detalhe: String(e).slice(0, 200) }, 502);
  }
});
