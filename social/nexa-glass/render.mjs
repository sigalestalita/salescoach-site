import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { mkdirSync } from 'fs';
mkdirSync(new URL('./out', import.meta.url), { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
for (const id of ['p1', 'p2', 'p3', 'p4']) {
  await p.goto(new URL(`./post.html?p=${id}`, import.meta.url).href);
  await p.evaluate(() => window.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: new URL(`./out/${id}.jpg`, import.meta.url).pathname, type: 'jpeg', quality: 94 });
}
await b.close(); console.log('ok');
