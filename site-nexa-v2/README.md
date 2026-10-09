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
