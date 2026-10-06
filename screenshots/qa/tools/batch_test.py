import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
v = View(390, 844); v.load(debug=True)
NEW = ['Conor McGregor','Jon Jones','UFC','Katy Perry','Foo Fighters','Jay-Z','Morgan Wallen','An Old Favorite on Repeat','The Bachelor','Shark Tank','Top Chef','Colleen Hoover','The Notebook','Kim Kardashian','Red Carpet Fashion','Cardi B','Dolly Parton','Naked and Afraid','Vanderpump Rules']
R = v.J("""(()=>{ const p = window.__debug.getContentPools(), out = {};
  out.sizes = { daily: p.cards.daily.length, infinity: p.cards.infinity.length };
  const keyOf = c=> [c.a, c.b].map(x=> x.toLowerCase()).sort().join('|');
  const dk = new Set(p.cards.daily.map(keyOf)); out.inBothPools = p.cards.infinity.filter(c=> dk.has(keyOf(c))).map(keyOf);
  const all = p.cards.daily.concat(p.cards.infinity);
  const cats = {}; all.forEach(c=> cats[c.category] = (cats[c.category] || 0) + 1); out.categories = cats;
  const fresh = all.filter(c=> ['realitytv','celebrity'].includes(c.category) || /McGregor|Khabib|Jon Jones|Adesanya|Makhachev|Rousey|Nunes|St-Pierre|Diaz|UFC|Submission|Cage|Strikers|Katy Perry|Lady Gaga|Doja Cat|Foo Fighters|Pink Floyd|Metallica|Nas|50 Cent|Travis Scott|Cardi B|Luke Combs|Carrie|Willie|Reba|Zach Bryan|Old Favorite|Sing-Along|Colleen|Notebook|Harry Met|Bridgerton|10 Things/.test(c.a + ' ' + c.b));
  out.newCards = fresh.length;
  out.genericEmoji = fresh.filter(c=> c.glyphA === '\\u2728' || c.glyphB === '\\u2728').map(c=> c.a + ' vs ' + c.b);
  out.newByPool = { daily: p.cards.daily.filter(c=> fresh.includes(c)).length, infinity: p.cards.infinity.filter(c=> fresh.includes(c)).length };
  out.reality = fresh.filter(c=> c.category === 'realitytv').map(c=> c.glyphA + ' ' + c.a + ' vs ' + c.glyphB + ' ' + c.b).slice(0, 4);
  return out; })()""")
R['console errors at load'] = v.qa()['errors']
print('content checked')

# screenshots: deal some new cards in each mode
shots = []
for mode, names in (('modeInfinityBtn', ['The Bachelor', 'Celebrity Gossip Podcasts', 'Jon Jones']), ('modeDailyBtn', ['Katy Perry', 'Shark Tank', 'Kim Kardashian'])):
    w = View(390, 844); w.load(debug=True)
    w.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
    w.js("document.getElementById('%s').click(); 'x'" % mode); spin(1.5)
    for n in names:
        idx = w.js("window.__debug.putNext(%s)" % json.dumps(n))
        w.until("!document.getElementById('halfA').classList.contains('revealed')", 15)
        w.js("document.getElementById('halfA').click(); 'x'")
        w.until("document.getElementById('takeA') && (document.getElementById('takeA').textContent.includes(%s) || document.getElementById('takeB').textContent.includes(%s))" % (json.dumps(n), json.dumps(n)), 15)
        spin(0.5)
        p = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sweep', 'batch-%s.png' % n.replace(' ', '_')); w.snap(None, path=p); shots.append(p)
        print(n, '| chip:', w.js("document.getElementById('chipA').textContent"), '| sides:', w.js("document.getElementById('takeA').textContent + ' vs ' + document.getElementById('takeB').textContent"), '| hint:', w.js("(document.querySelector('.hint')||{}).textContent"))
    print('errors', w.qa()['errors'])
