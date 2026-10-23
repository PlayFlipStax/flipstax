// FlipStax - the VS card importer (Oct 23). Runs inside the game page (a dev server with ?debug=fast) after
// tools/vs-import-rules.js and tools/vs-era-tags.js are loaded; tools/vs-import.ps1 drives it over CDP and writes the files.
//   1. reads the source text files named in the rules (category | left | emoji | right | emoji | era, or the Gemini
//      form category | left | right - which gets emoji and an era from the rules);
//   2. drops pairs already in the pool (ignoring order, case, accents and punctuation), pairs repeated inside the sources
//      and the pairs the owner holds back (rules.skip);
//   3. gives every card already in the pool an era (the old hand tags mapped to the new scale, then the rules' words,
//      else timeless);
//   4. leaves the report in window.__vsImport: { js (the text of data/vs-cards-new.js), report }.
// Idempotent: cards from an earlier import (ids n-*) are left out of the "existing" pool it compares against.
(async function(){
  const R = window.VS_IMPORT_RULES, TAGS = window.VS_ERA_TAGS || {};
  const ORDER = { timeless:0, '80s':1, '90s':2, '2000s':3, '2010s':4, now:5 };
  const strip = s=> String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const vsKey = (a, b)=> [strip(a), strip(b)].sort().join('|');
  const nm = s=> String(s || '').trim().toLowerCase().replace(/’/g, "'");
  const list = s=> new Set(String(s).split('|').map(nm).filter(Boolean));
  const NOW = list(R.erasNow), E2010 = list(R.eras2010), E80 = list(R.eras80), E90 = list(R.eras90), TIMELESS = list(R.timelessNames);
  // the era of one side's name, or null when the name has none
  function nameEra(n){
    const k = nm(n);
    if (NOW.has(k)) return 'now';
    if (E2010.has(k)) return '2010s';
    if (E80.has(k)) return '80s';
    if (E90.has(k)) return '90s';
    if (TIMELESS.has(k)) return 'timeless';
    const t = TAGS[k];
    return t === 'C' ? '80s' : t === 'M' ? '2000s' : t === 'N' ? '2010s' : null;
  }
  // a card's era: its newer side; a side with no era counts as timeless; neither side -> the rules' words -> timeless
  function cardEra(c){
    const ea = nameEra(c.a), eb = nameEra(c.b);
    if (ea || eb){ const x = ea || 'timeless', y = eb || 'timeless'; return ORDER[x] >= ORDER[y] ? x : y; }
    const text = nm(c.a) + ' | ' + nm(c.b);
    for (const [era, words] of R.keywordEras){ if (words.split('|').some(w=> text.indexOf(w) >= 0)) return era; }
    return 'timeless';
  }
  const pool = window.__debug.cardPools().daily.filter(c=> !/^n-/.test(c.id));
  const existing = new Set(pool.map(c=> vsKey(c.a, c.b)));
  const skipKeys = new Set(R.skip.map(p=> vsKey(p[0], p[1])));
  const report = { geminiRows: {}, sources: [], read: 0, added: 0, skippedDuplicate: 0, skippedInside: 0, held: [], badRows: [], byCategory: {}, newCategories: [], erasExisting: {}, erasNew: {} };
  const out = [], seen = new Set();
  // the Gemini eras by row number: category -> { row -> era }, each row listed exactly once
  const geminiEra = {};
  for (const cat of Object.keys(R.geminiEras)){
    geminiEra[cat] = {};
    for (const era of Object.keys(R.geminiEras[cat])) for (const n of R.geminiEras[cat][era]){
      if (geminiEra[cat][n]) report.badRows.push("row " + n + " of " + cat + " is listed under two eras");
      geminiEra[cat][n] = era;
    }
  }
  for (const src of R.sources){
    let text;
    try{ const r = await fetch('/' + src.file + '?t=' + Date.now()); if (!r.ok) throw new Error(r.status); text = await r.text(); }
    catch(e){ if (!src.optional) report.badRows.push('missing source ' + src.file); continue; }
    const rows = text.split(/\r?\n/).map(l=> l.trim()).filter(l=> l && l[0] !== '#');
    report.sources.push({ file: src.file, rows: rows.length });
    const perCat = {}, rot = {};
    rows.forEach(line=>{
      const f = line.split('|').map(x=> x.trim());
      report.read++;
      let cat, a, ga, b, gb, era;
      if (src.gemini){
        if (f.length !== 3){ report.badRows.push(line); return; }
        [cat, a, b] = f;
        report.geminiRows[cat] = (report.geminiRows[cat] || 0) + 1;
        const set = R.emoji[cat] || R.emoji._default, k = rot[cat] = (rot[cat] || 0);
        ga = set[k % set.length]; gb = set[(k + 1) % set.length]; rot[cat] = k + 2;
        const row = report.geminiRows[cat];   // (1-based, in file order within the category)
        era = geminiEra[cat] && geminiEra[cat][row];
        if (!(era in ORDER)){ report.badRows.push('no era for row ' + row + ' of ' + cat + ': ' + line); return; }
      } else {
        if (f.length !== 6){ report.badRows.push(line); return; }
        [cat, a, ga, b, gb, era] = f;
        if (!(era in ORDER)){ report.badRows.push('bad era "' + era + '": ' + line); return; }
      }
      const key = vsKey(a, b);
      if (skipKeys.has(key)){ report.held.push(a + ' vs ' + b); return; }
      if (existing.has(key)){ report.skippedDuplicate++; return; }
      if (seen.has(key)){ report.skippedInside++; return; }
      seen.add(key); out.push([cat, a, ga, b, gb, era]);
      report.byCategory[cat] = (report.byCategory[cat] || 0) + 1; report.erasNew[era] = (report.erasNew[era] || 0) + 1;
    });
  }
  report.added = out.length;
  // the Gemini era lists must be exactly as long as their rows
  for (const cat of Object.keys(R.geminiEras)){
    const want = Object.keys(geminiEra[cat]).length;
    if ((report.geminiRows[cat] || 0) !== want) report.badRows.push("Gemini era list for " + cat + " has " + want + " eras for " + (report.geminiRows[cat] || 0) + " rows");
  }
  const known = new Set(pool.map(c=> c.category));
  report.newCategories = [...new Set(out.map(r=> r[0]))].filter(c=> !known.has(c));
  const eras = {};
  pool.forEach(c=>{ const e = cardEra(c); eras[vsKey(c.a, c.b)] = e; report.erasExisting[e] = (report.erasExisting[e] || 0) + 1; });
  const q = s=> JSON.stringify(s);
  const js = '// FlipStax - imported VS cards and eras (generated by tools/vs-import.js from the rules in tools/vs-import-rules.js; do not edit by hand).\n' +
    '// FLIPSTAX_VS_NEW: [category, left, emoji, right, emoji, era]; FLIPSTAX_VS_ERAS: pair key (sorted, lower case, letters and digits only) -> era for the cards already in the pool.\n' +
    'window.FLIPSTAX_VS_NEW = [\n' + out.map(r=> '  ' + q(r)).join(',\n') + '\n];\n' +
    'window.FLIPSTAX_VS_ERAS = {\n' + Object.keys(eras).sort().map(k=> '  ' + q(k) + ':' + q(eras[k])).join(',\n') + '\n};\n';
  window.__vsImport = { js, report, existingCount: pool.length };
  return JSON.stringify({ added: out.length, existing: pool.length });
})()
