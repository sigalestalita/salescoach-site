// Gera as telas da série: node render.mjs [ids...]  →  out/<id>-<slug>/tela-01.jpg …
// Sem ids, gera os 12 posts. serie.html?p=<id>&s=<n> mostra uma tela no navegador.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path'; import vm from 'vm';
const root = path.resolve('.');
const tipos = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.html': 'text/html' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise((r) => srv.listen(0, r));
const ctx = {}; vm.runInNewContext(fs.readFileSync('dados.js', 'utf8') + ';this.POSTS = POSTS;', ctx);
const ids = process.argv.slice(2);
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const p of ctx.POSTS.filter((x) => !ids.length || ids.includes(x.id))) {
  const dir = `out/${p.id}-${p.slug}`; fs.mkdirSync(dir, { recursive: true });
  for (let s = 1; s <= p.telas.length; s++) {
    const pg = await br.newPage({ viewport: { width: 1080, height: 1350 } });
    pg.on('pageerror', (e) => console.log('erro', p.id, s, e.message));
    await pg.goto(`http://localhost:${srv.address().port}/serie.html?p=${p.id}&s=${s}`); await pg.evaluate(() => window.ready);
    await pg.screenshot({ path: `${dir}/tela-${String(s).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 90 }); await pg.close();
  }
  console.log(p.id, p.telas.length, 'telas');
}
await br.close(); srv.close();
