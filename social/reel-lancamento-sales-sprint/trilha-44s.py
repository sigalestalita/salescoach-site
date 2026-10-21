"""Trilha do reel de lançamento (Sales Sprint): pad escuro e elegante, pulso a partir da
revelação, subidas antes dos impactos e sons de interface (clique, toque, ping, tecla).
Lê a linha do tempo do <script id="tl"> do index.html. Gera trilha.wav (48 kHz, estéreo)."""
import json, re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

html = open('horizontal-44s.html', encoding='utf-8').read()
TL = json.loads(re.search(r'<script id="tl" type="application/json">(.*?)</script>', html, re.S).group(1))
DUR = TL['DUR']; CENAS = TL['CENAS']
SR = 48000; N = int(SR * DUR); rng = np.random.default_rng(11)
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

BPM = 112; BEAT = 60 / BPM; COMP = 4 * BEAT
ACORDES = [[45, 52, 59, 60, 64, 71], [41, 48, 55, 57, 64, 67], [48, 55, 62, 64, 67, 71], [43, 50, 57, 59, 62, 69]]  # Am9 Fmaj9 Cmaj9 G6/9
REV = CENAS[1] + 1.2; FIM = CENAS[-1]
def pad(m, d):
    t = tt(d); s = sum(np.sin(2 * np.pi * nota(m + dt) * t + rng.random() * 6) for dt in (-.07, 0, .07))
    return lp(s * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.0), 1500) * .035
def sub(m, d): t = tt(d); return np.sin(2 * np.pi * nota(m - 12) * t) * np.minimum(1, t / .05) * np.exp(-t * .9) * .16
def kick(): t = tt(.45); f = 42 + 110 * np.exp(-t * 32); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) * .45
def hat(g=1): t = tt(.05); return hp(rng.standard_normal(len(t)), 9000) * np.exp(-t * 90) * .05 * g
def clap(): t = tt(.18); return bp(rng.standard_normal(len(t)), 1200, 5000) * (np.exp(-t * 30) + .4 * np.exp(-np.maximum(0, t - .012) * 35)) * .1
def pluck(m, g=1):
    t = tt(.9); s = sum(np.sin(2 * np.pi * nota(m) * h * t) * a for h, a in [(1, 1), (2, .3), (4, .08)])
    return s * np.exp(-t * 6) * np.minimum(1, t / .003) * .05 * g

t0 = 0.0; k = 0
while t0 < DUR:
    ac = ACORDES[k % 4]
    for m in ac[1:]: add(pad(m, COMP + 1.2), t0, pan=rng.uniform(-.7, .7))
    if t0 >= REV - .1: add(sub(ac[0], COMP), t0)
    for b in range(8):
        tb = t0 + b * BEAT / 2
        dentro = REV <= tb < FIM + .2
        if dentro and b % 2 == 0: add(kick(), tb, .9)
        if dentro and b in (2, 6): add(clap(), tb, pan=.15)
        if dentro: add(hat(.6 if b % 2 == 0 else 1), tb, pan=-.25)
        if tb >= REV and tb < DUR - 2.5 and b % 2 == 1:
            arp = ac[2:] + [ac[3] + 12]
            add(pluck(arp[(k * 8 + b) % len(arp)] + 12, .8), tb, pan=rng.uniform(-.5, .5))
    t0 += COMP; k += 1

def clique(): t = tt(.05); return (hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .5) * .35
def toque(): t = tt(.12); return np.sin(2 * np.pi * (620 + 320 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .26
def ping(f): t = tt(1.2); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 4.5) * .1
def tecla(): t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .08
def whoosh(d=.7): t = tt(d); return hp(lp(rng.standard_normal(len(t)), 5000), 300) * np.sin(np.pi * t / d) ** 2 * .07
def impacto():
    t = tt(2.6); f = 36 + 60 * np.exp(-t * 10)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * .6 + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 4) * .12)
def subida(a, b):
    d = b - a; t = tt(d); x = t / d
    ruido = bp(rng.standard_normal(len(t)), 800, 9000) * x ** 2.5 * .09
    tom = np.sin(2 * np.pi * np.cumsum(220 + 660 * x ** 2) / SR) * x ** 3 * .035
    return ruido + tom

for c in CENAS[2:]: add(whoosh(), c - .4, pan=rng.uniform(-.4, .4))
for c in TL['CLIQUE']: add(clique(), c, pan=.2)
for c in TL['TOQUE']: add(toque(), c, pan=-.1)
for i, c in enumerate(TL['PING']): add(ping([1318.5, 1567.98, 1760.0, 1975.5][i % 4]), c, pan=rng.uniform(-.3, .3))
for a, b in TL['TECLA']:
    for x in np.arange(a, b, .065): add(tecla(), x + rng.uniform(-.01, .01), pan=-.2)
for a, b in TL['SUBIDA']: add(subida(a, b), a)
for c in TL['IMPACTO']: add(impacto(), c, .8 if c < 1 else 1)

ir = rng.standard_normal(int(2.6 * SR)) * np.exp(-tt(2.6) * 2.6) * .02
Lw = L + fftconvolve(L, ir)[:N] * .55; Rw = R + fftconvolve(R, ir[::-1])[:N] * .55
fade = np.ones(N); fade[int((DUR - 1.6) * SR):] = np.linspace(1, 0, N - int((DUR - 1.6) * SR)) ** 1.3
fade[:int(.02 * SR)] = np.linspace(0, 1, int(.02 * SR))
mix = np.stack([Lw, Rw], 1) * fade[:, None]; mix = np.tanh(mix / np.abs(mix).max() * 1.3) * .9
wavfile.write('trilha-44s.wav', SR, (mix * 32767).astype(np.int16))
print('ok', DUR, 's')
