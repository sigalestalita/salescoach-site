"""Fotos do carrossel (Higgsfield soul/cinema, as mesmas do estilo do Ponto cego).
  python3 fotos.py          gera as que faltam em fotos/
  python3 fotos.py capa     refaz uma
Credencial: HIGGSFIELD_API_KEY e HIGGSFIELD_API_SECRET no ambiente da sessão."""
import os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'reel-atlas'))
import hf

ESTILO = ('Cinematic editorial photograph, deep black background, single soft key light, 35mm film grain, '
          'slightly desaturated, shallow depth of field, photorealistic skin texture, no text, no logos.')
FOTOS = {
    'carro': 'A Brazilian woman in her early 30s in a beige blazer sitting still in the driver seat of a parked car in a dim '
             'underground parking garage early in the morning, both hands resting on the steering wheel, eyes closed, '
             'calm neutral face, slow deep breath before going into work, cold fluorescent light, seen from the passenger '
             'side in profile, natural relaxed hands.',
}
ARGS = {'aspect_ratio': '3:4', 'resolution': '1080p', 'batch_size': 1}
pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fotos')
alvo = [k for k in FOTOS if (len(sys.argv) == 1 and not os.path.exists(os.path.join(pasta, k + '.jpg'))) or k in sys.argv[1:]]
def gera(k):
    hf.run('higgsfield-ai/soul/cinema', {'prompt': FOTOS[k] + ' ' + ESTILO, **ARGS}, os.path.join(pasta, k + '.jpg'))
    return k
with ThreadPoolExecutor(2) as ex:
    for k in ex.map(gera, alvo): print('ok', k, flush=True)
