# FlipStax - VS console review shots (Run 6). 390x760 through the TEST menu (?replay=1): the VS card as dealt (mid entrance
# and settled), the reveal after a tap (early and at its peak), and the same in lite mode and with reduced motion.
# Writes review-shots/run6/<tag>/NN-<name>.png (not committed).
#   screenshots/qa/tools/venv/bin/python tools/run6-shots.py <tag> [W=390] [H=760]
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'screenshots/qa/tools'))
from wkh import View, spin, LOCAL, ensure_server
tag = sys.argv[1] if len(sys.argv) > 1 else 'now'
arg = dict(a.split('=', 1) for a in sys.argv[2:] if '=' in a)
W, H = int(arg.get('W', 390)), int(arg.get('H', 760))
OUT = os.path.join(ROOT, 'review-shots/run6', tag); os.makedirs(OUT, exist_ok=True)
ensure_server()
def session(q, extra_js=''):
    v = View(W, H, extra_js=extra_js); url = LOCAL + 'flipstax.html?replay=1' + q
    v.load(debug=False, http=url)
    v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); 'x'"); v.load(debug=False, http=url)
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.5)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.0)
    v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.2)
    v.js("[...document.querySelectorAll('.replay-list button')].find(b=> b.textContent === 'VS card').click(); 'x'")
    v.until("document.getElementById('showCard').classList.contains('hidden') && document.getElementById('takeA').textContent.length > 0 && document.documentElement.classList.contains('mode-daily') && !document.querySelector('#board .half.picked')", 20, 0.02)
    return v
RM = "window.matchMedia = (q)=> ({ matches: /reduce/.test(q), media: q, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });"
n = 0
for label, q, extra in (('full', '', ''), ('lite', '&lite=1', ''), ('reduced', '', RM)):
    v = session(q, extra)
    spin(0.18); n += 1; v.snap(None, path=os.path.join(OUT, '%02d-%s-entrance.png' % (n, label)))
    spin(0.9); n += 1; v.snap(None, path=os.path.join(OUT, '%02d-%s-card.png' % (n, label)))
    v.js("document.getElementById('halfA').click(); 'x'")
    spin(0.15); n += 1; v.snap(None, path=os.path.join(OUT, '%02d-%s-tap.png' % (n, label)))
    spin(0.45); n += 1; v.snap(None, path=os.path.join(OUT, '%02d-%s-reveal.png' % (n, label)))
    spin(1.1); n += 1; v.snap(None, path=os.path.join(OUT, '%02d-%s-next.png' % (n, label)))
    errs = v.qa()['errors']
    print(label, 'errors', errs[:3])
print('shots in', OUT)
