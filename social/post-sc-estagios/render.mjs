// Gera o JPG do post: node render.mjs  →  out/sc-estagios.jpg (1080×1350)
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve('.');
const tipos = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.html': 'text/html' };
const srv = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const br = await chromium.launch();
fs.mkdirSync('out', { recursive: true });
const pg = await br.newPage({ viewport: { width: 1080, height: 1350 } });
await pg.goto(`http://127.0.0.1:${srv.address().port}/post.html`);
await pg.evaluate(() => window.ready);
await pg.screenshot({ path: 'out/sc-estagios.jpg', type: 'jpeg', quality: 93 });
await br.close(); srv.close();
