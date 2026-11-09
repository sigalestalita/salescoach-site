// node render.mjs [ids]  →  out/<id>-feed.jpg (1080x1350) e out/<id>-story.jpg (1080x1920)
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const { chromium } = createRequire(import.meta.url)('playwright');
const aqui = path.dirname(fileURLToPath(import.meta.url));
const IDS = process.argv.slice(2).length ? process.argv.slice(2) : ['psi', 'clinica', 'escritorio', 'mentora', 'imovel', 'cafe', 'preco', 'integra', 'semana'];
const b = await chromium.launch(); fs.mkdirSync(path.join(aqui, 'out'), { recursive: true });
for (const f of ['feed', 'story']) {
  const pg = await b.newPage({ viewport: { width: 1080, height: f === 'story' ? 1920 : 1350 } });
  for (const id of IDS) {
    await pg.goto(`file://${aqui}/ad.html?id=${id}&f=${f}`, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: path.join(aqui, 'out', `${id}-${f}.jpg`), type: 'jpeg', quality: 92 });
  }
  await pg.close();
}
await b.close(); console.log('ok', IDS.length * 2);
