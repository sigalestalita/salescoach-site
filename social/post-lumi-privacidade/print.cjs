const { chromium, devices } = require('playwright');
const [url, needles, out, offset] = [process.argv[2], JSON.parse(process.argv[3]), process.argv[4], +process.argv[5] || 520];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(4000);
  const info = await p.evaluate((needles) => {
    const marca = (needle) => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) {
        const i = n.nodeValue.indexOf(needle);
        if (i >= 0 && n.parentElement.offsetParent) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + needle.length);
          const m = document.createElement('mark'); m.style.cssText = 'background:linear-gradient(transparent 22%, #fde047 22%, #fde047 96%, transparent 96%);color:inherit;padding:0 1px'; r.surroundContents(m); return m; }
      }
    };
    const ms = needles.map(marca);
    [...document.querySelectorAll('*')].forEach(el => { const cs = getComputedStyle(el); if (cs.position === 'fixed' && el.tagName !== 'HTML' && el.tagName !== 'BODY') el.style.display = 'none'; });
    document.querySelectorAll('iframe, ins.adsbygoogle, [id*="google_ads"], [class*="cookie"], [id*="cookie"]').forEach(el => el.style.display = 'none');
    const first = ms.find(Boolean);
    return { found: ms.map(Boolean), top: first ? first.getBoundingClientRect().top + scrollY : null };
  }, needles);
  console.log(JSON.stringify(info));
  if (info.top != null) { await p.evaluate(y => window.scrollTo(0, y), info.top - offset); await p.waitForTimeout(1500); }
  await p.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    [...document.querySelectorAll('body *')].forEach(el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if ((cs.position === 'fixed' || ((cs.position === 'absolute') && r.width >= vw*.9 && r.height >= vh*.8 && !el.querySelector('h1'))) && !el.contains(document.querySelector('mark'))) el.style.display = 'none'; });
    document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto'; document.body.style.filter = 'none';
  });
  await p.waitForTimeout(500);
  const rects = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; };
    const ps = [...document.querySelectorAll('p,h1,h2,span,div')].filter(e => e.children.length < 3);
    const find = t => { const e = ps.find(e => e.textContent.trim().startsWith(t)); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; };
    return { mark: [...document.querySelectorAll('mark')].map(m => { const r = m.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; }), h1: q('h1'), tratar: find('Tratar de saúde'), nr1: find('NR-1'), por: find('Por Clara') }; });
  console.log(JSON.stringify(rects));
  await p.screenshot({ path: out });
  await b.close();
})();
