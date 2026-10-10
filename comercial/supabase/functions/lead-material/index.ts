// Recebe o formulário das landing pages de materiais gratuitos (ex.: Guia das objeções),
// grava o lead em public.leads_inbound e cria (ou atualiza) a conta no CRM, na fila da
// executiva. Pública (sem login): protege com honeypot, limite por IP e lista de origens.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ORIGENS = ['https://nexatech.ia.br', 'https://www.nexatech.ia.br', 'http://localhost:8000', 'http://127.0.0.1:8000'];
const MATERIAIS: Record<string, { nome: string; url: string; produto: string }> = {
  'guia-objecoes': {
    nome: 'Guia das objeções em vendas B2B',
    url: 'https://nexatech.ia.br/materiais/guia-objecoes-vendas-b2b.pdf',
    produto: 'Sales Coach',
  },
};
const TAMANHOS: Record<string, number> = { 'Só eu': 1, '2 a 5': 3, '6 a 15': 10, '16 a 50': 30, 'Mais de 50': 60 };

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

Deno.serve(async (req) => {
  const h = cabecalhos(req);
  const resp = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status, headers: h });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  if (req.method !== 'POST') return resp({ erro: 'Use POST.' }, 405);

  let c: any = {};
  try { c = await req.json(); } catch { return resp({ erro: 'Envio inválido.' }, 400); }
  const material = MATERIAIS[txt(c.material, 40)];
  if (!material) return resp({ erro: 'Material desconhecido.' }, 400);

  // Robôs preenchem o campo escondido: devolvemos sucesso sem gravar nada.
  if (txt(c.site)) return resp({ ok: true, url: material.url });

  const nome = txt(c.nome, 80), email = txt(c.email, 120).toLowerCase(), empresa = txt(c.empresa, 120);
  const cargo = txt(c.cargo, 60), tamanho = txt(c.tamanho, 20);
  const whatsapp = String(c.whatsapp ?? '').replace(/\D/g, '').slice(0, 15);
  if (nome.length < 2) return resp({ erro: 'Informe seu nome.', campo: 'nome' }, 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return resp({ erro: 'Confira o e-mail.', campo: 'email' }, 422);
  if (whatsapp.length < 10) return resp({ erro: 'Informe o WhatsApp com DDD.', campo: 'whatsapp' }, 422);
  if (empresa.length < 2) return resp({ erro: 'Informe a empresa.', campo: 'empresa' }, 422);

  const utm: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'pagina']) {
    const v = txt(c.utm?.[k], 200); if (v) utm[k] = v;
  }

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  const ipHash = ip ? await sha(ip + (Deno.env.get('LEAD_SAL') ?? 'nexa')) : null;

  if (ipHash) {
    const umaHora = new Date(Date.now() - 3600e3).toISOString();
    const { count } = await db.from('leads_inbound').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('criado_em', umaHora);
    if ((count ?? 0) >= 6) return resp({ erro: 'Muitos envios seguidos. Tente de novo mais tarde.' }, 429);
  }

  // Conta no CRM: atualiza se o e-mail já existe, senão cria na fila.
  const origemTxt = `Inbound: baixou o ${material.nome} em ${hoje()}. Cargo: ${cargo || '—'}. Time comercial: ${tamanho || '—'}.` +
    (utm.utm_source ? ` Origem: ${utm.utm_source}${utm.utm_campaign ? ' / ' + utm.utm_campaign : ''}.` : '');
  let contaPath: string | null = null;
  try {
    const { data: existentes } = await db.from('docs').select('path, data').eq('col', 'contas').eq('data->>email', email).limit(1);
    const agora = new Date().toISOString();
    if (existentes && existentes.length) {
      const d = existentes[0].data as Record<string, unknown>;
      contaPath = existentes[0].path;
      await db.from('docs').update({ data: { ...d, obs: [d.obs, origemTxt].filter(Boolean).join('\n'), atualizadoEm: agora }, updated_at: agora }).eq('path', contaPath);
    } else {
      contaPath = 'contas/' + novoId();
      await db.from('docs').insert({
        path: contaPath, col: 'contas', updated_at: agora,
        data: {
          empresa, decisor: nome, cargo, email, telefone: whatsapp, produto: material.produto,
          vendedores: TAMANHOS[tamanho] ?? '', online: true, status: 'fila', origem: 'LP · ' + material.nome,
          inbound: true, obs: origemTxt, criadoEm: agora, atualizadoEm: agora,
        },
      });
    }
  } catch (_) { contaPath = null; }

  const { error } = await db.from('leads_inbound').insert({
    material: txt(c.material, 40), nome, email, whatsapp, empresa, cargo, tamanho_time: tamanho, utm, ip_hash: ipHash, conta_path: contaPath,
  });
  if (error) return resp({ erro: 'Não foi possível registrar agora. Tente de novo.' }, 500);

  return resp({ ok: true, url: material.url });
});
