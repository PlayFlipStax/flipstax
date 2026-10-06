# Link-preview card (1200x630) and app icons from the splash's look: its sky
# (blue -> pink haze -> Infinity gold), the colourful ray burst and the badge.
# Writes mockups to screenshots/qa/brand-mock/ (nothing in images/ changes).
import os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
REPO = '/Users/rickymartin/FlipStax'
OUT = os.path.join(REPO, 'screenshots', 'qa', 'brand-mock'); os.makedirs(OUT, exist_ok=True)
BADGE = Image.open(os.path.join(REPO, 'images', 'flipstax-logo-final.png')).convert('RGBA')
SKY = [(0, (46, 141, 255)), (0.22, (69, 180, 255)), (0.40, (143, 216, 255)), (0.58, (255, 211, 236)), (0.72, (255, 194, 122)), (0.86, (255, 196, 0)), (1.0, (255, 176, 0))]
RAYS = [(255, 60, 172), (25, 224, 255), (255, 196, 0), (155, 77, 255), (255, 95, 184), (45, 212, 196), (255, 214, 110), (184, 107, 255)]
def sky(W, H):
    y = np.linspace(0, 1, H)[:, None]; img = np.zeros((H, W, 3), np.float32)
    for (p0, c0), (p1, c1) in zip(SKY, SKY[1:]):
        m = (y >= p0) & (y <= p1); t = np.clip((y - p0) / max(p1 - p0, 1e-6), 0, 1)
        for ch in range(3): img[..., ch] = np.where(m, c0[ch] + (c1[ch] - c0[ch]) * t, img[..., ch])
    return Image.fromarray(img.astype(np.uint8)).convert('RGBA')
def rays(W, H, cx, cy, R, seed=7, beams=26, streaks=110):
    random.seed(seed); S = 2
    L = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(L, 'RGBA')
    reach = math.hypot(W, H)
    # smooth beams: an angular profile x a radial fade, computed as a field
    q = 2; yy, xx = np.mgrid[0:H // q, 0:W // q].astype(np.float32); dx, dy = xx * q - cx, yy * q - cy
    rr = np.hypot(dx, dy); th = np.arctan2(dy, dx); acc = np.zeros((H // q, W // q, 3), np.float32); aa = np.zeros((H // q, W // q), np.float32)
    for i in range(beams):
        a0 = i / beams * 2 * math.pi + random.uniform(-0.07, 0.07); hw = math.radians(random.uniform(1.2, 3.6)); col = np.array(RAYS[i % len(RAYS)], np.float32)
        r_end = R * random.uniform(2.0, 3.4)
        dth = np.angle(np.exp(1j * (th - a0)))
        prof = np.clip(1 - (np.abs(dth) / hw) ** 2, 0, 1) ** 1.4
        fall = np.clip(1 - (rr - R * 0.5) / (r_end - R * 0.5), 0, 1) ** 1.5 * (rr > R * 0.45)
        k = prof * fall * 0.95; acc += k[..., None] * col; aa += k
    beam = Image.fromarray(np.dstack([np.clip(acc / np.maximum(aa, 1e-4)[..., None], 0, 255), np.clip(aa, 0, 1) * 235]).astype(np.uint8)).resize((W * S, H * S), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2 * S))
    L.alpha_composite(beam)
    for i in range(streaks):   # thin streaks with white cores on some
        a = random.uniform(0, 2 * math.pi); r1 = R * random.uniform(0.85, 1.15); ln = R * random.uniform(0.4, 1.8); w = random.uniform(1.2, 4.2); col = random.choice(RAYS)
        segs = 10
        for k in range(segs):
            t1, t2 = k / segs, (k + 1) / segs
            p1 = (cx + math.cos(a) * (r1 + ln * t1), cy + math.sin(a) * (r1 + ln * t1)); p2 = (cx + math.cos(a) * (r1 + ln * t2), cy + math.sin(a) * (r1 + ln * t2))
            d.line([(p1[0] * S, p1[1] * S), (p2[0] * S, p2[1] * S)], fill=col + (int(240 * (1 - t1) ** 1.5),), width=max(1, int(w * S * (1 - t1 * 0.6))))
            if random.random() < 0.0 + (0.4 if k < segs // 2 else 0):
                d.line([(p1[0] * S, p1[1] * S), (p2[0] * S, p2[1] * S)], fill=(255, 255, 255, int(200 * (1 - t1 * 1.6))), width=max(1, int(w * S * 0.35)))
    L = L.resize((W, H), Image.LANCZOS)
    glow = L.filter(ImageFilter.GaussianBlur(6))
    out = Image.new('RGBA', (W, H)); out.alpha_composite(glow); out.alpha_composite(L)
    return out
def halo(W, H, cx, cy, R):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); rr = np.hypot(xx - cx, yy - cy)
    a = np.clip(1 - (rr - R * 0.6) / (R * 0.9), 0, 1) ** 2 * 210
    return Image.fromarray(np.dstack([np.full_like(a, 255), np.full_like(a, 244), np.full_like(a, 200), a]).astype(np.uint8))
def scene(W, H, badge_h, cy_frac=0.5, seed=7):
    img = sky(W, H); bw = int(BADGE.width * badge_h / BADGE.height); b = BADGE.resize((bw, badge_h), Image.LANCZOS)
    cx, cy = W / 2, H * cy_frac; R = min(bw, badge_h) * 0.48
    img.alpha_composite(rays(W, H, cx, cy, R, seed)); img.alpha_composite(halo(W, H, cx, cy, R))
    img.alpha_composite(b, (int(cx - bw / 2), int(cy - badge_h / 2)))
    return img
# 1. link preview card
og = scene(1200, 630, 520, 0.47)
og.convert('RGB').save(os.path.join(OUT, 'og-preview.png'), optimize=True)
# 2. home-screen icon (iOS rounds the corners itself) and the 192px icon
icon = scene(720, 720, 640, 0.5, seed=11).resize((180, 180), Image.LANCZOS)
icon.convert('RGB').save(os.path.join(OUT, 'apple-touch-icon.png'))
scene(768, 768, 680, 0.5, seed=11).resize((192, 192), Image.LANCZOS).convert('RGB').save(os.path.join(OUT, 'favicon-192.png'))
# 3. tab icon, two options: (A) the badge, (B) the card-stack mark from the results screen
scene(256, 256, 236, 0.5, seed=11).resize((32, 32), Image.LANCZOS).convert('RGB').save(os.path.join(OUT, 'favicon-32-badge.png'))
def card_stack(px):
    S = 8; W = px * S; im = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * 0.22), fill=(43, 16, 92, 255))
    for ang, col in ((-24, (62, 194, 194)), (-4, (255, 92, 138)), (16, (255, 184, 51))):
        c = Image.new('RGBA', (W, W), (0, 0, 0, 0)); cd = ImageDraw.Draw(c)
        cw, ch = W * 0.4, W * 0.56; x0, y0 = W / 2 - cw / 2, W * 0.16
        cd.rounded_rectangle([x0, y0, x0 + cw, y0 + ch], radius=int(W * 0.07), fill=col + (255,), outline=(255, 255, 255, 255), width=int(W * 0.035))
        if col == (255, 184, 51):
            try: f = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Black.ttf', int(W * 0.32))
            except Exception: f = ImageFont.load_default()
            cd.text((W / 2, W / 2 + W * 0.03), 'F', font=f, fill=(90, 26, 0, 255), anchor='mm')
        im.alpha_composite(c.rotate(-ang, resample=Image.BICUBIC, center=(W / 2, W * 0.95)))
    return im.resize((px, px), Image.LANCZOS)
card_stack(32).save(os.path.join(OUT, 'favicon-32-cardstack.png'))
card_stack(256).save(os.path.join(OUT, 'cardstack-256.png'))
# preview sheet: the card as it shows in a text, icons on a phone home screen, tab icons
sheet = Image.new('RGB', (1500, 760), (242, 242, 247)); d = ImageDraw.Draw(sheet)
sheet.paste(og.convert('RGB').resize((900, 473)), (30, 60)); d.text((30, 20), 'Link preview (what shows when the link is shared)', fill=(0, 0, 0))
d.rounded_rectangle([30, 533, 930, 600], radius=12, fill=(229, 229, 234)); d.text((48, 548), 'FlipStax - Flip, Vote, Jumble & Solve', fill=(0, 0, 0)); d.text((48, 570), 'playflipstax.com', fill=(110, 110, 115))
d.text((980, 20), 'Home-screen icon', fill=(0, 0, 0))
ic = icon.convert('RGB').resize((180, 180)); m = Image.new('L', (180, 180), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, 179, 179], radius=40, fill=255)
sheet.paste(ic, (980, 60), m); d.text((1030, 250), 'FlipStax', fill=(0, 0, 0))
d.text((980, 320), 'Browser-tab icon, shown big then actual size', fill=(0, 0, 0))
for k, (nm, f) in enumerate((('A: badge', 'favicon-32-badge.png'), ('B: card stack', 'favicon-32-cardstack.png'))):
    im = Image.open(os.path.join(OUT, f)).convert('RGBA'); x = 980 + k * 240
    sheet.paste(im.resize((128, 128), Image.NEAREST).convert('RGB'), (x, 350)); sheet.paste(im.convert('RGB'), (x + 140, 446)); d.text((x, 490), nm, fill=(0, 0, 0))
sheet.save(os.path.join(OUT, 'brand-mock-sheet.png'))
print('ok', os.listdir(OUT))
