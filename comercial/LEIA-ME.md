# NEXA Comercial

Sistema comercial com login e senha, para publicar em `comercial.nexatech.ia.br`.

- Site estático (esta pasta), hospedado no Cloudflare Pages.
- Login, senha e banco de dados no Supabase (plano gratuito).
- Só entra quem tem login **e** está na tabela de equipe. A regra fica no banco, não na página.

## 1. Criar o banco no Supabase (10 min)

1. Crie uma conta em supabase.com e um projeto novo. Região: **South America (São Paulo)**. Guarde a senha do banco.
2. Menu **SQL Editor → New query**: cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Abra `supabase/seed.sql`, troque os três e-mails de exemplo pelos e-mails reais (sócios como `admin`, vendedora como `vendas`), cole numa nova query e clique em **Run**. Isso também carrega metas, preços, taxas e o plano de 90 dias.
4. Menu **Authentication → Sign In / Providers → Email**:
   - desligue **Allow new users to sign up** (ninguém cria conta sozinho);
   - mantenha o login por e-mail e senha ligado.
5. Menu **Authentication → URL Configuration**:
   - Site URL: `https://comercial.nexatech.ia.br`
   - Redirect URLs: `https://comercial.nexatech.ia.br/**`
6. Menu **Authentication → Users → Add user → Create new user**, para cada pessoa da equipe:
   - mesmo e-mail que está na tabela de equipe;
   - uma senha provisória;
   - marque **Auto Confirm User**.
   Passe a senha provisória para a pessoa. No sistema, ela clica em **Trocar senha**.
7. Menu **Project Settings → API** (ou **Data API**): copie a **Project URL** e a chave **anon public** e cole em `config.js`. Nunca use a chave `service_role` neste arquivo.

## 2. Publicar no Cloudflare Pages (5 min)

1. Cloudflare → **Workers & Pages → Create → Pages → Upload assets**.
2. Nome do projeto: `nexa-comercial`. Envie o .zip desta pasta (já com o `config.js` preenchido).
3. No projeto: **Custom domains → Set up a custom domain** → `comercial.nexatech.ia.br`. Como o domínio já está na Cloudflare, o DNS é criado sozinho.

## 3. Equipe no dia a dia

- Pessoa nova: um admin inclui o e-mail na tela **Equipe** do sistema e cria o login no Supabase (passo 1.6).
- Pessoa que saiu: remova na tela **Equipe** e exclua o login em **Authentication → Users**.
- Esqueceu a senha: em **Authentication → Users**, abra a pessoa e defina uma nova senha provisória.
  O link "Esqueci minha senha" da tela de login só envia e-mail depois de configurar um SMTP próprio no Supabase (**Authentication → Emails → SMTP Settings**, por exemplo com Resend ou Zoho no domínio nexatech.ia.br). Sem isso, o envio padrão do Supabase é limitado.

## Papéis

| Papel   | Pode                                             |
|---------|--------------------------------------------------|
| admin   | usar tudo e gerenciar a equipe                   |
| vendas  | criar, editar e excluir contas, oportunidades etc. |
| leitura | só consultar                                     |

## Arquivos

- `index.html`: o sistema inteiro.
- `config.js`: endereço e chave pública do Supabase.
- `supabase/schema.sql`: tabelas e regras de acesso. Pode ser rodado de novo sem perder dados.
- `supabase/seed.sql`: equipe inicial e dados de partida.
- `vendor/`: bibliotecas (Supabase e leitura de .xlsx), sem depender de CDN.
- `_headers`: cabeçalhos de segurança e cache do Cloudflare.
