/* FlipStax - the Part E Mystery Games (Oct 2026).
   Each game registers here; flipstax.html's runMiniGame gives it a full-screen stage in its own colour world (a
   bulb-lit sign, a rule line, a timer bar, a score pill) and an `api`:
     api.stage            the element to build the game in
     api.timer(ms, cb)    starts the timer bar (the last 3 s tick); returns { stop(), left(), add(ms) }
     api.score(n)         shows the running score
     api.flash('win'|'lose'), api.sfx.*, api.FX, api.fxLayer, api.say(text), api.mood(m), api.hostSvg()
     api.rng(), api.shuffle(array)   seeded by the episode
     api.lite, api.reduced           lite mode / reduced motion: no heavy or moving extras
     api.finish({ pts, win, line })  ends the game: points (the act's multiplier is applied), a key for a win
   Games: { name, colors:[light, mid, dark], bulb, rule, available(), run(api) }. Motion is transform and opacity. */
(function(){
  const MG = window.MiniGames = { games: {}, register(key, g){ this.games[key] = g; } };
  const el = (tag, cls, html)=>{ const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (t)=> String(t).replace(/[&<>"]/g, c=> ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  MG.util = { el, esc };

  // ---------------------------------------------------------------- E1. Peak or Plunge (higher or lower)
  // A thing and its number; the next thing's number is hidden: HIGHER or LOWER? 5 rounds, +10 each, 7 s a round.
  // World: coral sunset over navy peaks.
  const PP_ROUNDS = 5, PP_ROUND_MS = 7000;
  const ppFmt = (it)=> it.cat === 'year' ? String(it.value) : it.value.toLocaleString('en-US');
  MG.register('peakOrPlunge', {
    name: 'Peak or Plunge', colors: ['#ff9b7a', '#c2386a', '#16123f'], bulb: '#ffc2a8',
    rule: 'Is the next number HIGHER or LOWER?',
    host: 'Climb high or crash low, Earthling!',
    // In the rotation once PEAK_OR_PLUNGE_REVIEWED is true (checked Oct 16 - data/peak-or-plunge.txt); the TEST menu can always play it.
    available: ()=> window.PEAK_OR_PLUNGE_REVIEWED === true && Array.isArray(window.FLIPSTAX_PEAK_OR_PLUNGE) && window.FLIPSTAX_PEAK_OR_PLUNGE.length >= 20,
    run(api){
      const all = window.FLIPSTAX_PEAK_OR_PLUNGE, cats = ['height', 'year', 'count'];
      // G4 pairing rules: one category per game (heights with heights, years with years, counts with counts); two
      // neighbours never have the same number, and never a near-tie - they must differ by at least 10% (for years, 10%
      // of how long ago they were: 1961 vs 1969 is fine, 1989 vs 1991 is too close).
      const NOW_YEAR = new Date().getFullYear();
      const size = (it)=> it.cat === 'year' ? Math.max(1, NOW_YEAR - it.value) : it.value;
      const fair = (a, b)=>{ const x = size(a), y = size(b); return x !== y && Math.abs(x - y) >= 0.1 * Math.max(x, y); };
      let chain = [];
      for (let tries = 0; tries < 40 && chain.length < PP_ROUNDS + 1; tries++){
        const cat = cats[Math.floor(api.rng() * cats.length)];
        const pool = api.shuffle(all.filter(x=> x.cat === cat)), c = [];
        // Greedy walk: each next item is the first unused one that makes a fair pair with the last.
        while (c.length < PP_ROUNDS + 1){
          const k = pool.findIndex(it=> !c.length || fair(c[c.length - 1], it));
          if (k < 0) break;
          c.push(pool.splice(k, 1)[0]);
        }
        if (c.length > chain.length) chain = c;
      }
      const s = api.stage;
      s.classList.add('pp-stage');
      s.innerHTML = '<div class="pp-card pp-known"></div><div class="pp-vs">HIGHER OR LOWER?</div><div class="pp-card pp-next"></div>' +
        '<div class="pp-btns"><button type="button" class="pp-btn hi">&#9650; HIGHER</button><button type="button" class="pp-btn lo">&#9660; LOWER</button></div>' +
        '<div class="pp-dots">' + Array.from({ length: PP_ROUNDS }, ()=> '<i></i>').join('') + '</div>';
      const known = s.querySelector('.pp-known'), next = s.querySelector('.pp-next'), btns = [...s.querySelectorAll('.pp-btn')], dots = [...s.querySelectorAll('.pp-dots i')];
      const card = (it, hide)=> '<span class="pp-glyph">' + it.glyph + '</span><span class="pp-name">' + esc(it.name) + '</span>' +
        '<span class="pp-val">' + (hide ? '<b class="pp-q">?</b>' : '<b>' + ppFmt(it) + '</b>') + (it.text ? ' <small>' + esc(it.text) + '</small>' : '') + '</span>';
      let round = 0, right = 0, locked = true, timer = null;
      const show = ()=>{
        known.innerHTML = card(chain[round]); next.innerHTML = card(chain[round + 1], true);
        if (!api.reduced){ next.animate([{ transform:'translateY(30px)', opacity:0 }, { transform:'none', opacity:1 }], { duration:280, easing:'ease-out' }); }
        locked = false; btns.forEach(b=> b.disabled = false);
        timer = api.timer(PP_ROUND_MS, ()=> pick(null));
      };
      const pick = (dir)=>{
        if (locked) return; locked = true; btns.forEach(b=> b.disabled = true); if (timer) timer.stop();
        const a = chain[round], b = chain[round + 1], ok = dir === 'hi' ? b.value > a.value : dir === 'lo' ? b.value < a.value : false;
        const v = next.querySelector('.pp-val b'); v.classList.remove('pp-q'); v.textContent = ppFmt(b);
        if (!api.reduced) v.animate([{ transform:'scale(1.8)', opacity:0 }, { transform:'scale(0.9)', opacity:1, offset:0.6 }, { transform:'scale(1)' }], { duration:380, easing:'ease-out' });
        next.classList.add(ok ? 'right' : 'wrong'); dots[round].classList.add(ok ? 'right' : 'wrong');
        if (ok){ right++; api.score(right * 10); api.sfx.ding(); api.flash('win'); }
        else { api.sfx.wrong(); api.flash('lose'); api.say((dir === null ? 'Too slow, Earthling! ' : '') + 'It was ' + (b.value > a.value ? 'HIGHER' : 'LOWER') + '!', 1400); }   // (A+: a miss always shows the right answer)
        api.hold(()=>{
          next.classList.remove('right', 'wrong'); round++;
          if (round >= PP_ROUNDS || round + 1 >= chain.length){
            api.finish({ pts: right * 10, win: right >= 3, line: right === PP_ROUNDS ? 'A perfect climb!' : right >= 3 ? 'Peak performance!' : 'What a plunge!' });
            return;
          }
          show();
        }, { lead:380 });   // (the number rolls in over 0.38 s, then the shared reveal hold)
      };
      btns[0].addEventListener('click', ()=>{ api.sfx.tap('top'); pick('hi'); });
      btns[1].addEventListener('click', ()=>{ api.sfx.tap('bottom'); pick('lo'); });
      show();
    },
  });

  // ---------------------------------------------------------------- E2. Snap Sort
  // A category; words drift across three lanes; tap the ones that belong (+4 each), skip the rest. A wrong tap costs a
  // second and the host says why it doesn't belong. 15 s. World: neon lime on black (a snapshot flash).
  // G6: difficulty follows the act - easy in Act 1, medium in Act 2, hard in Act 3 - and the hard tier only plays once
  // SNAP_SORT_REVIEWED is true (until then Act 3 gets a medium category; the TEST menu can force any tier).
  const SS_MS = 15000, SS_SPAWN = 1250, SS_CROSS = 4600;
  MG.register('snapSort', {
    name: 'Snap Sort', colors: ['#9fd43a', '#26440a', '#050802'], bulb: '#e4ff7a',
    rule: 'Tap only the ones that fit. A wrong tap costs a second!', host: 'Snap the right ones, skip the rest!',
    available: ()=> Array.isArray(window.FLIPSTAX_SNAP_SORT) && window.FLIPSTAX_SNAP_SORT.filter(c=> c.diff !== 'hard').length >= 10,
    tier: (act, forced)=>{
      if (forced) return forced;
      // (Run 4A: rounds r1-r6 - Rounds 1-2 easy, 3-4 medium, 5-6 hard; it plays behind Round 3's Mystery Door, so medium)
      const n = /^r\d$/.test(String(act)) ? +String(act).slice(1) : 0;
      const d = act === 'act1' || (n && n <= 2) ? 'easy' : act === 'act3' || n >= 5 ? 'hard' : 'medium';
      return d === 'hard' && window.SNAP_SORT_REVIEWED !== true ? 'medium' : d;
    },
    run(api){
      const list = window.FLIPSTAX_SNAP_SORT, tier = MG.games.snapSort.tier(api.act, api.opts && api.opts.diff);
      let pool = list.filter(x=> x.diff === tier);
      if (!pool.length) pool = list.filter(x=> x.diff !== 'hard');
      const c = pool[Math.floor(api.rng() * pool.length)];
      // Every item that belongs (3 to 6), and decoys to make up 10 words (4 at least).
      const yes = api.shuffle(c.yes).slice(0, 6), no = api.shuffle(c.no).slice(0, Math.max(4, 10 - yes.length));
      const words = api.shuffle(yes.map(w=> ({ w, ok:true })).concat(no.map(d=> ({ w: Array.isArray(d) ? d[0] : d, why: Array.isArray(d) ? d[1] : '', ok:false }))));
      const s = api.stage; s.classList.add('ss-stage');
      s.innerHTML = '<div class="ss-cat"><small>TAP THE · ' + tier.toUpperCase() + '</small>' + esc(c.cat.toUpperCase()) + '</div><div class="ss-field"></div><div class="ss-tally"></div>';
      const field = s.querySelector('.ss-field'), tally = s.querySelector('.ss-tally');
      let right = 0, wrong = 0, ended = false, k = 0;
      const anims = [], spawns = [];
      const lanes = [0.16, 0.5, 0.84];
      const spawn = (item, i)=>{
        if (ended) return;
        const b = el('button', 'ss-word' + (item.ok ? ' fits' : ''), esc(item.w)); b.type = 'button';
        b.style.top = (lanes[i % 3] * 100) + '%'; field.appendChild(b);
        const W = field.clientWidth, w = b.offsetWidth;
        const a = b.animate([{ transform:'translate(' + W + 'px,-50%)' }, { transform:'translate(' + (-w - 10) + 'px,-50%)' }], { duration: SS_CROSS, easing:'linear', fill:'forwards' });
        anims.push(a); a.onfinish = ()=> b.remove();
        b.addEventListener('click', ()=>{
          if (ended || b.classList.contains('done')) return; b.classList.add('done'); a.pause();
          if (item.ok){ right++; api.score(right * 4); api.sfx.chime(Math.min(8, right + 2)); b.classList.add('right'); }
          else { wrong++; b.classList.add('wrong'); api.sfx.wrong(); api.flash('lose'); if (timer) timer.add(-1000); if (item.why) api.say(item.w + '? ' + item.why + '!', 1600); }
          tally.textContent = right + ' snapped' + (wrong ? ' · ' + wrong + ' oops' : '');
          b.animate([{ transform:getComputedStyle(b).transform }, { transform:getComputedStyle(b).transform + ' scale(1.25)', opacity:1, offset:0.4 }, { transform:getComputedStyle(b).transform + ' scale(0.6)', opacity:0 }], { duration:420, fill:'forwards' }).onfinish = ()=> b.remove();
        });
      };
      words.forEach((item, i)=> spawns.push(setTimeout(()=> spawn(item, i), 300 + i * SS_SPAWN)));
      const end = ()=>{
        if (ended) return; ended = true; spawns.forEach(clearTimeout); anims.forEach(a=>{ try{ a.pause(); }catch(e){} });
        api.finish({ pts: right * 4, win: right >= 3, line: right === yes.length && !wrong ? 'Snap-tastic! A perfect sort!' : right >= 3 ? 'Sharp eyes!' : 'Those words were slippery!' });
      };
      api.onClose = ()=>{ ended = true; spawns.forEach(clearTimeout); };
      const timer = api.timer(SS_MS, end);
    },
  });

  // ---------------------------------------------------------------- E3. Zap Words
  // A 6x6 letter grid: swipe across neighbouring letters (any of the 8 directions) to spell words. Longer words score
  // more. ZAP_SECONDS to play; one free hint (lights the first letter of a hidden word and says how long it is).
  // Every grid has a few good words planted along random paths. The word list is the plain file data/zap-words.txt:
  // real, common English words only (28,455 - Webster's 1934 entries and their plain inflections that macOS's
  // English word embedding and spell checker both know; no proper names, abbreviations or obscure entries; built by
  // tools/build-zap-words.py), loaded when the game starts - no network beyond the game's own files.
  // World: electric yellow on storm grey.
  const ZAP_SECONDS = 28;   // (Run 4A: 20 -> 28 s, Round 4's game)
  const ZAP_POINTS = [0, 0, 0, 2, 4, 7, 10, 14, 18];
  const ZAP_FOUND_COLORS = ['#ff3d94', '#19c8c0', '#8be02a', '#ff8a1f', '#3d7bff'];   // (hot pink, teal, lime, orange, blue - one per found word, in turn)   // (J4: one per found word)
  const ZAP_SEED_WORDS = 'cake lamp ship frog moon star rain snow wind fire tree leaf bird fish duck goat lion bear wolf king ring song game ball cart road town farm park milk corn rice soup salt gold coin card bell drum horn kite boat sail rock sand wave pond lake hill cave nest worm bean pear plum lime mint rose seed seal swan crab toad mole hawk dove crow apple bread chair table house plant stone river ocean cloud storm light night dream smile laugh dance music piano tiger zebra horse sheep mouse snake whale shark eagle robin candy honey lemon melon grape peach toast pizza salad juice sugar spoon plate glass clock watch shirt dress coat planet rocket garden castle dragon pirate island forest jungle desert window bottle button butter cheese orange banana carrot turkey rabbit monkey parrot spider guitar violin basket candle ladder circle square silver golden yellow purple marble pencil camera mirror tent rope wing tail cape mask crown flag gift moat fort'.split(' ');
  const ZAP_LETTERS = 'EEEEEEEEEEEAAAAAAAAIIIIIIIOOOOOOONNNNNNRRRRRRTTTTTTTLLLLSSSSSSUUUDDDDGGGBBCCMMPPFFHHVVWWYYK';
  let zapDict = null, zapDictP = null;
  function zapLoad(){
    if (zapDict) return Promise.resolve(zapDict);
    if (!zapDictP) zapDictP = fetch('data/zap-words.txt').then(r=> r.ok ? r.text() : '').then(t=>{ zapDict = new Set(t.split('\n').map(w=> w.trim()).filter(Boolean)); return zapDict; })
      .catch(()=>{ zapDict = new Set(ZAP_SEED_WORDS); return zapDict; });
    return zapDictP;
  }
  MG.zapPrefetch = zapLoad;
  // F10: exact matches only - the list already has the common -s / -ed / -ing forms (tools/build-zap-words.py).
  function zapValid(w, dict){ return w.length >= 3 && dict.has(w); }
  // Plants words along random 8-neighbour paths in a 6x6 grid, then fills the rest with common letters.
  function zapGrid(rng){
    const N = 6, near = (i)=>{ const r = Math.floor(i / N), c = i % N, out = []; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++){ if (!dr && !dc) continue; const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < N && cc >= 0 && cc < N) out.push(rr * N + cc); } return out; };
    const pick = (a)=> a[Math.floor(rng() * a.length)];
    for (let attempt = 0; attempt < 60; attempt++){
      const g = new Array(N * N).fill(''), planted = [];
      const wants = [6, 5, 4, 4].map(len=>{ const pool = ZAP_SEED_WORDS.filter(w=> w.length === len || (len === 6 && w.length >= 5)); return pick(pool); });
      let ok = true;
      for (const word of wants){
        let placed = null;
        for (let t = 0; t < 120 && !placed; t++){
          let cur = Math.floor(rng() * N * N); if (g[cur] && g[cur] !== word[0].toUpperCase()) continue;
          const path = [cur];
          for (let k = 1; k < word.length; k++){
            const ch = word[k].toUpperCase(), opts = near(cur).filter(j=> path.indexOf(j) < 0 && (!g[j] || g[j] === ch));
            if (!opts.length){ path.length = 0; break; }
            cur = pick(opts); path.push(cur);
          }
          if (path.length === word.length) placed = path;
        }
        if (!placed){ if (planted.length >= 2) continue; ok = false; break; }
        placed.forEach((j, k)=> g[j] = word[k].toUpperCase()); planted.push({ word, path: placed });
      }
      if (!ok || planted.length < 3) continue;
      for (let j = 0; j < N * N; j++) if (!g[j]) g[j] = ZAP_LETTERS[Math.floor(rng() * ZAP_LETTERS.length)];
      return { letters: g, planted };
    }
    return null;
  }
  MG.register('zapWords', {
    name: 'Zap Words', colors: ['#ff9bf0', '#b244f0', '#5a1fb8'], bulb: '#7df9ff',
    rule: 'Swipe across touching letters to spell words. Longer words zap more!', host: 'Zap words out of the grid, Earthling!',
    available: ()=> typeof fetch === 'function',
    run(api){
      const s = api.stage; s.classList.add('zw-stage');
      // the rule line shows for the first 4 seconds of the round and then fades out
      const ruleEl = api.overlay.querySelector('.mg-rule'); let ruleT = setTimeout(()=> ruleEl && ruleEl.classList.add('fade'), 4000);
      const grid = zapGrid(api.rng);
      if (!grid){ api.finish({ pts: 0 }); return; }
      api.overlay._zap = grid;   // (tests read the planted words)
      // A+ tier 2: a neon ZAP WORD title, rounded-hexagon tiles (the same 6 x 6 positions and touching rules), a lit yellow path, and
      // every word found leaves a trail in its own bright colour
      s.innerHTML = '<div class="zw-title" aria-hidden="true"><span class="zp">ZAP</span> <span class="zc">WORD</span></div><div class="zw-word" aria-live="polite">&nbsp;</div><div class="zw-grid" role="application" aria-label="Letter grid">' +
        grid.letters.map((ch, i)=> '<div class="zw-cell" data-i="' + i + '"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon class="hx" points="50,2 97,26 97,74 50,98 3,74 3,26"/><polygon class="lk" points="50,2 97,26 97,74 50,98 3,74 3,26"/></svg><span>' + ch + '</span></div>').join('') + '<svg class="zw-trail" aria-hidden="true"><g class="zw-keeps"></g><polyline class="zw-glow" points=""/><polyline class="zw-line" points=""/></svg></div>' +
        '<div class="zw-foot"><button type="button" class="zw-hint">&#128161; HINT</button><div class="zw-found"></div></div>';
      const gEl = s.querySelector('.zw-grid'), cells = [...s.querySelectorAll('.zw-cell')], wordEl = s.querySelector('.zw-word'), line = s.querySelector('.zw-line'), glowLine = s.querySelector('.zw-glow'), keeps = s.querySelector('.zw-keeps'), foundEl = s.querySelector('.zw-found'), hintBtn = s.querySelector('.zw-hint');
      const found = new Set(); let pts = 0, path = [], live = false, ended = false, dict = null, timer = null;
      wordEl.textContent = 'Loading the letters...';
      const center = (i)=>{ const c = cells[i], r = gEl.getBoundingClientRect(), b = c.getBoundingClientRect(); return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2]; };
      // the colour of the word being drawn (the next in the cycle); the lock-in ring, tint and trail all use it
      const curCol = ()=> ZAP_FOUND_COLORS[found.size % ZAP_FOUND_COLORS.length];
      const draw = ()=>{
        gEl.style.setProperty('--tc', curCol());
        cells.forEach((c, i)=> c.classList.toggle('on', path.indexOf(i) >= 0));
        const pp = path.map(i=> center(i).map(v=> v.toFixed(1)).join(',')).join(' '); line.setAttribute('points', pp); glowLine.setAttribute('points', pp);
        wordEl.textContent = path.length ? path.map(i=> grid.letters[i]).join('') : ' ';
      };
      const cellAt = (x, y)=>{
        const r = gEl.getBoundingClientRect(), cw = r.width / 6, col = Math.floor((x - r.left) / cw), row = Math.floor((y - r.top) / cw);
        if (col < 0 || col > 5 || row < 0 || row > 5) return -1;
        const cx = r.left + (col + 0.5) * cw, cy = r.top + (row + 0.5) * cw;
        return Math.hypot(x - cx, y - cy) <= cw * 0.44 ? row * 6 + col : -1;   // (a generous inner circle: diagonals are easy)
      };
      const touching = (a, b)=> Math.abs(Math.floor(a / 6) - Math.floor(b / 6)) <= 1 && Math.abs(a % 6 - b % 6) <= 1 && a !== b;
      const add = (i)=>{
        if (i < 0) return;
        const last = path[path.length - 1];
        // a tile locks in: a quick scale pop (1.0 -> 1.12 -> 1.0 over 0.15 s) on the hex, then its ring and tint stay lit until the word is submitted
        const pop = (k)=>{ const sv = cells[k].firstElementChild; if (sv && sv.animate && !api.reduced && !api.lite) sv.animate([{ transform:'scale(1)' }, { transform:'scale(1.12)' }, { transform:'scale(1)' }], { duration:150, easing:'ease-out' }); };
        if (!path.length){ path.push(i); api.sfx.clack(); draw(); pop(i); return; }
        if (i === last) return;
        if (path.length >= 2 && i === path[path.length - 2]){ path.pop(); draw(); return; }   // backtrack
        if (path.indexOf(i) >= 0 || !touching(last, i)) return;
        path.push(i); api.sfx.chime(Math.min(8, path.length)); draw(); pop(i);
      };
      const release = ()=>{
        if (!path.length) return;
        const w = path.map(i=> grid.letters[i]).join('').toLowerCase(), used = path.slice(), trailPts = path.map(i=> center(i).map(v=> v.toFixed(1)).join(',')).join(' ');
        path = []; draw();
        // the colour trail shows only while drawing: after a submit (right or wrong) it fades out in 0.4 s and leaves nothing behind
        // the lit tiles: a valid word flashes once in its colour and fades out within 0.5 s; an invalid one drops back with a short shake
        const lit = (cls, color)=>{ used.forEach(i=>{ cells[i].style.setProperty('--tc', color); cells[i].classList.remove('fl-ok', 'fl-bad'); void cells[i].offsetWidth; cells[i].classList.add(cls); setTimeout(()=> cells[i].classList.remove(cls), 560); }); };
        const fadeTrail = (color)=>{
          if (used.length < 2 || api.reduced || api.lite || !Element.prototype.animate) return;
          const fp = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); fp.setAttribute('class', 'zw-keep'); fp.setAttribute('points', trailPts); fp.style.setProperty('--wc', color); keeps.appendChild(fp);
          fp.animate([{ opacity:1 }, { opacity:0 }], { duration:400, easing:'ease-out' }).onfinish = ()=> fp.remove();
        };
        if (w.length < 3){ fadeTrail(curCol()); lit('fl-bad', curCol()); return; }
        const flashCells = (cls)=>{ used.forEach(i=> cells[i].classList.add(cls)); setTimeout(()=> used.forEach(i=> cells[i].classList.remove(cls)), 450); };
        if (found.has(w)){ wordEl.textContent = w.toUpperCase() + ' — got it already'; flashCells('dup'); fadeTrail(curCol()); lit('fl-bad', curCol()); return; }
        if (dict && zapValid(w, dict)){
          found.add(w); const p = ZAP_POINTS[Math.min(8, w.length)]; pts += p; api.score(pts);
          wordEl.textContent = w.toUpperCase() + '  +' + p; api.sfx.ding(); if (w.length >= 5) api.flash('win');
          // J4: a found word stays lit in its own colour (a cell in two words shows the latest) and joins the found list.
          const col = ZAP_FOUND_COLORS[(found.size - 1) % ZAP_FOUND_COLORS.length]; lit('fl-ok', col);
          // a short pulse on the word's tiles in its colour (no streak stays on the board), and its trail fades out
          fadeTrail(col);
          const chip = document.createElement('span'); chip.className = 'zw-chip'; chip.style.setProperty('--wc', col); chip.textContent = w.toUpperCase() + ' +' + p; foundEl.appendChild(chip);
          if (hintAt >= 0 && used[0] === hintAt) cells[hintAt].classList.remove('hint');
        } else { wordEl.textContent = w.toUpperCase() + '?'; fadeTrail(curCol()); lit('fl-bad', curCol()); api.sfx.whoosh(); }
      };
      gEl.addEventListener('pointerdown', (e)=>{ if (!live) return; e.preventDefault(); try{ gEl.setPointerCapture(e.pointerId); }catch(err){} path = []; add(cellAt(e.clientX, e.clientY)); });
      gEl.addEventListener('pointermove', (e)=>{ if (!live || !path.length) return; e.preventDefault(); add(cellAt(e.clientX, e.clientY)); });
      gEl.addEventListener('pointerup', ()=>{ if (live) release(); });
      gEl.addEventListener('pointercancel', ()=>{ path = []; draw(); });
      let hintAt = -1;
      hintBtn.addEventListener('click', ()=>{
        if (ruleEl){ ruleEl.classList.remove('fade'); clearTimeout(ruleT); ruleT = setTimeout(()=> ruleEl.classList.add('fade'), 4000); }   // (the hint's line shows for 4 s too)
        if (!live || hintBtn.disabled) return; hintBtn.disabled = true;
        const left = grid.planted.filter(p=> !found.has(p.word)).sort((a, b)=> b.word.length - a.word.length)[0];
        if (!left){ api.setRule('You found every hidden word!'); return; }
        hintAt = left.path[0]; cells[hintAt].classList.add('hint');
        api.setRule('Find a ' + left.word.length + '-letter word starting here!'); api.sfx.chime(6);
      });
      const end = ()=>{
        if (ended) return; ended = true; live = false; path = []; draw();
        grid.planted.forEach(p=>{ if (!found.has(p.word)) p.path.forEach(i=> cells[i].classList.add('missed')); });
        setTimeout(()=> api.finish({ pts, win: pts >= 8, line: pts >= 20 ? 'Zap-tastic vocabulary!' : pts >= 8 ? 'Electric spelling!' : 'The letters zapped back!' }), 700);
      };
      api.onClose = ()=>{ ended = true; live = false; };
      zapLoad().then(d=>{ if (ended) return; dict = d; live = true; wordEl.textContent = ' '; timer = api.timer(ZAP_SECONDS * 1000, end); });
    },
  });

  // ---------------------------------------------------------------- E4. Twin Flip (memory match)
  // A 4x4 grid of neon tiles (FS on the back); flip two at a time to find the 8 pairs of 70s/80s icons (original line
  // art). +4 a pair, 25 s. World: a neon arcade - magenta grid on midnight, cyan bulbs (after refs/memory-match).
  const TF_MS = 25000;
  const tfSvg = (inner, c)=> '<svg viewBox="0 0 48 48" aria-hidden="true" style="--ic:' + c + '"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' + inner + '</g></svg>';
  const TF_ICONS = [
    ['cassette',  '#ff5fd2', '<rect x="6" y="12" width="36" height="24" rx="3"/><rect x="12" y="16" width="24" height="9" rx="2"/><circle cx="18" cy="20.5" r="2.5"/><circle cx="30" cy="20.5" r="2.5"/><path d="M14 36 L17 29 H31 L34 36"/>'],
    ['boombox',   '#7df9ff', '<path d="M16 14 V9 H32 V14"/><rect x="5" y="14" width="38" height="24" rx="3"/><circle cx="14" cy="27" r="6"/><circle cx="34" cy="27" r="6"/><rect x="20" y="18" width="8" height="5" rx="1"/><circle cx="14" cy="27" r="2"/><circle cx="34" cy="27" r="2"/>'],
    ['cube',      '#ffe27a', '<path d="M24 6 L40 15 V33 L24 42 L8 33 V15 Z"/><path d="M8 15 L24 24 L40 15 M24 24 V42"/><path d="M13.3 18 L13.3 36 M18.7 21 L18.7 39 M29.3 21 L29.3 39 M34.7 18 L34.7 36 M8 21 L24 30 L40 21 M8 27 L24 36 L40 27"/>'],
    ['skate',     '#ff8a3c', '<path d="M12 8 H22 V24 L36 27 Q40 28 40 32 V34 H10 Z"/><path d="M12 14 H20 M12 19 H20"/><circle cx="14" cy="39" r="3.5"/><circle cx="23" cy="39" r="3.5"/><circle cx="31" cy="39" r="3.5"/><circle cx="39" cy="39" r="3.2"/>'],
    ['palm',      '#5effa0', '<circle cx="34" cy="14" r="6" stroke="#ffb84d"/><path d="M22 42 Q24 30 21 18"/><path d="M21 18 Q12 12 5 17 M21 18 Q15 8 8 9 M21 18 Q24 9 32 8 M21 18 Q31 15 37 22 M21 18 Q24 24 22 30"/><path d="M8 42 H36"/>'],
    ['ghost',     '#b98bff', '<path d="M11 40 V22 Q11 9 24 9 Q37 9 37 22 V40 L32.5 36 L28 40 L24 36 L20 40 L15.5 36 Z"/><circle cx="19" cy="22" r="3"/><circle cx="29" cy="22" r="3"/><path d="M20 22 h0 M30 22 h0" stroke-width="3"/>'],
    ['walkman',   '#ff5fa0', '<path d="M10 16 Q10 4 24 4 Q38 4 38 16"/><rect x="7" y="14" width="6" height="9" rx="2"/><rect x="35" y="14" width="6" height="9" rx="2"/><rect x="14" y="22" width="20" height="22" rx="3"/><rect x="18" y="26" width="12" height="7" rx="1.5"/><path d="M18 39 H30"/>'],
    ['joystick',  '#4dd2ff', '<rect x="8" y="32" width="32" height="10" rx="3"/><path d="M24 32 V16"/><circle cx="24" cy="12" r="5"/><circle cx="34" cy="28" r="2.5"/><path d="M14 37 H18"/>'],
  ];
  // Run 4B: the faces are drawn 8 a game from a pool of 72 - the 8 line-art icons above and 64 emoji - by the game's
  // seed (in the show: the date's), so every day has a different set and everyone gets the same one that day.
  const TF_EMOJI = ['🎸','🎷','🎺','🥁','🎹','🎧','📻','📼','💾','📟','☎️','📺','🕹️','👾','🎮','🛼','🛹','🏀','⚾','🎳',
    '🍕','🍔','🌮','🍩','🍦','🍉','🍒','🍍','🥑','🌶️','🧁','🍿','🚀','🛸','🪐','🌙','⭐','☄️','🌈','⚡',
    '🔥','💎','👑','🎩','🕶️','👟','🎈','🎁','🎲','🧩','🦖','🦄','🐙','🦩','🐢','🦋','🐝','🌵','🌻','🍄',
    '🏆','🎯','💡','🔮'];
  const TF_POOL = TF_ICONS.map(ic=> ({ key: ic[0], html: tfSvg(ic[2], ic[1]), c: ic[1] }))
    .concat(TF_EMOJI.map((e, i)=> ({ key: 'e' + i, html: '<span class="tf-emo">' + e + '</span>', c: ['#ff5fd2', '#7df9ff', '#ffe27a', '#5effa0', '#b98bff', '#ff8a3c'][i % 6] })));
  MG.register('twinFlip', {
    name: 'Twin Flip', colors: ['#ff9bd8', '#ffb86a', '#ffe27a'], bulb: '#ffffff',
    rule: 'Flip two tiles at a time. Find all 8 pairs!', host: 'Match the twins before the clock runs out!',
    available: ()=> true,
    run(api){
      const s = api.stage; s.classList.add('tf-stage');
      const pick = api.shuffle(TF_POOL).slice(0, 8);   // (api.shuffle uses the game's seeded rng)
      // A+ tier 2: each pair has its own candy colour (its face, and its glow once matched)
      const TF_CANDY = ['#ff4fa3', '#ffb81f', '#2fd9ff', '#4be683', '#a45cff', '#ff7a2a', '#3d8bff', '#ff5a5a'];
      const deck = api.shuffle(pick.concat(pick).map(p=> ({ key: p.key, svg: p.html, c: TF_CANDY[pick.indexOf(p) % TF_CANDY.length] })));
      { const bg = api.overlay && api.overlay.querySelector('.mg-bg');   // soft floor spotlights behind the board (CSS-animated, behind everything)
        if (bg && !bg.querySelector('.tf-beam')) bg.insertAdjacentHTML('beforeend', [14, 38, 62, 86].map((x, i)=> '<i class="tf-pool" style="left:' + x + '%"></i><i class="tf-beam b' + (i + 1) + '" style="left:' + x + '%"></i>').join('')); }
      s.innerHTML = '<div class="tf-title" aria-hidden="true"><b class="ts l">♠ ♥</b><span>TWIN FLIP</span><b class="ts r">♦ ♣</b><i class="tw t1">✦</i><i class="tw t2">✦</i><i class="tw t3">✦</i></div><div class="tf-grid">' + deck.map((d, i)=> '<button type="button" class="tf-tile" style="--pc:' + d.c + '" data-i="' + i + '" aria-label="Tile ' + (i + 1) + '"><span class="tf-back">FS</span><span class="tf-face">' + d.svg + '</span></button>').join('') + '<div class="tf-pairs">0 / 8 pairs</div></div>';
      const tiles = [...s.querySelectorAll('.tf-tile')], pairsEl = s.querySelector('.tf-pairs');
      let open = [], pairs = 0, busy = false, ended = false;
      // The flip, like a Wheel of Fortune letter panel: the tile turns on its vertical axis (rotateY, 0.35 s, with perspective on the
      // grid), swaps face at the edge-on moment and turns on.
      const flip = (t, up)=>{
        if (api.reduced || api.lite || !t.animate){ t.classList.toggle('up', up); return; }
        t.animate([{ transform:'rotateY(0deg)' }, { transform:'rotateY(90deg)' }], { duration:175, easing:'ease-in' }).onfinish = ()=>{
          t.classList.toggle('up', up); t.animate([{ transform:'rotateY(-90deg)' }, { transform:'rotateY(0deg)' }], { duration:175, easing:'ease-out' });
        };
      };
      // a quick cascade of flips at the start (each tile turns once, backs only - nothing is revealed), then the clock starts
      const cascade = ()=>{
        if (api.reduced || api.lite) return 0;
        tiles.forEach((t, i)=>{ if (t.animate) t.animate([{ transform:'rotateY(0deg)' }, { transform:'rotateY(360deg)' }], { duration:450, delay:i * 38, easing:'ease-in-out' }); });
        return 450 + 15 * 38;
      };
      const J = window.Juice, glowTile = (i)=>{ tiles[i].classList.add('done'); };
      tiles.forEach((t, i)=> t.addEventListener('click', ()=>{
        if (ended || busy || t.classList.contains('up') || t.classList.contains('done')) return;
        api.sfx.clack(); flip(t, true); open.push(i);
        if (open.length < 2) return;
        busy = true;
        const [a, b] = open; open = [];
        if (deck[a].key === deck[b].key){
          // a match: both tiles get a glowing border with a spark that travels round it, a jagged bolt connects them (3 pre-made zigzags,
          // about 3 flickers a second for a second), then they settle into a steady pulsing glow in the pair's colour for the round
          setTimeout(()=>{
            glowTile(a); glowTile(b);
            if (J && !api.reduced && !api.lite){
              J.sparkRing(tiles[a], '#39a7ff', 700); J.sparkRing(tiles[b], '#39a7ff', 700);
              const ra = tiles[a].getBoundingClientRect(), rb = tiles[b].getBoundingClientRect(), ax = ra.left + ra.width / 2, ay = ra.top + ra.height / 2, bx = rb.left + rb.width / 2, by = rb.top + rb.height / 2, v0 = pairs % 3;
              [0, 350, 700].forEach((d, k)=> setTimeout(()=>{ if (!ended) J.bolt(ax, ay, bx, by, v0 + k); }, d));
            }
            pairs++; pairsEl.textContent = pairs + ' / 8 pairs'; api.score(pairs * 4);
            api.sfx.chime(Math.min(8, pairs + 1)); busy = false;
            if (pairs === 8){ api.flash('win'); end(); } }, 280);
        } else {
          setTimeout(()=>{
            [a, b].forEach(i=>{ if (!api.reduced && !api.lite && tiles[i].animate) tiles[i].animate([{ transform:'translateX(0)' }, { transform:'translateX(-5px)' }, { transform:'translateX(5px)' }, { transform:'translateX(-3px)' }, { transform:'translateX(0)' }], { duration:220 }); });
            setTimeout(()=>{ flip(tiles[a], false); flip(tiles[b], false); api.sfx.whoosh(); busy = false; }, api.reduced || api.lite ? 0 : 230);
          }, 560);
        }
      }));
      const end = ()=>{ if (ended) return; ended = true; setTimeout(()=> api.finish({ pts: pairs * 4, win: pairs >= 4, line: pairs === 8 ? 'Total recall! Every twin found!' : pairs >= 4 ? 'Groovy memory!' : 'Those tiles were tricky!' }), 500); };
      api.onClose = ()=>{ ended = true; };
      busy = true;
      const casc = cascade();
      setTimeout(()=>{ if (ended) return; busy = false; api.timer(TF_MS, end); }, casc);
    },
  });

  // ---------------------------------------------------------------- E5. Fact or Fib
  // The host pops up from the bottom with a statement: TRUE or FIB? About 6 s each, 5 statements, +10 a right answer,
  // +20 more for 5 out of 5; after each answer the host adds a one-line fact or a cheeky reaction. The statements are
  // Checked (Oct 16): window.FACT_OR_FIB_REVIEWED is true in data/fact-or-fib.js, so the game is in the rotation
  // (setting it back to false takes it out; the TEST menu can always play it). World: tangerine and cream.
  const FF_ROUNDS = 5, FF_MS = 6000;
  MG.register('factOrFib', {
    name: 'Fact or Fib', colors: ['#ffd59a', '#e2731c', '#3a1503'], bulb: '#ffe0a8',
    rule: 'TRUE or FIB? Trust your gut!',
    available: ()=> window.FACT_OR_FIB_REVIEWED === true && Array.isArray(window.FLIPSTAX_FACT_OR_FIB) && window.FLIPSTAX_FACT_OR_FIB.length >= 20,
    run(api){
      const all = window.FLIPSTAX_FACT_OR_FIB || [];
      // G5: never two statements on the same topic in one episode (`k` in data/fact-or-fib.js: the two peanut ones,
      // the two tomato ones...).
      const seen = new Set(), take = (list, n)=>{ const out = []; for (const x of list){ if (out.length >= n) break; const k = x.k || x.s; if (seen.has(k)) continue; seen.add(k); out.push(x); } return out; };
      const t = take(api.shuffle(all.filter(x=> x.t)), 2 + Math.floor(api.rng() * 2)), f = take(api.shuffle(all.filter(x=> !x.t)), 3);
      const qs = api.shuffle(t.concat(f)).slice(0, FF_ROUNDS);
      const s = api.stage; s.classList.add('ff-stage');
      s.innerHTML = '<div class="ff-dots">' + qs.map(()=> '<i></i>').join('') + '</div><div class="ff-bubble" aria-live="polite"><span class="ff-text"></span><span class="ff-fact"></span><b class="ff-stamp"></b></div>' +
        '<div class="ff-btns"><button type="button" class="ff-btn yes">TRUE</button><button type="button" class="ff-btn no">FIB</button></div>' +
        '<div class="ff-host host-full">' + api.hostSvg() + '</div>';
      const bubble = s.querySelector('.ff-bubble'), text = s.querySelector('.ff-text'), fact = s.querySelector('.ff-fact'), stamp = s.querySelector('.ff-stamp'), host = s.querySelector('.ff-host'), btns = [...s.querySelectorAll('.ff-btn')], dots = [...s.querySelectorAll('.ff-dots i')];
      let i = 0, right = 0, locked = true, timer = null, ended = false;
      const ask = ()=>{
        const q = qs[i]; text.textContent = q.s; fact.textContent = ''; stamp.className = 'ff-stamp'; stamp.textContent = ''; bubble.classList.remove('said');
        host.classList.remove('up'); void host.offsetWidth; host.classList.add('up');   // he pops up from the bottom
        if (!api.reduced) bubble.animate([{ transform:'scale(0.6)', opacity:0 }, { transform:'scale(1)', opacity:1 }], { duration:300, easing:'cubic-bezier(.2,1.5,.4,1)' });
        api.sfx.hostVoice(q.s); locked = false; btns.forEach(b=> b.disabled = false);
        timer = api.timer(FF_MS, ()=> answer(null));
      };
      const answer = (yes)=>{
        if (locked || ended) return; locked = true; btns.forEach(b=> b.disabled = true); if (timer) timer.stop();
        const q = qs[i], ok = yes !== null && yes === q.t;
        stamp.textContent = q.t ? 'TRUE!' : 'FIB!'; stamp.className = 'ff-stamp on ' + (q.t ? 'true' : 'fib');
        dots[i].classList.add(ok ? 'right' : 'wrong');
        if (ok){ right++; api.score(right * 10); api.sfx.ding(); api.flash('win'); api.mood('cheer'); }
        else { api.sfx.strike(); api.flash('lose'); api.mood('sad'); }
        setTimeout(()=>{ if (ended) return; fact.textContent = q.r; bubble.classList.add('said'); api.sfx.hostVoice(q.r); }, 650);   // (the statement stays, the fact goes under it)
        api.hold(()=>{
          if (ended) return; i++;
          if (i >= qs.length){ const pts = right * 10 + (right === qs.length ? 20 : 0);
            api.finish({ pts, win: right >= 3, line: right === qs.length ? 'Five for five! +20 bonus!' : right >= 3 ? 'You know your facts!' : 'Fooled you, Earthling!' }); return; }
          ask();
        }, { lead:650, min:1950 });   // (the fact lands at 0.65 s; the whole reveal holds 2.6 s, as before)
      };
      btns[0].addEventListener('click', ()=>{ api.sfx.tap('top'); answer(true); });
      btns[1].addEventListener('click', ()=>{ api.sfx.tap('bottom'); answer(false); });
      api.onClose = ()=>{ ended = true; };
      ask();
    },
  });

  // ---------------------------------------------------------------- E6. Saucer Shuffle
  // The host stands behind a little table with three flying saucers. One lifts to show the golden star, they all
  // settle, and he shuffles: his arms reach out, grab two saucers and swap them in smooth arcs while his eyes dart to
  // follow. 3 rounds, faster each time (a touch of motion blur on the last, not in lite mode). Then he spreads his
  // hands and waits; tap a saucer. Right: +10, the bulbs flash, he cheers. Wrong: they all lift to show the star, a
  // neutral tone, he shrugs. The saucers' positions come from the game logic and are always exact; his arms and eyes
  // are drawn to wherever the saucers are each frame (never the other way round). World: silver and plum.
  const SU_ROUNDS = [{ swaps:4, ms:560 }, { swaps:6, ms:400 }, { swaps:8, ms:290 }];
  MG.register('saucerShuffle', {
    name: 'Saucer Shuffle', colors: ['#d9c2ff', '#6b2d8a', '#1a0826'], bulb: '#e9e4ff',
    rule: 'Watch the saucer with the star!', host: 'Eyes on the star!',
    available: ()=> true,
    run(api){
      const s = api.stage; s.classList.add('su-stage');
      s.innerHTML = '<div class="su-play"><div class="su-host host-full">' + api.hostSvg() + '</div>' +
        '<svg class="su-arms" aria-hidden="true">' + ['l', 'r'].map(sd=> '<g class="arm ' + sd + '"><path class="sl o"/><path class="sl i"/><circle class="cuff"/><ellipse class="thumb"/><circle class="hand"/></g>').join('') + '</svg>' +
        '<div class="su-table"></div><div class="su-star" aria-hidden="true">&#11088;</div>' +
        [0, 1, 2].map(k=> '<button type="button" class="su-saucer" data-k="' + k + '" aria-label="Saucer">' + api.FX.ufoSvg() + '</button>').join('') +
        '</div><div class="su-round">ROUND 1 OF 3</div>';
      const play = s.querySelector('.su-play'), saucers = [...s.querySelectorAll('.su-saucer')], star = s.querySelector('.su-star'), roundEl = s.querySelector('.su-round');
      const host = s.querySelector('.su-host'), eyes = host.querySelector('.ha-eyes'), arms = { l: s.querySelector('.arm.l'), r: s.querySelector('.arm.r') };
      const pos = [0, 1, 2];          // pos[saucer] = its slot (0 left, 1 middle, 2 right) - the truth
      let starAt = 0, round = 0, phase = 'show', right = 0, ended = false, raf = 0, grab = null;
      const W = ()=> play.clientWidth, H = ()=> play.clientHeight;
      const slotX = (slot)=> W() * [0.25, 0.5, 0.75][slot];   // (F8: in reach of his arms)
      const tableY = ()=> H() * 0.74;
      const place = (k)=>{ const sw = saucers[k].offsetWidth; saucers[k].style.transform = 'translate(' + (slotX(pos[k]) - sw / 2).toFixed(1) + 'px,0)'; };
      const layout = ()=>{ saucers.forEach((sv, k)=>{ sv.style.top = (tableY() - sv.offsetHeight * 0.9) + 'px'; place(k); }); star.style.top = (tableY() - 34) + 'px'; };
      // The host's arms and eyes, from where the saucers really are (each frame while anything moves).
      const shoulder = (side)=>{ const hr = host.getBoundingClientRect(), pr = play.getBoundingClientRect(), k = hr.width / 200; return [hr.left - pr.left + (side === 'l' ? 60 : 140) * k, hr.top - pr.top + 150 * k]; };
      const centerOf = (k)=>{ const r = saucers[k].getBoundingClientRect(), pr = play.getBoundingClientRect(); return [r.left - pr.left + r.width / 2, r.top - pr.top + r.height * 0.18]; };   // (his hand on the dome)
      // F8: arms of normal length - an upper arm and a forearm (two-bone reach toward the target, elbows bending down
      // and out), a silver sleeve, a white cuff and a green mitten hand; out of reach, the arm points straight at it.
      const setArm = (side, to)=>{
        const k = host.getBoundingClientRect().width / 200, L = 46 * k, [sx, sy] = shoulder(side), [tx, ty] = to;
        let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1; const a = Math.atan2(dy, dx), dd = Math.min(d, 2 * L * 0.999);
        const b = Math.acos(Math.min(1, dd / (2 * L))), sgn = side === 'l' ? -1 : 1;
        let e1 = [sx + L * Math.cos(a + b), sy + L * Math.sin(a + b)], e2 = [sx + L * Math.cos(a - b), sy + L * Math.sin(a - b)];
        const pickE = (e1[1] * 1 + e1[0] * sgn * 0.3) > (e2[1] * 1 + e2[0] * sgn * 0.3) ? e1 : e2;   // the elbow that hangs lower and outward
        const hx = sx + dd * Math.cos(a), hy = sy + dd * Math.sin(a);
        const path = 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' L' + pickE[0].toFixed(1) + ' ' + pickE[1].toFixed(1) + ' L' + hx.toFixed(1) + ' ' + hy.toFixed(1);
        const g = arms[side];
        g.querySelectorAll('.sl').forEach(p=> p.setAttribute('d', path));
        g.querySelector('.sl.o').setAttribute('stroke-width', (21 * k).toFixed(1)); g.querySelector('.sl.i').setAttribute('stroke-width', (16 * k).toFixed(1));
        const fa = Math.atan2(hy - pickE[1], hx - pickE[0]), cx = hx - Math.cos(fa) * 8 * k, cy = hy - Math.sin(fa) * 8 * k;
        const cuff = g.querySelector('.cuff'); cuff.setAttribute('cx', cx.toFixed(1)); cuff.setAttribute('cy', cy.toFixed(1)); cuff.setAttribute('r', (8.5 * k).toFixed(1));
        const h = g.querySelector('.hand'); h.setAttribute('cx', hx.toFixed(1)); h.setAttribute('cy', hy.toFixed(1)); h.setAttribute('r', (9.5 * k).toFixed(1));
        const th = g.querySelector('.thumb'), ta = fa - sgn * 1.2; th.setAttribute('cx', (hx + Math.cos(ta) * 8 * k).toFixed(1)); th.setAttribute('cy', (hy + Math.sin(ta) * 8 * k).toFixed(1));
        th.setAttribute('rx', (4.5 * k).toFixed(1)); th.setAttribute('ry', (3 * k).toFixed(1)); th.setAttribute('transform', 'rotate(' + (ta * 180 / Math.PI).toFixed(0) + ' ' + (hx + Math.cos(ta) * 8 * k).toFixed(1) + ' ' + (hy + Math.sin(ta) * 8 * k).toFixed(1) + ')');
      };
      const rest = (spread)=>{
        const y = tableY() - 6, hr = host.getBoundingClientRect(), pr = play.getBoundingClientRect(), mid = hr.left - pr.left + hr.width / 2;
        setArm('l', spread ? [W() * 0.04, y - 40] : [mid - 34, y]); setArm('r', spread ? [W() * 0.96, y - 40] : [mid + 34, y]);
      };
      const lookAt = (x)=>{ if (!eyes) return; const hr = host.getBoundingClientRect(), pr = play.getBoundingClientRect(), d = Math.max(-5, Math.min(5, (x - (hr.left - pr.left + hr.width / 2)) / 18)); eyes.style.translate = d.toFixed(1) + 'px 0'; };
      const follow = ()=>{
        cancelAnimationFrame(raf);
        const step = ()=>{ if (ended) return;
          if (grab){ const a = centerOf(grab[0]), b = centerOf(grab[1]); const [L, R] = a[0] <= b[0] ? [a, b] : [b, a]; setArm('l', L); setArm('r', R); lookAt((a[0] + b[0]) / 2); }
          raf = requestAnimationFrame(step); };
        raf = requestAnimationFrame(step);
      };
      const lift = (k, up, ms)=> new Promise(res=>{ const base = saucers[k].style.transform; if (api.reduced){ saucers[k].classList.toggle('up', up); return res(); }
        saucers[k].animate([{ transform: base + (up ? '' : ' translateY(-56px)') }, { transform: base + (up ? ' translateY(-56px)' : '') }], { duration: ms || 320, easing:'cubic-bezier(.3,1.3,.5,1)', fill:'forwards' }).onfinish = res; });
      const settle = ()=> saucers.forEach(sv=> sv.getAnimations().forEach(a=>{ try{ a.cancel(); }catch(e){} }));
      const swap = (a, b, ms)=> new Promise(res=>{
        const ia = pos[a], ib = pos[b]; pos[a] = ib; pos[b] = ia;
        grab = [a, b]; api.sfx.whoosh();
        if (api.reduced || !saucers[a].animate){ place(a); place(b); return setTimeout(res, 80); }
        const sw = saucers[a].offsetWidth, xa = slotX(ia) - sw / 2, xb = slotX(ib) - sw / 2, mid = (xa + xb) / 2;
        const arc = (from, to, dy)=> [{ transform:'translate(' + from + 'px,0)' }, { transform:'translate(' + mid + 'px,' + dy + 'px)', offset:0.5 }, { transform:'translate(' + to + 'px,0)' }];
        saucers[a].style.zIndex = 3; saucers[b].style.zIndex = 4;
        saucers[a].animate(arc(xa, xb, -46), { duration: ms, easing:'ease-in-out' });
        saucers[b].animate(arc(xb, xa, 18), { duration: ms, easing:'ease-in-out' }).onfinish = ()=>{ place(a); place(b); res(); };
      });
      const wait = (ms)=> new Promise(r=> setTimeout(r, ms));
      async function playRound(){
        if (ended) return;
        const R = SU_ROUNDS[round]; roundEl.textContent = 'ROUND ' + (round + 1) + ' OF 3';
        phase = 'show'; play.classList.remove('picking', 'blur'); settle(); layout(); rest(false); lookAt(slotX(pos[starAt]));
        // the star's saucer lifts, shows the star, and settles
        star.style.left = slotX(pos[starAt]) + 'px'; star.classList.add('on');
        await lift(starAt, true); api.sfx.chime(5); await wait(650); await lift(starAt, false); star.classList.remove('on'); settle(); layout();
        api.say(['Eyes on the star!', 'Faster now!', 'Hold on to your antennae!'][round], 1300);
        await wait(300); if (ended) return;
        // the shuffle (always two different saucers; the logic decides, the arms and eyes follow)
        play.classList.toggle('blur', round === 2 && !api.lite && !api.reduced);
        follow();
        for (let n = 0; n < R.swaps && !ended; n++){ let a = Math.floor(api.rng() * 3), b = (a + 1 + Math.floor(api.rng() * 2)) % 3; await swap(a, b, R.ms); }
        grab = null; cancelAnimationFrame(raf); play.classList.remove('blur'); if (ended) return;
        rest(true); lookAt(W() / 2); api.say('Which one, Earthling?', 1500);   // he stops, spreads his hands and waits
        phase = 'pick'; play.classList.add('picking');
        timer = api.timer(6000, ()=> pick(-1));
      }
      let timer = null;
      async function pick(k){
        if (phase !== 'pick' || ended) return; phase = 'reveal'; play.classList.remove('picking'); if (timer) timer.stop();
        const hit = k === starAt;
        star.style.left = slotX(pos[starAt]) + 'px'; star.classList.add('on');
        if (hit){ right++; api.score(right * 10); await lift(k, true); api.sfx.ding(); api.flash('win'); api.mood('cheer'); api.say('You got it!', 1200); }
        else { await Promise.all([0, 1, 2].map(j=> lift(j, true))); api.sfx.chime(2); api.mood('sad'); api.say(k < 0 ? 'Too slow! It was here.' : 'Ooh, it was over here!', 1300);
          rest(true); setTimeout(()=> rest(false), 500); }   // a shrug
        await new Promise(r=> api.hold(r)); star.classList.remove("on"); round++;   // (A+: the shared reveal hold)
        if (round >= SU_ROUNDS.length || ended){ api.finish({ pts: right * 10, win: right >= 2, line: right === 3 ? 'Sharpest eyes in the galaxy!' : right >= 2 ? 'Nice tracking!' : 'Those saucers were sneaky!' }); return; }
        starAt = Math.floor(api.rng() * 3); playRound();
      }
      saucers.forEach((sv, k)=> sv.addEventListener('click', ()=>{ if (phase === 'pick'){ api.sfx.tap('top'); pick(k); } }));
      api.onClose = ()=>{ ended = true; cancelAnimationFrame(raf); };
      starAt = Math.floor(api.rng() * 3);
      requestAnimationFrame(()=>{ layout(); rest(false); playRound(); });
    },
  });
})();
