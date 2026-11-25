import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await p.goto(new URL('./mockup.html', import.meta.url).href);
await p.evaluate(() => window.ready); await p.waitForTimeout(300);
await p.screenshot({ path: new URL('./lumi-confianca.png', import.meta.url).pathname });
await b.close(); console.log('ok');
