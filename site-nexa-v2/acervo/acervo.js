// Acervo de conteúdo: abas por produto, filtros de editoria e formato, busca nas legendas e o post aberto
// com as telas, a legenda para copiar e os arquivos. Os dados vêm de dados.js (gerado por _gerar/acervo.py).
(() => {
  const D = window.ACERVO || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NOMES = { nexa: 'NEXA', 'sales-coach': 'Sales Coach', atlas: 'Atlas' };
  const semAcento = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const dataBR = (iso) => iso.split('-').reverse().join('/');
  const IC = {
    telas: '<svg viewBox="0 0 24 24"><path d="M4 6h12v14H4zM8 2h12v14h-2V4H8z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
    ant: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    prox: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    seta: '<svg viewBox="0 0 24 24"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>',
  };

  const st = { produto: '', editoria: '', formato: '', q: '', ordem: 'novo' };
  try { Object.assign(st, JSON.parse(sessionStorage.getItem('acervo-filtros') || '{}')); } catch (e) {}

  // Tema claro/escuro, o mesmo do site
  $$('.tema-bt').forEach((b) => b.addEventListener('click', () => {
    const claro = document.documentElement.getAttribute('data-tema') !== 'claro';
    if (claro) document.documentElement.setAttribute('data-tema', 'claro'); else document.documentElement.removeAttribute('data-tema');
    try { localStorage.setItem('nexa-tema', claro ? 'claro' : 'escuro'); } catch (e) {}
  }));

  const casa = (p, ignora) => (ignora === 'produto' || !st.produto || p.produto === st.produto)
    && (ignora === 'editoria' || !st.editoria || p.editoria === st.editoria)
    && (ignora === 'formato' || !st.formato || p.formato === st.formato)
    && (!st.q || semAcento(st.q).split(/\s+/).every((w) => p.busca.includes(w)));

  function lista() {
    const r = D.filter((p) => casa(p));
    const o = st.ordem;
    r.sort((a, b) => o === 'az' ? a.titulo.localeCompare(b.titulo, 'pt-BR')
      : o === 'antigo' ? a.data.localeCompare(b.data) || a.id.localeCompare(b.id)
      : b.data.localeCompare(a.data) || a.id.localeCompare(b.id));
    return r;
  }

  function desenha() {
    try { sessionStorage.setItem('acervo-filtros', JSON.stringify(st)); } catch (e) {}
    $$('.aba').forEach((a) => {
      const k = a.dataset.produto;
      a.classList.toggle('on', k === st.produto);
      $('span', a).textContent = D.filter((p) => (!k || p.produto === k) && casa(p, 'produto')).length;
    });
    $$('.chip-f[data-editoria]').forEach((c) => {
      c.classList.toggle('on', c.dataset.editoria === st.editoria);
      c.disabled = !D.some((p) => p.editoria === c.dataset.editoria && casa(p, 'editoria'));
    });
    $$('.chip-f[data-formato]').forEach((c) => {
      c.classList.toggle('on', c.dataset.formato === st.formato);
      c.disabled = !D.some((p) => p.formato === c.dataset.formato && casa(p, 'formato'));
    });
    const r = lista();
    $('.ac-conta').textContent = `${r.length} ${r.length === 1 ? 'conteúdo' : 'conteúdos'}`;
    $('.ac-grade').innerHTML = r.length ? r.map((p) => {
      const qtd = p.video ? `${IC.play}vídeo` : p.telas.length > 1 ? `${IC.telas}${p.telas.length}` : '';
      return `<button class="card-ac" data-id="${p.id}">
        <div class="img"><img src="${p.capa}" alt="" loading="lazy">
          <div class="tags"><b class="p-${p.produto}">${NOMES[p.produto]}</b><b>${esc(p.formato)}</b></div>
          ${qtd ? `<span class="qtd">${qtd}</span>` : ''}</div>
        <h3>${esc(p.titulo)}</h3><small>${esc(p.editoria)} · ${dataBR(p.data)}</small></button>`;
    }).join('') : '<p class="ac-vazio">Nada encontrado com esses filtros.</p>';
  }

  // Post aberto
  const dlg = $('.ac-post');
  let atual = null, idx = 0;

  function abre(id, empurra = true) {
    const p = D.find((x) => x.id === id);
    if (!p) return;
    atual = p; idx = 0;
    if (empurra) history.replaceState(null, '', `#${id}`);
    const itens = p.video ? [{ v: p.video, poster: p.poster }] : p.telas.map((t) => ({ i: t }));
    const nomeArq = (u) => `${p.id}-${u.split('/').pop()}`;
    $('.ac-post-in').innerHTML = `
      <div class="ac-midia"><div class="ac-palco"></div>
        <button class="ac-nav ant" aria-label="Tela anterior">${IC.ant}</button><button class="ac-nav prox" aria-label="Próxima tela">${IC.prox}</button>
        ${itens.length > 1 ? `<div class="ac-miniaturas">${p.telas.map((t, i) => `<button data-i="${i}" aria-label="Tela ${i + 1}"><img src="${t}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      </div>
      <div class="ac-info">
        <div class="topo-i"><h2>${esc(p.titulo)}</h2><button class="ac-fechar" aria-label="Fechar">${IC.x}</button></div>
        <div class="ac-meta"><span>${NOMES[p.produto]}</span><span>${esc(p.editoria)}</span><span>${esc(p.formato)}</span>${p.medida ? `<span>${esc(p.medida)}</span>` : ''}<span>${dataBR(p.data)}</span>${p.serie ? `<span>${esc(p.serie)}</span>` : ''}</div>
        ${p.nota ? `<p class="ac-nota">${esc(p.nota)}</p>` : ''}
        <div class="ac-bloco"><h4>Legenda ${p.legenda ? '<button class="ac-copiar" data-copia="legenda">Copiar legenda</button>' : ''}</h4>
          ${p.legenda ? `<div class="ac-legenda">${esc(p.legenda)}</div>` : '<p class="ac-sem">Sem legenda registrada.</p>'}</div>
        ${p.texto ? `<div class="ac-bloco"><h4>Roteiro dos stories <button class="ac-copiar" data-copia="texto">Copiar</button></h4><div class="ac-legenda">${esc(p.texto)}</div></div>` : ''}
        <div class="ac-bloco"><h4>Arquivos</h4><div class="ac-acoes">
          ${p.video ? `<a class="pill sm" href="${p.video}" download="${nomeArq(p.video)}">Baixar vídeo ${IC.seta}</a>`
            : `<a class="pill sm baixa-atual" href="${p.telas[0]}" download>Baixar esta tela ${IC.seta}</a>${p.telas.length > 1 ? `<button class="pill sm baixa-todas">Baixar as ${p.telas.length} telas ${IC.seta}</button>` : ''}`}
        </div></div>
        <div class="ac-bloco"><h4>Origem no repositório</h4><p class="ac-origem">${esc(p.pasta)}</p></div>
      </div>`;
    $('.ac-fechar', dlg).onclick = () => dlg.close();
    $('.ant', dlg).onclick = () => vai(idx - 1);
    $('.prox', dlg).onclick = () => vai(idx + 1);
    $$('.ac-miniaturas button', dlg).forEach((b) => (b.onclick = () => vai(+b.dataset.i)));
    $$('.ac-copiar', dlg).forEach((b) => (b.onclick = async () => {
      const t = p[b.dataset.copia];
      try { await navigator.clipboard.writeText(t); } catch (e) {
        const ta = Object.assign(document.createElement('textarea'), { value: t }); document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      const o = b.textContent; b.textContent = 'Copiado'; setTimeout(() => (b.textContent = o), 1600);
    }));
    const todas = $('.baixa-todas', dlg);
    if (todas) todas.onclick = () => p.telas.forEach((t, i) => setTimeout(() => {
      const a = Object.assign(document.createElement('a'), { href: t, download: nomeArq(t) }); document.body.append(a); a.click(); a.remove();
    }, i * 350));
    function vai(n) {
      idx = Math.max(0, Math.min(itens.length - 1, n));
      const it = itens[idx];
      $('.ac-palco', dlg).innerHTML = it.v
        ? `<video src="${it.v}" poster="${it.poster}" controls playsinline preload="metadata"></video>`
        : `<img src="${it.i}" alt="Tela ${idx + 1} de ${itens.length}">`;
      $('.ant', dlg).hidden = idx === 0; $('.prox', dlg).hidden = idx >= itens.length - 1;
      $$('.ac-miniaturas button', dlg).forEach((b, i) => b.classList.toggle('on', i === idx));
      const on = $('.ac-miniaturas button.on', dlg); if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      const b = $('.baixa-atual', dlg); if (b) { b.href = it.i; b.download = nomeArq(it.i); }
    }
    vai(0);
    if (!dlg.open) dlg.showModal();
  }
  dlg.addEventListener('close', () => { $$('video', dlg).forEach((v) => v.pause()); history.replaceState(null, '', location.pathname + location.search); atual = null; });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.addEventListener('keydown', (e) => {
    if (!dlg.open || !atual) return;
    if (e.key === 'ArrowRight') $('.prox', dlg).click();
    if (e.key === 'ArrowLeft') $('.ant', dlg).click();
  });

  // Eventos dos filtros
  $$('.aba').forEach((a) => a.addEventListener('click', () => { st.produto = a.dataset.produto; desenha(); }));
  $$('.chip-f[data-editoria]').forEach((c) => c.addEventListener('click', () => { st.editoria = st.editoria === c.dataset.editoria ? '' : c.dataset.editoria; desenha(); }));
  $$('.chip-f[data-formato]').forEach((c) => c.addEventListener('click', () => { st.formato = st.formato === c.dataset.formato ? '' : c.dataset.formato; desenha(); }));
  const busca = $('.ac-busca input'); busca.value = st.q;
  let t; busca.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { st.q = busca.value.trim(); desenha(); }, 120); });
  const ordem = $('.ac-ordem'); ordem.value = st.ordem; ordem.addEventListener('change', () => { st.ordem = ordem.value; desenha(); });
  $('.ac-grade').addEventListener('click', (e) => { const c = e.target.closest('.card-ac'); if (c) abre(c.dataset.id); });

  desenha();
  if (location.hash.length > 1) abre(decodeURIComponent(location.hash.slice(1)), false);
})();
