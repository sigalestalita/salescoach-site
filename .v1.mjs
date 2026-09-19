import { chromium } from 'playwright';
import path from 'path';
const OUT = '/private/tmp/claude-501/-Users-talitasigales/f846daae-f7dd-4db8-b05f-a4df7580a2dc/scratchpad/shots/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const erros = [];
p.on('pageerror', e => erros.push('JS: ' + e.message));
p.on('console', m => { if (m.type() === 'error') erros.push('console: ' + m.text()); });
p.on('requestfailed', r => erros.push('404: ' + r.url().split('/').pop()));
await p.goto('file://' + path.resolve('index.html'), { waitUntil: 'load' });
await p.evaluate(async () => { await Promise.all([...document.querySelectorAll('img')].map(i => i.complete ? null : i.decode().catch(() => {}))); });
await p.waitForTimeout(900);

const semCarregar = await p.evaluate(() => [...document.querySelectorAll('img')].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src.split('/').pop()));
const scrollH = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// barra de confiança
await p.evaluate(() => window.scrollTo(0, document.querySelector('.trust').offsetTop - 120));
await p.waitForTimeout(700);
await p.locator('.trust').screenshot({ path: OUT + 'n-trust.png' });
const marcas = await p.evaluate(() => [...document.querySelectorAll('.lane .mark')].slice(0, 4).map(m => {
  const r = m.getBoundingClientRect(), img = m.querySelector('img').getBoundingClientRect();
  return m.textContent.trim() + ' chip=' + Math.round(r.width) + 'x' + Math.round(r.height) + ' logo=' + Math.round(img.width) + 'x' + Math.round(img.height);
}));

// produto: 4 estados
const sec = await p.evaluate(() => { const e = document.getElementById('produto'); return { top: e.offsetTop, h: e.offsetHeight }; });
for (let i = 0; i < 4; i++) {
  const y = sec.top + 200 + i * (sec.h - 400) / 3;
  await p.evaluate(v => window.scrollTo(0, v), y);
  await p.waitForTimeout(1100);
  await p.screenshot({ path: OUT + 'n-prod' + (i + 1) + '.png' });
}
const ativo = await p.evaluate(() => ({
  passoAtivo: [...document.querySelectorAll('.os-step')].findIndex(e => e.classList.contains('on')),
  telaAtiva: [...document.querySelectorAll('.os-screen')].findIndex(e => e.classList.contains('on')),
  tamanhos: [...document.querySelectorAll('.os-screen img')].map(i => Math.round(i.getBoundingClientRect().width) + 'x' + Math.round(i.getBoundingClientRect().height)),
}));

// ecossistema
await p.evaluate(() => window.scrollTo(0, document.getElementById('ecossistema').offsetTop - 60));
await p.waitForTimeout(1200);
await p.screenshot({ path: OUT + 'n-eco.png' });
const fm = await p.evaluate(() => {
  const m = document.querySelector('.flowmap').getBoundingClientRect();
  const alinh = [...document.querySelectorAll('.fm-node.in')].map(n => { const r = n.getBoundingClientRect(); return Math.round(r.right - m.left) + '/' + Math.round(m.width * 0.1694); });
  return { mapa: Math.round(m.width) + 'x' + Math.round(m.height), bordaDireitaNo_vs_fio: alinh, pulsos: document.querySelectorAll('.flowmap .pulso').length };
});

console.log('rolagem horizontal:', scrollH);
console.log('imagens quebradas:', semCarregar.length ? semCarregar : 'nenhuma');
console.log('marcas:', marcas);
console.log('produto:', ativo);
console.log('flowmap:', fm);
console.log('erros:', erros.length ? [...new Set(erros)].slice(0, 8) : 'nenhum');
await b.close();
