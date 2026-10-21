"""Trilha do vídeo de lançamento (Sales Sprint, ~80s): abre em suspense (drone, sino de vidro a cada
pergunta, pulso grave), entra o groove na revelação e respira a cada pergunta dos capítulos: a bateria
some enquanto a pergunta aparece e volta quando a tela entra. Sons de interface (clique, tecla, toque,
ping) seguem os eventos de cada tela. Lê a linha do tempo do <script id="tl"> do index.html e gera
trilha.wav (48 kHz, estéreo)."""
import json, re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

html = open('index.html', encoding='utf-8').read()
TL = json.loads(re.search(r'<script id="tl" type="application/json">(.*?)</script>', html, re.S).group(1))
DUR, REV, Q = TL['DUR'], TL['REV'], TL['Q']
CAPS = TL['CAPS']; FQ_A, FQ_B, FIM = TL['FECHO']
SR = 48000; N = int(SR * DUR); rng = np.random.default_rng(7)
def buf(): return [np.zeros(N), np.zeros(N)]
MUS, DR, FX = buf(), buf(), buf()
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def nota(m): return 440 * 2 ** ((m - 69) / 12)
def add(B, sig, t, g=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    B[0][i:i+n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; B[1][i:i+n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

BPM = 96; BEAT = 60 / BPM; COMP = 4 * BEAT
ACORDES = [[45, 52, 59, 60, 64, 71], [41, 48, 55, 57, 64, 67], [48, 55, 62, 64, 67, 71], [43, 50, 57, 59, 62, 69]]  # Am9 Fmaj9 Cmaj9 G6/9
def pad(m, d, brilho=1500):
    t = tt(d); s = sum(np.sin(2 * np.pi * nota(m + dt) * t + rng.random() * 6) for dt in (-.08, 0, .08))
    return lp(s * np.minimum(1, t / 1.6) * np.minimum(1, (d - t) / 1.2), brilho) * .034
def sub(m, d): t = tt(d); return np.sin(2 * np.pi * nota(m - 12) * t) * np.minimum(1, t / .05) * np.exp(-t * .8) * .15
def kick(): t = tt(.5); f = 40 + 105 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * .42
def hat(g=1): t = tt(.05); return hp(rng.standard_normal(len(t)), 9000) * np.exp(-t * 90) * .045 * g
def clap(): t = tt(.2); return bp(rng.standard_normal(len(t)), 1200, 5000) * (np.exp(-t * 28) + .4 * np.exp(-np.maximum(0, t - .012) * 32)) * .085
def pluck(m, g=1):
    t = tt(1.0); s = sum(np.sin(2 * np.pi * nota(m) * h * t) * a for h, a in [(1, 1), (2, .28), (4, .07)])
    return s * np.exp(-t * 5) * np.minimum(1, t / .003) * .045 * g
def sino(f, g=1):  # vidro: parciais inarmônicos, ataque macio
    t = tt(3.2); s = sum(np.sin(2 * np.pi * f * r * t) * a * np.exp(-t * (1.2 + r * .6)) for r, a in [(1, 1), (2.76, .35), (5.4, .12), (8.9, .05)])
    return s * np.minimum(1, t / .02) * .07 * g
def pulso(): t = tt(.7); f = 48 + 30 * np.exp(-t * 20); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * .3

# Pad o tempo todo; mais escuro na abertura
t0 = 0.0; k = 0
while t0 < DUR:
    ac = ACORDES[k % 4]
    for m in ac[1:]: add(MUS, pad(m, COMP + 1.6, 900 if t0 < REV else 1600), t0, pan=rng.uniform(-.7, .7))
    add(MUS, pad(ac[0] - 12, COMP + 1.6, 400), t0, 1.6)
    if t0 >= REV - .1: add(MUS, sub(ac[0], COMP), t0)
    for b in range(8):
        tb = t0 + b * BEAT / 2
        if REV <= tb < DUR - 2.2:
            if b % 2 == 0: add(DR, kick(), tb, .9)
            if b in (2, 6): add(DR, clap(), tb, pan=.15)
            add(DR, hat(.6 if b % 2 == 0 else 1), tb, pan=-.25)
            if b % 2 == 1:
                arp = ac[2:] + [ac[3] + 12]
                add(DR, pluck(arp[(k * 8 + b) % len(arp)] + 12, .8), tb, pan=rng.uniform(-.5, .5))
    t0 += COMP; k += 1

# Abertura: pulso grave e sino a cada pergunta
for x in np.arange(3.4, REV - .4, 2 * BEAT): add(MUS, pulso(), x, .8)
for i, (a, b) in enumerate(TL['INTRO']): add(FX, sino([880.0, 987.8, 1174.7][i]), a + .05, .9, pan=[-.3, .3, 0][i])

# Gate da bateria: some nas perguntas dos capítulos e na pergunta do fecho
g = np.zeros(N); tg = np.arange(N) / SR
g[tg >= REV] = 1
janelas = [(a + .15, a + Q - .2) for a, b in CAPS] + [(FQ_A, FIM - .15)]
for a, b in janelas: g[(tg >= a) & (tg < b)] = .06
g = np.convolve(g, np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
DR = [DR[0] * g, DR[1] * g]

def clique(): t = tt(.05); return (hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .5) * .33
def toque(): t = tt(.12); return np.sin(2 * np.pi * (620 + 320 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .22
def ping(f): t = tt(1.2); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 4.5) * .09
def tecla(): t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .07
def whoosh(d=.8): t = tt(d); return hp(lp(rng.standard_normal(len(t)), 5000), 300) * np.sin(np.pi * t / d) ** 2 * .065
def impacto(g=1):
    t = tt(2.6); f = 36 + 60 * np.exp(-t * 10)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * .6 + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 4) * .12) * g
def subida(d):
    t = tt(d); x = t / d
    return bp(rng.standard_normal(len(t)), 800, 9000) * x ** 2.5 * .085 + np.sin(2 * np.pi * np.cumsum(220 + 660 * x ** 2) / SR) * x ** 3 * .03

add(FX, subida(REV - 8.1), 8.1); add(FX, impacto(), REV)
NOTAS = [1318.5, 1567.98, 1760.0, 1975.5]
for i, ((a, b), ev) in enumerate(zip(CAPS, TL['EV'])):
    s = a + Q
    add(FX, sino([659.3, 784.0, 880.0, 987.8, 1046.5, 1174.7, 1318.5][i], .75), a + .05, pan=rng.uniform(-.3, .3))
    add(FX, subida(.9), s - .9, .6); add(FX, impacto(.35), s - .02); add(FX, whoosh(), s - .45, pan=rng.uniform(-.4, .4))
    for c in ev.get('clique', []): add(FX, clique(), s + c, pan=.2)
    for c in ev.get('toque', []): add(FX, toque(), s + c, pan=-.1)
    for j, c in enumerate(ev.get('ping', [])): add(FX, ping(NOTAS[(i + j) % 4]), s + c, pan=rng.uniform(-.3, .3))
    for x0, x1 in ev.get('tecla', []):
        for x in np.arange(x0, x1, .065): add(FX, tecla(), s + x + rng.uniform(-.01, .01), pan=-.2)
add(FX, sino(1318.5), FQ_A + .05); add(FX, subida(FIM - (FQ_B - 1.0)), FQ_B - 1.0); add(FX, impacto(), FIM)

L = MUS[0] + DR[0] + FX[0]; R = MUS[1] + DR[1] + FX[1]
ir = rng.standard_normal(int(3.0 * SR)) * np.exp(-tt(3.0) * 2.2) * .02
Lw = L + fftconvolve(L, ir)[:N] * .6; Rw = R + fftconvolve(R, ir[::-1])[:N] * .6
fade = np.ones(N); fade[int((DUR - 2.4) * SR):] = np.linspace(1, 0, N - int((DUR - 2.4) * SR)) ** 1.3
fade[:int(.02 * SR)] = np.linspace(0, 1, int(.02 * SR))
mix = np.stack([Lw, Rw], 1) * fade[:, None]; mix = np.tanh(mix / np.abs(mix).max() * 1.3) * .9
wavfile.write('trilha.wav', SR, (mix * 32767).astype(np.int16))
print('ok', DUR, 's')
