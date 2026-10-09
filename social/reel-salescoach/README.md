# Reel Sales Coach (9:16, 44,5s)

Walkthrough do produto em motion, com cursor e cliques. A interface é
recriada em HTML a partir das telas reais (`assets/app/*.webp`), para animar
com nitidez. `index.html?play` toca em tempo real num servidor local.

| # | Tempo | Funcionalidade |
|---|---|---|
| 0 | 0–3,2s | Abertura: "Cada reunião vira método." |
| 1 | 3,2–10,4s | **Treino**: escolhe o cliente simulado, fala pelo microfone, encerra e recebe nota e critérios |
| 2 | 10,4–17,6s | **Ao vivo**: extensão no Meet, transcrição e dicas "fale agora" na objeção |
| 3 | 17,6–25,4s | **Análise**: score 91, temperatura, talk ratio, BANT e envio ao CRM |
| 4 | 25,4–31,6s | **Assistente**: pergunta digitada e resposta com as agendas mais quentes |
| 5 | 31,6–37s | **Gestão**: indicadores, evolução dos scores e agendas |
| 6 | 37–41s | **Base de conhecimento** e **integrações** |
| 7 | 41–44,5s | Fecho com CTA |

`trilha.py` gera a trilha e lê os cliques do cursor do próprio `index.html`,
então mudar um clique de lugar move o som junto.

Render: `node render.mjs seq 0 1335 frames/` (30 fps) e depois ffmpeg com
`trilha.wav`.
