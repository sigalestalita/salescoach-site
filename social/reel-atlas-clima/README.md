# Reel Atlas Clima (9:16, 44,5s)

Walkthrough do produto com cursor e toques. As telas são recriadas a partir
do app real (repositório `atlas-grou`): mesmos textos, tema (Poppins, navy
#071A34, primária #15498D, gradientes dos cartões, escala de cores do clima)
e o monograma oficial do Atlas (`AtlasMark.tsx`). Os dados são de
demonstração; nenhum nome real de cliente.

| # | Tempo | Tela real que aparece |
|---|---|---|
| 0 | 0–3s | Abertura: "O clima da sua empresa, medido sem ruído." |
| 1 | 3–8,6s | Pesquisa: "Nova a partir de template…", categorias, "Repetir esta categoria para cada líder avaliado", rodada |
| 2 | 8,6–12,8s | Links: link aberto, "Copiar", QR code |
| 3 | 12,8–19,4s | Tela do colaborador: escala de 1 a 5, eNPS de 0 a 10, "Pronto. Obrigado!" |
| 4 | 19,4–27,4s | Dashboard: anel do clima (74, Saudável), Participação, eNPS, melhor resultado, ponto de atenção, "Onde agir primeiro", "Clima por área" |
| 5 | 27,4–33,2s | Lideranças: "Mapa de calor por categoria" e "Perfil comparado" |
| 6 | 33,2–37,8s | Comentários: busca e filtro "Notas baixas" |
| 7 | 37,8–41s | Exportar Relatório → PDF |
| 8 | 41–44,5s | Fecho |

`motor.js` e `kit.css` são comuns aos dois reels do Atlas. `trilha.py` lê
cenas, cliques e efeitos (`SONS`) do próprio `index.html`.
