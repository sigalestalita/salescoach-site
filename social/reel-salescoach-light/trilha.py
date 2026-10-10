"""Trilha do vídeo light do Sales Coach (22s, ~96 bpm): clara, arejada e precisa.
Lê o roteiro de sons (cliques, cortes, pops) direto do index.html, então mexer
num tempo lá move o som junto. Gera trilha.wav (48 kHz, estéreo). Só numpy + scipy."""
import re, json
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000; DUR = 22.0; N = int(SR * DUR)
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
html = open('index.html', encoding='utf-8').read()
SONS = json.loads(re.sub(r'(\w+):', r'"\1":', html[html.index('const SONS = ') + 13:html.index(';', html.index('const SONS = '))]))
bloco = html[html.index('const CURSORES'):html.index('const SONS')]
CLIQUES = sorted(float(m) for m in re.findall(r'\[(\d+(?:\.\d+)?), [^\[\]]*?(?:\[[^\]]*\])?[^\[\]]*?, 1\]', bloco))

def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def nota(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    L[i:i+n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i+n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

BEAT = 60 / 96
# Dmaj9 – Bm11 – Gmaj9 – A6sus: luminoso, sem drama.
ACORDES = [[50, 57, 61, 64, 66], [47, 54, 57, 62, 64], [43, 50, 54, 57, 62], [45, 52, 54, 59, 61]]
def pad(m, d):
    t = tt(d); s = sum(np.sin(2 * np.pi * nota(m + dt) * t + rng.random() * 6) for dt in (-.06, 0, .06))
    return lp(s * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.0), 1800) * .03
def piano(m, g=1.0):
    t = tt(2.2); f = nota(m)
    s = sum(np.sin(2 * np.pi * f * h * t) * a * np.exp(-t * (2.2 + h)) for h, a in [(1, 1), (2, .35), (3, .12), (4, .05)])
    return lp(s * np.minimum(1, t / .004), 3500) * .085 * g
def kick():
    t = tt(.35); f = 46 + 90 * np.exp(-t * 34)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * .32
def shaker(): t = tt(.09); return bp(rng.standard_normal(len(t)), 5000, 11000) * np.exp(-t * 45) * .05
def sino(m, g=1.0):
    t = tt(1.4); f = nota(m)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)) * np.exp(-t * 3.2) * .07 * g

compasso = 4 * BEAT; t0 = 0.0; k = 0
while t0 < DUR:
    ac = ACORDES[k % 4]
    for m in ac: add(pad(m, compasso + 1.2), t0, pan=rng.uniform(-.7, .7))
    for b in range(4):
        tb = t0 + b * BEAT
        if 3.1 < tb < 18.6:
            add(kick(), tb, .9 if b in (0, 2) else .45)
            for j in range(2): add(shaker(), tb + j * BEAT / 2 + BEAT / 4, pan=(-.35, .35)[j])
        if 1.0 < tb < 21.0:
            arp = [ac[2] + 12, ac[3] + 12, ac[4] + 12, ac[3] + 12]
            add(piano(arp[b]), tb, .8, pan=(-.3, .3)[b % 2])
            if b == 2: add(piano(arp[1] + 7, .5), tb + BEAT / 2, pan=.4)
    t0 += compasso; k += 1

def clique():
    t = tt(.04); return (hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 220) + np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 160) * .4) * .3
def whoosh(d=.7):
    t = tt(d); return hp(lp(rng.standard_normal(len(t)), 5000), 600) * np.sin(np.pi * t / d) ** 2 * .07
def subida(d=1.0):
    t = tt(d); f = 300 + 900 * (t / d) ** 2
    return lp(hp(rng.standard_normal(len(t)), 900), 6000) * (t / d) ** 2 * .05 + np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 3 * .015

for c in CLIQUES: add(clique(), c, pan=.15)
for c in SONS['cortes']: add(whoosh(), c - .4, pan=rng.uniform(-.3, .3))
escala = [74, 76, 78, 81, 83, 86, 88, 90, 93, 95]
for i, p in enumerate(SONS['pops']): add(sino(escala[i], .8), p + .05, pan=np.sin(i * 1.7) * .6)
add(subida(.7), 2.8)
add(sino(86), SONS['dica']); add(sino(90, .7), SONS['dica'] + .12)
add(sino(81), SONS['nota']); add(sino(86), SONS['meta']); add(sino(90, .8), SONS['meta'] + .1)
add(sino(88), SONS['crm']); add(sino(93, .7), SONS['crm'] + .12)
for m in (62, 69, 74, 78, 81): add(piano(m, 1.4), SONS['fim'] + (m - 62) * .006, pan=rng.uniform(-.4, .4))
add(sino(98, .6), SONS['fim'] + .4)

ir = rng.standard_normal(int(2.4 * SR)) * np.exp(-tt(2.4) * 2.6) * .02
Lw = L + fftconvolve(L, ir)[:N] * .55; Rw = R + fftconvolve(R, ir[::-1])[:N] * .55
fade = np.ones(N); fade[int(20.4 * SR):] = np.linspace(1, 0, N - int(20.4 * SR)) ** 1.3
fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
mix = np.stack([Lw, Rw], 1) * fade[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.2) * .89
wavfile.write('trilha.wav', SR, (mix * 32767).astype(np.int16))
print('cliques:', CLIQUES)
