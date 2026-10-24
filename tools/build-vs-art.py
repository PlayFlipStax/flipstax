# FlipStax - the VS console art (Run 6). Reads the Gemini JPEGs in incoming-assets/gemini/ (matched by name, any
# extension; the big originals stay out of git) and writes small WebP copies to data/vs/:
#   console-clean.webp, console-lit.webp - the VS console, 780 px wide (a 390-wide phone at 2x), under 300 KB each
#   badge.webp                            - the gold VS cog, cut out of its grey studio backdrop (the stray
#                                           'TEST - votes not saved' text baked at the bottom is cropped away first),
#                                           trimmed, its edge eroded ~1 px against JPEG fringing
#   crackle-<color>-<0..3>.webp           - each crackle ring (green, cyan, pink): black made transparent by luminance,
#                                           turned 90 degrees so the ring is landscape, then 4 versions - as is, mirrored
#                                           left-right, top-bottom and both (the entrance flicker swaps between them)
# It also measures each crackle ring's bright line (its box in fractions of the picture) and prints it, so lib/vs-console.js
# can line the ring up with a card window. Budget: all of data/vs under 1.5 MB.
#   screenshots/qa/tools/venv/bin/python tools/build-vs-art.py
import os, sys, glob, subprocess, tempfile, json
import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'incoming-assets/gemini')
OUT = os.path.join(ROOT, 'data/vs')
CONSOLE_W, CONSOLE_KB = 780, 300
BADGE_W, BADGE_KB = 260, 60
CRACKLE_W, CRACKLE_KB = 720, 55
TOTAL_KB = 1500

def find(stem):
    for p in sorted(glob.glob(os.path.join(SRC, stem + '.*'))):
        if p.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')): return p
    return None

def save_webp(im, out, kb, qs=(88, 84, 80, 76, 72, 68, 64, 60, 55, 50, 45, 40)):
    for q in qs:
        im.save(out, 'WEBP', quality=q, method=6, alpha_quality=min(80, q))
        if os.path.getsize(out) <= kb * 1024: return q
    raise SystemExit('%s: cannot get under %d KB' % (out, kb))

def consoles(made):
    for stem, name in (('vs-console-clean', 'console-clean'), ('vs-console-lit', 'console-lit')):
        p = find(stem)
        if not p: print('missing', stem); continue
        im = Image.open(p).convert('RGB')
        im = im.resize((CONSOLE_W, round(im.height * CONSOLE_W / im.width)), Image.LANCZOS)
        out = os.path.join(OUT, name + '.webp'); made.append((out, save_webp(im, out, CONSOLE_KB)))

def badge(made):
    p = find('vs-badge')
    if not p: print('missing vs-badge'); return
    im = Image.open(p).convert('RGB')
    # the stray caption sits in the bottom 6% - crop it off before the cut-out
    im = im.crop((0, 0, im.width, int(im.height * 0.9)))
    tmp_in = tempfile.NamedTemporaryFile(suffix='.png', delete=False).name; im.save(tmp_in)
    tmp_out = tempfile.NamedTemporaryFile(suffix='.png', delete=False).name
    tool = os.path.join(tempfile.gettempdir(), 'flipstax-cutout')
    if not os.path.exists(tool): subprocess.run(['swiftc', '-O', os.path.join(ROOT, 'tools/cutout.swift'), '-o', tool], check=True)
    subprocess.run([tool, tmp_in, tmp_out], check=True, stdout=subprocess.DEVNULL)
    cut = Image.open(tmp_out).convert('RGBA'); os.unlink(tmp_in); os.unlink(tmp_out)
    a = cut.getchannel('A')
    box = a.point(lambda v: 255 if v > 24 else 0).getbbox()
    cut = cut.crop(box)
    cut = cut.resize((BADGE_W, round(cut.height * BADGE_W / cut.width)), Image.LANCZOS)
    # erode the edge ~1 px (JPEG fringing: a light grey halo) and keep the rim colour from the solid gold just inside
    arr = np.asarray(cut).astype('float32'); al = arr[..., 3] / 255
    al2 = np.asarray(Image.fromarray((al * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.5))).astype('float32') / 255
    solid = (al2 > 0.97).astype('float32')
    rgb = arr[..., :3]
    num = np.stack([np.asarray(Image.fromarray((rgb[..., c] * solid).astype('uint8')).filter(ImageFilter.GaussianBlur(3))).astype('float32') for c in range(3)], -1)
    den = np.asarray(Image.fromarray((solid * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(3))).astype('float32')[..., None] / 255
    fill = num / np.maximum(den, 1e-3)
    rgb = np.where(((al2 < 0.97)[..., None]) & (den > 0.02), fill, rgb)
    out_im = Image.fromarray(np.dstack([rgb.clip(0, 255), al2 * 255]).astype('uint8')).convert('RGBA')
    out = os.path.join(OUT, 'badge.webp'); made.append((out, save_webp(out_im, out, BADGE_KB)))
    # halo check: semi-transparent rim pixels that are light grey (the old backdrop)
    a = np.asarray(out_im)[..., 3]; c = np.asarray(out_im)[..., :3].astype(int)
    rim = (a > 10) & (a < 245); grey = rim & (c.min(-1) > 170) & ((c.max(-1) - c.min(-1)) < 22)
    print('badge %dx%d, rim pixels %d, light-grey rim pixels %d' % (out_im.width, out_im.height, rim.sum(), grey.sum()))

def ring_box(alpha):
    """The bright line: the box of the pixels at least 70% bright, ignoring the thin tendrils (rows / columns where the
    bright line runs have many such pixels)."""
    b = alpha > 0.7
    rows = np.where(b.sum(1) > b.shape[1] * 0.25)[0]; cols = np.where(b.sum(0) > b.shape[0] * 0.25)[0]
    return rows.min(), rows.max(), cols.min(), cols.max()

def crackles(made):
    boxes = {}
    for color in ('green', 'cyan', 'pink'):
        p = find('crackle-' + color)
        if not p: print('missing crackle-' + color); continue
        im = Image.open(p).convert('RGB').rotate(90, expand=True)   # landscape
        im = im.resize((CRACKLE_W, round(im.height * CRACKLE_W / im.width)), Image.LANCZOS)
        arr = np.asarray(im).astype('float32') / 255
        a = arr.max(-1)
        a = np.clip((a - 0.06) / 0.94, 0, 1)                       # black (with JPEG noise) to fully clear
        rgb = np.where(a[..., None] > 0.004, arr / np.maximum(arr.max(-1, keepdims=True), 1e-3), 0)   # colour at full strength; alpha carries the brightness
        rgba = Image.fromarray(np.dstack([rgb * 255, a * 255]).clip(0, 255).astype('uint8')).convert('RGBA')
        t, b_, l, r = ring_box(a)
        boxes[color] = { 'x': round(l / rgba.width, 4), 'y': round(t / rgba.height, 4), 'w': round((r - l) / rgba.width, 4), 'h': round((b_ - t) / rgba.height, 4), 'aspect': round(rgba.width / rgba.height, 4) }
        for k, v in enumerate((rgba, ImageOps.mirror(rgba), ImageOps.flip(rgba), ImageOps.flip(ImageOps.mirror(rgba)))):
            out = os.path.join(OUT, 'crackle-%s-%d.webp' % (color, k)); made.append((out, save_webp(v, out, CRACKLE_KB)))
    print('crackle ring boxes (fractions of the picture):', json.dumps(boxes))
    return boxes

def main():
    os.makedirs(OUT, exist_ok=True)
    have = {s: find(s) for s in ('vs-console-clean', 'vs-console-lit', 'vs-badge', 'crackle-green', 'crackle-cyan', 'crackle-pink')}
    for s, p in have.items(): print('%-17s %s' % (s, os.path.relpath(p, ROOT) if p else 'MISSING'))
    if not have['vs-console-clean'] or not have['vs-console-lit']: raise SystemExit('vs-console-clean / vs-console-lit missing: stop')
    made = []
    consoles(made); badge(made); crackles(made)
    total = 0
    for out, q in made:
        kb = os.path.getsize(out) / 1024; total += kb; w, h = Image.open(out).size
        print('%-34s %5dx%-5d %6.1f KB  q%d' % (os.path.relpath(out, ROOT), w, h, kb, q))
    print('total %.0f KB (budget %d KB)' % (total, TOTAL_KB))
    if total > TOTAL_KB: raise SystemExit('over budget')

main()
