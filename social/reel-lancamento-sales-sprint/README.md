# Vídeo de lançamento · Sales Coach no Sales Sprint (16:9, 2min10, versão thriller)

Lançamento oficial do Sales Coach no Sales Sprint, evento da parceira Sales Rocket. Linguagem da
referência (telas pretas com chamadas, produto em 3D sobre azul profundo, marca batendo, horizonte
aceso no fecho), com mais suspense: abertura em três cortes, uma pergunta indagadora antes de cada
funcionalidade (palavras entrando com tremulação e glitch), telas grandes com a câmera dentro do
momento-chave (perguntas de 4s e telas de 10s), clímax de cortes de um segundo com uma palavra cada, meio segundo de silêncio e a
marca. Cores do Sales Coach (navy e azul) com o lima da NEXA como destaque. As telas redesenham o app
de verdade, com dados de demonstração (dito no rodapé). Trilha thriller a 120 bpm, cortes no tempo.
Preparado para narração: roteiro com tempos em `locucao.md` e uma trilha-cama própria.

| Tempo | Cena |
|---|---|
| 0–4s | "Seu time fez 412 reuniões este mês." (o número gira) |
| 4–7s | "Você ouviu 3." |
| 7–12s | "E se alguém ouvisse todas?" |
| 12–26s | "Quem está ouvindo as suas reuniões?" · Meet: "Gravar esta reunião?", clique e a extensão gravando |
| 26–40s | "E quando o cliente diz que está caro?" · o "Fale agora" aparece na hora |
| 40–54s | "Quanto valeu essa reunião?" · Score 86, BANT e próximo passo |
| 54–68s | "Quem vai atualizar o CRM hoje?" · "Enviar ao CRM" e o HubSpot preenchendo |
| 68–82s | "Seu time treina antes de errar?" · treino por voz e a avaliação (81, +19) |
| 82–96s | "Qual é o argumento certo para esse lead?" · gerador de argumentos |
| 96–110s | "O que acontece nas reuniões que você não vê?" · dashboard e o assistente respondendo |
| 110–118s | Clímax, 1s por corte: Grava. Sopra. Avalia. Preenche. Treina. Convence. Revela. Orienta. |
| 118–118,5s | Silêncio |
| 118,5–123s | Marca: "Um coach em cada reunião do seu time." |
| 123–130s | Um produto NEXA, Sales Sprint com a Sales Rocket e CTA, sobre o horizonte aceso |

Versões anteriores guardadas: `horizontal-perguntas.html` (124s, trilha em `trilha-perguntas.py`),
`horizontal-44s.html` (com `trilha-44s.py`) e `vertical-escuro.html` (9:16, render com
`PAGE=vertical-escuro.html W=1080 H=1920`). A versão impacto de 63s está no histórico do git.

## Gerar
```bash
python3 trilha.py                          # trilha.wav (completa) e trilha-locucao.wav (cama para narração)
node render.mjs seq 0 3900 frames          # 30 fps; dá para dividir em faixas e rodar em paralelo
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
$FF -y -framerate 30 -i frames/f_%05d.jpg -i trilha.wav -c:v libx264 -pix_fmt yuv420p -crf 17 -preset slow \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/lancamento-sales-coach-sales-sprint.mp4
```
Troque `trilha.wav` por `trilha-locucao.wav` para a versão `-para-locucao.mp4`.
`node render.mjs still 9.2,26.5 stills` gera quadros soltos; `index.html?play` toca no navegador.
`icones.js` traz os ícones lucide usados no app (licença ISC).
