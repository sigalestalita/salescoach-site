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

## Notícia: Itaú compra a NeoSpace (out/2026, NEXA)

Carrossel de 8 telas, na ordem de `out/itau-neospace/` (01 a 08): `nx-n1`, os 4 cards explicativos `nx-i1` a `nx-i4`
(`info.html`, `node render-info.mjs`) e as cenas `nx-n2` a `nx-n4`. Legenda em `legenda-itau-neospace.md`.

Cards explicativos (foto da série desfocada ao fundo, assinatura NEXA): `nx-i1` o negócio em números, `nx-i2` o que é
a NeoSpace, `nx-i3` modelo de linguagem x modelo de dados, `nx-i4` por que o Itaú comprou (marcado como leitura da
NEXA). Fontes no rodapé de cada card: fato relevante do Itaú, Tecnoblog, Times Brasil, InfoMoney, Oracle e NVIDIA.

1. `nx-n1`: letreiro de LED na torre ("ITAÚ COMPRA A NEOSPACE POR R$ 2,9 BILHÕES") com um painel do Itaú.
   O painel não é da IA: `montagem/nx-n1.html` aplica o **logo oficial de 2023** (Wikimedia Commons,
   "Itaú Unibanco logo 2023.svg", em `montagem/itau-2023.svg`) sobre a foto `montagem/nx-n1-base.jpg`.
   `node montagem/render.mjs` gera `fotos/nx-n1.jpg`; depois `node render.mjs nx-n1`.
2. `nx-n2`: placa no cofre ("IA NÃO É MAIS TESTE. É PATRIMÔNIO.").
3. `nx-n3`: estêncil no estacionamento ("QUEM ESPERA A IA FICAR PRONTA, COMPRA DE QUEM NÃO ESPEROU.").
4. `nx-n4`: quadro branco ("VOCÊ NÃO PRECISA DE R$ 2,9 BI. PRECISA COMEÇAR.").

Fonte: fato relevante do Itaú Unibanco de 26/10/2026 (R$ 2,925 bilhões por 100% das ações; depende de Cade e Banco Central).
Imagens geradas por IA: ative o rótulo "Conteúdo feito com IA". A marca do Itaú aparece em contexto de notícia.
