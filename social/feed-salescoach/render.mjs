// node render.mjs post-coach.html saida.jpg  → JPG 2160×2700 (4:5 em 2x, nítido no feed)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const [,, html, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await p.goto('file://' + path.resolve(html)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.screenshot({ path: out, type: 'jpeg', quality: 95 }); await b.close();
