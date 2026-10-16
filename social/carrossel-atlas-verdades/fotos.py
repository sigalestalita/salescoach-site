"""Gera as 6 fotos do carrossel na Higgsfield (uma por slide, 3:4, recortada para 4:5).

  python3 fotos.py            # gera só as que faltam em fotos/
  python3 fotos.py f3         # refaz uma

Credencial: HIGGSFIELD_API_KEY e HIGGSFIELD_API_SECRET no ambiente (ver ../reel-atlas/hf.py).
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'reel-atlas'))
import hf

ESTILO = ('Candid documentary photograph, natural light, 35mm lens, shallow depth of field, '
          'warm natural colors, realistic skin texture, modern Brazilian corporate workplace, '
          'genuine emotion, not posed like a stock photo, '
          'subject in the upper two thirds of the frame, no text, no logos, no watermarks.')

FOTOS = {
    # 1 · Verdades que o RH precisa ouvir: o que não se diz em voz alta
    'f1': 'A modern Brazilian marketing agency meeting room with glass walls and post-its: in the foreground a woman around 30 '
          'in a casual blazer sits with arms crossed and lips pressed, holding back her opinion, '
          'while blurred colleagues in their late 20s and 30s brainstorm and laugh in front of a screen behind her.',
    # 2 · Ninguém reclamar não significa que o time está bem
    'f2': 'Five young Brazilian sales reps in their late 20s, smart casual, sitting around a meeting table in a modern startup office, '
          'their manager just asked if anyone has a concern and nobody answers: all silent, avoiding eye contact, '
          'one staring at her coffee cup, one looking at his laptop, a young woman in the center looking down with a tense face. '
          'Eye-level shot across the table, natural window light',
    # 3 · Turnover baixo não significa equipe engajada
    'f3': 'A young Brazilian sales rep around 27 in a modern startup sales floor, wearing a casual sweater and a headset around his neck, '
          'slumped in his chair with his cheek on his hand, staring blankly at a laptop, bored and disengaged, '
          'young colleagues blurred and busy in the background, plants and neon sign',
    # 4 · Equipe ocupada não significa equipe motivada
    'f4': 'A creative agency at deadline time in the evening: colleagues rushing past in motion blur, post-its and moodboards on the wall, '
          'in the middle a young Brazilian designer around 28 sits still in front of two monitors, exhausted, drained empty expression, '
          'the only sharp person in the frame.',
    # 5 · Se o seu melhor talento pedisse demissão amanhã…
    'f5': 'A confident Brazilian woman around 30, smart casual, standing at her desk in a modern sales office packing her things into a cardboard box: '
          'a small plant, a mug and a glass top seller award on top of the box. Last day at work, calm and decided expression, '
          'blurred colleagues watching in the background.',
    # 6 · Atlas Clima: ouvir o time por área e por liderança
    'f6': 'Two Brazilian colleagues around 30 sitting across a small table in a bright modern marketing agency with plants: '
          'a people manager woman with a warm, kind smile, nodding as she listens, holding a notebook, '
          'and a young man seen in soft focus from the side, talking openly with relief. Friendly, open, trusting atmosphere, '
          'medium shot, both faces partly visible, one single photograph',
}
ARGS = {'aspect_ratio': '3:4', 'resolution': '1080p', 'batch_size': 1}

if __name__ == '__main__':
    pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fotos')
    os.makedirs(pasta, exist_ok=True)
    alvo = sys.argv[1:] or [k for k in FOTOS if not os.path.exists(os.path.join(pasta, k + '.jpg'))]
    for k in alvo:
        hf.run('higgsfield-ai/soul/cinema', {'prompt': FOTOS[k] + ' ' + ESTILO, **ARGS}, os.path.join(pasta, k + '.jpg'))
