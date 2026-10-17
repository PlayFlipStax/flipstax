# FlipStax flow set (Run 3; the I6 set, now a script): whole Daily episodes, fast-forwarded (?debug=fast), played by
# tools/touch-episode-probe.js with phone-style taps at random 40-2500 ms (taps during cinematics too). Each episode
# must show the rundown's scenes in order with every VS block's count (a Cosmic Surprise is its own rundown step), no VS
# card twice and no script errors. Real-time minimums are checked by tools/touch-episode.py instead (time is scaled here).
# The set: 15 today, 15 today in lite mode, 10 on other days (at least 3 with a Cosmic Surprise).
#   screenshots/qa/tools/venv/bin/python tools/flow-episodes.py [normal=15] [lite=15] [other=10] [parallel=5]
import os, sys, json, time, random
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, 'screenshots', 'qa', 'tools'))
from wkh import View, spin, LOCAL, ensure_server
arg = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
N_NORMAL, N_LITE, N_OTHER, PAR = int(arg.get('normal', 15)), int(arg.get('lite', 15)), int(arg.get('other', 10)), int(arg.get('parallel', 5))
probe = open(os.path.join(HERE, 'touch-episode-probe.js')).read()
OPTS = "window.__ttOpts = { fast:true, vsMin:40, vsMax:2500 };"
ensure_server()
# Another day: the page's clock moved by whole days (before any script runs).
def shift(days):
    if not days: return ''
    return ("(function(){ const D = Date, off = %d * 864e5; function S(...a){ return a.length ? new D(...a) : new D(D.now() + off); }"
            " S.prototype = D.prototype; S.now = ()=> D.now() + off; S.UTC = D.UTC; S.parse = D.parse; window.Date = S; })();" % days)
def start(days, lite):
    v = View(390, 844, extra_js=shift(days))
    url = LOCAL + 'flipstax.html?debug=fast' + ('&lite=1' if lite else '')
    v.load(debug=False, http=url)
    v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); localStorage.removeItem('flipstax_run_v1'); localStorage.removeItem('flipstax_run_live_v1'); 'x'")
    v.load(debug=False, http=url)
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(0.2)
    return v
def close(v):
    try: v.wv.loadHTMLString_baseURL_('', None); v.win.close()
    except Exception: pass
def has_cosmic(days):
    v = start(days, False); spin(1.2)
    plan = v.J("window.__showPlan ? window.__showPlan().map(s=> s.t) : []")
    close(v)
    return 'cosmic' in plan
# pick the other days: at least 3 with a Cosmic Surprise
others, cos, d = [], 0, 1
random.seed(int(time.time()))
cands = random.sample(range(1, 120), 119)
for d in cands:
    if len(others) >= N_OTHER: break
    c = has_cosmic(d)
    need_cos = max(0, 3 - cos)
    if c or len(others) < N_OTHER - need_cos:
        others.append((d, c)); cos += c
jobs = [('today', 0, False)] * N_NORMAL + [('today lite', 0, True)] * N_LITE + [('day +%d%s' % (d, ' cosmic' if c else ''), d, False) for d, c in others]
results = []
t0 = time.time()
for i in range(0, len(jobs), PAR):
    batch = jobs[i:i + PAR]; views = []
    for name, days, lite in batch:
        v = start(days, lite); v.js(OPTS + probe + "; 'x'"); views.append(v)
    t1 = time.time(); done = [False] * len(views)
    while not all(done) and time.time() - t1 < 600:
        spin(1.0)
        for k, v in enumerate(views):
            if not done[k] and v.js('!!(window.__tt && window.__tt.report)'): done[k] = True
    for (name, days, lite), v, ok in zip(batch, views, done):
        r = v.J('window.__tt && window.__tt.report') if ok else None
        if not r: r = { 'ok': False, 'problems': ['did not reach the results in 10 minutes'], 'vsCards': '?', 'cosmic': '?' }
        results.append((name, r)); close(v)
        print('%-3d %-18s %s  vs %s  cosmic %s  taps %s  ghost clicks swallowed %s%s' % (len(results), name, 'PASS' if r['ok'] else 'FAIL', r.get('vsCards'), r.get('cosmic'), r.get('taps'), r.get('drops'),
              '' if r['ok'] else '\n      ' + '\n      '.join(r['problems'][:4])), flush=True)
passed = sum(1 for _, r in results if r['ok'])
print('%d of %d pass (%.0f min)' % (passed, len(results), (time.time() - t0) / 60))
sys.exit(0 if passed == len(results) else 1)
