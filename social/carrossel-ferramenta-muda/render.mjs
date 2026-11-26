import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { mkdirSync } from 'fs';
mkdirSync(new URL('./out', import.meta.url), { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
for (let s = 1; s <= 5; s++) {
  await p.goto(new URL(`./carrossel.html?s=${s}`, import.meta.url).href);
  await p.evaluate(() => window.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: new URL(`./out/slide-${String(s).padStart(2, '0')}.jpg`, import.meta.url).pathname, type: 'jpeg', quality: 94 });
}
await b.close(); console.log('ok');
