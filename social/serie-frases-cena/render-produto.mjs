// Cards de produto do carrossel "Robô e extensão": node render-produto.mjs  →  out/sc-r1..sc-r5.jpg (1080x1350)
import { chromium } from '/home/user/salescoach-grou/node_modules/playwright/index.mjs';
import path from 'path'; import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
for (let c = 1; c <= 5; c++) {
  await pg.goto(`file://${aqui}/produto.html?c=${c}`); await pg.evaluate(async () => { await document.fonts.ready; await window.pronto; }); await pg.waitForTimeout(300);
  await pg.screenshot({ path: path.join(aqui, 'out', `sc-r${c}.jpg`), type: 'jpeg', quality: 92 });
  console.log('ok', c);
}
await b.close();
