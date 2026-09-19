# Posts 4:5 para Instagram

Cinco posts no formato 4:5 (1080 × 1350), escritos a partir do conteúdo, da
identidade visual e do foco de negócio do `index.html` deste repositório.

| # | Arquivo | Tema |
|---|---|---|
| 01 | `01-toda-reuniao-vira-metodo.html` | Posicionamento: toda reunião vira método |
| 02 | `02-o-que-sobra-da-reuniao.html` | O problema: a mesma reunião, de memória × analisada |
| 03 | `03-quatro-momentos.html` | O produto: antes, durante, depois e sempre |
| 04 | `04-coach-ao-vivo.html` | Coach ao vivo dentro do Meet/Teams |
| 05 | `05-planos-e-free-trial.html` | Planos por usuário ativo e free trial |

Série "manchete" — título gigante, apoio em duas linhas, nada mais:

| # | Arquivo | Tema |
|---|---|---|
| 06 | `06-nunca-ouviu.html` | "Você nunca ouviu 99% das reuniões do seu time." |
| 07 | `07-reuniao-boa.html` | "Reunião boa." — o que sobra de uma hora |
| 08 | `08-cinco-segundos.html` | 5 segundos entre a objeção e a resposta |
| 09 | `09-melhor-vendedor.html` | "O seu melhor vendedor sai. O método dele fica." |
| 10 | `10-dezenove-e-noventa.html` | R$ 19,90 por vendedor/mês |

As legendas sugeridas, com ordem de publicação e hashtags, estão em
[`legendas.md`](legendas.md).

## Gerar os PNGs

Os posts são HTML — o PNG sai de um screenshot do quadro `.post`:

```sh
npm i -g playwright      # uma vez; o Chromium já vem no ambiente
node render.mjs          # todos
node render.mjs 02 04    # só alguns
```

Os arquivos caem em `out/`, prontos para subir (1080 × 1350, RGB).
O script avisa quando o conteúdo estoura o quadro — o corte não aparece
sozinho no PNG, então esse aviso nunca deve ser ignorado.

## Editar

- Textos e layout de cada post: no próprio `.html`.
- Cores, tipografia, cartões, pílulas e botões: `post.css`, que repete os
  tokens do `index.html` (`--ink-0`, `--blue`, `--violet`, Poppins…).
- A Poppins fica em `fonts/` e é declarada em `poppins.css`: o render precisa
  ser igual toda vez, então a fonte não vem do Google Fonts na hora.
- O quadro é fixo em 1080 × 1350. Ao acrescentar texto, tire de outro lugar.
- A série manchete (06–10) usa `.h0`, `.after` e `.grow.top` do `post.css`:
  marca no topo, bloco centrado no miolo, botão no pé.
