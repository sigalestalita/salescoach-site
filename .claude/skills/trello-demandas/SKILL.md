---
name: trello-demandas
description: Transforma demandas enviadas no chat em cards no Trello dos produtos (NEXA, Sales Coach, Atlas, Lumi, Self Guru), com responsável, prazo, etiquetas, descrição e checklist. Use quando a Talita mandar uma ou mais demandas para "o Trello", "um card", "o quadro de <produto>", ou pedir para montar ou ajustar os quadros dos produtos.
---

# Demandas → Trello dos produtos

## Conta e workspace
- **Conta do Trello:** a conectada com o Google suporte@applumi.io. Antes de criar qualquer coisa, rode `trelloReadMember get_me`.
  - Se aparecer `talitasigalesgrou`, o conector ainda está na conta da Grou. Nesse caso não crie nada lá: peça para trocar a conta do conector Trello em https://claude.ai/customize/connectors e abrir uma sessão nova.
- **Workspace:** o único da conta suporte@applumi.io. Se ainda não houver quadros, siga "Montagem inicial".

## Quadros (um par por produto)
| Produto | Quadro de TI/produto | Quadro de gestão |
|---|---|---|
| NEXA | NEXA - TI/produto | NEXA - gestão |
| Sales Coach | Sales Coach - TI/produto | Sales Coach - gestão |
| Atlas | Atlas - TI/produto | Atlas - gestão |
| Lumi | Lumi - TI/produto | Lumi - gestão |
| Self Guru | Self Guru - TI/produto | Self Guru - gestão |

- **TI/produto:** código, bugs, integrações, segurança, acessos e melhorias do produto.
- **Gestão:** comercial, marketing, conteúdo, financeiro, parcerias, operação.

Listas, replicando o quadro "Lumi - produto" da conta antiga:
- **TI/produto:** ACESSOS · BACKLOG · ROADMAP - MELHORIAS · TESTES · PROBLEMAS
- **Gestão:** BACKLOG · A FAZER · FAZENDO · FEITO

Etiquetas em todos os quadros:
- Urgente (vermelho), Alta (laranja), Normal (amarelo)
- Bug (roxo), Melhoria (azul), Conteúdo (verde), Comercial (céu)

## Responsáveis
- **TI de todos os produtos:** Lucas Vieira (será adicionado ao workspace).
- **Gestão de todos os quadros:** Talita (será adicionada ao workspace).
- Antes de atribuir, confira os membros com `trelloReadMember list_by_board`. Se a pessoa ainda não estiver no quadro, crie o card mesmo assim e avise que falta adicioná-la.

## Como criar cada card
1. **Quadro:** escolha pelo produto e pelo tipo (TI/produto ou gestão). Se não der para saber, pergunte.
2. **Lista:**
   - TI: BACKLOG por padrão; PROBLEMAS para bug ou incidente; ROADMAP - MELHORIAS para evolução planejada; ACESSOS para logins e links.
   - Gestão: A FAZER por padrão; BACKLOG quando não houver prazo.
3. **Título:** curto, começando por verbo.
4. **Descrição:** contexto (o que foi pedido, com as palavras da Talita), o resultado esperado, links e a linha `Responsável: <nome>`.
5. **Prazo (`due`):** em UTC. A Talita está em America/Sao_Paulo (UTC-3). "Sexta" = a próxima sexta às 18:00 de Brasília. Sem horário, use 18:00. Sem prazo informado, deixe sem prazo e diga isso na resposta.
6. **Etiquetas:** prioridade e tipo.
7. **Responsável:** a integração não coloca membros no card. Para compensar:
   - crie o checklist "Entregas", com cada item atribuído ao responsável (`trelloWriteChecklist add_item` com `memberId`);
   - comente marcando a pessoa: `@<username> card criado para você: <resumo>`.
8. **Resposta à Talita:** uma linha por card, com o quadro, a lista, o responsável, o prazo e o link (url completa).

Várias demandas na mesma mensagem viram um card cada. Antes de criar um card, procure se já existe um parecido (`trelloSearch search_cards`); se existir, comente nele em vez de duplicar.

## Montagem inicial (uma vez)
1. Crie os 10 quadros acima no workspace da conta nova, com visibilidade ORG, e as listas e etiquetas de cada um.
2. Copie os cards do quadro antigo "Lumi - produto" para "Lumi - TI/produto". O conteúdo está em `lumi-produto.json`, nesta pasta. O card do PDF de segurança tem anexo e precisa ser reenviado à mão. Se a conta nova tiver acesso ao quadro antigo, o melhor é usar o "Copiar quadro" do próprio Trello, que mantém os anexos.
3. Mostre para a Talita os links dos quadros criados e quem ainda falta convidar (Lucas, Talita).
