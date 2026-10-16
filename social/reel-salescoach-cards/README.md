# Reel Sales Coach · cards (9:16, 53s)

Walkthrough animado do Sales Coach na mesma linguagem dos anúncios de
`social/story-anuncio`: fundo claro com cantos lima e azul, marca no alto,
promessa em dois tons, faixa de **ganho** (dado de mercado com a fonte) e a
tela do produto saindo pela direita, com cursor nomeado e cliques. Telas
redesenhadas a partir do app atual, com dados de demonstração (dito no rodapé).

| Tempo | Cena | Clique | Ganho na faixa |
|---|---|---|---|
| 0–3,6s | Abertura: integrações em órbita da marca | | |
| 3,6–9,2s | Agenda sincronizada com o Google Agenda, semana 100% gravada | "Treinar antes" | 67% dos compradores B2B preferem comprar sem vendedor (Gartner, 2026) |
| 9,2–16,4s | Treino com cliente simulado (perfil "Diretor cético"), nota 78 | "Encerrar e ver a nota" | 53% de turnover no comercial (Meetime 2022) |
| 16,4–24,4s | Ao vivo no Teams: objeção de preço, dica "fale agora", critérios BANT marcando | "Usar a dica" | 75% têm mais chance de bater meta com coach (Salesforce, 7ª ed.) |
| 24,4–31,6s | Análise: nota 86, BANT, quem falou 57/43, trecho da dor, próximo passo | "Enviar ao CRM" | 57% × 62% de fala em ganhos × perdidos (Gong Labs) |
| 31,6–37,6s | CRM (HubSpot, RD, Pipedrive, Kommo) preenchido sozinho, tarefa criada | | 60% do tempo do vendedor não é vender (Salesforce, 7ª ed.) |
| 37,6–44,6s | Gestão: nota do time 68 → 86, gráfico cruzando a meta, insight | "Criar treino" | 43% bateram a meta (Meetime 2022) |
| 44,6–49,6s | Assistente: "Quais objeções mais travaram vendas este mês?" | "Enviar" | 20% não fazem coaching (Meetime 2022) |
| 49,6–53s | Fecho: "Cada reunião vira método." e chamada com preço | | |

Os dados de mercado são os mesmos dos posts da NEXA (`instagram-nexa/legendas.md`).
Antes de publicar, confira se as edições citadas ainda são as mais recentes.

## Gerar

```bash
python3 trilha.py                       # trilha.wav (lê cenas, cliques e SONS do index.html)
node render.mjs seq 0 1590 frames       # 30 fps; dá para dividir em faixas e rodar em paralelo
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
$FF -y -framerate 30 -i frames/f_%05d.jpg -i trilha.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow -c:a aac -b:a 192k -shortest -movflags +faststart out/reel-sales-coach.mp4
```

`node render.mjs still 6.5,21.2 stills` gera quadros soltos para conferir; `index.html?play` toca no navegador.
