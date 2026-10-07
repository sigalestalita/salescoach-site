"""Trilha original do reel (40s): batimento no gancho, pads emocionais,
arpejo suave, impactos nas viradas de cena e resolução no fecho.
Gera trilha.wav (48 kHz, estéreo). Só numpy + scipy."""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000; DUR = 40.0; N = int(SR * DUR)
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
CORTES = [3.4, 7.6, 12.8, 16.8, 22.0, 27.6, 31.4, 35.0]

def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def nota(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0: return
    L[i:i+n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414
    R[i:i+n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

# Batimento (lub-dub) no gancho, acelerando e depois sumindo na calma.
def batida(g):
    t = tt(0.35); f = 50 + 40 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * g
t = 0.15
for k in range(5):
    add(batida(.9), t); add(batida(.6), t + .16); t += .62 - k * .04

# Pads: Am – F – C – G, com voicing aberto, entram em 2,6s.
ACORDES = [[57, 64, 69, 72, 76], [53, 60, 65, 69, 72], [48, 55, 64, 67, 72], [55, 62, 67, 71, 74]]
def pad(m, d):
    t = tt(d); s = np.zeros(len(t))
    for det in (-.08, 0, .08):
        s += np.sin(2 * np.pi * nota(m + det) * t + rng.random() * 6) + .3 * np.sin(2 * np.pi * nota(m + det) * 2 * t)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2)
    return lp(s * env, 1800) * .05
BAR = 2.6
tc = 2.6; i = 0
while tc < 39:
    for m in ACORDES[i % 4]:
        add(pad(m, BAR + 1.2), tc, 1, pan=rng.uniform(-.5, .5))
    add(np.sin(2 * np.pi * nota(ACORDES[i % 4][0] - 12) * tt(BAR + .6)) * np.minimum(1, tt(BAR + .6) / .3) * np.exp(-tt(BAR + .6) * .4) * .16, tc)
    tc += BAR; i += 1

# Arpejo de piano suave (seno com harmônicos e decaimento) a partir de 7,6s.
def piano(m, g=1):
    t = tt(1.6); f = nota(m)
    s = sum(np.sin(2 * np.pi * f * h * t) * a for h, a in [(1, 1), (2, .4), (3, .15), (4, .08)])
    return s * np.exp(-t * 3.2) * np.minimum(1, t / .005) * .07 * g
STEP = BAR / 8
for k in range(int((38.5 - 7.6) / STEP)):
    tk = 7.6 + k * STEP; ac = ACORDES[int((tk - 2.6) / BAR) % 4]
    seq = [ac[2] + 12, ac[3] + 12, ac[4] + 12, ac[3] + 12]
    add(piano(seq[k % 4], .7 + .3 * (k % 2 == 0)), tk, pan=(-.3, .3)[k % 2])

# Impactos suaves e "whoosh" nas viradas.
def whoosh(d=.7):
    t = tt(d); n = rng.standard_normal(len(t))
    env = np.sin(np.pi * t / d) ** 2
    return hp(lp(n, 3000), 300) * env * .07
def impacto():
    t = tt(2.0); f = 40 + 30 * np.exp(-t * 12)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3) * .5 + lp(rng.standard_normal(len(t)), 800) * np.exp(-t * 8) * .15)
for c in CORTES:
    add(whoosh(), c - .5, pan=rng.uniform(-.4, .4))
for c in (7.6, 16.8, 35.0):
    add(impacto(), c, .8)

# Subida antes do número (riser de 6,4 a 7,6s).
t = tt(1.2); add(hp(rng.standard_normal(len(t)), 1500) * (t / 1.2) ** 3 * .12, 6.4)

# Reverb simples.
irl = rng.standard_normal(int(2.6 * SR)) * np.exp(-tt(2.6) * 2.6) * .02
irr = rng.standard_normal(int(2.6 * SR)) * np.exp(-tt(2.6) * 2.6) * .02
Lw = L + fftconvolve(L, irl)[:N] * .6; Rw = R + fftconvolve(R, irr)[:N] * .6

# Fade final e normalização.
fade = np.ones(N); fade[int(37.5 * SR):] = np.linspace(1, 0, N - int(37.5 * SR)) ** 1.5
mix = np.stack([Lw, Rw], 1) * fade[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.2) * .89
wavfile.write('trilha.wav', SR, (mix * 32767).astype(np.int16))
print('trilha.wav', DUR, 's')
