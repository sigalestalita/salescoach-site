// node render.mjs  →  out/<frase>.jpg (1080x1350)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const POSTS = process.argv.slice(2).length ? process.argv.slice(2) : ['pergunta', 'escuta'];
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
fs.mkdirSync(path.join(aqui, 'out'), { recursive: true });
for (const t of POSTS) {
  await pg.goto(`file://${aqui}/post.html?t=${t}&f=foto.jpg`, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
  await pg.screenshot({ path: path.join(aqui, 'out', `sc-frase-${t}.jpg`), type: 'jpeg', quality: 93 });
  console.log('ok', t);
}
await b.close();
