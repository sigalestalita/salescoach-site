"""Acervo de conteúdo das redes (área interna do site): python3 acervo.py

Lê os posts de ../../social (catálogo em acervo_catalogo.py), copia as telas e os vídeos para
../acervo/midia/<id>/ em tamanho de web e escreve ../acervo/dados.js e ../acervo/index.html.
As legendas vêm dos .md de cada pasta, então editar a legenda lá e rodar de novo atualiza o acervo.
Só reprocessa a mídia que mudou (compara as datas dos arquivos).
"""
import glob, html, json, os, re, subprocess, sys, unicodedata
from datetime import date

from partes import NEXA_D, V
from acervo_catalogo import POSTS

AQUI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(AQUI)
REPO = os.path.dirname(SITE)
DEST = os.path.join(SITE, 'acervo')
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'

PRODUTOS = {'nexa': 'NEXA', 'sales-coach': 'Sales Coach', 'atlas': 'Atlas'}
EDITORIAS = ['Educativo', 'Conteúdo', 'Dados', 'Notícias', 'Produto', 'Comercial', 'Institucional']
FORMATOS = ['Carrossel', 'Post', 'Destaque', 'Reel', 'Vídeo', 'Anúncio', 'Loja']


# ── Legendas ──────────────────────────────────────────────────────────────
def _limpa(t):
    linhas = []
    for l in t.strip('\n').split('\n'):
        l = re.sub(r'^> ?', '', l)
        linhas.append(l.replace('**', ''))
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(linhas)).strip()


def secao(arquivo, titulo, n=1, ate_regua=True):
    """Texto entre o cabeçalho que contém `titulo` (n-ésima ocorrência) e o próximo cabeçalho de
    nível igual ou maior (ou a régua ---)."""
    linhas = open(os.path.join(REPO, arquivo), encoding='utf-8').read().split('\n')
    achou, ini, nivel = 0, None, 0
    for i, l in enumerate(linhas):
        m = re.match(r'^(#+) ', l)
        if m and titulo in l:
            achou += 1
            if achou == n:
                ini, nivel = i + 1, len(m.group(1))
                break
    if ini is None:
        sys.exit(f'legenda não encontrada: {arquivo} · {titulo}')
    fim = len(linhas)
    for j in range(ini, len(linhas)):
        m = re.match(r'^(#+) ', linhas[j])
        if (m and len(m.group(1)) <= nivel) or (ate_regua and linhas[j].strip() == '---'):
            fim = j
            break
    return _limpa('\n'.join(linhas[ini:fim]))


def arquivo_todo(arquivo):
    """Legenda de arquivo com um post só: tudo depois do título."""
    t = open(os.path.join(REPO, arquivo), encoding='utf-8').read()
    t = re.sub(r'^# .*\n', '', t, count=1)
    t = t.split('\n> ')[0] if '\n> ' in t else t
    return _limpa(t)


def legenda(spec):
    if spec is None:
        return ''
    if isinstance(spec, str):
        return spec.strip()
    if spec[0] == 'arquivo':
        return arquivo_todo(spec[1])
    return secao(*spec[1:])


# ── Mídia ─────────────────────────────────────────────────────────────────
def _novo(src, dst):
    # Sem a origem (vídeo fora do git, como o do lançamento da NEXA), vale a cópia que já está no acervo.
    if not os.path.exists(src):
        return False
    return not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src)


def ff(*args):
    subprocess.run([FF, '-loglevel', 'error', '-y', *args], check=True)


def imagem(src, dst, largura):
    if _novo(src, dst):
        ff('-i', src, '-vf', f"scale='min({largura},iw)':-2", '-q:v', '4', dst)


def video(src, dst, poster, t_poster):
    if _novo(src, dst):
        ff('-i', src, '-vf', "scale='if(gt(iw,ih),min(1280,iw),min(720,iw))':-2", '-c:v', 'libx264', '-preset', 'medium',
           '-crf', '28', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', dst)
    if _novo(src, poster):
        ff('-ss', str(t_poster), '-i', src, '-frames:v', '1', '-vf', "scale='min(720,iw)':-2", '-q:v', '4', poster)


def data_git(caminhos):
    """Data do primeiro commit que trouxe o arquivo; hoje, se ainda não está no git."""
    r = subprocess.run(['git', 'log', '--diff-filter=A', '--format=%as', '--', *caminhos], cwd=REPO,
                       capture_output=True, text=True).stdout.split()
    return min(r) if r else date.today().isoformat()


def sem_acento(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')


# ── Página ────────────────────────────────────────────────────────────────
def pagina(total):
    abas = ''.join(f'<button class="aba" data-produto="{k}">{v}<span></span></button>' for k, v in [('', 'Tudo'), *PRODUTOS.items()])
    ed = ''.join(f'<button class="chip-f" data-editoria="{e}">{e}</button>' for e in EDITORIAS)
    fo = ''.join(f'<button class="chip-f" data-formato="{f}">{f}</button>' for f in FORMATOS)
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Acervo de conteúdo · NEXA</title>
<script>(function(){{var t;try{{t=localStorage.getItem('nexa-tema')}}catch(e){{}}if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'claro':'escuro';if(t==='claro')document.documentElement.setAttribute('data-tema','claro')}})()</script>
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300;400;500&display=swap">
<link rel="stylesheet" href="../assets/site.css?v={V}">
<link rel="stylesheet" href="acervo.css?v={V}">
</head>
<body class="acervo">
<header class="ac-topo"><div class="wrap">
  <a class="logo" href="../index.html" aria-label="NEXA, início"><svg viewBox="0 0 800 150"><path d="{NEXA_D}"/></svg><i></i></a>
  <span class="ac-selo mono">Acervo<b> de conteúdo · uso interno</b></span>
  <button class="tema-bt" aria-label="Alternar tema claro ou escuro"><svg class="lua" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg><svg class="sol" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
</div></header>
<main class="wrap">
  <section class="ac-cab">
    <div class="kick lime">Redes sociais · NEXA, Sales Coach e Atlas</div>
    <h1 class="h-m">Tudo o que já foi criado, <span class="tom">com telas e legendas.</span></h1>
    <p class="lead">{total} conteúdos. Busque por qualquer palavra da legenda, filtre por produto, editoria e formato, e abra o post para ver as telas, copiar a legenda e baixar os arquivos.</p>
  </section>
  <nav class="ac-abas" aria-label="Produto">{abas}</nav>
  <div class="ac-barra">
    <label class="ac-busca"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" placeholder="Buscar em títulos e legendas" aria-label="Buscar"></label>
    <select class="ac-ordem" aria-label="Ordenar"><option value="novo">Mais recentes</option><option value="antigo">Mais antigos</option><option value="az">A a Z</option></select>
  </div>
  <div class="ac-filtros"><span class="kick">Editoria</span>{ed}</div>
  <div class="ac-filtros"><span class="kick">Formato</span>{fo}</div>
  <p class="ac-conta mono" aria-live="polite"></p>
  <section class="ac-grade"></section>
</main>
<dialog class="ac-post" aria-label="Post"><div class="ac-post-in"></div></dialog>
<script src="dados.js?v={V}"></script>
<script src="acervo.js?v={V}"></script>
</body>
</html>
'''


def main():
    os.makedirs(os.path.join(DEST, 'midia'), exist_ok=True)
    saida, ids = [], set()
    for p in POSTS:
        assert p['id'] not in ids, p['id']
        ids.add(p['id'])
        assert p['produto'] in PRODUTOS and p['editoria'] in EDITORIAS and p['formato'] in FORMATOS, p['id']
        if p.get('video') and not os.path.exists(os.path.join(REPO, p['video'])) and not os.path.exists(os.path.join(DEST, 'midia', p['id'], 'video.mp4')):
            print(f'{p["id"]:28} PULADO: falta {p["video"]}')
            continue
        pasta = os.path.join(DEST, 'midia', p['id'])
        os.makedirs(pasta, exist_ok=True)
        telas, item = [], {}
        fontes = []
        for padrao in p.get('telas', []):
            achados = sorted(glob.glob(os.path.join(REPO, padrao)))
            if not achados:
                sys.exit(f'{p["id"]}: nada em {padrao}')
            fontes += achados
        for i, src in enumerate(fontes, 1):
            nome = f'{i:02d}.jpg'
            imagem(src, os.path.join(pasta, nome), 1080)
            telas.append(f'midia/{p["id"]}/{nome}')
        if p.get('video'):
            src = os.path.join(REPO, p['video'])
            if p['video'].startswith('site-nexa-v2/'):
                item['video'] = '../' + p['video'][len('site-nexa-v2/'):]
                poster = os.path.join(pasta, 'poster.jpg')
                if _novo(src, poster):
                    ff('-ss', str(p.get('poster', 1.5)), '-i', src, '-frames:v', '1', '-vf', "scale='min(720,iw)':-2", '-q:v', '4', poster)
            else:
                video(src, os.path.join(pasta, 'video.mp4'), os.path.join(pasta, 'poster.jpg'), p.get('poster', 1.5))
                item['video'] = f'midia/{p["id"]}/video.mp4'
            item['poster'] = f'midia/{p["id"]}/poster.jpg'
        capa_src = os.path.join(REPO, p['capa']) if p.get('capa') else (fontes[0] if fontes else os.path.join(pasta, 'poster.jpg'))
        imagem(capa_src, os.path.join(pasta, 'capa.jpg'), 540)
        leg = legenda(p.get('legenda'))
        texto = legenda(p.get('texto'))
        origem = [*p.get('telas', []), *([p['video']] if p.get('video') else [])]
        data = p.get('data') or data_git(sorted({os.path.dirname(o) if '*' in o else o for o in origem}))
        item.update({
            'id': p['id'], 'titulo': p['titulo'], 'produto': p['produto'], 'editoria': p['editoria'], 'formato': p['formato'],
            'serie': p.get('serie', ''), 'data': data, 'pasta': p['pasta'], 'medida': p.get('medida', ''),
            'capa': f'midia/{p["id"]}/capa.jpg', 'telas': telas, 'legenda': leg, 'texto': texto, 'nota': p.get('nota', ''),
        })
        item['busca'] = sem_acento(' '.join([item['titulo'], item['serie'], leg, texto, item['editoria'], item['formato'], PRODUTOS[item['produto']]]))
        saida.append(item)
        print(f'{p["id"]:28} {len(telas):3} telas {"+ vídeo" if p.get("video") else ""}')
    with open(os.path.join(DEST, 'dados.js'), 'w', encoding='utf-8') as f:
        f.write('// Gerado por site-nexa-v2/_gerar/acervo.py. Não edite à mão.\nwindow.ACERVO = ')
        json.dump(saida, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')
    with open(os.path.join(DEST, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(pagina(len(saida)))
    print(len(saida), 'conteúdos')


if __name__ == '__main__':
    main()
