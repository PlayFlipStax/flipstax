# Celebrity add-on (flipstax_celebrity_addon.md): dedupe, then add to both pools with emoji.
import re, sys, unicodedata
p = '/Users/rickymartin/FlipStax/flipstax.html'; s = open(p).read()
def norm(x):
    x = unicodedata.normalize('NFKD', x).encode('ascii', 'ignore').decode().lower()
    x = re.sub(r"[^a-z0-9 ]", '', x).strip(); x = re.sub(r'^(the|an|a) ', '', x)
    return re.sub(r's\b', '', x).replace(' ', '')
def key(a, b): return '|'.join(sorted([norm(a), norm(b)]))
def unq(x): return x.encode().decode('unicode_escape').encode('utf-16', 'surrogatepass').decode('utf-16') if '\\u' in x else x.replace("\\'", "'")
existing = {}
for m in re.finditer(r"\[\s*'([a-z]+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'", s):
    a, b = unq(m.group(2)), unq(m.group(3)); existing[key(a, b)] = (m.group(1), a, b)
W, P = 'who', 'pick'
B = [('celebrity','Taylor Swift','Travis Kelce',W,'🎤','🏈'), ('celebrity','Kim Kardashian','Kylie Jenner',W,'💋','💄'),
     ('celebrity','Zendaya','Florence Pugh',W,'🕸️','🌸'), ('celebrity','Blake Lively','Gwyneth Paltrow',W,'👱‍♀️','🌿'),
     ('celebrity','Celebrity Feuds','Celebrity Friendships',P,'😤','🤝'), ('celebrity','Paparazzi Photos','Posted Selfies',P,'📸','🤳'),
     ('celebrity','The Met Gala','The Oscars Red Carpet',P,'👑','🏆'), ('celebrity','Celebrity Breakup Drama','Celebrity Weddings',P,'💔','💒'),
     ('celebrity','Tabloid Headlines','Verified Statements',P,'📰','✅'), ('celebrity','Old Hollywood Glamour','Modern Influencer Fame',P,'🎞️','📱')]
add = []
for r in B:
    if key(r[1], r[2]) in existing: print('already in:', r[1], 'vs', r[2], existing[key(r[1], r[2])])
    else: add.append(r)
print('adding', len(add))
if '--plan' in sys.argv: sys.exit()
q = lambda x: "'" + x.replace("\\", "\\\\").replace("'", "\\'") + "'"
# Infinity has 1 celebrity card, Daily 2 - start with Infinity so it ends 6 / 7
inf = [r for i, r in enumerate(add) if i % 2 == 0]; daily = [r for i, r in enumerate(add) if i % 2 == 1]
for name, rows in (('DAILY_PAIRS_RAW', daily), ('INFINITY_PAIRS_RAW', inf)):
    i = s.index('const %s = [' % name); j = s.index('\n  ];', i)
    s = s[:j] + '\n    // Celebrity add-on (Oct 2026)\n' + '\n'.join("    [%s, %s, %s, %s]," % (q(c), q(a), q(b), q(k)) for c, a, b, k, ga, gb in rows) + s[j:]
i = s.index('const ITEM_GLYPHS = {'); j = s.index('\n  };', i)
known = { unq(k) for k in re.findall(r"'((?:[^'\\]|\\.)*)'\s*:", s[i:j]) }
new = {}
for c, a, b, k, ga, gb in add:
    for n, g in ((a, ga), (b, gb)):
        if n not in known and n not in new: new[n] = g
body = s[i:j].rstrip(); sep = '' if body.endswith(',') else ','
s = s[:i] + body + sep + '\n    // Celebrity add-on (Oct 2026)\n    ' + ', '.join('%s:%s' % (q(n), q(g)) for n, g in new.items()) + s[j:]
open(p, 'w').write(s)
print('daily +', len(daily), '| infinity +', len(inf), '| new emoji names', len(new), '| already had emoji:', sorted(n for r in add for n in (r[1], r[2]) if n in known))
