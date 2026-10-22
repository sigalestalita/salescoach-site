# Post Sales Coach · estilo anúncio cinematográfico

Post de feed no estilo do anúncio de referência (Grok Bot): foto cinematográfica de quem usa o produto,
marca no topo e uma frase curta centralizada sobre a parte escura da foto.
Frase: "Seu time vende. O Sales Coach faz o resto." Legenda e CTA em `legenda.md`.

- `fotos/`: fotos geradas na Higgsfield (`soul/cinema`, 3:4); o prompt de cada uma está no `.json` ao lado.
- `post.html`: a arte (`?foto=homem|mulher`, `?f=45` para 1080×1350 ou `?f=11` para 1080×1080).
- `node render.mjs` gera `out/post-<foto>-<4x5|1x1>.jpg`.

## Carrossel (11 cards, 1080×1350)
`carrossel.html?s=1..11` e `node render-carrossel.mjs` → `out/carrossel/card-01.jpg … card-11.jpg`.
Ordem: capa (foto) · frase "412 reuniões / Você ouviu 3." · Gravação · Coach ao vivo · Análise · CRM ·
Treino (foto + tela) · Argumentos · Gestão · frase "Cada reunião vira método." · preço (R$ 89,90 por
usuário/mês, sem limites de uso, Cadastre-se). "um produto NEXA" em todos os cards, sem numeração.
As funcionalidades usam as telas reais do app (as mesmas do vídeo): `telas/` sai de
`node captura-telas.mjs ../post-salescoach-delegue/telas`, rodado em `../reel-lancamento-sales-sprint`
(a janela inteira e o elemento-chave de cada tela, em 2x). Legenda do carrossel no fim do `legenda.md`.
