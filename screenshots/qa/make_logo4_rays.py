# FlipStax Logo 4 + colourful light rays bursting from behind it - drawn in code.
import numpy as np, random, math, sys
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
random.seed(int(sys.argv[1]) if len(sys.argv) > 1 else 11)
SRC = '/Users/rickymartin/FlipStax/images/FlipStax Logo 4.jpeg'
OUT = '/private/tmp/claude-501/-Users-rickymartin-FlipStax/a92aa854-9652-4638-b931-8805a76933cd/scratchpad/rays/'
S = 2                                    # output scale vs the source
W, H = 722 * S, 1024 * S

# ---------- 1. cut the logo off its white page ----------
src = np.array(Image.open(SRC).convert('RGB')).astype(np.float32)
white = (src.min(-1) > 222) & ((src.max(-1) - src.min(-1)) < 30)
lab, _ = nd.label(white)
border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])); border = border[border > 0]
bg = np.isin(lab, border)
bg = nd.binary_opening(bg, iterations=1)
fg = ~bg
fg = nd.binary_fill_holes(fg)
# keep only the badge (drop specks), then a soft 1px edge
lb, n = nd.label(fg); sizes = nd.sum(fg, lb, range(1, n + 1)); fg = lb == (1 + int(np.argmax(sizes)))
# little coloured squares near the badge are part of the logo: re-add blobs that touch it closely
near = nd.binary_dilation(fg, iterations=14)
others = (~bg) & ~fg & near; fg = fg | others
band = nd.binary_dilation(fg, iterations=2) & ~nd.binary_erosion(fg, iterations=2)
alpha = fg.astype(np.float32)
# edge pixels: un-mix the white page (colour-to-alpha) so no white fringe
a_edge = np.clip((255 - src.min(-1)) / 255 * 1.35, 0, 1)
alpha = np.where(band, np.minimum(np.maximum(alpha * 0.0 + a_edge, 0), 1) * (nd.binary_dilation(fg, iterations=1)), alpha)
col = src.copy()
safe = np.maximum(alpha, 0.05)[..., None]
col = np.where(band[..., None], np.clip((src - 255 * (1 - safe)) / safe, 0, 255), src)
logo = Image.fromarray(np.dstack([col, alpha * 255]).astype(np.uint8), 'RGBA')
bbox = logo.getbbox(); logo = logo.crop(bbox)
logo = logo.resize((logo.width * S, logo.height * S), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
lx, ly = (W - logo.width) // 2, int(H * 0.47 - logo.height / 2)
cx, cy = lx + logo.width / 2, ly + logo.height * 0.5
R = min(logo.width, logo.height) * 0.47           # the badge's radius, roughly
logo.save(OUT + 'logo4-cutout.png')

PAL = [(255, 60, 172), (25, 224, 255), (255, 196, 0), (155, 77, 255), (255, 60, 172), (45, 212, 196), (255, 214, 110), (190, 110, 255)]

# ---------- 2. broad soft beams (polar field, quarter res, then upscaled) ----------
q = 4; w4, h4 = W // q, H // q
yy, xx = np.mgrid[0:h4, 0:w4].astype(np.float32)
dx, dy = xx * q - cx, yy * q - cy
r = np.hypot(dx, dy); th = np.arctan2(dy, dx)
acc = np.zeros((h4, w4, 3), np.float32); aa = np.zeros((h4, w4), np.float32)
n_beams = 26
for i in range(n_beams):
    ang = (i / n_beams) * 2 * math.pi + random.uniform(-0.07, 0.07)
    hw = math.radians(random.uniform(1.2, 3.2))
    reach = random.uniform(0.45, 0.8) * math.hypot(W, H) * 0.6
    d = np.angle(np.exp(1j * (th - ang)))
    prof = np.clip(1 - (np.abs(d) / hw) ** 2, 0, 1) ** 1.5
    fall = np.clip(1 - (r - R * 0.7) / reach, 0, 1) ** 1.6 * (r > R * 0.55)
    inten = prof * fall * random.uniform(0.85, 1.0)
    c = np.array(PAL[i % len(PAL)], np.float32)
    acc += inten[..., None] * c; aa += inten
beam_a = np.clip(aa * 1.4, 0, 1); beam_rgb = acc / np.maximum(aa, 1e-4)[..., None]
beams = Image.fromarray(np.dstack([np.clip(beam_rgb, 0, 255), beam_a * 255]).astype(np.uint8), 'RGBA').resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.5))

# ---------- 3. sharp light streaks (speed lines), drawn 2x then downsampled ----------
SS = 2
streak = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); dr = ImageDraw.Draw(streak, 'RGBA')
def seg_poly(a, r1, r2, w1, w2):
    ux, uy = math.cos(a), math.sin(a); px, py = -uy, ux
    p = lambda rr, ww, s: ((cx + ux * rr + px * ww * s) * SS, (cy + uy * rr + py * ww * s) * SS)
    return [p(r1, w1, 1), p(r2, w2, 1), p(r2, w2, -1), p(r1, w1, -1)]
for i in range(210):
    a = random.uniform(0, 2 * math.pi)
    r1 = R * random.uniform(0.9, 1.12); length = random.uniform(0.12, 0.55) * math.hypot(W, H) * 0.45
    wmax = random.uniform(1.2, 5.5) * S
    c = PAL[random.randrange(len(PAL))]
    dashed = random.random() < 0.35
    segs = 14
    for k in range(segs):
        if dashed and k % 2: continue
        t1, t2 = k / segs, (k + 1) / segs
        al = int(255 * (1 - t1) ** 1.6)
        dr.polygon(seg_poly(a, r1 + length * t1, r1 + length * t2, wmax * (1 - t1 * 0.7), wmax * (1 - t2 * 0.7)), fill=c + (al,))
    if random.random() < 0.5:   # a white-hot core on some
        for k in range(segs // 2):
            t1, t2 = k / segs, (k + 1) / segs
            dr.polygon(seg_poly(a, r1 + length * t1, r1 + length * t2, wmax * 0.35, wmax * 0.3), fill=(255, 255, 255, int(220 * (1 - t1 * 1.6))))
streak = streak.resize((W, H), Image.LANCZOS)
glow = streak.filter(ImageFilter.GaussianBlur(7))

# ---------- 4. halo behind the badge ----------
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); rr = np.hypot(xx - cx, yy - cy)
h = np.clip(1 - (rr - R * 0.8) / (R * 0.75), 0, 1) ** 2 * (rr > R * 0.5)
halo = Image.fromarray(np.dstack([np.full_like(h, 255), np.full_like(h, 236), np.full_like(h, 170), h * 200]).astype(np.uint8), 'RGBA')

vy, vx = np.mgrid[0:H, 0:W].astype(np.float32); vr = np.hypot(vx - cx, vy - cy)
vig = np.clip(1 - (vr - R * 1.35) / (R * 0.95), 0, 1) ** 1.4
def faded(layer):
    a = np.array(layer).astype(np.float32); a[..., 3] *= vig; return Image.fromarray(a.astype(np.uint8))
beams, glow, streak = faded(beams), faded(glow), faded(streak)
def compose(base):
    img = base.copy()
    for layer in (halo, beams, glow, streak): img.alpha_composite(layer)
    img.alpha_composite(logo, (lx, ly))
    return img
transparent = compose(Image.new('RGBA', (W, H), (0, 0, 0, 0)))
transparent.save(OUT + 'flipstax-logo4-rays.png', optimize=True)
compose(Image.new('RGBA', (W, H), (255, 255, 255, 255))).convert('RGB').save(OUT + 'flipstax-logo4-rays-white.jpg', quality=93)
print('logo', logo.size, 'canvas', (W, H), 'R', round(R))
