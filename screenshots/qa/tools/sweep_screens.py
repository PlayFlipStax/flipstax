# Every screen, at a range of phone/tablet sizes: screenshot it, and check
# (1) nothing makes the page scroll sideways, (2) every visible button / link /
# tile can actually be tapped at its centre (nothing covering it), (3) none sit
# off the edge of the screen (unless inside something that scrolls).
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
from PIL import Image, ImageDraw
OUTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sweep'); os.makedirs(OUTDIR, exist_ok=True)
CHECK = r"""(()=>{
  const sel = 'button, a[href], input, [role=button], .daily-btn, .event-tile, .ms-cta, .solve-kb-key, .run-link, .col-tab, .cc-card, .home-legal-link, #homeEnterBtn, .ms-collection-btn, .coin-stage, .pause-btn, .slowdown-btn, .half';
  const vis = el=> { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) return false; for (let p = el; p; p = p.parentElement){ const c = getComputedStyle(p); if (c.display === 'none' || +c.opacity === 0) return false; } return true; };
  const scroller = el=> { for (let p = el.parentElement; p; p = p.parentElement){ const c = getComputedStyle(p); if (/(auto|scroll)/.test(c.overflowY) && p.scrollHeight > p.clientHeight + 1) return p; } return null; };
  const name = el=> (el.id ? '#' + el.id : (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName)) + ' "' + (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g,' ').split('').filter(c=> !/[\uD800-\uDFFF]/.test(c)).join('').slice(0, 22) + '"';
  // Only the layer on top: the nearest full-screen overlay under the centre of
  // the screen (or the whole page when no overlay is up), plus the back button.
  const layer = (()=>{ for (let p = document.elementFromPoint(innerWidth / 2, innerHeight / 2); p && p !== document.body; p = p.parentElement){
      const c = getComputedStyle(p), r = p.getBoundingClientRect();
      if ((c.position === 'fixed' || c.position === 'absolute') && r.width * r.height >= innerWidth * innerHeight * 0.6) return p; }
    return document.body; })();
  const covered = [], offscreen = [];
  [...document.querySelectorAll(sel)].filter(el=> vis(el) && (layer.contains(el) || el.id === 'backBtn')).forEach(el=>{
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const inView = cx >= 0 && cx <= innerWidth && cy >= 0 && cy <= innerHeight;
    if (!inView){ if (!scroller(el)) offscreen.push(name(el)); return; }
    const hit = document.elementFromPoint(cx, cy);
    if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) covered.push(name(el) + ' under ' + name(hit));
  });
  // Invisible but still tappable: anything on screen that takes taps while
  // it (or a parent) is fully transparent.
  const ghosts = [];
  [...document.querySelectorAll('a[href], button, [role=button], .daily-btn, input')].forEach(el=>{
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
    let hidden = false; for (let p = el; p; p = p.parentElement){ const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return; if (+c.opacity === 0) hidden = true; }
    if (!hidden || getComputedStyle(el).pointerEvents === 'none') return;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (hit && (hit === el || el.contains(hit))) ghosts.push(name(el));
  });
  const wide = document.scrollingElement.scrollWidth > innerWidth + 1 ? (()=>{ const out = []; document.querySelectorAll('body *').forEach(el=>{ const r = el.getBoundingClientRect(); if (!r.width || r.right <= innerWidth + 1) return;
      for (let p = el.parentElement; p; p = p.parentElement){ if (getComputedStyle(p).overflowX !== 'visible') return; } out.push(name(el) + ' right=' + Math.round(r.right)); }); return out.slice(0, 6); })() : null;
  return { wideCulprits: wide, ghosts: ghosts.slice(0, 6), layer: layer.id || layer.className.split(' ')[0], sideScroll: document.scrollingElement.scrollWidth > innerWidth + 1, covered: covered.slice(0, 8), offscreen: offscreen.slice(0, 8) };
})()"""
ANS = {'FOOTSTEPS':'footsteps','ECHO':'echo','DARKNESS':'darkness','PIANO':'piano','ARE YOU ASLEEP':'are you asleep?','FIRE':'fire','BREATH':'your breath','COFFIN':'casket','HOLE':'a hole','PROMISE':'a promise'}
SIZES = [(320, 568, 'iphone-se1'), (375, 667, 'iphone-se'), (390, 844, 'iphone14'), (430, 932, 'pro-max'), (360, 800, 'android'), (412, 915, 'pixel'), (768, 1024, 'ipad')]
if len(sys.argv) > 1: SIZES = [s for s in SIZES if s[2] in sys.argv[1:]]
REPORT = {}
for W, H, tag in SIZES:
    v = View(W, H, "window.confirm = ()=> true;"); v.load(debug=True)
    shots, res = [], {}
    def step(name, js=None, wait=0.6, until=None):
        try:
            if js: v.js(js + "; 'x'")
            if until: v.until(until, 25)
            spin(wait)
            res[name] = v.J(CHECK)
            p = os.path.join(OUTDIR, '%s-%02d.png' % (tag, len(shots))); v.snap(None, path=p); shots.append((name, p))
        except Exception as e:
            res[name] = { 'STEP FAILED': str(e)[:160] }
    step('splash', wait=1.5)
    step('legal page', "document.getElementById('homePrivacyLink').click()")
    step('mode select', "document.querySelector('.legal-close') && document.querySelector('.legal-close').click(); document.getElementById('homeEnterBtn').click()", 1.0)
    step('donations note', "document.getElementById('coffeeBtn').click()")
    step('daily board', "document.getElementById('donateLater').click(); document.getElementById('modeDailyBtn').click()", 1.5)
    step('daily trivia', "window.__debug.showRunTrivia(); window.__debug.holdEvent()")
    step('daily power-up', "document.getElementById('eventOverlay').classList.add('hidden'); window.__debug.showRunPowerUp(); window.__debug.holdEvent()")
    step('secret riddle', "document.getElementById('eventOverlay').classList.add('hidden'); window.__debug.startDailyRiddle(); window.__debug.setRiddleRemainingMs(60000)", 1.0)
    step('riddle win', "document.getElementById('riddleInput').value = %s; document.getElementById('riddleSubmit').click()" % json.dumps(ANS.get(v.js("window.__debug.currentRiddle() && window.__debug.currentRiddle().a"), 'x')), 5.6)
    step('word solve', "document.getElementById('riddleContinue').click(); window.__debug.setRunClockMs(0)", 0.8, until="window.__debug.getSolveState().solveOpen")
    step('results', """(()=>{ const w = window.__debug.getRunWord().word; const keys = [...document.querySelectorAll('.solve-kb-key')];
        [...document.querySelectorAll('#solveSlots .solve-slot')].forEach((s,i)=>{ if (s.classList.contains('locked')) return; const k = keys.find(k=> k.textContent.trim() === w[i]); if (k) k.click(); });
        document.getElementById('solveSubmit').click(); })()""", 3.0, until="window.__debug.getSolveState().readoutOpen")
    step('infinity board', "document.getElementById('readoutDone').click(); document.getElementById('modeInfinityBtn').click()", 1.8)
    step('infinity trivia', "window.__debug.showInfTrivia(); window.__debug.holdEvent()")
    step('coin flip', "document.getElementById('eventOverlay').classList.add('hidden'); window.__debug.showInfPowerUp(); window.__debug.holdEvent(); setTimeout(()=> [...document.querySelectorAll('.event-tile')].find(t=> /Coin/.test(t.textContent)).click(), 300)", 2.6)
    step('pause screen', "document.getElementById('pauseBtn').click()", 0.8, until="document.getElementById('eventOverlay').classList.contains('hidden')")
    step('infinity award', "document.getElementById('pauseResumeBtn').click(); window.__debug.setInfBlockVotes(49); setTimeout(()=>{ const t = setInterval(()=>{ const a = document.getElementById('halfA'); if (!a.classList.contains('revealed')){ a.click(); clearInterval(t); } }, 150); }, 200)", 2.5, until="!document.getElementById('infAwardOverlay').classList.contains('hidden')")
    step('collection', "location.reload()", 2.0)
    try:
        v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
        v.js("window.__debug.setCollection({ v:1, cards:{ gambler:{ first:'2026-10-01', count:1, revealed:true }, crowd_pleaser:{ first:'2026-10-02', count:1, revealed:true } } }); document.getElementById('collectionBtn').click(); 'x'"); spin(1.4)
        res['collection'] = v.J(CHECK); p = os.path.join(OUTDIR, '%s-%02d.png' % (tag, len(shots))); v.snap(None, path=p); shots.append(('collection', p))
    except Exception as e: res['collection'] = { 'STEP FAILED': str(e)[:160] }
    step('card close-up', "document.querySelector('.cc-card.unlocked').click()", 0.8)
    step('badges tab', "document.getElementById('cardZoom').classList.add('hidden'); [...document.querySelectorAll('.col-tab')].find(t=> t.dataset.tab==='badges').click()")
    res['console errors'] = v.qa()['errors']; res['rejections'] = v.qa()['rejections']
    REPORT[tag] = res
    # contact sheet
    th = 300; ims = [(n, Image.open(p)) for n, p in shots]; ims = [(n, i.resize((int(i.width * th / i.height), th))) for n, i in ims]
    cols = 9; rows = (len(ims) + cols - 1) // cols; cw = max(i.width for n, i in ims) + 8
    sheet = Image.new('RGB', (cols * cw, rows * (th + 22)), 'white'); d = ImageDraw.Draw(sheet)
    for k, (n, i) in enumerate(ims):
        x, y = (k % cols) * cw, (k // cols) * (th + 22); sheet.paste(i, (x, y + 18)); d.text((x + 3, y + 3), n, fill='black')
    sheet.save(os.path.join(OUTDIR, 'sheet-%s.png' % tag))
# only the problems
probs = {}
for tag, res in REPORT.items():
    for name, r in res.items():
        if name in ('console errors', 'rejections'):
            if r: probs.setdefault(tag, {})[name] = r
            continue
        bad = { k: v for k, v in r.items() if (k == 'STEP FAILED') or (k == 'sideScroll' and v) or (k in ('covered', 'offscreen', 'ghosts') and v) }
        if bad: probs.setdefault(tag, {})[name] = bad
open(os.path.join(OUTDIR, 'report-%s.json' % '-'.join(t for _, _, t in SIZES)), 'w').write(json.dumps({ 'problems': probs, 'all': REPORT }, indent=1, ensure_ascii=True))
print(json.dumps(probs, indent=1, ensure_ascii=True) if probs else 'NO PROBLEMS FOUND')
