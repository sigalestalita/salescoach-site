// node render.mjs sales-coach.html saida.png → PNG 1080×1920 (Stories)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const [,, html, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + path.resolve(html)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.screenshot({ path: out, type: out.endsWith('.jpg') ? 'jpeg' : 'png', ...(out.endsWith('.jpg') ? { quality: 95 } : {}) }); await b.close();
