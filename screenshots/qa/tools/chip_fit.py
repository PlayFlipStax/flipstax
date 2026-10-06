# Which category chips (with/without the bonus star) run into the +5s / Pause pills, per width
import os, sys, json, re
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
s = open('/Users/rickymartin/FlipStax/flipstax.html').read(); i = s.index('const CAT_META = {'); j = s.index('\n  };', i)
LAB = []
for m in re.finditer(r"(\w+):\s*\{ label:'([^']+)', badge:'([^']+)' \}", s[i:j]):
    badge = json.loads('"' + m.group(3) + '"'); LAB.append((m.group(1), badge.split(' ')[0] + ' ' + m.group(2)))
for W, H in ((320, 568), (360, 800), (375, 667), (390, 844)):
    for mode in ('modeInfinityBtn', 'modeDailyBtn'):
        v = View(W, H); v.load(debug=True)
        v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
        v.js("document.getElementById('%s').click(); 'x'" % mode); spin(1.6)
        r = v.J(r"""((labs)=>{ const c = document.getElementById('chipA'), save = c.textContent;
          const L = document.getElementById('slowdownBtn').getBoundingClientRect(), R = document.getElementById('pauseBtn').getBoundingClientRect();
          const out = { gap: Math.round(R.left - L.right), hits: [] };
          for (const [k, t] of labs) for (const star of ['', '⭐ ']){ c.textContent = star + t; const r = c.getBoundingClientRect();
            if (r.left < L.right + 2 || r.right > R.left - 2) out.hits.push((star ? 'star ' : '') + k + ' (' + Math.round(r.width) + 'px)'); }
          c.textContent = save; return out; })(%s)""" % json.dumps(LAB))
        print(W, mode[4:-3], 'room', r['gap'], 'px | collides:', ', '.join(r['hits']) or 'none')
