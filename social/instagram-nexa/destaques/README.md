# Destaques do perfil

Nove capas e cinquenta e quatro stories (seis destaques do Sales Coach,
dois do Atlas e um da Fábrica de soluções), todos em 1080 × 1920, no mesmo kit
visual dos posts (`../post.css`). O roteiro de cada destaque — títulos,
ordem e o que cada story diz — está em [`roteiro.md`](roteiro.md).

## Gerar os PNGs

```sh
node stories.mjs          # capas e stories
node stories.mjs c        # só as capas
node stories.mjs d3       # só um destaque
```

Saem em `out/`. O script avisa quando o conteúdo estoura o quadro.

## Estrutura

- `c1…c9-*.html` — capas: medalhão com o logo do produto no centro e o ponto
  lima da NEXA, com o ícone do tema, na borda. Sem palavra — no perfil o
  círculo aparece com uns 60px e o nome do destaque vem do próprio Instagram.
  O "A" do Atlas está redesenhado em SVG (o logo original só existe em baixa
  resolução); o "S" do Sales Coach vem de `assets/mark-white.png`.
- `d1…d9-NN-*.html` — os stories, na ordem de publicação. O `d5-03` traz a
  conversa desenhada em HTML: a tela real do assistente mostra outra pergunta.
  Os gráficos do Atlas (`d7-04`, `d8-04`) também são HTML e vêm marcados
  como exemplo ilustrativo.
- `destaque.css` — importa o kit dos posts e acrescenta o que o formato
  vertical exige: o quadro de 1920 e **190px de folga em cima e 210px
  embaixo**, que é onde a interface do Instagram passa por cima.

## Editar

Textos e layout ficam no próprio `.html`. Para refazer a série inteira de uma
vez, o gerador que escreveu esses arquivos está no histórico do commit que os
criou — mas depois de gerados eles são autônomos, e editar o HTML direto é o
caminho normal.

As cores, a tipografia, os fundos (`bg-light`, `bg-deep`, `bg-brand`,
`bg-grid`, `bg-halo`) e as molduras de print vêm todos do `../post.css`.
