import os, sys, json, datetime
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin
CLOCK = r"""(function(){ const RD = Date; let shift = 0; class FD extends RD { constructor(...a){ if (a.length) super(...a); else super(RD.now() + shift); } static now(){ return RD.now() + shift; } }
  window.Date = FD; window.__setLocal = (y, mo, d, h, mi)=>{ shift = new RD(y, mo - 1, d, h, mi).getTime() - RD.now(); }; })();"""
start = datetime.date(2026, 9, 1); days = 365 * 3 + 120
def schedule(page):
    v = View(390, 844, CLOCK); v.load(debug=True, page=page)
    # walk the days in-page (one call), reading today's word for each
    return v.J("""(()=>{ const out = []; const d0 = new Date(2026, 8, 1, 12, 0);
      for (let k = 0; k < %d; k++){ const t = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + k, 12, 0); window.__setLocal(t.getFullYear(), t.getMonth() + 1, t.getDate(), 12, 0); out.push(window.__debug.todayWord().word); }
      return out; })()""" % days)
old, new = schedule('.tmp_before_words.html'), schedule('flipstax.html')
d = lambda k: str(start + datetime.timedelta(days=k))
lap1 = (datetime.date(2026, 12, 28) - start).days
changed_before = [d(k) for k in range(lap1) if old[k] != new[k]]
def close_repeats(ws, frm):
    last, out = {}, []
    for k in range(len(ws)):
        w = ws[k]
        if w in last and k - last[w] < 30 and k >= frm: out.append((d(k), w, k - last[w]))
        last[w] = k
    return out
v2start = (datetime.date(2026, 10, 1) - start).days
laps_ok = all(sorted(new[v2start + c * 88: v2start + (c + 1) * 88]) == sorted(set(new[v2start: v2start + 88])) for c in range((len(new) - v2start) // 88))
print(json.dumps({ 'days compared': days, 'first changed day': d(lap1),
  'days before Dec 28 that changed (must be none)': changed_before[:5],
  'repeats within 30 days - old schedule': len(close_repeats(old, lap1)), 'shortest - old': min([g for _, _, g in close_repeats(old, lap1)] or [None]),
  'repeats within 30 days - new schedule': close_repeats(new, lap1)[:5],
  'same word two days running - new': sum(1 for k in range(1, len(new)) if new[k] == new[k - 1]),
  'every 88-day cycle uses all 88 words once': laps_ok,
  'Dec 26 .. Jan 3 (old)': old[lap1 - 2: lap1 + 7], 'Dec 26 .. Jan 3 (new)': new[lap1 - 2: lap1 + 7] }, indent=1))
