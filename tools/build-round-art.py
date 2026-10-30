#!/usr/bin/env python3
# FlipStax - the Round Done art (overnight job 7). Converts any of these from incoming-assets/gemini/ that exist into
# data/scenes/round/<name>.webp (2% cropped off each edge, 780 px wide, under 150 KB):
#   round 1 scene-win-flip, round 2 scene-girl-green, round 3 scene-girl-purple, round 4 scene-girl-pink,
#   round 5 scene-girls-pose, round 6 scene-all-group, and the fallbacks scene-win-flip, scene-win, scene-group.
# The game tries each round's own file first and uses the fallbacks in rotation for any that are missing, so a new
# file with one of these names shows up as soon as this has been run (screenshots/qa/tools/venv/bin/python tools/build-round-art.py).
import io, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, DST = os.path.join(ROOT, 'incoming-assets', 'gemini'), os.path.join(ROOT, 'data', 'scenes', 'round')
NAMES = ['scene-win-flip', 'scene-girl-green', 'scene-girl-purple', 'scene-girl-pink', 'scene-girls-pose', 'scene-all-group', 'scene-win', 'scene-group']
os.makedirs(DST, exist_ok=True)
for n in NAMES:
    src = next((os.path.join(SRC, n + e) for e in ('.jpg', '.jpeg', '.png', '.webp') if os.path.exists(os.path.join(SRC, n + e))), None)
    if not src: print('missing', n); continue
    im = Image.open(src).convert('RGB'); w, h = im.size; dx, dy = round(w * 0.02), round(h * 0.02)
    im = im.crop((dx, dy, w - dx, h - dy))
    if im.size[0] > 780: im = im.resize((780, round(im.size[1] * 780 / im.size[0])), Image.LANCZOS)
    for q in range(84, 30, -4):
        b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= 150 * 1024: break
    open(os.path.join(DST, n + '.webp'), 'wb').write(b.getvalue()); print(n, im.size, b.tell() // 1024, 'KB')
