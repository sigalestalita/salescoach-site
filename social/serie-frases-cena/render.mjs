// Acabamento da série: node render.mjs [ids...]  →  out/<id>.jpg (1080x1350)
import { chromium } from '/home/user/salescoach-grou/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const MARCA = { sc: 'sales-coach', at: 'atlas', nx: 'nexa' };
const ids = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(aqui, 'fotos')).filter((f) => f.endsWith('.jpg')).map((f) => f.slice(0, -4));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
fs.mkdirSync(path.join(aqui, 'out'), { recursive: true });
for (const id of ids) {
  await pg.goto(`file://${aqui}/acabamento.html?f=${id}&m=${MARCA[id.slice(0, 2)]}`);
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: path.join(aqui, 'out', `${id}.jpg`), type: 'jpeg', quality: 92 });
  console.log('ok', id);
}
await b.close();
