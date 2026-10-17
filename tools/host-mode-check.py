# FlipStax - HOST_IMAGE_MODE and the cast gate (Run 3, lib/host.js + lib/cast.js).
# Checks: the switch needs the whole core set (a partial list keeps the SVG host); with today's manifest the host is
# the drawn SVG on every pose (no picture layer on), the cast stays off at a showcase moment (the Mystery Game door)
# and on a wrong answer; with ?castpreview=1 on localhost the cast does come out at the door.
#   screenshots/qa/tools/venv/bin/python tools/host-mode-check.py
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots/qa/tools'))
from wkh import View, spin, LOCAL, ensure_server
ensure_server()
fails = []
def check(name, ok, got=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  (' + str(got) + ')'))
    if not ok: fails.append(name)
def episode(q):
    v = View(390, 844)
    url = LOCAL + 'flipstax.html?replay=1' + q
    v.load(debug=False, http=url)
    v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); 'x'"); v.load(debug=False, http=url)
    return v
def jump(v, label):
    v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.5)
    v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.0)
    v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.2)
    v.js("[...document.querySelectorAll('.replay-list button')].find(b=> b.textContent === %r).click(); 'x'" % label)
CAST = "document.querySelectorAll('#cast .cast-m').length"
v = episode('')
J = v.J
check('the core set switches image mode on', J("Host.imageModeFor(Host.IMAGE_SET)") is True)
check('a partial set keeps the SVG host', J("Host.imageModeFor(['idle','wave','cheer','think','shrug','oops','laugh','presenting'])") is False)
check('every pose listed switches it on', J("Host.imageModeFor(Host.POSES)") is True)
check('today: HOST_IMAGE_MODE is off', J("Host.imageMode") is False, J("Host.imageMode"))
check('today: the cast is off', J("Cast.enabled()") is False)
check('no host picture loaded', J("Object.keys(Host.art).length") == 0, J("Object.keys(Host.art)"))
J("document.querySelectorAll('.host-rig').forEach(r=> Host.pose(r, 'laugh')), 0")
check('a pose with a picture in the folder (laugh) still shows the SVG host', J("[...document.querySelectorAll('.host-rig')].every(r=> !r.classList.contains('has-img'))") is True)
jump(v, 'Riddle'); spin(2.4)
check('Mystery Game door: no cast while the host is the SVG', J(CAST) == 0, J(CAST))
check('Mystery Game door: the stage shows (close)', J("Stage.shot") == 'close', J("Stage.shot"))
v2 = episode('&castpreview=1')
jump(v2, 'Riddle'); spin(2.4)
check('?castpreview=1: the presenter comes out at the door', v2.J(CAST) == 1, v2.J(CAST))
v3 = episode('')
jump(v3, 'Brain Beam'); spin(3.0)
v3.js("document.querySelectorAll('#eventOverlay .event-tile')[2].click(); 'x'"); spin(0.8)
check('a wrong Brain Beam answer: no sidekick while the host is the SVG', v3.J(CAST) == 0, v3.J(CAST))
print('OK' if not fails else '%d FAIL' % len(fails))
sys.exit(1 if fails else 0)
