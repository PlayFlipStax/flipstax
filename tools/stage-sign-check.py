# FlipStax - the marquee text stays on the stage's sign at any crop (Run 3, lib/stage.js).
# For each screen size and each shot (close, wide; lite mode so the camera holds still) it checks that the live text
# box sits on the sign found in the picture (Stage.SIGN, in percent of the picture), that it is inside the screen, and
# that the longest sign lines fit without clipping. Prints a line per case and FAIL lines for problems.
#   screenshots/qa/tools/venv/bin/python tools/stage-sign-check.py
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots/qa/tools'))
from wkh import View, spin, LOCAL, ensure_server
SIZES = [(360, 780), (390, 844), (412, 915), (768, 1024), (1024, 1366)]
LINES = [('TONIGHT’S SHOW', 'EPISODE 16'), ('ACT 1', 'THE OPENER'), ('ACT 2', 'DOUBLE TROUBLE'), ('ACT 3', 'LIGHTNING ROUND'),
         ('', 'GRAND FINALE'), ('', 'MYSTERY GAME'), ('THAT’S OUR SHOW', 'SEE YOU TOMORROW'), ('EPISODE 999', 'WELCOME TO FLIPSTAX')]
PROBE = r"""(()=>{
  const st = document.getElementById('stage'), shot = st.querySelector('.stg-' + %r), plate = shot.querySelector('.stg-plate'), g = shot.querySelector('.stg-sign');
  const p = plate.getBoundingClientRect(), r = g.getBoundingClientRect(), S = Stage.SIGN[%r];
  const want = { l: p.left + p.width * S.x / 100, t: p.top + p.height * S.y / 100, w: p.width * S.w / 100, h: p.height * S.h / 100 };
  const off = Math.max(Math.abs(r.left - want.l), Math.abs(r.top - want.t), Math.abs(r.width - want.w), Math.abs(r.height - want.h));
  const clipped = [...g.querySelectorAll('span, b')].filter(e=> getComputedStyle(e).display !== 'none' && e.scrollWidth > e.clientWidth + 1).map(e=> e.textContent);
  return { off: Math.round(off * 10) / 10, inside: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1, clipped, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] };
})()"""
ensure_server()
fails = 0
for W, H in SIZES:
    v = View(W, H)
    v.load(debug=False, http=LOCAL + 'flipstax.html?lite=1')
    v.until('window.Stage && Stage.ready', 15)
    v.js("Stage.loadWide(); 'x'"); spin(1.5)
    for shot in ('close', 'wide'):
        worst, out = 0, []
        for sub, main in LINES:
            v.js("Stage.cue(%r, { over: document.getElementById('homeOverlay'), sign: { sub: %r, main: %r } }); 'x'" % (shot, sub, main)); spin(0.15)
            r = v.J(PROBE % (shot, shot))
            worst = max(worst, r['off'])
            if r['off'] > 1.5 or not r['inside'] or r['clipped']:
                fails += 1; out.append('FAIL %dx%d %s %r: %s' % (W, H, shot, main, r))
        print('%4dx%-4d %-5s sign box %s, worst offset %.1f px' % (W, H, shot, r['box'], worst)); [print(' ', o) for o in out]
print('OK' if not fails else '%d FAIL' % fails)
sys.exit(1 if fails else 0)
