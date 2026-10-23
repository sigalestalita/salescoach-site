# Série "Frases na cena"

Frases curtas impressas dentro de cenas reais (placa do metrô, tela de relógio, costas de jaqueta,
placa enferrujada, etiqueta de tecido...), na pegada da referência de out/2026. Para Sales Coach,
Atlas e NEXA: um carrossel de 5 imagens e 2 posts únicos por marca (21 imagens).

- `cenas.py`: as cenas e as frases. Gera as fotos 4:5 no **Ideogram 4.0** (Higgsfield), que escreve o
  texto dentro da imagem com acento. Credencial da Higgsfield no ambiente da sessão (`HF_AUTH` ou
  `HIGGSFIELD_API_KEY`/`HIGGSFIELD_API_SECRET`), nunca no repositório.
  - `python3 cenas.py` gera as que faltam; `python3 cenas.py sc-c4` refaz uma.
  - **Confira letra por letra** cada foto: o gerador às vezes erra uma palavra (ex.: "Obj·ção"); refaça.
- Acabamento: `node render.mjs [ids]` gera `out/<id>.jpg` (1080x1350) a partir de `acabamento.html`, com a
  assinatura discreta embaixo ("SALES COACH · NEXA", com o logo da NEXA e o ponto lima).

## Situação

- Prontas, com acabamento em `out/`: `sc-c1` (metrô, legenda em `legendas.md`), `sc-c2` (relógio).
- Refazer: `sc-c4` (placa: saiu "Obj·ção").
- Faltam as outras 18: os créditos da Higgsfield acabaram em 23/10.
