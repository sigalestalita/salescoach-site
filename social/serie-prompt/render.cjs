const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  for (const c of (process.argv[2] || '1,2,3,4').split(',')) {
    await p.goto('file://' + path.resolve('card.html') + '?c=' + c); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(700);
    await p.screenshot({ path: `out/card-${c}.jpg`, type: 'jpeg', quality: 92 }); console.log('card', c);
  }
  await b.close();
})();
