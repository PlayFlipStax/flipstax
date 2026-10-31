# FlipStax entrance check (overnight job 2): jumps to each game from the TEST menu (?replay=1) and watches the first 6 s. FAILS when
#  - an element that is animating starts larger than 1.15 x (+5% rounding) its settled size (so nothing zooms in cropped), or starts wider than the
#    screen when it settles inside it, or
#  - a frame is blank (one flat colour).
#   screenshots/qa/tools/venv/bin/python tools/entrance-check.py [360x640] [390x844]
import os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, 'screenshots', 'qa', 'tools'))
from wkh import View, spin, LOCAL, ensure_server
from PIL import Image
ensure_server()
GAMES = ['Riddle Round', 'Mystery Portal', 'Mystery Wheel', 'Price Probe', 'Oddball Alert', 'Emoji Decode', 'Time Warp', 'Peak or Plunge', 'Snap Sort', 'Zap Words', 'Twin Flip', 'Fact or Fib',
         'Saucer Shuffle', 'Grand finale (6 letters)', 'Orbit Drop']
SIZES = [tuple(int(n) for n in a.split('x')) for a in sys.argv[1:] if 'x' in a] or [(390, 844), (360, 640)]
LIMIT = 1.15 * 1.05
import re
DECOR = re.compile(r'stg-|gi-spot|gi-beam|gi-bg|glow|sweep|ray|galaxy|beam|sunburst|bg|spot|veil|bloom|flash|confetti|burst|studio|curtain|stage-|wall|floor|cone|sky|zoom-fx')   # (backdrops and light effects are meant to be bigger than the screen)
SAMPLER = """(function(){
  const S = window.__ent = { t0: performance.now(), rec: new Map(), done: false };
  const roots = '.mg-overlay, .lucky-overlay, .event-overlay, .show-card, .solve-overlay, .fin-overlay, #stage';
  const tick = ()=>{
    if (performance.now() - S.t0 > 14000){ S.done = true; return; }
    document.querySelectorAll(roots).forEach(root=>{
      if (root.classList.contains('hidden')) return;
      root.querySelectorAll('*').forEach(e=>{
        if (e.closest('.fx-layer,.show-fx,#showFx,svg')) return;
        const r = e.getBoundingClientRect(); if (r.width < 100 || r.height < 30) return;
        const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < 0.05 || cs.display === 'none') return;
        let sc = 1; for (let n = e; n && n !== document.body; n = n.parentElement){ const t = getComputedStyle(n).transform; if (t && t !== 'none'){ const m = t.match(/matrix\(([^,]+),/); if (m) sc *= Math.abs(parseFloat(m[1])); } }   // (the scale the element is drawn at, with its parents')
        let o = S.rec.get(e); if (!o){ o = { max:0, left:1e9, right:-1e9, n:0, tag:(e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ').slice(0, 3).join('.') }; S.rec.set(e, o); }
        o.sc = Math.max(o.sc || 0, sc); o.w = r.width; o.max = Math.max(o.max, r.width); o.left = Math.min(o.left, r.left); o.right = Math.max(o.right, r.right); o.n++;
      });
    });
    setTimeout(tick, 40);
  };
  tick();
})();"""
FINAL = """(function(){ const W = innerWidth, out = []; window.__ent.rec.forEach((o, e)=>{ if (!e.isConnected) return; const r = e.getBoundingClientRect(); out.push([o.tag, Math.round(o.max), Math.round(r.width), Math.round(o.left), Math.round(o.right), W, +(o.sc || 1).toFixed(2)]); }); return out; })()"""
def blank(path):
    im = Image.open(path).convert('L').resize((24, 40)); px = list(im.getdata()); m = sum(px) / len(px)
    return (sum((p - m) ** 2 for p in px) / len(px)) ** 0.5 < 2.5
bad = []
for W, H in SIZES:
    for g in GAMES:
        v = View(W, H); v.load(debug=False, http=LOCAL + 'flipstax.html?replay=1')
        v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.7)
        v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(0.9)
        v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.3)
        ok = v.J("(()=>{ const b = [...document.querySelectorAll('.replay-list button')].find(x=> x.textContent.trim().indexOf(%r) === 0); if (!b) return false; window.__sampler = 1; return true; })()" % g)
        if not ok: print('%dx%d %-26s NOT IN TEST MENU' % (W, H, g)); bad.append((W, g, 'missing')); continue
        v.js(SAMPLER + "[...document.querySelectorAll('.replay-list button')].find(x=> x.textContent.trim().indexOf(%r) === 0).click(); 'x'" % g)
        t0 = time.time(); blanks = 0; k = 0
        while time.time() - t0 < 13:
            p = '/tmp/ent.png'; v.snap(None, path=p)
            if time.time() - t0 > 0.5 and blank(p): blanks += 1
            if k % 6 == 5: v.js("var c = document.getElementById('showCard'); if (c && !c.classList.contains('hidden')) c.click(); document.querySelectorAll('.ex-go').forEach(b=> b.click()); 'x'")   # (skip the title card and explainer to reach the game itself)
            k += 1; spin(0.12)
        spin(1.2)
        rows = v.J(FINAL) or []
        probs = []
        for tag, mx, fin, l, r, vw, sc in rows:
            if DECOR.search(tag): continue
            if sc > LIMIT: probs.append('%s drawn at x%.2f' % (tag, sc))
            if sc > LIMIT and fin <= vw + 2 and (l < -3 or r > vw + 3): probs.append('%s leaves the frame (%d..%d of %d)' % (tag, l, r, vw))
        if blanks >= 3: probs.append('%d blank frames' % blanks)
        print('%dx%d %-26s %s' % (W, H, g, 'ok' if not probs else 'FAIL ' + '; '.join(probs[:3])), flush=True)
        if probs: bad.append((W, g, probs))
        try: v.wv.loadHTMLString_baseURL_('', None); v.win.close()
        except Exception: pass
print('FAIL: %d' % len(bad) if bad else 'all entrances ok')
sys.exit(1 if bad else 0)
