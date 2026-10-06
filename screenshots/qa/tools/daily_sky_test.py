# Daily Stax sky: sun follows the run clock, UFO passes / abductions, holds on pause, stops on leaving, never takes taps.
import os, sys, json, time
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sweep'); os.makedirs(OUT, exist_ok=True)
def daily(W, H, extra=''):
    v = View(W, H, extra); v.load(debug=True)
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(2.0)
    return v
SKY = "window.__debug.getDailySky()"
UFO = "(()=>{ const u = document.getElementById('dailyUfo'), r = u.getBoundingClientRect(), s = document.getElementById('dailySun').getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const hit = document.elementFromPoint(Math.max(1, Math.min(innerWidth - 1, cx)), Math.max(1, cy)); return { ufo: [Math.round(cx), Math.round(cy)], ufoOpacity: getComputedStyle(u).opacity, beaming: u.classList.contains('beaming'), sun: [Math.round(s.left + s.width / 2), Math.round(s.top + s.height / 2)], tapLandsOnSky: !!hit && !!hit.closest('.daily-sky'), anims: document.getAnimations().filter(a=> a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.daily-sky') && a.effect.target.id).map(a=> a.playState) }; })()"
R = {}
v = daily(390, 844)
R['start'] = [v.J(SKY), v.J(UFO)]; v.snap(None, path=os.path.join(OUT, 'sky-390-1-sunrise.png'))
v.js("window.__debug.setRunClockMs(90000); 'x'"); spin(2.2)
R['half the clock gone'] = [v.J(SKY), v.J(UFO)]; v.snap(None, path=os.path.join(OUT, 'sky-390-2-midday.png'))
v.js("window.__debug.dailyUfo(true, 'cow'); 'x'"); spin(2.9)
R['abduction: hovering'] = v.J(UFO); v.snap(None, path=os.path.join(OUT, 'sky-390-3-beam.png'))
spin(1.3); R['abduction: cow rising'] = v.J(UFO); v.snap(None, path=os.path.join(OUT, 'sky-390-4-cow.png'))
v.js("document.getElementById('pauseBtn').click(); 'x'"); spin(1.6)
R['paused mid-abduction'] = [v.J(SKY), v.J(UFO)]
p1 = v.J(UFO)['ufo']; spin(1.5); R['ufo holds still while paused'] = v.J(UFO)['ufo'] == p1
v.js("document.getElementById('pauseResumeBtn').click(); 'x'"); spin(4.5)
R['after resume: flight finished'] = [v.J(SKY), v.J(UFO)]
v.js("window.__debug.dailyUfo(false); 'x'"); spin(3.5)
R['plain pass'] = v.J(UFO); v.snap(None, path=os.path.join(OUT, 'sky-390-5-pass.png'))
spin(7.5)
v.js("window.__debug.dailyUfo(true, 'cards'); 'x'"); spin(4.0)
R['card-stack abduction'] = v.J(UFO); v.snap(None, path=os.path.join(OUT, 'sky-390-6-cards.png'))
spin(3)
v.js("window.__debug.setRunClockMs(6000); 'x'"); spin(2.2)
R['near the end'] = [v.J(SKY), v.J(UFO)]; v.snap(None, path=os.path.join(OUT, 'sky-390-7-sunset.png'))
v.js("window.__debug.setRunClockMs(150000); 'x'"); spin(2.2)
R['+time added: sun holds (no slide back)'] = v.J(SKY)
v.js("window.__debug.dailyUfo(true, 'cow'); 'x'"); spin(2.0)
v.js("window.confirm = ()=> true; document.getElementById('backBtn').click(); 'x'"); spin(2.2)
R['left Daily mid-flight'] = [v.J(SKY), v.J(UFO), v.js("getComputedStyle(document.querySelector('.daily-sky')).display")]
R['errors'] = v.qa()['errors']
for W, H in ((320, 568), (375, 667), (360, 800)):
    w = daily(W, H); w.js("window.__debug.setRunClockMs(60000); 'x'"); spin(1.5)
    w.js("window.__debug.dailyUfo(true, 'cow'); 'x'"); spin(4.1)
    R['%dx%d cow' % (W, H)] = w.J(UFO); w.snap(None, path=os.path.join(OUT, 'sky-%d-cow.png' % W)); R['%d errors' % W] = w.qa()['errors']
m = daily(390, 844, "window.matchMedia = (q)=> ({ matches: /reduce/.test(q), addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} });")
R['reduced motion: sky never starts'] = m.J(SKY)
print(json.dumps(R, indent=1))
