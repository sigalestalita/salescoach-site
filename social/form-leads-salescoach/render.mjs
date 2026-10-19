// Fundo do formulário de leads (Meta): 1200×628, salvo em 2x (2400×1256). node render.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server'] });
const p = await b.newPage({ viewport: { width: 1200, height: 628 }, deviceScaleFactor: 2 });
await p.goto('file://' + path.resolve('banner.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.screenshot({ path: 'out/form-leads-sales-coach.jpg', type: 'jpeg', quality: 93 });
await b.close();
