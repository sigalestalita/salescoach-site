import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { mkdirSync } from 'fs';
mkdirSync(new URL('./out', import.meta.url), { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
for (const id of ['v1', 'v2', 'v3', 'v4']) {
  await p.goto(new URL(`./${id}.html`, import.meta.url).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  await p.screenshot({ path: new URL(`./out/${id}.jpg`, import.meta.url).pathname, type: 'jpeg', quality: 94 });
}
await b.close(); console.log('ok');
