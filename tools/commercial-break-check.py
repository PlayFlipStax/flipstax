# FlipStax commercial-break check: the break played out, skipped early, skipped twice, and with another screen taking showCard over mid-break (the
# '.cb-say is null' TypeError) - the break must always end, hand back to the show, and never throw.
#   screenshots/qa/tools/venv/bin/python tools/commercial-break-check.py
import os
import sys,time
BAD = []
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots', 'qa', 'tools'))
from wkh import View, spin, LOCAL
for mode in ('full','jump-away','skip-early','skip-twice'):
    v=View(390,844); v.load(debug=False, http=LOCAL+'flipstax.html?replay=1')
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.7)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(0.9)
    v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.3)
    v.js("[...document.querySelectorAll('.replay-list button')].find(x=> x.textContent.trim() === 'Commercial break').click(); 'x'")
    for i in range(80):
        spin(0.2); v.js("var c=document.getElementById('showCard'); if (c && c.classList.contains('gintro')) c.click(); 'x'")
        if v.J("document.getElementById('showCard').classList.contains('sponsor')"): break
    if mode=='jump-away':
        spin(0.5); v.js("var c=document.getElementById('showCard'); c.className='show-card'; c.innerHTML='<div>other</div>'; 'x'"); spin(14)
        print(mode,'card still ours:',v.J("document.getElementById('showCard').innerHTML"))
    elif mode=='skip-early':
        for k in range(30): v.js("document.getElementById('showCard').click(); 'x'"); spin(0.5)
        print(mode,'sponsor card gone:',v.J("!document.getElementById('showCard').classList.contains('sponsor')"))
    elif mode=='skip-twice':
        spin(2.3); v.js("document.getElementById('showCard').click(); 'x'"); spin(0.3); v.js("document.getElementById('showCard').click(); 'x'"); spin(0.2); v.js("document.getElementById('showCard').click(); 'x'"); spin(3)
        print(mode,'sponsor card gone:',v.J("!document.getElementById('showCard').classList.contains('sponsor')"))
    else:
        for i in range(120):
            spin(0.2)
            if not v.J("document.getElementById('showCard').classList.contains('sponsor')"): break
        print(mode,'ended after %.0f s'%(i*0.2),'| back in show:',v.J("window.__show?window.__show.scene:'?'"))
    e = v.qa()['errors'][:3]; print('  errors:', e)
    if e: BAD.append((mode, e))

print('commercial break: ' + ('FAIL ' + str(BAD) if BAD else 'ok')); sys.exit(1 if BAD else 0)
