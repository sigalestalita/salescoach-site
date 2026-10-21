# Vídeo de lançamento · Sales Coach no Sales Sprint (16:9, 63s, versão impacto)

Lançamento oficial do Sales Coach no Sales Sprint, evento da parceira Sales Rocket. Segue a linguagem
da referência enviada: telas pretas e azul-profundo com chamadas curtas, o produto flutuando em 3D,
close extremo que abre para a tela inteira, carrossel de frases com miniaturas, a marca batendo,
montagem rápida em branco com a câmera correndo pelas telas, "e muito mais…", órbita de integrações,
campo gigante digitando que vira o app, campo com itens trocando e o fecho com o horizonte aceso.
Cores do Sales Coach (navy e azul) com o lima da NEXA como destaque. Uma pergunta só, na abertura.
As telas redesenham o app de verdade (mesmos rótulos, cores, ícones lucide e fluxos), com dados de
demonstração (dito no rodapé). Trilha contínua a 120 bpm e todos os cortes no tempo.
Preparado para narração: roteiro com tempos em `locucao.md` e uma trilha-cama própria.

| Tempo | Cena |
|---|---|
| 0–3s | "E se cada reunião do seu time tivesse um coach?" (preto) |
| 3–8s | Close no "Gravar" do Meet, a câmera abre e a janela flutua em 3D com a extensão gravando |
| 8–13s | Coach ao vivo: "achei caro" e o "Fale agora"; mergulho na tela até o próximo corte |
| 13–19s | Carrossel: Grava cada reunião · Sopra a resposta ao vivo · Dá nota a cada conversa · Preenche o seu CRM · Treina o seu time |
| 19–22s | Marca Sales Coach batendo, flash branco |
| 22–37s | Montagem em branco: Análise, CRM, Treino e Argumentos, com cortes em chicote |
| 37–39s | "e muito mais…" |
| 39–44s | Órbita: Meet, Teams, Zoom, Google Agenda, HubSpot, RD Station, Pipedrive e Kommo |
| 44–51s | Campo gigante digitando a pergunta do gestor, envio, e o dashboard em 3D com o assistente respondendo |
| 51–55s | "Na metodologia da sua empresa": /BANT, /SPIN, /MEDDIC, /SPICED, /A da sua empresa |
| 55–57s | "É só vender." |
| 57–63s | Marca, um produto NEXA, Sales Sprint com a Sales Rocket e CTA, sobre o horizonte aceso |

Versões anteriores guardadas: `horizontal-perguntas.html` (124s, com perguntas antes de cada tela,
trilha em `trilha-perguntas.py`), `horizontal-44s.html` (com `trilha-44s.py`) e `vertical-escuro.html`
(9:16, render com `PAGE=vertical-escuro.html W=1080 H=1920`).

## Gerar
```bash
python3 trilha.py                          # trilha.wav (completa) e trilha-locucao.wav (cama para narração)
node render.mjs seq 0 1890 frames          # 30 fps; dá para dividir em faixas e rodar em paralelo
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
$FF -y -framerate 30 -i frames/f_%05d.jpg -i trilha.wav -c:v libx264 -pix_fmt yuv420p -crf 17 -preset slow \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/lancamento-sales-coach-sales-sprint.mp4
```
Troque `trilha.wav` por `trilha-locucao.wav` para a versão `-para-locucao.mp4`.
`node render.mjs still 5.5,16.6 stills` gera quadros soltos; `index.html?play` toca no navegador.
`icones.js` traz os ícones lucide usados no app (licença ISC).
