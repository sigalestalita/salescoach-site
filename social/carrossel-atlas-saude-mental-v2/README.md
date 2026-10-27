# Carrossel Atlas · "Saúde mental passou o câncer" (estilo Ponto cego, 10 cards, 1080×1350)

Versão do carrossel educativo da Atlas (`../carrossel-atlas-saude-mental/`, versão clara) na estética do
"Ponto cego" (`../carrossel-ponto-cego/`): cabeçalho de perfil, cards alternando foto escura, cinza claro com
painel e preto com dado, letras pesadas com degradê, pílulas e telas reais no fecho.

1. Capa com o dado: saúde mental 48%, câncer 40%, estresse 32%, obesidade 25% (Ipsos Health Service Report 2026, 32 países, 22.528 adultos, jul–ago/2026).
2. O Brasil: 58% em 2026; 18% em 2018, quando o câncer liderava com 57% (Ipsos 2018 e 2026).
3. Foto: Ninguém deixa a cabeça no estacionamento.
4. 546 mil afastamentos por transtornos mentais em 2025, +16% sobre 2024; ansiedade 166 mil, episódios depressivos 127 mil (Previdência Social, jan/2026).
5. Sintoma e causa: o que chega ao RH (afastamentos, faltas, pedidos de demissão) e os riscos psicossociais que vêm antes (Manual do cap. 1.5 da NR-1, MTE, mar/2026; ISO 45003).
6. A regra: NR-1 desde 26/05/2026 (Portarias MTE nº 1.419/2024 e nº 765/2025).
7. Pílulas: palestra no Setembro Amarelo x indicador o ano todo.
8. Como medir, na prática (4 passos).
9. Telas reais do Atlas Clima (áreas e lideranças, de `site-nexa-v2/assets/telas`).
10. Fecho: Saúde mental não é campanha. É indicador.

A foto do card 3 é do Higgsfield (soul/cinema), gerada por `fotos.py`. Pessoas geradas por IA: ative o rótulo
"Conteúdo feito com IA" ao publicar.

```bash
python3 fotos.py              # fotos/carro.jpg (HIGGSFIELD_API_KEY e HIGGSFIELD_API_SECRET no ambiente)
node render-carrossel.mjs     # out/carrossel/card-01.jpg … card-10.jpg  (carrossel.html?s=N mostra um card)
```
Legenda em `legenda.md`.
