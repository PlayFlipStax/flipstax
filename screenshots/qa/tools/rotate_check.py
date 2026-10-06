import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
v = View(390, 844); v.load(debug=True)
v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6)
v.js("document.getElementById('modeInfinityBtn').click(); 'x'"); spin(1.5)
v.resize(844, 390); spin(1.0)
print(v.J("(()=>{ const e = document.querySelector('.rotate-lock-overlay'); return { shown: !!e && getComputedStyle(e).display !== 'none', text: e ? e.textContent.replace(/\\s+/g,' ').trim() : null, paused: !document.getElementById('pauseOverlay').classList.contains('hidden') }; })()"))
v.snap(None, path=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sweep', 'rotate.png'))
