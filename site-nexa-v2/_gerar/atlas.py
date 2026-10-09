"""Gera atlas/index.html (Atlas Clima + Atlas 360)."""
import os
from partes import head, topo, contato, rodape, fim, SETA

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = '../'
ON = ' class="on"'
FONE = ' style="object-fit:contain;background:#0f110e"'

def narrativa(passos):
    txt = ''.join(f'''<div><span class="kick lime">{k}</span><h3>{t}</h3><p>{p}</p><ul>{''.join(f'<li>{x}</li>' for x in li)}</ul>
  <img class="n-mobile{' fone-m' if fone else ''}" src="{B}assets/telas/{img}.webp" alt="" loading="lazy"></div>''' for img, fone, k, t, p, li in passos)
    ims = ''.join(f'<img src="{B}assets/telas/{img}.webp" alt=""{ON if n == 0 else ""}{FONE if fone else ""} loading="lazy">' for n, (img, fone, *_r) in enumerate(passos))
    return f'<div class="narrativa"><div class="passos-n">{txt}</div><div class="tela-fixa"><div class="moldura">{ims}</div><div class="marcador">{"<i></i>" * len(passos)}</div></div></div>'

CLIMA = [
    ('ac-montar', 0, '01 · Monte', 'Questionário pronto <span class="tom">em minutos.</span>',
     'Comece de um modelo, ajuste categorias e perguntas e defina a rodada e o prazo. Uma categoria pode se repetir para cada liderança avaliada.',
     ['Modelos de questionário reaproveitáveis', 'Escalas de concordância, frequência e satisfação', 'eNPS e perguntas abertas']),
    ('ac-links', 0, '02 · Envie', 'Um link. <span class="tom">Respostas anônimas.</span>',
     'Um endereço só para toda a empresa, com QR code para imprimir ou projetar. Cada pessoa responde de forma anônima, sem cadastro. Se preferir, cada pessoa ganha um link único.',
     ['Link aberto e QR code', 'Links individuais por colaborador', 'Acompanhamento de quem já respondeu, sem ver respostas']),
    ('ac-responder', 1, '03 · Responda', 'Quatro minutos, <span class="tom">pelo celular.</span>',
     'Uma pergunta por vez, com a escala em cartões grandes e o progresso no topo. A tela diz o tempo todo que as respostas são anônimas.',
     ['Escala de 1 a 5 com rótulos claros', 'eNPS de 0 a 10', '"Nada disso fica ligado ao seu nome"']),
    ('ac-painel', 0, '04 · Leia', 'O clima inteiro <span class="tom">num painel.</span>',
     'Clima de 0 a 100 com faixa (de crítico a muito saudável), participação, eNPS, o melhor resultado e o ponto de atenção. E onde agir primeiro.',
     ['Clima geral e por pergunta', '"Onde agir primeiro" e "o que sustenta o clima"', 'Clima por área, com pelo menos 3 pessoas']),
    ('ac-liderancas', 0, '05 · Lideranças', 'Cada liderança, <span class="tom">em perspectiva.</span>',
     'Mapa de calor de cada categoria por liderança e o perfil comparado entre líderes. A conversa começa pelo que os números mostram.',
     ['Mapa de calor por categoria', 'Comparativo pergunta a pergunta', 'Perfil comparado em radar']),
    ('ac-relatorio', 0, '06 · Comentários e relatório', 'O que as pessoas escreveram, <span class="tom">pronto para a diretoria.</span>',
     'Busca nos comentários, filtro por notas baixas ou altas e exportação em PDF ou planilha com os dados por trás de cada número. O relatório também pode ser compartilhado com código de acesso.',
     ['Comentários com busca e filtros', 'Relatório em PDF e planilha', 'Relatório público protegido por código']),
]
TREZE = [
    ('a3-matriz', 0, '01 · Monte', 'Defina <span class="tom">quem avalia quem.</span>',
     'Adicione as pessoas avaliadas e marque, numa matriz, quem avalia cada uma. Colaboradores e lideranças são importados automaticamente.',
     ['Matriz avaliador × avaliado', '"Todos" ou "Nenhum" por coluna', 'Contagem de atribuições em tempo real']),
    ('a3-avaliar', 1, '02 · Avalie', 'Cada pessoa avalia <span class="tom">pelo celular.</span>',
     'O avaliador vê "Avaliando Fernanda Lima", responde a escala e escreve com as próprias palavras. A autoavaliação segue o mesmo caminho.',
     ['Escala e perguntas abertas', 'Autoavaliação na mesma rodada', 'Confirmação antes de enviar']),
    ('a3-painel', 0, '03 · Compare', 'Como se vê × <span class="tom">como é vista.</span>',
     'Para cada pessoa: a média dos pares, a autoavaliação e a diferença entre as duas, com a leitura "se vê acima", "se vê abaixo" ou "leitura alinhada".',
     ['Participação e média da diretoria', 'Maior distância entre autoavaliação e pares', 'Resultado só com 3 ou mais avaliações de pares']),
    ('a3-pessoa', 0, '04 · Entenda', 'O que os pares dizem, <span class="tom">sem assinatura.</span>',
     'Abra a pessoa e leia como ela se vê e o que os pares escreveram, agrupado por pergunta. Abaixo de 3 avaliações, nada aparece: ficaria fácil deduzir quem escreveu.',
     ['"Como ela se vê" ao lado dos pares', 'Comentários agrupados por pergunta', 'Rodada identificada só para a coordenação, se quiser']),
    ('a3-pdf', 0, '05 · Devolva', 'Um PDF por pessoa, <span class="tom">pronto para a conversa.</span>',
     'A devolutiva sai em PDF individual com a média dos pares, a autoavaliação, a diferença e os comentários, sempre sem os nomes de quem escreveu.',
     ['PDF por pessoa ou todos de uma vez', 'Sem identificação de quem avaliou', 'Pronto para o um a um']),
]

html = head('Atlas · NEXA', 'Atlas Clima e Atlas 360: pesquisa de clima com respostas anônimas e avaliação 360 com autoavaliação comparada aos pares.', B) + topo(B, 'atlas') + f'''
<main>
<section><div class="wrap p-hero">
  <div class="txt">
    <div style="display:flex;align-items:center;gap:14px" data-reveal><img src="{B}assets/logos/atlas.svg" alt="" style="height:40px;filter:drop-shadow(0 0 18px rgba(212,249,105,.4))"><span class="kick">Atlas · um produto NEXA</span></div>
    <h1 class="h-xl" data-palavras>Escute sua organização. <br><span class="tom">Amplie a visão sobre pessoas.</span></h1>
    <p class="lead" data-reveal data-d=".4">Dois módulos na mesma plataforma: o <b>Atlas Clima</b>, pesquisa de clima com respostas anônimas e leitura por área e liderança, e o <b>Atlas 360</b>, avaliação com autoavaliação comparada aos pares.</p>
    <div data-reveal data-d=".55"><div class="alterna" data-grupo="hero" id="alt-hero"><i class="bola"></i><button class="on" data-v="clima">Atlas Clima</button><button data-v="360">Atlas 360</button></div></div>
    <div class="pills" data-reveal data-d=".7"><a class="pill lime" href="#contato">Agendar demonstração {SETA}</a><a class="pill" href="#videos">Ver os vídeos</a></div>
  </div>
  <div class="palco">
    <div class="orbita-telas" id="orb-clima">
      <img src="{B}assets/telas/ac-painel.webp" alt="" data-z="1.4" data-r="-9" style="left:0;top:4%">
      <img src="{B}assets/telas/ac-liderancas.webp" alt="" data-z="2" data-r="8" style="right:0;top:12%">
      <img src="{B}assets/telas/ac-areas.webp" alt="" data-z=".8" data-r="6" style="left:4%;bottom:6%">
      <img src="{B}assets/telas/ac-comentarios.webp" alt="" data-z="1.7" data-r="-7" style="right:2%;bottom:2%">
    </div>
    <div class="fone"><video id="v-hero" data-atual="atlas-clima" data-auto muted loop playsinline preload="metadata" poster="{B}assets/media/atlas-clima.jpg"><source src="{B}assets/media/atlas-clima.mp4" type="video/mp4"></video></div>
  </div>
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab"><span class="kick">Por que agora</span><h2 class="h-l" data-palavras>O sinal aparece antes. <span class="tom">Para quem escuta.</span></h2></div>
  <div class="numeros" style="grid-template-columns:1fr 2fr">
    <div class="numero" data-reveal><b><span data-conta="472">0</span><small>mil</small></b><p>afastamentos do trabalho por saúde mental no Brasil em 2024, alta de 68% sobre o ano anterior.</p><cite>Ministério da Previdência Social</cite></div>
    <div class="numero" data-reveal data-d=".1"><p style="font-family:var(--display);font-weight:300;font-size:clamp(24px,2.4vw,34px);letter-spacing:-.025em;color:var(--txt);line-height:1.25;margin:0">Com a NR-1 atualizada, os riscos psicossociais passaram a fazer parte do gerenciamento de riscos ocupacionais. O Atlas Clima ajuda o RH a escutar as pessoas e acompanhar o tema por área e por liderança.</p>
      <p>Ele não substitui o programa de gerenciamento de riscos nem a avaliação técnica de saúde e segurança do trabalho: dá ao RH a escuta que alimenta esse trabalho.</p></div>
  </div>
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab centro"><span class="kick">Experimente</span><h2 class="h-l" data-palavras>Responda como <span class="tom">um colaborador.</span></h2>
    <p class="lead" data-reveal>É assim que a pergunta aparece no celular de quem responde, e assim que o resultado chega ao RH. Toque numa resposta.</p></div>
  <div class="demo">
    <div class="caixa" data-reveal><span style="font-size:13px;letter-spacing:.14em;color:#64708a;text-transform:uppercase">Comunicação · 5/12</span>
      <div class="q">Recebo as informações de que preciso para fazer bem o meu trabalho.</div>
      <div class="lk" id="demo-likert"><button><b>1</b>Discordo totalmente</button><button><b>2</b>Discordo em parte</button><button><b>3</b>Neutro</button><button><b>4</b>Concordo em parte</button><button><b>5</b>Concordo totalmente</button></div></div>
    <div class="caixa esc" data-reveal data-d=".1"><span class="kick lime">O que o RH vê</span><div class="enps-v"><span id="res-media">0</span><small style="font-size:24px;color:var(--dim)"> de 5</small></div>
      <div class="res-barras" id="res-likert">
        <div class="rb"><span>Concordo totalmente</span><div class="t"><i></i></div><b></b></div><div class="rb"><span>Concordo em parte</span><div class="t"><i></i></div><b></b></div>
        <div class="rb"><span>Neutro</span><div class="t"><i></i></div><b></b></div><div class="rb"><span>Discordo em parte</span><div class="t"><i></i></div><b></b></div><div class="rb"><span>Discordo totalmente</span><div class="t"><i></i></div><b></b></div></div>
      <p style="color:var(--dim2);font-size:13px;margin-top:16px">Exemplo ilustrativo. Sua resposta entra no conjunto, sem nome.</p></div>
    <div class="caixa" data-reveal><span style="font-size:13px;letter-spacing:.14em;color:#64708a;text-transform:uppercase">eNPS · 12/12</span>
      <div class="q">De 0 a 10, o quanto você recomendaria a empresa como um bom lugar para trabalhar?</div><div class="np" id="demo-enps"></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#64708a;margin-top:10px"><span>Nada provável</span><span>Extremamente provável</span></div></div>
    <div class="caixa esc" data-reveal data-d=".1"><span class="kick lime">eNPS da empresa</span><div class="enps-v" id="enps-v">0</div><div style="font-size:20px;margin-top:6px" id="enps-f"></div><p style="color:var(--dim)" id="enps-p"></p>
      <p style="color:var(--dim2);font-size:13px;margin-top:16px">Promotores (9 e 10) menos detratores (0 a 6). Exemplo ilustrativo.</p></div>
  </div>
</div></section>

<section class="sec linha-topo" id="clima"><div class="wrap">
  <div class="sec-cab"><span class="kick lime">Atlas Clima</span><h2 class="h-l" data-palavras>Do questionário <span class="tom">à conversa certa.</span></h2></div>
  {narrativa(CLIMA)}
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab"><span class="kick">Cuidado com quem responde</span><h2 class="h-l" data-palavras>Anonimato <span class="tom">por desenho.</span></h2></div>
  <div class="regras">
    <div class="regra" data-reveal><b>0</b><h4>cadastros no link aberto</h4><p>Quem responde não se identifica. O RH lê o conjunto, nunca a resposta de uma pessoa.</p></div>
    <div class="regra" data-reveal data-d=".1"><b>3+</b><h4>pessoas por área</h4><p>Uma área só aparece no painel com pelo menos 3 respostas, para ninguém ser reconhecido pelo recorte.</p></div>
    <div class="regra" data-reveal data-d=".2"><b>3+</b><h4>avaliações de pares no 360</h4><p>Abaixo disso, o resultado da pessoa avaliada não abre. E o PDF dela sai sempre sem os nomes de quem escreveu.</p></div>
  </div>
</div></section>

<section class="sec linha-topo" id="atlas-360"><div class="wrap">
  <div class="sec-cab"><span class="kick lime">Atlas 360</span><h2 class="h-l" data-palavras>Feedback que <span class="tom">vira caminho.</span></h2>
    <p class="lead" data-reveal>A mesma pessoa vista por ela mesma e pelos pares. A distância entre os dois olhares é onde a conversa de desenvolvimento começa.</p></div>
  {narrativa(TREZE)}
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab centro"><span class="kick">Experimente</span><h2 class="h-l" data-palavras>Se vê acima, abaixo <span class="tom">ou alinhada?</span></h2>
    <p class="lead" data-reveal>Mexa na autoavaliação e na média dos pares. O Atlas 360 usa a mesma régua para ler a diferença.</p></div>
  <div class="demo" id="demo-gap">
    <div class="caixa esc gap-demo" data-reveal><span class="kick">Autoavaliação · <b id="gap-sv"></b></span><input type="range" id="gap-self" min="1" max="5" step="1" value="5"><div class="lbls"><span>1</span><span>5</span></div>
      <span class="kick" style="display:block;margin-top:26px">Média dos pares · <b id="gap-pv"></b></span><input type="range" id="gap-pares" min="1" max="5" step="0.05" value="3.6"><div class="lbls"><span>1</span><span>5</span></div></div>
    <div class="caixa esc" data-reveal data-d=".1"><span class="kick lime">Leitura</span><div class="gap-res"><b id="gap-v"></b><span id="gap-l" style="font-size:22px"></span></div>
      <p style="color:var(--dim);margin-top:18px">Quem se vê acima do que os pares veem tende a não buscar ajuda; quem se vê abaixo costuma estar sendo duro demais consigo. Perto de zero é a leitura alinhada, que é o resultado saudável.</p></div>
  </div>
</div></section>

<section class="sec linha-topo" id="videos"><div class="wrap">
  <div class="sec-cab centro"><span class="kick">Em 45 segundos</span><h2 class="h-l" data-palavras>Veja o Atlas <span class="tom">funcionando.</span></h2></div>
  <div class="videos">
    <div class="video-card" data-reveal><div class="fone"><video data-manual="1" playsinline preload="none" poster="{B}assets/media/atlas-clima.jpg"><source src="{B}assets/media/atlas-clima.mp4" type="video/mp4"></video><span class="play"><i><svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg></i></span></div><span class="kick">Atlas Clima</span></div>
    <div class="video-card" data-reveal data-d=".1"><div class="fone"><video data-manual="1" playsinline preload="none" poster="{B}assets/media/atlas-360.jpg"><source src="{B}assets/media/atlas-360.mp4" type="video/mp4"></video><span class="play"><i><svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg></i></span></div><span class="kick">Atlas 360</span></div>
  </div>
</div></section>

<section class="sec linha-topo"><div class="wrap">
  <div class="sec-cab"><span class="kick">Perguntas frequentes</span><h2 class="h-l" data-palavras>Antes de <span class="tom">começar.</span></h2></div>
  <div class="faq" data-reveal>
    <details><summary>As respostas são mesmo anônimas?<i></i></summary><div class="resp">No link aberto, ninguém se cadastra. O painel mostra o conjunto, áreas só aparecem com pelo menos 3 pessoas, e os comentários chegam sem nome.</div></details>
    <details><summary>O Atlas atende à NR-1?<i></i></summary><div class="resp">O Atlas Clima ajuda o RH a escutar as pessoas e acompanhar os riscos psicossociais por área e liderança. Ele não substitui o programa de gerenciamento de riscos nem a avaliação técnica de saúde e segurança do trabalho.</div></details>
    <details><summary>No 360, a pessoa avaliada sabe quem escreveu?<i></i></summary><div class="resp">Não. O PDF da pessoa avaliada sai sempre sem os nomes. A rodada pode ser identificada para a coordenação conduzir o processo, e quem responde é avisado disso antes.</div></details>
    <details><summary>Dá para usar Clima e 360 juntos?<i></i></summary><div class="resp">Sim. Os dois módulos ficam na mesma plataforma, com as mesmas pessoas e lideranças cadastradas.</div></details>
  </div>
</div></section>
''' + contato(B, 'Escutar é o primeiro <span class="tom">passo para cuidar.</span>') + '''</main>
<script>
// Troca o vídeo e as telas do hero entre Clima e 360.
document.getElementById('alt-hero').addEventListener('troca', e => {
  const v = document.getElementById('v-hero'), n = e.detail === '360' ? 'atlas-360' : 'atlas-clima';
  if (v.dataset.atual === n) return; v.dataset.atual = n;
  v.poster = '../assets/media/' + n + '.jpg'; v.querySelector('source').src = '../assets/media/' + n + '.mp4'; v.load(); v.play().catch(() => {});
  const ims = document.querySelectorAll('#orb-clima img'), lista = e.detail === '360' ? ['a3-painel', 'a3-pessoa', 'a3-matriz', 'a3-pdf'] : ['ac-painel', 'ac-liderancas', 'ac-areas', 'ac-comentarios'];
  ims.forEach((im, i) => { im.style.opacity = 0; setTimeout(() => { im.src = '../assets/telas/' + lista[i] + '.webp'; im.style.opacity = 1; }, 250); });
});
</script>''' + rodape(B) + fim(B)

open(os.path.join(RAIZ, 'atlas', 'index.html'), 'w', encoding='utf-8').write(html)
print('atlas/index.html', len(html))
