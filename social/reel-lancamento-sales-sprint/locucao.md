# Roteiro de locução · Lançamento Sales Coach (1min30, versão thriller)

Cada capítulo tem 10s: a pergunta na tela preta (3s) e a tela do produto (7s). A narração lê a
pergunta junto com o texto e responde enquanto a tela mostra o produto. Comece cada fala uns 0,3s
depois do corte.

**Tom:** as perguntas vão de uma vez só, sem pausa no meio, para a entonação fechar inteira; as
respostas são firmes, com pausas. Nas respostas, as reticências marcam uma pausa curta e o ponto final
uma pausa maior (o `narracao.py` transforma isso em pausas da voz). No clímax (1:18–1:22) não há fala:
a música e as palavras na tela carregam. Depois do meio segundo de silêncio, a marca entra com a
pancada e a voz volta.

| Tempo | Na tela | Fala |
|---|---|---|
| 0:00–0:03 | "Seu time fez 412 reuniões este mês." | Seu time fez quatrocentas e doze reuniões. |
| 0:03–0:05,5 | "Você ouviu 3." | Você ouviu… três. |
| 0:05,5–0:08 | "E se alguém ouvisse todas?" | E se alguém ouvisse todas? |
| 0:08–0:11 | "Quem está ouvindo as suas reuniões?" | Quem está ouvindo as suas reuniões? |
| 0:11–0:18 | Meet: "Gravar esta reunião?", clique, extensão gravando | O Sales Coach entra no Meet, no Teams ou no Zoom… e grava tudo. Sem robô. |
| 0:18–0:21 | "E quando o cliente diz que está caro?" | E quando o cliente diz que está caro? |
| 0:21–0:28 | "Achei caro" e o "Fale agora" | Ele sopra a resposta certa. Na hora. E só o vendedor vê. |
| 0:28–0:31 | "Quanto valeu essa reunião?" | Quanto valeu essa reunião? |
| 0:31–0:38 | Score 86, BANT e próximo passo | Nota, temperatura e diagnóstico… na metodologia da sua empresa. |
| 0:38–0:41 | "Quem vai atualizar o CRM hoje?" | Quem vai atualizar o CRM hoje? |
| 0:41–0:48 | "Enviar ao CRM" e o HubSpot preenchendo | Ninguém. O Sales Coach preenche sozinho… com o próximo passo e a tarefa. |
| 0:48–0:51 | "Seu time treina antes de errar?" | Seu time treina antes de errar? |
| 0:51–0:58 | Treino por voz e a avaliação (nota 81, +19) | Agora, treina. Com um cliente simulado, por voz… e nota no fim. |
| 0:58–1:01 | "Qual é o argumento certo para esse lead?" | Qual é o argumento certo para esse lead? |
| 1:01–1:08 | Gerador de argumentos | Ele entrega. Argumentos e frases prontas… com o conhecimento da sua empresa. |
| 1:08–1:11 | "O que acontece nas reuniões que você não vê?" | O que acontece nas reuniões que você não vê? |
| 1:11–1:18 | Dashboard e o assistente respondendo | Pergunte. Ele ouviu… todas. |
| 1:18–1:22 | Clímax: Grava. Sopra. Avalia. Preenche. Treina. Convence. Revela. Orienta. | (sem fala) |
| 1:22–1:22,5 | Silêncio | (silêncio) |
| 1:22,5–1:26 | Marca Sales Coach | Sales Coach. Um coach em cada reunião. |
| 1:26–1:30 | Sales Sprint e CTA | Lançamento oficial no Sales Sprint. |

## Arquivos para a edição
- `out/lancamento-sales-coach-sales-sprint-narrado.mp4`: vídeo final já narrado (ElevenLabs), com legendas.
- `out/legendas.srt`: legenda da narração completa, para subir no YouTube como closed caption.
- `out/narracao.wav`: só a voz, no tempo do vídeo; `out/trilha-com-narracao.wav`: voz e trilha mixadas.
- `out/lancamento-sales-coach-sales-sprint.mp4`: vídeo com a trilha completa (sem narração).
- `out/lancamento-sales-coach-sales-sprint-para-locucao.mp4`: vídeo com a cama para narração.
- `out/trilha.wav` e `out/trilha-locucao.wav`: as duas trilhas soltas, 48 kHz.

Na mixagem, a música abaixa cerca de 9 dB sob a voz e cada fala é nivelada no mesmo volume; um
limitador segura só os picos das pancadas.
