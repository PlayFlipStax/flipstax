# Builds data/zap-words.txt for Zap Words (F10): real, common English words only.
# A word counts when it is a lowercase entry in Webster's 1934 list (/usr/share/dict/web2, public domain) or a plain
# -s / -es / -ed / -ing / -er / -est form of one, AND macOS's built-in English word embedding (NaturalLanguage,
# ~57k common words) knows it, AND the macOS English spell checker accepts it; 3-8 letters, at least one vowel or y,
# not a proper name (/usr/share/dict/propernames) unless it is also an ordinary lowercase word, not on the blocklist.
# Run with the QA venv (PyObjC):  ./venv/bin/python build_zap_words.py
import objc, AppKit
objc.loadBundle('NaturalLanguage', globals(), bundle_path='/System/Library/Frameworks/NaturalLanguage.framework')
emb = objc.lookUpClass('NLEmbedding').wordEmbeddingForLanguage_('en')
sc = AppKit.NSSpellChecker.sharedSpellChecker()
def spelled(w):
    r = sc.checkSpellingOfString_startingAt_language_wrap_inSpellDocumentWithTag_wordCount_(w, 0, 'en', False, 0, None)
    return r[0].location == AppKit.NSNotFound
BLOCK = set('''nigger nigga faggot fag kike spic chink cunt fuck shit whore slut bitch bastard dyke retard twat wank wanker piss
arse ass asshole cock dick prick tits tit boob boobs negro coon gook wop dago honky jap paki homo lesbo tranny pussy damn hell crap
turd rape rapist raped raping nazi nazis porn sexy sex kill killed killer slave slaves drug drugs gay gays queer'''.split())
web2 = [l.strip() for l in open('/usr/share/dict/web2')]
base = set(w for w in web2 if w.isalpha() and w.islower())
names = set(l.strip().lower() for l in open('/usr/share/dict/propernames'))
cands = set()
for w in base:
    for f in (w, w + 's', w + 'es', w + 'ed', w + 'd', w + 'ing', (w[:-1] + 'ing') if w.endswith('e') else None, w + 'er', w + 'est'):
        if f and 3 <= len(f) <= 8: cands.add(f)
keep = []
for w in sorted(cands):
    if w in BLOCK or not any(c in 'aeiouy' for c in w): continue
    if w in names and w not in base: continue
    if not emb.containsString_(w): continue
    if not spelled(w): continue
    keep.append(w)
open('/Users/rickymartin/FlipStax/data/zap-words.txt', 'w').write('\n'.join(keep) + '\n')
print(len(keep), 'words')
