"""Catálogo do acervo de conteúdo (lido por acervo.py).

Cada post: id, titulo, produto (nexa | sales-coach | atlas), editoria, formato, pasta (origem no
repositório), telas (padrões glob a partir da raiz do repositório), video (opcional), capa
(opcional), legenda e texto (('arquivo', caminho) ou ('secao', caminho, título do cabeçalho[, n])
ou um texto literal), serie, medida e nota. Conteúdo novo entra aqui, com a legenda no .md da pasta.
"""
import os, re

S = 'social/'


def _sec(arquivo, titulo, n=1):
    return ('secao', S + arquivo, titulo, n)


def _arq(arquivo):
    return ('arquivo', S + arquivo)


POSTS = []
add = POSTS.append

# ── NEXA ──────────────────────────────────────────────────────────────────
add(dict(id='nexa-prazer', titulo='Prazer, NEXA (vídeo de lançamento)', produto='nexa', editoria='Institucional', formato='Vídeo',
         pasta=S + 'nexa-showreel', video=S + 'nexa-showreel/out/nexa-showreel.mp4', poster=11, medida='16:9 · 58s',
         legenda=_arq('nexa-showreel/legenda.md'),
         nota='Capa do vídeo: o frame do logo em cromo, por volta do segundo 11.'))
add(dict(id='ia-outubro', titulo='O que rolou na IA em outubro (1ª quinzena)', produto='nexa', editoria='Notícias', formato='Carrossel',
         pasta=S + 'carrossel-ia-outubro', telas=[S + 'carrossel-ia-outubro/saida/IA-outubro-*.jpg'], medida='4:5 · 8 telas',
         legenda=_arq('carrossel-ia-outubro/legenda.md'), serie='IA sem tecniquês'))
add(dict(id='destaque-fabrica', titulo='Destaque · Fábrica de soluções', produto='nexa', editoria='Institucional', formato='Destaque',
         pasta=S + 'instagram-nexa/destaques', capa=S + 'instagram-nexa/jpg/capas/c9-fabrica.jpg',
         telas=[S + 'instagram-nexa/jpg/stories/d9-*.jpg'], medida='9:16 · 6 stories', serie='Destaques do perfil',
         texto=_sec('instagram-nexa/destaques/roteiro.md', '## 9 · Fábrica')))

# Série editorial na pegada do @nowdays (12 carrosséis, social/serie-nowdays)
NOWDAYS = [
    ('n1', 'dado-sem-conversa', 'Dado sem conversa é só planilha', 'nexa', 'Educativo'),
    ('n2', 'quantas-conversas', 'Quantas conversas do seu time você ouviu esta semana?', 'nexa', 'Conteúdo'),
    ('n3', 'cinco-livros', '5 livros para quem lidera pessoas', 'nexa', 'Conteúdo'),
    ('n4', 'ecossistema', 'Decidir sobre pessoas com dados', 'nexa', 'Comercial'),
    ('s1', 'reuniao-boa', 'Como saber se uma reunião de venda foi boa', 'sales-coach', 'Educativo'),
    ('s2', 'objecoes', 'O que responder quando o cliente diz "tá caro"', 'sales-coach', 'Conteúdo'),
    ('s3', 'melhor-vendedor-saiu', 'Seu melhor vendedor saiu. E o método dele?', 'sales-coach', 'Conteúdo'),
    ('s4', 'um-coach-em-cada-reuniao', 'Um coach em cada reunião do seu time', 'sales-coach', 'Comercial'),
    ('a1', 'clima-ou-360', 'Clima ou 360: qual pesquisa o seu time precisa?', 'atlas', 'Educativo'),
    ('a2', 'sinais-do-clima', 'O clima do seu time está pior do que parece?', 'atlas', 'Conteúdo'),
    ('a3', 'nr1-risco-psicossocial', 'NR-1: seu RH já mede risco psicossocial?', 'atlas', 'Educativo'),
    ('a4', 'trinta-reais', 'Ouvir o seu time custa R$ 30 por pessoa', 'atlas', 'Comercial'),
]
for cod, slug, titulo, produto, editoria in NOWDAYS:
    add(dict(id=f'serie-{cod}', titulo=titulo, produto=produto, editoria=editoria, formato='Carrossel',
             pasta=S + 'serie-nowdays', telas=[S + f'serie-nowdays/out/{cod}-{slug}/tela-*.jpg'], medida='4:5',
             legenda=_sec('serie-nowdays/legendas.md', f'## {cod} ·'), serie='Série editorial (pegada @nowdays)'))

# ── Sales Coach ───────────────────────────────────────────────────────────
add(dict(id='ponto-cego', titulo='O ponto cego dos gestores de vendas', produto='sales-coach', editoria='Conteúdo', formato='Carrossel',
         pasta=S + 'carrossel-ponto-cego', telas=[S + 'carrossel-ponto-cego/out/carrossel/card-*.jpg'], medida='4:5 · 11 telas',
         legenda=_arq('carrossel-ponto-cego/legenda.md')))
add(dict(id='sc-comparativo', titulo='Sales Coach x outros sistemas', produto='sales-coach', editoria='Comercial', formato='Carrossel',
         pasta=S + 'carrossel-sc-comparativo', telas=[S + 'carrossel-sc-comparativo/out/sc-comparativo-*.jpg'], medida='4:5 · 8 telas',
         legenda=_arq('carrossel-sc-comparativo/legenda.md')))
add(dict(id='delegue-carrossel', titulo='412 reuniões. Quantas você ouviu? (carrossel do anúncio)', produto='sales-coach', editoria='Comercial',
         formato='Carrossel', pasta=S + 'post-salescoach-delegue', telas=[S + 'post-salescoach-delegue/out/carrossel/card-*.jpg'],
         medida='4:5 · 11 telas', legenda=_sec('post-salescoach-delegue/legenda.md', '# Legenda · carrossel')))
add(dict(id='delegue-post', titulo='Seu time vende. O Sales Coach faz o resto.', produto='sales-coach', editoria='Comercial', formato='Post',
         pasta=S + 'post-salescoach-delegue', telas=[S + 'post-salescoach-delegue/out/post-*.jpg'], medida='4:5 e 1:1 · 2 versões',
         legenda=_sec('post-salescoach-delegue/legenda.md', '# Legenda · post'),
         nota='Duas versões (homem e mulher), cada uma em 4:5 e 1:1.'))
add(dict(id='reel-sc-claro', titulo='Reel: E se alguém estivesse ouvindo? (versão clara)', produto='sales-coach', editoria='Produto', formato='Reel',
         pasta=S + 'reel-lancamento-sales-sprint', video=S + 'reel-lancamento-sales-sprint/out/reel-sales-coach-versao-clara-narrado.mp4',
         poster=26.5, medida='9:16 · 1min56 · narrado', legenda=_arq('reel-lancamento-sales-sprint/legenda-reel.md'),
         nota='Também há a versão só com trilha: out/reel-sales-coach-versao-clara.mp4.'))
add(dict(id='lancamento-sales-sprint', titulo='Lançamento do Sales Coach no Sales Sprint', produto='sales-coach', editoria='Institucional',
         formato='Vídeo', pasta=S + 'reel-lancamento-sales-sprint', video=S + 'reel-lancamento-sales-sprint/out/lancamento-sales-coach-sales-sprint-narrado.mp4',
         poster=20, medida='16:9 · 1min30 · narrado',
         nota='Vídeo para o telão do evento, sem legenda de post. Versões: sem narração e para locução (out/).'))
add(dict(id='lancamento-claro', titulo='Lançamento do Sales Coach (versão clara narrada)', produto='sales-coach', editoria='Produto', formato='Vídeo',
         pasta=S + 'reel-lancamento-sales-sprint', video=S + 'reel-lancamento-sales-sprint/out/lancamento-sales-coach-versao-clara-narrado.mp4',
         poster=26, medida='16:9 · 2min04 · narrado', nota='Versão horizontal, base do reel claro. Sem legenda de post registrada.'))
add(dict(id='reel-sc-walkthrough', titulo='Reel: o Sales Coach por dentro', produto='sales-coach', editoria='Produto', formato='Reel',
         pasta=S + 'reel-salescoach', video='site-nexa-v2/assets/media/sales-coach.mp4', poster=19, medida='9:16 · 44,5s',
         legenda=_arq('reel-salescoach/legenda.md')))
add(dict(id='reel-sc-cards', titulo='Reel: do Google Agenda ao CRM (cards)', produto='sales-coach', editoria='Produto', formato='Reel',
         pasta=S + 'reel-salescoach-cards', video=S + 'reel-salescoach-cards/out/reel-sales-coach.mp4', poster=27, medida='9:16 · 53s',
         legenda=_arq('reel-salescoach-cards/legenda.md')))
add(dict(id='video-sc-light', titulo='Sales Coach em 22 segundos (light)', produto='sales-coach', editoria='Produto', formato='Vídeo',
         pasta=S + 'reel-salescoach-light', video=S + 'reel-salescoach-light/out/video-sales-coach-light.mp4', poster=8, medida='16:9 · 22s',
         legenda=_arq('reel-salescoach-light/legenda.md')))
add(dict(id='post-coach', titulo='Um coach de vendas em cada reunião', produto='sales-coach', editoria='Comercial', formato='Post',
         pasta=S + 'feed-salescoach', telas=[S + 'feed-salescoach/saida/post-coach.jpg'], medida='4:5',
         legenda=_sec('feed-salescoach/legendas.md', '## Post "Um coach')))
add(dict(id='post-guia-objecoes', titulo='Guia das objeções em vendas B2B', produto='sales-coach', editoria='Educativo', formato='Post',
         pasta=S + 'feed-salescoach', telas=[S + 'feed-salescoach/saida/post-guia-objecoes.jpg'], medida='4:5',
         legenda=_sec('feed-salescoach/legendas.md', '## Post "Guia'),
         nota='O post promete o guia com 12 objeções a quem comentar GUIA: o material precisa estar pronto antes de publicar.'))
add(dict(id='anuncio-sc-feed', titulo='Seu time merece um coach em cada reunião (feed)', produto='sales-coach', editoria='Comercial', formato='Post',
         pasta=S + 'story-anuncio', telas=[S + 'story-anuncio/out/feed-sales-coach.jpg'], medida='4:5',
         legenda=_sec('story-anuncio/legendas.md', '### Feed · `feed-sales-coach.jpg`')))
add(dict(id='anuncio-sc-story', titulo='Um coach de vendas em cada reunião (anúncio)', produto='sales-coach', editoria='Comercial', formato='Anúncio',
         pasta=S + 'story-anuncio', telas=[S + 'story-anuncio/out/story-sales-coach.jpg'], medida='9:16',
         legenda=_sec('story-anuncio/legendas.md', '### Anúncio (Stories e feed)', 1)))
add(dict(id='form-leads-sc', titulo='Formulário de leads do Sales Coach', produto='sales-coach', editoria='Comercial', formato='Anúncio',
         pasta=S + 'form-leads-salescoach', telas=[S + 'form-leads-salescoach/out/*.jpg', S + 'form-leads-salescoach/out/*.png'],
         nota='Imagens do formulário de cadastro (anúncio de geração de leads). Sem legenda registrada.'))
add(dict(id='chrome-web-store', titulo='Sales Coach na Chrome Web Store', produto='sales-coach', editoria='Produto', formato='Loja',
         pasta=S + 'chrome-web-store', telas=[S + 'chrome-web-store/saida/sales-coach-loja-*.jpg'], medida='1280×800 · 5 telas',
         nota='Imagens da página da extensão na loja do Chrome.'))

# Instagram da NEXA: 42 posts do Sales Coach (social/instagram-nexa)
SERIES = [(1, 5, 'Produto', 'Série desdobrada'), (6, 10, 'Conteúdo', 'Série manchete'), (11, 20, 'Produto', 'Série tela'),
          (21, 33, 'Dados', 'Série dados'), (34, 40, 'Conteúdo', 'Série argumento'), (41, 41, 'Produto', 'Série conversa'),
          (42, 42, 'Institucional', 'Série animada')]
COMERCIAIS = {5, 10}
_pasta = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), S + 'instagram-nexa/jpg/posts')
_leg = open(os.path.join(os.path.dirname(_pasta), '..', 'legendas.md'), encoding='utf-8').read()
for arq in sorted(os.listdir(_pasta)):
    m = re.match(r'(\d\d)-(.+)\.jpg$', arq)
    if not m:
        continue
    n = int(m.group(1))
    ed, serie = next((e, s) for a, b, e, s in SERIES if a <= n <= b)
    cab = re.search(rf'^### {n:02d} · `[^`]+`(?: — (.+))?$', _leg, re.M)
    sub = cab.group(1) if cab and cab.group(1) else ''
    titulo = m.group(2).replace('-', ' ')
    titulo = titulo[0].upper() + titulo[1:]
    add(dict(id=f'insta-{n:02d}', titulo=f'{n:02d} · {titulo}', produto='sales-coach',
             editoria='Comercial' if n in COMERCIAIS else ed, formato='Post', pasta=S + 'instagram-nexa',
             telas=[S + f'instagram-nexa/jpg/posts/{arq}'], medida='4:5' + (f' · {sub}' if sub else ''),
             legenda=_sec('instagram-nexa/legendas.md', f'### {n:02d} ·'), serie=f'Instagram NEXA · {serie}'))

DESTAQUES = [('d1', 'c1-como-funciona', 'Como funciona', 1), ('d2', 'c2-na-pratica', 'Na prática', 2), ('d3', 'c3-integracoes', 'Integrações', 3),
             ('d4', 'c4-planos', 'Planos', 4), ('d5', 'c5-assistente', 'Assistente', 5), ('d6', 'c6-analise', 'Análise', 6)]
for d, capa, nome, k in DESTAQUES:
    add(dict(id=f'destaque-{d}', titulo=f'Destaque · {nome}', produto='sales-coach', editoria='Comercial' if d == 'd4' else 'Produto',
             formato='Destaque', pasta=S + 'instagram-nexa/destaques', capa=S + f'instagram-nexa/jpg/capas/{capa}.jpg',
             telas=[S + f'instagram-nexa/jpg/stories/{d}-*.jpg'], medida='9:16 · 6 stories', serie='Destaques do perfil',
             texto=_sec('instagram-nexa/destaques/roteiro.md', f'## {k} · {nome}')))

add(dict(id='noticia-itau-neospace', titulo='Notícia: Itaú compra a NeoSpace por R$ 2,9 bi', produto='nexa', editoria='Notícias', formato='Carrossel',
         pasta=S + 'serie-frases-cena', telas=[S + 'serie-frases-cena/out/itau-neospace/*.jpg'], medida='4:5 · 8 telas',
         legenda=_arq('serie-frases-cena/legenda-itau-neospace.md'),
         nota='Imagens geradas por IA (ative o rótulo). Logo do Itaú oficial, aplicado em montagem/nx-n1.html.'))
# ── Atlas ─────────────────────────────────────────────────────────────────
add(dict(id='atlas-fofos', titulo='Verdades duras sobre RH com imagens fofas', produto='atlas', editoria='Conteúdo', formato='Carrossel',
         pasta=S + 'carrossel-atlas-fofos', telas=[S + 'carrossel-atlas-fofos/out/carrossel/card-*.jpg'], medida='4:5 · 8 telas',
         legenda=_arq('carrossel-atlas-fofos/legenda.md')))
add(dict(id='atlas-verdades', titulo='Verdades que o RH precisa ouvir', produto='atlas', editoria='Conteúdo', formato='Carrossel',
         pasta=S + 'carrossel-atlas-verdades', telas=[S + 'carrossel-atlas-verdades/out/atlas-verdades-*.jpg'], medida='4:5 · 7 telas',
         legenda=_arq('carrossel-atlas-verdades/legenda.md')))
add(dict(id='atlas-saude-mental', titulo='Saúde mental passou o câncer (NR-1 e riscos psicossociais)', produto='atlas', editoria='Educativo', formato='Carrossel',
         pasta=S + 'carrossel-atlas-saude-mental', telas=[S + 'carrossel-atlas-saude-mental/out/atlas-saude-mental-*.jpg'], medida='4:5 · 8 telas',
         legenda=_arq('carrossel-atlas-saude-mental/legenda.md'),
         nota='Fontes no rodapé de cada tela e no README da pasta (Ipsos 2026, Previdência Social 2025, NR-1).'))
add(dict(id='atlas-saude-mental-v2', titulo='Saúde mental passou o câncer (estilo Ponto cego)', produto='atlas', editoria='Educativo', formato='Carrossel',
         pasta=S + 'carrossel-atlas-saude-mental-v2', telas=[S + 'carrossel-atlas-saude-mental-v2/out/carrossel/card-*.jpg'], medida='4:5 · 10 telas',
         legenda=_arq('carrossel-atlas-saude-mental-v2/legenda.md'),
         nota='Pessoas geradas por IA: ative o rótulo "Conteúdo feito com IA" ao publicar. Fontes no rodapé dos cards e no README.'))
add(dict(id='reel-atlas-pulso', titulo='Reel: Como sua equipe está, de verdade? (NR-1)', produto='atlas', editoria='Educativo', formato='Reel',
         pasta=S + 'reel-atlas', video=S + 'reel-atlas/out/reel-atlas-clima-pulso.mp4', poster=2, medida='9:16 · 40s',
         legenda=_arq('reel-atlas/legenda.md'), nota='Pessoas geradas por IA: ative o rótulo "Conteúdo feito com IA" ao publicar.'))
add(dict(id='reel-atlas-clima', titulo='Reel: o Atlas Clima por dentro', produto='atlas', editoria='Produto', formato='Reel',
         pasta=S + 'reel-atlas-clima', video='site-nexa-v2/assets/media/atlas-clima.mp4', poster=22, medida='9:16 · 44,5s',
         legenda=_arq('reel-atlas-clima/legenda.md')))
add(dict(id='reel-atlas-360', titulo='Reel: o Atlas 360 por dentro', produto='atlas', editoria='Produto', formato='Reel',
         pasta=S + 'reel-atlas-360', video='site-nexa-v2/assets/media/atlas-360.mp4', poster=20, medida='9:16 · 41s',
         legenda=_arq('reel-atlas-360/legenda.md')))
add(dict(id='anuncio-atlas-feed', titulo='Sua empresa merece ouvir o time de verdade (feed)', produto='atlas', editoria='Comercial', formato='Post',
         pasta=S + 'story-anuncio', telas=[S + 'story-anuncio/out/feed-atlas.jpg'], medida='4:5',
         legenda=_sec('story-anuncio/legendas.md', '### Feed · `feed-atlas.jpg`')))
add(dict(id='anuncio-atlas-story', titulo='Clima e feedback 360 em uma só plataforma (anúncio)', produto='atlas', editoria='Comercial',
         formato='Anúncio', pasta=S + 'story-anuncio', telas=[S + 'story-anuncio/out/story-atlas.jpg'], medida='9:16',
         legenda=_sec('story-anuncio/legendas.md', '### Anúncio (Stories e feed)', 2)))
for d, capa, nome, k in [('d7', 'c7-atlas-clima', 'Atlas Clima', 7), ('d8', 'c8-atlas-360', 'Atlas 360', 8)]:
    add(dict(id=f'destaque-{d}', titulo=f'Destaque · {nome}', produto='atlas', editoria='Produto', formato='Destaque',
             pasta=S + 'instagram-nexa/destaques', capa=S + f'instagram-nexa/jpg/capas/{capa}.jpg',
             telas=[S + f'instagram-nexa/jpg/stories/{d}-*.jpg'], medida='9:16 · 6 stories', serie='Destaques do perfil',
             texto=_sec('instagram-nexa/destaques/roteiro.md', f'## {k} · {nome}')))
