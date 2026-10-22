# Vídeo de lançamento · Sales Coach no Sales Sprint (16:9, 1min30, versão thriller)

Lançamento oficial do Sales Coach no Sales Sprint, evento da parceira Sales Rocket. Linguagem da
referência (telas pretas com chamadas, produto em 3D sobre azul profundo, marca batendo, horizonte
aceso no fecho), com mais suspense: abertura em três cortes, uma pergunta indagadora antes de cada
funcionalidade (palavras entrando com tremulação e glitch), telas grandes com a câmera dentro do
momento-chave (perguntas de 3s e telas de 7s), clímax de cortes de meio segundo com uma palavra cada, meio segundo de silêncio e a
marca. Cores do Sales Coach (navy e azul) com o lima da NEXA como destaque. As telas redesenham o app
de verdade, com dados de demonstração (dito no rodapé). Trilha thriller a 120 bpm, cortes no tempo.
A câmera enquadra sempre o componente inteiro (cartão, painel ou janela), com margem: aproxima
sem cortar a tela. Narração pronta: `narracao.py` gera cada fala do `locucao.md` no ElevenLabs (voz escolhida, grave, pt-BR, com pausas e contexto entre as falas),
encaixa cada uma na janela da cena e mixa com a cama da trilha, abaixando a música sob a voz.

| Tempo | Cena |
|---|---|
| 0–3s | "Seu time fez 412 reuniões este mês." (o número gira) |
| 3–5,5s | "Você ouviu 3." |
| 5,5–8s | "E se alguém ouvisse todas?" |
| 8–18s | "Quem está ouvindo as suas reuniões?" · Meet: "Gravar esta reunião?", clique e a extensão gravando |
| 18–28s | "E quando o cliente diz que está caro?" · o "Fale agora" aparece na hora |
| 28–38s | "Quanto valeu essa reunião?" · Score 86, BANT e próximo passo |
| 38–48s | "Quem vai atualizar o CRM hoje?" · "Enviar ao CRM" e o HubSpot preenchendo |
| 48–58s | "Seu time treina antes de errar?" · treino por voz e a avaliação (81, +19) |
| 58–68s | "Qual é o argumento certo para esse lead?" · gerador de argumentos |
| 68–78s | "O que acontece nas reuniões que você não vê?" · dashboard e o assistente respondendo |
| 78–82s | Clímax, meio segundo por corte: Grava. Sopra. Avalia. Preenche. Treina. Convence. Revela. Orienta. |
| 82–82,5s | Silêncio |
| 82,5–86s | Marca: "Um coach em cada reunião do seu time." |
| 86–90s | Um produto NEXA, Sales Sprint com a Sales Rocket e CTA, sobre o horizonte aceso |

Versões anteriores guardadas: `horizontal-perguntas.html` (124s, trilha em `trilha-perguntas.py`),
`horizontal-44s.html` (com `trilha-44s.py`) e `vertical-escuro.html` (9:16, render com
`PAGE=vertical-escuro.html W=1080 H=1920`). A versão impacto de 63s está no histórico do git.

## Gerar
```bash
python3 trilha.py                          # trilha.wav (completa) e trilha-locucao.wav (cama para narração)
node render.mjs seq 0 2700 frames          # 30 fps; dá para dividir em faixas e rodar em paralelo
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
$FF -y -framerate 30 -i frames/f_%05d.jpg -i trilha.wav -c:v libx264 -pix_fmt yuv420p -crf 17 -preset slow \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/lancamento-sales-coach-sales-sprint.mp4
```
Troque `trilha.wav` por `trilha-locucao.wav` para a versão `-para-locucao.mp4`, ou por
`out/trilha-com-narracao.wav` (gerada por `ELEVENLABS_API_KEY=... python3 narracao.py`) para a `-narrado.mp4`.
A chave do ElevenLabs fica só no ambiente, nunca no repositório.
Legendas: o `narracao.py` também gera `out/legendas.srt` (narração completa, para o YouTube) e
`legendas.json` (só as falas que não estão escritas na tela). `node legendas.mjs 330 2280 legendas`
renderiza a camada transparente, que o ffmpeg sobrepõe ao vídeo narrado (`-itsoffset 11`, `overlay`).
Versão clara de 2min04 narrada: `out/lancamento-sales-coach-versao-clara-narrado.mp4`, com o roteiro em
`locucao-perguntas.md` (mesma voz e mesmo processo; comando no fim do roteiro).
Reel para o Instagram (9:16, 1080×1920, 1min56): `reel-claro.html`, a partir da versão clara, sem menção a
evento. As perguntas ficam num fundo preto e a tela abre para o claro no produto; "E se alguém estivesse
ouvindo?" leva direto à primeira tela e a marca (com preço e CTA) entra só no fim. A janela do app fica em
pé e a câmera enquadra o componente em uso. Roteiro e comandos em `locucao-reel.md`; render:
`PAGE=reel-claro.html W=1080 H=1920 node render.mjs seq 0 3480 frames`, depois o ffmpeg com
`out/reel-trilha-com-narracao.wav` (narrado) ou `trilha-reel.wav` (só a trilha) gera
`out/reel-sales-coach-versao-clara-narrado.mp4` e `out/reel-sales-coach-versao-clara.mp4`.
`node render.mjs still 9.2,26.5 stills` gera quadros soltos; `index.html?play` toca no navegador.
`icones.js` traz os ícones lucide usados no app (licença ISC).
