// Envio dos toques de e-mail da cadência pela caixa do Gmail conectada, e leitura
// das respostas. Roda a cada 10 minutos (pg_cron), com trava de 4 minutos entre
// execuções, então chamadas a mais não aceleram nada.
//
// 1. Respostas (sempre): olha as conversas enviadas nos últimos 30 dias.
//    - resposta comum → a conta vira oportunidade em "Conversa iniciada";
//    - "não", "sair", "remover"… → "Pediu para não ser contatado" e sai da cadência;
//    - aviso de entrega (mailer-daemon) → e-mail marcado como inválido.
// 2. Envios (dias úteis, 8h–18h de Brasília, com "envio automático" ligado em Ajustes):
//    o próximo toque de e-mail que venceu, em cada conta em cadência, respeitando o
//    limite do dia (rampa: 20/dia na 1ª semana, 35 na 2ª, depois o limite de Ajustes).
//    Os toques seguintes vão na mesma conversa do primeiro e-mail.
//    Mensagem com campo entre colchetes não sai: a linha "[...]" é trocada pelo
//    gancho da conta; sem gancho, a conta fica marcada como pendente.
//
// Deploy com verify_jwt = false. Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? '';
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '';
const GMAIL = 'https://gmail.googleapis.com/gmail/v1/users/me';
const POR_EXECUCAO = 2;

// deno-lint-ignore no-explicit-any
type Doc = Record<string, any>;
const resp = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });
const agoraSP = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
const addDias = (iso: string, n: number) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const novoId = () => [...crypto.getRandomValues(new Uint8Array(10))].map((x) => x.toString(16).padStart(2, '0')).join('');

async function doc(path: string): Promise<Doc | null> {
  const { data } = await db.from('docs').select('data').eq('path', path).maybeSingle();
  return (data?.data as Doc) ?? null;
}
async function gravar(path: string, data: Doc) {
  const { error } = await db.from('docs').upsert({ path, data }, { onConflict: 'path' });
  if (error) throw new Error('docs: ' + error.message);
}

// ── Regras da cadência (as mesmas do CRM) ──
function notas(c: Doc) {
  const v = +c.vendedores || 0, k = +c.colaboradores || 0;
  const sc = (v >= 5 && v <= 60 ? 2 : v >= 3 ? 1 : 0) + (c.online ? 2 : 0) + (c.crm ? 1 : 0);
  const at = (k >= 50 && k <= 1000 ? 2 : k > 1000 ? 1 : 0) + (c.rh ? 2 : 0) + (String(c.gatilho ?? '').trim() ? 1 : 0);
  return Math.max(sc, at) < 3 ? 'Fábrica de soluções' : sc >= at ? 'Sales Coach' : 'Atlas Clima';
}
const produtoConta = (c: Doc) => c.produto || notas(c);
const isAtlas = (p: string) => p === 'Atlas Clima' || p === 'Atlas 360';
const ehEmail = (canal: string) => /e-?mail/i.test(canal ?? '');

/** Monta assunto e corpo do toque para a conta. null + motivo quando não dá para enviar. */
export function montaEmail(c: Doc, t: Doc, cfg: Doc): { assunto: string; corpo: string } | { motivo: string } {
  let txt = String((isAtlas(produtoConta(c)) ? t.atlas : t.sc) || t.sc || '');
  const nome = String(c.decisor ?? '').trim().split(/\s+/)[0];
  if (!nome) return { motivo: 'Conta sem nome do decisor' };
  const eu = String(cfg.vendedora ?? '').trim();
  const assinatura = String(cfg.email?.assinatura ?? '').trim();
  if (!assinatura) return { motivo: 'Falta a assinatura em Ajustes → E-mail' };
  txt = txt.replaceAll('{nome}', nome).replaceAll('{empresa}', c.empresa ?? '').replaceAll('{eu}', eu);
  let assunto = '';
  const m = txt.match(/^\s*Assunto:\s*(.+)\n+/i);
  if (m) { assunto = m[1].trim(); txt = txt.slice(m[0].length); }
  // Linha só com "[...]": vira o gancho da conta, ou sai (se Ajustes permitir).
  const gancho = String(c.gancho ?? '').trim();
  const linhas = txt.split('\n').flatMap((l) => {
    if (/^\s*\[[^\]]*\]\.?\s*$/.test(l)) return gancho ? [gancho] : cfg.email?.semGancho ? [] : ['\u0000'];
    return [l];
  });
  if (linhas.includes('\u0000')) return { motivo: 'Falta o gancho do e-mail (linha personalizada) na conta' };
  txt = linhas.join('\n').replace(/\n{3,}/g, '\n\n');
  if (/\[[^\]]+\]/.test(txt + assunto)) return { motivo: 'A mensagem tem um campo entre colchetes para preencher' };
  // Assinatura: no lugar da linha com só o nome; senão, no fim.
  const corpoLinhas = txt.trimEnd().split('\n');
  const i = eu ? corpoLinhas.findIndex((l) => l.trim() === eu) : -1;
  if (i >= 0) corpoLinhas.splice(i, 1, assinatura); else corpoLinhas.push('', assinatura);
  let corpo = corpoLinhas.join('\n');
  if (!/não receber mais|responder ["“]?(não|sair)/i.test(corpo)) corpo += '\n\nSe preferir não receber mais mensagens minhas, é só responder "não".';
  return { assunto, corpo };
}

// ── Gmail ──
async function tokenDeAcesso(refresh: string): Promise<string> {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: refresh, grant_type: 'refresh_token' }),
  }).then((r) => r.json());
  if (!r.access_token) throw new Error(r.error === 'invalid_grant' ? 'A conexão com o Gmail expirou ou foi revogada. Conecte de novo em Ajustes.' : `Google: ${r.error ?? 'sem token'}`);
  return r.access_token;
}
const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64url = (s: string) => b64(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const cabecalho = (s: string) => /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`;

function mime(de: string, nomeDe: string, para: string, assunto: string, corpo: string, emResposta?: string) {
  return [
    `From: ${cabecalho(nomeDe)} <${de}>`,
    `To: ${para}`,
    `Subject: ${cabecalho(assunto)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    ...(emResposta ? [`In-Reply-To: ${emResposta}`, `References: ${emResposta}`] : []),
    '',
    b64(corpo).replace(/.{76}/g, '$&\r\n'),
  ].join('\r\n');
}

async function gmail(token: string, path: string, init?: RequestInit) {
  const r = await fetch(`${GMAIL}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Gmail ${r.status}: ${j.error?.message ?? ''}`);
  return j;
}

/** Resposta pedindo para parar (começa com não/sair/remover...). */
const ehDescadastro = (txt: string) => /^\s*(n[ãa]o\b|nao\b|sair\b|remover|remova|descadastr|pare\b|parar\b|unsubscribe|stop\b)/i.test(txt);

async function oportunidadeDaResposta(contaId: string, c: Doc, resumo: string) {
  if (c.oppId && await doc('oportunidades/' + c.oppId)) return;
  const d = hoje(), agora = new Date().toISOString(), prod = produtoConta(c);
  const id = novoId();
  await gravar('oportunidades/' + id, {
    contaId, empresa: c.empresa ?? '', segmento: c.segmento ?? '', porte: c.porte ?? '', produto: prod,
    contato: c.decisor ?? '', cargo: c.cargo ?? '', canal: 'E-mail',
    qtd: isAtlas(prod) ? (c.colaboradores ?? '') : prod === 'Sales Coach' ? (c.vendedores ?? '') : '',
    primeiroContato: c.inicioCadencia || d, ultimaInteracao: d, etapa: 2, hist: { 2: d },
    proximoPasso: 'Responder o e-mail e marcar o diagnóstico', dataProximo: d,
    obs: c.obs ?? '', anotacoes: [{ em: d, texto: `Respondeu o e-mail: ${resumo}`, origem: 'E-mail' }],
    criadoEm: agora, atualizadoEm: agora, criadoPor: 'E-mail',
  });
  c.status = 'oportunidade'; c.oppId = id;
}

async function lerRespostas(token: string, eu: string) {
  const desde = new Date(Date.now() - 30 * 864e5).toISOString();
  const { data: abertos } = await db.from('email_envios').select('id, conta_id, thread_id, criado_em').eq('status', 'enviado').gte('criado_em', desde).not('thread_id', 'is', null).order('criado_em').limit(300);
  const porThread = new Map<string, Doc[]>();
  for (const e of abertos ?? []) porThread.set(e.thread_id, [...(porThread.get(e.thread_id) ?? []), e]);
  let n = 0;
  for (const [thread, envios] of [...porThread].slice(0, 80)) {
    let t: Doc;
    try { t = await gmail(token, `/threads/${thread}?format=metadata&metadataHeaders=From`); } catch { continue; }
    const primeiro = Date.parse(envios[0].criado_em);
    const deles = (t.messages ?? []).filter((m: Doc) => {
      const de = String((m.payload?.headers ?? []).find((h: Doc) => /^from$/i.test(h.name))?.value ?? '').toLowerCase();
      return !de.includes(eu) && +m.internalDate >= primeiro - 60_000;
    });
    if (!deles.length) continue;
    const m = deles[0];
    const de = String((m.payload?.headers ?? []).find((h: Doc) => /^from$/i.test(h.name))?.value ?? '').toLowerCase();
    const resumo = String(m.snippet ?? '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').slice(0, 300);
    const status = /mailer-daemon|postmaster|mail delivery/i.test(de) ? 'bounce' : ehDescadastro(resumo) ? 'descadastro' : 'respondido';
    await db.from('email_envios').update({ status, resposta: resumo, respondido_em: new Date(+m.internalDate).toISOString() }).in('id', envios.map((e) => e.id));
    const contaId = envios[0].conta_id, c = await doc('contas/' + contaId);
    if (!c) continue;
    const d = hoje(), anot = (texto: string) => [...(c.anotacoes ?? []), { em: d, dia: null, texto }].slice(-80);
    if (status === 'bounce') Object.assign(c, { emailInvalido: true, anotacoes: anot('O e-mail voltou (endereço inválido). Os próximos e-mails não serão enviados.') });
    else if (status === 'descadastro') Object.assign(c, { naoContatar: true, status: 'descartada', anotacoes: anot(`Pediu para não receber mais e-mails: "${resumo}"`) });
    else { c.anotacoes = anot(`Respondeu o e-mail: "${resumo}"`); await oportunidadeDaResposta(contaId, c, resumo); }
    c.atualizadoEm = new Date().toISOString();
    await gravar('contas/' + contaId, c);
    n++;
  }
  return n;
}

async function enviar(token: string, conta: Doc, cfg: Doc) {
  const h = agoraSP(), dia = h.getDay(), hora = h.getHours();
  if (!cfg.email?.auto) return { enviados: 0, motivo: 'envio automático desligado' };
  if (dia === 0 || dia === 6 || hora < 8 || hora >= 18) return { enviados: 0, motivo: 'fora do horário comercial' };
  const semanas = Math.floor((Date.now() - Date.parse(conta.conectado_em)) / (7 * 864e5));
  const limite = Math.min(semanas < 1 ? 20 : semanas < 2 ? 35 : 9999, Math.max(1, +(cfg.email?.limite ?? 50) || 50));
  const inicioDia = new Date(`${hoje()}T00:00:00-03:00`).toISOString();
  const { count } = await db.from('email_envios').select('id', { count: 'exact', head: true }).gte('criado_em', inicioDia).neq('status', 'erro');
  let livres = limite - (count ?? 0);
  if (livres <= 0) return { enviados: 0, motivo: `limite do dia (${limite}) atingido` };
  // Intervalos irregulares: às vezes pula a rodada.
  if (Math.random() < 0.3) return { enviados: 0, motivo: 'rodada pulada para espaçar os envios' };

  const cad = ((cfg.cadencia ?? []) as Doc[]).slice().sort((a, b) => a.d - b.d);
  const { data: rows } = await db.from('docs').select('path, data').eq('col', 'contas').eq('data->>status', 'cadencia');
  const { data: ja } = await db.from('email_envios').select('conta_id, dia, thread_id, message_id, assunto, criado_em, status').neq('status', 'erro').order('criado_em');
  const feitos = new Map<string, Doc[]>();
  for (const e of ja ?? []) feitos.set(e.conta_id, [...(feitos.get(e.conta_id) ?? []), e]);
  const d = hoje();
  let enviados = 0;
  for (const r of (rows ?? []).sort(() => Math.random() - .5)) {
    if (enviados >= POR_EXECUCAO || livres <= 0) break;
    const c = r.data as Doc, id = r.path.split('/').pop()!;
    const para = String(c.email ?? '').trim().toLowerCase();
    if (!para || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(para) || c.naoContatar || c.emailInvalido || !c.inicioCadencia) continue;
    const envios = feitos.get(id) ?? [];
    if (envios.some((e) => e.status && e.status !== 'enviado')) continue;
    const t = cad.find((t) => ehEmail(t.canal) && !(c.toques ?? []).includes(t.d) && !envios.some((e) => e.dia === t.d));
    if (!t || addDias(c.inicioCadencia, t.d - 1) > d) continue;
    const msg = montaEmail(c, t, cfg);
    if ('motivo' in msg) {
      if (c.emailPendente?.motivo !== msg.motivo || c.emailPendente?.dia !== t.d) await gravar(r.path, { ...c, emailPendente: { dia: t.d, motivo: msg.motivo, em: d } });
      continue;
    }
    const anterior = envios.find((e) => e.thread_id);
    const assunto = anterior ? `Re: ${String(anterior.assunto ?? '').replace(/^(re:\s*)+/i, '')}` : (msg.assunto || `NEXA · ${c.empresa ?? ''}`);
    try {
      const enviado = await gmail(token, '/messages/send', { method: 'POST', body: JSON.stringify({
        raw: b64url(mime(conta.email, String(cfg.vendedora ?? '').trim() || conta.email, para, assunto, msg.corpo, anterior?.message_id)),
        ...(anterior ? { threadId: anterior.thread_id } : {}),
      }) });
      const meta = await gmail(token, `/messages/${enviado.id}?format=metadata&metadataHeaders=Message-ID`).catch(() => ({}));
      const messageId = (meta.payload?.headers ?? []).find((h: Doc) => /^message-id$/i.test(h.name))?.value ?? null;
      await db.from('email_envios').insert({ conta_id: id, empresa: c.empresa ?? null, dia: t.d, de: conta.email, para, assunto: anterior ? anterior.assunto : assunto, gmail_id: enviado.id, thread_id: enviado.threadId, message_id: anterior?.message_id ?? messageId });
      const toques = [...new Set([...(c.toques ?? []), t.d])].sort((a: number, b: number) => a - b);
      await gravar(r.path, { ...c, toques, emailPendente: null, atualizadoEm: new Date().toISOString(),
        anotacoes: [...(c.anotacoes ?? []), { em: d, dia: t.d, texto: `E-mail enviado automaticamente: "${assunto}"` }].slice(-80) });
      enviados++; livres--;
    } catch (e) {
      console.error('email-cadencia: envio falhou', id, e);
      await db.from('email_envios').insert({ conta_id: id, empresa: c.empresa ?? null, dia: t.d, de: conta.email, para, assunto, status: 'erro', erro: String((e as Error).message).slice(0, 300) });
    }
  }
  return { enviados };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return resp({ error: 'Use POST.' }, 405);
  if (!CLIENT_ID || !CLIENT_SECRET) return resp({ error: 'Faltam GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.' }, 500);
  // Trava: no máximo uma execução a cada 4 minutos.
  const trava = await doc('config/email-execucao');
  if (trava?.em && Date.now() - Date.parse(trava.em) < 4 * 60_000) return resp({ ok: true, pulou: 'execução recente' });
  await gravar('config/email-execucao', { em: new Date().toISOString() });

  const { data: conta } = await db.from('gmail_contas').select('*').limit(1).maybeSingle();
  if (!conta) return resp({ ok: true, pulou: 'nenhuma caixa conectada' });
  try {
    const token = await tokenDeAcesso(conta.refresh_token);
    const cfg = (await doc('config/geral')) ?? {};
    const respostas = await lerRespostas(token, conta.email.toLowerCase());
    const envio = await enviar(token, conta, cfg);
    if (conta.ultimo_erro) await db.from('gmail_contas').update({ ultimo_erro: null }).eq('email', conta.email);
    return resp({ ok: true, respostas, ...envio });
  } catch (e) {
    const msg = (e as Error).message;
    console.error('email-cadencia:', msg);
    await db.from('gmail_contas').update({ ultimo_erro: msg.slice(0, 300), atualizado_em: new Date().toISOString() }).eq('email', conta.email);
    return resp({ ok: false, error: msg }, 500);
  }
});
