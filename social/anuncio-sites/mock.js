// Sites de exemplo (marcas fictícias) desenhados em HTML: usados na página /sites e nos anúncios.
// NexaMock.site(tipo, { img }) → janela de navegador com o site (versão computador).
// NexaMock.celular(tipo, { img }) → o mesmo site no celular.
// NexaMock.aviso(tipo) → o cartão de "novo contato" que chega no WhatsApp/CRM.
(function () {
  const W = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>';
  const SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const EST = '<i class="est">★★★★★</i>';
  const SITES = {
    psi: { url: 'claramoraes.psi.br', aviso: ['Mariana', 'quer agendar a primeira sessão'] },
    clinica: { url: 'verticeodonto.com.br', aviso: ['Rafael', 'quer agendar uma avaliação'] },
    escritorio: { url: 'pradolemos.adv.br', aviso: ['Carla', 'precisa revisar um contrato'] },
    mentora: { url: 'juliaandrade.com.br', aviso: ['Patrícia', 'garantiu a vaga na turma 7'] },
    imovel: { url: 'casaaltaimoveis.com.br', aviso: ['Eduardo', 'quer visitar a casa no sábado'] },
    cafe: { url: 'graofinocafe.com.br', aviso: ['Lúcia', 'quer encomendar 40 salgados'] },
  };
  const foto = (img, f, cls = 'foto') => `<div class="${cls}" style="background-image:url('${img}foto-${f}.webp')"></div>`;

  // ── Computador ──
  const SELO = (txt, id) => `<div class="selo"><svg viewBox="0 0 100 100"><defs><path id="c-${id}" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text><textPath href="#c-${id}">${txt}</textPath></text></svg>${SETA}</div>`;
  const D = {
    psi: (img) => `<div class="aura"></div>
      <nav><b class="logo">Clara Moraes</b><span class="mono">CRP 07/00000 · ONLINE E PRESENCIAL</span><a class="nb">Agendar</a></nav>
      <div class="hero"><h1>Respire.<br><em>Você chegou.</em></h1>
        <p class="sub">Terapia para adultos que cansaram de dar conta de tudo sozinhos.</p>
        <div class="bento"><div class="g vaga"><i class="pulso"></i><small>Próxima vaga</small><b>Qui, 18:30</b></div><div class="g"><small>Primeira sessão</small><b>50 min</b></div><div class="g"><small>Avaliações</small><b>4,9 ${EST}</b></div></div>
        <a class="b1">Agendar primeira sessão ${SETA}</a></div>
      <div class="capsula">${foto(img, 'psi')}</div>${SELO('agende sua primeira sessão · agende sua primeira sessão · ', 'psi')}`,
    clinica: (img) => `<div class="grade"></div>
      <nav><b class="logo"><i class="mono-l">V</i>vértice<small>odontologia digital</small></b><span><em>Tratamentos</em><em>Tecnologia</em><em>Equipe</em></span><a class="nb">${W}Agendar</a></nav>
      <div class="hero"><p class="mono rot">// SCANNER 3D · PLANEJAMENTO DIGITAL</p>
        <h1>O sorriso que você adia há anos, <span class="grad-c">em 3 consultas.</span></h1>
        <a class="b1">Agendar avaliação ${SETA}</a></div>
      <div class="bento">
        <div class="t1">${foto(img, 'clinica')}<span class="chip">Planejamento 3D</span><svg class="arco3d" viewBox="0 0 200 120"><path d="M10 110 Q100 -30 190 110"/><path d="M30 110 Q100 0 170 110"/><path d="M50 110 Q100 30 150 110"/></svg></div>
        <div class="t2"><small class="mono">SIMULE SEU SORRISO</small><div class="slider"><i></i></div><span><em>Antes</em><em>Depois</em></span></div>
        <div class="t3"><b>98%</b><small>de satisfação em 2.400 pacientes</small></div>
        <div class="t4"><i class="pulso"></i><div><b>3 horários hoje</b><small class="mono">15:00 · 16:30 · 18:00</small></div></div>
      </div>`,
    escritorio: (img) => `<div class="grade"></div><div class="mega">P&amp;L</div>
      <nav><b class="logo">Prado &amp; Lemos</b><span class="mono">ADVOCACIA · CONTABILIDADE · DESDE 2003</span><a class="nb">Fale com um sócio</a></nav>
      <div class="hero"><h1>Direito e números<br><em>na mesma mesa.</em></h1>
        <p class="sub">Contratos, folha e impostos resolvidos por uma equipe só.</p>
        <a class="b1">Agendar diagnóstico ${SETA}</a></div>
      <div class="painel"><small class="mono">DIAGNÓSTICO TRIBUTÁRIO</small><p>Economia estimada para a sua empresa</p><b>R$ 184.320<span>/ano</span></b>
        <div class="barras"><i style="height:38%"></i><i style="height:52%"></i><i style="height:47%"></i><i style="height:66%"></i><i style="height:74%"></i><i style="height:92%"></i></div>
        <div class="leg mono"><span>Simples</span><span>Lucro presumido</span></div></div>
      <div class="ticker mono"><span>EMPRESARIAL ✦ TRABALHISTA ✦ TRIBUTÁRIO ✦ CONTÁBIL ✦ SOCIETÁRIO ✦ EMPRESARIAL ✦ TRABALHISTA ✦ TRIBUTÁRIO ✦ CONTÁBIL ✦</span></div>`,
    mentora: (img) => `<div class="ruido"></div><div class="vazado">TURMA 7</div>
      <nav><b class="logo">JÚLIA ANDRADE</b><span><em>Mentoria</em><em>Resultados</em><em>FAQ</em></span><a class="nb">Inscrições abertas</a></nav>
      <div class="hero"><h1>Ensine o que<br>você sabe.<br><span class="grad">Lote a turma.</span></h1>
        <div class="cont"><span><b>03</b>dias</span><span><b>14</b>horas</span><span><b>22</b>min</span><span><b>09</b>seg</span></div>
        <a class="b1">Garantir minha vaga ${SETA}</a></div>
      <div class="retrato">${foto(img, 'mentora')}</div>
      <span class="adesivo a1">vagas limitadas</span><span class="adesivo a2">100% online</span>
      <div class="ticker"><span>+480 alunas formadas ★ nota 4,9 ★ 12 turmas lotadas ★ +480 alunas formadas ★ nota 4,9 ★ 12 turmas lotadas ★</span></div>`,
    imovel: (img) => `<nav><b class="logo">casa<i>alta</i></b><span><em>Comprar</em><em>Alugar</em><em>Lançamentos</em></span><a class="nb">Anunciar</a></nav>
      <div class="hero"><p class="mono">● 312 IMÓVEIS · ATUALIZADO HOJE</p><h1>Encontre a casa<br>que já é sua.</h1>
        <div class="busca"><span><small>Bairro</small>Bela Vista</span><span><small>Quartos</small>3+</span><span><small>Até</small>R$ 1,5 mi</span><a>${SETA}</a></div>
        <div class="filtros"><em>Com quintal</em><em>Perto de escola</em><em>Aceita pet</em></div></div>
      <div class="mapa"><i class="rua r1"></i><i class="rua r2"></i><i class="rua r3"></i><i class="rio"></i>
        <span class="pin" style="left:18%;top:28%">R$ 890 mil</span><span class="pin" style="left:58%;top:18%">R$ 1,1 mi</span><span class="pin on" style="left:38%;top:52%">R$ 1,28 mi</span><span class="pin" style="left:70%;top:66%">R$ 760 mil</span>
        <div class="card im"><div class="th" style="background-image:url('${img}foto-imovel.webp')"><span class="mono">TOUR 360°</span></div><div><b>R$ 1.280.000</b><p>Bela Vista · 4 quartos · 280 m²</p><a>Agendar visita ${SETA}</a></div></div></div>`,
    cafe: (img) => `<nav><span class="ab"><i></i>Aberto agora · até 20h</span><span><em>Cardápio</em><em>Encomendas</em><em>Endereço</em></span></nav>
      <div class="titulo" style="background-image:url('${img}foto-cafe.webp')">Grão<br>Fino</div>
      <p class="tag mono">CAFÉ DE ESPECIALIDADE · TORRA PRÓPRIA</p>
      <a class="b1">${W}Encomendar pelo WhatsApp</a>
      <div class="card menu"><b>Para levar</b><p><span>Espresso</span><i></i><span>R$ 7</span></p><p><span>Cappuccino da casa</span><i></i><span>R$ 12</span></p><p><span>Pão de queijo</span><i></i><span>R$ 6</span></p><p><span>Kit café da manhã</span><i></i><span>R$ 89</span></p></div>
      ${SELO('aberto todos os dias · torra própria · ', 'cafe')}`,
  };

  // ── Celular ──
  const C = {
    psi: { h: 'Respire. <em>Você chegou.</em>', cta: 'Agendar sessão', w: `<div class="g vaga"><i class="pulso"></i><small>Próxima vaga</small><b>Qui, 18:30</b></div>` },
    clinica: { h: 'O sorriso que você adia, <span class="grad-c">em 3 consultas.</span>', cta: 'Agendar avaliação', w: `<div class="t4"><i class="pulso"></i><div><b>3 horários hoje</b><small class="mono">15:00 · 16:30 · 18:00</small></div></div>` },
    escritorio: { h: 'Direito e números <em>na mesma mesa.</em>', cta: 'Agendar diagnóstico', w: `<div class="painel"><small class="mono">ECONOMIA ESTIMADA</small><b>R$ 184.320<span>/ano</span></b></div>` },
    mentora: { h: 'Ensine. <span class="grad">Lote a turma.</span>', cta: 'Garantir vaga', w: `<div class="cont"><span><b>03</b>dias</span><span><b>14</b>h</span><span><b>22</b>min</span></div>` },
    imovel: { h: 'Encontre a casa que já é sua.', cta: 'Ver no mapa', w: `<div class="busca"><span><small>Bairro</small>Bela Vista</span><a>${SETA}</a></div>` },
    cafe: { h: '', cta: 'Encomendar', w: `<div class="card menu"><p><span>Cappuccino</span><i></i><span>R$ 12</span></p><p><span>Kit café</span><i></i><span>R$ 89</span></p></div>` },
  };

  function site(tipo, o) {
    const img = (o && o.img) || 'img/';
    return `<div class="mk"><div class="mk-barra"><i></i><i></i><i></i><span>${SITES[tipo].url}</span></div><div class="mk-tela t-${tipo}">${D[tipo](img)}</div></div>`;
  }
  function celular(tipo, o) {
    const img = (o && o.img) || 'img/', c = C[tipo];
    return `<div class="cel"><div class="cel-tela t-${tipo} m"><i class="ilha"></i>${foto(img, tipo, 'mfoto')}<div class="mveu"></div>
      <div class="mtxt">${tipo === 'cafe' ? `<div class="titulo">Grão<br><em>Fino</em></div>` : `<h1>${c.h}</h1>`}${c.w}<a class="b1">${c.cta}</a></div><a class="mwa">${W}</a></div></div>`;
  }
  function aviso(tipo, quando) {
    const [n, t] = SITES[tipo].aviso;
    return `<div class="mk-aviso"><i>${W}</i><div><b>Novo contato pelo site</b><span>${n} ${t}</span></div><small>${quando || 'agora'}</small></div>`;
  }
  window.NexaMock = { site, celular, aviso, SITES };
})();
