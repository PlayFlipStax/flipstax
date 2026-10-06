# Checks after the master content batch: pools, emoji, then deals new cards in
# both modes (one per new/grown category) and shoots them, plus the Badges tab.
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sweep'); os.makedirs(OUT, exist_ok=True)
v = View(390, 844); v.load(debug=True)
R = v.J(r"""(()=>{ const p = window.__debug.getContentPools(), out = {};
  const keyOf = c=> [c.a, c.b].map(x=> x.toLowerCase()).sort().join('|');
  const dk = new Set(p.cards.daily.map(keyOf)); out.inBothPools = p.cards.infinity.filter(c=> dk.has(keyOf(c))).map(keyOf);
  const all = p.cards.daily.concat(p.cards.infinity);
  out.genericEmoji = all.filter(c=> c.glyphA === '✨' || c.glyphB === '✨').map(c=> c.category + ': ' + c.a + ' vs ' + c.b);
  out.badPrompt = all.filter(c=> !c.prompt && !c.kind && !c.hint).length;
  out.labels = Object.fromEntries(['books','fitness','comedy','podcasts','creators','realitytv','celebrity'].map(k=> [k, all.filter(c=> c.category === k).length]));
  return out; })()""")
R['console errors at load'] = v.qa()['errors']
print(json.dumps(R, ensure_ascii=False))
PICKS = { 'modeInfinityBtn': ['Dave Chappelle', 'Mark Normand', 'Crime Junkie', 'Call Her Daddy', 'MrBeast', 'Logan Paul', 'Lakers', 'Patriots', 'Lasagna', 'Boneless Wings', 'Squats', 'CrossFit', 'Dune', 'Gone Girl', 'Brad Pitt', 'Fight Club', 'Magic Johnson'],
          'modeDailyBtn':    ['George Carlin', 'Bill Burr', 'The Daily', 'Dateline NBC', 'Kai Cenat', 'Livestreams', 'Red Sox', 'Real Madrid', 'Reuben', 'Pad Thai', 'HIIT', 'Overhead Press', 'The Shining', 'Agatha Christie', 'Johnny Depp', 'Barbie', 'Aaron Judge'] }
for W, H in ((390, 844), (320, 568)):
    for mode, names in PICKS.items():
        w = View(W, H); w.load(debug=True)
        w.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
        w.js("document.getElementById('%s').click(); 'x'" % mode); spin(1.5)
        cats_done = set()
        for n in names:
            if w.js("window.__debug.putNext(%s)" % json.dumps(n)) < 0: continue
            w.until("!document.getElementById('halfA').classList.contains('revealed')", 15)
            w.js("document.getElementById('halfA').click(); 'x'")
            try: w.until("document.getElementById('takeA').textContent.includes(%s) || document.getElementById('takeB').textContent.includes(%s)" % (json.dumps(n), json.dumps(n)), 15)
            except Exception: print('  could not deal', n); continue
            spin(0.5)
            chip = w.js("document.getElementById('chipA').textContent")
            info = w.J("(()=>{ const c = document.getElementById('chipA'), r = c.getBoundingClientRect(); return { clipped: r.left < 0 || r.right > innerWidth || c.scrollWidth > c.clientWidth + 1, a: document.getElementById('takeA').textContent, b: document.getElementById('takeB').textContent, hint: (document.querySelector('.hint')||{}).textContent }; })()")
            if chip in cats_done and W == 320: continue
            cats_done.add(chip)
            p = os.path.join(OUT, 'master-%d-%s-%s.png' % (W, mode[4:-3].lower(), n.replace(' ', '_')))
            w.snap(None, path=p)
            print(W, mode[4:-3], '|', chip, '|', info['a'], 'vs', info['b'], '|', info['hint'], '| chip clipped' if info['clipped'] else '')
        print('errors', w.qa()['errors'])
# Badges tab lists the new categories
b = View(390, 844); b.load(debug=True)
b.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
b.js("document.getElementById('collectionBtn').click(); 'x'"); spin(1.2)
b.js("[...document.querySelectorAll('.col-tab')].find(t=> t.dataset.tab==='badges').click(); 'x'"); spin(0.8)
print('badges listed:', b.J("[...document.querySelectorAll('.bd-name, .bd-title, .badge-row .name')].map(e=> e.textContent).slice(0, 60)"))
b.js("(()=>{ const rows = [...document.querySelectorAll('.bd-desc')]; const r = rows.find(e=> /Podcasts/.test(e.textContent)); if (r) r.scrollIntoView({block:'center'}); })(); 'x'"); spin(0.6)
b.snap(None, path=os.path.join(OUT, 'master-badges.png')); print('badge errors', b.qa()['errors'])
