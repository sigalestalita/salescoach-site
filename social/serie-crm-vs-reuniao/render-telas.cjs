const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 960, height: 624 }, deviceScaleFactor: 2.5 });
  for (const t of ['crm', 'sc']) { await p.goto('file://' + path.resolve(`telas/${t}.html`)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400); await p.screenshot({ path: `telas/${t}.png` }); }
  await b.close(); })();
