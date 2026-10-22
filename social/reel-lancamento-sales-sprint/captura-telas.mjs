// Captura as telas do app (as mesmas do vídeo) para usar em posts: a janela inteira e o destaque de cada uma.
// node captura-telas.mjs <pasta-de-saída>  →  <id>-janela.png e <id>-destaque.png (fundo transparente, 2x)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const out = process.argv[2] || 'telas'; const root = path.resolve('.');
const tipos = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.html': 'text/html' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise(r => srv.listen(0, r));
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await br.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
await pg.goto(`http://localhost:${srv.address().port}/index.html`); await pg.waitForFunction(() => window.ready); await pg.evaluate(() => window.ready);
fs.mkdirSync(out, { recursive: true });
const TELAS = [['c1', 5.0, '#c1sc'], ['c2', 3.5, '#c2sc'], ['c3', 5.5, '#c3k1'], ['c4', 5.5, '#crm'], ['c5', 6.0, '#c5fb .st.navy'], ['c6', 4.0, '#c6a0'], ['c7', 6.5, '#c7as']];
for (const [id, lt, sel] of TELAS) {
  await pg.evaluate(([id, lt]) => {
    [...document.body.children].forEach(e => { if (e.id !== 'c3d' && e.tagName !== 'SCRIPT') e.style.display = 'none'; });
    document.documentElement.style.background = document.body.style.background = 'transparent';
    const j = document.getElementById('jan'); Object.assign(j.style, { visibility: 'visible', opacity: 1, transform: 'none', filter: 'none', background: '#fff', borderRadius: '18px' });
    document.getElementById('cromo').style.opacity = 1;
    tela(id); R[id](lt, 40); camera(id, 0, [[0, 1, 790, 373]]);
    document.querySelectorAll('.cursor').forEach(c => c.style.display = 'none');
  }, [id, lt]);
  await pg.locator('#jan').screenshot({ path: `${out}/${id}-janela.png`, omitBackground: true });
  await pg.locator(sel).first().screenshot({ path: `${out}/${id}-destaque.png`, omitBackground: true });
}
await br.close(); srv.close();
