# Rough conditions: blocked storage, no internet, a long session, turning the
# phone sideways, leaving mid-screen, double taps, huge numbers.
import os, sys, json, time
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
R = {}
def enter(v, mode):
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
    v.js("document.getElementById('%s').click(); 'x'" % mode); spin(1.5)
def votes(v, n, timeout=60):
    t0 = time.time(); got = 0
    while got < n and time.time() - t0 < timeout:
        if v.js("!document.getElementById('halfA').classList.contains('revealed') && document.getElementById('eventOverlay').classList.contains('hidden') && document.getElementById('infAwardOverlay').classList.contains('hidden') && document.getElementById('solveOverlay').classList.contains('hidden')"):
            v.js("document.getElementById('halfA').click(); 'x'"); got += 1
        for ov, act in (('eventOverlay', "(()=>{ const t = [...document.querySelectorAll('.event-tile')].find(t=> t.onclick); if (t) t.click(); })()"),
                        ('infAwardOverlay', "(()=>{ const b = document.querySelector('#infAwardOverlay .daily-btn'); if (b) b.click(); })()"),
                        ('riddleOverlay', "(()=>{ const c = document.getElementById('riddleContinue'); if (!c.classList.contains('hidden')) c.click(); })()")):
            if not v.js("document.getElementById('%s').classList.contains('hidden')" % ov): v.js(act + "; 'x'")
        spin(0.12)
    return got
# 1. storage blocked (some private-browsing setups throw on every read/write)
try:
    BLOCK = "(function(){ const t = ()=> { throw new Error('SecurityError: storage blocked (simulated)'); }; Storage.prototype.getItem = t; Storage.prototype.setItem = t; Storage.prototype.removeItem = t; })();"
    for mode in ('modeDailyBtn', 'modeInfinityBtn'):
        v = View(390, 844, BLOCK); v.load(debug=True)
        try:
            enter(v, mode); n = votes(v, 8, 30)
            R['storage blocked, ' + mode] = { 'votes that worked': n, 'flipz': v.js("window.__debug.getStats().flips"), 'errors': v.qa()['errors'][:3], 'rejections': v.qa()['rejections'][:3] }
        except Exception as e: R['storage blocked, ' + mode] = { 'FAILED': str(e)[:200], 'errors': v.qa()['errors'][:3] }
except Exception as e:
    R['1. storage blocked (some private-brows'] = "TEST STEP FAILED: " + str(e)[:200]
print(json.dumps({k: R[k] for k in list(R)[-3:]}, ensure_ascii=True)); sys.stdout.flush()

# 2. no internet for the vote server
try:
    v = View(390, 844, "window.__qaOffline = true;"); v.load(debug=True)
    enter(v, 'modeInfinityBtn'); n = votes(v, 10, 40)
    R['offline: votes still count'] = { 'votes': n, 'flipz': v.js("window.__debug.getStats().flips"), 'crowd line': v.js("(document.getElementById('vibeLabel')||{}).textContent"), 'errors': v.qa()['errors'][:3], 'uncaught rejections': v.qa()['rejections'][:3] }
except Exception as e:
    R['2. no internet for the vote server'] = "TEST STEP FAILED: " + str(e)[:200]
print(json.dumps({k: R[k] for k in list(R)[-3:]}, ensure_ascii=True)); sys.stdout.flush()

# 3. a long Infinity session
try:
    v = View(390, 844); v.load(debug=True); enter(v, 'modeInfinityBtn')
    nodes0 = v.js("document.getElementsByTagName('*').length")
    n = votes(v, 200, 420)
    R['long session'] = { 'votes': n, 'flipz': v.js("window.__debug.getStats().flips"), 'page elements before / after': [nodes0, v.js("document.getElementsByTagName('*').length")], 'errors': v.qa()['errors'][:3], 'rejections': v.qa()['rejections'][:3] }
except Exception as e:
    R['3. a long Infinity session'] = "TEST STEP FAILED: " + str(e)[:200]
print(json.dumps({k: R[k] for k in list(R)[-3:]}, ensure_ascii=True)); sys.stdout.flush()

# 4. turned sideways mid-round, then back
try:
    v = View(390, 844); v.load(debug=True); enter(v, 'modeInfinityBtn'); votes(v, 2)
    v.resize(844, 390); spin(1.0)
    R['sideways: rotate screen shown / game paused'] = [v.js("(()=>{ const e = document.querySelector('.rotate-overlay, #rotateOverlay, .landscape-block'); return e ? getComputedStyle(e).display !== 'none' : 'no element'; })()"), v.js("!document.getElementById('pauseOverlay').classList.contains('hidden')")]
    v.resize(390, 844); spin(0.8)
    v.js("document.getElementById('pauseResumeBtn').click(); 'x'"); spin(0.5)
    R['back upright: play resumes'] = votes(v, 2, 20) == 2
    R['sideways errors'] = v.qa()['errors'][:3]
except Exception as e:
    R['4. turned sideways mid-round, then bac'] = "TEST STEP FAILED: " + str(e)[:200]
print(json.dumps({k: R[k] for k in list(R)[-3:]}, ensure_ascii=True)); sys.stdout.flush()

# 5. back arrow from the middle of things, then play again
try:
    v = View(390, 844, "window.confirm = ()=> true;"); v.load(debug=True); enter(v, 'modeInfinityBtn')
    out = {}
    for name, setup in (('trivia', "window.__debug.showInfTrivia(); window.__debug.holdEvent()"),
                        ('coin flip mid-toss', "window.__debug.showInfPowerUp(); window.__debug.holdEvent(); setTimeout(()=> [...document.querySelectorAll('.event-tile')].find(t=> /Coin/.test(t.textContent)).click(), 200)")):
        v.js(setup + "; 'x'"); spin(0.6)
        v.js("document.getElementById('backBtn').click(); 'x'"); spin(2.5)
        ok_ms = v.js("!document.getElementById('modeSelectOverlay').classList.contains('hidden') && document.getElementById('eventOverlay').classList.contains('hidden')")
        v.js("document.getElementById('modeInfinityBtn').click(); 'x'"); spin(1.5)
        out[name] = { 'back on mode select, nothing left open': ok_ms, 'plays again': votes(v, 2, 20) == 2 }
    v.js("document.getElementById('backBtn').click(); 'x'"); spin(0.8)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.5)
    v.js("window.__debug.setRunClockMs(0); 'x'"); v.until("window.__debug.getSolveState().solveOpen", 30); spin(0.4)
    v.js("document.getElementById('backBtn').click(); 'x'"); spin(1.0)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.5)
    out['word solve'] = { 'Daily re-opens the solve where it was': v.js("window.__debug.getSolveState().solveOpen || !document.getElementById('pauseOverlay').classList.contains('hidden')") }
    out['errors'] = v.qa()['errors'][:3]
    R['back arrow mid-screen'] = out
except Exception as e:
    R['5. back arrow from the middle of thing'] = "TEST STEP FAILED: " + str(e)[:200]
print(json.dumps({k: R[k] for k in list(R)[-3:]}, ensure_ascii=True)); sys.stdout.flush()

# 6. two answers tapped at once
try:
    v = View(390, 844); v.load(debug=True); enter(v, 'modeDailyBtn')
    st0 = v.J("window.__debug.getRunState()")
    v.js("window.__debug.showRunTrivia(); 'x'"); spin(0.3)
    v.js("(()=>{ const q = window.__debug.getLastTriviaQ(), t = document.querySelectorAll('.event-tile'); t[q.correctIdx].click(); t[(q.correctIdx + 1) % 4].click(); t[q.correctIdx].click(); })(); 'x'"); spin(1.6)
    st1 = v.J("window.__debug.getRunState()")
    R['double tap on trivia: counted once'] = { 'trivia answered': st1['runTriviaAttempted'] - st0['runTriviaAttempted'], 'right': st1['runTriviaCorrect'] - st0['runTriviaCorrect'], 'letters': len(st1['runLetters']) - len(st0['runLetters']) }
except Exception as e:
    R['6. two answers tapped at once'] = "TEST STEP FAILED: " + str(e)[:200]
print(json.dumps({k: R[k] for k in list(R)[-3:]}, ensure_ascii=True)); sys.stdout.flush()

# 7. huge numbers on the smallest phone
try:
    TODAY = "(()=>{ const n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); })()"
    v = View(320, 568); v.load(debug=True)
    v.js("localStorage.setItem('flipstax_stats_v1', JSON.stringify({ flips:1234567, lastDate:%s, streak:365, freezeAvailable:true, byCat:{}, badges:{} })); localStorage.setItem('flipstax_race_v1', JSON.stringify({ date:%s, score:-87, startedAt:Date.now(), completed:false, completionMs:null })); 'x'" % (TODAY, TODAY)); v.load(debug=True)
    enter(v, 'modeInfinityBtn')
    R['huge numbers on a 320px phone'] = v.J("(()=>{ const c = document.getElementById('meChip'), p = document.getElementById('runBanner'), r = c.getBoundingClientRect(); return { chip: c.textContent.replace(/\\s+/g,' ').trim(), pill: p.textContent, chipClipped: c.scrollWidth > c.clientWidth + 1 || r.right > innerWidth, pillClipped: p.scrollWidth > p.clientWidth + 1, sideScroll: document.scrollingElement.scrollWidth > innerWidth + 1 }; })()")
    v.snap(None, path=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sweep', 'huge-numbers-320.png'))
    print('=== ALL ==='); print(json.dumps(R, indent=1, ensure_ascii=True))

except Exception as e:
    R['7. huge numbers on the smallest phone'] = "TEST STEP FAILED: " + str(e)[:200]
print(json.dumps({k: R[k] for k in list(R)[-3:]}, ensure_ascii=True)); sys.stdout.flush()
