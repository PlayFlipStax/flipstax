import os, sys, json, time
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
v = View(412, 915); v.load(debug=True)
v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.5)
hits = []
for fn in ('showRunTrivia', 'showRunPowerUp', 'showRunTrivia'):
    v.js("document.getElementById('eventOverlay').classList.add('hidden'); window.__debug.%s(); window.__debug.holdEvent(); (()=>{ const o = document.getElementById('eventOverlay'); o.classList.remove('ufo-pass','ufo-rtl'); void o.offsetWidth; o.classList.add('ufo-pass'); })(); 'x'" % fn)
    t0 = time.time()
    while time.time() - t0 < 3:
        r = v.J("(()=>{ const W = innerWidth, sw = document.scrollingElement.scrollWidth; if (sw <= W + 1) return null; const out = []; document.querySelectorAll('body *').forEach(el=>{ const r = el.getBoundingClientRect(); if (r.width && r.right > W + 1){ let clipped = false; for (let p = el.parentElement; p; p = p.parentElement){ if (getComputedStyle(p).overflowX !== 'visible'){ clipped = true; break; } } if (!clipped) out.push((el.id ? '#' + el.id : el.tagName + '.' + String(el.className).split(' ')[0]) + ' right=' + Math.round(r.right)); } }); return { sw, out: out.slice(0, 6) }; })()")
        if r: hits.append((fn, round(time.time() - t0, 2), r))
        spin(0.05)
print(len(hits), hits[:4])
