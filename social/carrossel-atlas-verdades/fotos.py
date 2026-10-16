"""Gera as 6 fotos do carrossel na Higgsfield (uma por slide, 3:4, recortada para 4:5).

  python3 fotos.py            # gera só as que faltam em fotos/
  python3 fotos.py f3         # refaz uma

Credencial: HIGGSFIELD_API_KEY e HIGGSFIELD_API_SECRET no ambiente (ver ../reel-atlas/hf.py).
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'reel-atlas'))
import hf

ESTILO = ('Candid documentary photograph, natural light, 35mm lens, shallow depth of field, '
          'warm natural colors, realistic skin texture, authentic Brazilian workplace, '
          'person looking relaxed and genuine, not posed like a stock photo, '
          'subject in the upper two thirds of the frame, no text, no logos, no watermarks.')

FOTOS = {
    # capa: grupo, clima real de trabalho, nada de terno
    'f1': 'A small diverse Brazilian team of four in casual clothes laughing during a break around a wooden table '
          'in a bright workshop-style office with plants and exposed brick, coffee mugs, one woman gesturing as she tells a story.',
    'f2': 'A Brazilian nurse in her 40s with light blue scrubs sitting on a bench in a hospital staff break area, '
          'holding a coffee cup with both hands, tired but gentle half smile, looking to the side.',
    'f3': 'A young Black Brazilian man around 25 working in a logistics warehouse, wearing a grey t-shirt and reflective vest, '
          'leaning on a stack of cardboard boxes, calm expression, shelves softly blurred behind him.',
    'f4': 'A Brazilian woman in her 30s with curly hair, wearing a dark apron, behind the counter of a busy cafe '
          'during a quiet moment, wiping her hands on a cloth, thoughtful look, warm afternoon light.',
    'f5': 'A Brazilian software developer in his late 20s with headphones around his neck, wearing a hoodie, '
          'sitting at a desk in a colorful coworking space, looking straight at the camera with a sincere, slightly serious expression.',
    'f6': 'A Brazilian HR manager in her 50s with short grey hair and a denim shirt, sitting in a sunny meeting room '
          'having an attentive one-on-one conversation with a younger colleague seen from behind, she listens and smiles.',
}
ARGS = {'aspect_ratio': '3:4', 'resolution': '1080p', 'batch_size': 1}

if __name__ == '__main__':
    pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fotos')
    os.makedirs(pasta, exist_ok=True)
    alvo = sys.argv[1:] or [k for k in FOTOS if not os.path.exists(os.path.join(pasta, k + '.jpg'))]
    for k in alvo:
        hf.run('higgsfield-ai/soul/cinema', {'prompt': FOTOS[k] + ' ' + ESTILO, **ARGS}, os.path.join(pasta, k + '.jpg'))
