"""Narração do vídeo de lançamento com o ElevenLabs e mixagem com a trilha.

Lê as falas e as janelas de tempo da tabela do locucao.md, gera cada fala separada (voz grave
masculina, pt-BR), encaixa cada uma na sua janela (acelera um pouco se passar do tempo), abaixa a
música por baixo da voz e gera:
  out/narracao.wav               só a voz, no tempo do vídeo
  out/trilha-com-narracao.wav    voz + cama da trilha (trilha-locucao.wav), com a música abaixando sob a voz
A chave fica fora do repositório: ELEVENLABS_API_KEY no ambiente. As falas geradas ficam em cache
(narracao-cache/, ignorado pelo git), então mudar uma fala só gera aquela de novo.

Uso: ELEVENLABS_API_KEY=... python3 narracao.py [voice_id]
"""
import hashlib, json, os, re, subprocess, sys, urllib.request
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

VOZ = sys.argv[1] if len(sys.argv) > 1 else 'gsZm1DPba0FTT6X1RVYW'   # voz escolhida na biblioteca do ElevenLabs
MODELO = 'eleven_multilingual_v2'
AJUSTE = {'stability': .3, 'similarity_boost': .8, 'style': .6, 'use_speaker_boost': True}
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
CACHE = 'narracao-cache'; SR = 48000
CHAVE = os.environ.get('ELEVENLABS_API_KEY', '')

def seg(s):  # "1:58,5" -> 118.5
    m, x = s.split(':'); return int(m) * 60 + float(x.replace(',', '.'))
falas = []
for linha in open('locucao.md', encoding='utf-8'):
    m = re.match(r'\| (\d+:\d+(?:,\d+)?)–(\d+:\d+(?:,\d+)?) \| .*? \| (.+?) \|\s*$', linha)
    if m and not m.group(3).startswith('('): falas.append((seg(m.group(1)), seg(m.group(2)), m.group(3)))

def pausas(texto):  # reticências = pausa curta, fim de frase = pausa maior
    t = re.sub(r'…\s*', '… <break time="0.4s"/> ', texto.strip())
    return re.sub(r'([.?!])\s+(?=\S)', r'\1 <break time="0.6s"/> ', t)
def pergunta(texto): return texto.strip().endswith('?')
def gera(texto, vel=1.0, antes='', depois=''):
    os.makedirs(CACHE, exist_ok=True)
    if pergunta(texto):   # perguntas: modelo mais expressivo, frase inteira e tom dramático
        modelo, corpo = 'eleven_v3', {'text': '[dramatic tone] [intense] ' + texto, 'model_id': 'eleven_v3', 'voice_settings': {'stability': .5, 'similarity_boost': .8, 'speed': vel}}
    else:
        modelo, corpo = MODELO, {'text': pausas(texto), 'model_id': MODELO, 'voice_settings': {**AJUSTE, 'speed': vel},
                                 'previous_text': antes, 'next_text': depois}   # contexto: entonação contínua entre as falas
    h = hashlib.sha1(json.dumps([VOZ, corpo]).encode()).hexdigest()[:16]
    mp3, wav = f'{CACHE}/{h}.mp3', f'{CACHE}/{h}.wav'
    if not os.path.exists(mp3):
        if not CHAVE: sys.exit('Defina ELEVENLABS_API_KEY.')
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128', json.dumps(corpo).encode(),
                                     {'xi-api-key': CHAVE, 'Content-Type': 'application/json'})
        open(mp3, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
    if not os.path.exists(wav): subprocess.run([FF, '-v', 'error', '-y', '-i', mp3, '-ac', '1', '-ar', str(SR), wav], check=True)
    sr, x = wavfile.read(wav); x = x.astype(float) / 32768
    i = np.flatnonzero(np.abs(x) > .01)   # tira o silêncio das pontas
    return x[max(0, i[0] - 200): i[-1] + 2400] if len(i) else x

sr, cama = wavfile.read('trilha-locucao.wav'); cama = cama.astype(float) / 32768
N = len(cama); voz = np.zeros(N); LEG = []
for k, (a, b, texto) in enumerate(falas):
    ini, jan = a + .3, (b - a) - .5
    antes = falas[k - 1][2] if k else ''; depois = falas[k + 1][2] if k + 1 < len(falas) else ''
    x = gera(texto, 1.0, antes, depois)
    if len(x) / SR > jan:   # passou da janela: gera um pouco mais rápido
        x = gera(texto, round(min(1.15, len(x) / SR / jan + .02), 2), antes, depois)
    if len(x) / SR > jan + (1.4 if pergunta(texto) else 0): print(f'AVISO: "{texto[:40]}…" ainda passa {len(x) / SR - jan:.1f}s da janela')
    if pergunta(texto):   # impacto nas perguntas: um pouco mais alta e com cauda de eco de trailer
        cauda = np.random.default_rng(3).standard_normal(int(1.4 * SR)) * np.exp(-np.arange(int(1.4 * SR)) / SR * 4.5) * .035
        x = np.concatenate([x, np.zeros(len(cauda))]); x = x * 1.15 + fftconvolve(x, cauda)[:len(x)] * .5
    LEG.append((ini, x if not pergunta(texto) else None, texto, len(x) / SR))
    i = int(ini * SR); n = min(len(x), N - i); voz[i:i + n] += x[:n]
    print(f'{a:6.1f}s  {len(x) / SR:4.1f}s de {jan:4.1f}s  {texto}')

voz = sosfilt(butter(2, 90, 'high', fs=SR, output='sos'), voz)
voz = np.tanh(voz / np.percentile(np.abs(voz[np.abs(voz) > .01]), 99.5) * 1.1) * .9   # nível e leve compressão
env = np.convolve(np.abs(voz), np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); env = np.minimum(1, env / .05)
duck = 1 - .45 * np.convolve(env, np.ones(int(.3 * SR)) / int(.3 * SR), 'same')   # música abaixa ~5 dB sob a voz
mix = cama * duck[:, None] * 1.25 + voz[:, None] * .78
mix = np.tanh(mix / max(1e-9, np.percentile(np.abs(mix), 99.95)) * 1.1) * .94
os.makedirs('out', exist_ok=True)
wavfile.write('out/narracao.wav', SR, (np.stack([voz, voz], 1) * .9 * 32767).astype(np.int16))
wavfile.write('out/trilha-com-narracao.wav', SR, (mix * 32767).astype(np.int16))

# ---- Legendas: cada frase no tempo em que é falada (pelas pausas da própria voz)
def frases(texto):  # frases e grupos: frases muito curtas vão junto com a seguinte (até ~60 caracteres)
    fr = [f.strip() for f in re.split(r'(?<=[.!?…])\s+', texto) if f.strip()]
    grupos = []
    for k, f in enumerate(fr):
        if grupos and (len(' '.join(fr[i] for i in grupos[-1])) < 14 or len(f) < 10) and len(' '.join(fr[i] for i in grupos[-1])) + len(f) < 62: grupos[-1].append(k)
        else: grupos.append([k])
    return fr, grupos
def tempos(x, n):  # fronteiras nas n-1 maiores pausas da fala
    if n <= 1 or x is None: return [0, len(x) / SR if x is not None else 0]
    e = np.convolve(np.abs(x), np.ones(480) / 480, 'same') < .012
    gaps, i = [], 0
    while i < len(e):
        if e[i]:
            j = i
            while j < len(e) and e[j]: j += 1
            if (j - i) / SR > .15 and i > 0 and j < len(e): gaps.append(((j - i) / SR, (i + j) / 2 / SR))
            i = j
        else: i += 1
    if len(gaps) < n - 1: return None
    meio = sorted(g[1] for g in sorted(gaps, reverse=True)[:n - 1]); return [0] + meio + [len(x) / SR]
cues = []
for ini, x, texto, dur in LEG:
    fr, grupos = frases(texto) if x is not None else ([texto], [[0]])
    tp = tempos(x, len(fr)) if x is not None else None
    if tp is None:   # sem pausas suficientes: divide pelo tamanho das frases
        tot = sum(len(f) for f in fr); acc = 0; tp = [0]
        for f in fr: acc += len(f); tp.append(dur * acc / tot)
    for g in grupos: cues.append([round(ini + tp[g[0]], 2), round(ini + tp[g[-1] + 1] + .3, 2), ' '.join(fr[i] for i in g), x is not None])
for k in range(len(cues) - 1): cues[k][1] = min(cues[k][1], cues[k + 1][0])   # uma legenda por vez
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(s % 1 * 1000):03d}'
with open('out/legendas.srt', 'w', encoding='utf-8') as f:
    for k, (a, b, txt, _) in enumerate(cues, 1): f.write(f'{k}\n{ts(a)} --> {ts(b)}\n{txt}\n\n')
# na imagem, só o que não está escrito na tela: as respostas sobre as telas do produto (16s a 118s)
json.dump([[a, b, txt] for a, b, txt, resp in cues if resp and 16 <= a < 118], open('legendas.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('ok', len(falas), 'falas,', len(cues), 'legendas')
