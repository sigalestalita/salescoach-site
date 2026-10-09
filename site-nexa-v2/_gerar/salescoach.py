"""Gera sales-coach/index.html."""
import os
from partes import head, topo, contato, rodape, fim, SETA, MAIL

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = '../'
IC = {
    'mic': '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
    'raio': '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    'nota': '<svg viewBox="0 0 24 24"><path d="M4 20h16M7 16V9M12 16V5M17 16v-4"/></svg>',
    'regua': '<svg viewBox="0 0 24 24"><path d="M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2"/></svg>',
    'chat': '<svg viewBox="0 0 24 24"><path d="M20 11.5c0 4-3.6 7.2-8 7.2-1 0-1.9-.15-2.7-.42L4 20l1.3-3.6A7 7 0 0 1 4 11.5C4 7.5 7.6 4.3 12 4.3s8 3.2 8 7.2z"/></svg>',
    'painel': '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M9 20V9"/></svg>',
    'livro': '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16M8 7h7"/></svg>',
    'crm': '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h7M17 14l2 2 3-4"/></svg>',
}

def bloco(ic, titulo, texto, mini=None, cls=''):
    m = f'<div class="mini"><img src="{B}assets/telas/{mini}.webp" alt="" loading="lazy"></div>' if mini else ''
    return f'<div class="bloco {cls}" data-reveal data-tilt><span class="ic">{IC[ic]}</span><h4>{titulo}</h4><p>{texto}</p>{m}</div>'

PASSOS = [
    ('antes', 'sc-treino', '01 · Antes · Treino', 'Erre no simulado, <span class="tom">não no lead de verdade.</span>',
     'A IA faz o papel do cliente com as objeções que já apareceram nas suas reuniões. Você fala pelo microfone, e a conversa termina com nota.',
     ['Clientes simulados, com nível de dificuldade', 'Treino por voz, como numa chamada', 'Nota e critérios da metodologia ao final']),
    ('durante', 'sc-aovivo', '02 · Durante · Coach ao vivo', 'A resposta chega <span class="tom">com a objeção ainda no ar.</span>',
     'A extensão acompanha a reunião no Meet e no Teams. Discreta: só o vendedor vê. Quando o lead trava, a dica "fale agora" aparece na hora.',
     ['Transcrição em tempo real', 'Dicas por objeção e por critério que falta cobrir', 'Gravando tela e áudio, sem bot na sala']),
    ('depois', 'sc-analise', '03 · Depois · Análise', 'Cada reunião vira nota, <span class="tom">com justificativa.</span>',
     'Score de 0 a 100, temperatura da oportunidade, talk ratio e cada critério justificado com o que foi dito. Os próximos passos vão para o CRM.',
     ['BANT, MEDDIC e SPIN prontos', 'Ou a metodologia da sua empresa', 'Envio ao CRM sem ninguém digitar']),
    ('sempre', 'sc-assistente', '04 · Sempre · Assistente', 'Pergunte <span class="tom">como a um colega.</span>',
     'O assistente consulta as reuniões de verdade antes de responder e cita cada uma pelo nome. Quais agendas estão quentes? O que travou a negociação?',
     ['Respostas com base nas reuniões do time', 'Cita a agenda, a data e quem conduziu', 'Prepara a próxima conversa']),
    ('gestao', 'sc-gestor', '05 · Gestão', 'O time inteiro <span class="tom">numa tela.</span>',
     'Indicadores do time, evolução dos scores por vendedor e as agendas quentes ou travadas. O um a um deixa de ser opinião.',
     ['Score médio e reuniões quentes', 'Evolução por executivo', 'Relatórios de gestão compartilháveis']),
]
narr = ''.join(f'''<div id="{i}"><span class="kick lime">{k}</span><h3>{t}</h3><p>{p}</p><ul>{''.join(f'<li>{x}</li>' for x in li)}</ul>
  <img class="n-mobile" src="{B}assets/telas/{img}.webp" alt="" loading="lazy"></div>''' for i, img, k, t, p, li in PASSOS)
ON = ' class="on"'
telas = ''.join(f'<img src="{B}assets/telas/{img}.webp" alt=""{ON if n == 0 else ""} loading="lazy">' for n, (_, img, *_r) in enumerate(PASSOS))
pts = ''.join('<i></i>' for _ in PASSOS)

LOGOS = '["googlemeet.svg","microsoftteams.svg","zoom.svg","whatsapp.svg","hubspot.svg","salesforce.svg","pipedrive.png","rdstation.png","zoho.svg","slack.svg","gmail.svg","notion.svg"]'

html = head('Sales Coach · NEXA', 'Coach de vendas com IA em português: treina antes, orienta durante e analisa depois de cada reunião.', B) + topo(B, 'sc') + f'''
<main>
<section><div class="wrap p-hero">
  <div class="txt">
    <div style="display:flex;align-items:center;gap:14px" data-reveal><img src="{B}assets/logos/mark-white.png" alt="" style="height:38px"><span class="kick">Sales Coach · um produto NEXA</span></div>
    <h1 class="h-xl" data-palavras>Cada reunião <br><span class="tom">vira método.</span></h1>
    <p class="lead" data-reveal data-d=".4">O gestor não ouve todas as reuniões. O Sales Coach ouve: treina antes, orienta durante e analisa depois, em português, no Meet e no Teams, pela metodologia da sua empresa.</p>
    <div class="chips" data-reveal data-d=".55"><span class="chip"><i></i>Meet e Teams</span><span class="chip"><i></i>BANT · MEDDIC · SPIN</span><span class="chip"><i></i>CRM preenchido sozinho</span></div>
    <div class="pills" data-reveal data-d=".7"><a class="pill lime" href="#contato">Agendar demonstração {SETA}</a><a class="pill" href="#video">Ver em 45 segundos</a></div>
  </div>
  <div class="palco">
    <div class="orbita-telas">
      <img src="{B}assets/telas/sc-analise.webp" alt="" data-z="1.4" data-r="-9" style="left:0;top:4%">
      <img src="{B}assets/telas/sc-aovivo.webp" alt="" data-z="2" data-r="8" style="right:0;top:12%">
      <img src="{B}assets/telas/sc-gestor.webp" alt="" data-z=".8" data-r="6" style="left:4%;bottom:6%">
      <img src="{B}assets/telas/sc-treino.webp" alt="" data-z="1.7" data-r="-7" style="right:2%;bottom:2%">
    </div>
    <div class="fone"><video data-auto muted loop playsinline preload="metadata" poster="{B}assets/media/sales-coach.jpg"><source src="{B}assets/media/sales-coach.mp4" type="video/mp4"></video></div>
  </div>
</div></section>

<section class="sec linha-topo" id="momentos"><div class="wrap">
  <div class="sec-cab"><span class="kick">Como funciona</span><h2 class="h-l" data-palavras>Quatro momentos. <span class="tom">A mesma régua.</span></h2>
    <p class="lead" data-reveal>Antes, durante e depois de cada reunião, e sempre que alguém precisar perguntar. A mesma metodologia nos quatro, para o time inteiro vender igual.</p></div>
  <div class="narrativa">
    <div class="passos-n">{narr}</div>
    <div class="tela-fixa"><div class="moldura">{telas}</div><div class="marcador">{pts}</div></div>
  </div>
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab"><span class="kick">Funcionalidades</span><h2 class="h-l" data-palavras>Tudo o que sobra <span class="tom">de uma reunião.</span></h2></div>
  <div class="bento">
    {bloco('mic', 'Treino por voz', 'Simulações com clientes de IA que usam as objeções reais do seu mercado.', 'sc-treino', 'l')}
    {bloco('raio', 'Coach ao vivo', 'Extensão para Meet e Teams com dicas na hora certa. Só o vendedor vê.', 'sc-aovivo', 'l')}
    {bloco('nota', 'Análise com nota', 'Score, temperatura, talk ratio e critérios justificados com o que foi dito.', 'sc-analise')}
    {bloco('regua', 'Metodologia própria', 'BANT, MEDDIC e SPIN prontos, ou critérios, pesos e faixas da sua empresa.')}
    {bloco('chat', 'Assistente de vendas', 'Pergunte sobre as agendas e receba respostas com as reuniões citadas.', 'sc-assistente')}
    {bloco('painel', 'Painel do gestor', 'O time inteiro numa tela: evolução, agendas quentes e travadas.', 'sc-gestor', 'xl')}
    {bloco('livro', 'Base de conhecimento', 'Playbooks, preços e cases viram contexto para a IA e geram argumentos.', 'sc-conhecimento')}
    {bloco('crm', 'CRM preenchido sozinho', 'Resumo, próximos passos, temperatura e critérios vão para a oportunidade.', None, 'l')}
    {bloco('painel', 'Relatórios compartilháveis', 'Relatórios de gestão com link e validade, para levar à diretoria.', None, 'l')}
  </div>
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab centro"><span class="kick">Para quem</span><h2 class="h-l" data-palavras>Quem vende <span class="tom">e quem lidera.</span></h2>
    <div data-reveal><div class="alterna" data-grupo="quem"><i class="bola"></i><button class="on" data-v="exec">Executivo</button><button data-v="gestor">Gestor</button></div></div></div>
  <div class="painel-alt ganhos on" data-painel="quem:exec">
    <div class="ganho"><b>Erre dez vezes falando.</b><p>Antes da primeira reunião de verdade, com as objeções que o seu mercado faz.</p></div>
    <div class="ganho"><b>A resposta na hora.</b><p>Quando a objeção aparece, a dica já está na tela, sem sair da conversa.</p></div>
    <div class="ganho"><b>A nota e a pergunta que faltou.</b><p>Ao fim de cada reunião, o que foi bem e o que fazer diferente na próxima.</p></div>
  </div>
  <div class="painel-alt ganhos" data-painel="quem:gestor">
    <div class="ganho"><b>Rampagem curta.</b><p>O novato chega à primeira reunião já tendo visto as objeções do seu mercado.</p></div>
    <div class="ganho"><b>Treino em toda reunião.</b><p>Sem precisar estar em todas: cada conversa do time é ouvida e avaliada.</p></div>
    <div class="ganho"><b>O um a um deixa de ser opinião.</b><p>Critérios, notas e trechos da conversa sustentam o feedback.</p></div>
  </div>
</div></section>

<section class="sec linha-topo" id="integracoes"><div class="wrap">
  <div class="sec-cab centro"><span class="kick">Integrações</span><h2 class="h-l" data-palavras>Encaixa no que <span class="tom">o time já usa.</span></h2>
    <p class="lead" data-reveal>Meet e Teams pela extensão. Zoom e gravações de qualquer origem por upload. O resultado vai para HubSpot, Salesforce, Pipedrive e RD Station, e também Zoho, Bitrix24, Kommo, monday, Agendor, Ploomes, Slack, Gmail, WhatsApp e Notion.</p></div>
  <div class="orbitas" data-logos='{LOGOS}' data-base="{B}assets/logos/"><div class="centro-o"><img src="{B}assets/logos/mark-white.png" alt="Sales Coach"></div></div>
</div></section>

<section class="sec linha-topo" id="planos"><div class="wrap">
  <div class="sec-cab"><span class="kick">Planos</span><h2 class="h-l" data-palavras>Você paga <span class="tom">por quem usa.</span></h2>
    <p class="lead" data-reveal>Cobrança por usuário ativo. Nada de plano travado nem de licença paga para quem não usa. O time cresce, o preço acompanha.</p></div>
  <div class="planos">
    <div class="plano" data-reveal><span class="kick">1 a 10 usuários</span><h4>Essencial</h4><div class="preco"><small>R$</small> 19,90</div><span class="kick">por usuário/mês · R$ 990 de implantação</span>
      <ul><li>50 reuniões analisadas por usuário/mês</li><li>Coach ao vivo durante a reunião</li><li>Extensão para Meet e Teams</li><li>BANT, MEDDIC e SPIN prontos</li><li>Base de conhecimento e gerador de argumentos</li></ul>
      <a class="pill" href="#contato">Quero o Essencial {SETA}</a></div>
    <div class="plano dest" data-reveal data-d=".1"><span class="tag">Mais escolhido</span><span class="kick">11 a 50 usuários</span><h4>Profissional</h4><div class="preco"><small>R$</small> 29,90</div><span class="kick">por usuário/mês · R$ 1.690 de implantação</span>
      <ul><li>120 reuniões analisadas por usuário/mês</li><li>Metodologia própria: critérios, pesos e faixas</li><li>CRM preenchido sozinho ao fim da reunião</li><li>Modo de treino e assistente de vendas</li><li>Relatórios de gestão compartilháveis</li></ul>
      <a class="pill lime" href="#contato">Quero o Profissional {SETA}</a></div>
    <div class="plano" data-reveal data-d=".2"><span class="kick">Acima de 50 usuários</span><h4>Enterprise</h4><div class="preco" style="font-size:44px">Sob medida</div><span class="kick">preço por volume</span>
      <ul><li>Volume de análises sob medida</li><li>Integrações dedicadas e acesso à API</li><li>Onboarding da metodologia e da base</li><li>SSO e revisão de segurança</li><li>SLA e suporte dedicado</li></ul>
      <a class="pill" href="#contato">Falar com a NEXA {SETA}</a></div>
  </div>
</div></section>

<section class="sec linha-topo" id="video"><div class="wrap">
  <div class="sec-cab centro"><span class="kick">Em 45 segundos</span><h2 class="h-l" data-palavras>Veja o Sales Coach <span class="tom">funcionando.</span></h2></div>
  <div class="videos"><div class="video-card" data-reveal><div class="fone"><video data-manual="1" playsinline preload="none" poster="{B}assets/media/sales-coach.jpg"><source src="{B}assets/media/sales-coach.mp4" type="video/mp4"></video><span class="play"><i><svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg></i></span></div><span class="kick">Toque para ver com som</span></div></div>
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab"><span class="kick">Perguntas frequentes</span><h2 class="h-l" data-palavras>Antes de <span class="tom">começar.</span></h2></div>
  <div class="faq" data-reveal>
    <details><summary>Precisa colocar um bot na reunião?<i></i></summary><div class="resp">Não. No Meet e no Teams, a extensão do navegador grava tela e áudio do lado do vendedor. Para o Zoom e outras origens, a gravação entra por upload.</div></details>
    <details><summary>Funciona em português?<i></i></summary><div class="resp">Sim. O Sales Coach foi feito em português, para reuniões em português.</div></details>
    <details><summary>Posso usar a metodologia da minha empresa?<i></i></summary><div class="resp">Sim. BANT, MEDDIC e SPIN já vêm prontos, e no plano Profissional você define critérios, pesos e faixas próprios.</div></details>
    <details><summary>Como é a cobrança?<i></i></summary><div class="resp">Por usuário ativo, mensalmente, com uma taxa de implantação única. Ao passar de 10 pessoas, o time entra no plano Profissional.</div></details>
  </div>
</div></section>
''' + contato(B, 'Seu time vendendo melhor <span class="tom">em cada reunião.</span>') + '</main>' + rodape(B) + fim(B)

open(os.path.join(RAIZ, 'sales-coach', 'index.html'), 'w', encoding='utf-8').write(html)
print('sales-coach/index.html', len(html))
