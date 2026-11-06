/* FlipStax - MUNCH MIX (a spare Mystery Game: registered, in the TEST menu as 'Munch Mix', NOT in the show's pools - see data/rundown.js to add it).
   A muncher hops round a 4 x 5 floor of glossy Simon-coloured tiles and eats the ones that fit the round's rule (data/munch-packs.js):
   round 1 MATH, round 2 SCIENCE, round 3 a harder mix. 8 right chomps clear a round; a wrong chomp costs one of 3 lives; 40 s a round.
   Glitches (red blobs) hop tile to tile about every 1.2 s (none in round 1, one in round 2, two in round 3); the tile one is about to land on glows at its
   edge for 0.5 s first. A Glitch landing on the muncher, or a tap on a Glitch's tile, costs a life.
   Points a round: 10 clean, 7 with one life lost, 4 with two lost, 0 failed (up to 30). PERFECT: all three rounds clean.
   The chrome, sign, banner, status pill, score pill, Flip, the BIG WIN and the gentle LOSS are the shared ones (lib/neo-games.js MG.neo, lib/celebrate.js).
   Transform and opacity only; at most 3 flashes a second; lite mode and reduced motion: plain fades and a still floor. */
(function(){
  const MG = window.MiniGames; if (!MG || !MG.neo) return;
  const { chrome, finale, slam, floatText, burst, anim, wait, pose, setLayer } = MG.neo;
  const MM_COLS = 4, MM_ROWS = 5, MM_N = MM_COLS * MM_ROWS, MM_RIGHT_ON_BOARD = 7;   // (7 of 20 = 35% right; the first fill may have 8 = 40%)
  const MM_TARGET = 8, MM_LIVES = 3, MM_ROUND_MS = 40000, MM_HOP_MS = 1200, MM_WARN_MS = 500;
  const MM_PTS = [10, 7, 4];   // a cleared round: 0, 1 or 2 lives lost; a failed round scores 0
  const MM_GLITCHES = [0, 1, 2];
  const MM_SIMON = ['r', 'g', 'b', 'y'];
  const MUNCHER = '<svg class="mm-msvg" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="mmB" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#eaffd8"/><stop offset="0.35" stop-color="#7dff6a"/><stop offset="0.8" stop-color="#1fae3a"/><stop offset="1" stop-color="#0b5e22"/></radialGradient></defs>' +
    '<ellipse cx="50" cy="94" rx="30" ry="5" fill="rgba(0,0,0,0.35)"/>' +
    '<path d="M34 16 Q28 4 20 6" stroke="#3bd15a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M66 16 Q72 4 80 6" stroke="#3bd15a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="20" cy="6" r="5" fill="#c8ff9a"/><circle cx="80" cy="6" r="5" fill="#c8ff9a"/>' +
    '<circle cx="50" cy="54" r="38" fill="url(#mmB)" stroke="#d9ffc8" stroke-width="2.5"/>' +
    '<g class="mm-eyes"><circle cx="37" cy="40" r="9" fill="#fff"/><circle cx="63" cy="40" r="9" fill="#fff"/><circle cx="39" cy="41" r="4.5" fill="#06140a"/><circle cx="61" cy="41" r="4.5" fill="#06140a"/><circle cx="40.5" cy="39" r="1.5" fill="#fff"/><circle cx="62.5" cy="39" r="1.5" fill="#fff"/></g>' +
    '<g class="mm-lids"><rect x="27" y="30" width="20" height="20" rx="9" fill="#2fc24a"/><rect x="53" y="30" width="20" height="20" rx="9" fill="#2fc24a"/></g>' +
    '<g class="mm-mouth"><path d="M26 60 Q50 92 74 60 Z" fill="#3a0612" stroke="#0b5e22" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 62 L38 68 L42 62 M58 62 L62 68 L66 62" fill="#fff"/><ellipse cx="50" cy="78" rx="9" ry="4" fill="#ff5a7a"/></g>' +
    '<ellipse cx="38" cy="26" rx="12" ry="5" fill="#fff" opacity="0.4"/></svg>';
  const GLITCH = '<svg class="mm-gsvg" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="mmG" cx="38%" cy="28%" r="80%"><stop offset="0" stop-color="#ffd0c8"/><stop offset="0.35" stop-color="#ff3a4a"/><stop offset="0.85" stop-color="#a00a1e"/><stop offset="1" stop-color="#5a0410"/></radialGradient>' +
    '<radialGradient id="mmGe" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#ffe27a"/><stop offset="1" stop-color="rgba(255,226,122,0)"/></radialGradient></defs>' +
    '<ellipse cx="50" cy="95" rx="28" ry="4" fill="rgba(0,0,0,0.35)"/>' +
    '<path d="M16 54 C16 26 32 12 50 12 C68 12 84 26 84 54 L84 88 L74 80 L64 90 L54 80 L44 90 L34 80 L24 90 L16 82 Z" fill="url(#mmG)" stroke="#ffd0d6" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<circle cx="37" cy="48" r="13" fill="url(#mmGe)"/><circle cx="63" cy="48" r="13" fill="url(#mmGe)"/><circle cx="37" cy="48" r="5" fill="#2a0008"/><circle cx="63" cy="48" r="5" fill="#2a0008"/>' +
    '<ellipse cx="38" cy="24" rx="12" ry="4.5" fill="#fff" opacity="0.4"/></svg>';
  // the rules for one show: one from each round's packs, never the same family twice
  function pickRules(rng){
    const P = window.FLIPSTAX_MUNCH_PACKS || {}, R = window.FLIPSTAX_MUNCH_ROUNDS || [], used = new Set(), out = [];
    R.forEach((rd, k)=>{
      let cands = []; (rd.packs || []).forEach(pk=> (P[pk] ? P[pk].rules : []).forEach(r=>{ if (!used.has(r.family) && (!rd.hard || r.hard)) cands.push({ r, pack:P[pk].label }); }));
      if (!cands.length) (rd.packs || []).forEach(pk=> (P[pk] ? P[pk].rules : []).forEach(r=>{ if (!used.has(r.family)) cands.push({ r, pack:P[pk].label }); }));
      const c = cands[Math.floor(rng() * cands.length)]; if (!c) return;
      used.add(c.r.family); const m = c.r.make(rng);
      out.push({ id:c.r.id, pack: rd.packs.length > 1 ? 'MIXED' : c.pack, text:m.text, right:m.right.slice(), wrong:m.wrong.slice() });
    });
    return out;
  }
  MG.register('munchMix', {
    name: 'Munch Mix', colors: ['#ff3fb5', '#27e6ff', '#120a2e'], bulb: '#ffe27a',
    rule: 'Eat the tiles that fit the rule!', host: '',
    available: ()=> true,   // (a spare: it plays only where a pool or the TEST menu names it)
    run(api){
      const set = setLayer(api, 'mm-set', '<i class="ms-floor"></i><i class="ms-cone l"></i><i class="ms-cone r"></i><i class="ms-refl"></i>');
      const rules = pickRules(api.rng);
      const ui = chrome(api, { title:'MUNCH MIX', sub:'ROUND 1 OF 3', rule: rules[0] ? rules[0].text : '', msg:'Get ready...' });
      api.overlay.classList.add('nx-mm');
      const ruleEl = api.stage.querySelector('.nx-rule'), play = ui.play, quiet = api.lite || api.reduced;
      ui.panel.classList.add('timed');
      const livesEl = document.createElement('span'); livesEl.className = 'mm-lives'; livesEl.innerHTML = '<i></i><i></i><i></i>'; ui.panel.appendChild(livesEl);
      play.innerHTML = '<div class="mm-wrap"><div class="mm-board">' + Array.from({ length:MM_N }, (_, i)=> '<button type="button" class="mm-tile" data-i="' + i + '" style="--k:' + i + ';--w:' + ((i % MM_COLS) + Math.floor(i / MM_COLS)) + ';--d:' + ((i * 7919 % 23) * 0.17).toFixed(2) + 's">' +
        '<i class="mm-under"></i><span class="mm-face"><i class="mm-neon"></i><i class="mm-red"></i><i class="mm-hi"></i><b class="mm-t"></b></span><i class="mm-warn"></i></button>').join('') +
        '<div class="mm-muncher">' + MUNCHER + '</div></div></div>';
      const board = play.querySelector('.mm-board'), tiles = [...play.querySelectorAll('.mm-tile')], muncher = play.querySelector('.mm-muncher');
      const testing = /[?&](replay|debug)=/.test(location.search);
      let round = 0, total = 0, clean = 0, cleared = 0, lives = MM_LIVES, eaten = 0, live = false, busy = false, over = false, rule = null, timers = [], roundT = 0;
      let ok = [], val = [], flipping = new Set(), mIdx = 16, mXY = [0, 0], glitches = [];
      const later = (fn, ms)=>{ const t = setTimeout(()=>{ if (!over) fn(); }, ms); timers.push(t); return t; };
      api.onClose = ()=>{ over = true; live = false; timers.forEach(clearTimeout); glitches.forEach(g=> clearTimeout(g.t)); };
      const center = (i)=>{ const t = tiles[i]; return [t.offsetLeft + t.offsetWidth / 2, t.offsetTop + t.offsetHeight / 2]; };
      const setLives = ()=> [...livesEl.children].forEach((l, k)=> l.classList.toggle('off', k >= lives));
      // ---- the floor
      const setTile = (i, text, right)=>{ val[i] = text; ok[i] = right; const b = tiles[i].querySelector('.mm-t'); b.textContent = text; tiles[i].classList.toggle('l', text.length >= 3); tiles[i].classList.toggle('xl', text.length >= 5); };
      const pickVal = (right)=>{ const pool = right ? rule.right : rule.wrong, free = pool.filter(v=> val.indexOf(v) < 0); const from = free.length ? free : pool; return from[Math.floor(api.rng() * from.length)]; };
      const fill = ()=>{
        const nRight = MM_RIGHT_ON_BOARD + (api.rng() < 0.5 ? 1 : 0), order = api.shuffle(tiles.map((_, i)=> i)); val = []; ok = [];
        order.forEach((i, k)=> setTile(i, pickVal(k < nRight), k < nRight));
        tiles.forEach((t, i)=>{ t.classList.remove('eaten', 'p', 'b', 'nope'); MM_SIMON.forEach(c=> t.classList.remove('c-' + c)); t.classList.add('c-' + MM_SIMON[((i % MM_COLS) + Math.floor(i / MM_COLS) + round) % 4]); });
      };
      // a new value after a chomp: keeps the right share near 35%
      const refill = (i)=>{ const others = ok.reduce((n, v, k)=> n + (k !== i && v ? 1 : 0), 0); setTile(i, pickVal(others < MM_RIGHT_ON_BOARD), others < MM_RIGHT_ON_BOARD); };
      // ---- the muncher: hops (an arc and a squash on landing) and chomps
      const placeM = (i)=>{ mIdx = i; mXY = center(i); muncher.style.transform = 'translate(' + mXY[0] + 'px,' + mXY[1] + 'px)'; };
      const hop = (i)=> new Promise(res=>{
        const from = mXY, to = center(i); mIdx = i; mXY = to;
        const T = (p, extra)=> 'translate(' + p[0] + 'px,' + p[1] + 'px)' + (extra || '');
        muncher.style.transform = T(to);
        if (quiet || !muncher.animate){ res(); return; }
        const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 - 34];
        muncher.animate([{ transform:T(from) }, { transform:T(mid, ' scale(1.04,0.96)'), offset:0.5 }, { transform:T(to, ' scale(1.18,0.82)'), offset:0.85 }, { transform:T(to) }], { duration:260, easing:'ease-in-out' }).onfinish = res;
      });
      const chomp = ()=>{ muncher.classList.remove('chomp'); void muncher.offsetWidth; muncher.classList.add('chomp'); api.sfx.clack ? api.sfx.clack() : api.sfx.tap && api.sfx.tap('top'); };
      const hurt = (why)=>{
        if (!live) return;
        const r = document.createElement('i'); r.className = 'mm-ring'; r.style.left = mXY[0] + 'px'; r.style.top = mXY[1] + 'px'; board.appendChild(r);
        if (r.animate && !quiet) r.animate([{ transform:'translate(-50%,-50%) scale(0.3)', opacity:1 }, { transform:'translate(-50%,-50%) scale(1.8)', opacity:0 }], { duration:550, easing:'ease-out' }).onfinish = ()=> r.remove(); else setTimeout(()=> r.remove(), 400);
        const svg = muncher.querySelector('svg'); anim(api, svg, [{ transform:'rotate(0deg)' }, { transform:'rotate(360deg)' }], { duration:450, easing:'ease-out' });
        muncher.classList.add('zapped'); setTimeout(()=> muncher.classList.remove('zapped'), 500);
        api.sfx.crackle ? api.sfx.crackle() : api.sfx.buzzer && api.sfx.buzzer(); api.flash && api.flash('lose');
        ui.say(why); loseLife();
      };
      const loseLife = ()=>{ lives--; setLives(); anim(api, livesEl, [{ transform:'scale(1)' }, { transform:'scale(1.25)' }, { transform:'scale(1)' }], { duration:300 }); if (lives <= 0) endRound(false, 'Out of lives!'); };
      // ---- a tap on a tile
      const tap = async (i)=>{
        if (!live || busy || over || flipping.has(i)) return; busy = true;
        if (i !== mIdx) await hop(i); if (over || !live){ busy = false; return; }
        if (glitches.some(g=> g.idx === i)){ busy = false; hurt('A Glitch got you!'); return; }
        chomp();
        const t = tiles[i];
        if (ok[i]){
          eaten++; flipping.add(i); ui.say(eaten + ' of ' + MM_TARGET + ' munched!');
          const [x, y] = center(i); floatText(api, board, x, y - 10, '+1', 'gold'); burst(api, t, ['#ff3fb5', '#27e6ff', '#ffe27a', '#ffffff'], 10);
          api.sfx.ding && api.sfx.ding(); setTimeout(()=> api.sfx.whoosh && api.sfx.whoosh(), 120);
          t.classList.add('eaten', eaten % 2 ? 'p' : 'b');
          later(()=>{ api.sfx.whoosh && api.sfx.whoosh(); t.classList.add('back'); later(()=>{ refill(i); t.classList.remove('eaten', 'p', 'b'); later(()=>{ t.classList.remove('back'); flipping.delete(i); }, 260); }, 240); }, 900);
          if (eaten >= MM_TARGET){ busy = false; endRound(true); return; }
        } else {
          t.classList.remove('nope'); void t.offsetWidth; t.classList.add('nope'); setTimeout(()=> t.classList.remove('nope'), 600);
          const [x, y] = center(i); floatText(api, board, x, y - 10, 'NOPE', 'red');
          api.sfx.buzzer ? api.sfx.buzzer() : api.sfx.wrong(); api.flash && api.flash('lose'); ui.say('Nope! That one does not fit.');
          loseLife();
        }
        setTimeout(()=>{ busy = false; }, 120);
      };
      tiles.forEach((t, i)=> t.addEventListener('click', ()=> tap(i)));
      // ---- the Glitches: a hop about every 1.2 s, the landing tile glows at its edge for 0.5 s first
      const nbrs = (i)=>{ const c = i % MM_COLS, r = Math.floor(i / MM_COLS), o = []; if (c > 0) o.push(i - 1); if (c < MM_COLS - 1) o.push(i + 1); if (r > 0) o.push(i - MM_COLS); if (r < MM_ROWS - 1) o.push(i + MM_COLS); return o; };
      const placeG = (g, i)=>{ g.idx = i; const p = center(i); g.xy = p; g.el.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px)'; };
      const glitchStep = (g)=>{
        if (!live || over) return;
        const taken = glitches.filter(h=> h !== g).map(h=> h.idx), opts = nbrs(g.idx).filter(k=> taken.indexOf(k) < 0);
        if (!opts.length){ g.t = later(()=> glitchStep(g), api.dt(MM_HOP_MS)); return; }
        // now and then it closes in on the muncher
        const dist = (k)=> Math.abs(k % MM_COLS - mIdx % MM_COLS) + Math.abs(Math.floor(k / MM_COLS) - Math.floor(mIdx / MM_COLS));
        const to = api.rng() < 0.4 ? opts.sort((a, b)=> dist(a) - dist(b))[0] : opts[Math.floor(api.rng() * opts.length)];
        const w = tiles[to]; w.classList.remove('warn'); void w.offsetWidth; w.classList.add('warn'); api.sfx.tick && api.sfx.tick(false);
        g.t = later(()=>{
          w.classList.remove('warn'); if (!live) return;
          const from = g.xy; placeG(g, to);
          if (!quiet && g.el.animate){ const mid = [(from[0] + g.xy[0]) / 2, (from[1] + g.xy[1]) / 2 - 26];
            g.el.animate([{ transform:'translate(' + from[0] + 'px,' + from[1] + 'px)' }, { transform:'translate(' + mid[0] + 'px,' + mid[1] + 'px)', offset:0.5 }, { transform:'translate(' + g.xy[0] + 'px,' + g.xy[1] + 'px) scale(1.12,0.88)', offset:0.85 }, { transform:'translate(' + g.xy[0] + 'px,' + g.xy[1] + 'px)' }], { duration:240, easing:'ease-in-out' }); }
          if (to === mIdx) later(()=> hurt('A Glitch landed on you!'), 200);
          g.t = later(()=> glitchStep(g), api.dt(MM_HOP_MS - MM_WARN_MS));
        }, api.dt(MM_WARN_MS));
      };
      const spawnGlitches = (n)=>{
        glitches.forEach(g=>{ clearTimeout(g.t); g.el.remove(); }); glitches = [];
        const starts = [1, 2, 3, 0].filter(k=> k !== mIdx);
        for (let k = 0; k < n; k++){ const el = document.createElement('div'); el.className = 'mm-glitch'; el.innerHTML = GLITCH; board.appendChild(el);
          const g = { el, idx:0, xy:[0, 0], t:0 }; placeG(g, starts[k * 2 % starts.length]); glitches.push(g);
          anim(api, el, [{ opacity:0 }, { opacity:1 }], { duration:300, fill:'both' }); }
      };
      // ---- the rounds
      const snake = ()=> new Promise(res=>{
        if (quiet){ anim(api, board, [{ opacity:0.4 }, { opacity:1 }], { duration:300 }); res(); return; }
        const order = []; for (let r = 0; r < MM_ROWS; r++) for (let c = 0; c < MM_COLS; c++) order.push(r * MM_COLS + (r % 2 ? MM_COLS - 1 - c : c));
        order.forEach((i, k)=> later(()=>{ tiles[i].classList.add('lit'); later(()=> tiles[i].classList.remove('lit'), 320); }, k * 45));
        later(res, order.length * 45 + 320);
      });
      const startRound = async ()=>{
        rule = rules[round]; if (!rule){ end(); return; }
        lives = MM_LIVES; eaten = 0; setLives(); flipping.clear();
        ui.sub('ROUND ' + (round + 1) + ' OF 3 · ' + rule.pack); ruleEl.textContent = rule.text;
        anim(api, ruleEl, [{ opacity:0, transform:'translateY(-6px)' }, { opacity:1, transform:'none' }], { duration:300 });
        fill(); placeM(MM_N - MM_COLS); spawnGlitches(MM_GLITCHES[round] || 0);
        ui.say(round ? (MM_GLITCHES[round] > 1 ? 'Two Glitches! Watch the glowing edges!' : 'A Glitch! Watch the glowing edges!') : 'Munch the tiles that fit the rule!');
        await snake(); if (over) return;
        live = true;
        const bar = ui.ptimer.querySelector('b'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = 'transform ' + (api.dt(MM_ROUND_MS) / 1000) + 's linear'; bar.style.transform = 'scaleX(0)';
        roundT = later(()=> endRound(false, 'Time is up!'), api.dt(MM_ROUND_MS));
        glitches.forEach((g, k)=>{ g.t = later(()=> glitchStep(g), api.dt(MM_HOP_MS + k * 600)); });
        if (testing) window.__mm = { right: ()=> ok.map((v, i)=> v && !flipping.has(i) && !glitches.some(g=> g.idx === i) ? i : -1).filter(i=> i >= 0), wrong: ()=> ok.map((v, i)=> v ? -1 : i).filter(i=> i >= 0), glitches: ()=> glitches.map(g=> g.idx), muncher: ()=> mIdx, live: ()=> live, round: ()=> round };
      };
      const endRound = (won, why)=>{
        if (!live) return; live = false; clearTimeout(roundT); glitches.forEach(g=> clearTimeout(g.t)); tiles.forEach(t=> t.classList.remove('warn'));
        const bar = ui.ptimer.querySelector('b'); const cs = getComputedStyle(bar).transform; bar.style.transition = 'none'; bar.style.transform = cs;
        const lost = MM_LIVES - lives, pts = won ? MM_PTS[Math.min(2, lost)] : 0;
        total += pts; if (won){ cleared++; if (!lost) clean++; } api.score(total);
        if (won){
          // the round-clear mini celebration: the floor lights in a full chase, sparkles and a banner
          board.classList.remove('chase'); void board.offsetWidth; board.classList.add('chase'); later(()=> board.classList.remove('chase'), 1700);
          const b = slam(api, play, 'ROUND CLEAR! +' + pts, 'mmclear'); later(()=> b.remove(), 1500);
          for (let k = 0; k < 4; k++) later(()=> burst(api, tiles[Math.floor(api.rng() * MM_N)], ['#ffe27a', '#ffffff', '#ff3fb5', '#27e6ff'], 12), k * 220);
          api.sfx.levelUp ? api.sfx.levelUp() : api.sfx.ding(); ui.say(lost ? 'Round clear! +' + pts : 'A clean round! +' + pts);
        } else {
          const b = slam(api, play, why === 'Time is up!' ? 'TIME!' : 'ROUND OVER', 'neutral'); later(()=> b.remove(), 1400);
          api.sfx.wrong && api.sfx.wrong(); ui.say(why + ' No points this round.');
        }
        later(()=>{ glitches.forEach(g=> g.el.remove()); glitches = []; round++; if (round < 3) startRound(); else end(); }, 1900);
      };
      const end = ()=>{
        const perfect = clean === 3, win = cleared >= 2;
        ui.say('You scored ' + total + ' of 30!');
        if (perfect){ board.classList.add('wave'); later(()=> board.classList.remove('wave'), 4200); }   // (the floor flashes in a wave under the BIG WIN)
        finale(api, ui, win ? { win:true, perfect, pts:total, word: perfect ? 'PERFECT MUNCH!' : 'MUNCHED!', line: perfect ? 'Three clean rounds! A perfect munch!' : 'Tasty munching, Earthling!' }
          : { win:false, pts:total, lossWord:'AWW!', line:'Those Glitches were hungry too!' });
      };
      api.say && api.say('Munch the tiles that fit the rule!');
      later(startRound, 600);
    },
  });
})();
