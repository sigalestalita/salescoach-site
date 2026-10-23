# Série editorial · NEXA, Sales Coach e Atlas (pegada @nowdays)

Doze carrosséis 4:5 (1080×1350), quatro por marca, no ritmo do perfil @nowdays estudado em
`../referencias/nowdays/resumo-estilo.md`. Cada post começa com uma capa fotográfica e a frase em CAIXA
ALTA direto sobre a foto. Depois vêm telas chapadas com ruído de filme e corpo em caixa baixa. Há uma tela
em serifa (Instrument Serif) por carrossel e a assinatura pequena centralizada embaixo.

| Marca | Papel do "vinho" | Escuro | Claro | Destaque |
|---|---|---|---|---|
| NEXA | oliva `#46590a` | tinta `#10120e` | osso `#f3f4ee` | lima `#d4f969` |
| Sales Coach | navy `#071a34` | `#0b0b0b` | `#ecebe6` | lima `#d4f969` |
| Atlas | azul Atlas `#15498d` | navy `#071a34` | `#eef0f2` | azul claro `#bcd6f5` (nunca roxo) |

Sales Coach e Atlas levam "um produto NEXA" na assinatura. Os logos são os oficiais, sem alteração.

| # | Marca | Tipo | Post | Telas |
|---|---|---|---|---|
| n1 | NEXA | educativo | dado sem conversa é só planilha | 9 |
| n2 | NEXA | conteúdo | quantas conversas do seu time você ouviu esta semana? | 6 |
| n3 | NEXA | conteúdo (curadoria) | 5 livros para quem lidera pessoas | 8 |
| n4 | NEXA | comercial | decidir sobre pessoas com dados (os dois produtos) | 6 |
| s1 | Sales Coach | educativo | como saber se uma reunião de venda foi boa | 9 |
| s2 | Sales Coach | conteúdo (curadoria) | o que responder quando o cliente diz "tá caro" | 7 |
| s3 | Sales Coach | conteúdo | seu melhor vendedor saiu. e o método dele? | 6 |
| s4 | Sales Coach | comercial | um coach em cada reunião do seu time (R$ 89,90) | 6 |
| a1 | Atlas | educativo | clima ou 360: qual pesquisa o seu time precisa? | 8 |
| a2 | Atlas | conteúdo (curadoria) | o clima do seu time está pior do que parece? | 7 |
| a3 | Atlas | educativo | nr-1: seu rh já mede risco psicossocial? | 7 |
| a4 | Atlas | comercial | ouvir o seu time custa r$ 30 por pessoa | 5 |

Dados citados nas telas, com fonte na própria arte: Salesforce State of Sales 7ª ed. (2026), Gong Labs
(326 mil chamadas) e Meetime Inside Sales Benchmark Brasil 2022. O post da NR-1 cita a Portaria MTE
nº 1.419/2024; a legenda indica buscar SST e jurídico para a adequação.

Fotos geradas na Higgsfield (soul/cinema, estilo filme 35 mm granulado) a partir de `fotos/prompts.tsv`;
cada `fotos/<nome>.json` guarda o pedido. Telas do produto em `telas/` (as mesmas dos posts anteriores).

```bash
node render.mjs            # out/<id>-<slug>/tela-01.jpg …  (ou: node render.mjs s1 a4)
# serie.html?p=s1&s=3 mostra uma tela no navegador; textos em dados.js
```
Legendas em `legendas.md`.
