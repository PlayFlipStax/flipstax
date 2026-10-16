# FlipStax touch-episode test (J2): plays whole Daily episodes at REAL speed in an offscreen WebKit view (390x844) with
# tools/touch-episode-probe.js - phone-style taps (touchstart/pointerdown, touchend/pointerup, a click ~300 ms later
# on whatever is under the finger) and taps during every cinematic - and prints the probe's report.
# Needs the QA harness (screenshots/qa/tools/wkh.py and its PyObjC venv) on a Mac:
#   screenshots/qa/tools/venv/bin/python tools/touch-episode.py [episodes=1] [lite]
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, 'screenshots', 'qa', 'tools'))
from wkh import View, spin, LOCAL, ensure_server
n = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 1
lite = 'lite' in sys.argv
probe = open(os.path.join(HERE, 'touch-episode-probe.js')).read()
ensure_server()
views = []
for i in range(n):
    v = View(390, 844); url = LOCAL + 'flipstax.html?debug=1' + ('&lite=1' if lite else '')
    v.load(debug=False, http=url)
    v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); localStorage.removeItem('flipstax_run_v1'); localStorage.removeItem('flipstax_run_live_v1'); localStorage.removeItem('flipstax_coldopen_seen_v1'); 'x'")
    v.load(debug=False, http=url)
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(1.4)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(0.3)
    v.js(probe + "; 'x'")
    views.append(v)
t0 = time.time(); done = [False] * n
while not all(done) and time.time() - t0 < 900:
    spin(1.0)
    for i, v in enumerate(views):
        if not done[i] and v.js('!!(window.__tt && window.__tt.report)'): done[i] = True
for i, v in enumerate(views):
    r = v.J('window.__tt && window.__tt.report')
    print('episode', i + 1, json.dumps(r, indent=1) if r else 'NO REPORT (timed out)')
    q = v.qa(); print('script errors', q['errors'][:5], q['rejections'][:3])
    open('/tmp/fr-%d.txt' % (i + 1), 'w').write('\n'.join(v.J('window.__frLines') or []))
