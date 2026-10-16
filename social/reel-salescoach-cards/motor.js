// Motor do reel Sales Coach · cards (versão clara do motor dos reels do Atlas).
// index.html define window.REEL = { DUR, CENAS, TIT, GANHO, SONS, PONTEIRO, CURSOR }.
// O render chama window.renderAt(t); ?play toca em tempo real.

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const R = () => window.REEL;
function vista(el, k, dy = 30) { el.style.opacity = k; el.style.transform = `translateY(${(1 - k) * dy}px)`; el.style.filter = k < .99 ? `blur(${(1 - k) * 8}px)` : 'none'; }
function pop(el, k) { el.style.opacity = clamp(k * 1.5); el.style.transform = `scale(${.86 + .14 * back(clamp(k))})`; }
function digita(el, txt, k, caret = true) { const n = Math.round(txt.length * clamp(k)); el.innerHTML = txt.slice(0, n) + (caret && k > 0 && k < 1 ? '<span class="caret"></span>' : ''); }
const fmt = (v, dec = 0) => dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
function anel(el, v, max, k, cor) {
  const r = 42, c = 2 * Math.PI * r, f = clamp(k) * v / max;
  el.innerHTML = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="#eef2f8" stroke-width="9"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="${cor}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c * f} ${c}" transform="rotate(-90 50 50)"/></svg><b>${Math.round(v * eo(clamp(k)))}</b>`;
}
const press = (el, t, tc) => { const d = Math.abs(t - tc); el.style.transform = d < .15 ? `scale(${.94 + .06 * d / .15})` : ''; };

/* Fundo: cantos lima e azul que respiram devagar */
function fundo(t) {
  const s = Math.sin(t * .35), c = Math.cos(t * .28);
  $('#bg').style.background = `
    radial-gradient(55% 20% at ${8 + 6 * s}% ${0 + 3 * c}%, rgba(212,249,105,.6), transparent 72%),
    radial-gradient(60% 22% at ${100 - 5 * c}% ${2 + 3 * s}%, rgba(190,210,246,.95), transparent 70%),
    radial-gradient(70% 20% at ${20 + 8 * c}% ${100 - 2 * s}%, rgba(212,249,105,.55), transparent 72%),
    radial-gradient(60% 22% at ${100 - 6 * s}% ${98 + 2 * c}%, rgba(190,210,246,.9), transparent 70%),
    linear-gradient(180deg, #ededea 0%, #e9eae6 45%, #eef0e8 100%)`;
}

function visCena(id, t) {
  const [a, b] = R().CENAS[id], el = $('#' + id), X = .45, ids = Object.keys(R().CENAS);
  if (t < a - X || t > b + X) { el.style.opacity = 0; el.style.visibility = 'hidden'; return false; }
  el.style.visibility = 'visible';
  const ent = id === ids[0] ? 1 : eo(lin(t, a - X * .2, a + X * 1.4)), sai = id === ids[ids.length - 1] ? 1 : 1 - eio(lin(t, b - X * .3, b + X));
  const o = Math.min(ent, sai); el.style.opacity = o;
  el.style.transform = `translate(${(1 - ent) * 160}px, ${(1 - ent) * 40 - (1 - sai) * 60}px) scale(${1 - (1 - ent) * .04 + (1 - sai) * .02})`;
  el.style.filter = o < .99 ? `blur(${(1 - o) * 14}px)` : 'none';
  return true;
}

/* Título em dois tons, palavra a palavra com desfoque */
let titAtual = null;
function titulo(t) {
  const ids = Object.keys(R().TIT), id = ids.find(k => t >= R().CENAS[k][0] - .2 && t < R().CENAS[k][1]), el = $('#tit');
  if (!id) { el.style.opacity = 0; return; }
  if (titAtual !== id) { titAtual = id; const [l1, l2] = R().TIT[id], w = s => s.split(' ').map(x => `<span class="w">${x} </span>`).join('');
    el.innerHTML = `<span class="l1">${w(l1)}</span>${w(l2)}`; }
  const [a, b] = R().CENAS[id], sai = 1 - eio(lin(t, b - .35, b + .05));
  el.style.opacity = sai; el.style.filter = sai < .99 ? `blur(${(1 - sai) * 10}px)` : 'none';
  el.querySelectorAll('.w').forEach((w, i) => { const k = eo(lin(t, a + .05 + i * .07, a + .55 + i * .07));
    w.style.opacity = k; w.style.transform = `translateY(${(1 - k) * 40}px)`; w.style.filter = k < .99 ? `blur(${(1 - k) * 12}px)` : 'none'; });
}

/* Faixa de ganho: dado com a fonte, ligada à função da cena */
let ganhoAtual = null;
function ganho(t) {
  const el = $('#ganho'), id = Object.keys(R().GANHO).find(k => t >= R().CENAS[k][0] && t < R().CENAS[k][1]);
  if (!id) { el.style.opacity = 0; el.style.visibility = 'hidden'; return; }
  el.style.visibility = 'visible';
  const [n, txt, fonte] = R().GANHO[id], [a, b] = R().CENAS[id];
  if (ganhoAtual !== id) { ganhoAtual = id; el.querySelector('.t').innerHTML = `${txt}<span class="f">Fonte: ${fonte}</span>`; }
  const k = eo(lin(t, a + .9, a + 1.5)), s = 1 - eio(lin(t, b - .4, b));
  // Número sobe até o valor (o "57% × 62%" entra inteiro).
  const num = /^\d+%$/.test(n) ? `${Math.round(parseInt(n) * eo(lin(t, a + .95, a + 1.9)))}%` : n;
  el.querySelector('.n').textContent = num;
  el.querySelector('.n').style.setProperty('--k', eo(lin(t, a + 1.4, a + 2.0)));
  const o = Math.min(k, s); el.style.opacity = o; el.style.transform = `translateY(${(1 - k) * 24}px) scale(${.97 + .03 * k})`;
  el.style.filter = o < .99 ? `blur(${(1 - o) * 8}px)` : 'none';
}

/* Cursor nomeado (como nos anúncios). CURSOR: [t, alvo, clique?]; PONTEIRO: [a, b, modo, nome]. */
function cursor(t) {
  const C = R().CURSOR, cur = $('#cur'), rip = $('#rip');
  const faixa = R().PONTEIRO.find(([a, b]) => t >= a && t < b);
  const pos = c => { if (Array.isArray(c[1])) return c[1]; const el = $(c[1]); if (!el) return [700, 1400]; const r = el.getBoundingClientRect(); return [r.left + r.width * .5, r.top + r.height * .55]; };
  const i = C.findIndex(c => c[0] > t);
  let p;
  if (i <= 0) p = pos(C[i === -1 ? C.length - 1 : 0]);
  else { const A = C[i - 1], B = C[i], pa = pos(A), pb = pos(B), dur = Math.min(.8, B[0] - A[0]), k = eio(lin(t, B[0] - dur, B[0]));
    p = [pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k - Math.sin(k * Math.PI) * 36]; }
  let pr = 0, rk = -1;
  for (const c of C.filter(c => c[2]).map(c => c[0])) { const d = t - c; if (d > -.12 && d < .12) pr = Math.max(pr, 1 - Math.abs(d) / .12); if (d >= 0 && d < .55) rk = d / .55; }
  const fade = faixa ? Math.min(lin(t, faixa[0], faixa[0] + .3), 1 - lin(t, faixa[1] - .3, faixa[1])) : 0;
  cur.classList.toggle('esq', p[0] > 760);
  if (faixa && cur.dataset.n !== faixa[3]) { cur.dataset.n = faixa[3]; cur.querySelector('b').textContent = faixa[3]; }
  cur.style.opacity = fade;
  cur.style.transform = `translate(${p[0] - 8}px, ${p[1] - 6}px) scale(${1 - .16 * pr})`;
  if (rk >= 0 && faixa) { rip.style.opacity = (1 - rk) * fade; rip.style.left = p[0] + 'px'; rip.style.top = p[1] + 'px'; rip.style.transform = `scale(${.3 + 1.1 * eo(rk)})`; } else rip.style.opacity = 0;
}

/* Cenas (lt = tempo dentro da cena, t = tempo absoluto) */
const CENA = {
  s0(lt) {
    const tiles = $$('#orbita .tile'), cx = 540, cy = 380;
    tiles.forEach((el, i) => { const k = eo(lin(lt, .2 + i * .09, 1.0 + i * .09)), raio = i % 2 ? 430 : 280, ang = i * (Math.PI * 2 / 8) + lt * .22 + (i % 2 ? .4 : 0);
      const x = cx + Math.cos(ang) * raio * k, y = cy + Math.sin(ang) * raio * .62 * k;
      el.style.left = (x - 66) + 'px'; el.style.top = (y - 66) + 'px'; el.style.opacity = k; el.style.transform = `scale(${.5 + .5 * k})`; });
    pop($('#orbita .centro'), lin(lt, 0, .5));
    $$('#orbita .anel').forEach((a, i) => { a.style.opacity = eo(lin(lt, .3 + i * .2, 1 + i * .2)); a.style.transform = `rotate(${lt * (i ? -6 : 8)}deg)`; });
  },
  s1(lt) {
    const sync = lt > 1.7; $('#s1sync').textContent = sync ? 'Google Agenda conectada' : 'Sincronizando…';
    $('#s1spin').style.transform = `rotate(${lt * 520}deg)`; $('#s1spin').style.opacity = sync ? 0 : 1;
    $$('#s1 .ag .r').forEach((r, i) => vista(r, eo(lin(lt, 1.7 + i * .2, 2.3 + i * .2)), 40));
    press($('#s1treino'), lt, 4.6);
  },
  s2(lt) {
    const b1 = 'Já temos planilha e CRM. Por que pagar por mais uma ferramenta?', b2 = 'Hoje, quanto do que acontece nas reuniões chega de fato na planilha?', b3 = 'Pouca coisa, sendo sincero. O forecast acaba sendo chute.';
    vista($('#s2b1'), eo(lin(lt, .3, .6)), 20); digita($('#s2b1 .tx'), b1, lin(lt, .4, 1.6));
    vista($('#s2b2'), eo(lin(lt, 1.9, 2.1)), 20); digita($('#s2b2 .tx'), b2, lin(lt, 2.0, 3.4));
    vista($('#s2b3'), eo(lin(lt, 3.7, 4.0)), 20); digita($('#s2b3 .tx'), b3, lin(lt, 3.8, 4.7));
    vista($('#s2fim'), eo(lin(lt, 4.6, 4.9)), 10); press($('#s2fim'), lt, 5.2);
    vista($('#s2nota'), eo(lin(lt, 5.4, 5.8)), 60); anel($('#s2ring'), 78, 100, lin(lt, 5.5, 6.5), '#1d4f9a');
  },
  s3(lt) {
    const s = 768 + Math.floor(lt); $('#s3t').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const fala = 'Gostei, mas achei caro para o momento.', n = Math.round(fala.length * lin(lt, .6, 2.4)), tx = fala.slice(0, n);
    $('#s3leg .tx').innerHTML = tx.replace('caro', '<mark>caro</mark>'); vista($('#s3leg'), eo(lin(lt, .4, .7)), 10);
    const m1 = 54 - 3 * lin(lt, 2, 6), m2 = 100 - m1;
    $('#s3m1').style.width = m1 + '%'; $('#s3m2').style.width = m2 + '%'; $('#s3p1').textContent = Math.round(m1) + '%'; $('#s3p2').textContent = Math.round(m2) + '%';
    $('#s3v1').classList.toggle('fala', lt < 2.6); $('#s3v2').classList.toggle('fala', lt > 5);
    pop($('#s3dica'), lin(lt, 3.8, 4.3)); press($('#s3usar'), lt, 4.6);
    const tk = Math.min(eo(lin(lt, 4.8, 5.1)), 1 - lin(lt, 6.6, 6.9)); $('#s3toast').style.opacity = tk; $('#s3toast').style.transform = `translateY(${(1 - tk) * -14}px)`;
    vista($('#s3prox'), eo(lin(lt, 5.4, 5.9)), 20);
    // Critérios marcados conforme aparecem na conversa (prazo fica pendente).
    $$('#s3ck span').forEach((c, i) => c.classList.toggle('ok', i < 3 && lt > [1.0, 2.8, 5.6][i]));
  },
  s4(lt) {
    anel($('#s4ring'), 86, 100, lin(lt, .5, 2.4), '#2f9a4a'); pop($('#s4temp'), lin(lt, 2.3, 2.7));
    $$('#s4 .crit s').forEach((s, i) => { s.style.width = (+s.dataset.v * eo(lin(lt, 1.0 + i * .2, 2.0 + i * .2))) + '%'; });
    const f = eo(lin(lt, 1.4, 2.6)); $('#s4f1').style.width = (57 * f) + '%'; $('#s4f2').style.width = (43 * f) + '%';
    $('#s4p1').textContent = Math.round(57 * f) + '%'; $('#s4p2').textContent = Math.round(43 * f) + '%';
    vista($('#s4tre'), eo(lin(lt, 2.8, 3.3)), 30); vista($('#s4prox'), eo(lin(lt, 3.4, 3.9)), 30); press($('#s4crm'), lt, 6.2);
  },
  s5(lt) {
    $$('#s5 .campo').forEach((c, i) => { const b = c.querySelector('b'), k = lin(lt, .8 + i * .5, 1.2 + i * .5); digita(b, b.dataset.v, k, false); c.classList.toggle('feito', k >= 1); });
    digita($('#s5nota'), 'Demo com Ricardo (diretor comercial). Dor: forecast no chute. Objeção de preço contornada com custo da falta de visibilidade. Próximo passo: proposta até sexta.', lin(lt, 2.6, 3.9));
    const tk = Math.min(eo(lin(lt, 4.0, 4.3)), 1 - lin(lt, 5.6, 5.9)); $('#s5toast').style.opacity = tk; $('#s5toast').style.transform = `translateY(${(1 - tk) * -14}px)`;
  },
  s6(lt) {
    const k = eo(lin(lt, .5, 2.2)); $('#s6k1').textContent = Math.round(68 + 18 * k); $('#s6k2').textContent = Math.round(148 * k); $('#s6k3').textContent = Math.round(71 * k) + '%';
    pop($('#s6d1'), lin(lt, 2.0, 2.4));
    $$('#s6bar i').forEach((b, i) => { b.style.transform = `scaleY(${eo(lin(lt, .5 + i * .12, 1.1 + i * .12))})`; });
    vista($('#s6meta'), eo(lin(lt, 1.6, 2.0)), 0);
    vista($('#s6ins'), eo(lin(lt, 3.0, 3.5)), 30); press($('#s6treino'), lt, 4.6);
    const tk = Math.min(eo(lin(lt, 4.8, 5.1)), 1 - lin(lt, 6.5, 6.8)); $('#s6toast').style.opacity = tk; $('#s6toast').style.transform = `translateY(${(1 - tk) * -14}px)`;
  },
  s7(lt) {
    const q = 'Quais objeções mais travaram vendas este mês?';
    if (lt < 2.2) { const k = lin(lt, .8, 2.0); $('#s7digit').innerHTML = k > 0 ? q.slice(0, Math.round(q.length * k)) + '<span class="caret"></span>' : 'Pergunte sobre agendas, notas e objeções…'; $('#s7digit').style.color = k > 0 ? 'var(--t1)' : ''; }
    else { $('#s7digit').textContent = 'Pergunte sobre agendas, notas e objeções…'; $('#s7digit').style.color = ''; }
    press($('#s7env'), lt, 2.2);
    vista($('#s7q'), eo(lin(lt, 2.3, 2.6)), 20); $('#s7q .tx').textContent = q;
    const pk = lt > 2.4 && lt < 3.0; $('#s7pens').style.display = lt > 2.4 && lt < 3.0 ? 'flex' : 'none';
    if (pk) $$('#s7pens i').forEach((d, i) => d.style.opacity = .35 + .65 * Math.max(0, Math.sin((lt * 8) - i)));
    vista($('#s7r'), eo(lin(lt, 3.0, 3.3)), 20);
    $$('#s7r [data-i]').forEach(el => vista(el, eo(lin(lt, 3.2 + +el.dataset.i * .3, 3.6 + +el.dataset.i * .3)), 14));
  },
  s8(lt) {
    pop($('#fecho .m'), lin(lt, .1, .6));
    vista($('#fecho h2'), eo(lin(lt, .3, .9)), 40);
    $$('#fecho .pills span').forEach((s, i) => vista(s, eo(lin(lt, .8 + i * .08, 1.2 + i * .08)), 20));
    pop($('#fecho .cta'), lin(lt, 1.4, 1.9)); vista($('#fecho .preco'), eo(lin(lt, 1.8, 2.3)), 14);
  },
};

window.renderAt = async function (t) {
  fundo(t); titulo(t); ganho(t);
  $('#prog i').style.width = (t / R().DUR * 100) + '%';
  const fim = R().CENAS.s8[0];
  // Marca, faixa e rodapé de demonstração saem para o fecho.
  const sai = 1 - lin(t, fim - .3, fim + .2);
  $('#marca').style.opacity = sai; $('#demo').style.opacity = Math.min(sai, lin(t, R().CENAS.s1[0], R().CENAS.s1[0] + .5));
  for (const id of Object.keys(R().CENAS)) if (visCena(id, t)) CENA[id](t - R().CENAS[id][0], t);
  cursor(t);
};
window.ready = (async () => {
  await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  // Barras do gráfico da gestão: nota semanal subindo e cruzando a meta (75).
  [58, 61, 60, 64, 67, 66, 71, 73, 76, 79, 82, 86].forEach(n => { const i = document.createElement('i'); i.style.height = n + '%'; if (n >= 75) i.className = 'h'; $('#s6bar').appendChild(i); });
  $('#s6meta').style.top = (70 + (1 - .75) * ($('#s6 .graf').offsetHeight - 120)) + 'px';
  if (R().INIT) R().INIT();
  await window.renderAt(0);
  if (location.search.includes('play')) { const t0 = performance.now(); (function loop() { window.renderAt(((performance.now() - t0) / 1000) % R().DUR); requestAnimationFrame(loop); })(); }
  return true;
})();
