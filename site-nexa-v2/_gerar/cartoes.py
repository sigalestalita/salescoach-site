"""Cartões do anel da home, desenhados em HTML e SVG (nada de recorte de print ou de vídeo).

Cada cartão mostra uma coisa só, que dá para ler girando: uma nota, uma frase, um gráfico.
Três direções:
  A · Interface: cada cartão é um pedaço de produto redesenhado (nota, eNPS, radar 360...).
  B · Editorial: tipografia grande com a ideia de cada funcionalidade, em lima, grafite e osso.
  C · Mista: interface + editorial + pessoas reais, alternados.
Os números são ilustrativos, como numa tela de demonstração.
"""

SC, AC, A3, FB, NX = 'Sales Coach', 'Atlas Clima', 'Atlas 360', 'Fábrica', 'NEXA'
COR = {SC: '#d4f969', AC: '#6fe0c2', A3: '#b9a8ff', FB: '#ffab6b', NX: '#d4f969'}
LINK = {SC: 'sales-coach/index.html', AC: 'atlas/index.html#clima', A3: 'atlas/index.html#atlas-360', FB: '#fabrica', NX: '#motores'}
SETA = '<svg class="seta" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>'


def cartao(prod, tag, pe, arte, tema='esc', href=None, extra=''):
    return (f'<div class="capa cx {tema} {extra}" data-href="{href or LINK[prod]}" role="link" tabindex="0" aria-label="{prod} · {pe}">'
            f'<div class="cx-top"><span class="cx-marca"><i style="--c:{COR[prod]}"></i>{prod}</span><span class="cx-tag">{tag}</span></div>'
            f'<div class="cx-arte">{arte}</div><div class="cx-pe">{pe}</div>{SETA}</div>')


# ── peças de interface ───────────────────────────────────────────────
def anel_nota(n, cor='var(--cx-ac)'):
    c = 2 * 3.1416 * 40
    return (f'<div class="w-nota"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="tr"/>'
            f'<circle cx="50" cy="50" r="40" class="vl" style="stroke:{cor};stroke-dasharray:{c * n / 100:.1f} {c:.1f}"/></svg>'
            f'<b>{n}</b><small>de 100</small></div>')


def bolhas():
    return ('<div class="w-chat"><p class="lead-b">“Achei caro para o momento.”</p>'
            '<p class="dica"><b>Fale agora</b> Retome o custo de não resolver.</p></div>')


def criterios(itens):
    return '<div class="w-crit">' + ''.join(
        f'<span class="{"ok" if ok else ""}"><i>{"✓" if ok else ""}</i>{t}</span>' for t, ok in itens) + '</div>'


def talk(v):
    return (f'<div class="w-talk"><div class="bar"><i style="width:{v}%"></i></div>'
            f'<div class="leg"><span><b>{v}%</b> vendedor</span><span><b>{100 - v}%</b> cliente</span></div></div>')


def onda():
    hs = [18, 34, 52, 30, 70, 88, 60, 42, 76, 94, 66, 38, 58, 80, 46, 28, 54, 72, 40, 22, 36, 18]
    return '<div class="w-onda">' + ''.join(f'<i style="height:{h}%;animation-delay:{k * -.09:.2f}s"></i>' for k, h in enumerate(hs)) + '</div>'


def crm():
    return ('<div class="w-crm"><p><span>Próximo passo</span><b>Proposta até sexta</b></p>'
            '<p><span>Temperatura</span><b class="q">Quente</b></p><p class="ok">✓ Enviado ao CRM</p></div>')


def barras(vs, rot=None):
    m = max(vs)
    return '<div class="w-barras">' + ''.join(
        f'<span><i style="height:{v / m * 100:.0f}%"></i>{f"<em>{rot[k]}</em>" if rot else ""}</span>' for k, v in enumerate(vs)) + '</div>'


def pergunta():
    return ('<div class="w-ask"><p class="q">Quais agendas estão quentes?</p>'
            '<p class="r">3 agendas: <u>Grupo Alfa</u> <u>Rede Vale</u> <u>Orbe</u></p></div>')


def enps():
    return ('<div class="w-enps"><b>+38</b><div class="dist"><i style="flex:14" class="d"></i><i style="flex:34" class="n"></i><i style="flex:52" class="p"></i></div>'
            '<div class="leg"><span>detratores</span><span>promotores</span></div></div>')


def clima():
    pts = [52, 56, 54, 61, 63, 60, 68, 71, 74]
    path = ' '.join(f'{"M" if k == 0 else "L"}{k * 12.5:.1f},{40 - (v - 45) * 1.15:.1f}' for k, v in enumerate(pts))
    return (f'<div class="w-clima"><b>74<small>/100</small></b><svg viewBox="0 0 100 42" preserveAspectRatio="none">'
            f'<path d="{path} L100,42 L0,42 Z" class="area"/><path d="{path}" class="linha"/></svg></div>')


def calor():
    vals = [5, 4, 4, 3, 5, 4, 3, 2, 4, 5, 3, 4, 2, 3, 4]
    return '<div class="w-calor">' + ''.join(f'<i class="c{v}"></i>' for v in vals) + '</div>'


def qr():
    import random
    r = random.Random(7)
    cel = []
    for y in range(9):
        for x in range(9):
            canto = (x < 3 and y < 3) or (x > 5 and y < 3) or (x < 3 and y > 5)
            on = (x in (0, 2) or y in (0, 2) or (x, y) == (1, 1)) if x < 3 and y < 3 else \
                 (x in (6, 8) or y in (0, 2) or (x, y) == (7, 1)) if x > 5 and y < 3 else \
                 (x in (0, 2) or y in (6, 8) or (x, y) == (1, 7)) if x < 3 and y > 5 else r.random() < .5
            cel.append(f'<i class="{"on" if on else ""}"></i>')
    return '<div class="w-qr"><div class="g">' + ''.join(cel) + '</div><p>Sem cadastro.<br>Sem nome.</p></div>'


def comentario():
    return '<div class="w-quote"><p>“Sinto que posso falar com minha liderança sobre carga de trabalho.”</p><span>Comentário anônimo</span></div>'


def likert():
    return '<div class="w-likert">' + ''.join(f'<i class="{"on" if k == 3 else ""}">{k + 1}</i>' for k in range(5)) + '<p><span>Discordo</span><span>Concordo</span></p></div>'


def radar():
    import math
    def poli(vs, r=38):
        return ' '.join(f'{50 + math.cos(-math.pi / 2 + k * 2 * math.pi / len(vs)) * r * v:.1f},{50 + math.sin(-math.pi / 2 + k * 2 * math.pi / len(vs)) * r * v:.1f}' for k, v in enumerate(vs))
    grade = ''.join(f'<polygon points="{poli([s] * 6)}" class="gr"/>' for s in (.33, .66, 1))
    return (f'<div class="w-radar"><svg viewBox="0 0 100 100">{grade}<polygon points="{poli([.9, .7, .85, .6, .8, .75])}" class="auto"/>'
            f'<polygon points="{poli([.7, .8, .6, .75, .55, .85])}" class="pares"/></svg>'
            '<div class="leg"><span class="a">auto</span><span class="p">pares</span></div></div>')


def matriz():
    m = ['1110', '0111', '1011', '1101', '0110']
    return ('<div class="w-mat"><div class="g">' + ''.join(f'<i class="{"on" if c == "1" else ""}"></i>' for l in m for c in l) +
            '</div><p><b>quem avalia</b><br>quem</p></div>')


def tres():
    return ('<div class="w-tres"><div class="av"><i></i><i></i><i></i></div><p><b>3+</b> avaliações de pares<br>para o resultado abrir</p></div>')


def pdf():
    return ('<div class="w-pdf"><div class="doc"><b>PDF</b><i></i><i></i><i class="c"></i><i></i></div><p>Devolutiva<br>individual</p></div>')


def fluxo():
    return ('<div class="w-fluxo"><span>ideia</span><i></i><span>protótipo</span><i></i><span class="on">produto</span></div>')


def codigo():
    return ('<div class="w-code"><p><em>01</em> <b>desafio</b> = processo manual</p><p><em>02</em> <b>hipótese</b> = 6h/semana</p>'
            '<p><em>03</em> <b>construir</b>() <span>▍</span></p></div>')


def frase(grande, peq=''):
    num = ' num' if grande[:1] in '+0123456789' else ''
    return f'<div class="w-frase{num}"><b>{grande}</b>{f"<span>{peq}</span>" if peq else ""}</div>'


def foto(arq, chip):
    return f'<img src="assets/capas/{arq}.webp" alt="" loading="lazy" decoding="async"><span class="w-chip">{chip}</span>'


# ── opções ───────────────────────────────────────────────────────────
def opcao_a():
    return [
        cartao(SC, 'depois', 'Nota de cada reunião', anel_nota(82)),
        cartao(AC, 'eNPS', 'Quem recomenda a empresa', enps(), 'osso'),
        cartao(SC, 'ao vivo', 'Dica na hora da objeção', bolhas()),
        cartao(A3, 'perspectivas', 'Autoavaliação × pares', radar()),
        cartao(SC, 'BANT', 'Critérios da metodologia', criterios([('Budget', 1), ('Authority', 1), ('Need', 1), ('Timing', 0)]), 'lima'),
        cartao(AC, 'clima', 'Clima de 0 a 100', clima()),
        cartao(FB, 'sob medida', 'Da ideia ao software em uso', fluxo(), 'osso'),
        cartao(SC, 'treino', 'Cliente simulado por voz', onda()),
        cartao(AC, 'lideranças', 'Mapa de calor por liderança', calor()),
        cartao(A3, 'matriz', 'Matriz de avaliação', matriz(), 'osso'),
        cartao(SC, 'CRM', 'CRM preenchido sozinho', crm()),
        cartao(AC, 'link', 'Link anônimo e QR code', qr(), 'lima'),
        cartao(SC, 'gestão', 'Evolução por executivo', barras([58, 64, 61, 72, 78, 84], ['jan', 'fev', 'mar', 'abr', 'mai', 'jun'])),
        cartao(A3, 'anonimato', 'Resultado protegido', tres()),
        cartao(AC, 'escuta', 'O que o time diz', comentario(), 'osso'),
        cartao(SC, 'talk ratio', 'Quem falou mais', talk(42)),
        cartao(FB, 'IA aplicada', 'Construção com IA', codigo()),
        cartao(SC, 'assistente', 'Pergunte às reuniões', pergunta(), 'osso'),
        cartao(AC, 'resposta', 'Responde no celular', likert()),
        cartao(A3, 'devolutiva', 'PDF por pessoa', pdf(), 'lima'),
    ]


def opcao_b():
    return [
        cartao(SC, 'antes', 'Treino com cliente simulado', frase('Erre no simulado.', 'Não no lead de verdade.'), 'lima'),
        cartao(AC, 'clima', 'Pesquisa de clima', frase('Escute sem ruído.', 'Link anônimo, leitura por área.')),
        cartao(A3, '360', 'Avaliação 360', frase('Amplie a visão.', 'Autoavaliação comparada aos pares.'), 'osso'),
        cartao(SC, 'durante', 'Coach ao vivo', frase('Fale agora.', 'A dica chega com a objeção no ar.')),
        cartao(FB, 'fábrica', 'Software sob medida', frase('Ideia não fica no papel.'), 'lima'),
        cartao(SC, 'depois', 'Nota com justificativa', frase('82<small>/100</small>', 'Cada critério com o que foi dito.'), 'osso'),
        cartao(AC, 'eNPS', 'Recomendação', frase('+38', 'eNPS, por área e liderança.')),
        cartao(NX, 'manifesto', 'IA acelera', frase('IA acelera.', 'Pessoas dão direção.'), 'lima'),
        cartao(A3, 'anonimato', 'Resultado protegido', frase('3+', 'avaliações para o resultado abrir.')),
        cartao(SC, 'CRM', 'CRM preenchido', frase('Zero digitação.', 'Próximos passos direto no CRM.'), 'osso'),
        cartao(AC, 'liderança', 'Mapa de calor', frase('Onde dói, por liderança.')),
        cartao(SC, 'gestão', 'Painel do gestor', frase('O 1:1 deixa de ser opinião.'), 'lima'),
        cartao(FB, 'método', 'Visão de negócio', frase('A pergunta certa', 'antes do código.'), 'osso'),
        cartao(A3, 'devolutiva', 'PDF por pessoa', frase('Feedback que se lê.', 'Devolutiva individual em PDF.')),
        cartao(SC, 'idioma', 'Feito em português', frase('Em português.', 'No Meet e no Teams.'), 'lima'),
        cartao(AC, 'diretoria', 'Relatório pronto', frase('Pronto para a diretoria.', 'PDF e planilha.'), 'osso'),
        cartao(SC, 'assistente', 'Assistente', frase('Pergunte às reuniões.', 'Respostas com a fonte citada.')),
        cartao(FB, 'sempre', 'Evolução contínua', frase('Lançar é o começo.'), 'lima'),
    ]


def opcao_c():
    a, b = opcao_a(), opcao_b()
    fotos = [
        cartao(AC, 'pessoas', 'Pessoas no centro', foto('pessoa-1', 'Clima 74/100'), 'foto'),
        cartao(A3, 'conversa', 'Devolutiva que vira conversa', foto('pessoa-3', 'Autoavaliação × pares'), 'foto'),
        cartao(AC, 'escuta', 'Escuta de verdade', foto('pessoa-2', 'Resposta anônima'), 'foto'),
        cartao(NX, 'pessoas', 'Pessoas dão direção', foto('pessoa-4', 'IA acelera'), 'foto'),
    ]
    ordem = [a[0], b[1], fotos[0], a[3], b[4], a[2], fotos[1], a[5], b[7], a[8], fotos[2], a[4], b[3], a[11], fotos[3], a[12], b[11], a[13], a[6], b[14]]
    return ordem


OPCOES = {'A': opcao_a, 'B': opcao_b, 'C': opcao_c}
