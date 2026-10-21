# Vídeo de lançamento · Sales Coach no Sales Sprint (16:9, 44s)

Lançamento oficial do Sales Coach no Sales Sprint, evento da parceira Sales Rocket.
Identidade light da NEXA (osso, tinta, lima e oliva), minimalista; o azul do produto aparece
só dentro das telas. Layout horizontal: título do capítulo à esquerda, produto à direita.
`vertical-escuro.html` é a primeira versão (9:16, escura), guardada como alternativa
(render com `PAGE=vertical-escuro.html W=1080 H=1920`). Telas redesenhadas em
HTML, com dados de demonstração (dito no rodapé).

| Tempo | Cena | O que mostra |
|---|---|---|
| 0–4,2s | Gancho | 412 reuniões no mês, o gestor ouviu 3. "O resto vira achismo no CRM." |
| 4,2–7,6s | Revelação | As 412 acendem e viram a marca: "Um coach em cada reunião do seu time." |
| 7,6–11,8s | 01 Gravação | Agenda sincronizada, gravação no Meet/Teams/Zoom pela extensão, sem robô na chamada |
| 11,8–17s | 02 Coach ao vivo | Objeção de preço detectada, dica "fale agora", BANT marcando |
| 17–21,8s | 03 Análise | Nota 86, critérios, metodologia (BANT, MEDDIC, SPIN ou a da empresa), próximo passo |
| 21,8–26s | 04 CRM | Campos preenchidos sozinhos; HubSpot, RD Station, Pipedrive e Kommo |
| 26–30,4s | 05 Treino | Cliente simulado por voz, evolução 62 → 81 |
| 30,4–34,4s | 06 Argumentos | Retorno, resposta à objeção e frase pronta para o lead |
| 34,4–38,8s | 07 Gestão | Nota do time cruzando a meta e o assistente respondendo |
| 38,8–44s | Fecho | "412 de 412 reuniões ouvidas", "Cada reunião vira método.", marca e Sales Sprint |

## Gerar
```bash
python3 trilha.py                          # trilha.wav, lida da linha do tempo (<script id="tl">)
node render.mjs seq 0 1320 frames          # 30 fps; dá para dividir em faixas e rodar em paralelo
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
$FF -y -framerate 30 -i frames/f_%05d.jpg -i trilha.wav -c:v libx264 -pix_fmt yuv420p -crf 17 -preset slow \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/lancamento-sales-coach-sales-sprint.mp4
```
`node render.mjs still 9.8,14.8 stills` gera quadros soltos; `index.html?play` toca no navegador.
