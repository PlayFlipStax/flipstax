import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
v = View(390, 844); v.load(debug=False); spin(2.5)
print(json.dumps({ 'badge': v.js("(()=>{ const i = document.querySelector('.home-logo-img'); return i.naturalWidth + 'x' + i.naturalHeight + ' shown ' + Math.round(i.getBoundingClientRect().width) + 'px'; })()"),
  'icon links': v.J("[...document.querySelectorAll('link[rel*=icon]')].map(l=> l.getAttribute('href'))"),
  'preview tags': v.J("[...document.querySelectorAll('meta[property=\"og:image\"], meta[name=\"twitter:image\"]')].map(m=> m.content)"),
  'errors': v.qa()['errors'] }))
v.snap(None, path=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sweep', 'prepush-splash.png'))
