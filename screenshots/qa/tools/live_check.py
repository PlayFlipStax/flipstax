# Read-only live check: no votes are cast.
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
LIVE = 'https://flipstax-one.vercel.app/flipstax.html'
CLOCK = r"""(function(){ const RD = Date; let shift = 0; class FD extends RD { constructor(...a){ if (a.length) super(...a); else super(RD.now() + shift); } static now(){ return RD.now() + shift; } }
  window.Date = FD; window.__setLocal = (y, mo, d, h, mi)=>{ shift = new RD(y, mo - 1, d, h, mi).getTime() - RD.now(); }; })();"""
R = {}
v = View(390, 844); v.load(debug=False, http=LIVE + '?v=check'); spin(1.5)
R['preview tags'] = v.J("[...document.querySelectorAll('meta[property=\"og:image\"], meta[name=\"twitter:image\"]')].map(m=> m.content.split('/').pop())")
v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
v.js("document.getElementById('modeInfinityBtn').click(); 'x'"); spin(1.5)
R['invisible results link takes taps (must be false)'] = v.js("(()=>{ const a = document.querySelector('#readoutOverlay [data-contact-footer] a'); const r = a.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!hit && (hit === a || a.contains(hit)); })()")
R['errors / failed requests'] = [v.qa()['errors'], v.qa()['fetchFails']]
w = View(390, 844, CLOCK); w.load(debug=False, http=LIVE + '?v=words&debug=fast')
R['words Dec 26 - Jan 3 (live)'] = w.J("(()=>{ const out = []; for (let k = 0; k < 9; k++){ const t = new Date(2026, 11, 26 + k, 12, 0); window.__setLocal(t.getFullYear(), t.getMonth() + 1, t.getDate(), 12, 0); out.push(window.__debug.todayWord().word); } return out; })()")
w.js("__setLocal(2026, 10, 4, 12, 0); 'x'"); R['today (Oct 4) word unchanged'] = w.js("window.__debug.todayWord().word")
print(json.dumps(R, indent=1))
