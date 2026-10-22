# Roteiro de locução · Reel para o Instagram (1min56, `reel-claro.html`)

Mesma voz e mesmo processo da versão clara, sem menção a evento. Duas perguntas de abertura; "E se
alguém estivesse ouvindo?" leva direto à primeira tela; a marca entra só no fim. Cada capítulo tem
14s: a pergunta (4s) e a tela (10s).

| Tempo | Na tela | Fala |
|---|---|---|
| 0:00–0:04 | "O que o seu cliente disse na última reunião?" | O que o seu cliente disse na última reunião? |
| 0:04–0:08 | "Quantas vendas se perderam numa frase que ninguém ouviu?" | Quantas vendas se perderam numa frase que ninguém ouviu? |
| 0:08–0:12 | "E se alguém estivesse ouvindo?" | E se alguém estivesse ouvindo? |
| 0:12–0:22 | Meet: "Gravar esta reunião?", clique, extensão gravando | O Sales Coach entra no Meet ou no Teams. Um clique em Gravar… e pronto. Sem robô na chamada. |
| 0:22–0:26 | "E se alguém soprasse a resposta no meio da objeção?" | E se alguém soprasse a resposta no meio da objeção? |
| 0:26–0:36 | O cliente diz que está caro e aparece o "Fale agora" | O cliente diz que está caro… e a dica certa aparece na hora. Só o vendedor vê. |
| 0:36–0:40 | "E se cada reunião tivesse uma nota?" | E se cada reunião tivesse uma nota? |
| 0:40–0:50 | Score 86, temperatura, BANT e próximo passo | Agora tem. Nota, temperatura e diagnóstico… na metodologia da sua empresa. E o próximo passo já vem pronto. |
| 0:50–0:54 | "E se o CRM se preenchesse sozinho?" | E se o CRM se preenchesse sozinho? |
| 0:54–1:04 | "Enviar ao CRM" e o HubSpot preenchendo | Um clique… e a nota, os critérios e o próximo passo vão direto para o negócio. Com a tarefa criada. |
| 1:04–1:08 | "E se o seu time treinasse antes do cliente de verdade?" | E se o seu time treinasse antes do cliente de verdade? |
| 1:08–1:18 | Treino por voz e a avaliação (81, +19) | Um cliente simulado, por voz… com as objeções reais da sua empresa. E nota no fim. |
| 1:18–1:22 | "E se cada lead chegasse com o argumento certo?" | E se cada lead chegasse com o argumento certo? |
| 1:22–1:32 | Gerador de argumentos | Argumentos, ROI e frases prontas… com a base de conhecimento da sua empresa. |
| 1:32–1:36 | "E se você soubesse o que acontece em todas?" | E se você soubesse o que acontece em todas? |
| 1:36–1:46 | Dashboard e o assistente respondendo | O time inteiro numa tela. E um assistente… que conhece todas as reuniões. |
| 1:46–1:50 | "Agora, alguém está ouvindo." | Agora… alguém está ouvindo. |
| 1:50–1:56 | Marca, preço e CTA | Sales Coach. Um coach em cada reunião do seu time. |

Gerar: `PAGE=reel-claro.html OUT=trilha-reel.wav python3 trilha-perguntas.py` e
`ELEVENLABS_API_KEY=... python3 narracao.py --roteiro locucao-reel.md --cama trilha-reel.wav --ganho-cama .5 --prefixo out/reel- --sem-legenda-na-imagem`.
