"""Série "Frases na cena": frases curtas impressas dentro de cenas reais
(placa do metrô, tela de relógio, costas de jaqueta, placa enferrujada,
etiqueta de tecido...), na pegada da referência de out/2026.

Cada item vira uma foto 4:5 no Ideogram 4.0 (Higgsfield), que escreve o
texto dentro da imagem com acento. A assinatura da marca entra depois, no
render (render.mjs), para sair sempre igual e legível.

  python3 cenas.py            gera as fotos que faltam em fotos/
  python3 cenas.py sc-c1 ...  gera (ou refaz) só esses
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

HF = os.path.join(os.path.dirname(__file__), '..', 'reel-atlas', 'hf.py')
AQUI = os.path.dirname(os.path.abspath(__file__))
FFMPEG = os.environ.get('FFMPEG', '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2')

ESTILO = (
    'Moody cinematic photograph, tight close framing so the text is large and dominates the frame, '
    'natural low light, 35mm film grain, slightly desaturated tones, shallow depth of field, '
    'photorealistic, realistic textures, wear and imperfections. The text is sharp, bold and perfectly '
    'legible, spelled exactly as written in Brazilian Portuguese with correct accents. '
    'No other words, no logos, no watermark, no people facing the camera.'
)

# (id, marca, formato, cena com o texto exato entre aspas)
CENAS = [
    # ── Sales Coach · carrossel "Vendas sem achismo" ──
    ('sc-c1', 'sales-coach', 'carrossel', 'Close-up of a long black metal sign above a subway train door, lit by a harsh fluorescent tube, large bold condensed white letters printed on it reading exactly: "Feeling não é método." Grimy station, peeling stickers, scratches.'),
    ('sc-c2', 'sales-coach', 'carrossel', 'Extreme close-up of a black smartwatch on a dark wooden desk beside a navy blue notebook and a black pen, warm low lamp light. The watch screen is filled edge to edge with large white text reading exactly: "A call acabou. O aprendizado não." A tiny header at the top of the screen reads "Vendas" and "18:42".'),
    ('sc-c3', 'sales-coach', 'carrossel', 'Black and white street photograph of a man seen from behind at a rooftop party, wearing a dark navy work jacket with large hand-painted white uppercase letters on the back reading exactly: "QUEM NÃO OUVE A CALL, CHUTA O FEEDBACK." Blurred people around, wooden fence, string lights.'),
    ('sc-c4', 'sales-coach', 'carrossel', 'Low angle close-up of an old rusty round metal road sign on a pole against a dramatic stormy sky at dusk, large bold black letters painted on the weathered white sign reading exactly: "Objeção é pergunta mal respondida." Rust stains, chipped paint, dry bushes below.'),
    ('sc-c5', 'sales-coach', 'carrossel', 'Macro photograph of a woven fabric label sewn inside a dark navy blue jacket, tight weave texture, bold black uppercase letters woven into the olive label reading exactly: "OUÇA. ANALISE. TREINE." Soft side light.'),
    # ── Sales Coach · carrossel "Robô e extensão" (produto) ──
    ('sc-k1', 'sales-coach', 'carrossel', 'Close-up of an illuminated rectangular lightbox sign mounted above the glass door of a dark modern meeting room, warm white light behind frosted acrylic, large bold black uppercase letters reading exactly, in two lines: "QUEM ANOTA" / "NÃO ESCUTA." Blurred office corridor, cool night tones, reflections on the glass.'),
    ('sc-k2', 'sales-coach', 'carrossel', 'Close-up of an old black split-flap departure board in a dim train station, the white flaps spell exactly, in two lines: "A REUNIÃO ACABA." / "A ANÁLISE COMEÇA." Slight motion blur of travelers far behind, warm and cold light mixed.'),
    ('sc-k3', 'sales-coach', 'carrossel', 'A cold white neon sign glowing on a dark concrete wall of an empty office at night, the neon tubes spelling exactly, in two lines: "Menos achismo." / "Mais método." Faint navy blue ambient light, a desk and a closed laptop blurred below.'),
    # ── Sales Coach · posts únicos ──
    ('sc-p1', 'sales-coach', 'post', 'A cold white neon sign glowing on a dark brick wall in an empty bar at night, the neon tubes spelling exactly, in two lines: "Vendedor bom pergunta." / "Vendedor ótimo escuta." Faint navy blue ambient light, reflections on the bar counter.'),
    ('sc-p2', 'sales-coach', 'post', 'Close-up of an old black split-flap departure board in a train station, the white flaps spell exactly, in three lines: "SEU CRM NÃO SABE" / "O QUE O CLIENTE" / "DISSE." Dim station light, slight motion blur of travelers far behind.'),
    # ── Atlas · carrossel "Clima se mede" ──
    ('at-c1', 'atlas', 'carrossel', 'Close-up of a gray concrete office corridor wall with large bold black letters painted by hand reading exactly: "Ninguém pede demissão do nada." A blue door frame at the edge, cold morning light from a window, subtle paint drips.'),
    ('at-c2', 'atlas', 'carrossel', 'Close-up of a takeaway coffee cup with a kraft paper sleeve on a café table, the sleeve is rubber-stamped in dark blue ink with letters reading exactly: "Silêncio no time não é paz." Steam, morning window light, blurred laptop behind.'),
    ('at-c3', 'atlas', 'carrossel', 'Close-up of a used office whiteboard in a meeting room, handwritten in blue marker in big letters reading exactly: "Pesquisa anual é autópsia." Faint ghost marks of erased diagrams, a marker resting on the tray, soft daylight.'),
    ('at-c4', 'atlas', 'carrossel', 'Black and white photograph of a person seen from behind in an open office, wearing a dark hoodie with large white screen-printed uppercase letters on the back reading exactly: "GENTE BOA SAI DE GESTOR RUIM." Out of focus desks and monitors around.'),
    ('at-c5', 'atlas', 'carrossel', 'Close-up of a dark blue leather notebook cover with letters debossed into the leather reading exactly: "Clima não se sente. Se mede." Lying on a wooden desk with a pen, warm side light revealing the leather grain.'),
    # ── Atlas · posts únicos ──
    ('at-p1', 'atlas', 'post', 'A wheatpaste street poster on a weathered concrete wall in the city, slightly torn at the edges, bold black letters on off-white paper reading exactly: "O pedido de demissão começa meses antes." Overcast light, a blue painted pipe at the side.'),
    ('at-p2', 'atlas', 'post', 'Close-up of a yellow sticky note stuck on the edge of a computer monitor in a dim office at night, handwritten in blue pen reading exactly: "Já perguntou como seu time está hoje?" Monitor glow, blurred keyboard.'),
    # ── NEXA · carrossel "IA com método" ──
    ('nx-c1', 'nexa', 'carrossel', 'A large roadside billboard at night lit from below, black background with huge bold white letters reading exactly: "IA não substitui time. Substitui desculpa." A thin lime green line under the text, dark sky, highway lights blurred below.'),
    ('nx-c2', 'nexa', 'carrossel', 'Macro close-up of a long thermal paper receipt curling out of a small printer on a dark desk, printed in black monospace letters reading exactly: "PLANILHA NÃO É ESTRATÉGIA." Warm desk lamp light, shallow depth of field.'),
    ('nx-c3', 'nexa', 'carrossel', 'Close-up of a black baseball cap on a wooden table, with lime green embroidered uppercase letters on the front reading exactly: "PRIMEIRO O PROBLEMA." and a second smaller line "DEPOIS A IA." Visible stitching texture, soft window light.'),
    ('nx-c4', 'nexa', 'carrossel', 'Huge bold black letters painted directly on a white brick wall of an industrial warehouse, reading exactly in three lines: "Quem automatiza o caos" / "ganha caos" / "mais rápido." A lime green ladder leaning on the wall, daylight from high windows.'),
    ('nx-c5', 'nexa', 'carrossel', 'Close-up of a closed dark gray laptop lid on a desk with one rectangular lime green vinyl sticker with bold black letters reading exactly: "Ferramenta sem processo é enfeite." Coffee cup ring stain, soft daylight.'),
    # ── NEXA · posts únicos ──
    ('nx-p1', 'nexa', 'post', 'A natural canvas tote bag hanging on a hook against a dark wall, with large bold black screen-printed letters reading exactly: "Menos ferramenta. Mais resultado." A small lime green tag on the handle, soft side light.'),
    ('nx-p2', 'nexa', 'post', 'Close-up of a red LED dot matrix display above an elevator door in a dark modern building lobby, the glowing dots spell exactly: "SEU CONCORRENTE JÁ AUTOMATIZOU ISSO." Brushed steel doors, reflections.'),
    # ── NEXA · notícia: Itaú compra a NeoSpace (26/10/2026) ──
    ('nx-n1', 'nexa', 'noticia', 'A huge rooftop billboard on top of a building on Avenida Faria Lima in São Paulo at dusk, seen from street level, the billboard has a solid bright orange background with bold white uppercase letters in three lines reading exactly: "ITAÚ" / "COMPRA A NEOSPACE" / "POR R$ 2,9 BILHÕES" No other logos or icons. Glass skyscrapers around, blurred traffic lights below, deep blue sky, the billboard lit from below.'),
    ('nx-n2', 'nexa', 'noticia', 'Close-up of a heavy round polished steel bank vault door in a dark marble basement, with a brass plaque riveted to the door engraved in bold uppercase letters reading exactly: "IA NÃO É MAIS TESTE. É PATRIMÔNIO." Warm spotlight from above, reflections on the steel, bolts and hinges visible.'),
    ('nx-n3', 'nexa', 'noticia', 'Huge bold black stencil letters spray-painted on a raw concrete wall of an empty underground parking garage, clean industrial stencil typeface, reading exactly in three lines: "QUEM ESPERA A IA" / "FICAR PRONTA, COMPRA" / "DE QUEM NÃO ESPEROU." A single lime green parking line on the floor, cold fluorescent light.'),
    ('nx-n4', 'nexa', 'noticia', 'Close-up of a used whiteboard in a small company meeting room, neatly written in clean block capital letters with a black marker reading exactly: "VOCÊ NÃO PRECISA DE R$ 2,9 BI." and below, in lime green marker, clean block capital letters reading exactly: "PRECISA COMEÇAR." A marker resting on the tray, laptop corner blurred, soft daylight.'),
]


def gera(item):
    cid, _marca, _fmt, cena = item
    jpg = os.path.join(AQUI, 'fotos', cid + '.jpg')
    if os.path.exists(jpg) and len(sys.argv) == 1:
        return cid, 'já existe'
    png = jpg[:-4] + '.png'
    args = json.dumps({'prompt': cena + ' ' + ESTILO, 'aspect_ratio': '4:5'})
    r = subprocess.run([sys.executable, HF, 'run', 'ideogram/v4.0', args, png], capture_output=True, text=True)
    if os.path.exists(png):
        para_jpg(png)
    return cid, (r.stdout.strip().splitlines() or [''])[-1] + r.stderr.strip()[-200:]


def para_jpg(png):
    """O Ideogram entrega PNG de ~6 MB; guarda JPG de alta qualidade (as outras séries também)."""
    jpg = png[:-4] + '.jpg'
    subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', png, '-q:v', '2', jpg], check=True)
    os.remove(png)
    if os.path.exists(png + '.json'):
        os.replace(png + '.json', jpg[:-4] + '.json')


if __name__ == '__main__':
    alvo = [c for c in CENAS if len(sys.argv) == 1 or c[0] in sys.argv[1:]]
    with ThreadPoolExecutor(4) as ex:
        for cid, st in ex.map(gera, alvo):
            print(cid, st, flush=True)
