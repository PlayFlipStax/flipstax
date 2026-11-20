# FlipStax - the winning cinematic's black hole sprites (polish2 black hole look). Run with the QA venv (numpy + Pillow):
#   screenshots/qa/tools/venv/bin/python tools/build-blackhole.py
# Writes small transparent webp files into data/blackhole/ (512 x 512 unless noted). The page only moves them with transform and opacity
# (lib/juice.css WINNING CINEMATIC). Everything shares one geometry: the canvas centre is the hole's centre; the event horizon has radius
# R = 100 px of 512, so a sprite drawn at size S puts the horizon at S * 100 / 512.
#   ring.webp     the photon ring - a thin, very bright white-gold circle just outside the horizon, with a short soft glow
#   halo.webp     the lensed far side of the accretion disc - a glowing band bent over the top and under the bottom of the hole (thicker on top),
#                 brighter on the left (the side coming toward us), white-gold at the inner edge fading through orange and magenta to violet
#   band.webp     the near side of the disc, almost edge-on - a thin bright band crossing in front of the hole (its part above the centre and
#                 inside the horizon is cut away: that part is behind the hole)
#   disk.webp     a face-on swirl of hot matter (log-spiral streaks); the page squashes it (scaleY) and turns it slowly: the tilted disc sweeping in
#   streaks.webp  curved star streaks, each bent along a spiral toward the centre
import os, math
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'blackhole')
os.makedirs(OUT, exist_ok=True)
N = 512; C = N / 2; R = 100.0
yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
dx, dy = xx + 0.5 - C, yy + 0.5 - C
r = np.sqrt(dx * dx + dy * dy); th = np.arctan2(dy, dx)   # (th = -pi/2 at the top)

# colour ramp: t = 0 hot white-gold ... 1 violet
STOPS = [(0.00, (255, 250, 228)), (0.18, (255, 214, 120)), (0.38, (255, 150, 52)), (0.62, (236, 70, 150)), (0.85, (140, 60, 210)), (1.00, (70, 30, 140))]
def ramp(t):
    t = np.clip(t, 0, 1); out = np.zeros(t.shape + (3,), np.float32)
    for (a, ca), (b, cb) in zip(STOPS[:-1], STOPS[1:]):
        m = (t >= a) & (t <= b); k = ((t - a) / (b - a))[m][:, None]
        out[m] = np.array(ca, np.float32) * (1 - k) + np.array(cb, np.float32) * k
    return out
def save(name, rgb, a, size=N):
    img = np.dstack([np.clip(rgb, 0, 255), np.clip(a * 255, 0, 255)]).astype(np.uint8)
    im = Image.fromarray(img)
    if size != N: im = im.resize((size, size), Image.LANCZOS)
    p = os.path.join(OUT, name); im.save(p, 'WEBP', quality=82, method=6); print(name, os.path.getsize(p), 'bytes')
doppler = 0.62 + 0.38 * np.cos(th - math.pi)   # (brighter on the left)

# the photon ring
d = np.abs(r - (R + 3.0))
a = np.exp(-(d / 1.3) ** 2) + 0.35 * np.exp(-(np.maximum(r - (R + 3.0), 0) / 6.0) ** 2) * (r > R)
save('ring.webp', ramp(np.clip(d / 14, 0, 0.3)) * 1.0, np.clip(a, 0, 1) * (0.75 + 0.25 * doppler))

# the lensed halo: inner edge just outside the ring, outer edge thick over the top, thinner under the bottom, thin at the sides
top = np.clip(-np.sin(th), 0, 1); bot = np.clip(np.sin(th), 0, 1)
outer = R + 18 + 70 * top ** 1.4 + 42 * bot ** 1.6
t = np.clip((r - (R + 6)) / np.maximum(outer - (R + 6), 1), 0, 1.4)
a = np.where(r > R + 4, np.exp(-((t / 0.62) ** 2.2)), 0) * (0.35 + 0.65 * (0.4 + 0.6 * np.maximum(top, bot))) * doppler
a = a * np.clip((r - (R + 4)) / 4, 0, 1)
save('halo.webp', ramp(t * 0.95), np.clip(a * 1.45, 0, 1))

# the near band: a flattened annulus (the disc seen almost edge-on), its far half inside the horizon removed
ey = dy / 0.13
re = np.sqrt(dx * dx + ey * ey)
t = np.clip((re - (R + 10)) / 190, 0, 1)
a = np.where(re > R + 6, np.exp(-((t / 0.6) ** 2)), 0) * np.clip((re - (R + 6)) / 6, 0, 1)
a = a * (0.55 + 0.45 * np.clip(-dx / 180 + 0.5, 0, 1)) * np.exp(-(np.abs(dy) / 30) ** 2)
a = np.where((r < R + 2) & (dy < 0), 0, a)   # (behind the hole)
a = np.where((r < R + 2) & (dy >= 0), a * 1.0, a)
save('band.webp', ramp(t * 0.9), np.clip(a * 1.6, 0, 1))

# the face-on swirl (squashed and turned by the page): log-spiral streaks of hot matter, fading at the hole and at the rim
rng = np.random.default_rng(3)
phase = th - 0.018 * (r - R)   # (a trailing spiral)
tex = np.zeros_like(r)
for k in range(9):
    f = int(rng.integers(3, 9)); p0 = rng.uniform(0, 6.28); w = rng.uniform(0.35, 0.8)   # (whole-number arms: no seam where the angle wraps)
    tex += w * (0.5 + 0.5 * np.cos(f * phase + p0)) ** 6
tex = tex / tex.max()
t = np.clip((r - (R + 12)) / 140, 0, 1)
a = np.where(r > R + 8, 1, 0) * np.clip((r - (R + 8)) / 30, 0, 1) * np.exp(-((t / 0.7) ** 2)) * (0.25 + 0.75 * tex) * (0.6 + 0.4 * doppler)
save('disk.webp', ramp(0.15 + 0.85 * t), np.clip(a * 0.9, 0, 1))

# curved star streaks (a 512 field, the page scales it in): short arcs that bend along spirals toward the centre
img = np.zeros((N, N, 4), np.float32)
for k in range(110):
    ang = rng.uniform(0, 6.283); rad = rng.uniform(150, 360); L = rng.uniform(16, 46); bright = rng.uniform(0.45, 1)
    col = np.array([(255, 255, 255), (200, 225, 255), (255, 220, 190), (230, 200, 255)][k % 4], np.float32)
    steps = int(L * 1.6)
    for i in range(steps):
        s = i / steps
        rr = rad - L * s * 0.8; aa = ang + 0.006 * L * s * (1 + 160 / rad)   # (in and around: a spiral)
        x, y = C + rr * math.cos(aa), C + rr * math.sin(aa)
        ix, iy = int(x), int(y)
        if 1 <= ix < N - 1 and 1 <= iy < N - 1:
            al = bright * (0.15 + 0.85 * s)
            for ox, oy, f in ((0, 0, 1.0), (1, 0, 0.35), (-1, 0, 0.35), (0, 1, 0.35), (0, -1, 0.35)):
                px = img[iy + oy, ix + ox]; na = max(px[3], al * f); px[:3] = col; px[3] = na
save('streaks.webp', img[..., :3], img[..., 3])
