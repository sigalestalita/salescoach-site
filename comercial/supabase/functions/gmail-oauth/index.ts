// Conexão da caixa do Gmail (Google Workspace) com o CRM, para os e-mails da cadência.
//
// POST (com o login do CRM no Authorization):
//   { action: "url" }         admin: endereço de autorização do Google
//   { action: "desconectar" } admin: apaga o token e revoga no Google
// GET  ?code&state             volta do Google: troca o código, guarda o token e
//                              devolve a pessoa para Ajustes no CRM.
//
// Deploy com verify_jwt = false: a volta do Google não traz login; o "state" é
// assinado (HMAC com o client secret) e vale 10 minutos.
// Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const db = createClient(SB_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? '';
const CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '';
const CRM = Deno.env.get('CRM_URL') ?? 'https://crm.nexatech.ia.br';
const REDIRECT = `${SB_URL.replace(/\/$/, '')}/functions/v1/gmail-oauth`;
const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];
const ORIGENS = [CRM, 'http://localhost:8000', 'http://127.0.0.1:8000'];

const cors = (req: Request) => {
  const o = req.headers.get('Origin') ?? '';
  return { 'Access-Control-Allow-Origin': ORIGENS.includes(o) ? o : CRM, 'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', Vary: 'Origin' };
};
const resp = (req: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors(req), 'Content-Type': 'application/json' } });
const volta = (status: string, msg = '') => new Response(null, { status: 302, headers: { Location: `${CRM}/?gmail=${status}${msg ? '&motivo=' + encodeURIComponent(msg) : ''}#ajustes` } });

const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function hmac(txt: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(CLIENT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(txt))));
}
async function assinaState(email: string) {
  const corpo = b64url(new TextEncoder().encode(JSON.stringify({ e: email, x: Date.now() + 10 * 60_000 })));
  return `${corpo}.${await hmac(corpo)}`;
}
async function leState(state: string): Promise<string | null> {
  const [corpo, sig] = state.split('.');
  if (!corpo || !sig || sig !== await hmac(corpo)) return null;
  try {
    const j = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(corpo.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))));
    return j.x > Date.now() ? String(j.e) : null;
  } catch { return null; }
}

/** Quem chamou, pelo login do CRM, e se é admin (tabela membros). */
async function admin(req: Request): Promise<string | null> {
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return null;
  const { data } = await db.auth.getUser(jwt);
  const email = data.user?.email?.toLowerCase();
  if (!email) return null;
  const { data: m } = await db.from('membros').select('papel').eq('email', email).maybeSingle();
  return m?.papel === 'admin' ? email : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
  if (!CLIENT_ID || !CLIENT_SECRET) return resp(req, { error: 'Faltam GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET nos secrets do Supabase.' }, 500);

  // ── Volta do Google ──
  if (req.method === 'GET') {
    const u = new URL(req.url);
    if (u.searchParams.get('error')) return volta('erro', u.searchParams.get('error') === 'access_denied' ? 'Acesso negado no Google.' : u.searchParams.get('error')!);
    const quem = await leState(u.searchParams.get('state') ?? '');
    const code = u.searchParams.get('code');
    if (!quem || !code) return volta('erro', 'O link de conexão expirou. Tente de novo.');
    const t = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
    }).then((r) => r.json()).catch(() => ({}));
    if (!t.refresh_token || !t.access_token) {
      console.error('gmail-oauth: troca do código falhou', t.error, t.error_description);
      return volta('erro', 'O Google não devolveu a autorização completa. Tente de novo.');
    }
    const escopos = String(t.scope ?? '');
    if (!SCOPES.every((s) => escopos.includes(s))) return volta('erro', 'Marque as duas permissões (enviar e ler e-mails) na tela do Google.');
    const perfil = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers: { Authorization: `Bearer ${t.access_token}` } }).then((r) => r.json()).catch(() => ({}));
    const email = String(perfil.emailAddress ?? '').toLowerCase();
    if (!email) return volta('erro', 'Não deu para ler o endereço da caixa.');
    // Uma caixa por vez: conectar outra substitui a anterior.
    await db.from('gmail_contas').delete().neq('email', email);
    const { error } = await db.from('gmail_contas').upsert({ email, refresh_token: t.refresh_token, conectado_por: quem, conectado_em: new Date().toISOString(), ultimo_erro: null, atualizado_em: new Date().toISOString() });
    if (error) { console.error('gmail-oauth: gravar', error); return volta('erro', 'Não deu para salvar a conexão.'); }
    return volta('ok');
  }

  // ── Ações do CRM ──
  const quem = await admin(req);
  if (!quem) return resp(req, { error: 'Só administradores do CRM conectam o e-mail.' }, 403);
  const body = await req.json().catch(() => ({}));
  if (body.action === 'url') {
    const q = new URLSearchParams({
      client_id: CLIENT_ID, redirect_uri: REDIRECT, response_type: 'code', scope: SCOPES.join(' '),
      access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state: await assinaState(quem),
    });
    return resp(req, { url: `https://accounts.google.com/o/oauth2/v2/auth?${q}` });
  }
  if (body.action === 'desconectar') {
    const { data: contas } = await db.from('gmail_contas').select('refresh_token');
    for (const c of contas ?? []) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(c.refresh_token)}`, { method: 'POST' }).catch(() => {});
    await db.from('gmail_contas').delete().neq('email', '');
    return resp(req, { ok: true });
  }
  return resp(req, { error: 'Ação desconhecida.' }, 400);
});
