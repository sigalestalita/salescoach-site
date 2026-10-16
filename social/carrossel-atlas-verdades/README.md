# Carrossel Atlas · "Verdades que o RH precisa ouvir" (4:5, 7 telas)

Formato: foto inteira, frase numa faixa cinza-clara com estrelinhas lima e a marca Atlas no canto.
Fotos em ambientes corporativos (agência, time de vendas, startup), pessoas de 25 a 40 anos, cada uma ilustrando a frase.

| # | Foto | Texto |
|---|---|---|
| 1 | Ela calada, de braços cruzados, enquanto a agência faz brainstorm (f1) | VERDADES QUE O RH PRECISA OUVIR · selo "sobre clima e pessoas" |
| 2 | Time de vendas em silêncio na reunião (f2) | Ninguém reclamar não significa que o time está bem. |
| 3 | Vendedor entediado na mesa (f3) | Turnover baixo não significa equipe engajada. |
| 4 | Designer esgotado no meio da agência corrida (f4) | Equipe ocupada não significa equipe motivada. |
| 5 | Profissional com a caixa e o troféu de top seller (f5) | Se o seu melhor talento pedisse demissão amanhã, você saberia o motivo? |
| 6 | Líder ouvindo um colega, sorrindo (f6) | O Atlas Clima mostra como o time está… · "Arraste e conheça o Atlas →" |
| 7 | Post do produto (`img/post-atlas.jpg`, de `../story-anuncio/atlas-feed.html` em 2x) | Sua empresa merece ouvir o time de verdade. |

## Gerar
```bash
python3 fotos.py          # fotos/f1..f6.jpg na Higgsfield (HIGGSFIELD_API_KEY e HIGGSFIELD_API_SECRET no ambiente)
python3 fotos.py f4       # refaz uma foto
node render.mjs out       # out/atlas-verdades-01..06.jpg (2160×2700)
```
Sem a foto, o slide sai com fundo provisório.
