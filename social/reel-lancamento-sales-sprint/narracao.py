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
from scipy.signal import butter, sosfilt

VOZ = sys.argv[1] if len(sys.argv) > 1 else '7i7dgyCkKt4c16dLtwT3'   # David - Deep, Gravelly and Resonant (pt-BR)
MODELO = 'eleven_multilingual_v2'
AJUSTE = {'stability': .38, 'similarity_boost': .8, 'style': .45, 'use_speaker_boost': True}
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
CACHE = 'narracao-cache'; SR = 48000
CHAVE = os.environ.get('ELEVENLABS_API_KEY', '')

def seg(s):  # "1:58,5" -> 118.5
    m, x = s.split(':'); return int(m) * 60 + float(x.replace(',', '.'))
falas = []
for linha in open('locucao.md', encoding='utf-8'):
    m = re.match(r'\| (\d+:\d+(?:,\d+)?)–(\d+:\d+(?:,\d+)?) \| .*? \| (.+?) \|\s*$', linha)
    if m and not m.group(3).startswith('('): falas.append((seg(m.group(1)), seg(m.group(2)), m.group(3)))

def gera(texto, vel=1.0):
    os.makedirs(CACHE, exist_ok=True)
    h = hashlib.sha1(json.dumps([VOZ, MODELO, AJUSTE, texto, vel]).encode()).hexdigest()[:16]
    mp3, wav = f'{CACHE}/{h}.mp3', f'{CACHE}/{h}.wav'
    if not os.path.exists(mp3):
        if not CHAVE: sys.exit('Defina ELEVENLABS_API_KEY.')
        corpo = json.dumps({'text': texto, 'model_id': MODELO, 'voice_settings': {**AJUSTE, 'speed': vel}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128', corpo,
                                     {'xi-api-key': CHAVE, 'Content-Type': 'application/json'})
        open(mp3, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
    if not os.path.exists(wav): subprocess.run([FF, '-v', 'error', '-y', '-i', mp3, '-ac', '1', '-ar', str(SR), wav], check=True)
    sr, x = wavfile.read(wav); x = x.astype(float) / 32768
    i = np.flatnonzero(np.abs(x) > .01)   # tira o silêncio das pontas
    return x[max(0, i[0] - 200): i[-1] + 2400] if len(i) else x

sr, cama = wavfile.read('trilha-locucao.wav'); cama = cama.astype(float) / 32768
N = len(cama); voz = np.zeros(N)
for a, b, texto in falas:
    ini, jan = a + .3, (b - a) - .5
    x = gera(texto)
    if len(x) / SR > jan:   # passou da janela: gera um pouco mais rápido
        x = gera(texto, round(min(1.15, len(x) / SR / jan + .02), 2))
    if len(x) / SR > jan: print(f'AVISO: "{texto[:40]}…" ainda passa {len(x) / SR - jan:.1f}s da janela')
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
print('ok', len(falas), 'falas')
