// Gera os prints da Chrome Web Store: 1280×800, JPEG sem transparência.
// node render.mjs  →  saida/sales-coach-loja-1.jpg … 5.jpg
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(dir, 'saida'), { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
await p.goto('file://' + path.join(dir, 'loja.html'));
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
for (let i = 1; i <= 5; i++) {
  await p.locator('#s' + i).screenshot({ path: path.join(dir, 'saida', `sales-coach-loja-${i}.jpg`), type: 'jpeg', quality: 92 });
}
await b.close();
