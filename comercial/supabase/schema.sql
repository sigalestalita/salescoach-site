-- NEXA Comercial · estrutura do banco no Supabase
-- Rode este arquivo inteiro no Supabase: SQL Editor → New query → colar → Run.
-- Pode ser rodado de novo sem perder dados.

-- Quem pode entrar no sistema e com qual papel.
--   admin   → usa o sistema e gerencia a equipe
--   vendas  → usa o sistema (cria, edita e exclui)
--   leitura → só consulta
create table if not exists public.membros (
  email     text primary key check (email = lower(email)),
  nome      text,
  papel     text not null default 'vendas' check (papel in ('admin', 'vendas', 'leitura')),
  criado_em timestamptz not null default now()
);

-- Todos os dados do sistema: um registro por documento, endereçado por caminho
-- (ex.: "oportunidades/abc123", "config/geral", "tarefas/t01").
create table if not exists public.docs (
  path       text primary key check (path ~ '^[A-Za-z0-9_.~:@+-]+(/[A-Za-z0-9_.~:@+-]+)+$'),
  col        text not null default '',
  data       jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create index if not exists docs_col_idx on public.docs (col);

-- Papel de quem está logado (pelo e-mail do login).
create or replace function public.meu_papel() returns text
language sql stable security definer set search_path = public as $$
  select papel from public.membros where email = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;
create or replace function public.pode_ler() returns boolean
language sql stable as $$ select public.meu_papel() is not null $$;
create or replace function public.pode_editar() returns boolean
language sql stable as $$ select coalesce(public.meu_papel() in ('admin', 'vendas'), false) $$;
create or replace function public.e_admin() returns boolean
language sql stable as $$ select coalesce(public.meu_papel() = 'admin', false) $$;

-- Preenche coleção, data e autor de cada gravação.
create or replace function public.docs_carimbo() returns trigger
language plpgsql as $$
begin
  new.col := regexp_replace(new.path, '/[^/]+$', '');
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists docs_carimbo on public.docs;
create trigger docs_carimbo before insert or update on public.docs
  for each row execute function public.docs_carimbo();

-- Segurança: só quem está na tabela membros vê ou altera dados.
alter table public.docs enable row level security;
alter table public.membros enable row level security;

drop policy if exists docs_ler on public.docs;
drop policy if exists docs_inserir on public.docs;
drop policy if exists docs_alterar on public.docs;
drop policy if exists docs_excluir on public.docs;
create policy docs_ler     on public.docs for select to authenticated using (public.pode_ler());
create policy docs_inserir on public.docs for insert to authenticated with check (public.pode_editar());
create policy docs_alterar on public.docs for update to authenticated using (public.pode_editar()) with check (public.pode_editar());
create policy docs_excluir on public.docs for delete to authenticated using (public.pode_editar());

drop policy if exists membros_ler on public.membros;
drop policy if exists membros_admin on public.membros;
create policy membros_ler   on public.membros for select to authenticated using (public.pode_ler());
create policy membros_admin on public.membros for all    to authenticated using (public.e_admin()) with check (public.e_admin());

revoke all on public.docs, public.membros from anon;
grant select, insert, update, delete on public.docs, public.membros to authenticated;

-- Atualização em tempo real entre quem está com o sistema aberto.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs') then
    execute 'alter publication supabase_realtime add table public.docs';
  end if;
end $$;

-- Lusha: registro de créditos gastos (só a função "lusha" grava) e limite mensal (só admin muda).
create table if not exists public.lusha_uso (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  usuario text, acao text not null, quantidade int not null default 0,
  creditos numeric not null default 0, detalhe jsonb
);
create index if not exists lusha_uso_mes_idx on public.lusha_uso (criado_em);
alter table public.lusha_uso enable row level security;
create table if not exists public.lusha_config (
  id int primary key default 1 check (id = 1),
  limite_mensal int not null default 300 check (limite_mensal >= 0),
  atualizado_em timestamptz not null default now()
);
alter table public.lusha_config enable row level security;
insert into public.lusha_config (id) values (1) on conflict (id) do nothing;
revoke all on public.lusha_uso, public.lusha_config from anon;
grant select on public.lusha_uso to authenticated;
grant select, update on public.lusha_config to authenticated;
drop policy if exists lusha_uso_ler on public.lusha_uso;
drop policy if exists lusha_config_ler on public.lusha_config;
drop policy if exists lusha_config_admin on public.lusha_config;
create policy lusha_uso_ler on public.lusha_uso for select to authenticated using (public.pode_ler());
create policy lusha_config_ler on public.lusha_config for select to authenticated using (public.pode_ler());
create policy lusha_config_admin on public.lusha_config for update to authenticated using (public.e_admin()) with check (public.e_admin());
