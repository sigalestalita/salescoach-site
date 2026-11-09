// Sites de exemplo (marcas fictícias) desenhados em HTML: usados na página /sites e nos anúncios.
// window.NexaMock.site(tipo, { img: 'img/' }) → HTML de uma janela de navegador com o site.
// window.NexaMock.aviso(tipo) → o cartão de "novo contato" que chega no WhatsApp/CRM.
(function () {
  const W = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg>';
  const SITES = {
    psi: { url: 'claramoraes.psi.br', marca: 'Clara Moraes', sub: 'Psicóloga · CRP 07/00000', nav: ['Sobre', 'Como funciona', 'Contato'],
      k: 'Terapia online e presencial', h: 'Um espaço seguro para cuidar de você.', p: 'Atendimento para adultos, com hora marcada e sigilo.', cta: 'Agendar primeira sessão', foto: 'foto-psi.webp',
      cor: '#a64b2a', fundo: '#f7f1ea', tinta: '#2b1d16', fonte: "'Fraunces', Georgia, serif",
      aviso: { nome: 'Mariana', txt: 'quer agendar a primeira sessão' } },
    clinica: { url: 'verticeodonto.com.br', marca: 'Vértice', sub: 'Odontologia', nav: ['Tratamentos', 'Equipe', 'Convênios'],
      k: 'Clínica odontológica', h: 'Seu sorriso em boas mãos.', p: 'Avaliação completa, implantes e estética, sem fila de espera.', cta: 'Agendar avaliação', foto: 'foto-clinica.webp',
      cor: '#0f766e', fundo: '#f2f8f7', tinta: '#0b2b29', fonte: "'Manrope', system-ui, sans-serif",
      aviso: { nome: 'Rafael', txt: 'quer agendar uma avaliação' } },
    escritorio: { url: 'pradolemos.adv.br', marca: 'Prado & Lemos', sub: 'Advocacia e contabilidade', nav: ['Áreas', 'Escritório', 'Contato'],
      k: 'Empresarial · trabalhista · tributário', h: 'Seu negócio protegido, do contrato ao balanço.', p: 'Atendimento para pequenas e médias empresas.', cta: 'Falar com um especialista', foto: 'foto-escritorio.webp',
      cor: '#a8864f', fundo: '#f4f2ee', tinta: '#18223a', fonte: "'Fraunces', Georgia, serif",
      aviso: { nome: 'Carla', txt: 'precisa revisar um contrato' } },
    mentora: { url: 'juliaandrade.com.br', marca: 'Júlia Andrade', sub: 'Mentoria de carreira', nav: ['Mentoria', 'Palestras', 'Depoimentos'],
      k: 'Nova turma em dezembro', h: 'Da ideia à primeira turma lotada.', p: 'Mentoria em grupo para quem quer viver do que ensina.', cta: 'Quero entrar na lista', foto: 'foto-mentora.webp',
      cor: '#c0266d', fundo: '#fbf2f6', tinta: '#2a1020', fonte: "'Manrope', system-ui, sans-serif",
      aviso: { nome: 'Patrícia', txt: 'entrou na lista da nova turma' } },
    imovel: { url: 'casaaltaimoveis.com.br', marca: 'Casa Alta', sub: 'Imóveis', nav: ['Comprar', 'Alugar', 'Anunciar'],
      k: 'Casas e apartamentos', h: 'O imóvel certo, sem perder seus fins de semana.', p: 'Visitas agendadas e documentação acompanhada do início ao fim.', cta: 'Ver imóveis disponíveis', foto: 'foto-imovel.webp',
      cor: '#1f5a43', fundo: '#f1f5f2', tinta: '#0f241b', fonte: "'Manrope', system-ui, sans-serif",
      aviso: { nome: 'Eduardo', txt: 'quer visitar a casa no sábado' } },
    cafe: { url: 'graofinocafe.com.br', marca: 'Grão Fino', sub: 'Café e padaria', nav: ['Cardápio', 'Encomendas', 'Onde estamos'],
      k: 'Aberto todos os dias', h: 'Café de verdade, pertinho de você.', p: 'Encomendas para eventos e cafés da manhã corporativos.', cta: 'Fazer encomenda', foto: 'foto-cafe.webp',
      cor: '#8a5a2b', fundo: '#f6f0e8', tinta: '#2a1c12', fonte: "'Fraunces', Georgia, serif",
      aviso: { nome: 'Lúcia', txt: 'quer encomendar 40 salgados' } },
  };

  function site(tipo, o) {
    const s = SITES[tipo], img = (o && o.img) || 'img/';
    return `<div class="mk" style="--c:${s.cor};--f:${s.fundo};--t:${s.tinta};--fn:${s.fonte}">
      <div class="mk-barra"><i></i><i></i><i></i><span>${s.url}</span></div>
      <div class="mk-tela">
        <div class="mk-nav"><b>${s.marca}<small>${s.sub}</small></b><span>${s.nav.map((n) => `<em>${n}</em>`).join('')}</span><a>${W}WhatsApp</a></div>
        <div class="mk-hero">
          <div class="mk-txt"><p class="mk-k">${s.k}</p><h3>${s.h}</h3><p>${s.p}</p><a>${s.cta}</a></div>
          <div class="mk-foto" style="background-image:url('${img}${s.foto}')"></div>
        </div>
        <div class="mk-form"><span>Nome</span><span>WhatsApp</span><a>Enviar</a></div>
      </div></div>`;
  }
  function aviso(tipo, quando) {
    const s = SITES[tipo];
    return `<div class="mk-aviso"><i>${W}</i><div><b>Novo contato pelo site</b><span>${s.aviso.nome} ${s.aviso.txt}</span></div><small>${quando || 'agora'}</small></div>`;
  }
  window.NexaMock = { site, aviso, SITES };
})();
