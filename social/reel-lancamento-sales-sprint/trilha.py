"""Trilha da versão impacto (Sales Sprint, 63s): uma música só, a 120 bpm, com o grid contínuo do
início ao fim e todos os cortes do vídeo em cima do tempo. A energia segue as cenas: abertura com
pancada, verso que cresce nas telas do Meet, drop no carrossel, pancada na marca, groove cheio na
montagem, respiro em "e muito mais", tensão no campo da pergunta, drop com melodia no gestor, parada
em "É só vender." e o clímax no fecho.
Gera trilha.wav (mix completo) e trilha-locucao.wav (cama para narração: mais baixa, médios
abertos para a voz e sem a melodia). Lê a linha do tempo do <script id="tl"> do index.html."""
import json, re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

html = open('index.html', encoding='utf-8').read()
TL = json.loads(re.search(r'<script id="tl" type="application/json">(.*?)</script>', html, re.S).group(1))
DUR, BPM, C, SFX = TL['DUR'], TL['BPM'], TL['CENAS'], TL['SFX']
BEAT = 60 / BPM; COMP = 4 * BEAT; S16 = BEAT / 4
SR = 48000; N = int(SR * DUR); rng = np.random.default_rng(5)
def buf(): return [np.zeros(N), np.zeros(N)]
DR, BX, MU, LD, FX = buf(), buf(), buf(), buf(), buf()   # bateria, baixo, música, melodia, efeitos
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

SC = np.ones(N)
def bomba(t, prof=.3): i = int(round(t * SR)); n = min(int(.3 * SR), N - i); SC[i:i+n] = np.minimum(SC[i:i+n], prof + (1 - prof) * (np.arange(n) / n) ** .6)
def bumbo(x, g=1, prof=.3): add(DR, kick(g), x); bomba(x, prof)
def whoosh(d=.6, g=1): t = tt(d); x = t / d; n = rng.standard_normal(len(t)); return hp(lp(n, 2000) * (1 - x) + lp(n, 9000) * x, 300) * np.sin(np.pi * x) ** 2 * .1 * g

ACORDES = [[45, 57, 60, 64, 67], [41, 57, 60, 65, 69], [48, 55, 60, 64, 67], [43, 55, 59, 62, 67]]  # Am7 F C G
# Seções por tempo: (início, fim, tipo, nível)
SEC = [(0, 3, 'intro', 0), (3, 8, 'verso', 1), (8, 12, 'verso', 2), (12, 13, 'prep', 2),
       (13, 19, 'drop', 4), (19, 21, 'meio', 3), (21, 22, 'prep', 3),
       (22, 37, 'drop', 5), (37, 39, 'pausa', 0), (39, 44, 'verso', 3), (44, 46, 'tensao', 3), (46, 47, 'prep', 4),
       (47, 55, 'drop', 6), (55, 57, 'parada', 0), (57, 61, 'drop', 8), (61, DUR, 'fim', 0)]
def secao(x):
    for a, b, tp, L in SEC:
        if a - 1e-6 <= x < b - 1e-6: return tp, L, a, b
    return 'fim', 0, 61, DUR
MOTIVO = [(0, 3, 1), (2, 2, 1), (3, 1, 1), (5, 2, 2), (8, 3, 1), (10, 2, 1), (11, 0, 2), (13, 1, 2)]
NB = int(np.ceil(DUR / COMP))
for b in range(NB):
    t0 = b * COMP; ac = ACORDES[b % 4]
    tp0, L0, _, _ = secao(t0)
    if tp0 not in ('parada', 'fim'):
        add(MU, pad(ac, COMP + .3, {'intro': 500, 'pausa': 800, 'tensao': 700, 'prep': 1200}.get(tp0, 1400 + 280 * L0)), t0, .6 + .08 * L0)
    for s in range(16):
        x = t0 + s * S16
        if x >= DUR - .01: break
        tp, L, a, bb = secao(x)
        if tp == 'intro':
            if s % 2 == 0: add(BX, baixo(ac[0] - (12 if s % 8 == 0 else 0), S16 * 2, 260 + 500 * x / 3), x, .8)
            add(DR, tique(1.2 if s % 4 == 0 else .55), x, .8, pan=.25)
        elif tp in ('verso', 'drop'):
            if s % 4 == 0: bumbo(x)
            if s % 2 == 0: add(BX, baixo(ac[0] + (12 if s % 4 == 2 and L >= 2 else 0), S16 * 2, 900 + 90 * L), x)
            if L >= 2 and s in (4, 12): add(DR, clap(), x, pan=.1)
            if s % 4 == 2: add(DR, hat(.6 + .08 * L, L >= 2), x, pan=-.3)
            elif s % 2 == 1 and L >= 5: add(DR, hat(.4 + .07 * L), x, pan=.3)
            if L >= 4 and s in (0, 3, 6, 10): add(MU, stab(ac, 4000 + 300 * L, (1.1 if s == 0 else .85) * (.7 + .1 * L)), x, pan=[-.2, .2, -.1, .15][(0, 3, 6, 10).index(s)])
            if L >= 4: arp = ac[1:] + [ac[2] + 12]; add(MU, pluck(arp[(s * 3 + b) % len(arp)] + 12, .45 + .08 * (L - 4)), x, pan=.4 if s % 2 else -.4)
            if L >= 8 and s % 4 == 0: add(DR, ride(1.1), x, pan=.35)
            if L >= 8 and s in (4, 12): add(DR, caixa(.8), x, pan=-.1)
            if tp == 'verso' and L == 1 and s % 2 == 1: add(DR, tique(.7), x, pan=.25)
        elif tp == 'meio':  # depois da pancada da marca: meio tempo
            if s == 0: bumbo(x, 1, .4)
            if s == 8: add(DR, clap(1.1), x)
            if s % 2 == 0: add(BX, baixo(ac[0], S16 * 2, 700), x, .8)
        elif tp in ('prep', 'tensao'):
            k = (x - a) / (bb - a)
            if s % 4 == 0 and not (tp == 'prep' and k > .74): bumbo(x, .9, .45)
            if s % 2 == 0: add(BX, baixo(ac[0], S16 * 2, 350 + 1100 * k ** 2), x, .9)
            add(DR, tique(1.2 if s % 4 == 0 else .6), x, pan=.25)
        elif tp == 'pausa':
            if s % 4 == 0: add(BX, baixo(ac[0] - 12, S16 * 4, 300), x, .7)
    tpm, Lm, _, _ = secao(t0 + .01)
    if tpm == 'drop' and Lm >= 6:
        for s, g, d in MOTIVO:
            m = ac[1:][g] + 12; add(LD, lead(m, d * S16 * 2 * .9, 1.3), t0 + s * S16, pan=-.1); add(LD, lead(m, d * S16 * 2 * .9, .35), t0 + s * S16 + 3 * S16, pan=.4)

def virada(a, b, g=1):
    for x in np.arange(a, b - 1e-6, S16):
        k = (x - a) / max(1e-6, b - a)
        if k < .5 and round((x - a) / S16) % 2: continue
        add(DR, caixa(.35 + 1.0 * k ** 1.4) * g, x, pan=rng.uniform(-.15, .15))
for a, b, tp, L in SEC:
    if tp == 'prep': virada(a, b, 1.1); add(FX, subida(b - a + .3), a - .3)
    if tp == 'tensao': add(FX, subida(b - a + 1, .7), a)
    if tp == 'pausa': add(FX, subida(b - a, .9), a)
    if tp == 'parada': add(FX, subida(1.0, 1.1), b - 1.0); virada(b - .5, b, 1.2)
for x in SFX['golpe']: add(FX, golpe(1.25), x); add(DR, crash(1.2), x, pan=.2)
for x in SFX['golpe_leve']: add(FX, golpe(.6), x); add(DR, crash(.8), x, pan=-.2)
add(MU, stab(ACORDES[0], 6000, 2.4), SEC[-1][0]); add(MU, pad(ACORDES[0], DUR - SEC[-1][0], 2400), SEC[-1][0], 2.2)

def clique(): t = tt(.05); return (hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .5) * .3
def toque(): t = tt(.12); return np.sin(2 * np.pi * (620 + 320 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .2
def ping(f): t = tt(1.0); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 5) * .08
def tecla(): t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .06
NOTAS = [1318.5, 1567.98, 1760.0, 1975.5]
for x in SFX['clique']: add(FX, clique(), x, pan=.2)
for x in SFX['toque']: add(FX, toque(), x, pan=-.1)
for i, x in enumerate(SFX['ping']): add(FX, ping(NOTAS[i % 4]), x, pan=rng.uniform(-.3, .3))
for x in SFX['whoosh']: add(FX, whoosh(), x - .3, pan=rng.uniform(-.4, .4))
for x0, x1 in SFX['tecla']:
    for x in np.arange(x0, x1, .075): add(FX, tecla(), x + rng.uniform(-.01, .01), pan=-.2)

def mixa(cama):
    g = dict(DR=1.0, BX=1.0, MU=1.0, LD=0.0 if cama else 1.0, FX=.9 if cama else 1.0)
    L = DR[0] * g['DR'] + (BX[0] + MU[0] + LD[0] * g['LD']) * SC + FX[0] * g['FX']
    R = DR[1] * g['DR'] + (BX[1] + MU[1] + LD[1] * g['LD']) * SC + FX[1] * g['FX']
    if cama:  # abre espaço para a voz: tira 300 Hz–3,5 kHz da música
        for X in (L, R): X -= bp(X, 300, 3500) * .45
    ir = rng.standard_normal(int(2.2 * SR)) * np.exp(-tt(2.2) * 3.2) * .02
    Lw = L + fftconvolve(hp(L, 300), ir)[:N] * .35; Rw = R + fftconvolve(hp(R, 300), ir[::-1])[:N] * .35
    fade = np.ones(N); fade[:int(.02 * SR)] = np.linspace(0, 1, int(.02 * SR)); fim = int((DUR - .8) * SR); fade[fim:] = np.linspace(1, 0, N - fim)
    mix = np.stack([Lw, Rw], 1) * fade[:, None]; mix = np.tanh(mix / np.percentile(np.abs(mix), 99.9) * 1.5) * .93
    return mix * (.5 if cama else 1)   # cama ~6 dB abaixo
wavfile.write('trilha.wav', SR, (mixa(False) * 32767).astype(np.int16))
wavfile.write('trilha-locucao.wav', SR, (mixa(True) * 32767).astype(np.int16))
print('ok', DUR, 's')
