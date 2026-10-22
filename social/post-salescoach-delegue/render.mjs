// Gera os JPGs do post: node render.mjs  →  out/post-<foto>-<formato>.jpg
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('.');
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': ({ '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.html': 'text/html' })[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise(r => srv.listen(0, r));
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); fs.mkdirSync('out', { recursive: true });
for (const foto of ['homem', 'mulher']) for (const [f, h] of [['45', 1350], ['11', 1080]]) {
  const pg = await br.newPage({ viewport: { width: 1080, height: h } });
  await pg.goto(`http://localhost:${srv.address().port}/post.html?foto=${foto}&f=${f}`); await pg.evaluate(() => window.ready);
  await pg.screenshot({ path: `out/post-${foto}-${f === '45' ? '4x5' : '1x1'}.jpg`, type: 'jpeg', quality: 92 }); await pg.close(); }
await br.close(); srv.close();
