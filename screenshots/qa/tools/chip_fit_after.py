# After the fix: per width, every category (with/without star) - top chip either clear of the pills or hidden; bottom chip always shown
import os, sys, json, re
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
s = open('/Users/rickymartin/FlipStax/flipstax.html').read(); i = s.index('const CAT_META = {'); j = s.index('\n  };', i)
cats = re.findall(r"(\w+):\s*\{ label:", s[i:j])
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sweep')
for W, H in ((320, 568), (360, 800), (375, 667), (390, 844), (430, 932)):
    for mode in ('modeInfinityBtn', 'modeDailyBtn'):
        v = View(W, H); v.load(debug=True)
        v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
        v.js("document.getElementById('%s').click(); 'x'" % mode); spin(1.6)
        bad, hidden = [], []
        for n in range(26):
            v.until("!document.getElementById('halfA').classList.contains('revealed')", 15); spin(0.25)
            r = v.J(r"""(()=>{ const c = document.getElementById('chipA'), b = document.getElementById('chipB'), r = c.getBoundingClientRect();
              const hit = ['slowdownBtn','pauseBtn'].some(id=>{ const p = document.getElementById(id).getBoundingClientRect(); return p.width > 0 && p.left < r.right && p.right > r.left && p.top < r.bottom && p.bottom > r.top; });
              return { t: c.textContent, hidden: getComputedStyle(c).visibility === 'hidden', hit, bottomShown: getComputedStyle(b).visibility !== 'hidden' && b.textContent === c.textContent }; })()""")
            if (r['hit'] and not r['hidden']) or not r['bottomShown']: bad.append(r)
            if r['hidden']: hidden.append(r['t'])
            if n == 25: break
            v.js("document.getElementById('halfA').click(); 'x'")
            for ov, act in (('eventOverlay', "(()=>{ const t = [...document.querySelectorAll('.event-tile')].find(t=> t.onclick); if (t) t.click(); })()"), ('infAwardOverlay', "(()=>{ const b = document.querySelector('#infAwardOverlay .daily-btn'); if (b) b.click(); })()")):
                spin(0.1)
                if not v.js("document.getElementById('%s').classList.contains('hidden')" % ov): v.js(act + "; 'x'"); spin(1.4)
        print(W, mode[4:-3], '| overlapping & visible:', bad[:3], '| hidden top chips:', sorted(set(hidden)))
        if W == 320 and mode == 'modeInfinityBtn':
            for name in ('MrBeast', 'Squats'):
                if v.js("window.__debug.putNext(%s)" % json.dumps(name)) >= 0:
                    v.js("document.getElementById('halfA').click(); 'x'"); v.until("document.getElementById('takeA').textContent.includes(%s) || document.getElementById('takeB').textContent.includes(%s)" % (json.dumps(name), json.dumps(name)), 15); spin(0.5)
                    v.snap(None, path=os.path.join(OUT, 'chipfix-320-%s.png' % name))
        print('errors', v.qa()['errors'])
