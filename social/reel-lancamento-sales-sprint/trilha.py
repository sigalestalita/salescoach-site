"""Trilha da versão thriller (Sales Sprint, 130s): suspense que cresce até o clímax, a 120 bpm.
Batimento cardíaco, relógio e um ostinato grave em semicolcheias que nunca para; pancada (braam) a
cada pergunta, com um zap de glitch em cada palavra; bateria que ganha uma camada a cada
funcionalidade (bumbo em meio tempo, caixa, cordas em staccato, bumbo 4/4, tambores, semicolcheias);
clímax com tambores em cada corte e virada acelerando, meio segundo de silêncio e a pancada da marca.
Gera trilha.wav (completa) e trilha-locucao.wav (cama para narração: mais baixa e com os médios
abertos para a voz). Lê a linha do tempo do <script id="tl"> do index.html."""
import json, re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

html = open('index.html', encoding='utf-8').read()
TL = json.loads(re.search(r'<script id="tl" type="application/json">(.*?)</script>', html, re.S).group(1))
DUR, BPM, Q2, CORTE = TL['DUR'], TL['BPM'], TL['Q2'], TL['CORTE']; ABRE, CAPS, CL, MARCA, FIMC = TL['ABRE'], TL['CAPS2'], TL['CLIMAX'], TL['MARCA'], TL['FIM']
BEAT = 60 / BPM; COMP = 4 * BEAT; S16 = BEAT / 4
SR = 48000; N = int(SR * DUR); rng = np.random.default_rng(9)
def buf(): return [np.zeros(N), np.zeros(N)]
DR, BX, MU, FX = buf(), buf(), buf(), buf()
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


def braam(g=1, d=3.4):  # pancada de trailer: acorde sujo que abre o filtro + grave que despenca
    t = tt(d); x = t / d
    corpo = sum(saw(nota(m) * dt, t) for m in (33, 40, 45, 48) for dt in (.997, 1.003))
    som = lp(corpo, 400) * (1 - x) ** 1 + lp(corpo, 1400) * np.exp(-t * 3) * .6
    braa = np.tanh(som * 2.6) * np.minimum(1, t / .025) * np.exp(-t * 1.0) * .4
    f = 30 + 80 * np.exp(-t * 8); sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4) * .85
    ar = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 4) * .25
    return (braa + sub + ar) * g
def coracao(g=1):
    t = tt(.5); s = np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t * 30)) / SR) * np.exp(-t * 12)
    s2 = np.zeros_like(s); k = int(.17 * SR); s2[k:] = s[:-k] * .6
    return np.tanh((s + s2) * 2) * .55 * g
def tambor(g=1, f0=140):
    t = tt(.7); f = f0 * .5 + f0 * .5 * np.exp(-t * 12)
    return (np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * 2.2) * np.exp(-t * 6) + bp(rng.standard_normal(len(t)), 200, 2000) * np.exp(-t * 30) * .4) * .42 * g
def ost(m, corte, g=1):
    t = tt(S16 * 1.6); s = saw(nota(m), t) + .5 * saw(nota(m) * 1.004, t)
    return np.tanh(lp(s, corte) * 1.6) * np.exp(-t * 16) * np.minimum(1, t / .003) * .22 * g
def corda(ac, g=1):
    t = tt(.2); s = sum(saw(nota(m + 12) * dt, t) for m in ac for dt in (.996, 1.004))
    return bp(s, 300, 5000) * np.exp(-t * 14) * np.minimum(1, t / .004) * .05 * g
def zap(g=1):
    t = tt(.09); s = np.sign(np.sin(2 * np.pi * (900 + 2600 * rng.random()) * t)) * (rng.random(len(t)) > .3)
    return hp(s, 1500) * np.exp(-t * 40) * .05 * g
def drone(ac, d, corte=600):
    t = tt(d); s = sum(saw(nota(m) * dt, t) for m in ac for dt in (.994, 1.006))
    return lp(s, corte) * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .5) * .02

SC = np.ones(N)
def bomba(x, prof=.35): i = int(round(x * SR)); n = min(int(.3 * SR), N - i); SC[i:i+n] = np.minimum(SC[i:i+n], prof + (1 - prof) * (np.arange(n) / n) ** .6)
def bumbo(x, g=1): add(DR, kick(g), x); bomba(x)
def whoosh(d=.5, g=1): t = tt(d); x = t / d; n = rng.standard_normal(len(t)); return hp(lp(n, 2000) * (1 - x) + lp(n, 9000) * x, 300) * np.sin(np.pi * x) ** 2 * .1 * g

RAIZ = [45, 41, 38, 40]; PAD = [[57, 60, 64], [57, 60, 65], [57, 62, 65], [56, 59, 64]]   # Am F Dm E
PADRAO = [0, 0, 12, 0, 0, 7, 0, 12, 0, 0, 12, 0, 0, 7, 12, 7]
def estado(x):
    """(tipo, nível): abertura, pergunta, tela, clímax, silêncio, marca, fim."""
    if x < ABRE[2][1]: return ('abre', 0 if x < ABRE[2][0] else 1)
    for i, (a, b) in enumerate(CAPS):
        if a <= x < b: return ('perg', i + 1) if x < a + Q2 else ('tela', i + 1)
    if CL[0] <= x < CL[1]: return ('climax', 8)
    if CL[1] <= x < MARCA[0]: return ('silencio', 0)
    if MARCA[0] <= x < MARCA[1]: return ('marca', 0)
    return ('fim', 0)

NB = int(np.ceil(DUR / COMP))
for b in range(NB):
    t0 = b * COMP; raiz = RAIZ[b % 4]; ac = PAD[b % 4]
    tp0, _ = estado(t0 + .01)
    if tp0 not in ('silencio',):
        add(MU, drone([raiz - 12] + ac, COMP + .5, 500 if tp0 in ('abre', 'perg') else 1100), t0, 1.0)
    for s in range(16):
        x = t0 + s * S16
        if x >= DUR - .01: break
        tp, L = estado(x)
        if tp == 'silencio': continue
        if tp == 'abre':
            if s % 4 == 0: add(DR, coracao(.9), x)
            if s % 2 == 0: add(DR, tique(1.1 if s % 4 == 0 else .6), x, pan=.25)
            if L == 1:  # depois do "E se": o ostinato entra fechado e vai abrindo
                k = (x - ABRE[2][0]) / (ABRE[2][1] - ABRE[2][0]); add(BX, ost(raiz + PADRAO[s], 300 + 1200 * k ** 1.5), x, .6 + .5 * k)
        elif tp == 'perg':
            if s % 8 == 0: add(DR, coracao(1.0), x)
            add(DR, tique(1.1 if s % 4 == 0 else .55), x, pan=.25)
            add(BX, ost(raiz + PADRAO[s], 420 + 40 * L), x, .75)
        elif tp in ('tela', 'climax'):
            add(BX, ost(raiz + PADRAO[s] + (12 if L >= 6 and s % 4 == 2 else 0), 1100 + 260 * L), x, 1.15 + .05 * L)
            if L < 4 and s % 8 == 0: bumbo(x, 1.1)
            if L >= 4 and s % 4 == 0: bumbo(x, 1.1)
            if L >= 2 and s == 8: add(DR, clap(1.1), x, pan=.1); add(DR, caixa(.8), x)
            if L >= 4 and s == 8: pass
            if L >= 3 and s in (0, 3, 6, 10, 12): add(MU, corda(ac, .8 + .06 * L), x, pan=[-.3, .3, -.2, .2, 0][(0, 3, 6, 10, 12).index(s)])
            if L >= 5 and s in (6, 12, 13, 14): add(DR, tambor(.8 + .05 * L, [120, 150, 130, 110][(6, 12, 13, 14).index(s)]), x, pan=[-.3, .2, 0, -.2][(6, 12, 13, 14).index(s)])
            if L >= 6: add(DR, hat(.35 + .08 * (s % 2 == 0)), x, pan=-.3)
            if L < 6 and s % 2 == 1: add(DR, tique(.9), x, pan=.25)
            if L < 4 and s == 12: add(DR, tambor(.7, 100), x)
        elif tp == 'marca':
            if s % 8 == 0: add(DR, tambor(1.0, 90), x); add(DR, coracao(.7), x)
        elif tp == 'fim':
            add(BX, ost(raiz + PADRAO[s], 700), x, .5)
            if s % 8 == 0: add(DR, coracao(.6), x)

def virada(a, b, g=1, fim32=False):
    x = a
    while x < b - 1e-6:
        k = (x - a) / max(1e-6, b - a); add(DR, caixa(.3 + 1.1 * k ** 1.3) * g, x, pan=rng.uniform(-.15, .15))
        x += S16 if (k < .6 or not fim32) else S16 / 2
# Abertura
for i, (a, b) in enumerate(ABRE): add(FX, braam([.9, 1.05, 1.15][i]), a)
for x in np.arange(ABRE[0][0] + .7, ABRE[0][0] + 2.4, S16 / 2): add(FX, tique(.8), x, pan=.3)   # contador 0 → 412
add(FX, subida(1.6, .9), ABRE[2][1] - 1.6); virada(ABRE[2][1] - 1.0, ABRE[2][1], 1.0)
# Capítulos: braam na pergunta, subida e virada até a tela, impacto quando a tela entra
for i, (a, b) in enumerate(CAPS):
    s = a + Q2; add(FX, braam(.75 + .05 * i), a)
    add(FX, subida(1.0, .8 + .04 * i), s - 1.0); virada(s - .5, s, .8 + .05 * i)
    add(DR, crash(.9 + .05 * i), s, pan=.2); add(DR, tambor(1.1, 90), s); add(FX, whoosh(.5, 1), s - .25)
# Clímax: tambor e golpe a cada corte, virada acelerando, subida grande e silêncio
for n in range(8):
    x = CL[0] + n * CORTE; add(DR, tambor(1.2, 100 + 6 * n), x); add(FX, braam(.45 + .04 * n, 1.6), x); add(DR, clap(.9), x + CORTE / 2); add(FX, whoosh(.4, .8), x - .15)
add(FX, subida(2.6, 1.4), CL[1] - 2.6); virada(CL[1] - 1.5, CL[1], 1.3, fim32=True)
add(FX, braam(1.6, 4.0), MARCA[0]); add(DR, crash(1.5), MARCA[0]); add(MU, drone([33, 45, 57, 60, 64, 71], MARCA[1] - MARCA[0] + 1, 2200), MARCA[0], 2.4)
add(FX, braam(.8), FIMC[0]); add(MU, drone([33, 45, 57, 60, 64, 71], FIMC[1] - FIMC[0], 1600), FIMC[0], 1.6)

# ---- Interface e glitch das palavras
def clique(): t = tt(.05); return (hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .5) * .3
def toque(): t = tt(.12); return np.sin(2 * np.pi * (620 + 320 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .2
def ping(f): t = tt(1.0); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 5) * .08
def tecla(): t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .06
NOTAS = [1318.5, 1567.98, 1760.0, 1975.5]
for i, ((a, b), ev, (off, vel)) in enumerate(zip(CAPS, TL['EVL'], TL['MAPA'])):
    s = a + Q2; T = lambda lt: s + (lt - off) / vel; ok = lambda x: s <= x < b - .1
    for c in ev.get('clique', []):
        if ok(T(c)): add(FX, clique(), T(c), pan=.2)
    for c in ev.get('toque', []):
        if ok(T(c)): add(FX, toque(), T(c), pan=-.1)
    for j, c in enumerate(ev.get('ping', [])):
        if ok(T(c)): add(FX, ping(NOTAS[(i + j) % 4]), T(c), pan=rng.uniform(-.3, .3))
    for x0, x1 in ev.get('tecla', []):
        for x in np.arange(T(x0), T(x1), .08):
            if ok(x): add(FX, tecla(), x + rng.uniform(-.01, .01), pan=-.2)
ZAP = [ABRE[0][0] + .1 + i * .22 for i in range(3)] + [ABRE[0][0] + .7 + i * .22 for i in range(2)] + [ABRE[0][0] + 2.5 + i * .22 for i in range(2)]
ZAP += [ABRE[1][0] + .1 + i * .45 for i in range(3)] + [ABRE[2][0] + .1 + i * .45 for i in range(2)] + [ABRE[2][0] + 1.4 + i * .3 for i in range(3)]
for (a, b), (n1, n2) in zip(CAPS, TL['QW']):
    ZAP += [a + .2 + i * .18 for i in range(n1)] + [a + .2 + n1 * .18 + .1 + j * .18 for j in range(n2)]
ZAP += [CL[0] + n * CORTE for n in range(8)]
for x in ZAP: add(FX, zap(1.0), x, pan=rng.uniform(-.4, .4))

def mixa(cama):
    L = DR[0] + (BX[0] + MU[0]) * SC + FX[0]; R = DR[1] + (BX[1] + MU[1]) * SC + FX[1]
    if cama:
        for X in (L, R): X -= bp(X, 300, 3500) * .45
    ir = rng.standard_normal(int(2.6 * SR)) * np.exp(-tt(2.6) * 2.6) * .02
    Lw = L + fftconvolve(hp(L, 250), ir)[:N] * .45; Rw = R + fftconvolve(hp(R, 250), ir[::-1])[:N] * .45
    fade = np.ones(N); fade[:int(.02 * SR)] = np.linspace(0, 1, int(.02 * SR)); fim = int((DUR - 2.0) * SR); fade[fim:] = np.linspace(1, 0, N - fim) ** 1.3
    a, b = int((CL[1] - .02) * SR), int(CL[1] * SR); fade[a:b] = np.linspace(1, 0, b - a); c = int((MARCA[0] - .02) * SR); fade[b:c] = 0   # silêncio antes da marca
    mix = np.stack([Lw, Rw], 1) * fade[:, None]; mix = np.tanh(mix / np.percentile(np.abs(mix), 99.9) * 1.6) * .94
    return mix * (.5 if cama else 1)
wavfile.write('trilha.wav', SR, (mixa(False) * 32767).astype(np.int16))
wavfile.write('trilha-locucao.wav', SR, (mixa(True) * 32767).astype(np.int16))
print('ok', DUR, 's')
