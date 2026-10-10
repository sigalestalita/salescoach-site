// Automação "comente GUIA": recebe os webhooks do Instagram (comentários e mensagens),
// e quando alguém escreve GUIA manda o link do material no direct.
//
// - Comentário com GUIA → resposta privada (Private Replies API) com o link da landing
//   page + resposta pública curta no comentário ("te mandei no direct").
// - Mensagem no direct com GUIA → resposta na própria conversa.
// - Cada comentário/mensagem é respondido uma vez só (tabela public.ig_respostas).
//
// Segredos (Supabase → Edge Functions → Secrets):
//   IG_ACCESS_TOKEN   token de longa duração da conta profissional do Instagram (só o
//                     primeiro; depois a função guarda e renova o token em public.ig_config)
//   IG_APP_SECRET     chave secreta do app da Meta (valida a assinatura dos webhooks)
//   IG_VERIFY_TOKEN   texto qualquer, o mesmo cadastrado no painel de webhooks da Meta
//   IG_USER_ID        id da conta do Instagram (para ignorar os próprios comentários)
//   IG_GRAPH          opcional; padrão https://graph.instagram.com/v23.0
import { createClient } from 'jsr:@supabase/supabase-js@2';

const LINK = 'https://nexatech.ia.br/guia-objecoes/?utm_source=instagram&utm_medium=direct&utm_campaign=guia-objecoes';
const GATILHO = /\bguia\b/i;

const MENSAGEM = (nome?: string) =>
  `Oi${nome ? ', ' + nome : ''}! Aqui está o Guia das objeções em vendas B2B 👇\n\n` +
  `${LINK}\n\n` +
  'São 12 objeções que mais travam reuniões comerciais, com o que fazer e as perguntas para retomar a conversa em cada uma. Bom proveito!';

const RESPOSTAS_PUBLICAS = [
  'Te mandei no direct! 📩',
  'Enviado no seu direct 📩',
  'Pronto, olha o seu direct! 📩',
  'Guia enviado no direct 🙌',
];

const env = (k: string) => Deno.env.get(k) ?? '';
const GRAPH = () => env('IG_GRAPH') || 'https://graph.instagram.com/v23.0';

async function assinaturaValida(req: Request, corpo: string) {
  const segredo = env('IG_APP_SECRET');
  const recebida = req.headers.get('x-hub-signature-256') ?? '';
  if (!segredo || !recebida.startsWith('sha256=')) return false;
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(corpo)));
  const esperada = 'sha256=' + [...mac].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (esperada.length !== recebida.length) return false;
  let dif = 0;
  for (let i = 0; i < esperada.length; i++) dif |= esperada.charCodeAt(i) ^ recebida.charCodeAt(i);
  return dif === 0;
}

// Token de longa duração vale 60 dias. Guardamos no banco e renovamos quando passa de 20
// dias, a cada evento recebido, para a automação não parar no meio de uma campanha.
let TOKEN = '';
async function carregarToken(db: any) {
  const { data } = await db.from('ig_config').select('token, renovado_em').eq('id', 1).maybeSingle();
  TOKEN = data?.token || env('IG_ACCESS_TOKEN');
  const idade = data?.renovado_em ? Date.now() - new Date(data.renovado_em).getTime() : Infinity;
  if (!TOKEN || idade < 20 * 864e5) return;
  try {
    const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(TOKEN)}`);
    const j = await r.json();
    if (j.access_token) {
      TOKEN = j.access_token;
      await db.from('ig_config').upsert({ id: 1, token: TOKEN, renovado_em: new Date().toISOString() });
    }
  } catch (_) { /* segue com o token atual */ }
}

async function graph(caminho: string, corpo: unknown) {
  const r = await fetch(`${GRAPH()}${caminho}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(corpo),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${t.slice(0, 300)}`);
  return t;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Verificação do webhook no painel da Meta.
  if (req.method === 'GET') {
    const ok = url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === env('IG_VERIFY_TOKEN') && env('IG_VERIFY_TOKEN');
    return ok ? new Response(url.searchParams.get('hub.challenge') ?? '', { status: 200 }) : new Response('forbidden', { status: 403 });
  }
  if (req.method !== 'POST') return new Response('método não permitido', { status: 405 });

  const corpo = await req.text();
  if (!(await assinaturaValida(req, corpo))) return new Response('assinatura inválida', { status: 401 });

  let ev: any = {};
  try { ev = JSON.parse(corpo); } catch { return new Response('ok'); }
  const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
  const proprio = env('IG_USER_ID');
  await carregarToken(db);
  const tarefas: Promise<unknown>[] = [];

  // Marca como respondido antes de responder: se a Meta reenviar o evento, não duplica.
  const reservar = async (id: string, tipo: string, usuario: string, texto: string) => {
    const { error } = await db.from('ig_respostas').insert({ id, tipo, usuario, texto: texto.slice(0, 500) });
    return !error;
  };
  const concluir = (id: string, erro?: string) => db.from('ig_respostas').update({ status: erro ? 'erro' : 'enviado', erro: erro ?? null }).eq('id', id);

  for (const entry of ev.entry ?? []) {
    // Comentários em posts, reels e anúncios.
    for (const ch of entry.changes ?? []) {
      if (ch.field !== 'comments') continue;
      const v = ch.value ?? {};
      const texto = String(v.text ?? ''), de = v.from ?? {};
      if (!v.id || !GATILHO.test(texto) || (proprio && de.id === proprio)) continue;
      tarefas.push((async () => {
        if (!(await reservar(String(v.id), 'comentario', de.username ?? '', texto))) return;
        try {
          await graph(`/me/messages`, { recipient: { comment_id: v.id }, message: { text: MENSAGEM() } });
          const pub = RESPOSTAS_PUBLICAS[Math.floor(Math.random() * RESPOSTAS_PUBLICAS.length)];
          await graph(`/${v.id}/replies`, { message: pub }).catch(() => null);
          await concluir(String(v.id));
        } catch (e) { await concluir(String(v.id), String(e).slice(0, 500)); }
      })());
    }
    // Mensagens diretas com GUIA.
    for (const m of entry.messaging ?? []) {
      const texto = String(m.message?.text ?? '');
      const mid = String(m.message?.mid ?? '');
      if (!mid || m.message?.is_echo || !GATILHO.test(texto) || (proprio && m.sender?.id === proprio)) continue;
      tarefas.push((async () => {
        if (!(await reservar(mid, 'direct', String(m.sender?.id ?? ''), texto))) return;
        try {
          await graph(`/me/messages`, { recipient: { id: m.sender.id }, message: { text: MENSAGEM() } });
          await concluir(mid);
        } catch (e) { await concluir(mid, String(e).slice(0, 500)); }
      })());
    }
  }

  await Promise.allSettled(tarefas);
  // Sempre 200: se a Meta receber erro, ela reenvia o mesmo evento várias vezes.
  return new Response('ok');
});
