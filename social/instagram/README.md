# Posts 4:5 para Instagram

Vinte posts no formato 4:5 (1080 × 1350), escritos a partir do conteúdo, da
identidade visual e do foco de negócio do `index.html` deste repositório.
Nenhum deles traz botão de CTA nem oferta de teste — a chamada é o endereço
no alto da arte.

**Desdobrada (01–05)** — o argumento inteiro dentro do post:

| # | Arquivo | Tema | Fundo · composição |
|---|---|---|---|
| 01 | `01-toda-reuniao-vira-metodo.html` | Posicionamento: toda reunião vira método | halo · centrado |
| 02 | `02-o-que-sobra-da-reuniao.html` | A mesma reunião, de memória × analisada | malha · à esquerda |
| 03 | `03-quatro-momentos.html` | Antes, durante, depois e sempre | claro · à esquerda |
| 04 | `04-coach-ao-vivo.html` | Coach ao vivo dentro do Meet/Teams | azul profundo · à esquerda |
| 05 | `05-planos.html` | Planos por usuário ativo | claro · centrado |

**Manchete (06–10)** — título gigante, apoio em duas linhas:

| # | Arquivo | Tema | Fundo · composição |
|---|---|---|---|
| 06 | `06-nunca-ouviu.html` | "Você nunca ouviu 99% das reuniões do seu time." | marca · à esquerda |
| 07 | `07-reuniao-boa.html` | "Reunião boa." — o que sobra de uma hora | noite · centrado |
| 08 | `08-cinco-segundos.html` | 5 segundos entre a objeção e a resposta | halo · centrado |
| 09 | `09-melhor-vendedor.html` | "O seu melhor vendedor sai. O método dele fica." | azul profundo · à direita |
| 10 | `10-dezenove-e-noventa.html` | R$ 19,90 por vendedor/mês | marca · centrado |

**Tela (11–20)** — o print do sistema é o assunto:

| # | Arquivo | Tela | Fundo · composição |
|---|---|---|---|
| 11 | `11-a-reuniao-inteira.html` | `analise.webp` — score, temperatura, BANT e MEDDIC | malha · print em cima |
| 12 | `12-fale-agora.html` | `extensao.webp` — painel do coach ao vivo | azul profundo · duas colunas |
| 13 | `13-o-time-inteiro.html` | `dashboard.webp` — painel do gestor | claro · print no pé |
| 14 | `14-cliente-que-nao-existe.html` | `treino-voz.webp` — treino por chamada | noite · print no pé |
| 15 | `15-tirou-55.html` | `treino-nota.webp` — nota do treino | azul profundo · print no pé |
| 16 | `16-pergunte.html` | `assistente.webp` — assistente de vendas | marca · duas colunas |
| 17 | `17-ate-voce-ensinar.html` | `conhecimento.webp` — base de conhecimento | claro · print em cima |
| 18 | `18-o-que-faltou.html` | `insights.webp` — o que foi bem, o que faltou | halo · centrado |
| 19 | `19-todas-as-agendas.html` | `agendas.webp` — agendas com nota | noite · print no pé |
| 20 | `20-ja-testamos.html` | `treino-conversa.webp` — objeção de adoção | malha · à direita |

## Fundos e composições

A variação é feita por classe no `<div class="post">`, com tudo definido em
`post.css`. Num feed em grade, vinte posts iguais viram uma mancha só.

**Fundos** — `bg-night` (padrão, não precisa de classe), `bg-grid` (malha
azul com clarão), `bg-deep` (azul da marca subindo do pé), `bg-brand`
(chapado no azul), `bg-light` (claro, com a paleta invertida) e `bg-halo`
(um halo único atrás do miolo). O `bg-light` troca as variáveis de cor e
pede a marca escura: `assets/mark.png` no lugar de `mark-white.png`.

**Composições** — sem classe o post alinha à esquerda; `center` e `right`
mudam o eixo, `bottom` ancora o visual no pé do quadro, e `split` abre duas
colunas (texto de um lado, print vertical do outro, via `--split`). Para
pôr o print acima do título, basta trocar a ordem dos blocos no HTML.
As legendas sugeridas, com ordem de publicação e hashtags, estão em
[`legendas.md`](legendas.md).

## Gerar os PNGs

Os posts são HTML — o PNG sai de um screenshot do quadro `.post`:

```sh
npm i -g playwright      # uma vez; o Chromium já vem no ambiente
node render.mjs          # todos
node render.mjs 02 14    # só alguns
```

Os arquivos caem em `out/`, prontos para subir (1080 × 1350, RGB). O script
também gera `out/_grade.png`, uma folha de contato com todos numa grade de
cinco colunas — é nela que se vê se os fundos e as composições estão mesmo
variando.
O script avisa quando o conteúdo estoura o quadro — o corte não aparece
sozinho no PNG, então esse aviso nunca deve ser ignorado.

## Editar

- Textos e layout de cada post: no próprio `.html`.
- Cores, tipografia, cartões, pílulas e molduras: `post.css`, que repete os
  tokens do `index.html` (`--ink-0`, `--blue`, `--violet`, Poppins…).
- A Poppins fica em `fonts/` e é declarada em `poppins.css`: o render precisa
  ser igual toda vez, então a fonte não vem do Google Fonts na hora.
- O quadro é fixo em 1080 × 1350. Ao acrescentar texto, tire de outro lugar.

### Recortar um print (série tela)

As telas do produto são largas demais para caber legíveis em 924px, então a
moldura mostra só uma fatia. Para trocar o recorte, escolha a região
`[x0..x1, y0..y1]` no arquivo original e calcule:

```
s     = 924 / (x1 - x0)      # escala
.win            height:  (y1 - y0) * s
.win img        width:   largura_original * s
                margin:  (-y0 * s) 0 0 (-x0 * s)
```

Uma altura de janela entre 400 e 650px costuma deixar o print com o peso
certo no quadro. Prints estreitos, de tela de celular (`assistente.webp`,
`extensao.webp`), ficam melhor com a moldura mais estreita que o quadro —
esticados até 924px o texto fica grande demais.
