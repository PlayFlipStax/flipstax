# FlipStax - build the stage and character art for the game (Run 3).
#
# The originals are big renders (2-3 MB each) and stay out of git; this writes small WebP copies the game loads:
#   data/stage/stage-close.webp  - a portrait 3:4 crop centred on the arch, 1080 px wide (the close shot)
#   data/stage/stage-wide.webp   - the whole stage, 1600 px wide (the wide shot)
#   data/stage/stage-dim.webp    - the close shot blurred, 540 px wide (the dim shot behind gameplay; the scrim is CSS)
#   data/host/<pose>.webp        - host poses (discoPoint, oops, laugh, ...)
#   data/cast/<name>-<pose>.webp - the cast (orange-idle, pink-presenting, ...)
# Characters come with a flat grey studio backdrop and no alpha, so each is lifted first with tools/cutout.swift
# (macOS Vision subject lifting); a PNG that already has alpha is used as is. Then: the grey fringe is taken out of the
# soft edge, the transparent margin is trimmed, and every figure is scaled to the same height with its feet on the
# bottom edge (one shared baseline - the CSS anchors the bottom). The host poses share one crop box, so switching
# poses never jumps. Budgets: stage < 250 KB, character < 90 KB, all new art < 2.5 MB.
# It also finds the blank marquee sign in each stage image and prints its box in percent of the image (lib/stage.js).
#   screenshots/qa/tools/venv/bin/python tools/build-art.py [source folder, default: the repo root]
import os, subprocess, sys, tempfile
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else ROOT
STAGE = {'stage-close': ('close', 1080, 250), 'stage-wide': ('wide', 1600, 250)}
HOST = ['discoPoint', 'oops', 'laugh', 'idle', 'blink', 'wave', 'cheer', 'think', 'shrug', 'presenting', 'point', 'gasp', 'wink']
CAST = ['orange', 'pink', 'purple']
FIG_H = 900              # every figure this tall (antenna tip to shoe sole)
CHAR_KB = 90
TOTAL_KB = 2500

def find(stem):
    for ext in ('.png', '.jpg', '.jpeg', '.webp'):
        for d in (SRC, os.path.join(ROOT, 'data/stage'), os.path.join(ROOT, 'data/host'), os.path.join(ROOT, 'data/cast')):
            p = os.path.join(d, stem + ext)
            if os.path.exists(p): return p
    return None

def save_webp(im, out, kb, lossless_alpha=False):
    for q in (86, 82, 78, 74, 70, 65, 60, 55, 50):
        im.save(out, 'WEBP', quality=q, method=6, alpha_quality=90 if not lossless_alpha else 100)
        if os.path.getsize(out) <= kb * 1024: return q
    raise SystemExit('%s: cannot get under %d KB' % (out, kb))

def sign_box(im, dark):
    """The blank marquee panel above the arch: the largest bright-cream (close) or dark (wide) blob in the top-middle,
    framed by bulbs. Returned in percent of the image: x, y, w, h."""
    W, H = im.size
    sx0, sx1, sy1 = int(W * 0.25), int(W * 0.75), int(H * 0.35)
    g = im.convert('RGB').crop((sx0, 0, sx1, sy1)).resize(((sx1 - sx0) // 4, sy1 // 4)).filter(ImageFilter.MedianFilter(5))
    w, h = g.size; px = g.load()
    def hit(x, y):
        r, gg, b = px[x, y]
        if dark: return max(r, gg, b) < 80
        return r > 200 and gg > 190 and b > 150 and abs(r - b) < 90
    # the widest run of hits per row, grouped into the tallest band of similar runs around the centre column
    rows = []
    for y in range(h):
        best = (0, 0, 0); x = 0
        while x < w:
            if hit(x, y):
                s = x
                while x < w and hit(x, y): x += 1
                if x - s > best[0] and s <= w // 2 <= x: best = (x - s, s, x)
            x += 1
        rows.append(best)
    band = [y for y, r in enumerate(rows) if r[0] > w * 0.25]
    if not band: return None
    # the longest run of consecutive rows
    runs, cur = [], [band[0]]
    for y in band[1:]:
        if y == cur[-1] + 1: cur.append(y)
        else: runs.append(cur); cur = [y]
    runs.append(cur); ys = max(runs, key=len)
    xs0 = sorted(rows[y][1] for y in ys)[len(ys) // 2]; xs1 = sorted(rows[y][2] for y in ys)[len(ys) // 2]
    f = lambda v, n, o: round(100 * (o + v * 4) / n, 1)
    return dict(x=f(xs0, W, sx0), y=f(ys[0], H, 0), w=round(100 * (xs1 - xs0) * 4 / W, 1), h=round(100 * (ys[-1] - ys[0] + 1) * 4 / H, 1))

def lift(path):
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA') and im.getchannel('A').getextrema()[0] < 250: return im.convert('RGBA'), None
    rgb = im.convert('RGB')
    corners = [rgb.getpixel(p) for p in ((5, 5), (rgb.width - 6, 5), (5, rgb.height - 6), (rgb.width - 6, rgb.height - 6))]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False).name
    tool = os.path.join(tempfile.gettempdir(), 'flipstax-cutout')
    if not os.path.exists(tool):
        subprocess.run(['swiftc', '-O', os.path.join(ROOT, 'tools/cutout.swift'), '-o', tool], check=True)
    subprocess.run([tool, path, tmp], check=True, stdout=subprocess.DEVNULL)
    out = Image.open(tmp).convert('RGBA'); os.unlink(tmp)
    # take the grey backdrop out of the soft edge (the hair, the antennae) so there is no light halo on the dark stage
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if 0 < a < 250:
                k = a / 255
                if k < 0.12: px[x, y] = (r, g, b, a); continue
                px[x, y] = tuple(max(0, min(255, round((c - (1 - k) * bc) / k))) for c, bc in zip((r, g, b), bg)) + (a,)
    return out, bg

def bbox(im): return im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()

def fit(im, box):
    im = im.crop(box)
    s = FIG_H / im.height
    return im.resize((max(1, round(im.width * s)), FIG_H), Image.LANCZOS)

def main():
    made, total = [], 0
    os.makedirs(os.path.join(ROOT, 'data/stage'), exist_ok=True); os.makedirs(os.path.join(ROOT, 'data/cast'), exist_ok=True)
    for stem, (shot, width, kb) in STAGE.items():
        p = find(stem)
        if not p: print('missing', stem); continue
        im = Image.open(p).convert('RGB')
        if shot == 'close' and im.width > im.height:    # the close shot is portrait: a 3:4 crop centred on the arch
            cw = round(im.height * 3 / 4); x0 = (im.width - cw) // 2
            im = im.crop((x0, 0, x0 + cw, im.height))
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        print('%-16s sign %s' % (stem, sign_box(im, dark=(shot == 'wide'))))
        out = os.path.join(ROOT, 'data/stage', stem + '.webp'); q = save_webp(im, out, kb); made.append((out, q))
        if shot == 'close':   # the dim shot: the close shot pre-blurred (about 6 CSS px on a phone), so no live blur filter runs
            dim = im.filter(ImageFilter.GaussianBlur(10)).resize((im.width // 2, im.height // 2), Image.LANCZOS)
            out = os.path.join(ROOT, 'data/stage', 'stage-dim.webp'); q = save_webp(dim, out, 60); made.append((out, q))
    # host poses: lift all, then one shared crop box
    lifted = {pose: lift(find(pose))[0] for pose in HOST if find(pose)}
    if lifted:
        sizes = {im.size for im in lifted.values()}
        if len(sizes) > 1: print('warning: host poses differ in canvas size', sizes)
        bs = [bbox(im) for im in lifted.values()]
        box = (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))
        for pose, im in lifted.items():
            out = os.path.join(ROOT, 'data/host', pose + '.webp'); q = save_webp(fit(im, box), out, CHAR_KB); made.append((out, q))
    for name in CAST:
        for pose in ['idle', 'presenting', 'laugh', 'cheer', 'wave']:
            p = find(name + '-' + pose)
            if not p: continue
            im = lift(p)[0]
            out = os.path.join(ROOT, 'data/cast', '%s-%s.webp' % (name, pose)); q = save_webp(fit(im, bbox(im)), out, CHAR_KB); made.append((out, q))
    for out, q in made:
        kb = os.path.getsize(out) / 1024; total += kb
        w, h = Image.open(out).size
        print('%-40s %5dx%-5d %6.1f KB  q%d' % (os.path.relpath(out, ROOT), w, h, kb, q))
    print('total %.0f KB (budget %d KB)' % (total, TOTAL_KB))
    if total > TOTAL_KB: raise SystemExit('over budget')

main()
