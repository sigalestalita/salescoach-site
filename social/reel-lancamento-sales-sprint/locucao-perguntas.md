# Roteiro de locução · versão clara de 2min04 (`horizontal-perguntas.html`)

Narração do vídeo de 2min04, o da versão clara com perguntas em lettering. Cada capítulo tem 14s: a
pergunta (4s) e a tela do produto (10s). A narração lê as perguntas como estão no lettering e responde
enquanto a tela mostra o produto. Comece cada fala uns 0,3s depois do corte.

**Tom:** perguntas de uma vez só, sem pausa no meio; respostas firmes, com pausas. Nas respostas, as
reticências marcam uma pausa curta e o ponto final uma pausa maior.

| Tempo | Na tela | Fala |
|---|---|---|
| 0:00–0:04 | "O que o seu cliente disse na última reunião?" | O que o seu cliente disse na última reunião? |
| 0:04–0:08 | "Quantas vendas se perderam numa frase que ninguém ouviu?" | Quantas vendas se perderam numa frase que ninguém ouviu? |
| 0:08–0:12 | "E se alguém estivesse ouvindo?" | E se alguém estivesse ouvindo? |
| 0:12–0:16 | Revelação: Sales Coach | Sales Coach. Um coach em cada reunião do seu time. |
| 0:16–0:20 | "E se nenhuma reunião se perdesse?" | E se nenhuma reunião se perdesse? |
| 0:20–0:30 | Meet: "Gravar esta reunião?", clique, extensão gravando | O Sales Coach entra no Meet ou no Teams. Um clique em Gravar… e pronto. Sem robô na chamada. |
| 0:30–0:34 | "E se alguém soprasse a resposta no meio da objeção?" | E se alguém soprasse a resposta no meio da objeção? |
| 0:34–0:44 | O cliente diz que está caro e aparece o "Fale agora" | O cliente diz que está caro… e a dica certa aparece na hora. Só o vendedor vê. |
| 0:44–0:48 | "E se cada reunião tivesse uma nota?" | E se cada reunião tivesse uma nota? |
| 0:48–0:58 | Score 86, temperatura, BANT e próximo passo | Agora tem. Nota, temperatura e diagnóstico… na metodologia da sua empresa. E o próximo passo já vem pronto. |
| 0:58–1:02 | "E se o CRM se preenchesse sozinho?" | E se o CRM se preenchesse sozinho? |
| 1:02–1:12 | "Enviar ao CRM" e o HubSpot preenchendo | Um clique… e a nota, os critérios e o próximo passo vão direto para o negócio. Com a tarefa criada. |
| 1:12–1:16 | "E se o seu time treinasse antes do cliente de verdade?" | E se o seu time treinasse antes do cliente de verdade? |
| 1:16–1:26 | Treino por voz e a avaliação (81, +19) | Um cliente simulado, por voz… com as objeções reais da sua empresa. E nota no fim. |
| 1:26–1:30 | "E se cada lead chegasse com o argumento certo?" | E se cada lead chegasse com o argumento certo? |
| 1:30–1:40 | Gerador de argumentos | Argumentos, ROI e frases prontas… com a base de conhecimento da sua empresa. |
| 1:40–1:44 | "E se você soubesse o que acontece em todas?" | E se você soubesse o que acontece em todas? |
| 1:44–1:54 | Dashboard e o assistente respondendo | O time inteiro numa tela. E um assistente… que conhece todas as reuniões. |
| 1:54–1:58 | "Agora, alguém está ouvindo." | Agora… alguém está ouvindo. |
| 1:58–2:04 | Marca, Sales Sprint e CTA | Sales Coach. Lançamento oficial… no Sales Sprint. |

Gerar: `ELEVENLABS_API_KEY=... python3 narracao.py --roteiro locucao-perguntas.md --cama trilha-perguntas.wav --ganho-cama .5 --prefixo out/perguntas- --sem-legenda-na-imagem`
(o `trilha-perguntas.wav` sai do `python3 trilha-perguntas.py`). O vídeo dessa versão já tem uma linha
de texto embaixo de cada tela, então a legenda vai só no `out/perguntas-legendas.srt` (para o YouTube).
