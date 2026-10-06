import os, sys, json, time
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
v = View(320, 568); v.load(debug=True)
v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
v.js("document.getElementById('modeInfinityBtn').click(); 'x'"); spin(1.5)
res = []
for i in range(25):
    r = v.J("(()=>{ const se = document.scrollingElement; se.scrollLeft = 200; const moved = se.scrollLeft; se.scrollLeft = 0; return { sw: se.scrollWidth, canScrollSideways: moved > 0, body: getComputedStyle(document.body).overflowX, html: getComputedStyle(document.documentElement).overflowX }; })()")
    res.append(r); spin(0.4)
print('can scroll sideways in', sum(1 for r in res if r['canScrollSideways']), 'of', len(res), 'samples; widest', max(r['sw'] for r in res), '| overflow-x body/html:', res[0]['body'], res[0]['html'])
