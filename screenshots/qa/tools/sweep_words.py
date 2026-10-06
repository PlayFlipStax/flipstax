import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
CLOCK = r"""(function(){ const RD = Date; let shift = 0; class FD extends RD { constructor(...a){ if (a.length) super(...a); else super(RD.now() + shift); } static now(){ return RD.now() + shift; } }
  window.Date = FD; window.__setLocal = (y, mo, d, h, mi)=>{ shift = new RD(y, mo - 1, d, h, mi).getTime() - RD.now(); }; })();"""
v = View(390, 844, CLOCK); v.load(debug=True)
words = []
for k in range(0, 400):
    v.js("__setLocal(2026, 10, %d, 12, 0); 'x'" % (4 + k)); words.append(v.js("window.__debug.todayWord().word"))
uniq = set(words)
back2back = [i for i in range(1, len(words)) if words[i] == words[i - 1]]
gaps = {}
last = {}
for i, w in enumerate(words):
    if w in last: gaps.setdefault('min', 999); gaps['min'] = min(gaps['min'], i - last[w])
    last[w] = i
bad = [w for w in uniq if not (len(w) == 6 and w.isalpha() and w.isupper())]
close = []
lastseen = {}
for i, w in enumerate(words):
    if w in lastseen and i - lastseen[w] < 45: close.append((i, w, i - lastseen[w]))
    lastseen[w] = i
import datetime
d0 = datetime.date(2026, 10, 4)
print('repeats within 45 days:', [(str(d0 + datetime.timedelta(days=i)), w, g) for i, w, g in close])
print(json.dumps({ 'days checked from Oct 4': len(words), 'distinct words': len(uniq), 'same word two days running': len(back2back), 'shortest gap before a word repeats (days)': gaps.get('min'), 'words not 6 capital letters': bad }))
R = v.J(r"""(()=>{ const out = []; return out; })()""")
print('errors', v.qa()['errors'])
