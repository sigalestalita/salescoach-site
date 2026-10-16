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
          'genuine emotion, not posed like a stock photo, '
          'subject in the upper two thirds of the frame, no text, no logos, no watermarks.')

FOTOS = {
    # 1 · Verdades que o RH precisa ouvir: o que não se diz em voz alta
    'f1': 'A team meeting in a bright, informal Brazilian workplace with plants: in the foreground a young woman in a casual t-shirt '
          'sits with her arms crossed, lips pressed, holding back what she wants to say, while blurred colleagues in the background '
          'laugh and talk. The contrast between her silence and the group is the focus.',
    # 2 · Ninguém reclamar não significa que o time está bem
    'f2': 'A row of Brazilian factory workers in grey uniforms and safety glasses standing side by side in a quiet factory hall, '
          'all silent with closed mouths, eyes looking down or away, arms crossed or hands in pockets, nobody raising a hand. '
          'A single empty space in the moment, heavy uncomfortable silence. Eye-level shot facing the workers, one woman in the center in sharp focus',
    # 3 · Turnover baixo não significa equipe engajada
    'f3': 'A Brazilian man in his 40s in a supermarket uniform standing behind a checkout counter with no customers, '
          'chin resting on his hand, staring blankly at the wall clock, bored and disengaged, the same routine for years. '
          'Fluorescent supermarket light, aisles blurred behind.',
    # 4 · Equipe ocupada não significa equipe motivada
    'f4': 'Close-up portrait of an exhausted young Brazilian cook in a white chef jacket standing still in a busy restaurant kitchen, '
          'eyes tired and unfocused, sweat on his forehead, shoulders slumped, while other cooks rush past him as motion blur and pans steam behind. '
          'He is the only sharp person in the frame, empty drained expression',
    # 5 · Se o seu melhor talento pedisse demissão amanhã…
    'f5': 'A young Brazilian woman in her late 20s, casual clothes, packing her personal things into a cardboard box at her desk '
          'in a colorful creative studio: a small plant, a mug, a notebook and a framed photo on top of the box. '
          'Last day at work, calm but decided expression, colleagues blurred in the background.',
    # 6 · Atlas Clima: ouvir o time por área e por liderança
    'f6': 'A Brazilian HR leader in her 40s in a casual linen shirt sitting at a small table in a bright break room, '
          'leaning forward and listening attentively to a young warehouse worker in a reflective vest who is talking openly and gesturing, '
          'both relaxed, a feeling of trust and being heard. Over-the-shoulder shot, her face in focus, no phones, one single photograph',
}
ARGS = {'aspect_ratio': '3:4', 'resolution': '1080p', 'batch_size': 1}

if __name__ == '__main__':
    pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fotos')
    os.makedirs(pasta, exist_ok=True)
    alvo = sys.argv[1:] or [k for k in FOTOS if not os.path.exists(os.path.join(pasta, k + '.jpg'))]
    for k in alvo:
        hf.run('higgsfield-ai/soul/cinema', {'prompt': FOTOS[k] + ' ' + ESTILO, **ARGS}, os.path.join(pasta, k + '.jpg'))
