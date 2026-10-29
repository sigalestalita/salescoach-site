// Acabamento da série: node render.mjs [ids...]  →  out/<id>.jpg (1080x1350)
import { chromium } from '/home/user/salescoach-grou/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const MARCA = { sc: 'sales-coach', at: 'atlas', nx: 'nexa' };
// Altura (px) do bloco da capa, logo abaixo da frase de cada cena.
const CAPA = { 'sc-k3': 784 };
const ids = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(aqui, 'fotos')).filter((f) => f.endsWith('.jpg')).map((f) => f.slice(0, -4));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
fs.mkdirSync(path.join(aqui, 'out'), { recursive: true });
for (const id of ids) {
  // "<id>-capa": a cena com "Conheça o Sales Coach · um produto NEXA" logo abaixo da frase.
  const [foto, capa] = id.split('-capa');
  await pg.goto(`file://${aqui}/acabamento.html?f=${foto}&m=${MARCA[id.slice(0, 2)]}${capa !== undefined ? `&capa=${CAPA[foto] ?? 780}` : ''}`);
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: path.join(aqui, 'out', `${id}.jpg`), type: 'jpeg', quality: 92 });
  console.log('ok', id);
}
await b.close();
