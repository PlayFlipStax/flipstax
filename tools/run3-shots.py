# FlipStax - screenshot every screen at phone widths (Run 3).
# Uses the TEST menu (?replay=1, localhost) in one window per width: the landing, the menu, then each jump.
# Writes screenshots/run3/<width>/NN-<screen>.png and prints any page errors.
#   screenshots/qa/tools/venv/bin/python tools/run3-shots.py [widths=360,390] [only=<substring>] [out=<dir>] [q=<extra url query>]
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots/qa/tools'))
from wkh import View, spin, LOCAL, ensure_server
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
arg = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
WIDTHS = [int(w) for w in arg.get('widths', '360,390').split(',')]
HEIGHT = { 360: 780, 390: 844, 412: 915 }
OUT = arg.get('out', os.path.join(ROOT, 'screenshots/run3'))
ONLY = arg.get('only')
Q = arg.get('q', '')
# (TEST menu label, seconds to wait, file name, mode). Mode 'infinity' switches the run first.
SCREENS = [
  ('Cold open', 1.2, 'coldopen-start', 'daily'),
  ('Cold open', 5.5, 'coldopen-host', 'daily'),
  ('Cold open', 9.0, 'coldopen-episode', 'daily'),
  ('Act 1 card', 1.6, 'act1-card', 'daily'),
  ('VS card', 2.2, 'vs-card', 'daily'),
  ('Brain Beam', 3.0, 'brain-beam', 'daily'),
  ('Riddle', 1.9, 'mystery-door', 'daily'),
  ('Riddle', 5.0, 'riddle', 'daily'),
  ('Crowd Scan', 5.5, 'crowd-scan', 'daily'),
  ('Cosmic Surprise', 2.6, 'cosmic-intro', 'daily'),
  ('Cosmic Surprise', 7.5, 'cosmic-prize', 'daily'),
  ('Commercial (off)', 2.8, 'commercial', 'daily'),
  ('Act 2 card', 1.6, 'act2-card', 'daily'),
  ('Portal Pick', 3.0, 'portal-pick', 'daily'),
  ('Act 3 card', 1.6, 'act3-card', 'daily'),
  ('Lucky Lights', 3.0, 'lucky-lights', 'daily'),
  ('Price Probe', 5.0, 'price-probe', 'daily'),
  ('Oddball Alert', 5.0, 'oddball-alert', 'daily'),
  ('Emoji Decode', 5.0, 'emoji-decode', 'daily'),
  ('Time Warp', 5.0, 'time-warp', 'daily'),
  ('Peak or Plunge', 5.5, 'peak-or-plunge', 'daily'),
  ('Snap Sort: easy', 5.5, 'snap-sort', 'daily'),
  ('Zap Words', 5.5, 'zap-words', 'daily'),
  ('Twin Flip', 5.5, 'twin-flip', 'daily'),
  ('Fact or Fib', 5.5, 'fact-or-fib', 'daily'),
  ('Saucer Shuffle', 5.5, 'saucer-shuffle', 'daily'),
  ('Grand finale (6 letters)', 1.6, 'finale-card', 'daily'),
  ('Grand finale (6 letters)', 5.5, 'word-warp', 'daily'),
  ('Orbit Drop', 2.5, 'orbit-drop', 'daily'),
  ('Results (sample)', 3.0, 'results', 'daily'),
  ('Orbit Drop (5 chips)', 2.5, 'inf-orbit-drop', 'infinity'),
  ('Vault', 2.5, 'inf-vault', 'infinity'),
  ('Results (251 pts)', 3.0, 'inf-results', 'infinity'),
  ('Riddle', 2.5, 'inf-riddle', 'infinity'),
  ('Brain Beam', 2.5, 'inf-brain-beam', 'infinity'),
  ('Cosmic: a key', 4.5, 'inf-cosmic-prize', 'infinity'),
]
ensure_server()
errors = []
for W in WIDTHS:
    d = os.path.join(OUT, str(W)); os.makedirs(d, exist_ok=True)
    v = View(W, HEIGHT.get(W, round(W * 2.165)))
    url = LOCAL + 'flipstax.html?replay=1' + Q
    v.load(debug=False, http=url)
    v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); localStorage.setItem('flipstax_howto_infinity_v3','1'); 'x'")
    v.load(debug=False, http=url)
    n = 0
    def snap(name):
        global n
        n += 1
        if ONLY and ONLY not in name: return
        v.snap(None, path=os.path.join(d, '%02d-%s.png' % (n, name)))
    spin(1.5); snap('landing')
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(2.2); snap('menu')
    mode = None
    for label, sec, name, m in SCREENS:
        if ONLY and ONLY not in name: n += 1; continue
        if m != mode:
            v.js("document.getElementById(%r).click(); 'x'" % ('modeInfinityBtn' if m == 'infinity' else 'modeDailyBtn')); spin(1.0); mode = m
        v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.2)
        ok = v.js("(()=>{ const b = [...document.querySelectorAll('.replay-list button')].find(b=> b.textContent === %r); if (!b) return 'nolabel'; b.click(); return 'ok'; })()" % label)
        if ok != 'ok': print('no jump', label); n += 1; continue
        spin(sec); snap(name)
    q = v.qa()
    for k in ('errors', 'rejections'):
        for e in q.get(k) or []: errors.append('%d %s: %s' % (W, k, e))
    print(W, 'done', n, 'shots ->', d)
print('page errors:', len(errors)); [print(' ', e) for e in errors[:20]]
