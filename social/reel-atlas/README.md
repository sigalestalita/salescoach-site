# Reel Atlas Clima (9:16, 40s)

`index.html` é a linha do tempo inteira, determinística: o render chama
`window.renderAt(t)` quadro a quadro. Abra `index.html?play` num servidor
local para assistir em tempo real.

## Cenas
| # | Tempo | Conteúdo |
|---|---|---|
| 1 | 0–3,4s | Pulso (ECG que se acalma) + "Como sua equipe está, de verdade?" |
| 2 | 3,4–7,6s | **Pessoa 1** · "Cansaço que ninguém vê." |
| 3 | 7,6–12,8s | 472 mil afastamentos por saúde mental (2024), +68% · Previdência Social |
| 4 | 12,8–16,8s | **Pessoa 2** · "O sinal aparece antes. Para quem escuta." |
| 5 | 16,8–22s | NR-1 · riscos psicossociais no gerenciamento de riscos |
| 6 | 22–27,6s | "Formulário solto não basta" → heatmap do Atlas (ilustrativo) |
| 7 | 27,6–31,4s | **Pessoa 3** · "Escutar. Entender. Agir." |
| 8 | 31,4–35s | **Pessoa 4** · "Cuidar das pessoas também é estratégia." |
| 9 | 35–40s | Fecho: Atlas Clima, CTA, nexatech.ia.br |

## Pessoas (Higgsfield)
Cada clipe vira uma sequência de quadros em `pessoas/pN/0001.jpg…` e é
registrado em `pessoas/manifest.js`:
`window.PESSOAS = { p1: { n: 120, fps: 24 }, ... }`.
Sem isso, a cena mostra um fundo provisório.

Plano de créditos: gerar primeiro 4 imagens (baratas), aprovar, e só então
animar as 4 aprovadas (4 vídeos de ~5s). Nada de gerar variações em vídeo.

Chave: variáveis de ambiente `HIGGSFIELD_API_KEY` e `HIGGSFIELD_API_SECRET`
no ambiente da sessão. Nunca no repositório.

## Render
`node render.mjs still 1.5,10.5 pasta/` para conferir quadros;
`node render.mjs seq 0 1200 frames/` para os 1200 quadros (30 fps).
