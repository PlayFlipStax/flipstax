# FlipStax touch-episode test (J2): plays whole Daily episodes at REAL speed in an offscreen WebKit view (390x844) with
# tools/touch-episode-probe.js - phone-style taps (touchstart/pointerdown, touchend/pointerup, a click ~300 ms later
# on whatever is under the finger) and taps during every cinematic - and prints the probe's report.
# Needs the QA harness (screenshots/qa/tools/wkh.py and its PyObjC venv) on a Mac:
#   screenshots/qa/tools/venv/bin/python tools/touch-episode.py [episodes=1] [lite] [paces=fast,average,slow,relaxed-average]
# paces (Oct 22): how long the player takes on each VS card - fast 0.4-2.5 s (the default), average 1.5-3.5 s, slow 3-4.8 s, timeout
# (never taps: every card runs its 5 s out); 'relaxed-' puts on Relaxed pace (8 s a card). One episode per pace, side by side.
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, 'screenshots', 'qa', 'tools'))
from wkh import View, spin, LOCAL, ensure_server
n = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 1
lite = 'lite' in sys.argv
# (VS card: min, max ms; the rest of a player's pace goes into the probe's options: reading a Brain Beam, a mini game, the Word Warp)
PACES = { 'fast':     dict(vsMin=400,  vsMax=2500),
          'average':  dict(vsMin=1500, vsMax=3500, cine=False, ansMin=3000, ansMax=8000, mgMin=1500, mgMax=4000, wwMin=2000, wwMax=5000, luckyMin=1500, luckyMax=3000),
          'slow':     dict(vsMin=3000, vsMax=4800, cine=False, ansMin=8000, ansMax=11000, mgMin=2500, mgMax=6000, wwMin=4000, wwMax=8000, luckyMin=2500, luckyMax=5000),
          'timeout':  dict(vsMin=60000, vsMax=60000, cine=False, ansMin=3000, ansMax=8000, mgMin=1500, mgMax=4000, wwMin=2000, wwMax=5000, luckyMin=1500, luckyMax=3000) }
paces = ([a.split('=')[1] for a in sys.argv if a.startswith('paces=')] or [''])[0].split(',') if any(a.startswith('paces=') for a in sys.argv) else []
if paces: n = len(paces)
probe = open(os.path.join(HERE, 'touch-episode-probe.js')).read()
ensure_server()
views = []
for i in range(n):
    v = View(390, 844); url = LOCAL + 'flipstax.html?debug=1' + ('&lite=1' if lite else '')
    v.load(debug=False, http=url)
    v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); localStorage.removeItem('flipstax_run_v1'); localStorage.removeItem('flipstax_run_live_v1'); localStorage.removeItem('flipstax_coldopen_seen_v1'); " + ("localStorage.setItem('flipstax_relaxed_pace','1'); " if paces and paces[i].startswith('relaxed-') else "localStorage.removeItem('flipstax_relaxed_pace'); ") + "'x'")
    v.load(debug=False, http=url)
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(1.4)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(0.3)
    pace = paces[i] if paces else 'fast'
    opts = PACES[pace.replace('relaxed-', '')]
    v.js('window.__ttOpts = ' + json.dumps(opts) + '; ' + probe + "; 'x'")
    views.append(v)
t0 = time.time(); done = [False] * n
while not all(done) and time.time() - t0 < 2400:
    spin(1.0)
    for i, v in enumerate(views):
        if not done[i] and v.js('!!(window.__tt && window.__tt.report)'): done[i] = True
for i, v in enumerate(views):
    r = v.J('window.__tt && window.__tt.report')
    print('episode', i + 1, (paces[i] if paces else 'fast'), json.dumps(r, indent=1) if r else 'NO REPORT (timed out)')
    q = v.qa(); print('script errors', q['errors'][:5], q['rejections'][:3])
    open('/tmp/fr-%d.txt' % (i + 1), 'w').write('\n'.join(v.J('window.__frLines') or []))
