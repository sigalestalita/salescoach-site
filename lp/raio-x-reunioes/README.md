# Raio-X das reuniões de vendas

Diagnóstico interativo do Sales Coach para captar leads (tráfego pago e orgânico).
Publicado em `https://nexatech.ia.br/raio-x-reunioes/` (cópia desta pasta em `nexa-site/raio-x-reunioes/`).

## Como funciona

1. **Números do time** (vendedores, reuniões por semana, contratos por mês, valor do contrato):
   o painel desenha um ponto por reunião do mês, ao vivo.
2. **7 perguntas** em 4 dimensões (visibilidade, coaching, método, inteligência de vendas),
   cada uma com uma frase calculada com os números da pessoa. A pergunta de visibilidade
   apaga no painel as reuniões que a liderança não acompanha.
3. **Prévia sem cadastro**: o número principal ("de 516 reuniões, a liderança vê 15") e a nota de 0 a 100.
4. **Formulário** (nome, e-mail, WhatsApp, empresa, cargo e a opção da análise gratuita) libera o
   **relatório**: nota por dimensão, cards com os números, simulação de receita (+5% a +40% de
   conversão), plano de 30 dias com as 3 dimensões mais fracas e a oferta da análise gratuita de
   3 agendas reais. Dá para salvar em PDF (impressão do navegador).

`window.LP.gate = false` mostra o relatório sem pedir o contato.
As respostas ficam no navegador da pessoa (localStorage `raio-x`) para quem recarregar a página.

## Para onde vai o lead

Função `lead-material` (projeto nexa-comercial), material `raio-x-reunioes`:
- `leads_inbound`: o lead, com `rastreio.diagnostico` (nota, números, respostas) e
  `interesse = 'Análise gratuita de 3 agendas'` quando a pessoa pede a análise;
- conta no CRM, na fila, com o resumo do raio-x nas observações. Quem pede a análise no fim do
  relatório (depois do cadastro) atualiza o mesmo lead, sem criar outro.

Consulta para acompanhar:

```sql
select criado_em, nome, empresa, cargo, interesse,
       rastreio->'diagnostico'->>'nota' nota, rastreio->'diagnostico'->>'vendedores' vendedores
from leads_inbound where material = 'raio-x-reunioes' order by criado_em desc;
```

## Contas e premissas (aparecem na página)

- Reuniões por mês = vendedores × reuniões por semana × 4,3.
- Horas para ouvir tudo = reuniões por mês × 45 min.
- Simulação = contratos por mês × % a mais × valor do contrato × 12. É uma conta simples, sem promessa.
- Nenhum dado de mercado inventado: todo número da página vem das respostas da pessoa.

## Pixel

Preencha `window.LP.pixel`. Eventos: `PageView`, `ViewContent`, `RaioXConcluido` (personalizado, ao
terminar as perguntas), `Lead` (formulário) e `Contact` (pedido da análise no fim).
