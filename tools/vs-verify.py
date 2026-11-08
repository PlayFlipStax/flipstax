# FlipStax - the VS card check (Oct 24). Loads the game (?debug=fast on the local dev server) and fails (exit 1) if any card in the
# pool has an empty emoji (or the old sparkle placeholder) on either side, or the same emoji on both sides (data/vs/vs-emoji.js).
# Also prints the pool size and how many sides got their category's fallback. Run it after every import.
#   screenshots/qa/tools/venv/bin/python tools/vs-verify.py
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots/qa/tools'))
from wkh import View, ensure_server
ensure_server(); v = View(390, 844); v.load(debug=True)
r = v.J("""(()=>{ const P = window.__debug.cardPools(), E = window.FLIPSTAX_VS_EMOJI, cards = P.daily.map(c=> ({ id:c.id, a:c.a, b:c.b, category:c.category, glyphA:c.glyphA, glyphB:c.glyphB }));
  return { n:cards.length, problems:E.problems(cards), unknownCats:[...new Set(cards.map(c=> c.category).filter(k=> !E.fallback[k]))] }; })()""")
print('cards in the pool:', r['n'])
if r['unknownCats']: print('categories with no fallback emoji (they get the dice):', r['unknownCats'])
if r['problems']:
    print('FAIL - %d problems' % len(r['problems'])); [print(' ', p) for p in r['problems'][:30]]; sys.exit(1)
print('OK - every card has an emoji on both sides and the two differ')
