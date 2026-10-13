// Recebe o formulário de contato do site da NEXA (home, Sales Coach e Atlas), grava o
// lead em public.leads_inbound com todo o rastreio da conversão (página, UTMs, ids de
// clique, primeiro e último toque) e cria ou atualiza a conta no CRM, na fila.
// Pública (sem login): protege com honeypot, limite por IP e lista de origens.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ORIGENS = ['https://nexatech.ia.br', 'https://www.nexatech.ia.br', 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://127.0.0.1:8080'];

// Página do formulário → como aparece no CRM.
const PAGINAS: Record<string, { origem: string; produto: string }> = {
  'home': { origem: 'Site · Home', produto: '' },
  'sales-coach': { origem: 'Site · Sales Coach', produto: 'Sales Coach' },
  'atlas': { origem: 'Site · Atlas', produto: 'Atlas Clima' },
};
const FUNCIONARIOS: Record<string, number> = { '1 a 10': 5, '11 a 50': 30, '51 a 200': 120, '201 a 500': 350, '501 a 1.000': 750, 'Mais de 1.000': 1500 };
const VENDEDORES: Record<string, number> = { '1 a 5': 3, '6 a 15': 10, '16 a 50': 30, '51 a 100': 75, 'Mais de 100': 150 };
const CHAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'landing', 'referrer', 'ts'];

function cabecalhos(req: Request) {
  const o = req.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ORIGENS.includes(o) ? o : ORIGENS[0],
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
  };
}
const txt = (v: unknown, max = 120) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const hoje = () => new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
async function sha(s: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
const novoId = () => [...crypto.getRandomValues(new Uint8Array(10))].map((x) => x.toString(16).padStart(2, '0')).join('');

// Só as chaves conhecidas, como texto curto.
function toque(t: any) {
  const r: Record<string, string> = {};
  if (!t || typeof t !== 'object') return r;
  for (const k of CHAVES) { const v = txt(t[k], 300); if (v) r[k] = v; }
  return r;
}

// Canal de aquisição a partir do toque (ids de clique primeiro, depois UTM, depois quem indicou).
function canalDe(t: Record<string, string>) {
  const s = (t.utm_source || '').toLowerCase(), m = (t.utm_medium || '').toLowerCase();
  const pago = /cpc|ppc|paid|pago|ads|cpm|display|social_paid|paid_social/.test(m);
  if (/^(meta|facebook|fb|instagram|ig)$/.test(s) && pago || t.fbclid && pago) return 'Meta Ads';
  if (t.gclid || t.gbraid || t.wbraid || s === 'google' && pago) return 'Google Ads';
  if (t.li_fat_id || s === 'linkedin' && pago) return 'LinkedIn Ads';
  if (t.msclkid) return 'Microsoft Ads';
  if (t.ttclid || s === 'tiktok' && pago) return 'TikTok Ads';
  if (s) return /^(meta|facebook|fb|instagram|ig)$/.test(s) ? 'Instagram/Facebook (orgânico)' : s === 'email' || m === 'email' ? 'E-mail' : `${t.utm_source}${m ? ' / ' + t.utm_medium : ''}`;
  if (t.fbclid) return 'Meta (sem UTM)';
  const ref = (t.referrer || '').toLowerCase();
  if (!ref || ref.includes('nexatech.ia.br')) return 'Direto';
  if (/google\.|bing\.|duckduckgo|yahoo\./.test(ref)) return 'Busca orgânica';
  if (/instagram|facebook|fb\.|l\.instagram/.test(ref)) return 'Instagram/Facebook (orgânico)';
  if (/linkedin|lnkd/.test(ref)) return 'LinkedIn (orgânico)';
  if (/whatsapp|wa\.me/.test(ref)) return 'WhatsApp';
  try { return 'Indicação · ' + new URL(t.referrer).hostname.replace(/^www\./, ''); } catch { return 'Indicação'; }
}

Deno.serve(async (req) => {
  const h = cabecalhos(req);
  const resp = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status, headers: h });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  if (req.method !== 'POST') return resp({ erro: 'Use POST.' }, 405);

  let c: any = {};
  try { c = await req.json(); } catch { return resp({ erro: 'Envio inválido.' }, 400); }
  const pg = PAGINAS[txt(c.formulario, 20)] ?? PAGINAS.home;

  // Robôs preenchem o campo escondido: devolvemos sucesso sem gravar nada.
  if (txt(c.site)) return resp({ ok: true });

  const nome = txt(c.nome, 80), email = txt(c.email, 120).toLowerCase();
  const whatsapp = String(c.whatsapp ?? '').replace(/\D/g, '').slice(0, 15);
  const empresa = txt(c.empresa, 120), cargo = txt(c.cargo, 80), interesse = txt(c.interesse, 60);
  const funcionarios = FUNCIONARIOS[txt(c.funcionarios, 20)] ? txt(c.funcionarios, 20) : '';
  const vendedores = VENDEDORES[txt(c.vendedores, 20)] ? txt(c.vendedores, 20) : '';
  if (nome.length < 2) return resp({ erro: 'Informe seu nome.', campo: 'nome' }, 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return resp({ erro: 'Confira o e-mail.', campo: 'email' }, 422);
  if (whatsapp.length < 10) return resp({ erro: 'Informe o WhatsApp com DDD.', campo: 'whatsapp' }, 422);

  // Rastreio: último toque (decide o canal), primeiro toque e contexto da conversão.
  const r = c.rastreio ?? {};
  const ultimo = toque(r.ultimo), primeiro = toque(r.primeiro);
  const canal = canalDe(Object.keys(ultimo).length ? ultimo : primeiro);
  const rastreio = {
    ultimo, primeiro, canal_primeiro: Object.keys(primeiro).length ? canalDe(primeiro) : canal,
    pagina: txt(r.pagina, 400), titulo: txt(r.titulo, 160), referrer: txt(r.referrer, 400),
    fbp: txt(r.fbp, 80), fbc: txt(r.fbc, 300), ga: txt(r.ga, 80), event_id: txt(r.event_id, 60),
    visitas: Number(r.visitas) || null, segundos_na_pagina: Number(r.segundos) || null,
    dispositivo: txt(r.dispositivo, 20), tela: txt(r.tela, 20), idioma: txt(r.idioma, 20),
    navegador: txt(req.headers.get('user-agent'), 300),
    pais: txt(req.headers.get('cf-ipcountry'), 4),
  };
  const utm: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']) if (ultimo[k]) utm[k] = ultimo[k];
  utm.pagina = rastreio.pagina;

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const ipHash = ip ? await sha(ip + (Deno.env.get('LEAD_SAL') ?? 'nexa')) : null;
  if (ipHash) {
    const umaHora = new Date(Date.now() - 3600e3).toISOString();
    const { count } = await db.from('leads_inbound').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('criado_em', umaHora);
    if ((count ?? 0) >= 6) return resp({ erro: 'Muitos envios seguidos. Tente de novo mais tarde.' }, 429);
  }

  // Conta no CRM: atualiza se o e-mail já existe, senão cria na fila.
  const campanha = ultimo.utm_campaign ? ` · campanha ${ultimo.utm_campaign}${ultimo.utm_content ? ' / ' + ultimo.utm_content : ''}` : '';
  const origemTxt = `Inbound ${hoje()}: formulário ${pg.origem} (${canal}${campanha}).` +
    ` Cargo: ${cargo || '—'}. Funcionários: ${funcionarios || '—'}.` + (vendedores ? ` Vendedores: ${vendedores}.` : '') + (interesse ? ` Interesse: ${interesse}.` : '');
  let contaPath: string | null = null;
  try {
    const { data: existentes } = await db.from('docs').select('path, data').eq('col', 'contas').eq('data->>email', email).limit(1);
    const agora = new Date().toISOString();
    if (existentes && existentes.length) {
      const d = existentes[0].data as Record<string, unknown>;
      contaPath = existentes[0].path;
      await db.from('docs').update({
        data: {
          ...d, inbound: true, telefone: d.telefone || whatsapp, cargo: d.cargo || cargo,
          // Quem estava em nutrição e voltou a pedir contato volta para a fila.
          status: d.status === 'nutrir' ? 'fila' : d.status,
          obs: [d.obs, origemTxt].filter(Boolean).join('\n'), atualizadoEm: agora,
        }, updated_at: agora,
      }).eq('path', contaPath);
    } else {
      contaPath = 'contas/' + novoId();
      await db.from('docs').insert({
        path: contaPath, col: 'contas', updated_at: agora,
        data: {
          empresa: empresa || `${nome} (empresa não informada)`, decisor: nome, cargo, email, telefone: whatsapp, produto: pg.produto,
          colaboradores: FUNCIONARIOS[funcionarios] ?? '', vendedores: VENDEDORES[vendedores] ?? '', online: true, status: 'fila',
          origem: `${pg.origem} · ${canal}`, inbound: true, obs: origemTxt, criadoEm: agora, atualizadoEm: agora,
        },
      });
    }
  } catch (_) { contaPath = null; }

  const { error } = await db.from('leads_inbound').insert({
    material: 'formulario-site', origem: pg.origem, canal, produto: pg.produto || null, interesse: interesse || null,
    nome, email, whatsapp, empresa, cargo, funcionarios: funcionarios || null, vendedores: vendedores || null,
    tamanho_time: vendedores || null, pagina: rastreio.pagina, utm, rastreio, ip_hash: ipHash, conta_path: contaPath,
  });
  if (error) return resp({ erro: 'Não foi possível registrar agora. Tente de novo.' }, 500);
  return resp({ ok: true });
});
