// Renderiza a camada de legendas em PNG transparente, quadro a quadro: node legendas.mjs inicio fim pasta
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, a, b, out = 'legendas'] = process.argv; const root = path.resolve('.');
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200); r.end(d); }); });
await new Promise(r => srv.listen(0, r));
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
await pg.goto(`http://localhost:${srv.address().port}/legendas.html`); await pg.waitForFunction(() => window.ready); await pg.evaluate(() => window.ready);
fs.mkdirSync(out, { recursive: true });
for (let f = +a; f < +b; f++) { await pg.evaluate(t => window.renderAt(t), f / 30); await pg.screenshot({ path: `${out}/l_${String(f).padStart(5, '0')}.png`, omitBackground: true }); }
await br.close(); srv.close();
