# Vídeo de lançamento · Sales Coach no Sales Sprint (16:9, 124s)

Lançamento oficial do Sales Coach no Sales Sprint, evento da parceira Sales Rocket.
Abre em suspense, com perguntas em lettering (Instrument Serif) sobre uma onda de voz, e cada
funcionalidade começa com uma pergunta antes de mostrar a tela. As telas redesenham o app de verdade
(mesmos rótulos, cores, ícones lucide e fluxos) em uso: cursor, cliques, digitação e uma câmera que
aproxima o que importa. Identidade light da NEXA por fora; dentro das telas, as cores do app.
Trilha: uma música só, contínua, a 120 bpm (compasso = 2s), e o vídeo no mesmo compasso: cada pergunta
dura 2 compassos (4s) e cada tela 5 (10s; a animação roda 1,4× mais lenta e o resultado fica
na tela antes de sair), então toda tela entra num tempo forte. O bumbo nunca para; as
perguntas são preparações (baixo filtrado, virada de caixa, subida) e a música ganha uma camada a cada
funcionalidade (chimbal aberto, acordes, arpejo, semicolcheias e um tom acima no Treino, melodia, prato),
até o clímax no fecho.
Dados de demonstração (dito no rodapé).

| Tempo | Cena | O que mostra |
|---|---|---|
| 0–12s | Perguntas | "O que o seu cliente disse na última reunião?", "Quantas vendas se perderam numa frase que ninguém ouviu?", "E se alguém estivesse ouvindo?" |
| 12–16s | Revelação | A onda vira um ponto e o ponto vira a marca: "Um coach em cada reunião do seu time." |
| 16–30s | 01 Gravação | "E se nenhuma reunião se perdesse?" No Meet, o card "Gravar esta reunião?", o clique e o painel da extensão gravando |
| 30–44s | 02 Coach ao vivo | "E se alguém soprasse a resposta no meio da objeção?" O cliente diz que achou caro; aparece "Fale agora" e o vendedor usa a dica |
| 44–58s | 03 Análise | "E se cada reunião tivesse uma nota?" Progresso, Score Geral 86, Temperatura, Talk Ratio, BANT Score e próximos passos |
| 58–72s | 04 CRM | "E se o CRM se preenchesse sozinho?" "Enviar ao CRM" e o negócio no HubSpot preenchendo campo a campo, com a tarefa criada |
| 72–86s | 05 Treino | "E se o seu time treinasse antes do cliente de verdade?" Chamada por voz com lead difícil e a avaliação do treino (81, +19) |
| 86–100s | 06 Argumentos | "E se cada lead chegasse com o argumento certo?" Dores marcadas, "Gerar Argumentos" e os cards com solução e ROI |
| 100–114s | 07 Gestão | "E se você soubesse o que acontece em todas?" Dashboard, evolução, ranking e o assistente respondendo |
| 114–124s | Fecho | "Agora, alguém está ouvindo." Marca, "Cada reunião vira método.", NEXA, Sales Sprint e CTA |

`horizontal-44s.html` (com `trilha-44s.py`) é a versão anterior, de 44s, sem as perguntas.
`vertical-escuro.html` é a primeira versão (9:16, escura), render com `PAGE=vertical-escuro.html W=1080 H=1920`.

## Gerar
```bash
python3 trilha.py                          # trilha.wav, lida da linha do tempo (<script id="tl">)
node render.mjs seq 0 3720 frames          # 30 fps; dá para dividir em faixas e rodar em paralelo
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
$FF -y -framerate 30 -i frames/f_%05d.jpg -i trilha.wav -c:v libx264 -pix_fmt yuv420p -crf 17 -preset slow \
  -c:a aac -b:a 192k -shortest -movflags +faststart out/lancamento-sales-coach-sales-sprint.mp4
```
`node render.mjs still 26.4,36.4 stills` gera quadros soltos; `index.html?play` toca no navegador.
`icones.js` traz os ícones lucide usados no app (licença ISC).
