"""Trilha do reel do Sales Coach (44,5s, ~118 bpm), sincronizada com a tela:
lê os cliques do cursor direto do index.html e põe o som de cada um no lugar.
Gera trilha.wav (48 kHz, estéreo). Só numpy + scipy."""
import re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000; DUR = 44.5; N = int(SR * DUR)
rng = np.random.default_rng(5)
L = np.zeros(N); R = np.zeros(N)
html = open('index.html', encoding='utf-8').read()
bloco = html[html.index('const CURSOR'):html.index('const CLIQUES')]
CLIQUES = [float(m) for m in re.findall(r'\[(\d+(?:\.\d+)?),[^\]]*\]?[^\[]*?, 1\]', bloco)]
CORTES = [3.2, 10.4, 17.6, 25.4, 31.6, 37.0, 41.0]

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

BEAT = 60 / 118
# Acordes: Fmaj7 – Am7 – Dm9 – Bbmaj7 (claro, otimista), 2 compassos cada.
ACORDES = [[53, 57, 60, 64, 69], [57, 60, 64, 67, 72], [50, 57, 60, 64, 65], [46, 53, 57, 62, 65]]
def pad(m, d):
    t = tt(d); s = sum(np.sin(2 * np.pi * nota(m + dt) * t + rng.random() * 6) for dt in (-.07, 0, .07))
    s += .25 * np.sign(np.sin(2 * np.pi * nota(m) * t)) * .3
    return lp(s * np.minimum(1, t / .4) * np.minimum(1, (d - t) / .6), 2200) * .035
def kick():
    t = tt(.4); f = 48 + 120 * np.exp(-t * 30)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) * 1.8) * .55
def hat(): t = tt(.07); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * 60) * .12
def clap(): t = tt(.25); return bp(rng.standard_normal(len(t)), 900, 3500) * np.exp(-t * 22) * .22
def baixo(m, d):
    t = tt(d); s = np.sin(2 * np.pi * nota(m) * t) + .3 * np.sin(4 * np.pi * nota(m) * t)
    return lp(s * np.exp(-t * 2.2) * np.minimum(1, t / .01), 900) * .2
def pluck(m):
    t = tt(.5); s = sum(np.sin(2 * np.pi * nota(m) * h * t) * a for h, a in [(1, 1), (2, .5), (3, .2)])
    return s * np.exp(-t * 9) * .05

compasso = 4 * BEAT; t0 = 0.0; k = 0
while t0 < DUR:
    ac = ACORDES[(k // 2) % 4]
    for m in ac: add(pad(m, compasso + .3), t0, pan=rng.uniform(-.6, .6))
    for b in range(4):
        tb = t0 + b * BEAT
        if tb > 2.9 and tb < 41.0:              # batida entra depois da abertura
            add(kick(), tb)
            add(hat(), tb + BEAT / 2, pan=.3); add(hat(), tb + BEAT / 4, .5, pan=-.3)
            if b in (1, 3): add(clap(), tb)
            add(baixo(ac[0] - 12, BEAT * .9), tb + (BEAT / 2 if b % 2 else 0))
        if tb > 3.2 and tb < 41:
            for j, o in enumerate((0, 2, 4, 2)):
                add(pluck(ac[[2, 3, 4, 3][j]] + 12), tb + j * BEAT / 4, pan=(-.4, .4)[j % 2])
    t0 += compasso; k += 1

# Efeitos de interface.
def clique():
    t = tt(.05); s = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .5
    return s * .45
def ping(f=1320):
    t = tt(.9); return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 6) * .12
def tecla():
    t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .12
def whoosh(d=.6):
    t = tt(d); return hp(lp(rng.standard_normal(len(t)), 4000), 400) * np.sin(np.pi * t / d) ** 2 * .1
def impacto():
    t = tt(1.6); f = 42 + 50 * np.exp(-t * 14)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5) * .55
for c in CLIQUES: add(clique(), c, pan=.2)
for c in CORTES: add(whoosh(), c - .45, pan=rng.uniform(-.4, .4))
add(impacto(), 0.15); add(impacto(), 41.0)
for c in (13.7, 15.0): add(ping(1320), c)            # dicas ao vivo
add(ping(1568), 24.35); add(ping(1760), 38.55)       # CRM e documento processado
add(ping(1175), 19.4); add(ping(1320), 21.2)          # análise pronta, nota
for x in np.arange(26.35, 27.45, .055): add(tecla(), x + rng.uniform(-.01, .01), pan=-.2)   # digitação
for x in np.arange(11.8, 13.5, .09): add(tecla(), x, .4, pan=.3)                           # transcrição

ir = rng.standard_normal(int(1.8 * SR)) * np.exp(-tt(1.8) * 3.5) * .02
Lw = L + fftconvolve(L, ir)[:N] * .4; Rw = R + fftconvolve(R, ir[::-1])[:N] * .4
fade = np.ones(N); fade[int(42.8 * SR):] = np.linspace(1, 0, N - int(42.8 * SR)) ** 1.4
fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
mix = np.stack([Lw, Rw], 1) * fade[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.3) * .89
wavfile.write('trilha.wav', SR, (mix * 32767).astype(np.int16))
print('cliques:', CLIQUES)
