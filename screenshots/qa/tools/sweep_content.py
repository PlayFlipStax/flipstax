import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
v = View(390, 844); v.load(debug=True)
R = v.J(r"""(()=>{ const p = window.__debug.getContentPools(); const out = {};
  // VS cards: duplicates, missing names/emoji, same thing on both sides
  for (const mode of Object.keys(p.cards)){
    const cards = p.cards[mode], ids = new Set(), pairs = new Map(), issues = [];
    cards.forEach(c=>{ if (ids.has(c.id)) issues.push('dup id ' + c.id); ids.add(c.id);
      const a = (c.a && (c.a.name || c.a.label || c.a.text)) || c.a, b = (c.b && (c.b.name || c.b.label || c.b.text)) || c.b;
      const key = [String(a).toLowerCase(), String(b).toLowerCase()].sort().join(' | ');
      if (pairs.has(key)) issues.push('dup matchup: ' + key); pairs.set(key, c.id);
      if (!a || !b) issues.push('missing side ' + c.id); if (String(a).toLowerCase() === String(b).toLowerCase()) issues.push('same both sides ' + c.id);
      if (!c.category) issues.push('no category ' + c.id); });
    out['cards ' + mode] = { count: cards.length, issues: issues.slice(0, 12), issueCount: issues.length, sample: JSON.stringify(cards[0]).slice(0, 160) };
  }
  // Trivia: generate many from every subject in both pools
  const subjects = ['math','geography','english','history','science','art','music','health'];
  const tissues = [], seen = {};
  subjects.forEach(sub=> ['daily','infinity'].forEach(pool=>{ for (let i = 0; i < 400; i++){ let q; try{ q = p.gen(sub, pool); }catch(e){ tissues.push(sub + '/' + pool + ' threw ' + e.message); break; }
    if (!q || !q.question){ tissues.push(sub + ' empty'); continue; }
    seen[sub + '/' + pool] = (seen[sub + '/' + pool] || new Set()).add(q.question);
    const o = q.opts || [];
    if (o.length !== 4) tissues.push(sub + ': ' + o.length + ' options: ' + q.question);
    if (new Set(o.map(x=> String(x).trim().toLowerCase())).size !== o.length) tissues.push(sub + ': duplicate options: ' + q.question + ' ' + JSON.stringify(o));
    if (!(q.correctIdx >= 0 && q.correctIdx < o.length)) tissues.push(sub + ': bad answer index: ' + q.question);
    if (o.some(x=> x == null || String(x).trim() === '' || /undefined|NaN|null/.test(String(x)))) tissues.push(sub + ': empty/odd option: ' + q.question + ' ' + JSON.stringify(o));
    if (/undefined|NaN/.test(q.question)) tissues.push(sub + ': odd question: ' + q.question); } }));
  out.trivia = { distinctQuestions: Object.fromEntries(Object.entries(seen).map(([k, s])=> [k, s.size])), issues: [...new Set(tissues)].slice(0, 20), issueCount: new Set(tissues).size };
  return out; })()""")
print(json.dumps(R, indent=1, ensure_ascii=False)); print('errors', v.qa()['errors'])
