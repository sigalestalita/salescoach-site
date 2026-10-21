"""Trilha do vídeo de lançamento (Sales Sprint, ~93s): marcante e com ritmo, 122 bpm.
Abertura cinematográfica (ostinato grave abrindo o filtro, tique em semicolcheias, golpe pesado a cada
pergunta, virada de caixa e subida) até o impacto da revelação. Daí em diante, groove de pista: bumbo
4/4, palma no 2 e no 4, chimbal aberto no contratempo, baixo em colcheias com sidechain, acordes
sincopados e arpejo. Em cada pergunta dos capítulos a bateria segura (sem bumbo, baixo filtrado e
pulsando) e uma virada de caixa leva ao drop quando a tela entra. O grid recomeça em cada seção, então
os golpes caem junto com o que aparece na tela. Sons de interface seguem os eventos de cada tela.
Lê a linha do tempo do <script id="tl"> do index.html e gera trilha.wav (48 kHz, estéreo)."""
import json, re
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

html = open('index.html', encoding='utf-8').read()
TL = json.loads(re.search(r'<script id="tl" type="application/json">(.*?)</script>', html, re.S).group(1))
DUR, REV, Q = TL['DUR'], TL['REV'], TL['Q']
CAPS = TL['CAPS']; FQ_A, FQ_B, FIM = TL['FECHO']
SR = 48000; N = int(SR * DUR); rng = np.random.default_rng(5)
def buf(): return [np.zeros(N), np.zeros(N)]
DR, BX, MU, FX = buf(), buf(), buf(), buf()   # bateria, baixo, música (sidechain), efeitos
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def nota(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, t): return 2 * ((f * t + rng.random()) % 1) - 1
def add(B, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR)); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    B[0][i:i+n] += sig[:n] * g * np.sqrt((1 - pan) / 2) * 1.414; B[1][i:i+n] += sig[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

BPM = 122; BEAT = 60 / BPM; S16 = BEAT / 4
ACORDES = [[45, 57, 60, 64, 67], [41, 57, 60, 65, 69], [48, 55, 60, 64, 67], [43, 55, 59, 62, 67]]  # Am7 F C G (raiz + voicing)

# ---- Instrumentos
def kick():
    t = tt(.45); f = 45 + 140 * np.exp(-t * 38)
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    clk = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 400) * .4
    return np.tanh((corpo + clk) * 2.2) * .55
def clap():
    t = tt(.28); n = bp(rng.standard_normal(len(t)), 900, 6000)
    env = sum(np.exp(-np.maximum(0, t - d) * 60) * (t >= d) for d in (0, .011, .022)) * .5 + np.exp(-np.maximum(0, t - .022) * 14) * (t >= .022)
    tom = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .5
    return (n * env + tom) * .3
def caixa(g=1):
    t = tt(.18); return (bp(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t * 26) + np.sin(2 * np.pi * 210 * t) * np.exp(-t * 35) * .6) * .16 * g
def hat(g=1, aberto=False):
    d = .22 if aberto else .045; t = tt(d); return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * (14 if aberto else 95)) * .13 * g
def crash():
    t = tt(2.5); return hp(rng.standard_normal(len(t)), 4500) * np.exp(-t * 1.6) * .11
def baixo(m, d, corte):
    t = tt(d); s = saw(nota(m), t) + .6 * np.sin(2 * np.pi * nota(m) * t)
    return np.tanh(lp(s, corte) * 1.8) * np.minimum(1, t / .004) * np.exp(-t * 3.5) * .3
def stab(ac, d=.32, g=1):
    t = tt(d); s = sum(saw(nota(m) * dt, t) for m in ac[1:] for dt in (.995, 1.005))
    return lp(s, 5200) * np.minimum(1, t / .003) * np.exp(-t * 9) * .065 * g
def pluck(m, g=1):
    t = tt(.4); s = saw(nota(m), t); return lp(s, 2600) * np.exp(-t * 14) * np.minimum(1, t / .002) * .05 * g
def pad(ac, d, corte=1800):
    t = tt(d); s = sum(saw(nota(m) * dt, t) for m in ac[1:] for dt in (.993, 1.007))
    return lp(s, corte) * np.minimum(1, t / .4) * np.minimum(1, (d - t) / .3) * .022
def golpe(g=1):  # pancada de trailer: grave que despenca + acorde sujo + ar
    t = tt(3.2); f = 32 + 70 * np.exp(-t * 9)
    grave = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    braam = np.tanh(lp(sum(saw(nota(m), t) for m in (33, 40, 45, 48)), 700) * 3) * np.exp(-t * 1.3) * .35
    ar = lp(rng.standard_normal(len(t)), 1200) * np.exp(-t * 5) * .25
    return (grave * .8 + braam + ar) * g
def subida(d, g=1):
    t = tt(d); x = t / d
    return (bp(rng.standard_normal(len(t)), 600, 10000) * x ** 2.2 * .12 + np.sin(2 * np.pi * np.cumsum(180 + 1200 * x ** 2.5) / SR) * x ** 3 * .045) * g
def tique(): t = tt(.03); return hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 200) * .05
def virada(a, b, g=1):  # caixa em semicolcheias acelerando de volume
    for x in np.arange(a, b - 1e-6, S16):
        k = (x - a) / max(1e-6, b - a); add(DR, caixa(.35 + .9 * k ** 1.5) * g, x, pan=rng.uniform(-.15, .15))

# ---- Seções (o grid recomeça em cada uma)
SEC = [(0, REV, 'intro'), (REV, CAPS[0][0], 'main')]
for a, b in CAPS: SEC += [(a, a + Q, 'perg'), (a + Q, b, 'main')]
SEC += [(CAPS[-1][1], FQ_A, 'main'), (FQ_A, FIM, 'perg'), (FIM, DUR, 'main')]
SC = np.ones(N)  # sidechain: abaixa música e baixo a cada bumbo
def bomba(t): i = int(round(t * SR)); n = min(int(.3 * SR), N - i); SC[i:i+n] = np.minimum(SC[i:i+n], .3 + .7 * (np.arange(n) / n) ** .6)

barra = 0
for a, b, tipo in SEC:
    d = b - a
    if d <= .05: continue
    nb = int(np.ceil(d / (4 * BEAT)))
    for bi in range(nb):
        ac = ACORDES[(barra + bi) % 4]; t0 = a + bi * 4 * BEAT
        if t0 >= b - .02: break
        dur_bar = min(4 * BEAT, b - t0)
        add(MU, pad(ac, dur_bar + .3, 900 if tipo != 'main' else 2000), t0, 1.0 if tipo == 'main' else .8, pan=rng.uniform(-.3, .3))
        for s in range(16):
            x = t0 + s * S16
            if x >= b - .01: break
            if tipo == 'main':
                if s % 4 == 0: add(DR, kick(), x); bomba(x)
                if s in (4, 12): add(DR, clap(), x, pan=.1)
                if s % 4 == 2: add(DR, hat(1, True), x, pan=-.3)
                elif s % 2 == 1: add(DR, hat(.5), x, pan=.3)
                if s % 2 == 0: add(BX, baixo(ac[0] + (12 if s % 4 == 2 else 0), S16 * 2, 1300), x)
                if s in (0, 3, 6, 10): add(MU, stab(ac, g=1.1 if s == 0 else .8), x, pan=[-.2, .2, -.1, .15][(0, 3, 6, 10).index(s)])
                arp = ac[1:] + [ac[2] + 12]
                add(MU, pluck(arp[(s * 3 + bi) % len(arp)] + 12, .6), x, pan=.4 if s % 2 else -.4)
            elif tipo == 'perg':
                if s % 2 == 0: add(BX, baixo(ac[0], S16 * 2, 380 + 900 * ((x - a) / d) ** 2), x, .9)
                add(DR, tique() * (1.4 if s % 4 == 0 else .7), x, pan=.25)
                if s in (4, 12): add(DR, hat(.6, True), x, pan=-.3)
            else:  # intro: ostinato grave abrindo o filtro, tique a partir da 2ª pergunta
                k = (x - a) / d
                if s % 2 == 0: add(BX, baixo(ac[0] if s % 8 else ac[0] - 12, S16 * 2, 250 + 1300 * k ** 1.6), x, .7 + .5 * k)
                if x > TL['INTRO'][1][0]: add(DR, tique() * (1.3 if s % 4 == 0 else .6), x, .6 + .8 * k, pan=.25)
                if x > TL['INTRO'][2][0] and s % 4 == 0: add(DR, kick() * .5, x); bomba(x)
    barra += nb
    if tipo == 'perg':
        add(FX, golpe(.75), a + .02); virada(b - min(1.6, 4 * BEAT * .8), b); add(FX, subida(1.4, .9), b - 1.4)
    if tipo == 'main' and a >= REV - .01: add(FX, crash(), a, pan=.2)

for x in TL['INTRO']: add(FX, golpe(.85), x[0] + .02)
virada(REV - 2.0, REV, 1.1); add(FX, subida(2.6), REV - 2.6); add(FX, golpe(1.2), REV)
add(FX, golpe(1.25), FIM)

# ---- Interface
def clique(): t = tt(.05); return (hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 180) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * .5) * .3
def toque(): t = tt(.12); return np.sin(2 * np.pi * (620 + 320 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * .2
def ping(f): t = tt(1.0); return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 5) * .08
def tecla(): t = tt(.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 250) * .06
NOTAS = [1318.5, 1567.98, 1760.0, 1975.5]
for i, ((a, b), ev) in enumerate(zip(CAPS, TL['EV'])):
    s = a + Q
    for c in ev.get('clique', []): add(FX, clique(), s + c, pan=.2)
    for c in ev.get('toque', []): add(FX, toque(), s + c, pan=-.1)
    for j, c in enumerate(ev.get('ping', [])): add(FX, ping(NOTAS[(i + j) % 4]), s + c, pan=rng.uniform(-.3, .3))
    for x0, x1 in ev.get('tecla', []):
        for x in np.arange(x0, x1, .065): add(FX, tecla(), s + x + rng.uniform(-.01, .01), pan=-.2)

# ---- Mix
L = DR[0] * 1.0 + (BX[0] + MU[0]) * SC + FX[0]; R = DR[1] + (BX[1] + MU[1]) * SC + FX[1]
ir = rng.standard_normal(int(2.2 * SR)) * np.exp(-tt(2.2) * 3.2) * .02
Lw = L + fftconvolve(hp(L, 300), ir)[:N] * .35; Rw = R + fftconvolve(hp(R, 300), ir[::-1])[:N] * .35
fade = np.ones(N); fade[int((DUR - 2.4) * SR):] = np.linspace(1, 0, N - int((DUR - 2.4) * SR)) ** 1.2
fade[:int(.02 * SR)] = np.linspace(0, 1, int(.02 * SR))
mix = np.stack([Lw, Rw], 1) * fade[:, None]; mix = np.tanh(mix / np.percentile(np.abs(mix), 99.9) * 1.5) * .93
wavfile.write('trilha.wav', SR, (mix * 32767).astype(np.int16))
print('ok', DUR, 's')
