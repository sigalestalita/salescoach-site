-- NEXA Comercial · dados iniciais
-- Rode DEPOIS do schema.sql. Troque os e-mails abaixo pelos reais antes de rodar.

-- 1. Equipe. O papel 'admin' gerencia a equipe dentro do sistema.
insert into public.membros (email, nome, papel) values
  ('socio1@nexatech.ia.br', 'Sócio 1', 'admin'),
  ('socio2@nexatech.ia.br', 'Sócio 2', 'admin'),
  ('vendas@nexatech.ia.br', 'Vendedora', 'vendas')
on conflict (email) do update set nome = excluded.nome, papel = excluded.papel;

-- 2. Metas, preços, taxas e plano de 90 dias (copiados do sistema atual).
insert into public.docs (path, data) values
  ('config/geral', '{"medias": {"atlasColab": 150, "scUsers": 12}, "metas": {"2026-10": {"atlas": 0, "dias": 18, "fabrica": 1, "sc": 1}, "2026-11": {"atlas": 1, "dias": 19, "fabrica": 1, "sc": 2}, "2026-12": {"atlas": 1, "dias": 18, "fabrica": 1, "sc": 3}}, "precos": {"atlas": 8, "atlasImpl": 2000, "scEss": 19.9, "scEssImpl": 990, "scPro": 29.9, "scProImpl": 1690}, "probs": {"1": 0, "2": 0.05, "3": 0.1, "4": 0.2, "5": 0.4, "6": 0.6, "7": 1, "8": 0, "9": 0}, "taxas": {"diagnostico": 0.45, "fechamento": 0.3, "proposta": 0.5, "resposta": 0.15}, "vendedora": ""}'::jsonb),
  ('tarefas/t01', '{"entregavel": "Dúvidas anotadas", "fase": "Imersão", "ordem": 1, "quando": "Qui 01/10", "resp": "Vendedora", "status": "Feito", "tarefa": "Ler o playbook inteiro e assistir à demo dos produtos com um sócio."}'::jsonb),
  ('tarefas/t02', '{"entregavel": "Acesso funcionando", "fase": "Imersão", "ordem": 2, "quando": "Qui 01/10", "resp": "Sócios", "status": "A fazer", "tarefa": "Criar acesso ao Sales Coach para ela mesma e instalar a extensão."}'::jsonb),
  ('tarefas/t03', '{"entregavel": "1 análise lida", "fase": "Imersão", "ordem": 3, "quando": "Sex 02/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Fazer o próprio diagnóstico gravado com um sócio (roleplay) e ler a análise do Sales Coach."}'::jsonb),
  ('tarefas/t04', '{"entregavel": "Perfil pronto", "fase": "Imersão", "ordem": 4, "quando": "Sex 02/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Atualizar o perfil do LinkedIn (título, sobre, banner NEXA)."}'::jsonb),
  ('tarefas/t05', '{"entregavel": "Regras por escrito", "fase": "Imersão", "ordem": 5, "quando": "Sex 02/10", "resp": "Sócios", "status": "A fazer", "tarefa": "Definir desconto máximo, condição de piloto, e-mail comercial e proposta modelo."}'::jsonb),
  ('tarefas/t06', '{"entregavel": "Buscas salvas", "fase": "Base", "ordem": 6, "quando": "Seg 05/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Montar no LinkedIn as buscas salvas do cliente ideal (gestores comerciais e RH)."}'::jsonb),
  ('tarefas/t07', '{"entregavel": "60 contas, 30 A/B", "fase": "Base", "ordem": 7, "quando": "Seg 05/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Montar as primeiras 60 contas-alvo com nota de encaixe."}'::jsonb),
  ('tarefas/t08', '{"entregavel": "30 em cadência", "fase": "Base", "ordem": 8, "quando": "Ter 06/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Colocar as 30 primeiras contas A/B em cadência."}'::jsonb),
  ('tarefas/t09', '{"entregavel": "10 parceiros listados", "fase": "Base", "ordem": 9, "quando": "Qua 07/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Mapear 10 parceiros possíveis (consultorias de vendas e de RH)."}'::jsonb),
  ('tarefas/t10', '{"entregavel": "Reunião feita", "fase": "Base", "ordem": 10, "quando": "Qui 08/10, 9h", "resp": "Vendedora + sócios", "status": "A fazer", "tarefa": "Primeira reunião semanal: números da tela Semana + 3 aprendizados."}'::jsonb),
  ('tarefas/t11', '{"entregavel": "Diagnósticos na agenda", "fase": "Base", "ordem": 11, "quando": "Qui 08/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Follow-up de quem respondeu à cadência e marcar os primeiros diagnósticos."}'::jsonb),
  ('tarefas/t12', '{"entregavel": "Meta semanal ≥ 80%", "fase": "Tração", "ordem": 12, "quando": "Semanas 2 a 4", "resp": "Vendedora", "status": "A fazer", "tarefa": "Manter a meta diária de contas novas em cadência e o bloco de ligações."}'::jsonb),
  ('tarefas/t13', '{"entregavel": "8 posts", "fase": "Tração", "ordem": 13, "quando": "Semanas 2 a 4", "resp": "Vendedora", "status": "A fazer", "tarefa": "Publicar 2 posts por semana no LinkedIn pessoal (temas no playbook)."}'::jsonb),
  ('tarefas/t14', '{"entregavel": "2 parceiros ativos", "fase": "Tração", "ordem": 14, "quando": "Semanas 2 a 4", "resp": "Vendedora", "status": "A fazer", "tarefa": "Conversar com 5 parceiros e fechar 2 acordos de indicação."}'::jsonb),
  ('tarefas/t15', '{"entregavel": "1 contrato", "fase": "Tração", "ordem": 15, "quando": "Até 31/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Primeiro contrato de Sales Coach."}'::jsonb),
  ('tarefas/t16', '{"entregavel": "1 oportunidade", "fase": "Tração", "ordem": 16, "quando": "Até 31/10", "resp": "Vendedora", "status": "A fazer", "tarefa": "Primeira oportunidade da Fábrica levada aos sócios com diagnóstico escrito."}'::jsonb),
  ('tarefas/t17', '{"entregavel": "Funil recalculado", "fase": "Escala", "ordem": 17, "quando": "Novembro", "resp": "Vendedora", "status": "A fazer", "tarefa": "Trocar as taxas da tela Metas e preços pelas reais das 4 primeiras semanas."}'::jsonb),
  ('tarefas/t18', '{"entregavel": "1 caso escrito", "fase": "Escala", "ordem": 18, "quando": "Novembro", "resp": "Vendedora + sócios", "status": "A fazer", "tarefa": "Primeiro caso de cliente (depoimento curto ou número antes/depois)."}'::jsonb),
  ('tarefas/t19', '{"entregavel": "2 eventos", "fase": "Escala", "ordem": 19, "quando": "Novembro", "resp": "Vendedora", "status": "A fazer", "tarefa": "Participar de 2 eventos ou comunidades (vendas B2B e RH)."}'::jsonb),
  ('tarefas/t20', '{"entregavel": "3 contratos", "fase": "Escala", "ordem": 20, "quando": "Até 30/11", "resp": "Vendedora", "status": "A fazer", "tarefa": "2 contratos de Sales Coach e 1 de Atlas no mês."}'::jsonb),
  ('tarefas/t21', '{"entregavel": "Playbook v2", "fase": "Escala", "ordem": 21, "quando": "Dezembro", "resp": "Vendedora", "status": "A fazer", "tarefa": "Revisar o playbook com o que funcionou: mensagens, objeções, segmentos."}'::jsonb),
  ('tarefas/t22', '{"entregavel": "15 oportunidades", "fase": "Escala", "ordem": 22, "quando": "Dezembro", "resp": "Vendedora", "status": "A fazer", "tarefa": "Pipeline para janeiro: 15 oportunidades em diagnóstico ou depois."}'::jsonb)
on conflict (path) do nothing;
