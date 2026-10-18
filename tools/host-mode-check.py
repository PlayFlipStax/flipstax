# FlipStax - the host's image mode and the cast, as shipped (Run 4). Checks: HOST_IMAGE_MODE is on with the registered poses;
# no drawn (SVG) host is anywhere in the page on the landing, the cold open, an act card, a game; borrowed poses show a picture;
# the cast is on; the presenter is pink for every episode until a purple picture is listed, then purple takes its share by
# the episode seed (nothing hard-coded); no cast on a VS card.
#   screenshots/qa/tools/venv/bin/python tools/host-mode-check.py
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots/qa/tools'))
from wkh import View, spin, LOCAL, ensure_server
ensure_server(); fails = []
def check(name, ok, got=''):
    print(('ok   ' if ok else 'FAIL ') + name + ('' if ok else '  (' + str(got) + ')'))
    if not ok: fails.append(name)
v = View(390, 844); url = LOCAL + 'flipstax.html?replay=1'
v.load(debug=False, http=url); v.js("localStorage.setItem('flipstax_howto_daily_v3','1'); 'x'"); v.load(debug=False, http=url)
J = v.J
SVG = "document.querySelectorAll('.hr-svg svg, .alien-svg, .host-full svg').length"
check('image mode is on', J('Host.imageMode') is True)
check('the core set is registered', J('Host.imageModeFor(FLIPSTAX_HOST_POSES)') is True)
check('landing: no drawn host', J(SVG) == 0, J(SVG))
v.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.5); v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.0)
def jump(label):
    v.js("document.querySelector('.replay-btn').click(); 'x'"); spin(0.2)
    v.js("[...document.querySelectorAll('.replay-list button')].find(b=> b.textContent === %r).click(); 'x'" % label)
jump('Cold open'); spin(3)
check('cold open: no drawn host', J(SVG) == 0, J(SVG))
jump('Act 2 card'); spin(3.3)
check('act card: no drawn host', J(SVG) == 0, J(SVG))
check('act card: the host is a picture', J("document.querySelectorAll('.cue-fig .hr-img.on').length") == 1)
jump('Zap Words'); spin(5)
check('a game: no drawn host', J(SVG) == 0, J(SVG))
check('a game: the corner host is a picture', J("document.querySelectorAll('#showAlien .hr-img.on').length") == 1)
for pose, ok in (('gasp', 'oops'), ('wink', 'blink'), ('point', 'presenting'), ('spin', 'discoPoint')):
    got = J("(()=>{ const r = document.querySelector('#showAlien .host-rig'); Host.pose(r, %r, { hold:0 }); return r.querySelector('.hr-img.on').getAttribute('src'); })()" % pose)
    check('borrowed pose %s shows %s' % (pose, ok), got.endswith('/' + ok + '.webp'), got)
check('the cast is on', J('Cast.enabled()') is True)
eps = J("[...Array(40).keys()].map(n=> { Cast.setEpisode(n); return Cast.presenter(); })")
check('presenter: pink for every episode (no purple picture)', set(eps) == {'pink'}, set(eps))
eps = J("(()=>{ FLIPSTAX_CAST_ART.push('purple-presenting'); const r = [...Array(40).keys()].map(n=> { Cast.setEpisode(n); return Cast.presenter(); }); FLIPSTAX_CAST_ART.pop(); return r; })()")
check('presenter: purple takes episodes once its picture is listed', set(eps) == {'pink', 'purple'}, set(eps))
jump('VS card'); spin(2.2)
check('VS card: no cast', J("document.querySelectorAll('#cast .cast-m').length") == 0)
print('OK' if not fails else '%d FAIL' % len(fails)); sys.exit(1 if fails else 0)
