# FlipStax - the drawn studio (polish pass). Writes the block between the STUDIO markers at the end of lib/stage.css:
# the orbiting alien TV studio that every show beat stands in (the opener, the round cards, the Mystery Game reveal, the
# outro, the results) in place of the stage photos. Small inline SVG drawings only; the photos stay in data/stage.
#   python3 tools/build-studio-css.py
import os, re, random, urllib.parse
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def uri(svg):
    svg = re.sub(r'\s+', ' ', svg.strip()).replace('> <', '><').replace('"', "'")
    return 'url("data:image/svg+xml,' + urllib.parse.quote(svg, safe="/:=' ,.-;()") + '")'
ARCH = 'M58 612V330A137 137 0 0 1 332 330V612'
# ---- the wall, the neon arch, the floor: everything in front of the window (the window itself is a hole) ----
WALL = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="none">
<defs>
<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0530"/><stop offset=".6" stop-color="#1c0c5c"/><stop offset="1" stop-color="#2a1078"/></linearGradient>
<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1a9a"/><stop offset=".35" stop-color="#1c0c5c"/><stop offset="1" stop-color="#070320"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="r" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#ff4fd8" stop-opacity=".5"/><stop offset=".5" stop-color="#5ff4ff" stop-opacity=".14"/><stop offset="1" stop-color="#5ff4ff" stop-opacity="0"/></radialGradient>
</defs>
<path fill-rule="evenodd" d="M0 0H390V612H0Z ARCHZ" fill="url(#w)"/>
<path d="ARCHZ" fill="url(#g)"/>
<path d="ARCH" fill="none" stroke="#ff4fd8" stroke-width="22" opacity=".22"/>
<path d="ARCH" fill="none" stroke="#ff4fd8" stroke-width="7"/>
<path d="ARCH" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/>
<path d="M76 612V332A119 119 0 0 1 314 332V612" fill="none" stroke="#5ff4ff" stroke-width="12" opacity=".2"/>
<path d="M76 612V332A119 119 0 0 1 314 332V612" fill="none" stroke="#5ff4ff" stroke-width="3.5"/>
<g fill="#5ff4ff"><rect x="20" y="236" width="5" height="350" rx="2.5"/><rect x="365" y="236" width="5" height="350" rx="2.5"/></g>
<g fill="#ff4fd8"><rect x="36" y="270" width="4" height="316" rx="2"/><rect x="350" y="270" width="4" height="316" rx="2"/></g>
<g fill="#ffe27a"><circle cx="22" cy="214" r="4"/><circle cx="368" cy="214" r="4"/></g>
<path d="M0 612H390V844H0Z" fill="url(#f)"/>
<path d="M5 614A190 120 0 0 0 385 614Z" fill="url(#r)"/>
<g stroke="#5ff4ff" stroke-width="1.4" opacity=".38"><path d="M195 612L-140 844M195 612L-10 844M195 612L100 844M195 612L195 844M195 612L290 844M195 612L400 844M195 612L530 844"/><path d="M0 640H390M0 676H390M0 724H390M0 790H390"/></g>
<rect x="0" y="606" width="390" height="10" fill="#5ff4ff" opacity=".3"/><rect x="0" y="609.5" width="390" height="3" fill="#eaffff"/>
<path d="M96 196L40 844H190Z" fill="#bff8ff" opacity=".06"/><path d="M294 196L200 844H350Z" fill="#ffc8f4" opacity=".06"/>
</svg>'''.replace('ARCHZ', ARCH + 'Z').replace('ARCH', ARCH)
# ---- deep space behind the window: a still nebula and a small teal moon ----
SKY = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="none">
<defs>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset=".2" stop-color="#03021a"/><stop offset=".55" stop-color="#0e0738"/><stop offset=".74" stop-color="#2a0e66"/></linearGradient>
<radialGradient id="n"><stop offset="0" stop-color="#9a5cff" stop-opacity=".5"/><stop offset="1" stop-color="#9a5cff" stop-opacity="0"/></radialGradient>
<radialGradient id="n2"><stop offset="0" stop-color="#2ad8d0" stop-opacity=".28"/><stop offset="1" stop-color="#2ad8d0" stop-opacity="0"/></radialGradient>
<radialGradient id="m" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#d8fbff"/><stop offset=".5" stop-color="#3ad8d0"/><stop offset="1" stop-color="#0a4a7a"/></radialGradient>
</defs>
<rect width="390" height="844" fill="url(#s)"/>
<ellipse cx="120" cy="430" rx="150" ry="110" fill="url(#n)" transform="rotate(-24 120 430)"/><ellipse cx="280" cy="300" rx="110" ry="80" fill="url(#n2)"/><ellipse cx="250" cy="560" rx="120" ry="60" fill="url(#n)" opacity=".6"/>
<circle cx="292" cy="512" r="15" fill="url(#m)"/><circle cx="288" cy="507" r="3" fill="#0a4a7a" opacity=".35"/><circle cx="297" cy="517" r="2" fill="#0a4a7a" opacity=".3"/>
</svg>'''
# ---- two star tiles (they repeat sideways, so they can drift for ever) ----
def stars(seed, n, w, h, big):
    rnd = random.Random(seed); out = []
    for _ in range(n):
        x, y, r = rnd.uniform(4, w - 4), rnd.uniform(4, h - 4), rnd.choice([0.7, 0.9, 1.1, 1.3] + ([1.7, 2.0] if big else []))
        c = rnd.choice(['#fff', '#fff', '#fff', '#bff4ff', '#ffd0f4', '#ffe9a0']); o = rnd.choice(['.55', '.75', '.9', '1'])
        out.append('<circle cx="%.0f" cy="%.0f" r="%s" fill="%s" opacity="%s"/>' % (x, y, r, c, o))
    if big:   # three four-point glints
        for _ in range(3):
            x, y, s = rnd.uniform(20, w - 20), rnd.uniform(20, h - 60), rnd.uniform(4, 6)
            out.append('<path d="M%.0f %.1fL%.1f %.0fL%.0f %.1fL%.1f %.0fZ" fill="#fff" opacity=".9"/>' % (x, y - s, x + s * 0.22, y, x, y + s, x - s * 0.22, y))
            out.insert(0, ''); out.append('<path d="M%.1f %.0fL%.0f %.1fL%.1f %.0fL%.0f %.1fZ" fill="#fff" opacity=".9"/>' % (x - s, y, x, y - s * 0.22, x + s, y, x, y + s * 0.22))
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" preserveAspectRatio="none">%s</svg>' % (w, h, ''.join(out))
FAR, NEAR = stars(11, 46, 300, 440, False), stars(29, 22, 300, 440, True)
# ---- the ringed planet: a solid body; the ring goes behind the upper half and in front of the lower half ----
PLANET = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-84 -52 168 104">
<defs>
<radialGradient id="p" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#ffd9f3"/><stop offset=".38" stop-color="#ff62cc"/><stop offset=".78" stop-color="#b02aa6"/><stop offset="1" stop-color="#5a1a9a"/></radialGradient>
<linearGradient id="q" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff9a3d"/></linearGradient>
<clipPath id="c"><circle r="42"/></clipPath>
</defs>
<g transform="rotate(-18)">
<ellipse rx="74" ry="16" fill="none" stroke="#c98a1a" stroke-width="8"/><ellipse rx="74" ry="16" fill="none" stroke="#8a4a10" stroke-width="2"/>
</g>
<circle r="42" fill="#7a1f9a"/><circle r="42" fill="url(#p)"/>
<g clip-path="url(#c)"><g transform="rotate(-18)">
<path d="M-50 -24Q0 -12 50 -24" fill="none" stroke="#ffb0ea" stroke-width="6" opacity=".55"/>
<path d="M-50 -9Q0 3 50 -9" fill="none" stroke="#a02aa0" stroke-width="5" opacity=".45"/>
<path d="M-50 22Q0 36 50 22" fill="none" stroke="#7a1f9a" stroke-width="7" opacity=".5"/>
<ellipse cy="9" rx="74" ry="16" fill="none" stroke="#2a0a50" stroke-width="7" opacity=".4"/>
</g><circle cx="16" cy="14" r="52" fill="none" stroke="#2a0a50" stroke-width="22" opacity=".28"/></g>
<g transform="rotate(-18)">
<path d="M-74 0A74 16 0 0 0 74 0" fill="none" stroke="url(#q)" stroke-width="8" stroke-linecap="round"/>
<path d="M-74 0A74 16 0 0 0 74 0" fill="none" stroke="#fff8d0" stroke-width="1.6" opacity=".9" transform="translate(0 -2.4)"/>
<path d="M-74 0A74 16 0 0 0 74 0" fill="none" stroke="#a85a10" stroke-width="1.6" opacity=".7" transform="translate(0 1.2)"/>
</g>
</svg>'''
# the planet as it was first drawn (you could see through it)
PLANET_OLD = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-84 -52 168 104">
<defs><radialGradient id="p" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffd0f0"/><stop offset=".45" stop-color="#ff5ac8"/><stop offset="1" stop-color="#5a1a9a"/></radialGradient></defs>
<circle r="44" fill="url(#p)"/><ellipse rx="74" ry="15" fill="none" stroke="#ffe27a" stroke-width="5" transform="rotate(-18)" opacity=".95"/><path d="M-42 -6 A44 44 0 0 1 42 -14" fill="none" stroke="url(#p)" stroke-width="9"/>
</svg>'''
SOLID = False   # (the planet fix is its own step)
if not SOLID: PLANET = PLANET_OLD
# ---- a small spiral galaxy (turns slowly) ----
GALAXY = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">
<defs><radialGradient id="k"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="#ffe9c0" stop-opacity=".95"/><stop offset=".5" stop-color="#b98bff" stop-opacity=".35"/><stop offset="1" stop-color="#5ff4ff" stop-opacity="0"/></radialGradient></defs>
<circle r="46" fill="url(#k)" opacity=".7"/>
<g fill="none" stroke-linecap="round">
<path d="M0 0C10 -14 30 -12 36 4C40 18 28 32 12 34" stroke="#d8c4ff" stroke-width="5" opacity=".55"/>
<path d="M0 0C-10 14 -30 12 -36 -4C-40 -18 -28 -32 -12 -34" stroke="#d8c4ff" stroke-width="5" opacity=".55"/>
<path d="M0 0C14 8 14 26 0 30C-14 34 -28 24 -30 10" stroke="#9fe9ff" stroke-width="3" opacity=".5"/>
<path d="M0 0C-14 -8 -14 -26 0 -30C14 -34 28 -24 30 -10" stroke="#9fe9ff" stroke-width="3" opacity=".5"/>
</g>
<g fill="#fff"><circle cx="22" cy="-18" r="1.1"/><circle cx="-24" cy="16" r="1.1"/><circle cx="10" cy="28" r=".9"/><circle cx="-12" cy="-28" r=".9"/><circle cx="34" cy="10" r=".8"/><circle cx="-34" cy="-10" r=".8"/></g>
<circle r="5" fill="#fff"/>
</svg>'''
S = ':root.stage-on #stage :is(.stg-close, .stg-wide)'
CSS = '''/* ==== STUDIO:BEGIN (written by tools/build-studio-css.py - edit the script, not this block) ====
   THE ORBITING STUDIO, EVERYWHERE. The close and the wide shot are no longer the stage photos (data/stage/*.webp stay in the folder; only the
   blurred one is still shown, behind gameplay): both are the same drawn alien TV studio the opener introduced - a tall arched observation window
   edged by a magenta and a cyan neon tube, light strips up the walls, a glossy floor with a teal grid - so the opener, the round cards, the
   Mystery Game reveal, the outro and the results all stand in one room and a cut from wide to close changes nothing. The window is a hole in the
   wall drawing; behind it, back to front: deep space, far stars, a still nebula and a teal moon, near stars, a small spiral galaxy, the ringed
   planet. The sign is a neon plate. Everything is placed on a 390 x 844 plate that covers the screen, so the layers stay registered at any size. */
S{ background:#03021a !important; isolation:isolate; }
S .stg-plate{ --pw:max(100cqw, 46.209cqh); left:50% !important; top:50% !important; right:auto !important; bottom:auto !important; width:var(--pw) !important; height:calc(var(--pw) * 2.16411) !important;
  margin:calc(var(--pw) * -1.082055) 0 0 calc(var(--pw) / -2) !important; aspect-ratio:auto !important; animation:none !important; transform:none !important; translate:none !important;
  background:SKY 0 0 / 100% 100% no-repeat; }
S :is(.stg-img, .stg-panel){ display:none !important; }
/* far stars (behind the nebula's glow is fine: they sit under the plate's own picture only where it is clear) and near stars */
S .stg-plate::before, S .stg-plate::after, S .stg-glow::before, S .stg-sweep::before{ content:''; position:absolute; pointer-events:none; }
S .stg-plate::before{ z-index:0; left:14%; top:22%; width:144%; height:51.5%; background:FAR 0 0 / 50% 100% repeat-x; }
S .stg-sweep{ z-index:1; left:14%; top:22%; width:144%; height:51.5%; opacity:1 !important; transform:none; animation:none; background:NEAR 0 0 / 50% 100% repeat-x !important; display:block !important; }
S .stg-sweep::before{ left:6.2%; top:17%; width:16%; aspect-ratio:1; background:GALAXY center / contain no-repeat; }
S .stg-glow{ z-index:2; left:42.6% !important; top:31.5% !important; width:43% !important; height:12.32% !important; border-radius:0; opacity:1 !important; animation:none; background:PLANET center / contain no-repeat !important; }
S .stg-plate::after{ z-index:3; inset:0; background:WALL 0 0 / 100% 100% no-repeat; }
/* the sign: a neon plate (it stays put on the screen, clear of the opener's ceiling beam, whatever the plate's crop) */
S .stg-sign{ z-index:4; left:50% !important; top:calc(86px + env(safe-area-inset-top) + (var(--pw) * 2.16411 - 100cqh) / 2) !important; width:min(76cqw, 300px) !important; height:84px !important; margin-left:calc(min(76cqw, 300px) / -2); gap:6px; justify-content:center; box-sizing:border-box;
  border:3px solid #ff4fd8; border-radius:18px; outline:1px solid rgba(255,255,255,0.8); outline-offset:-2.5px; background:linear-gradient(180deg, rgba(26,12,90,0.96), rgba(8,4,40,0.97));
  box-shadow:0 0 20px 3px rgba(255,79,216,0.75), inset 0 0 16px rgba(255,79,216,0.35); }
S .stg-sign .stg-sub{ font:900 12px/1 var(--f-body, Inter, sans-serif) !important; letter-spacing:4px !important; padding-left:4px; color:#5ff4ff !important; text-shadow:0 0 8px rgba(95,244,255,0.8) !important; -webkit-text-stroke:0 !important; background:none !important; -webkit-text-fill-color:currentColor !important; }
S .stg-sign .stg-main{ font-size:min(48cqh, 13.4cqw) !important; letter-spacing:3px !important; padding-left:3px; color:#ffffff !important; -webkit-text-stroke:0 !important; background:none !important; -webkit-text-fill-color:currentColor !important;
  text-shadow:0 0 6px #ffffff, 0 0 16px #ff4fd8, 0 0 30px #ff4fd8, 0 3px 0 rgba(10,0,40,0.8) !important; }
S .stg-sign.long .stg-main{ font-size:min(44cqh, 10.4cqw) !important; letter-spacing:2px !important; }
S .stg-sign.xlong .stg-main{ font-size:min(38cqh, 8.4cqw) !important; letter-spacing:1px !important; }
S .stg-sign.long .stg-sub{ letter-spacing:3px !important; }
S .stg-sign .stg-ep{ color:#5ff4ff; text-shadow:0 0 8px rgba(95,244,255,0.8); font-size:min(17cqh, 6cqw); }
@media (max-height:700px){
  S .stg-sign{ top:calc(78px + env(safe-area-inset-top) + (var(--pw) * 2.16411 - 100cqh) / 2) !important; width:min(70cqw, 250px) !important; height:66px !important; margin-left:calc(min(70cqw, 250px) / -2); gap:4px; }
  S .stg-sign .stg-sub{ font-size:10px !important; letter-spacing:3px !important; }
}
/* ==== STUDIO:END ==== */
'''
CSS = CSS.replace('SKY', uri(SKY)).replace('FAR', uri(FAR)).replace('NEAR', uri(NEAR)).replace('GALAXY', uri(GALAXY)).replace('PLANET', uri(PLANET)).replace('WALL', uri(WALL))
CSS = re.sub(r'(?m)^S |, S ', lambda m: m.group(0).replace('S ', S + ' '), CSS).replace('\nS{', '\n' + S + '{').replace('  S ', '  ' + S + ' ')
p = os.path.join(ROOT, 'lib/stage.css'); src = open(p).read()
a, b = src.find('/* ==== STUDIO:BEGIN'), src.find('/* ==== STUDIO:END ==== */')
src = (src[:a] if a >= 0 else src.rstrip('\n') + '\n\n') + CSS + (src[b + len('/* ==== STUDIO:END ==== */'):].lstrip('\n') if b >= 0 else '')
open(p, 'w').write(src); print('lib/stage.css: studio block', len(CSS), 'bytes')
