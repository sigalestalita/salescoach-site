import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
for (const id of ['n1', 'n2', 'n3', 'n4', 's1', 's2', 's3', 's4']) {
  await p.goto(new URL(`./post.html?p=${id}`, import.meta.url).href);
  await p.evaluate(() => window.ready); await p.waitForTimeout(300);
  const pre = id[0] === 'n' ? 'nexa' : 'salescoach';
  await p.screenshot({ path: new URL(`./out/${pre}-${id[1]}.jpg`, import.meta.url).pathname, type: 'jpeg', quality: 93 });
}
await b.close(); console.log('ok');
