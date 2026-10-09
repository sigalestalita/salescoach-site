"""Trilha dos reels do Atlas: calma e clara (~100 bpm), com som de clique ou
toque em cada interação. Lê do index.html as cenas (CENAS), os cliques
(CURSOR, entradas terminadas em ", 1]") e os efeitos extras (SONS).
Gera trilha.wav (48 kHz, estéreo). Só numpy + scipy."""
import json, re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

html = open('index.html', encoding='utf-8').read()
DUR = float(re.search(r'DUR: ([\d.]+)', html).group(1))
INICIOS = [float(a) for a in re.findall(r's\d: \[([\d.]+), [\d.]+\]', html)]
bloco = html[html.index('CURSOR: ['):html.index('INIT()')]
CLIQUES = [float(t) for t in re.findall(r'\[([\d.]+), [^\[\]]*?(?:\[[^\]]*\])?[^\[\]]*?, 1\]', bloco)]
SONS = json.loads(re.search(r'SONS: (\{.*?\}),\n', html).group(1))
TOQUE = [tuple(map(float, f)) for f in re.findall(r"\[([\d.]+), ([\d.]+), 'toque'\]", html)]

SR = 48000; N = int(SR * DUR); rng = np.random.default_rng(8)
L = np.zeros(N); R = np.zeros(N)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def nota(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    L[i:i+n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; R[i:i+n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

BEAT = 60 / 100
ACORDES = [[48, 55, 64, 67, 71], [45, 52, 60, 64, 67], [41, 48, 57, 64, 69], [43, 50, 59, 62, 67]]   # Cmaj7 Am7 Fmaj7 G
def pad(m, d):
    t = tt(d); s = sum(np.sin(2 * np.pi * nota(m + dt) * t + rng.random() * 6) for dt in (-.06, 0, .06))
    return lp(s * np.minimum(1, t / .8) * np.minimum(1, (d - t) / .8), 1800) * .04
def kick(): t = tt(.4); f = 46 + 90 * np.exp(-t * 28); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * .4
def hat(): t = tt(.06); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * 70) * .07
def rim(): t = tt(.12); return bp(rng.standard_normal(len(t)), 1500, 4000) * np.exp(-t * 40) * .12
def piano(m, g=1):
    t = tt(1.4); s = sum(np.sin(2 * np.pi * nota(m) * h * t) * a for h, a in [(1, 1), (2, .35), (3, .12)])
    return s * np.exp(-t * 3.5) * np.minimum(1, t / .004) * .06 * g
compasso = 4 * BEAT; t0 = 0.0; k = 0
fim_batida = INICIOS[-1]
while t0 < DUR:
    ac = ACORDES[k % 4]
    for m in ac: add(pad(m, compasso + .8), t0, pan=rng.uniform(-.6, .6))
    add(np.sin(2 * np.pi * nota(ac[0] - 12) * tt(compasso)) * np.exp(-tt(compasso) * .8) * .14, t0)
    for b in range(4):
        tb = t0 + b * BEAT
        if INICIOS[1] - .2 < tb < fim_batida:
            if b in (0, 2): add(kick(), tb)
            if b in (1, 3): add(rim(), tb, pan=.2)
            add(hat(), tb + BEAT / 2, pan=-.3)
        if tb > INICIOS[1] and tb < DUR - 2:
            for j in range(2): add(piano(ac[[2, 3, 4, 3][(b * 2 + j) % 4]] + 12, .8 if j else 1), tb + j * BEAT / 2, pan=(-.3, .3)[j])
    t0 += compasso; k += 1

def em_toque(t): return any(a <= t < b for a, b in TOQUE)
def clique():
    t = tt(.05); return (hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .5) * .4
def toque():
    t = tt(.12); return np.sin(2 * np.pi * (520 + 300 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .3
def ping(f=1320): t = tt(1.0); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 5) * .12
def tecla(): t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .1
def whoosh(d=.6): t = tt(d); return hp(lp(rng.standard_normal(len(t)), 4000), 400) * np.sin(np.pi * t / d) ** 2 * .08
def impacto(): t = tt(2.0); f = 40 + 45 * np.exp(-t * 12); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) * .5
def pulso(a, b):
    t = tt(b - a + 1.2); f = 200 + 600 * np.clip(t / (b - a), 0, 1); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-np.maximum(0, t - (b - a)) * 6) * .03
for c in CLIQUES: add(toque() if em_toque(c) else clique(), c, pan=.2)
for c in INICIOS[1:]: add(whoosh(), c - .45, pan=rng.uniform(-.4, .4))
add(impacto(), .1); add(impacto(), INICIOS[-1])
for i, c in enumerate(SONS['ping']): add(ping([1320, 1568, 1175, 1760][i % 4]), c)
for a, b in SONS['tecla']:
    for x in np.arange(a, b, .07): add(tecla(), x + rng.uniform(-.01, .01), pan=-.2)
add(pulso(*SONS['pulso']), SONS['pulso'][0])

ir = rng.standard_normal(int(2.2 * SR)) * np.exp(-tt(2.2) * 3) * .02
Lw = L + fftconvolve(L, ir)[:N] * .5; Rw = R + fftconvolve(R, ir[::-1])[:N] * .5
fade = np.ones(N); fade[int((DUR - 1.8) * SR):] = np.linspace(1, 0, N - int((DUR - 1.8) * SR)) ** 1.4
mix = np.stack([Lw, Rw], 1) * fade[:, None]; mix = np.tanh(mix / np.abs(mix).max() * 1.25) * .89
wavfile.write('trilha.wav', SR, (mix * 32767).astype(np.int16))
print('cenas', INICIOS, '\ncliques', CLIQUES)
