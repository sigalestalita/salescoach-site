// Gera o PDF do guia e prévias das páginas: node gerar-pdf.mjs [pasta-de-saida]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs';
const out = process.argv[2] || 'saida'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server'] });
const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
await p.goto('file://' + path.resolve('guia.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.pdf({ path: path.join(out, 'guia-objecoes-vendas-b2b.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
const n = await p.$$eval('.pag', a => a.length);
for (let i = 0; i < n; i++) { const el = (await p.$$('.pag'))[i]; await el.screenshot({ path: path.join(out, `pag-${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 88 }); }
console.log('páginas', n); await b.close();
