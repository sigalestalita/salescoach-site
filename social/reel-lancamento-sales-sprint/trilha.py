"""Trilha do vídeo de lançamento (Sales Sprint, 96s): uma música só, contínua, a 120 bpm (compasso = 2s).
O vídeo está no mesmo compasso: cada pergunta dura 2 compassos e cada tela 3, então toda tela entra
num tempo forte. O bumbo nunca para. As perguntas são preparações (baixo filtrado, tique, virada de
caixa e subida) que explodem quando a tela entra, e a música cresce a cada funcionalidade:
 tela 1 base (bumbo, baixo, palma, chimbal) · 2 chimbal aberto · 3 acordes · 4 arpejo · 5 semicolcheias
 e sobe um tom · 6 melodia · 7 prato de condução · fecho: a maior preparação e o clímax com tudo.
Sons de interface seguem os eventos de cada tela. Lê a linha do tempo do <script id="tl"> do
index.html e gera trilha.wav (48 kHz, estéreo)."""
import json, re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

html = open('index.html', encoding='utf-8').read()
TL = json.loads(re.search(r'<script id="tl" type="application/json">(.*?)</script>', html, re.S).group(1))
DUR, REV, Q, BPM = TL['DUR'], TL['REV'], TL['Q'], TL['BPM']
BEAT = 60 / BPM; COMP = 4 * BEAT; S16 = BEAT / 4; NB = int(round(DUR / COMP))
SR = 48000; N = int(SR * DUR); rng = np.random.default_rng(5)
def buf(): return [np.zeros(N), np.zeros(N)]
DR, BX, MU, FX = buf(), buf(), buf(), buf()   # bateria, baixo, música (com sidechain), efeitos
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, min(f, SR / 2.2), 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def nota(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, t): return 2 * ((f * t + rng.random()) % 1) - 1
def add(B, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR)); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    B[0][i:i+n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; B[1][i:i+n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

# ---- Mapa de compassos: o que cada um é e o nível de energia
def b_(t): return int(round(t / COMP))
REVB = b_(REV); CAPB = [(b_(a), b_(a + Q), b_(b)) for a, b in TL['CAPS']]; FQB, FIMB = b_(TL['FECHO'][0]), b_(TL['FECHO'][2])
TIPO = ['intro'] * NB; NIVEL = [0] * NB
for b in range(REVB, CAPB[0][0]): TIPO[b] = 'tela'; NIVEL[b] = 1
for i, (a, s, e) in enumerate(CAPB):
    for b in range(a, s): TIPO[b] = 'perg'; NIVEL[b] = i + 1
    for b in range(s, e): TIPO[b] = 'tela'; NIVEL[b] = i + 1
for b in range(CAPB[-1][2], FQB): TIPO[b] = 'tela'; NIVEL[b] = 7
for b in range(FQB, FIMB): TIPO[b] = 'perg'; NIVEL[b] = 8
for b in range(FIMB, NB): TIPO[b] = 'fim'; NIVEL[b] = 8
LIFT = CAPB[4][1]  # sobe um tom quando entra a tela do Treino
ACORDES = [[45, 57, 60, 64, 67], [41, 57, 60, 65, 69], [48, 55, 60, 64, 67], [43, 55, 59, 62, 67]]  # Am7 F C G
def acorde(b): ac = ACORDES[b % 4]; d = 2 if b >= LIFT else 0; return [m + d for m in ac]

# ---- Instrumentos
def kick(g=1):
    t = tt(.45); f = 45 + 150 * np.exp(-t * 38)
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    clk = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 400) * .4
    return np.tanh((corpo + clk) * 2.4) * .58 * g
def clap(g=1):
    t = tt(.28); n = bp(rng.standard_normal(len(t)), 900, 7000)
    env = sum(np.exp(-np.maximum(0, t - d) * 60) * (t >= d) for d in (0, .011, .022)) * .5 + np.exp(-np.maximum(0, t - .022) * 13) * (t >= .022)
    return (n * env + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .5) * .3 * g
def caixa(g=1):
    t = tt(.18); return (bp(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 24) + np.sin(2 * np.pi * 220 * t) * np.exp(-t * 35) * .6) * .17 * g
def hat(g=1, aberto=False):
    d = .22 if aberto else .045; t = tt(d); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * (13 if aberto else 95)) * .12 * g
def ride(g=1):
    t = tt(.6); s = sum(np.sin(2 * np.pi * f * t) for f in (3520, 5170, 6890)) * .3 + hp(rng.standard_normal(len(t)), 7000)
    return s * np.exp(-t * 7) * .05 * g
def crash(g=1): t = tt(2.6); return hp(rng.standard_normal(len(t)), 4500) * np.exp(-t * 1.5) * .13 * g
def baixo(m, d, corte, g=1):
    t = tt(d); s = saw(nota(m), t) + .6 * np.sin(2 * np.pi * nota(m) * t)
    return np.tanh(lp(s, corte) * 1.9) * np.minimum(1, t / .004) * np.exp(-t * 3) * .3 * g
def stab(ac, corte=5200, g=1):
    t = tt(.32); s = sum(saw(nota(m) * dt, t) for m in ac[1:] for dt in (.995, 1.005))
    return lp(s, corte) * np.minimum(1, t / .003) * np.exp(-t * 9) * .06 * g
def pluck(m, g=1):
    t = tt(.35); return lp(saw(nota(m), t), 3000) * np.exp(-t * 15) * np.minimum(1, t / .002) * .05 * g
def lead(m, d, g=1):
    t = tt(d + .25); s = sum(saw(nota(m) * dt, t) for dt in (.996, 1.004)) + .4 * np.sin(2 * np.pi * nota(m - 12) * t)
    env = np.minimum(1, t / .01) * np.where(t < d, 1, np.exp(-(t - d) * 18)) * np.exp(-t * 1.2)
    return lp(s, 3800) * env * .05 * g
def pad(ac, d, corte):
    t = tt(d); s = sum(saw(nota(m) * dt, t) for m in ac[1:] for dt in (.993, 1.007))
    return lp(s, corte) * np.minimum(1, t / .08) * np.minimum(1, (d - t) / .3) * .02
def golpe(g=1):  # pancada de trailer: grave que despenca + acorde sujo + ar
    t = tt(3.0); f = 32 + 75 * np.exp(-t * 9)
    grave = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.7)
    braam = np.tanh(lp(sum(saw(nota(m), t) for m in (33, 40, 45, 48)), 700) * 3) * np.exp(-t * 1.4) * .35
    return (grave * .8 + braam + lp(rng.standard_normal(len(t)), 1200) * np.exp(-t * 5) * .25) * g
def subida(d, g=1):
    t = tt(d); x = t / d
    return (bp(rng.standard_normal(len(t)), 600, 10000) * x ** 2.2 * .13 + np.sin(2 * np.pi * np.cumsum(180 + 1300 * x ** 2.5) / SR) * x ** 3 * .045) * g
def tique(g=1): t = tt(.03); return hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 200) * .06 * g

SC = np.ones(N)  # sidechain: abaixa música e baixo a cada bumbo
def bomba(t, prof=.3): i = int(round(t * SR)); n = min(int(.3 * SR), N - i); SC[i:i+n] = np.minimum(SC[i:i+n], prof + (1 - prof) * (np.arange(n) / n) ** .6)
def bumbo(x, g=1, prof=.3): add(DR, kick(g), x); bomba(x, prof)

MOTIVO = [(0, 3, 1), (2, 2, 1), (3, 1, 1), (5, 2, 2), (8, 3, 1), (10, 2, 1), (11, 0, 2), (13, 1, 2)]  # (semicolcheia, grau, duração em colcheias)

for b in range(NB):
    t0 = b * COMP; ac = acorde(b); tipo = TIPO[b]; L = NIVEL[b]
    # posição dentro de uma preparação (0 = 1º compasso, 1 = último antes do drop)
    prep = 0 if tipo != 'perg' else (1 if b + 1 < NB and TIPO[b + 1] != 'perg' else 0)
    if tipo == 'intro':
        k = b / max(1, REVB); add(MU, pad(ac, COMP + .3, 500 + 600 * k), t0, 1.2)
    elif tipo == 'perg':
        add(MU, pad(ac, COMP + .3, 700 + 900 * prep), t0, 1.1)
    else:
        add(MU, pad(ac, COMP + .3, 1400 + 300 * L), t0, .55 + .1 * L)
    for s in range(16):
        x = t0 + s * S16
        if tipo == 'intro':
            k = (x - 0) / REV
            if s % 2 == 0: add(BX, baixo(ac[0] - (12 if s % 8 == 0 else 0), S16 * 2, 240 + 1400 * k ** 1.6), x, .7 + .5 * k)
            if b >= 2: add(DR, tique(1.3 if s % 4 == 0 else .6), x, .5 + .8 * k, pan=.25)
            if b in (2, 3) and s in (0, 8): bumbo(x, .8, .5)
            if b == 4 and s % 4 == 0: bumbo(x, .9, .4)
            if b == REVB - 1 and s < 8 and s % 4 == 0: bumbo(x, 1, .4)
        elif tipo == 'perg':
            ultimo = prep == 1
            if s % 4 == 0 and not (ultimo and s >= 12) and not (L == 8 and ultimo): bumbo(x, .95, .45)
            if s % 2 == 0: add(BX, baixo(ac[0], S16 * 2, 350 + (1100 if ultimo else 300) * (s / 16) ** 2), x, .9)
            add(DR, tique(1.3 if s % 4 == 0 else .7), x, pan=.25)
            if not ultimo and s in (4, 12): add(DR, clap(.6), x, pan=.1)
            if L >= 2 and not ultimo and s in (0, 6, 10): add(MU, stab(ac, 900, .7), x)
        else:  # tela e fim: groove completo, camadas pelo nível
            fim_parado = tipo == 'fim' and b == NB - 1
            if fim_parado: continue
            if s % 4 == 0: bumbo(x)
            if s in (4, 12): add(DR, clap(1.1 if L >= 8 else 1), x, pan=.1)
            if L >= 8 and s in (4, 12): add(DR, caixa(.8), x, pan=-.1)
            if s % 4 == 2: add(DR, hat(.55 + .09 * L, L >= 2), x, pan=-.3)
            elif s % 2 == 1 and L >= 5: add(DR, hat(.4 + .08 * L), x, pan=.3)
            if s % 2 == 0: add(BX, baixo(ac[0] + (12 if s % 4 == 2 else 0), S16 * 2, 1200 + 60 * L), x)
            if L >= 3 and s in (0, 3, 6, 10): add(MU, stab(ac, 4200 + 300 * L, (1.1 if s == 0 else .85) * (.7 + .15 * (L - 3))), x, pan=[-.2, .2, -.1, .15][(0, 3, 6, 10).index(s)])
            if L >= 4:
                arp = ac[1:] + [ac[2] + 12]; add(MU, pluck(arp[(s * 3 + b) % len(arp)] + 12, .5 + .12 * (L - 4)), x, pan=.4 if s % 2 else -.4)
            if L >= 7 and s % 4 == 0: add(DR, ride(1.2 if s == 0 else .8), x, pan=.35)
    if tipo in ('tela', 'fim') and L >= 6 and not (tipo == 'fim' and b == NB - 1):
        tons = ac[1:]
        for s, g, d in MOTIVO:
            m = tons[g] + 12 + (12 if L >= 8 else 0) * 0
            add(MU, lead(m, d * S16 * 2 * .9, 1.6 if L >= 8 else 1.3), t0 + s * S16, pan=-.1)
            add(MU, lead(m, d * S16 * 2 * .9, .35), t0 + s * S16 + 3 * S16, pan=.4)  # eco

# ---- Viradas, subidas e impactos (todos no compasso)
def virada(a, b, g=1):
    xs = np.arange(a, b - 1e-6, S16)
    for x in xs:
        k = (x - a) / max(1e-6, b - a)
        if k < .5 and round((x - a) / S16) % 2: continue  # colcheias na 1ª metade, semicolcheias na 2ª
        add(DR, caixa(.35 + 1.0 * k ** 1.4) * g, x, pan=rng.uniform(-.15, .15))
for x in TL['INTRO']: add(FX, golpe(.9), round(x[0] / COMP) * COMP)
virada(REV - COMP, REV, 1.1); add(FX, subida(COMP * 1.25), REV - COMP * 1.25); add(FX, golpe(1.25), REV); add(DR, crash(1.2), REV)
for i, (a, s, e) in enumerate(CAPB):
    ta, ts = a * COMP, s * COMP
    add(FX, golpe(.55 + .04 * i), ta)                         # a pergunta entra com uma pancada, sem parar o groove
    virada(ts - COMP, ts, .9 + .05 * i); add(FX, subida(COMP * .9, .8 + .05 * i), ts - COMP * .9)
    add(FX, golpe(.75 + .05 * i), ts); add(DR, crash(1 + .05 * i), ts, pan=.2)   # drop na tela
tq, tf = FQB * COMP, FIMB * COMP
add(FX, golpe(.9), tq); virada(tf - COMP, tf, 1.3); add(FX, subida(COMP * 2, 1.2), tf - COMP * 2)
add(FX, golpe(1.4), tf); add(DR, crash(1.4), tf)
tfinal = (NB - 1) * COMP; add(FX, golpe(1.3), tfinal); add(DR, crash(1.3), tfinal); add(MU, stab(acorde(NB - 1), 6000, 2.2), tfinal)
add(MU, pad(acorde(NB - 1), COMP, 2400), tfinal, 2)

# ---- Interface
def clique(): t = tt(.05); return (hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .5) * .3
def toque(): t = tt(.12); return np.sin(2 * np.pi * (620 + 320 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .2
def ping(f): t = tt(1.0); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 5) * .08
def tecla(): t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .06
NOTAS = [1318.5, 1567.98, 1760.0, 1975.5]
for i, ((a, b), ev) in enumerate(zip(TL['CAPS'], TL['EV'])):
    s = a + Q
    for c in ev.get('clique', []): add(FX, clique(), s + c, pan=.2)
    for c in ev.get('toque', []): add(FX, toque(), s + c, pan=-.1)
    for j, c in enumerate(ev.get('ping', [])): add(FX, ping(NOTAS[(i + j) % 4]), s + c, pan=rng.uniform(-.3, .3))
    for x0, x1 in ev.get('tecla', []):
        for x in np.arange(x0, x1, .065): add(FX, tecla(), s + x + rng.uniform(-.01, .01), pan=-.2)

# ---- Mix
L_ = DR[0] + (BX[0] + MU[0]) * SC + FX[0]; R_ = DR[1] + (BX[1] + MU[1]) * SC + FX[1]
ir = rng.standard_normal(int(2.2 * SR)) * np.exp(-tt(2.2) * 3.2) * .02
Lw = L_ + fftconvolve(hp(L_, 300), ir)[:N] * .35; Rw = R_ + fftconvolve(hp(R_, 300), ir[::-1])[:N] * .35
fade = np.ones(N); fade[:int(.02 * SR)] = np.linspace(0, 1, int(.02 * SR))
fim = int((DUR - .6) * SR); fade[fim:] = np.linspace(1, 0, N - fim)
mix = np.stack([Lw, Rw], 1) * fade[:, None]; mix = np.tanh(mix / np.percentile(np.abs(mix), 99.9) * 1.5) * .93
wavfile.write('trilha.wav', SR, (mix * 32767).astype(np.int16))
print('ok', DUR, 's', NB, 'compassos')
