# Sales Coach — site institucional

Site estático do Sales Coach (`index.html` + `assets/`). Sem build, sem dependências.

## Rodar localmente

Abra `index.html` no navegador, ou:

```sh
python3 -m http.server 8080
```

## Publicar

Qualquer hospedagem estática serve a pasta raiz deste repositório:

- **Cloudflare Pages** (recomendado): conectar este repo, *build command* vazio, *output directory* `/`.
- Netlify / Vercel: mesmo esquema, sem build.

## Editar

- Textos, seções e estilos estão todos em `index.html`.
- E-mail que recebe o formulário de demonstração: constante `CONTACT_EMAIL` no início do `<script>`.
- Endereço do sistema no botão **Entrar** (menu e rodapé): hoje `https://salescoach.grougp.com.br`. Trocar pelos dois links quando o CNAME `app.salescoach.app.br` estiver apontado.
- Logos de terceiros em `assets/logos/` (uso nominativo na seção Ecossistema).

## Estrutura

- `index.html` — o site inteiro: markup, CSS e JS num arquivo só.
- `assets/app/` — capturas reais do produto (ambiente de demonstração Sales Rocket).
- `assets/logos/` — marcas de terceiros, uso nominativo nas seções de integração.

Alguns arquivos em `assets/` não são usados pelo `index.html` atual e ficaram
como reserva: `hero.mp4`, `hero-poster.jpg`, `logo.png`, `mark.png` e as
capturas `agendas`, `insights`, `treino-conversa` e `treino-nota`. Somam cerca
de 1,4 MB e podem ser apagados sem afetar o site.
