// Motor comum dos reels de produto do Atlas. Cada index.html define
// window.REEL = { DUR, CENAS, LEGENDAS, CURSOR, PONTEIRO, CENA: { id: fn(lt) } }
// e o motor cuida do fundo, da legenda, das transições, do cursor e do grão.
// O render chama window.renderAt(t); ?play toca em tempo real.

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const show = (el, k, dy = 30) => { el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * dy}px)`; };
const pop = (el, k) => { el.style.opacity = clamp(k * 1.4); el.style.transform = `scale(${.85 + .15 * back(k)})`; };
const conta = (el, v, k, dec = 0, pre = '') => { const x = v * eo(clamp(k)); el.textContent = pre + (dec ? x.toFixed(dec).replace('.', ',') : Math.round(x)); };
function digita(el, txt, k, caret) { const n = Math.round(txt.length * clamp(k)); el.innerHTML = txt.slice(0, n) + (caret ? '<span class="caret"></span>' : ''); }
function vista(el, k, dy = 40) { el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * dy}px)`; el.style.visibility = k <= 0.001 ? 'hidden' : 'visible'; }
function palavras(el, lt, t0, passo = .14) {
  el.querySelectorAll('.w').forEach((w, i) => { const k = eo(lin(lt, t0 + i * passo, t0 + .5 + i * passo));
    w.style.opacity = k; w.style.transform = `translateY(${(1 - k) * 46}px)`; w.style.filter = `blur(${(1 - k) * 12}px)`; });
}

const R = () => window.REEL;
const fx = $('#fundo').getContext('2d');
const PTS = []; { let s = 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 220; i++) PTS.push([r() * 1080, r() * 1920, r(), r() * 6.28]); }
function fundo(t) {
  const g = fx; g.fillStyle = '#0b0c0a'; g.fillRect(0, 0, 1080, 1920);
  const gr = g.createRadialGradient(540, 1100, 0, 540, 1100, 1000);
  gr.addColorStop(0, 'rgba(212,249,105,.09)'); gr.addColorStop(.45, 'rgba(21,73,141,.14)'); gr.addColorStop(1, 'rgba(11,12,10,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
  g.strokeStyle = 'rgba(245,246,241,.035)'; g.lineWidth = 1; const off = (t * 12) % 90;
  for (let x = -90 + off; x < 1080; x += 90) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1920); g.stroke(); }
  for (let y = -90 + off; y < 1920; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(1080, y); g.stroke(); }
  for (const [x, y, z, p] of PTS) { let yy = (y - t * (10 + 30 * z)) % 1920; if (yy < 0) yy += 1920;
    g.globalAlpha = (.1 + .45 * z) * (.6 + .4 * Math.sin(t * 1.4 + p)); g.fillStyle = z > .8 ? '#d4f969' : '#f5f6f1';
    g.beginPath(); g.arc(x + Math.sin(t * .5 + p) * 10, yy, .6 + 1.6 * z, 0, 6.283); g.fill(); }
  g.globalAlpha = 1;
}
const graos = []; { let s = 9; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 4; k++) { const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d'), im = g.createImageData(540, 960);
    for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); graos.push(c); } }

function visCena(id, t) {
  const [a, b] = R().CENAS[id], el = $('#' + id), X = .4, ids = Object.keys(R().CENAS);
  if (t < a - X || t > b + X) { el.style.opacity = 0; el.style.visibility = 'hidden'; return false; }
  el.style.visibility = 'visible';
  const ent = id === ids[0] ? 1 : eo(lin(t, a - X, a + X)), sai = id === ids[ids.length - 1] ? 1 : 1 - eio(lin(t, b - X * .3, b + X));
  const o = Math.min(ent, sai); el.style.opacity = o;
  el.style.transform = `translateY(${(1 - ent) * 140 - (1 - sai) * 80}px) scale(${1 - (1 - ent) * .06 + (1 - sai) * .03})`;
  el.style.filter = o < .99 ? `blur(${(1 - o) * 12}px)` : 'none';
  return true;
}
function legenda(t) {
  const L = R().LEGENDAS.find(([a, b]) => t >= a - .4 && t < b + .4), cap = $('#cap');
  if (!L) { cap.style.opacity = 0; return; }
  const [a, b, k, txt] = L;
  if (cap.dataset.a != a) { cap.dataset.a = a; cap.querySelector('.k').textContent = k; cap.querySelector('.t').innerHTML = txt; }
  const e = eo(lin(t, a - .1, a + .5)), s = 1 - eio(lin(t, b - .25, b + .2)), o = Math.min(e, s);
  cap.style.opacity = o; cap.style.transform = `translateY(${(1 - e) * 40}px)`; cap.style.filter = `blur(${(1 - o) * 10}px)`;
}
// Ponteiro: [t, alvo (seletor ou [x,y]), clique?]. PONTEIRO: [[a, b, 'mouse'|'toque'], ...] diz quando aparece e como.
function cursor(t) {
  const C = R().CURSOR, cur = $('#cur'), rip = $('#rip'), toq = $('#toque');
  const faixa = R().PONTEIRO.find(([a, b]) => t >= a && t < b), modo = faixa ? faixa[2] : null;
  const pos = c => { if (Array.isArray(c[1])) return c[1]; const el = $(c[1]); if (!el) return [540, 1200]; const r = el.getBoundingClientRect(); return [r.left + r.width * .5, r.top + r.height * .55]; };
  const i = C.findIndex(c => c[0] > t);
  let p;
  if (i <= 0) p = pos(C[i === -1 ? C.length - 1 : 0]);
  else { const A = C[i - 1], B = C[i], pa = pos(A), pb = pos(B), dur = Math.min(.7, B[0] - A[0]), k = eio(lin(t, B[0] - dur, B[0]));
    p = [pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k - Math.sin(k * Math.PI) * 40]; }
  let press = 0, rk = -1;
  for (const c of C.filter(c => c[2]).map(c => c[0])) { const d = t - c; if (d > -.12 && d < .12) press = Math.max(press, 1 - Math.abs(d) / .12); if (d >= 0 && d < .5) rk = d / .5; }
  const fade = faixa ? Math.min(lin(t, faixa[0], faixa[0] + .25), 1 - lin(t, faixa[1] - .25, faixa[1])) : 0;
  cur.style.opacity = modo === 'mouse' ? fade : 0;
  cur.style.transform = `translate(${p[0] - 6}px, ${p[1] - 4}px) scale(${1 - .18 * press})`;
  toq.style.opacity = modo === 'toque' ? fade * (.35 + .65 * press) : 0;
  toq.style.left = p[0] + 'px'; toq.style.top = p[1] + 'px'; toq.style.transform = `scale(${1 - .25 * press})`;
  if (rk >= 0 && modo) { rip.style.opacity = 1 - rk; rip.style.left = p[0] + 'px'; rip.style.top = p[1] + 'px'; rip.style.transform = `scale(${.3 + 1.1 * eo(rk)})`; } else rip.style.opacity = 0;
}

window.renderAt = async function (t) {
  fundo(t); legenda(t);
  $('#prog i').style.width = (t / R().DUR * 100) + '%';
  const ids = Object.keys(R().CENAS), ult = R().CENAS[ids[ids.length - 1]][0];
  $('#marca').style.opacity = Math.min(lin(t, R().CENAS[ids[0]][1] - .3, R().CENAS[ids[0]][1] + .2), 1 - lin(t, ult - .3, ult + .1));
  for (const id of ids) if (visCena(id, t)) R().CENA[id](t - R().CENAS[id][0], t);
  cursor(t);
  $('#grao').getContext('2d').drawImage(graos[Math.floor(t * 24) % 4], 0, 0);
};
window.ready = (async () => {
  await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  if (R().INIT) R().INIT();
  await window.renderAt(0);
  if (location.search.includes('play')) { const t0 = performance.now(); (function loop() { window.renderAt(((performance.now() - t0) / 1000) % R().DUR); requestAnimationFrame(loop); })(); }
  return true;
})();
