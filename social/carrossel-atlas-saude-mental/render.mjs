// Gera um JPG 2160×2700 por tela: node render.mjs [pasta-de-saida]  →  out/atlas-saude-mental-01..08.jpg
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs';
const out = process.argv[2] || 'out'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await p.goto('file://' + path.resolve('carrossel.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const s = await p.$$('.s');
for (let i = 0; i < s.length; i++) await s[i].screenshot({ path: path.join(out, `atlas-saude-mental-${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 92 });
console.log('telas', s.length); await b.close();
