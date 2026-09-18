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
- E-mail que recebe o formulário de piloto: constante `CONTACT_EMAIL` no início do `<script>`.
- Logos de terceiros em `assets/logos/` (uso nominativo na seção Ecossistema).
