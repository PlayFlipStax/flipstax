# FlipStax Fact or Fib overflow check (overnight job 3): shows EVERY statement in data/fact-or-fib.js, with its reveal line, in the game's bubble at
# 360 and 390 px wide (the real game's fitting code, through the TEST/debug hook window.__ffShow), and FAILS when the statement, the reveal line or
# the bubble is clipped by an ancestor or cut off by the screen.
#   screenshots/qa/tools/venv/bin/python tools/fact-or-fib-check.py [360x640] [390x844]
import os, sys, json, time
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, 'screenshots', 'qa', 'tools'))
from wkh import View, spin, LOCAL, ensure_server
ensure_server()
SIZES = [tuple(int(n) for n in a.split('x')) for a in sys.argv[1:] if 'x' in a] or [(360, 640), (390, 844)]
CHECK = """(function(){
  const bank = window.FLIPSTAX_FACT_OR_FIB, out = [], ov = document.querySelector('.mg-overlay'), VH = innerHeight, VW = innerWidth;
  const clipped = (el)=>{ const r = el.getBoundingClientRect(); const why = [];
    if (r.top < -1 || r.bottom > VH + 1 || r.left < -1 || r.right > VW + 1) why.push('off-screen');
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement){ const cs = getComputedStyle(n); if (cs.overflow === 'visible' && cs.overflowY === 'visible') continue; const a = n.getBoundingClientRect();
      if (r.top < a.top - 1 || r.bottom > a.bottom + 1) { why.push('clipped by ' + (n.id ? '#' + n.id : '.' + String(n.className).split(' ')[0]) + ' (' + Math.round(r.top - a.top) + '/' + Math.round(a.bottom - r.bottom) + ')'); break; } }
    if (el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflow !== 'visible') why.push('own overflow');
    return why; };
  bank.forEach((q, i)=>{
    const h = window.__ffShow(q, true), probs = [];
    const bt = clipped(h.bubble); if (bt.length) probs.push('bubble ' + bt.join(','));
    ['text', 'fact'].forEach(k=>{ const e = h[k]; const c = clipped(e); if (c.length) probs.push(k + ' ' + c.join(',')); if (e.scrollWidth > e.clientWidth + 1) probs.push(k + ' wider than its box'); });
    // the bubble must also sit clear of the buttons below and the sign above
    const b = h.bubble.getBoundingClientRect(), btn = document.querySelector('.ff-btns'); if (btn){ const r = btn.getBoundingClientRect(); if (b.bottom + 14 > r.top + 2) probs.push('bubble touches the buttons (' + Math.round(r.top - b.bottom) + ')'); }
    const sg = document.querySelector('.mg-sign, .mg-title'); if (sg){ const r = sg.getBoundingClientRect(); if (b.top < r.bottom - 2) probs.push('bubble under the sign (' + Math.round(b.top - r.bottom) + ')'); }
    if (probs.length) out.push([i, q.s.slice(0, 60), probs.join('; ')]);
  });
  return JSON.stringify({ n: bank.length, bad: out });
})()"""
fails = 0
for W, H in SIZES:
    v = View(W, H); v.load(debug=False, http=LOCAL + 'flipstax.html?replay=1')
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.7)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(0.9)
    v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.3)
    v.js("[...document.querySelectorAll('.replay-list button')].find(x=> x.textContent.trim() === 'Fact or Fib').click(); 'x'")
    for i in range(80):
        spin(0.25); v.js("var c=document.getElementById('showCard'); if (c && !c.classList.contains('hidden')) c.click(); document.querySelectorAll('.ex-go').forEach(b=> b.click()); 'x'")
        if v.J("!!window.__ffShow && !!document.querySelector('.ff-bubble')"): break
    spin(1.0)
    r = json.loads(v.J(CHECK)); fails += len(r['bad'])
    print('%dx%d: %d statements, %d problems' % (W, H, r['n'], len(r['bad'])))
    for i, s, why in r['bad'][:25]: print('   #%d "%s..." %s' % (i, s, why))
    try: v.wv.loadHTMLString_baseURL_('', None); v.win.close()
    except Exception: pass
print('PASS' if not fails else 'FAIL: %d' % fails); sys.exit(1 if fails else 0)
