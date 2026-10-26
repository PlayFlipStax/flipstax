# FlipStax - the Mystery Doors art (Oct 25): the three single doors cut out of their grey studio backdrop and the stage, as WebP in data/doors/.
#   door-wood.webp, door-blue.webp   the doors as drawn, cut out (tools/cutout.swift), a 1 px erode + the rim colour taken from the solid
#                                    pixels just inside (no grey fringe); the wood door's crown loses the two flat purple strips at its corners
#   door-copper.webp                 the copper door was drawn as a plain rectangle: it is cut to the tall elongated hexagon of doors2-shape-ref
#                                    (slanted shoulders, widest about a quarter down, tapering to a narrower flat bottom)
#   stage.webp                       doors2-clean (the stage with the blank sign), 768 wide
# Budgets: each door < 100 KB, the stage < 150 KB.
#   screenshots/qa/tools/venv/bin/python tools/build-doors-art.py
import os, subprocess, tempfile
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'incoming-assets/gemini'); OUT = os.path.join(ROOT, 'data/doors'); os.makedirs(OUT, exist_ok=True)
TOOL = os.path.join(tempfile.gettempdir(), 'flipstax-cutout')
if not os.path.exists(TOOL): subprocess.run(['swiftc', '-O', os.path.join(ROOT, 'tools/cutout.swift'), '-o', TOOL], check=True)
H = 640   # door height in px (3 doors across a phone at 2x)

def save(im, name, kb):
    o = os.path.join(OUT, name)
    for q in (84, 78, 72, 66, 60, 54, 48):
        im.save(o, 'WEBP', quality=q, method=6, alpha_quality=85)
        if os.path.getsize(o) <= kb * 1024: break
    print('%-18s %4dx%-4d %6.1f KB q%d' % (name, im.width, im.height, os.path.getsize(o) / 1024, q)); return o

def lift(name):
    tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False).name
    subprocess.run([TOOL, os.path.join(SRC, name + '.jpg'), tmp], check=True, stdout=subprocess.DEVNULL)
    im = Image.open(tmp).convert('RGBA'); os.unlink(tmp); return im

def clean_edge(im):
    """erode the alpha ~1 px and give the soft rim the colour of the solid pixels just inside it (no grey fringe)"""
    a = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    rgb = np.asarray(im.convert('RGB')).astype('float32'); al = np.asarray(a).astype('float32') / 255
    solid = (al > 0.97).astype('float32')
    blur = lambda ch: np.asarray(Image.fromarray((ch).astype('uint8')).filter(ImageFilter.GaussianBlur(4))).astype('float32')
    num = np.stack([blur(rgb[..., c] * solid) for c in range(3)], -1); den = (blur(solid * 255) / 255)[..., None]
    fill = num / np.maximum(den, 1e-3)
    rim = (al <= 0.97)[..., None] & (den > 0.02)
    out = Image.fromarray(np.where(rim, fill, rgb).clip(0, 255).astype('uint8')).convert('RGBA'); out.putalpha(a); return out

def trim(im, pad=2):
    b = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox(); b = (b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad)
    return im.crop(b)

def fit(im):
    return im.resize((round(im.width * H / im.height), H), Image.LANCZOS)

# --- wood: take the two flat purple strips out of the crown's corners (hue ~270, not the jewel in the middle)
wood = lift('door-wood'); arr = np.asarray(wood).copy()
rgb = arr[..., :3].astype(int); r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
purple = (b > g + 25) & (r > g + 10) & (b > 90)
box = np.zeros(purple.shape, bool)
box[100:165, 190:250] = True; box[100:165, 500:565] = True
pink = (b > g + 6) & (r > g + 6) & (r > 140)   # the thin pink-lilac edge of those strips
arr[..., 3] = np.where((purple | pink) & box, 0, arr[..., 3]); wood = Image.fromarray(arr)
save(fit(trim(clean_edge(wood))), 'door-wood.webp', 100)
save(fit(trim(clean_edge(lift('door-blue')))), 'door-blue.webp', 100)

# --- copper: the elongated hexagon, traced on the door's own box
cu = trim(clean_edge(lift('door-copper'))); W, Hh = cu.size
poly = [(0.20, 0.0), (0.80, 0.0), (1.0, 0.24), (0.88, 1.0), (0.12, 1.0), (0.0, 0.24)]
mask = Image.new('L', (W * 4, Hh * 4), 0); ImageDraw.Draw(mask).polygon([(x * W * 4, y * Hh * 4) for x, y in poly], fill=255)
mask = mask.resize((W, Hh), Image.LANCZOS).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
a = np.minimum(np.asarray(cu.getchannel('A')), np.asarray(mask)); cu.putalpha(Image.fromarray(a))
save(fit(cu), 'door-copper.webp', 100)

# --- the stage
st = Image.open(os.path.join(SRC, 'doors2-clean.jpg')).convert('RGB'); save(st, 'stage.webp', 150)
