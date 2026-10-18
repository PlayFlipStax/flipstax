# FlipStax - placement check for the host and the cast (Run 4). At each phone width, through the TEST menu (?replay=1):
# screenshots of the screens that show a character and, on each, every visible host / cast figure that overlaps an answer
# button, a score, a timer or any other tappable control (rectangles, so it is conservative: a figure's transparent margin
# counts). Writes screenshots/run4/<width>/NN-<screen>.png and prints a line per screen: OVERLAP lines are the failures.
#   screenshots/qa/tools/venv/bin/python tools/run4-shots.py [widths=360,390] [out=<dir>] [only=<substring>]
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'screenshots/qa/tools'))
from wkh import View, spin, LOCAL, ensure_server
arg = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
WIDTHS = [int(w) for w in arg.get('widths', '360,390').split(',')]
HEIGHT = { 360: 780, 390: 844 }
OUT = arg.get('out', os.path.join(ROOT, 'screenshots/run4')); ONLY = arg.get('only')
PROBE = r"""(()=>{
  const vis = e=>{ const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 4 && r.height > 4 && c.visibility !== 'hidden' && +c.opacity > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const figs = [...document.querySelectorAll('.host-rig, .cast-m')].filter(e=> vis(e) && !e.parentElement.closest('.host-rig, .cast-m')).filter(e=> { let p = e; while (p){ if (getComputedStyle(p).display === 'none') return false; p = p.parentElement; } return true; });
  const sel = 'button, [role=button], a[href], input, .event-tile, .half, .zw-cell, .mg-timer, .mg-score, .round-timer, .run-banner, #runBanner, .cz-opt, .ir-opt, .solve-key, .solve-tile, .ds-timer, .mg-opt, .ll-sq, .daily-btn, .plinko-btn';
  const ctrls = [...document.querySelectorAll(sel)].filter(e=> vis(e) && !e.closest('.replay-menu, .replay-btn, .replay-tag, .host-rig, .cast-m') && !e.classList.contains('replay-btn'));
  const top = c=>{ const r = c.getBoundingClientRect(), h = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2))); return h && (c.contains(h) || h.contains(c) || c === h); };
  const nm = e=> (e.id ? '#' + e.id : '.' + String(e.className).trim().split(/\s+/)[0]) + ' "' + (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 14) + '"';
  const out = [], seen = new Set();
  figs.forEach(f=>{ const fr = f.getBoundingClientRect(); ctrls.forEach(c=>{ if (f.contains(c) || c.contains(f) || !top(c)) return; const r = c.getBoundingClientRect(); if (r.width > innerWidth * 0.98 && r.height > innerHeight * 0.5) return;
    const ox = Math.min(fr.right, r.right) - Math.max(fr.left, r.left), oy = Math.min(fr.bottom, r.bottom) - Math.max(fr.top, r.top);
    if (ox > 3 && oy > 3){ const k = nm(f) + nm(c); if (!seen.has(k)){ seen.add(k); out.push((f.classList.contains('cast-m') ? 'CAST ' : 'HOST ') + nm(f).slice(0, 30) + ' over ' + nm(c) + ' (' + Math.round(ox) + 'x' + Math.round(oy) + ')'); } } }); });
  return JSON.stringify({ figs: figs.map(f=> (f.classList.contains('cast-m') ? 'cast:' : 'host:') + (f.dataset.pose || f.className.split(' ')[2] || '')), out: out.slice(0, 8) });
})()"""
WRONG = "document.querySelectorAll('#eventOverlay .event-tile')[{i}].click(); 'x'"
RIGHT = WRONG
# (label, wait, name, js to run first, wait after it)
SCREENS = [
  ('Cold open', 6.5, 'cold-open', None, 0), ('Act 1 card', 3.3, 'act1-card', None, 0), ('Act 2 card', 3.3, 'act2-card', None, 0), ('Act 3 card', 3.3, 'act3-card', None, 0),
  ('Riddle', 2.6, 'mystery-door', None, 0), ('Brain Beam', 3.0, 'brain-beam-wrong', WRONG, 1.0), ('Brain Beam', 3.0, 'brain-beam-right', RIGHT, 1.0),
  ('Cosmic Surprise', 6.8, 'cosmic-prize', None, 0), ('Zap Words', 5.5, 'zap-words', None, 0), ('Fact or Fib', 5.5, 'fact-or-fib', None, 0),
  ('VS card', 2.2, 'vs-card', None, 0), ('Results (sample)', 2.4, 'results', None, 0), ('Saucer Shuffle', 5.5, 'saucer-shuffle', None, 0), ('Lucky Lights', 3.0, 'lucky-lights', None, 0),
  ('Grand finale (6 letters)', 3.3, 'finale-card', None, 0),
]
ensure_server(); bad = 0
for W in WIDTHS:
    d = os.path.join(OUT, str(W)); os.makedirs(d, exist_ok=True)
    for n, (label, wait, name, js, w2) in enumerate(SCREENS, 1):
        if ONLY and ONLY not in name: continue
        v = View(W, HEIGHT.get(W, round(W * 2.165))); url = LOCAL + 'flipstax.html?replay=1'
        v.load(debug=False, http=url)
        v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); 'x'"); v.load(debug=False, http=url)
        v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.5)
        v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.0)
        v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.2)
        want = 'NOT QUITE' if name == 'brain-beam-wrong' else 'CORRECT' if name == 'brain-beam-right' else None
        for i in range(4 if want else 1):
            if i:
                v.load(debug=False, http=url); v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.5); v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.0); v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.2)
            v.js("(()=>{ const b = [...document.querySelectorAll('.replay-list button')].find(b=> b.textContent === %r); if (!b) return 'nolabel'; b.click(); return 'ok'; })()" % label)
            spin(wait)
            if js: v.js(js.replace('{i}', str(i))); spin(w2)
            if not want or want in (v.js("document.getElementById('eventPrompt').textContent") or '').upper(): break
        v.snap(None, path=os.path.join(d, '%02d-%s.png' % (n, name)))
        import json; r = json.loads(v.js(PROBE)); errs = v.qa()['errors']
        print('%d %-18s figures %-40s %s%s' % (W, name, ','.join(r['figs']) or '-', 'OK' if not r['out'] else 'OVERLAP ' + ' | '.join(r['out']), ('  ERRORS ' + str(errs)) if errs else ''), flush=True)
        bad += len(r['out'])
print('overlaps:', bad)
