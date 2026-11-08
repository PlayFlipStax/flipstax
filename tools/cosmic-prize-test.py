# FlipStax Cosmic Surprise prize test (J5): forces each prize through the TEST menu (?replay=1&debug=fast) and checks
# that it applies (score, keys, Orbit Drop chips) and what the prize pill says. Needs the QA harness on a Mac:
#   screenshots/qa/tools/venv/bin/python tools/cosmic-prize-test.py points10 points20 key chip

import sys, json
import os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots', 'qa', 'tools'))
from wkh import View, spin, LOCAL, ensure_server
ensure_server()
for prize in sys.argv[1:]:
    v = View(390, 844); url = LOCAL + 'flipstax.html?replay=1&debug=fast'
    v.load(debug=False, http=url); v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); 'x'"); v.load(debug=False, http=url)
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(1.3); v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1)
    v.js("window.__forceWild = %r; document.querySelector('.replay-btn').click(); 'x'" % prize); spin(0.3)
    v.js("[...document.querySelectorAll('.replay-list button')].find(b=> b.textContent === 'Cosmic Surprise').click(); 'x'")
    v.until("document.getElementById('slot3') && document.getElementById('eventOverlay').classList.contains('gift-mode') && !document.getElementById('eventOverlay').classList.contains('hidden')", 30)
    before = v.J("window.__debug.getRunState()")
    v.until("document.getElementById('giftPrize').textContent.length > 0", 30); spin(0.2)
    label = v.js("document.getElementById('giftPrize').textContent")
    v.until("document.getElementById('eventOverlay').classList.contains('hidden')", 30); spin(0.3)
    after = v.J("window.__debug.getRunState()")
    print(prize, '| label:', label, '| score', before['runScore'], '->', after['runScore'], '| keys', before['runKeys'], '->', after['runKeys'], '| chips', before['runBonusChips'], '->', after['runBonusChips'], '| scene', after['scene'])
    q = v.qa(); print('  errors', q['errors'][:3])
