# NEXA · site v2

Home + páginas do Sales Coach e do Atlas (Clima e 360), na identidade da NEXA
(escuro e lima), com o anel de capas no hero, narrativa fixa por
funcionalidade, vídeos dos walkthroughs e demos interativas do Atlas.

- `index.html`, `sales-coach/index.html`, `atlas/index.html`: gerados por
  `_gerar/home.py`, `_gerar/salescoach.py` e `_gerar/atlas.py` (partes comuns
  em `_gerar/partes.py`). Edite o gerador e rode `python3 <arquivo>.py` dentro
  de `_gerar/`.
- `assets/site.css` e `assets/site.js`: estilo e comportamento de todas as páginas.
- `assets/telas/`: telas recriadas a partir dos apps reais (dados de demonstração).
- `assets/capas/`: capas do anel. `assets/media/`: vídeos de 45s de cada produto.
- Bibliotecas por CDN (jsDelivr): GSAP + ScrollTrigger e Lenis. Sem elas o site
  funciona, só sem rolagem suave e sem a vitrine horizontal fixada.

O conteúdo do Atlas descreve só o que existe no app (atlas-grou): no 360,
autoavaliação × pares, matriz quem avalia quem e PDF; sem IA e sem módulo de NR-1.

## Acervo de conteúdo (área interna, `/acervo/`)

Repositório pesquisável de tudo o que foi criado para as redes (NEXA, Sales Coach e Atlas):
abas por produto, filtros de editoria e formato, busca nas legendas, o post aberto com as telas
(ou o vídeo), a legenda para copiar e os arquivos para baixar. Não aparece no menu do site e
tem `noindex`.

- `_gerar/acervo_catalogo.py`: a lista dos conteúdos (produto, editoria, formato, telas, vídeo e
  de onde vem a legenda). Conteúdo novo entra aqui, com a legenda no `.md` da pasta em `social/`.
- `_gerar/acervo.py`: copia as telas (JPG de 1080 px) e os vídeos (720p) para `acervo/midia/`
  e escreve `acervo/dados.js` e `acervo/index.html`. Rode `python3 acervo.py` dentro de `_gerar/`;
  só a mídia que mudou é reprocessada. Pede o ffmpeg do imageio (caminho em `FF`).
- `acervo/acervo.css` e `acervo/acervo.js`: a interface (usa os tokens e o tema de `assets/site.css`).

**Acesso:** a página é estática, então `noindex` só tira dos buscadores; quem tiver o link
abre. Para restringir de verdade, proteja o caminho `/acervo/*` com o Cloudflare Access
(Zero Trust → Access → Applications → Self-hosted, domínio `nexatech.ia.br`, caminho `acervo`,
política com os e-mails do time). Na publicação, vale também o cabeçalho
`X-Robots-Tag: noindex` para `/acervo/*` no `_headers`.
