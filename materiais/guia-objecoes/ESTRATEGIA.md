# Guia das objeções · funil de captação do Sales Coach

Material gratuito para gerar leads qualificados do Sales Coach, com tráfego pago (Meta Ads) e orgânico (Instagram).

| Peça | Onde está |
|---|---|
| Guia (PDF, 18 páginas) | https://nexatech.ia.br/materiais/guia-objecoes-vendas-b2b.pdf · fonte em `materiais/guia-objecoes/` |
| Landing page | https://nexatech.ia.br/guia-objecoes/ · fonte em `lp/guia-objecoes/` |
| Página de obrigado | https://nexatech.ia.br/guia-objecoes/obrigado/ |
| Política de privacidade | https://nexatech.ia.br/privacidade/ |
| Gravação do lead | edge function `lead-material` → tabela `leads_inbound` + conta no CRM (fila, chip "inbound") |
| Automação "comente GUIA" | edge function `instagram-guia` → tabela `ig_respostas` |
| Post de feed | `social/feed-salescoach/post-guia-objecoes.html` |

## 1. O funil

```
Anúncio (Meta) ─────────────────────────┐
Post orgânico ── comenta GUIA ── direct ─┼─> Landing page ─> formulário ─> obrigado + download
Direct "GUIA" ───────────────── direct ──┘                        │
                                                                   └─> conta no CRM (fila) ─> WhatsApp da Dandara em até 24h
```

**Por que o direct manda para a landing page, e não o PDF direto:** sem a LP, o lead não deixa contato, o Pixel não marca a conversão e não dá para medir nem criar públicos. A LP leva 30 segundos e o download começa sozinho.

**Por que pedir WhatsApp, cargo e tamanho do time:** é o que separa curioso de oportunidade. Pedir mais campos baixa um pouco a conversão da página, mas cada lead chega com o que a Dandara precisa para priorizar, e esses mesmos campos alimentam os públicos semelhantes dos anúncios.

### Prioridade no CRM

| Perfil (cargo + time) | O que fazer |
|---|---|
| Sócio/CEO, diretor ou gerente com time de **6 ou mais** | WhatsApp em até 24h, oferecer demonstração |
| Gestor com time de **2 a 5** | WhatsApp em até 48h, conversa de diagnóstico |
| Vendedor/SDR, ou **"Só eu"** | Não abordar para venda; mover para Nutrir |

## 2. Anúncios (Meta Ads)

### Estrutura

1. **Captação (frio)**: objetivo *Leads*, conversão no site, evento `Lead`.
   - Público: Brasil, 25 a 55 anos. Use o Advantage+ com sugestões de interesse: gestão de vendas, vendas B2B, inside sales, CRM, HubSpot, RD Station, Pipedrive, Salesforce, liderança comercial.
   - Posicionamentos: Feed e Stories/Reels do Instagram e do Facebook.
2. **Remarketing**: quem visitou a LP e não converteu (7 dias) e quem engajou com o Instagram (30 dias).
   - Criativo de objeção específica ("Seu vendedor sabe o que responder quando ouve 'tá caro'?").
3. **Semelhantes** (depois de ~50 leads qualificados): exporte de `leads_inbound` só os gestores com time de 6 ou mais e crie um público semelhante de 1% a 3%.

### Orçamento de teste

R$ 50 a R$ 80 por dia na captação, por 7 dias, antes de qualquer decisão. Com 3 criativos, deixe o algoritmo escolher; depois corte o pior.

### Links com UTM

```
https://nexatech.ia.br/guia-objecoes/?utm_source=meta&utm_medium=paid&utm_campaign=guia-objecoes&utm_content={{ad.name}}
```

As UTMs ficam gravadas em cada lead (`leads_inbound.utm`) e aparecem nas observações da conta no CRM.

### O que medir

| Métrica | Onde | Referência inicial (não é promessa) |
|---|---|---|
| Custo por lead (CPL) | Gerenciador de anúncios | comparar semana a semana |
| Conversão da LP (leads ÷ visitas) | Gerenciador + `leads_inbound` | material gratuito costuma ficar entre 20% e 40% |
| % de leads qualificados (gestor com time de 6+) | `leads_inbound` | é o número que mais importa |
| Custo por demonstração agendada | CRM (Pipeline) | o número que decide se escala |

Consulta pronta para o Supabase:

```sql
select date_trunc('day', criado_em) dia, count(*) leads,
       count(*) filter (where tamanho_time in ('6 a 15','16 a 50','Mais de 50') and cargo <> 'Vendedor(a), SDR ou closer') qualificados,
       utm->>'utm_content' anuncio
from leads_inbound where material = 'guia-objecoes'
group by 1, 4 order by 1 desc;
```

### Textos para os anúncios

**A · dor direta**
> "Achei caro." "Vou pensar." "Me manda por e-mail."
> Seu time ouve isso toda semana. O que vem depois decide a venda.
> Baixe grátis o Guia das objeções em vendas B2B: 12 objeções, o que está por trás de cada uma e as perguntas para retomar a conversa.
> Título: **Guia grátis: 12 objeções e o que responder** · Botão: *Baixar*

**B · gestor**
> Você não consegue estar em todas as reuniões do time. Mas pode garantir que todo mundo saiba o que responder.
> Guia gratuito com as 12 objeções mais comuns em vendas B2B e um checklist para o treino semanal.
> Título: **Padronize a resposta do seu time** · Botão: *Baixar*

**C · curiosidade**
> Desconto na primeira objeção confirma que o preço era o problema.
> Esse é um dos 12 cuidados do Guia das objeções em vendas B2B. Grátis, em PDF.
> Título: **O erro mais caro no "tá caro"** · Botão: *Baixar*

Criativos:
- o post de feed já pronto, para Feed;
- uma versão 9:16 para Stories/Reels;
- um carrossel com 3 objeções (capa, 3 páginas, CTA).

### Pixel da Meta

1. Pegue o ID do Pixel no Gerenciador de Eventos.
2. Cole em `window.LP = { pixel: '...' }` nos dois arquivos:
   - `guia-objecoes/index.html`
   - `guia-objecoes/obrigado/index.html`

A LP dispara `PageView`, `ViewContent` e `Lead` (no envio do formulário); a página de obrigado dispara `Contact` no clique do WhatsApp.

Próximo passo recomendado: enviar o `Lead` também pela **API de Conversões** (servidor), para não perder conversões bloqueadas por navegador. O `eventID` já é gerado na LP para deduplicar.

## 3. Automação "comente GUIA" no Instagram

A função já está no ar: `https://atzwinvlemkyttkrdumn.supabase.co/functions/v1/instagram-guia`.

O que ela faz:
- **Comentário com "guia"** (em qualquer post ou reel): manda o link no direct (resposta privada) e responde publicamente "te mandei no direct", variando a frase.
- **Mensagem no direct com "guia"**: responde na conversa com o link.
- **Deduplicação**: responde cada comentário uma vez só, ignora os comentários da própria conta e grava tudo em `ig_respostas`, com status e erro.
- **Token**: renova sozinho o token do Instagram, que expira em 60 dias.

### Para ligar (uma vez, ~30 minutos)

1. **Conta profissional:** @nexatech_ia precisa ser conta Comercial ou de Criador.
2. **App da Meta:**
   - Em developers.facebook.com, crie um app do tipo *Business* e adicione o produto **Instagram** → *API setup with Instagram login*.
   - Em *Generate access tokens*, conecte o @nexatech_ia e gere o token. Anote também o **Instagram User ID** que aparece ali.
   - Em *App settings → Basic*, copie o **App secret**.
3. **Segredos no Supabase** (projeto nexa-comercial → Edge Functions → Secrets):
   - `IG_ACCESS_TOKEN`: o token gerado
   - `IG_APP_SECRET`: o app secret
   - `IG_USER_ID`: o ID da conta
   - `IG_VERIFY_TOKEN`: uma palavra qualquer, por exemplo `nexa-guia-2026`
4. **Webhooks** (no app → Instagram → *Configure webhooks*):
   - Callback URL: `https://atzwinvlemkyttkrdumn.supabase.co/functions/v1/instagram-guia`
   - Verify token: o mesmo `IG_VERIFY_TOKEN`
   - Assine os campos `comments` e `messages`.
5. **Permissões:**
   - `instagram_business_basic`
   - `instagram_business_manage_comments`
   - `instagram_business_manage_messages`
6. **Modo Live:** em *App settings → Basic*, preencha:
   - política de privacidade: `https://nexatech.ia.br/privacidade/`
   - exclusão de dados: a mesma URL

   Depois, mude o app para **Live**.
7. **Testar:** comente "GUIA" num post a partir de outra conta. Em segundos chega o direct. Confira em `select * from ig_respostas order by criado_em desc`.

**Atenção, revisão da Meta:**
- Em modo de desenvolvimento, a automação só responde a contas com papel no app (admin, testador).
- Para responder a qualquer pessoa, a Meta pode exigir *Advanced Access* às permissões, o que passa por **revisão do app e verificação da empresa** (alguns dias a algumas semanas).
- Se precisar rodar antes disso, o **ManyChat** (parceiro oficial da Meta) faz o mesmo "comente palavra → direct" em minutos, por cerca de US$ 15/mês. A mensagem e o link são os mesmos.

**Comentários em anúncios:** a Meta entrega comentários de anúncios pelo mesmo webhook em boa parte dos casos, mas não em todos. Teste antes de montar uma campanha baseada em "comente GUIA". Para anúncio, o caminho mais mensurável é o clique direto para a LP.

**Regras do Instagram para a resposta privada:**
- é uma por comentário, em até 7 dias;
- se a pessoa não segue a conta, a mensagem cai em "solicitações";
- por isso a resposta pública "te mandei no direct" importa: ela avisa onde procurar.

## 4. Follow-up da Dandara (WhatsApp)

**Gestor com time de 6+ (até 24h):**
> Oi, {nome}! Aqui é a Dandara, da NEXA. Vi que você baixou o Guia das objeções. Uma curiosidade: das 12, qual é a que mais aparece nas reuniões do seu time hoje?

Se responder:
> Faz sentido. Essa é exatamente a que o Sales Coach pega ao vivo: quando o lead fala, a dica aparece na tela do vendedor. Quer ver em 20 minutos como fica numa reunião de verdade?

**Gestor com time de 2 a 5 (até 48h):**
> Oi, {nome}! Dandara, da NEXA, aqui. Espero que o guia ajude. Se quiser, te mostro como outros gestores estão usando o checklist do fim do guia no treino semanal. Quanto tempo vocês dedicam a treino hoje?

**Sem resposta em 3 dias:**
> {nome}, uma última: a objeção 9 ("vou pensar") é a que mais derruba negócio no fim do funil. Se quiser, te mando como o Sales Coach ajuda o time nela. Se não for o momento, sem problema!

## 5. Atualizar o material

```bash
cd materiais/guia-objecoes
node gerar-pdf.mjs saida          # gera o PDF e as prévias das páginas
```

Copie o PDF para `nexa-site/materiais/` e as prévias usadas pela LP para `nexa-site/guia-objecoes/img/`. O conteúdo das 12 objeções está em `conteudo.js`.
