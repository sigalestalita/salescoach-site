const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1128, height: 191 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'capa.html') + (process.argv[3] || ''), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(__dirname, process.argv[2] || 'nexa-linkedin-capa.png') });
  await b.close();
})();
