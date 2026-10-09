"""Gera a home do site v2 (index.html)."""
import os
from partes import head, topo, contato, rodape, fim, SETA, GRADE, STAR

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = ''

CAPAS = [
    ('sc-analise', 'Sales Coach', 'análise', 'sales-coach/index.html#depois'),
    ('pessoa-1', 'Atlas Clima', 'escuta', 'atlas/index.html'),
    ('plate-sc', 'Sales Coach', 'em ação', 'sales-coach/index.html'),
    ('ac-painel', 'Atlas Clima', 'painel', 'atlas/index.html#clima'),
    ('sc-aovivo', 'Sales Coach', 'ao vivo', 'sales-coach/index.html#durante'),
    ('plate-neural', 'Fábrica', 'IA aplicada', '#fabrica'),
    ('a3-painel', 'Atlas 360', 'comparar', 'atlas/index.html#atlas-360'),
    ('pessoa-4', 'Pessoas', 'no centro', 'atlas/index.html'),
    ('sc-treino', 'Sales Coach', 'treino', 'sales-coach/index.html#antes'),
    ('ac-liderancas', 'Atlas Clima', 'lideranças', 'atlas/index.html#clima'),
    ('plate-fabrica', 'Fábrica', 'de soluções', '#fabrica'),
    ('sc-gestor', 'Sales Coach', 'gestão', 'sales-coach/index.html#gestao'),
    ('pessoa-3', 'Atlas 360', 'conversa', 'atlas/index.html#atlas-360'),
    ('ac-links', 'Atlas Clima', 'link anônimo', 'atlas/index.html#clima'),
    ('plate-orbitas', 'NEXA', 'ecossistema', '#motores'),
    ('sc-integracoes', 'Sales Coach', 'integrações', 'sales-coach/index.html#integracoes'),
    ('a3-matriz', 'Atlas 360', 'matriz', 'atlas/index.html#atlas-360'),
    ('pessoa-2', 'Atlas Clima', 'sinais', 'atlas/index.html'),
    ('app-extensao', 'Sales Coach', 'extensão', 'sales-coach/index.html#durante'),
    ('plate-clima', 'Atlas Clima', 'mapa', 'atlas/index.html#clima'),
    ('ac-comentarios', 'Atlas Clima', 'comentários', 'atlas/index.html#clima'),
    ('plate-360', 'Atlas 360', 'perspectivas', 'atlas/index.html#atlas-360'),
]
capas = '\n'.join(
    f'<div class="capa" data-href="{h}" role="link" tabindex="0" aria-label="{a} · {b}"><img src="assets/capas/{f}.webp" alt="" loading="{"eager" if i < 12 else "lazy"}" decoding="async">'
    f'<span class="rot"><i></i><b>{a}</b><em>{b}</em></span><svg class="seta" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg></div>'
    for i, (f, a, b, h) in enumerate(CAPAS))

def prod(nome, kick, titulo, texto, itens, video, href, flut):
    lis = ''.join(f'<li>{i}</li>' for i in itens)
    fl = ''.join(f'<img class="flutua" src="assets/telas/{f}.webp" alt="" loading="lazy" style="{s}">' for f, s in flut)
    return f'''<article class="prod">
  <div class="txt"><span class="kick lime">{kick}</span><h3>{titulo}</h3><p class="lead" style="font-size:17px">{texto}</p><ul>{lis}</ul>
    <div class="pills"><a class="pill lime" href="{href}">Conhecer o {nome} {SETA}</a></div></div>
  <div class="midia">{fl}<div class="fone"><video data-auto muted loop playsinline preload="none" poster="assets/media/{video}.jpg"><source src="assets/media/{video}.mp4" type="video/mp4"></video></div></div>
</article>'''

html = head('NEXA · Inteligência que vira solução',
            'Produtos de prateleira e uma fábrica de soluções com IA. Sales Coach para vendas, Atlas para pessoas.', B) + topo(B) + f'''
<main>
<section class="anel-hero" aria-label="Abertura">
  <div class="anel"><div class="giro">{capas}</div></div>
  <div class="anel-centro">
    <div class="kick" data-reveal>Fábrica de soluções digitais</div>
    <h1 class="h-xl" data-palavras>Inteligência <br><span class="tom">que vira solução.</span></h1>
    <p class="lead" data-reveal data-d=".5">Produtos prontos para vender e cuidar de pessoas. E uma fábrica para os desafios que ainda não têm produto.</p>
    <div class="pills" data-reveal data-d=".7"><a class="pill" href="#produtos">Ver os produtos {GRADE}</a><a class="pill lime" href="#contato">Traga um desafio {SETA}</a></div>
  </div>
  <div class="anel-dica">Arraste para girar <i></i></div>
</section>

<section class="sec manifesto"><div class="wrap">
  <div class="kick" style="margin-bottom:34px" data-reveal>Manifesto</div>
  <p data-palavras>Ideias não foram feitas para ficar no papel. Somos a conexão entre um desafio real e o software que resolve. <span class="lime">IA acelera. Pessoas dão direção.</span></p>
</div></section>

<section class="sec linha-topo" id="motores"><div class="wrap">
  <div class="sec-cab"><span class="kick">(01) O que fazemos</span><h2 class="h-l" data-palavras>Um negócio. <span class="tom">Dois motores.</span></h2>
    <p class="lead" data-reveal>Produtos prontos para começar rápido. Uma fábrica para os desafios que ainda não têm produto. A fábrica descobre; o produto escala.</p></div>
  <div class="motores">
    <div class="motor" data-reveal data-tilt><i class="brilho"></i><span class="num">Motor 01 · Assinatura por usuário</span><h3>Produtos de<br><span class="tom">prateleira</span></h3>
      <p>Software pronto, implantado com o material, a metodologia e o contexto de cada cliente.</p>
      <ul><li><a href="sales-coach/index.html">Sales Coach <em>Vendas ↗</em></a></li><li><a href="atlas/index.html#clima">Atlas Clima <em>Pessoas ↗</em></a></li><li><a href="atlas/index.html#atlas-360">Atlas 360 <em>Pessoas ↗</em></a></li></ul></div>
    <div class="motor" data-reveal data-d=".1" data-tilt><i class="brilho"></i><span class="num">Motor 02 · Sob medida</span><h3>Fábrica de<br><span class="tom">soluções</span></h3>
      <p>Desenvolvimento com IA para o desafio que ainda não tem produto: da pergunta certa ao software em uso.</p>
      <ul><li><a href="#metodo">Visão de negócio <em>Antes ↗</em></a></li><li><a href="#metodo">Construção com IA <em>Durante ↗</em></a></li><li><a href="#metodo">Evolução contínua <em>Sempre ↗</em></a></li></ul></div>
  </div>
</div></section>

<section class="sec linha-topo" id="produtos" style="padding-bottom:0">
  <div class="wrap"><div class="sec-cab"><span class="kick">(02) Produtos de prateleira</span><h2 class="h-l" data-palavras>Produtos que nascem <span class="tom">de problemas reais.</span></h2></div></div>
</section>
<section class="vitrine" style="padding-bottom:clamp(90px,13vw,180px)"><div class="trilho">
{prod('Sales Coach', 'Vendas · disponível', 'O gestor não ouve todas as reuniões. <span class="tom">O Sales Coach ouve.</span>',
      'Coach de vendas com IA, em português, no Meet e no Teams. Treina antes, orienta durante e analisa depois, pela metodologia da empresa.',
      ['Treino com clientes simulados', 'Dica ao vivo na objeção', 'Nota com BANT, MEDDIC e SPIN', 'CRM preenchido sozinho', 'Assistente sobre as agendas', 'Painel do gestor'],
      'sales-coach', 'sales-coach/index.html', [('sc-analise', 'left:-6%;top:8%;transform:rotate(-8deg)'), ('sc-aovivo', 'right:-8%;bottom:6%;transform:rotate(7deg)')])}
{prod('Atlas Clima', 'Pessoas · disponível', 'Escute sua organização. <span class="tom">Sem ruído.</span>',
      'Pesquisa de clima com link anônimo, leitura por área e por liderança, comentários e relatório pronto para a diretoria.',
      ['Questionário a partir de modelos', 'Link aberto e QR code', 'Respostas anônimas', 'eNPS e clima de 0 a 100', 'Mapa de calor por liderança', 'Exportação em PDF e planilha'],
      'atlas-clima', 'atlas/index.html#clima', [('ac-painel', 'left:-6%;top:8%;transform:rotate(-8deg)'), ('ac-liderancas', 'right:-8%;bottom:6%;transform:rotate(7deg)')])}
{prod('Atlas 360', 'Pessoas · disponível', 'Amplie a visão <span class="tom">sobre pessoas.</span>',
      'Avaliação 360 com matriz de quem avalia quem, autoavaliação comparada aos pares e devolutiva individual em PDF.',
      ['Matriz quem avalia quem', 'Avaliação pelo celular', 'Autoavaliação × pares', 'Comentários sem assinatura', 'Resultado só com 3+ avaliações', 'PDF por pessoa'],
      'atlas-360', 'atlas/index.html#atlas-360', [('a3-painel', 'left:-6%;top:8%;transform:rotate(-8deg)'), ('a3-pessoa', 'right:-8%;bottom:6%;transform:rotate(7deg)')])}
</div></section>

<section class="sec linha-topo" id="metodo"><div class="wrap">
  <div class="sec-cab"><span class="kick">(03) Como criamos</span><h2 class="h-l" data-palavras>IA acelera. <span class="tom">Pessoas dão direção.</span></h2></div>
  <div class="metodo">
    <div class="fixo"><div class="grande">01</div></div>
    <div>
      <div class="passo" data-reveal><span class="k">01 · Antes</span><h3>Visão de negócio</h3><p>Antes do código, a pergunta certa. Conectamos contexto, pessoas e objetivos para decidir o que realmente vale construir.</p>
        <div class="depara"><s>Uma lista de funcionalidades</s><span>→</span><b>Uma hipótese de valor para o negócio</b></div></div>
      <div class="passo" data-reveal><span class="k">02 · Durante</span><h3>Construção com IA</h3><p>Menos distância, mais possibilidades. A IA aproxima ideia, protótipo e produto, em ciclos curtos e com direção humana.</p>
        <div class="depara"><s>Etapas distantes entre ideia e teste</s><span>→</span><b>Construção e aprendizado conectados</b></div></div>
      <div class="passo" data-reveal><span class="k">03 · Decisão</span><h3>Critério humano</h3><p>A IA constrói junto. A decisão é humana: experiência, revisão e validação antes de uma solução entrar em uso.</p>
        <div class="depara"><s>Código como ponto de chegada</s><span>→</span><b>Uma experiência que faz sentido usar</b></div></div>
      <div class="passo" data-reveal><span class="k">04 · Sempre</span><h3>Evolução contínua</h3><p>O lançamento é um ponto de partida. Feedback e contexto alimentam novos ciclos, perto das necessidades do negócio.</p>
        <div class="depara"><s>Uma entrega que encerra o projeto</s><span>→</span><b>Um produto que continua aprendendo</b></div></div>
    </div>
  </div>
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab"><span class="kick">(04) O mercado</span><h2 class="h-l" data-palavras>Todo mundo fala de IA. <span class="tom">Poucos fazem dar certo.</span></h2></div>
  <div class="numeros">
    <div class="numero" data-reveal><b><span data-conta="88">0</span><small>%</small></b><p>das organizações já usam IA em alguma área. Só cerca de um terço escalou.</p><cite>McKinsey · State of AI 2025</cite></div>
    <div class="numero" data-reveal data-d=".1"><b><span data-conta="95">0</span><small>%</small></b><p>das organizações pesquisadas não viram retorno mensurável da IA generativa.</p><cite>MIT NANDA · GenAI Divide 2025</cite></div>
    <div class="numero" data-reveal data-d=".2"><b><span data-conta="472">0</span><small>mil</small></b><p>afastamentos por saúde mental no Brasil em 2024, o maior da série histórica.</p><cite>Ministério da Previdência · 2024</cite></div>
  </div>
</div></section>

<section class="sec linha-topo" id="fabrica"><div class="wrap">
  <div class="sec-cab"><span class="kick">(05) A fábrica de soluções</span><h2 class="h-l" data-palavras>Um desafio pode virar <span class="tom">o próximo produto.</span></h2>
    <p class="lead" data-reveal>Quando o desafio ainda não tem produto pronto, a NEXA constrói. Se a sua empresa se reconhece em algum destes sinais, a conversa já começou.</p></div>
  <div class="sinais">
    <a class="sinal" href="#contato" data-reveal><b>01</b><span>Um processo manual que se repete toda semana.</span>{SETA}</a>
    <a class="sinal" href="#contato" data-reveal><b>02</b><span>Dados espalhados em planilhas e sistemas que não conversam.</span>{SETA}</a>
    <a class="sinal" href="#contato" data-reveal><b>03</b><span>Uma ideia de produto digital parada no papel.</span>{SETA}</a>
    <a class="sinal" href="#contato" data-reveal><b>04</b><span>Nenhuma ferramenta pronta resolve do jeito que a empresa precisa.</span>{SETA}</a>
  </div>
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab"><span class="kick">Perguntas frequentes</span><h2 class="h-l" data-palavras>Antes de <span class="tom">conversar.</span></h2></div>
  <div class="faq" data-reveal>
    <details><summary>O que é a NEXA?<i></i></summary><div class="resp">Uma empresa de tecnologia com dois motores: produtos de prateleira (Sales Coach, Atlas Clima e Atlas 360) e uma fábrica que desenvolve software sob medida com IA.</div></details>
    <details><summary>Quanto tempo leva para começar a usar um produto?<i></i></summary><div class="resp">Os produtos já estão prontos. A implantação é configurar a empresa: o material, a metodologia de vendas ou o questionário e as pessoas. A conversa com o time comercial define o prazo do seu caso.</div></details>
    <details><summary>Como funciona a cobrança?<i></i></summary><div class="resp">O Sales Coach é cobrado por usuário ativo, com uma taxa de implantação única. Os planos estão na página do produto. O Atlas tem proposta conforme o tamanho da empresa.</div></details>
    <details><summary>A Fábrica constrói qualquer coisa?<i></i></summary><div class="resp">Construímos o que faz sentido para o negócio. A primeira etapa é justamente entender se vale construir, e o quê. Às vezes a resposta é um produto que já existe.</div></details>
    <details><summary>As respostas do Atlas são mesmo anônimas?<i></i></summary><div class="resp">No link aberto, ninguém se cadastra e o RH lê o conjunto. Áreas só aparecem com pelo menos 3 pessoas, e no 360 o resultado só abre a partir de 3 avaliações de pares.</div></details>
  </div>
</div></section>
''' + contato(B) + '</main>' + rodape(B) + fim(B)

open(os.path.join(RAIZ, 'index.html'), 'w', encoding='utf-8').write(html)
print('index.html', len(html))
