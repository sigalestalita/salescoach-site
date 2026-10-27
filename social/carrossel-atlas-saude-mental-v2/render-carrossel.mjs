// Gera os cards do carrossel: node render-carrossel.mjs  →  out/carrossel/card-01.jpg … card-11.jpg
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('.');
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': ({ '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.html': 'text/html' })[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise(r => srv.listen(0, r));
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); fs.mkdirSync('out/carrossel', { recursive: true });
const N = +(process.env.N || 10);
for (let s = 1; s <= N; s++) {
  const pg = await br.newPage({ viewport: { width: 1080, height: 1350 } });
  pg.on('pageerror', e => console.log('erro', s, e.message));
  await pg.goto(`http://localhost:${srv.address().port}/carrossel.html?s=${s}`); await pg.evaluate(() => window.ready);
  await pg.screenshot({ path: `out/carrossel/card-${String(s).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 92 }); await pg.close(); }
await br.close(); srv.close();
