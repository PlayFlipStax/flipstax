# FlipStax: builds the lit variant of the Saucer Shuffle stage (data/scenes/saucer-shuffle-stage-lit.webp) from the normal one:
# brighter and more saturated, with a soft bloom round the light dots, the wall panels and the floor lights.
#   screenshots/qa/tools/venv/bin/python tools/make-stage-lit.py
import os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = Image.open(os.path.join(root, 'data/scenes/saucer-shuffle-stage.webp')).convert('RGB')
lit = ImageEnhance.Color(src).enhance(1.35)
lit = ImageEnhance.Brightness(lit).enhance(1.22)
lit = ImageEnhance.Contrast(lit).enhance(1.06)
a = np.asarray(lit).astype(np.float32) / 255.0
lum = a.max(axis=2)
mask = np.clip((lum - 0.55) / 0.35, 0, 1)[..., None]           # the light dots, neon edges and the floor strip
bright = Image.fromarray((a * mask * 255).astype(np.uint8))
bloom = np.zeros_like(a)
for r, w in ((6, 0.55), (18, 0.45), (40, 0.35)):                  # a soft bloom at three sizes
    bloom += np.asarray(bright.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255.0 * w
out = 1 - (1 - a) * (1 - np.clip(bloom, 0, 1))                    # screen blend
out = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
out.save(os.path.join(root, 'data/scenes/saucer-shuffle-stage-lit.webp'), 'WEBP', quality=82, method=6)
print('ok', out.size)
