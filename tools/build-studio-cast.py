# FlipStax - the cast for the drawn studio (polish pass). The round pictures (data/scenes/round/*.webp) have the alien girls painted onto the
# old gold stage; this takes the lifted figures (tools/cutout.swift run on each picture -> <dir>/<name>.png, RGBA) and writes them trimmed,
# cleaned (stray specks dropped, a hair off the edge so no gold rim shows) to data/cast/studio/<name>.webp for the studio round cards.
#   screenshots/qa/tools/venv/bin/python tools/build-studio-cast.py <dir with the lifted PNGs>
import os, sys
import numpy as np
from PIL import Image, ImageFilter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]; OUT = os.path.join(ROOT, 'data/cast/studio'); os.makedirs(OUT, exist_ok=True)
NAMES = { 'scene-girl-green':'green-jump', 'scene-girl-purple':'purple-jump', 'scene-girl-pink':'pink-jump', 'scene-girls-pose':'girls-pose', 'scene-all-group':'all-group', 'dance-poster':'girls-dance' }
def keep_big(a):   # drop specks: components (on a quarter-size mask) under 1.5% of the figure
    q = np.array(Image.fromarray(a).resize((a.shape[1] // 4, a.shape[0] // 4))) > 60
    lab = np.zeros(q.shape, int); n = 0; sizes = {}
    for y, x in zip(*np.nonzero(q)):
        if lab[y, x]: continue
        n += 1; st = [(y, x)]; lab[y, x] = n; c = 0
        while st:
            cy, cx = st.pop(); c += 1
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                yy, xx = cy + dy, cx + dx
                if 0 <= yy < q.shape[0] and 0 <= xx < q.shape[1] and q[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; st.append((yy, xx))
        sizes[n] = c
    tot = sum(sizes.values()); ok = np.isin(lab, [k for k, v in sizes.items() if v > tot * 0.015])
    m = Image.fromarray((ok * 255).astype('uint8')).resize((a.shape[1], a.shape[0])).filter(ImageFilter.MaxFilter(9))
    return np.minimum(a, np.array(m))
for src, name in NAMES.items():
    im = Image.open(os.path.join(SRC, src + '.png')).convert('RGBA')
    a = keep_big(np.array(im.getchannel('A')))
    al = Image.fromarray(a).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    im.putalpha(al); im = im.crop(im.getbbox())
    if name == 'girls-dance':   # a streak of the old stage's neon caught above the raised hand
        px = np.array(im); px[:35, 434:, 3] = 0; px[:46, 456:, 3] = 0; im = Image.fromarray(px); im = im.crop(im.getbbox())
    p = os.path.join(OUT, name + '.webp'); im.save(p, 'WEBP', quality=84, method=6)
    print(name, im.size, os.path.getsize(p))
