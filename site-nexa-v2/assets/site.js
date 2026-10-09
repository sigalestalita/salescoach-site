/* NEXA · site v2 — comportamento comum às páginas.
   Funciona sem GSAP/Lenis (só fica sem rolagem suave e sem a vitrine fixada). */
(function () {
  const doc = document.documentElement;
  doc.classList.remove('no-js');
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzido) doc.classList.add('reduzido');
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const temG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (temG) gsap.registerPlugin(ScrollTrigger);

  // Tema claro/escuro (a escolha fica no navegador; sem escolha, segue o sistema)
  $$('.tema-bt').forEach(b => b.addEventListener('click', () => {
    const claro = doc.getAttribute('data-tema') !== 'claro';
    if (claro) doc.setAttribute('data-tema', 'claro'); else doc.removeAttribute('data-tema');
    try { localStorage.setItem('nexa-tema', claro ? 'claro' : 'escuro'); } catch (e) {}
    $('meta[name="theme-color"]')?.setAttribute('content', claro ? '#f3f4ee' : '#08090a');
  }));

  // Rolagem suave
  let lenis = null;
  if (window.Lenis && !reduzido) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    if (temG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const alvo = $(a.getAttribute('href')); if (!alvo) return; e.preventDefault(); document.body.classList.remove('menu-aberto');
    lenis ? lenis.scrollTo(alvo, { offset: -80 }) : alvo.scrollIntoView({ behavior: 'smooth' });
  }));

  // Cabeçalho sólido ao rolar + menu do celular
  const topo = $('.topo');
  const solido = () => topo && topo.classList.toggle('solido', scrollY > 30);
  addEventListener('scroll', solido, { passive: true }); solido();
  $('.menu-bt')?.addEventListener('click', () => document.body.classList.toggle('menu-aberto'));

  // Revelações
  const revela = el => { el.style.transition = 'opacity 1s cubic-bezier(.2,.7,.2,1), transform 1.1s cubic-bezier(.2,.7,.2,1)'; el.style.transitionDelay = (el.dataset.d || 0) + 's'; el.style.opacity = 1; el.style.transform = 'none'; };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { revela(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -4% 0px' });
  $$('[data-reveal]').forEach(el => reduzido ? revela(el) : io.observe(el));

  // Títulos palavra a palavra
  $$('[data-palavras]').forEach(el => {
    const partes = []; el.childNodes.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(w => partes.push(w.trim() ? `<span class="palavra">${w}</span>` : w));
      else if (n.nodeName === 'BR') partes.push('<br>');
      else { const cls = n.className || ''; n.textContent.split(/(\s+)/).forEach(w => partes.push(w.trim() ? `<span class="palavra ${cls}">${w}</span>` : w)); }
    });
    el.innerHTML = partes.join('');
    const ps = $$('.palavra', el);
    if (el.closest('.manifesto') && temG && !reduzido) {
      ScrollTrigger.create({ trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true,
        onUpdate: s => ps.forEach((p, i) => p.style.opacity = s.progress * ps.length > i ? 1 : .14) });
    } else if (!reduzido) {
      ps.forEach((p, i) => { p.style.opacity = 0; p.style.transform = 'translateY(.5em)'; p.style.filter = 'blur(10px)'; p.style.transition = `opacity .9s ${i * .06}s, transform .9s ${i * .06}s cubic-bezier(.2,.7,.2,1), filter .9s ${i * .06}s`; });
      const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { ps.forEach(p => { p.style.opacity = 1; p.style.transform = 'none'; p.style.filter = 'none'; }); o.disconnect(); } }), { rootMargin: '0px 0px -8% 0px' });
      o.observe(el);
    }
  });

  // Números que contam
  const fmt = (v, dec) => dec ? v.toFixed(dec).replace('.', ',') : Math.round(v).toLocaleString('pt-BR');
  const ioN = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; ioN.unobserve(e.target);
    const el = e.target, alvo = parseFloat(el.dataset.conta), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', t0 = performance.now(), dur = 1600;
    const passo = t => { const k = Math.min(1, (t - t0) / dur), v = alvo * (1 - Math.pow(1 - k, 4)); el.textContent = pre + fmt(v, dec); if (k < 1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo); }), { threshold: .4 });
  $$('[data-conta]').forEach(el => ioN.observe(el));

  // Vídeos tocam só quando aparecem; os de "clique para ver" ganham som
  const ioV = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (v.dataset.manual) return; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: .25 });
  $$('video[data-auto]').forEach(v => { v.muted = true; v.playsInline = true; ioV.observe(v); });
  $$('.video-card').forEach(c => { const v = $('video', c); c.querySelector('.fone').addEventListener('click', () => {
    if (v.paused) { $$('.video-card video').forEach(o => { if (o !== v) { o.pause(); o.closest('.video-card').classList.remove('tocando'); } }); v.muted = false; v.currentTime = c.classList.contains('tocando') ? v.currentTime : 0; v.play(); c.classList.add('tocando'); }
    else { v.pause(); c.classList.remove('tocando'); } }); });

  // Alternadores
  $$('.alterna').forEach(al => {
    const bts = $$('button', al), bola = $('.bola', al);
    const ativa = b => { bts.forEach(x => x.classList.toggle('on', x === b)); bola.style.left = b.offsetLeft + 'px'; bola.style.width = b.offsetWidth + 'px';
      const grupo = al.dataset.grupo; $$(`[data-painel^="${grupo}:"]`).forEach(p => p.classList.toggle('on', p.dataset.painel === `${grupo}:${b.dataset.v}`));
      al.dispatchEvent(new CustomEvent('troca', { detail: b.dataset.v })); };
    bts.forEach(b => b.addEventListener('click', () => ativa(b)));
    requestAnimationFrame(() => ativa(bts.find(b => b.classList.contains('on')) || bts[0]));
  });

  // Narrativa: o passo mais visível troca a tela fixa
  $$('.narrativa').forEach(n => {
    const passos = $$('.passos-n > div', n), imgs = $$('.tela-fixa img', n), pts = $$('.marcador i', n);
    const ioP = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const i = passos.indexOf(e.target);
      passos.forEach((p, j) => p.classList.toggle('ativo', j === i)); imgs.forEach((im, j) => im.classList.toggle('on', j === i)); pts.forEach((p, j) => p.classList.toggle('on', j === i)); }), { rootMargin: '-45% 0px -45% 0px' });
    passos.forEach(p => ioP.observe(p));
  });

  // Inclinação 3D em cartões
  if (matchMedia('(hover: hover)').matches && !reduzido) $$('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`; });
    el.addEventListener('mouseleave', () => { el.style.transition = 'transform .6s'; el.style.transform = ''; setTimeout(() => el.style.transition = '', 600); });
  });

  // Botões magnéticos + cursor seguidor
  if (matchMedia('(hover: hover)').matches && !reduzido) {
    $$('.pill').forEach(b => { b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('mouseleave', () => b.style.transform = ''); });
    const s = document.createElement('div'); s.className = 'segue'; document.body.appendChild(s);
    let mx = -100, my = -100, sx = -100, sy = -100;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; s.style.opacity = 1; });
    (function anda() { sx += (mx - sx) * .2; sy += (my - sy) * .2; s.style.transform = `translate(${sx}px, ${sy}px)`; requestAnimationFrame(anda); })();
    document.addEventListener('mouseover', e => s.classList.toggle('grande', !!e.target.closest('.capa, .video-card .fone, .prod .midia')));
  }

  // Vitrine com rolagem horizontal fixada (desktop)
  const vit = $('.vitrine');
  if (vit && temG && innerWidth > 920 && !reduzido) {
    const tr = $('.trilho', vit);
    gsap.to(tr, { x: () => -(tr.scrollWidth - innerWidth), ease: 'none',
      scrollTrigger: { trigger: vit, start: 'top top', end: () => '+=' + (tr.scrollWidth - innerWidth), pin: true, scrub: .6, invalidateOnRefresh: true } });
  }
  // Método: número grande acompanha o passo
  const gr = $('.metodo .grande');
  if (gr) { const ps = $$('.metodo .passo'); const ioM = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) gr.textContent = String(ps.indexOf(e.target) + 1).padStart(2, '0'); }), { rootMargin: '-40% 0px -55% 0px' }); ps.forEach(p => ioM.observe(p)); }

  // Telas em órbita no hero das páginas de produto (parallax com o mouse e a rolagem)
  const orb = $('.orbita-telas');
  if (orb && !reduzido) {
    const ims = $$('img', orb); let mx = 0, my = 0;
    addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
    (function voa(t) { const sy = scrollY;
      ims.forEach((im, i) => { const z = +(im.dataset.z || 1), r = +(im.dataset.r || 0);
        im.style.transform = `translate(${mx * 40 * z}px, ${my * 30 * z - sy * .12 * z + Math.sin(t / 1400 + i) * 8}px) rotate(${r + Math.sin(t / 2000 + i) * 1.5}deg)`; });
      requestAnimationFrame(voa); })(0);
  }

  // Integrações em órbita
  const ors = $('.orbitas');
  if (ors) {
    const logos = JSON.parse(ors.dataset.logos), base = ors.dataset.base || '';
    const aneis = [[0, 4, 150, 1], [4, 12, 270, -1]];
    const els = logos.map(f => { const d = document.createElement('div'); d.className = 'lg'; d.innerHTML = `<img src="${base}${f}" alt="">`; ors.appendChild(d); return d; });
    aneis.forEach(([, , r]) => { const o = document.createElement('i'); o.className = 'o'; o.style.width = o.style.height = r * 2 + 'px'; ors.prepend(o); });
    (function gira(t) { const esc = Math.min(1, ors.offsetWidth / 640);
      aneis.forEach(([a, b, r, dir]) => { for (let i = a; i < b; i++) { const n = b - a, ang = (i - a) / n * Math.PI * 2 + dir * t / 9000;
        els[i].style.transform = `translate(${Math.cos(ang) * r * esc}px, ${Math.sin(ang) * r * esc}px)`; } });
      $$('.o', ors).forEach((o, k) => { const r = aneis[aneis.length - 1 - k][2] * esc; o.style.width = o.style.height = r * 2 + 'px'; });
      if (!reduzido) requestAnimationFrame(gira); })(0);
  }

  // ── Anel de capas (home) ─────────────────────────────────────────────
  const anel = $('.anel');
  if (anel) {
    const giro = $('.giro', anel), capas = $$('.capa', anel), n = capas.length;
    let R = 0, cw = 0;
    const medir = () => { const w = innerWidth, h = anel.parentElement.offsetHeight;
      cw = w < 600 ? Math.max(112, w * .3) : Math.min(230, Math.max(160, w * .14));
      R = w < 600 ? Math.max(w * .8, h * .44) : Math.max(h * .6, Math.min(w * .36, 560));
      anel.style.setProperty('--cw', cw + 'px'); };
    medir(); addEventListener('resize', medir);
    let ang = 0, vel = reduzido ? 0 : .045, arr = false, ux = 0, extra = 0, tiltX = 0, tiltY = 0, alvoX = 0, alvoY = 0, ultimoScroll = scrollY, entrada = reduzido ? 1 : 0;
    const t0 = performance.now();
    addEventListener('mousemove', e => { alvoY = (e.clientX / innerWidth - .5) * 16; alvoX = 14 + (e.clientY / innerHeight - .5) * -14; });
    const area = anel.parentElement;
    area.addEventListener('pointerdown', e => { if (e.target.closest('a,button')) return; arr = true; ux = e.clientX; area.setPointerCapture(e.pointerId); });
    area.addEventListener('pointermove', e => { if (!arr) return; extra += (e.clientX - ux) * .12; ux = e.clientX; });
    area.addEventListener('pointerup', () => arr = false); area.addEventListener('pointercancel', () => arr = false);
    alvoX = 14;
    (function quadro(t) {
      const ds = scrollY - ultimoScroll; ultimoScroll = scrollY;
      extra += ds * .08; extra *= .93; ang += vel + extra * .1;
      tiltX += (alvoX - tiltX) * .05; tiltY += (alvoY - tiltY) * .05;
      entrada = reduzido ? 1 : Math.min(1, (t - t0) / 1800);
      const ke = 1 - Math.pow(1 - entrada, 4);
      const sai = Math.min(1, scrollY / (area.offsetHeight * .9));
      giro.style.transform = `rotateX(${tiltX + sai * 30}deg) rotateY(${tiltY}deg) scale(${(.55 + .45 * ke) * (1 + sai * .35)})`;
      capas.forEach((c, i) => {
        const a = (i / n) * 360 + ang + (1 - ke) * 160, rad = a * Math.PI / 180;
        const x = Math.cos(rad) * R * ke, y = Math.sin(rad) * R * ke * .92;
        const atraso = Math.min(1, Math.max(0, (entrada * 1.4 - i / n * .4)));
        c.style.transform = `translate3d(${x}px, ${y}px, ${Math.sin(rad * 2 + t / 2600) * 40}px) rotate(${a + 90}deg) rotateX(${(i % 3 - 1) * 10}deg)`;
        c.style.opacity = atraso;
      });
      area.style.setProperty('--sai', sai);
      requestAnimationFrame(quadro);
    })(t0);
    capas.forEach(c => c.addEventListener('click', () => { if (c.dataset.href) location.href = c.dataset.href; }));
  }

  // ── Demonstrações do Atlas ───────────────────────────────────────────
  const lk = $('#demo-likert');
  if (lk) {
    const base = [3, 5, 6, 3, 1]; // respostas de demonstração já recebidas (1..5)
    const media = () => { const tot = base.reduce((a, b) => a + b, 0), s = base.reduce((a, v, i) => a + v * (i + 1), 0); return s / tot; };
    const desenha = () => { const tot = base.reduce((a, b) => a + b, 0);
      $$('#res-likert .rb').forEach((rb, i) => { const p = base[4 - i] / tot * 100; $('i', rb).style.width = p + '%'; $('b', rb).textContent = Math.round(p) + '%'; });
      $('#res-media').textContent = media().toFixed(1).replace('.', ','); };
    let escolhido = -1;
    $$('button', lk).forEach((b, i) => b.addEventListener('click', () => { if (escolhido >= 0) base[escolhido]--; escolhido = i; base[i]++; $$('button', lk).forEach(x => x.classList.toggle('on', x === b)); desenha(); }));
    desenha();
  }
  const np = $('#demo-enps');
  if (np) {
    const votos = Array(11).fill(0); [10, 9, 9, 10, 8, 7, 9, 6, 10, 8, 5, 9, 7, 3, 10, 9].forEach(v => votos[v]++);
    let meu = -1;
    for (let v = 0; v <= 10; v++) { const b = document.createElement('button'); b.textContent = v;
      b.style.background = v <= 6 ? '#fdecea' : v <= 8 ? '#fff4dd' : '#e3f4ea'; b.style.color = v <= 6 ? '#c2412c' : v <= 8 ? '#a65a00' : '#1f7a4c';
      b.addEventListener('click', () => { if (meu >= 0) votos[meu]--; meu = v; votos[v]++; $$('button', np).forEach(x => x.classList.toggle('on', x === b)); calc(); }); np.appendChild(b); }
    const calc = () => { const tot = votos.reduce((a, b) => a + b, 0), pro = votos.slice(9).reduce((a, b) => a + b, 0), det = votos.slice(0, 7).reduce((a, b) => a + b, 0);
      const e = Math.round((pro - det) / tot * 100); $('#enps-v').textContent = (e > 0 ? '+' : '') + e;
      $('#enps-f').textContent = e >= 50 ? 'Excelente' : e >= 20 ? 'Bom' : e >= 0 ? 'Razoável' : e >= -20 ? 'Frágil' : 'Crítico';
      $('#enps-p').textContent = `${Math.round(pro / tot * 100)}% promotores · ${Math.round(det / tot * 100)}% detratores`; };
    calc();
  }
  const gp = $('#demo-gap');
  if (gp) {
    const s = $('#gap-self'), p = $('#gap-pares');
    const calc = () => { const g = +s.value - +p.value, lbl = Math.abs(g) < .25 ? 'leitura alinhada' : g > 0 ? 'se vê acima' : 'se vê abaixo';
      const cor = Math.abs(g) < 1 ? '#3fbf7f' : g > 0 ? '#f0793f' : '#e8a03a';
      $('#gap-v').textContent = (g > 0 ? '+' : g < 0 ? '−' : '') + Math.abs(g).toFixed(2).replace('.', ','); $('#gap-v').style.color = cor; $('#gap-l').textContent = lbl;
      $('#gap-sv').textContent = (+s.value).toFixed(1).replace('.', ','); $('#gap-pv').textContent = (+p.value).toFixed(2).replace('.', ','); };
    s.addEventListener('input', calc); p.addEventListener('input', calc); calc();
  }
  if (temG) addEventListener('load', () => ScrollTrigger.refresh());
})();
