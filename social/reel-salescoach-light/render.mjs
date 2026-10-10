import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, mode, a, b, oD, sub = '1'] = process.argv; const outDir = mode === 'still' ? (b || 'frames') : (oD || 'frames');
const root = path.resolve('.');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.ttf':'font/ttf', '.png':'image/png', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.webp':'image/webp', '.svg':'image/svg+xml' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': types[path.extname(f)] || 'application/octet-stream'}); r.end(d); }); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const br = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--font-render-hinting=none'] });
const pg = await br.newPage({ viewport: { width: +(process.env.W || 1920), height: +(process.env.H || 1080) }, deviceScaleFactor: 1 });
pg.on('console', m => { if (m.type() === 'error' || m.type()==='warning') console.log('[page]', m.text()); });
pg.on('pageerror', e => console.log('[pageerror]', e.message));
await pg.goto(`http://localhost:${port}/${process.env.PAGE || 'index.html'}`); await pg.waitForFunction(() => window.ready); await pg.evaluate(() => window.ready);
fs.mkdirSync(outDir, { recursive: true });
const S = +sub, FPS = 30 * S;
if (mode === 'still') {
  for (const t of a.split(',').map(Number)) { await pg.evaluate(t => window.renderAt(t), t); await pg.screenshot({ path: `${outDir}/still_${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 88 }); }
} else {
  const t0 = Date.now();
  const STEP = +(process.env.STEP || 1); for (let f = +a; f < +b; f += STEP) {
    await pg.evaluate(t => window.renderAt(t), f / FPS);
    await pg.screenshot({ path: `${outDir}/f_${String(f).padStart(5,'0')}.jpg`, type: 'jpeg', quality: 94 });
    if (f % 30 === 0) console.log(`frame ${f} ${((Date.now()-t0)/(f-+a+1)).toFixed(0)}ms/f`);
  }
}
await br.close(); srv.close();
