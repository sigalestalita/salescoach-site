# Carrossel Atlas · "Verdades que o RH precisa ouvir" (4:5, 6 telas)

Formato: foto inteira, frase numa faixa cinza-clara com estrelinhas lima e a marca Atlas no canto.
As pessoas não são só de escritório: enfermeira, operador de armazém, barista, dev em coworking e uma gestora de RH.

| # | Foto | Texto |
|---|---|---|
| 1 | Equipe rindo numa pausa (f1) | VERDADES QUE O RH PRECISA OUVIR · selo "sobre clima e pessoas" |
| 2 | Enfermeira no intervalo (f2) | Ninguém reclamar não significa que o time está bem. |
| 3 | Operador de armazém (f3) | Turnover baixo não significa equipe engajada. |
| 4 | Barista no balcão (f4) | Equipe ocupada não significa equipe motivada. |
| 5 | Dev no coworking (f5) | Se o seu melhor talento pedisse demissão amanhã, você saberia o motivo? |
| 6 | Gestora de RH em conversa (f6) | O Atlas Clima mostra como o time está… · Conheça o Atlas · nexatech.ia.br |

## Gerar
```bash
python3 fotos.py          # fotos/f1..f6.jpg na Higgsfield (HIGGSFIELD_API_KEY e HIGGSFIELD_API_SECRET no ambiente)
python3 fotos.py f4       # refaz uma foto
node render.mjs out       # out/atlas-verdades-01..06.jpg (2160×2700)
```
Sem a foto, o slide sai com fundo provisório.
