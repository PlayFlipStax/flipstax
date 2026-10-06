# Does the Daily page survive a whole run with the sky going (no recording)? Marker survives = no reload.
import os, sys, json, time
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
v = View(390, 844, "try{ localStorage.setItem('flipstax_seen_run_intro','1'); }catch(e){}"); v.load(debug=True)
v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.5)
v.js("window.__alive = 'yes'; 'x'")
t0 = time.time(); k = 0; log = []
while time.time() - t0 < 150:
    spin(1.0); k += 1
    if k % 3 == 0: v.js("(()=>{ const a = document.getElementById('halfA'); if (!a.classList.contains('revealed')) a.click(); })(); 'x'")
    if k % 20 == 0: v.js("window.__debug.dailyUfo(Math.random() < 0.6, Math.random() < 0.3 ? 'cards' : 'cow'); 'x'")
    if k % 10 == 0:
        st = v.J("({ alive: window.__alive || 'RELOADED', sky: window.__debug.getDailySky(), nodes: document.getElementsByTagName('*').length, anims: document.getAnimations().length, overlay: [...document.querySelectorAll('.event-overlay:not(.hidden), .riddle-overlay:not(.hidden), #solveOverlay:not(.hidden)')].map(e=> e.id) })")
        log.append((k, st['alive'], round(st['sky']['sunP'], 3), st['sky']['busy'], st['nodes'], st['anims'], st['overlay']))
for l in log: print(l)
print('errors', v.qa()['errors'], v.qa()['rejections'])
