# Read-only live check after the content push: no votes are cast.
import os, sys, json, time
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
LIVE = 'https://flipstax-one.vercel.app/flipstax.html'
v = View(390, 844); v.load(debug=False, http=LIVE + '?v=%d&debug=fast' % int(time.time())); spin(1.5)
R = v.J(r"""(()=>{ const p = window.__debug.getContentPools(); const c = {}; p.cards.daily.concat(p.cards.infinity).forEach(x=> c[x.category] = (c[x.category]||0) + 1);
  return { daily: p.cards.daily.length, infinity: p.cards.infinity.length, byCat: c, chipFix: [...document.querySelectorAll('style')].some(s=> s.textContent.includes('.cat-chip.squeezed')) }; })()""")
R['errors'] = v.qa()['errors']; R['fetchFails'] = v.qa()['fetchFails']
print(json.dumps(R, ensure_ascii=False))
