import os, sys, json, time
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
FIND = r"""(()=>{ const W = innerWidth, sw = document.scrollingElement.scrollWidth; if (sw <= W + 1) return null; const out = [];
  document.querySelectorAll('body *').forEach(el=>{ const r = el.getBoundingClientRect(); if (!r.width || r.right <= W + 1) return;
    for (let p = el.parentElement; p; p = p.parentElement){ if (getComputedStyle(p).overflowX !== 'visible') return; }
    out.push((el.id ? '#' + el.id : el.tagName + '.' + String(el.className).split(' ')[0]) + ' right=' + Math.round(r.right) + ' w=' + Math.round(r.width)); });
  return { sw, W, out: out.slice(0, 8) }; })()"""
found = []
for W, H in ((320, 568), (430, 932)):
    v = View(W, H); v.load(debug=True)
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
    v.js("document.getElementById('modeInfinityBtn').click(); 'x'"); spin(1.5)
    for i in range(6):
        for fn, extra in (('showInfTrivia', ''), ('showInfPowerUp', "setTimeout(()=> [...document.querySelectorAll('.event-tile')].find(t=> /Coin/.test(t.textContent)).click(), 200);")):
            v.js("document.getElementById('eventOverlay').classList.add('hidden'); window.__debug.%s(); window.__debug.holdEvent(); %s 'x'" % (fn, extra))
            t0 = time.time()
            while time.time() - t0 < 3.5:
                r = v.J(FIND)
                if r: found.append((W, fn, round(time.time() - t0, 1), r)); break
                spin(0.08)
print(len(found)); [print(f) for f in found[:6]]
