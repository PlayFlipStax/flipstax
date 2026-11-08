// FlipStax - the VS card export (Oct 23). Runs in the game page (?debug=fast); tools/vs-import.ps1 writes the result to
// data/vs-export.txt. One line per card: category | left | emoji | right | emoji | era; the counts per category and per era
// sit in the header. window.__export.text is the file; the returned JSON is a short summary.
(function(){
  const cards = window.__debug.cardPools().daily;
  const clean = s=> String(s == null ? '' : s).replace(/\s*\|\s*/g, ' / ').replace(/\s+/g, ' ').trim();
  const ORDER = ['80s', '90s', '2000s', '2010s', 'now', 'timeless'];
  const byCat = {}, byEra = {}; let noEra = 0;
  const rows = cards.map(c=>{
    byCat[c.category] = (byCat[c.category] || 0) + 1;
    if (!c.era) noEra++; else byEra[c.era] = (byEra[c.era] || 0) + 1;
    return [c.category, c.a, c.glyphA, c.b, c.glyphB, c.era].map(clean).join(' | ');
  });
  const cats = Object.keys(byCat).sort((x, y)=> byCat[y] - byCat[x] || x.localeCompare(y));
  const imported = cards.filter(c=> /^n-/.test(c.id)).length;
  const head = [
    '# FlipStax - every VS card, one pool for Daily and Infinity (' + cards.length + ' cards; ' + imported + ' imported on Oct 23 by tools/vs-import.js).',
    '# Format: category | left | emoji | right | emoji | era',
    '# Era: 80s, 90s, 2000s, 2010s, now or timeless - the era of the newer side (a side with no era counts as timeless).',
    '#   Eras come from tools/vs-import-rules.js (and the old hand tags in tools/vs-era-tags.js); change them there and run tools/vs-import.ps1 again.',
    '# Cards with no era: ' + noEra,
    '#',
    '# Per era:',
  ].concat(ORDER.map(e=> '#   ' + e + ': ' + (byEra[e] || 0)), ['#', '# Per category:'], cats.map(k=> '#   ' + k + ': ' + byCat[k]), ['#']);
  window.__export = { text: head.concat(rows).join('\n') + '\n', total: cards.length, noEra, byCat, byEra, imported };
  return JSON.stringify({ total: cards.length, imported, noEra, cats: cats.length });
})()
