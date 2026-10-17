# FlipStax frame-time check on a Mac (Run 3): tools/frametime-probe.js in the WebKit harness (screenshots/qa/tools
# wkh.py, a 390x844 offscreen WKWebView at the Mac's own pixel ratio). It plays one fast-forwarded ?replay=1&debug=fast
# episode and prints per-screen p50/p95/max frame ms and dropped frames - the same table as tools/frametime.ps1.
# The difference: no CPU throttle (WebKit has none), so the absolute numbers are a fast desktop's; use it to compare
# two builds (FLIPSTAX_QA_URL points the harness at another server, e.g. a checkout of the older commit) rather than as
# a phone measurement. tools/frametime.ps1 (headless Chrome, CPU x4) stays the phone-like check on the work PC.
#   screenshots/qa/tools/venv/bin/python tools/frametime-webkit.py [lite] [runs=1]
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots/qa/tools'))
from wkh import View, spin, LOCAL, ensure_server
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lite = 'lite' in sys.argv[1:]
runs = int(([a.split('=')[1] for a in sys.argv[1:] if a.startswith('runs=')] or ['1'])[0])
PROBE = open(os.path.join(ROOT, 'tools/frametime-probe.js')).read()
ensure_server()
merged = {}
for r in range(runs):
    v = View(390, 844)
    url = LOCAL + 'flipstax.html?replay=1&debug=fast' + ('&lite=1' if lite else '')
    v.load(debug=False, http=url)
    v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); 'x'"); v.load(debug=False, http=url)
    v.js("document.querySelector('.replay-btn').click(); [...document.querySelectorAll('.replay-list button')].find(x=>x.textContent==='Restart Daily').click(); 'x'")
    spin(0.5); v.js(PROBE + "; 'x'")
    try: v.until('window.__ft && window.__ft.report', 300, 1.0)
    except TimeoutError: v.js('window.__ft.finish(); 1')
    rep = v.J('window.__ft.report')
    for k, s in rep['scenes'].items():
        m = merged.setdefault(k, { 'frames':0, 'p50':0, 'p95':0, 'max':0, 'dropped':0, 'n':0 })
        m['frames'] += s['frames']; m['dropped'] += s['dropped']; m['n'] += 1
        m['p50'] = max(m['p50'], s['p50']); m['p95'] = max(m['p95'], s['p95']); m['max'] = max(m['max'], s['max'])
    t = rep['total']
    print('run %d: ALL frames %d p50 %.1f p95 %.1f max %.1f dropped %d' % (r + 1, t['frames'], t['p50'], t['p95'], t['max'], t['dropped']))
print('FlipStax frame times (WebKit, no CPU throttle) - %s mode, %s, worst of %d run(s)' % ('lite' if lite else 'full', LOCAL, runs))
print('%-26s %7s %7s %7s %8s %8s' % ('screen', 'frames', 'p50', 'p95', 'max', 'dropped'))
for k, s in sorted(merged.items(), key=lambda kv: -kv[1]['p95']):
    print('%-26s %7d %7.1f %7.1f %8.1f %8d' % (k, s['frames'], s['p50'], s['p95'], s['max'], s['dropped']))
over = [k for k, s in merged.items() if s['p95'] > 20]
print('p95 over 20 ms:', ', '.join(over) if over else 'none')
