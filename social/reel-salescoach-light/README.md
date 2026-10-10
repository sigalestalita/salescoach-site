# Vídeo Sales Coach · light (16:9, 22s)

Inspirado na referência de "UI flutuante sobre fundo líquido": clean, minimalista,
na **identidade light da NEXA** (osso `#f3f4ee`, tinta `#10120e`, lima `#d4f969`,
oliva `#587406`). O azul-marinho aparece só dentro do produto.

| Tempo | Cena |
|---|---|
| 0–3,5s | Integrações em órbita ao redor da marca |
| 3,1–7,1s | Notebook com o Sales Coach; clique em "Ver uma reunião" e mergulho na tela |
| 6,7–11,4s | **Ao vivo**: o Coach IA marca a objeção e entrega a dica "fale agora" |
| 11–15,4s | **Análise e gestão**: nota 86 e evolução do time cruzando a meta |
| 15–19,2s | **Camadas** treino → ao vivo → análise → CRM, envio ao HubSpot |
| 18,8–22s | Fecho com a marca e "Cada reunião vira método." |

Fundo líquido em WebGL (shader em `index.html`), cursores com nome (Você, Coach IA, Gestor).
`trilha.py` lê cliques e sons do `index.html`. Render:
`node render.mjs seq 0 660 frames/` (W/H por variável de ambiente; padrão 1920×1080) e ffmpeg com `trilha.wav`.
