# Post Sales Coach · estilo anúncio cinematográfico

Post de feed no estilo do anúncio de referência (Grok Bot): foto cinematográfica de quem usa o produto,
marca no topo e uma frase curta centralizada sobre a parte escura da foto.
Frase: "Seu time vende. O Sales Coach faz o resto." Legenda e CTA em `legenda.md`.

- `fotos/`: fotos geradas na Higgsfield (`soul/cinema`, 3:4); o prompt de cada uma está no `.json` ao lado.
- `post.html`: a arte (`?foto=homem|mulher`, `?f=45` para 1080×1350 ou `?f=11` para 1080×1080).
- `node render.mjs` gera `out/post-<foto>-<4x5|1x1>.jpg`.
