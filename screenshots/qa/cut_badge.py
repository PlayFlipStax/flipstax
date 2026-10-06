import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
# Usage: python cut_badge.py <source image> [output png]
SRC = sys.argv[1] if len(sys.argv) > 1 else '/Users/rickymartin/FlipStax/images/FINAL FLIPSTAX LOGO.jpeg'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/Users/rickymartin/FlipStax/images/flipstax-logo-final.png'
img = np.array(Image.open(SRC).convert('RGB')).astype(np.float32); H, W, _ = img.shape
k = W / 722.0   # tuned on the 722px source; distances scale with size
# 1. the badge is where the picture has detail - the background is smooth
lum = img @ np.array([0.299, 0.587, 0.114], np.float32)
grad = np.hypot(nd.sobel(lum, 0), nd.sobel(lum, 1))
tex = nd.gaussian_filter(grad, 2 * k) > 14
tex = nd.binary_closing(tex, iterations=max(1, round(4 * k)))
lab, n = nd.label(tex); sizes = nd.sum(tex, lab, range(1, n + 1))
fg = nd.binary_fill_holes(lab == (1 + int(np.argmax(sizes))))
# 2. the smooth background (gradient + glow), filled in behind the badge from
#    its surroundings (normalised blur over background pixels only), twice
for it in range(2):
    m = (~nd.binary_dilation(fg, iterations=max(1, round(5 * k)))).astype(np.float32)
    num = np.stack([nd.gaussian_filter(img[..., c] * m, 22 * k) for c in range(3)], -1)
    den = nd.gaussian_filter(m, 22 * k)[..., None]
    B = num / np.maximum(den, 1e-3)
    diff = np.abs(img - B).max(-1)
    cand = nd.binary_opening(diff > 26, iterations=1)
    lab, n = nd.label(cand); sizes = nd.sum(cand, lab, range(1, n + 1))
    main = nd.binary_fill_holes(nd.binary_closing(lab == (1 + int(np.argmax(sizes))), iterations=3))
    fg = main
# 3. confetti near the badge is part of the art
near = nd.binary_dilation(main, iterations=max(1, round(45 * k)))
extra = cand & ~main & near & np.isin(lab, 1 + np.where(sizes >= 10 * k * k)[0])
keep = main | nd.binary_fill_holes(extra)
# The rim is a circle: fit it to the badge's bottom edge (where nothing sticks
# out) and keep everything inside it, so the background removal can't bite
# into the gold rim where the old background glow matched its colour.
ys, xs = np.nonzero(keep)
x0, x1 = xs.min(), xs.max(); cxs = [x for x in range(int(x0 + (x1 - x0) * 0.25), int(x0 + (x1 - x0) * 0.75)) if keep[:, x].any()]
pts = np.array([(x, np.nonzero(keep[:, x])[0].max()) for x in cxs], np.float64)
for _ in range(4):   # least-squares circle, dropping points that sit in a bite
    A = np.c_[2 * pts[:, 0], 2 * pts[:, 1], np.ones(len(pts))]; bb = (pts ** 2).sum(1)
    (ccx, ccy, c), *_ = np.linalg.lstsq(A, bb, rcond=None); rad = np.sqrt(c + ccx ** 2 + ccy ** 2)
    res = np.hypot(pts[:, 0] - ccx, pts[:, 1] - ccy) - rad
    pts = pts[res > -max(2.0, 3 * np.std(res))] if len(pts) > 20 else pts
yy, xx = np.mgrid[0:keep.shape[0], 0:keep.shape[1]]
disk = np.hypot(xx - ccx, yy - ccy) <= rad - 1.5
print('rim circle: centre (%.0f, %.0f) radius %.1f; pixels restored %d' % (ccx, ccy, rad, int((disk & ~keep).sum())))
keep = keep | disk
# soft alpha at the edge from how far each pixel is from the background
band = nd.binary_dilation(keep, iterations=max(1, round(2 * k))) & ~nd.binary_erosion(keep, iterations=max(1, round(2 * k)))
a_soft = np.clip((diff - 8) / 50, 0, 1)
alpha = np.where(band, np.minimum(a_soft, nd.binary_dilation(keep, iterations=1)), keep.astype(np.float32))
# un-mix the background colour from edge pixels
safe = np.maximum(alpha, 0.08)[..., None]
col = np.where(band[..., None], np.clip((img - B * (1 - safe)) / safe, 0, 255), img)
out = Image.fromarray(np.dstack([col, alpha * 255]).astype(np.uint8))
out = out.crop(out.getbbox())
out.save(OUT, optimize=True)
print('cutout', out.size, 'aspect for the CSS/JS sizing (width / height):', out.size[0], '/', out.size[1], '| confetti blobs kept', int(nd.label(extra)[1]))
for name, c in [('sky', (90, 190, 255)), ('dark', (30, 20, 50)), ('gold', (255, 190, 30))]:
    bg = Image.new('RGBA', out.size, c + (255,)); bg.alpha_composite(out); bg.convert('RGB').save(OUT.replace('.png', '-check-on-%s.png' % name))
