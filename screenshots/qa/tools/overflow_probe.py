import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
v = View(412, 915); v.load(debug=True)
v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.5)
for fn in ('showRunTrivia', 'showRunPowerUp'):
    v.js("document.getElementById('eventOverlay').classList.add('hidden'); window.__debug.%s(); window.__debug.holdEvent(); 'x'" % fn); spin(0.8)
    print(fn, v.J("""(()=>{ const W = innerWidth, out = []; document.querySelectorAll('body *').forEach(el=>{ const r = el.getBoundingClientRect(); if (r.width && r.right > W + 1) out.push((el.id ? '#' + el.id : el.tagName + '.' + String(el.className).split(' ')[0]) + ' right=' + Math.round(r.right) + ' w=' + Math.round(r.width) + ' pos=' + getComputedStyle(el).position); });
      return { scrollW: document.scrollingElement.scrollWidth, W, over: out.slice(0, 10) }; })()"""))
