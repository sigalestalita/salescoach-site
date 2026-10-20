// Leads dos formulários instantâneos da Meta (anúncios de cadastro no Instagram/Facebook)
// → aba Inbound do CRM (public.leads_inbound) e conta na fila, como os leads do site.
//
// Dois jeitos de chegar, use o que estiver disponível:
//
// 1. Webhook da Meta (direto, sem custo):
//    GET  ?hub.mode=subscribe&hub.verify_token=…&hub.challenge=…  → verificação
//    POST { object: "page", entry: [{ changes: [{ field: "leadgen", value: { leadgen_id, … } }] }] }
//         (assinado com o app secret) → busca o lead na Graph API e grava.
//    Segredos: META_APP_SECRET, META_VERIFY_TOKEN, META_PAGE_TOKEN (token da Página com
//    leads_retrieval). Opcional: META_GRAPH (padrão https://graph.facebook.com/v23.0).
//
// 2. Zapier / Make / Pluga (conector "Facebook Lead Ads" → Webhook POST):
//    POST com o cabeçalho  x-nexa-token: <LEAD_META_TOKEN>  e um JSON com os campos do
//    lead, em qualquer formato plano (full_name, email, phone_number, company_name,
//    job_title, campaign_name, ad_name, form_name, id, …). Perguntas personalizadas
//    também entram: o nome do campo vira o rótulo.
//
// O mesmo lead (leadgen_id) não é gravado duas vezes.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const env = (k: string) => Deno.env.get(k) ?? '';
const GRAPH = () => env('META_GRAPH') || 'https://graph.facebook.com/v23.0';
const json = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } });
const txt = (v: unknown, max = 120) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const hoje = () => new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const novoId = () => [...crypto.getRandomValues(new Uint8Array(10))].map((x) => x.toString(16).padStart(2, '0')).join('');
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

async function hmacHex(segredo: string, corpo: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(corpo)))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

type Lead = {
  leadgen_id: string; campos: Record<string, string>; criado?: string; plataforma?: string;
  campanha?: string; conjunto?: string; anuncio?: string; formulario?: string; form_id?: string; ad_id?: string;
};

// Campos do formulário → dados do lead. Aceita os nomes padrão da Meta e perguntas próprias
// ("Número do WhatsApp", "Quantos vendedores…", etc.).
function separar(campos: Record<string, string>) {
  let nome = '', email = '', whatsapp = '', empresa = '', cargo = '', vendedores = '', funcionarios = '';
  const extras: string[] = [];
  let primeiro = '', ultimo = '';
  for (const [chave, valor] of Object.entries(campos)) {
    const k = norm(chave), v = txt(valor, 200);
    if (!v) continue;
    if (k === 'full_name' || k === 'nome' || k === 'nome_completo' || k === 'name') nome ||= v;
    else if (k === 'first_name') primeiro = v;
    else if (k === 'last_name') ultimo = v;
    else if (k.includes('email') || k.includes('e_mail')) email ||= v.toLowerCase();
    else if (/phone|telefone|whats|celular/.test(k)) whatsapp ||= v.replace(/\D/g, '');
    else if (/company|empresa/.test(k)) empresa ||= v;
    else if (/job_title|cargo|funcao/.test(k)) cargo ||= v;
    else if (/vendedor/.test(k)) vendedores ||= v;
    else if (/funcionario|colaborador|employees/.test(k)) funcionarios ||= v;
    else extras.push(`${chave.replace(/_/g, ' ')}: ${v}`);
  }
  if (!nome) nome = [primeiro, ultimo].filter(Boolean).join(' ');
  return { nome: txt(nome, 80), email: txt(email, 120), whatsapp: whatsapp.slice(0, 15), empresa: txt(empresa, 120), cargo: txt(cargo, 80), vendedores: txt(vendedores, 40), funcionarios: txt(funcionarios, 40), extras };
}

async function gravar(db: any, l: Lead) {
  const { data: ja } = await db.from('leads_inbound').select('id').eq('rastreio->>leadgen_id', l.leadgen_id).limit(1);
  if (ja && ja.length) return 'repetido';

  const d = separar(l.campos);
  const canal = 'Meta Ads';
  const origem = `Meta · Formulário${l.plataforma === 'fb' ? ' (Facebook)' : l.plataforma === 'ig' ? ' (Instagram)' : ''}`;
  const campanha = l.campanha ? ` · campanha ${l.campanha}${l.anuncio ? ' / ' + l.anuncio : ''}` : '';
  const obs = `Inbound ${hoje()}: formulário instantâneo da Meta${l.formulario ? ' "' + l.formulario + '"' : ''} (${canal}${campanha}).` +
    ` Cargo: ${d.cargo || '—'}.` + (d.vendedores ? ` Vendedores: ${d.vendedores}.` : '') + (d.extras.length ? ' ' + d.extras.join('. ') + '.' : '');

  // Conta no CRM: atualiza se o e-mail já existe, senão cria na fila.
  let contaPath: string | null = null;
  try {
    const agora = new Date().toISOString();
    const { data: ex } = d.email ? await db.from('docs').select('path, data').eq('col', 'contas').eq('data->>email', d.email).limit(1) : { data: [] };
    if (ex && ex.length) {
      const c = ex[0].data as Record<string, unknown>;
      contaPath = ex[0].path;
      await db.from('docs').update({
        data: { ...c, inbound: true, telefone: c.telefone || d.whatsapp, cargo: c.cargo || d.cargo, status: c.status === 'nutrir' ? 'fila' : c.status, obs: [c.obs, obs].filter(Boolean).join('\n'), atualizadoEm: agora },
        updated_at: agora,
      }).eq('path', contaPath);
    } else {
      contaPath = 'contas/' + novoId();
      await db.from('docs').insert({
        path: contaPath, col: 'contas', updated_at: agora,
        data: {
          empresa: d.empresa || `${d.nome || 'Lead'} (empresa não informada)`, decisor: d.nome, cargo: d.cargo, email: d.email, telefone: d.whatsapp,
          produto: 'Sales Coach', online: true, status: 'fila', origem: `${origem} · ${canal}`, inbound: true, obs, criadoEm: agora, atualizadoEm: agora,
        },
      });
    }
  } catch (_) { contaPath = null; }

  const utm: Record<string, string> = { utm_source: 'meta', utm_medium: 'lead_ad' };
  if (l.campanha) utm.utm_campaign = l.campanha;
  if (l.anuncio) utm.utm_content = l.anuncio;
  const { error } = await db.from('leads_inbound').insert({
    material: 'formulario-meta', origem, canal, produto: 'Sales Coach', interesse: d.extras.join(' · ').slice(0, 300) || null,
    nome: d.nome, email: d.email, whatsapp: d.whatsapp, empresa: d.empresa, cargo: d.cargo,
    funcionarios: d.funcionarios || null, vendedores: d.vendedores || null, tamanho_time: d.vendedores || null,
    pagina: l.formulario ? `Formulário Meta: ${l.formulario}` : 'Formulário Meta', utm, conta_path: contaPath,
    rastreio: {
      leadgen_id: l.leadgen_id, form_id: l.form_id, ad_id: l.ad_id, plataforma: l.plataforma, criado_meta: l.criado,
      campanha: l.campanha, conjunto: l.conjunto, anuncio: l.anuncio, formulario: l.formulario, campos: l.campos,
      ultimo: utm, canal_primeiro: canal,
    },
  });
  if (error) throw error;
  return 'ok';
}

// Webhook da Meta: só traz o id; o conteúdo vem da Graph API com o token da Página.
async function buscarNaMeta(id: string, extra: Record<string, string>): Promise<Lead> {
  const campos = 'created_time,field_data,platform,form_id,ad_id,ad_name,adset_name,campaign_name';
  const r = await fetch(`${GRAPH()}/${encodeURIComponent(id)}?fields=${campos}&access_token=${encodeURIComponent(env('META_PAGE_TOKEN'))}`);
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`Graph API: ${j.error?.message ?? r.status}`);
  const fd: Record<string, string> = {};
  for (const f of j.field_data ?? []) fd[f.name] = Array.isArray(f.values) ? f.values.join(', ') : String(f.values ?? '');
  let formulario = '';
  if (j.form_id) {
    const fr = await fetch(`${GRAPH()}/${j.form_id}?fields=name&access_token=${encodeURIComponent(env('META_PAGE_TOKEN'))}`).then((x) => x.json()).catch(() => ({}));
    formulario = fr.name ?? '';
  }
  return {
    leadgen_id: id, campos: fd, criado: j.created_time, plataforma: j.platform, campanha: j.campaign_name, conjunto: j.adset_name,
    anuncio: j.ad_name, formulario, form_id: j.form_id ?? extra.form_id, ad_id: j.ad_id ?? extra.ad_id,
  };
}

// Zapier/Make: o JSON já vem com os campos, em formatos variados.
const META_CHAVES: Record<string, keyof Lead> = {
  id: 'leadgen_id', leadgen_id: 'leadgen_id', lead_id: 'leadgen_id', created_time: 'criado', platform: 'plataforma',
  campaign_name: 'campanha', adset_name: 'conjunto', ad_name: 'anuncio', form_name: 'formulario', form_id: 'form_id', ad_id: 'ad_id',
};
const IGNORAR = /^(page_id|page_name|adgroup_id|adset_id|campaign_id|is_organic|partner_name|retailer_item_id|custom_disclaimer_responses|inbox_url|vehicle)$/;
function deIntegracao(b: Record<string, unknown>): Lead {
  const l: Lead = { leadgen_id: '', campos: {} };
  const plano: Record<string, unknown> = { ...b };
  // field_data no formato da Graph API, se a integração repassar assim.
  if (Array.isArray(b.field_data)) for (const f of b.field_data as any[]) plano[f.name] = Array.isArray(f.values) ? f.values.join(', ') : f.values;
  delete plano.field_data;
  for (const [k, v] of Object.entries(plano)) {
    if (v === null || v === undefined || typeof v === 'object') continue;
    const m = META_CHAVES[k];
    if (m) (l as any)[m] = String(v);
    else if (!IGNORAR.test(k)) l.campos[k] = String(v);
  }
  if (!l.leadgen_id) l.leadgen_id = 'sem-id-' + novoId();
  return l;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const ok = url.searchParams.get('hub.mode') === 'subscribe' && env('META_VERIFY_TOKEN') && url.searchParams.get('hub.verify_token') === env('META_VERIFY_TOKEN');
    return ok ? new Response(url.searchParams.get('hub.challenge') ?? '', { status: 200 }) : new Response('forbidden', { status: 403 });
  }
  if (req.method !== 'POST') return json({ erro: 'Use POST.' }, 405);

  const corpo = await req.text();
  const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  // 2. Integração (Zapier/Make), com o token próprio.
  const tok = req.headers.get('x-nexa-token') ?? url.searchParams.get('token') ?? '';
  if (tok) {
    if (!env('LEAD_META_TOKEN') || !iguais(tok, env('LEAD_META_TOKEN'))) return json({ erro: 'Token inválido.' }, 401);
    let b: unknown; try { b = JSON.parse(corpo); } catch { return json({ erro: 'JSON inválido.' }, 400); }
    const lista = Array.isArray(b) ? b : [b];
    const res = [];
    for (const item of lista) res.push(await gravar(db, deIntegracao(item as Record<string, unknown>)).catch((e) => 'erro: ' + e.message));
    return json({ ok: true, res });
  }

  // 1. Webhook da Meta, assinado.
  const sig = req.headers.get('x-hub-signature-256') ?? '';
  if (!env('META_APP_SECRET') || !sig.startsWith('sha256=') || !iguais(sig.slice(7), await hmacHex(env('META_APP_SECRET'), corpo))) {
    return json({ erro: 'Assinatura inválida.' }, 401);
  }
  let b: any; try { b = JSON.parse(corpo); } catch { return json({ erro: 'JSON inválido.' }, 400); }
  const res: string[] = [];
  for (const e of b.entry ?? []) for (const c of e.changes ?? []) {
    if (c.field !== 'leadgen' || !c.value?.leadgen_id) continue;
    try { res.push(await gravar(db, await buscarNaMeta(String(c.value.leadgen_id), { form_id: String(c.value.form_id ?? ''), ad_id: String(c.value.ad_id ?? '') }))); }
    catch (err) { console.error('lead-meta:', err); res.push('erro'); }
  }
  // Sempre 200 para a Meta não desativar o webhook; erros ficam no log.
  return json({ ok: true, res });
});
