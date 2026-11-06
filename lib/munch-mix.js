/* FlipStax - GALACTIC CHOMPS (registry id munchMix; a spare Mystery Game: in the TEST menu as 'Munch Mix', NOT in the show's pools - see data/rundown.js).
   Three boards, MATH, SCIENCE, ENGLISH (data/munch-packs.js): a 4 x 5 board of glass tiles, GC_RIGHT (6) of them fit the board's rule. One tap: the chomper
   hops to the tile and chomps it. A right tile goes blank (a dark socket) and never refills; all the right tiles eaten clears the board: 10 points and
   GC_CLEAR_BONUS (+3) seconds. ONE CLOCK for the whole game, GC_TOTAL_SECONDS (75); when it runs out, on any board, the board is sucked into a BLACK HOLE
   (1 point a chomp on that board, up to 9) and the gentle LOSS. 3 STRIKES for the game: a wrong chomp costs one and the board cracks - the player FALLS
   THROUGH into the next category, keeping that board's points, the clock still running; a strike on board 3 or a third strike is the black hole. Clearing
   board 3 is a HYPERSPACE jump, VICTORY! and the shared BIG WIN. PERFECT: three cleared boards, no strikes. The snake is off (GC_SNAKE = false; its code
   is kept). The chrome and the endings are the shared ones (lib/neo-games.js MG.neo, lib/celebrate.js). No Flip here.
   Transform and opacity only; at most 3 flashes a second; lite mode and reduced motion: plain fades, a still galaxy, no shooting stars. */
(function(){
  const MG = window.MiniGames; if (!MG || !MG.neo) return;
  const { chrome, finale, slam, floatText, burst, anim, wait } = MG.neo;
  // ---- the numbers to tune
  const GC_TOTAL_SECONDS = 75;   // the one clock for the whole game
  const GC_CLEAR_BONUS = 3;      // seconds added for each cleared board
  const GC_RIGHT = 6;            // right tiles on each board (of 20)
  const GC_CLEAR_PTS = 10;       // points for a cleared board (30 at most); a board the clock ends scores 1 a chomp, up to 9
  const GC_STRIKES = 3;          // wrong chomps for the whole game
  const GC_SNAKE = false;        // the snake is off; true brings it back (its code is kept below)
  const GC_STEP_MS = [700, 550, 450], GC_LEN = [3, 4, 5], GC_CHASE = 0.4;   // (the snake, when it is on: a step's time, its length, how often it turns toward the chomper)
  const GC_COLS = 4, GC_ROWS = 5, GC_N = GC_COLS * GC_ROWS, GC_START = 17;   // (the chomper starts on the bottom row, second from the left)
  const GC_ART = 'data/chomps/';
  // the category looks: three glass colours each, a grey for the blank sockets, the galaxy behind
  const GC_LOOK = {
    MATH:    { tiles:['#3FA9FF', '#9B6BFF', '#B8C2D6'], grey:'#B8C2D6', edge:'#3FA9FF', galaxy:'galaxy-math.webp' },
    SCIENCE: { tiles:['#FFB08A', '#2EE6D0', '#FF7DB8'], grey:'#9fb6c4', edge:'#2EE6D0', galaxy:'galaxy-science.webp' },
    ENGLISH: { tiles:['#FF4D5E', '#FF9F2E', '#4DF08C'], grey:'#b7b0a8', edge:'#FF9F2E', galaxy:'galaxy-english.webp' },
  };
  // the text colour that reads best on a tile: dark navy on light glass, cream on dark glass
  const lum = (hex)=>{ const n = parseInt(hex.slice(1), 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v=>{ v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const inkFor = (hex)=> lum(hex) > 0.28 ? '#0b1230' : '#fff4d6';
  // the rules for one show: one from each round's own subject, never the same family twice
  function pickRules(rng){
    const P = window.FLIPSTAX_MUNCH_PACKS || {}, R = window.FLIPSTAX_MUNCH_ROUNDS || [], used = new Set(), out = [];
    R.forEach(rd=>{
      const cands = []; (rd.packs || []).forEach(pk=> (P[pk] ? P[pk].rules : []).forEach(r=>{ if (!used.has(r.family)) cands.push({ r, pack:P[pk].label }); }));
      const c = cands[Math.floor(rng() * cands.length)]; if (!c) return;
      used.add(c.r.family); const m = c.r.make(rng);
      out.push({ id:c.r.id, pack:c.pack, text:m.text, right:m.right.slice(), wrong:m.wrong.slice(), pairs:c.r.pairs || null });
    });
    return out;
  }
  MG.register('munchMix', {
    name: 'Galactic Chomps', colors: ['#3FA9FF', '#9B6BFF', '#0b1230'], bulb: '#ffe27a',
    rule: 'Chomp the tiles that fit the rule!', host: '',
    available: ()=> true,   // (a spare: it plays only where a pool or the TEST menu names it)
    run(api){
      const quiet = api.lite || api.reduced, sfx = api.sfx || {}, S = (k, ...a)=>{ try{ if (sfx[k]) sfx[k](...a); }catch(e){} };
      const set = MG.neo.setLayer(api, 'gc-set', '<i class="gc-galaxy a"></i><i class="gc-galaxy b"></i><i class="gc-streaks"></i><i class="gc-hole"></i>');
      const rules = pickRules(api.rng);
      const ui = chrome(api, { title:'GALACTIC CHOMPS', sub:'ROUND 1 OF 3 · ' + (rules[0] ? rules[0].pack : ''), rule: rules[0] ? rules[0].text : '', msg:'Get ready...' });
      api.overlay.classList.add('nx-gc');
      const ruleEl = api.stage.querySelector('.nx-rule'), play = ui.play;
      ui.panel.classList.add('timed');
      const strikesEl = document.createElement('span'); strikesEl.className = 'gc-strikes'; strikesEl.innerHTML = '<i></i><i></i><i></i>'; ui.panel.appendChild(strikesEl);
      const cells = (cls, inner)=> Array.from({ length:GC_N }, (_, i)=> '<' + (cls === 'gc-tile' ? 'button type="button"' : 'div') + ' class="' + cls + '" data-i="' + i + '">' + (inner || '') + '</' + (cls === 'gc-tile' ? 'button' : 'div') + '>').join('');
      play.innerHTML = '<div class="gc-wrap"><div class="gc-slab"><div class="gc-board">' +
        '<div class="gc-grid gc-tiles">' + cells('gc-tile', '<i class="gc-glass"></i><i class="gc-flash"></i><i class="gc-warn"></i><i class="gc-sock"></i>') + '</div>' +
        '<div class="gc-snake" aria-hidden="true"></div>' +
        '<div class="gc-chomper" aria-hidden="true"><div class="gc-cb"><img class="gc-c" src="' + GC_ART + 'chomper-closed.webp" alt="" draggable="false"><img class="gc-o" src="' + GC_ART + 'chomper-open.webp" alt="" draggable="false"><i class="gc-stars"><b>★</b><b>★</b><b>★</b></i></div></div>' +
        '<div class="gc-grid gc-labels" aria-hidden="true">' + cells('gc-lab', '<b></b>') + '</div>' +
        '<svg class="gc-crack" viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true"><path d="M50 0 L46 18 L55 30 L44 46 L52 60 L40 74 L50 88 L43 104 L48 125 M46 18 L30 26 L18 22 M44 46 L66 52 L80 48 M52 60 L70 72 M40 74 L22 80 L8 78 M50 88 L68 96"/></svg>' +
        '</div></div></div>';
      const wrap = play.querySelector('.gc-wrap'), slab = play.querySelector('.gc-slab'), board = play.querySelector('.gc-board');
      const tiles = [...play.querySelectorAll('.gc-tile')], labs = [...play.querySelectorAll('.gc-lab')], chomper = play.querySelector('.gc-chomper'), cbody = play.querySelector('.gc-cb');
      const snakeEl = play.querySelector('.gc-snake'), crack = play.querySelector('.gc-crack');
      const testing = /[?&](replay|debug)=/.test(location.search);
      let round = 0, total = 0, cleared = 0, strikes = 0, eaten = 0, streak = 0, live = false, busy = false, over = false, rule = null, look = GC_LOOK.MATH;
      let ok = [], val = [], blank = [], cIdx = GC_START, cXY = [0, 0], snake = [], sDir = [0, 1], sNext = -1, sT = 0, timers = [], roundPts = 0;
      const later = (fn, ms)=>{ const t = setTimeout(()=>{ if (!over) fn(); }, ms); timers.push(t); return t; };
      api.onClose = ()=>{ over = true; live = false; timers.forEach(clearTimeout); clearTimeout(sT); };
      const rc = (i)=> [i % GC_COLS, Math.floor(i / GC_COLS)], idx = (c, r)=> r * GC_COLS + c;
      const tileBox = (i)=>{ const t = tiles[i]; return { x:t.offsetLeft, y:t.offsetTop, w:t.offsetWidth, h:t.offsetHeight }; };
      const centre = (i)=>{ const b = tileBox(i); return [b.x + b.w / 2, b.y + b.h / 2]; };
      const setStrikes = ()=> [...strikesEl.children].forEach((l, k)=> l.classList.toggle('off', k < strikes));
      // ---- the board
      const setLook = (pack)=>{
        look = GC_LOOK[pack] || GC_LOOK.MATH;
        slab.style.setProperty('--edge', look.edge); board.style.setProperty('--grey', look.grey); api.overlay.style.setProperty('--edge', look.edge);
        const g = set.querySelectorAll('.gc-galaxy'), on = set.querySelector('.gc-galaxy.on') || g[1], nx = on === g[0] ? g[1] : g[0];
        nx.style.backgroundImage = 'url(' + GC_ART + look.galaxy + ')'; nx.classList.add('on'); on.classList.remove('on');
      };
      const setTile = (i, text, right)=>{
        val[i] = text; ok[i] = right; blank[i] = false;
        const col = look.tiles[(i * 7 + Math.floor(i / GC_COLS)) % 3], b = labs[i].querySelector('b');
        tiles[i].style.setProperty('--tc', col); labs[i].style.setProperty('--ink', inkFor(col));
        b.textContent = text; labs[i].classList.toggle('l', text.length >= 5); labs[i].classList.toggle('xl', text.length >= 7); labs[i].classList.toggle('xxl', text.length >= 9);
        tiles[i].classList.remove('blank', 'nope', 'eaten'); labs[i].classList.remove('gone');
      };
      const fill = ()=>{
        const order = api.shuffle(tiles.map((_, i)=> i)), used = new Set();
        const take = (pool)=>{ const free = api.shuffle(pool.filter(v=> !used.has(v))); const v = free[0] || pool[Math.floor(api.rng() * pool.length)]; used.add(v); return v; };
        let rights = [], wrongs = [];
        if (rule.pairs){   // spelling: most right words come with their own misspelling on the board too
          const ps = api.shuffle(rule.pairs.slice()).slice(0, GC_RIGHT); rights = ps.map(p=> p[0]); wrongs = ps.map(p=> p[1]);
          rights.forEach(v=> used.add(v)); wrongs.forEach(v=> used.add(v));
          while (wrongs.length < GC_N - GC_RIGHT) wrongs.push(take(rule.wrong));
        } else {
          for (let k = 0; k < GC_RIGHT; k++) rights.push(take(rule.right));
          for (let k = 0; k < GC_N - GC_RIGHT; k++) wrongs.push(take(rule.wrong));
        }
        order.forEach((i, k)=> k < GC_RIGHT ? setTile(i, rights[k], true) : setTile(i, wrongs[k - GC_RIGHT], false));
      };
      const rightLeft = ()=> ok.reduce((n, v, i)=> n + (v && !blank[i] ? 1 : 0), 0);
      // ---- the chomper: about 120% of a tile's width, standing on the tile's lower edge, ABOVE the tile text (its own tile's word is hidden while it stands
      // there); it never leaves the board (kept inside it at the top row and the side columns)
      const CW = ()=> tileBox(0).w * 1.2, CH = ()=> CW() / 0.523;
      const anchor = (i)=>{ const b = tileBox(i), w = CW(), h = CH(), bw = board.offsetWidth;
        return [Math.max(w / 2, Math.min(bw - w / 2, b.x + b.w / 2)), Math.max(h, b.y + b.h)]; };
      const placeC = (i)=>{ if (labs[cIdx]) labs[cIdx].classList.remove('under'); cIdx = i; cXY = anchor(i); chomper.style.transform = 'translate(' + cXY[0] + 'px,' + cXY[1] + 'px)'; labs[i].classList.add('under'); };
      const sizeC = ()=>{ chomper.style.setProperty('--cw', CW() + 'px'); const b = tileBox(0); snakeEl.style.setProperty('--tw', Math.min(b.w, b.h) + 'px'); };
      const hop = (i)=> FXK.hop(i);
      // ---- the one clock for the whole game: GC_TOTAL_SECONDS, +GC_CLEAR_BONUS for each cleared board; it runs through the falls too
      let clockEnd = 0, clockT = 0, clockOn = false, timeUp = false;
      const bar = ui.ptimer.querySelector('b');
      const clockLeft = ()=> clockOn ? Math.max(0, clockEnd - performance.now()) : 0;
      const runClock = ()=>{
        clearTimeout(clockT); const left = clockLeft(), full = api.dt(GC_TOTAL_SECONDS * 1000);
        bar.style.transition = 'none'; bar.style.transform = 'scaleX(' + Math.min(1, left / full).toFixed(4) + ')'; void bar.offsetWidth;
        bar.style.transition = 'transform ' + (left / 1000).toFixed(2) + 's linear'; bar.style.transform = 'scaleX(0)';
        clockT = later(onTimeUp, left);
      };
      const startClock = ()=>{ clockOn = true; clockEnd = performance.now() + api.dt(GC_TOTAL_SECONDS * 1000); runClock(); };
      const stopClock = ()=>{ clearTimeout(clockT); const cs = getComputedStyle(bar).transform; bar.style.transition = 'none'; bar.style.transform = cs; };
      const addTime = (s)=>{
        clockEnd += api.dt(s * 1000); runClock();
        const r = ui.panel.getBoundingClientRect(), pr = play.getBoundingClientRect(); floatText(api, play, r.left - pr.left + r.width / 2, r.top - pr.top - 4, '+' + s + 's', 'gold');
        anim(api, ui.ptimer, [{ transform:'scaleY(1)' }, { transform:'scaleY(1.9)' }, { transform:'scaleY(1)' }], { duration:420, easing:'ease-out' });
      };
      const onTimeUp = ()=>{ if (timeUp || over) return; timeUp = true; ui.say('Time is up!'); if (live){ live = false; endRound('time'); } };   // (between boards: the next board checks timeUp)
      // ---- strikes, falls and the board's end
      const strike = (why, kind)=>{
        if (!live) return; live = false; strikes++; setStrikes(); streak = 0;
        anim(api, strikesEl, [{ transform:'scale(1)' }, { transform:'scale(1.3)' }, { transform:'scale(1)' }], { duration:320 });
        ui.say(why);
        endRound(kind === 'bite' ? 'bite' : 'strike');
      };
      // ---- one tap: the chomper hops to the tile AND chomps it. A tap while it is busy is kept (only the latest), and played as soon as the
      // current hop or chomp ends - nothing is cut off half way, nothing is scored twice.
      let want = -1, running = false;
      const tap = (i)=>{ if (!live || over || ending) return; want = i; if (!running) runTaps(); };
      const runTaps = async ()=>{
        running = true;
        while (want >= 0 && live && !over && !ending){
          const i = want; want = -1;
          if (i !== cIdx){ busy = true; S('tap', 'top'); await hop(i); busy = false; if (over || !live) break; if (want >= 0) continue; }
          await doChomp(i);
        }
        running = false;
      };
      const doChomp = async (i)=>{
        if (!live || over || ending) return;
        if (i == null) i = cIdx;
        if (blank[i]){ ui.say('Already chomped! Tap a lit tile.'); return; }
        busy = true;
        if (GC_SNAKE && snake.indexOf(i) >= 0){ FXK.bite(i); busy = false; strike('The snake bit you! SSSS!', 'bite'); return; }
        if (ok[i]){
          blank[i] = true; eaten++; streak++; roundPts = eaten;
          const last = !rightLeft();
          if (last){ live = false; clearTimeout(sT); tiles.forEach(t=> t.classList.remove('warn')); }   // (the last right tile: the board is won now)
          S('clack'); FXK.star && FXK.star(); await FXK.chomp(i, eaten); busy = false; if (over || (ending && !last)) return;
          ui.say(!last ? eaten + ' chomped! ' + rightLeft() + ' to go.' : 'Board clear!');
          if (last) endRound('clear');
          return;
        }
        S('buzzer'); await FXK.nope(i); busy = false;
        strike('Nope! That one does not fit.', 'nope');
      };
      tiles.forEach((t, i)=> t.addEventListener('click', ()=> tap(i)));
      // ---- the snake (off while GC_SNAKE is false; the code stays so it can come back): one tile a step, never reversing; its next tile glows first
      const nbr = (i, d)=>{ const [c, r] = rc(i), nc = c + d[0], nr = r + d[1]; return nc < 0 || nr < 0 || nc >= GC_COLS || nr >= GC_ROWS ? -1 : idx(nc, nr); };
      const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const chooseNext = ()=>{
        const head = snake[0], opts = DIRS.filter(d=> !(d[0] === -sDir[0] && d[1] === -sDir[1])).map(d=> ({ d, to: nbr(head, d) })).filter(o=> o.to >= 0);
        const free = opts.filter(o=> snake.indexOf(o.to) < 0), pool = free.length ? free : opts;
        if (!pool.length) return null;
        const dist = (k)=>{ const [a, b] = rc(k), [c, d] = rc(cIdx); return Math.abs(a - c) + Math.abs(b - d); };
        if (api.rng() < GC_CHASE) return pool.slice().sort((p, q)=> dist(p.to) - dist(q.to))[0];
        const straight = pool.find(o=> o.d[0] === sDir[0] && o.d[1] === sDir[1]);
        if (straight && api.rng() < 0.55) return straight;
        return pool[Math.floor(api.rng() * pool.length)];
      };
      const warnNext = ()=>{ tiles.forEach(t=> t.classList.remove('warn')); const n = chooseNext(); if (!n) return; sNext = n; const w = tiles[n.to]; void w.offsetWidth; w.classList.add('warn'); S('tick', false); };
      const stepSnake = ()=>{
        if (!live || over) return;
        const n = sNext; tiles.forEach(t=> t.classList.remove('warn'));
        if (n){ sDir = n.d; snake.unshift(n.to); snake.length = GC_LEN[round]; FXK.drawSnake(true); }
        if (snake[0] === cIdx){ FXK.bite(cIdx); strike('The snake bit you! SSSS!', 'bite'); return; }
        warnNext();
        sT = later(stepSnake, api.dt(GC_STEP_MS[round]));
      };
      const startSnake = ()=>{
        if (!GC_SNAKE){ snake = []; snakeEl.innerHTML = ''; return; }
        const L = GC_LEN[round], path = [7, 3, 2, 1, 0];   // (it comes in at the top right, its head on the second row, heading down)
        snake = path.slice(0, L); sDir = [0, 1]; FXK.drawSnake(false);
        warnNext(); sT = later(stepSnake, api.dt(GC_STEP_MS[round]));
      };
      // ---- the boards
      let ending = false;
      const startRound = async ()=>{
        rule = rules[round]; if (!rule){ end(false); return; }
        if (timeUp){ await FXK.blackHole(); end(false); return; }
        eaten = 0; roundPts = 0; streak = 0; ending = false; want = -1;
        ui.sub('ROUND ' + (round + 1) + ' OF 3 · ' + rule.pack); ruleEl.textContent = rule.text;
        anim(api, ruleEl, [{ opacity:0, transform:'translateY(-6px)' }, { opacity:1, transform:'none' }], { duration:300 });
        setLook(rule.pack); fill(); sizeC(); placeC(GC_START); chomper.classList.remove('woozy', 'open');
        await FXK.arrive(rule.pack); if (over) return;
        if (timeUp){ await FXK.blackHole(); end(false); return; }
        ui.say(round === 0 ? 'Tap a tile to chomp it!' : round === 1 ? 'Board 2! Beat the clock!' : 'Last board! Beat the clock!');
        live = true;
        if (!clockOn) startClock();
        startSnake();
        if (testing) window.__gc = { right: ()=> ok.map((v, i)=> v && !blank[i] && snake.indexOf(i) < 0 ? i : -1).filter(i=> i >= 0), wrong: ()=> ok.map((v, i)=> !v && snake.indexOf(i) < 0 ? i : -1).filter(i=> i >= 0),
          chomper: ()=> cIdx, snake: ()=> snake.slice(), live: ()=> live, round: ()=> round, strikes: ()=> strikes, total: ()=> total, tap, chomp: doChomp, busy: ()=> busy || running,
          left: ()=> Math.round(clockLeft()), freeze: ()=>{ clearTimeout(sT); tiles.forEach(t=> t.classList.remove('warn')); } };   // (tests only: ?replay or ?debug)
      };
      const endRound = async (how)=>{
        if (ending) return; ending = true;
        live = false; want = -1; clearTimeout(sT); tiles.forEach(t=> t.classList.remove('warn'));
        const pts = how === 'clear' ? GC_CLEAR_PTS : Math.min(9, roundPts);
        total += pts; if (how === 'clear') cleared++; api.score(total);
        if (how === 'clear'){
          S('levelUp');
          if (round >= 2){ stopClock(); await FXK.hyperspace(); end(true); return; }
          addTime(GC_CLEAR_BONUS);
          await FXK.roundClear(pts);
        } else if (how === 'time'){
          stopClock(); await FXK.blackHole(); end(false); return;
        } else {
          if (round >= 2 || strikes >= GC_STRIKES){ stopClock(); await FXK.blackHole(); end(false); return; }
          await FXK.fall();
        }
        if (over) return;
        round++; startRound();
      };
      const end = (won)=>{
        if (over) return;
        clearTimeout(clockT);
        const perfect = won && cleared === 3 && strikes === 0;
        ui.say('You scored ' + total + ' of 30!');
        finale(api, ui, won ? { win:true, perfect, pts:total, word: perfect ? 'PERFECT CHOMPS!' : 'VICTORY!', line: perfect ? 'Three boards, no strikes! A perfect feast!' : 'Galactic chomping, Earthling!' }
          : { win:false, pts:total, lossWord:'AWW!', line: strikes >= GC_STRIKES ? 'Three strikes - the galaxy got the last bite!' : timeUp ? 'The clock ran out - the black hole got hungry!' : 'The black hole got hungry too!' });
      };
      // the snake's look: the head (snake-head.webp, drawn facing down) turned to its direction of travel; slim body segments shrinking toward the tail,
      // magenta at the neck to orange at the tail
      const ROT = (d)=> d[0] === 1 ? -90 : d[0] === -1 ? 90 : d[1] === -1 ? 180 : 0;
      const segCol = (n, L)=>{ const t = L > 1 ? n / (L - 1) : 0, a = [224, 40, 124], b = [255, 140, 40]; return 'rgb(' + a.map((v, k)=> Math.round(v + (b[k] - v) * t)).join(',') + ')'; };
      const snakeHtml = ()=> snake.map((k, n)=>{ const [x, y] = centre(k);
        if (!n) return '<i class="gc-head" style="transform:translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px);--rot:' + ROT(sDir) + 'deg"><img src="' + GC_ART + 'snake-head.webp" alt="" draggable="false"></i>';
        return '<i class="gc-seg" style="transform:translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px);--sz:' + (1 - 0.13 * (n - 1)).toFixed(2) + ';--sc:' + segCol(n, snake.length) + '"></i>'; }).reverse().join('');
      // ==================================================================== the effects (FXK)
      // GC-FX-BEGIN
      // Every effect is transform and opacity only (WAAPI); lite mode and reduced motion get plain, short fades (A = anim, a no-op there).
      const A = (el, frames, opts)=> (!quiet && el && el.animate) ? el.animate(frames, opts) : null;
      const done = (a, ms)=> a ? new Promise(r=>{ a.onfinish = r; a.oncancel = r; }) : wait(ms || 0);
      const cancelAll = ()=> [slab, chomper, cbody, crack, ...tiles, ...labs].forEach(e=>{ try{ e.getAnimations().forEach(a=> a.cancel()); }catch(err){} });
      const rim = document.createElement('i'); rim.className = 'gc-rimflash'; slab.appendChild(rim);
      const mouth = ()=> [cXY[0], cXY[1] - CH() * 0.62];
      const ring = (x, y, cls, to)=>{ const r = document.createElement('i'); r.className = 'gc-ring' + (cls ? ' ' + cls : ''); r.style.left = x + 'px'; r.style.top = y + 'px'; board.appendChild(r);
        const a = A(r, [{ transform:'scale(0.4)', opacity:1 }, { transform:'scale(' + (to || 4) + ')', opacity:0 }], { duration:520, easing:'ease-out', fill:'forwards' }); done(a, 420).then(()=> r.remove()); };
      const crumbs = (x, y)=>{ if (quiet) return; for (let k = 0; k < 12; k++){ const b = document.createElement('i'); b.className = 'gc-bit'; b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.background = look.tiles[k % 3]; board.appendChild(b);
        const a0 = k / 12 * Math.PI * 2 + api.rng() * 0.4, d = 26 + api.rng() * 26;
        A(b, [{ transform:'translate(0,0) scale(1)', opacity:1 }, { transform:'translate(' + (Math.cos(a0) * d).toFixed(1) + 'px,' + (Math.sin(a0) * d - 10).toFixed(1) + 'px) scale(0.4)', opacity:0 }], { duration:560, easing:'ease-out', fill:'forwards' }).onfinish = ()=> b.remove(); } };
      const stamp = (text, cls, x, y)=>{ const b = slam(api, board, text, cls); if (x != null){ b.style.left = x + 'px'; b.style.top = y + 'px'; } setTimeout(()=> b.remove(), api.dt(800)); };
      let segEls = [];
      const FXK = {
        // a hop: an arc to the tile (about 0.2 s) with a squash and stretch on landing
        hop: (i)=>{
          const from = cXY; placeC(i); const to = cXY;
          const T = (p)=> 'translate(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px)', mid = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - tileBox(0).h * 0.45];
          const a = A(chomper, [{ transform:T(from) }, { transform:T(mid), offset:0.5 }, { transform:T(to) }], { duration:200, easing:'ease-in-out' });
          A(cbody, [{ transform:'scale(0.92, 1.1)' }, { transform:'scale(1, 1)', offset:0.6 }, { transform:'scale(1.16, 0.84)', offset:0.85 }, { transform:'scale(1, 1)' }], { duration:260, easing:'ease-out' });
          return done(a, 0);
        },
        // a right chomp (about 0.9 s): the mouth opens, the tile flashes neon, spins into the mouth, the mouth snaps shut with puffed cheeks, crumbs and +1
        chomp: async (i, n)=>{
          const t = tiles[i], lab = labs[i], [cx, cy] = centre(i), box = tileBox(i);
          chomper.classList.add('open'); A(cbody, [{ transform:'scale(1)' }, { transform:'scale(1.15)' }], { duration:140, fill:'forwards' });
          t.classList.remove('p', 'b'); t.classList.add(n % 2 ? 'p' : 'b');
          A(t.querySelector('.gc-flash'), [{ opacity:0 }, { opacity:1, offset:0.4 }, { opacity:0.85 }], { duration:220, fill:'forwards' });
          await wait(quiet ? 60 : 200); if (over) return;
          // the piece that gets eaten: a copy of the tile with its word
          const fly = document.createElement('div'); fly.className = 'gc-fly'; fly.style.cssText = 'left:' + box.x + 'px;top:' + box.y + 'px;width:' + box.w + 'px;height:' + box.h + 'px;background:' + (n % 2 ? '#ff3fb5' : '#27e6ff');
          fly.innerHTML = '<b>' + lab.querySelector('b').innerHTML + '</b>'; board.appendChild(fly);
          t.classList.add('blank'); lab.classList.add('gone'); t.querySelector('.gc-flash').getAnimations().forEach(a=> a.cancel());
          const [mx, my] = mouth(), dx = mx - cx, dy = my - cy;
          const fa = A(fly, [{ transform:'translate(0,0) scale(1) rotate(0deg)', opacity:1 }, { transform:'translate(' + (dx * 0.5).toFixed(1) + 'px,' + (dy * 0.5 - 8).toFixed(1) + 'px) scale(0.55) rotate(90deg)', opacity:1, offset:0.5 },
            { transform:'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(0) rotate(180deg)', opacity:0.9 }], { duration:320, easing:'cubic-bezier(.5,0,.8,.6)', fill:'forwards' });
          await done(fa, 60); fly.remove(); if (over) return;
          // the mouth snaps shut; the cheeks puff
          chomper.classList.remove('open'); S('clack');
          A(cbody, [{ transform:'scale(1.15)' }, { transform:'scale(1.22, 0.9)', offset:0.35 }, { transform:'scale(1.12, 1)', offset:0.7 }, { transform:'scale(1)' }], { duration:240, easing:'ease-out' });
          crumbs(mx, my); floatText(api, board, cx, cy - 6, '+1', 'gold'); ring(cx, cy, '', 4);
          const sr = document.createElement('i'); sr.className = 'gc-sockring'; t.appendChild(sr); done(A(sr, [{ opacity:1 }, { opacity:0 }], { duration:1500, fill:'forwards' }), 0).then(()=> sr.remove());
          if (n % 3 === 0) stamp('CHOMP!', 'gcpop', cx, cy - box.h * 0.6);
          if (streak > 0 && streak % 5 === 0) A(rim, [{ opacity:0 }, { opacity:1, offset:0.35 }, { opacity:0 }], { duration:650 });
          await wait(quiet ? 100 : 220);
        },
        // a wrong chomp: the tile flashes red and shakes, NOPE, the chomper goes woozy
        nope: async (i)=>{
          const t = tiles[i], [cx, cy] = centre(i); t.classList.add('nope'); chomper.classList.add('woozy');
          A(t.querySelector('.gc-flash'), [{ opacity:0 }, { opacity:1, offset:0.3 }, { opacity:0.7 }], { duration:500, fill:'forwards' });
          const sh = [{ transform:'translateX(0)' }, { transform:'translateX(-7px)', offset:0.2 }, { transform:'translateX(6px)', offset:0.45 }, { transform:'translateX(-3px)', offset:0.7 }, { transform:'translateX(0)' }];
          A(t, sh, { duration:420 }); A(labs[i], sh, { duration:420 });
          floatText(api, board, cx, cy - 6, 'NOPE', 'red');
          await wait(api.dt(700));
        },
        // a bite: a red ring and an SSSS! stamp; the chomper goes woozy
        bite: (i)=>{ const [cx, cy] = centre(i); ring(cx, cy, 'bite', 5); stamp('SSSS!', 'gcpop bite', cx, cy - tileBox(0).h * 0.6); chomper.classList.add('woozy'); S('buzzer'); },
        // the snake: one element a segment; a step slides every segment to the next cell (transform transitions), the head turns to its new direction
        drawSnake: (moving)=>{
          if (segEls.length !== snake.length){ snakeEl.innerHTML = snakeHtml(); segEls = [...snakeEl.children].reverse(); }
          const ms = Math.round(api.dt(GC_STEP_MS[round]) * 0.8);
          segEls.forEach((e, n)=>{ const [x, y] = centre(snake[n]); e.style.transition = moving && !quiet ? 'transform ' + ms + 'ms linear' : 'none'; e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; });
          const img = segEls[0] && segEls[0].querySelector('img'); if (img){ img.style.transition = moving && !quiet ? 'transform 160ms ease-out' : 'none'; img.style.transform = 'translate(-50%, -50%) rotate(' + ROT(sDir) + 'deg)'; }
        },
        // a new board: it slides in from above with a short category splash
        arrive: async (pack)=>{
          cancelAll(); crack.style.opacity = 0; segEls = []; snakeEl.innerHTML = '';
          const sp = slam(api, play, pack, 'gcsplash'); S('whoosh');
          const a = A(slab, [{ transform:'translateY(-120%)', opacity:0 }, { transform:'translateY(4%)', opacity:1, offset:0.75 }, { transform:'translateY(0)', opacity:1 }], { duration:650, easing:'ease-out' });
          if (!a) A(slab, [{ opacity:0 }, { opacity:1 }], { duration:300 });
          await wait(api.dt(950)); sp.remove();
        },
        // a cleared board: the fanfare, a banner and sparkles; then it falls away
        roundClear: async (pts)=>{
          const b = slam(api, play, 'BOARD CLEAR! +' + pts, 'gcclear');
          for (let k = 0; k < 3; k++) setTimeout(()=> burst(api, tiles[Math.floor(api.rng() * GC_N)], look.tiles.concat('#ffffff'), 12), k * 200);
          A(rim, [{ opacity:0 }, { opacity:1, offset:0.3 }, { opacity:0 }], { duration:800 });
          await wait(api.dt(1300)); b.remove();
          await FXK.away();
        },
        away: async ()=>{ S('whoosh'); const a = A(slab, [{ transform:'translateY(0)', opacity:1 }, { transform:'translateY(130%) rotate(4deg)', opacity:0 }], { duration:520, easing:'ease-in', fill:'forwards' }); await done(a, 250); },
        // the fall-through: a crack spreads, the tiles drop away, the chomper tumbles
        fall: async ()=>{
          S('crackle'); crack.style.opacity = 1;
          const ca = A(crack, [{ transform:'scale(0.2)', opacity:0 }, { transform:'scale(1)', opacity:1 }], { duration:300, easing:'ease-out', fill:'forwards' });
          await done(ca, 300); await wait(api.dt(250)); if (over) return;
          S('whoosh');
          tiles.forEach((t, i)=>{ const d = 40 + api.rng() * 220, r = (api.rng() - 0.5) * 70, fr = [{ transform:'translate(0,0) rotate(0deg)', opacity:1 }, { transform:'translate(' + ((api.rng() - 0.5) * 40).toFixed(0) + 'px, 140%) rotate(' + r.toFixed(0) + 'deg)', opacity:0 }];
            A(t, fr, { duration:620, delay:d, easing:'ease-in', fill:'forwards' }); A(labs[i], fr, { duration:620, delay:d, easing:'ease-in', fill:'forwards' }); });
          A(snakeEl, [{ opacity:1 }, { opacity:0 }], { duration:400, fill:'forwards' });
          A(cbody, [{ transform:'translateY(0) rotate(0deg)', opacity:1 }, { transform:'translateY(' + (tileBox(0).h * 2.2).toFixed(0) + 'px) rotate(540deg) scale(0.6)', opacity:0 }], { duration:850, easing:'ease-in', fill:'forwards' });
          A(crack, [{ opacity:1 }, { opacity:0 }], { duration:500, delay:300, fill:'forwards' });
          await wait(api.dt(quiet ? 400 : 950)); crack.style.opacity = 0;
          try{ snakeEl.getAnimations().forEach(a=> a.cancel()); }catch(e){}
        },
        // the black hole: the slab tilts, shrinks and spirals into a hole at the centre while the galaxy bends toward it
        blackHole: async ()=>{
          const hole = set.querySelector('.gc-hole'), gal = set.querySelector('.gc-galaxy.on'); S('vaultBoom');
          if (quiet){ hole.style.transform = 'scale(1)'; A(hole, [{ opacity:0 }, { opacity:1 }], { duration:1 }); hole.style.opacity = 1; slab.style.opacity = 0.0; await wait(900); hole.style.opacity = 0; slab.style.opacity = ''; return; }
          A(hole, [{ transform:'scale(0)', opacity:0 }, { transform:'scale(1)', opacity:1 }], { duration:600, easing:'ease-out', fill:'forwards' });
          A(gal, [{ transform:'rotate(0deg) scale(1)' }, { transform:'rotate(70deg) scale(0.82)' }], { duration:2200, easing:'ease-in', fill:'forwards', composite:'add' });
          const sr = slab.getBoundingClientRect(), hy = innerHeight * 0.46 - (sr.top + sr.height / 2), hx = innerWidth / 2 - (sr.left + sr.width / 2);
          await done(A(slab, [{ transform:'perspective(900px) rotateX(0deg)' }, { transform:'perspective(900px) rotateX(38deg) scale(0.9)' }], { duration:350, easing:'ease-out', fill:'forwards' }), 0);
          const a = A(slab, [{ transform:'perspective(900px) rotateX(38deg) scale(0.9) translate(0,0) rotate(0deg)', opacity:1 },
            { transform:'perspective(900px) rotateX(30deg) translate(' + (hx * 0.6).toFixed(0) + 'px,' + (hy * 0.6).toFixed(0) + 'px) rotate(360deg) scale(0.4)', opacity:1, offset:0.6 },
            { transform:'perspective(900px) rotateX(20deg) translate(' + hx.toFixed(0) + 'px,' + hy.toFixed(0) + 'px) rotate(720deg) scale(0)', opacity:0 }], { duration:1300, easing:'cubic-bezier(.5,0,.9,.5)', fill:'forwards' });
          await done(a, 0); S('vaultBoom');
          await done(A(hole, [{ transform:'scale(1)', opacity:1 }, { transform:'scale(1.25)', opacity:1, offset:0.3 }, { transform:'scale(0)', opacity:0 }], { duration:600, easing:'ease-in', fill:'forwards' }), 0);
        },
        // the hyperspace jump: the galaxy streaks into light lines, the board and the chomper shoot forward, VICTORY! slams in
        hyperspace: async ()=>{
          const st = set.querySelector('.gc-streaks'), gal = set.querySelector('.gc-galaxy.on'); S('ufoBeam'); S('sweep');
          if (quiet){ A(st, [{ opacity:0 }, { opacity:0.6 }], { duration:1 }); st.style.opacity = 0.5; slab.style.opacity = 0; const v = slam(api, play, 'VICTORY!', 'gcvictory'); await wait(1200); v.remove(); st.style.opacity = 0; slab.style.opacity = ''; return; }
          A(st, [{ transform:'scale(0.3)', opacity:0 }, { transform:'scale(1.2)', opacity:1, offset:0.5 }, { transform:'scale(2.6)', opacity:0 }], { duration:1500, easing:'ease-in', fill:'forwards' });
          A(gal, [{ transform:'scale(1)' }, { transform:'scale(1.8)' }], { duration:1500, easing:'ease-in', fill:'forwards', composite:'add' });
          A(slab, [{ transform:'scale(1)', opacity:1 }, { transform:'scale(0.92)', opacity:1, offset:0.25 }, { transform:'scale(2.6) translateY(-6%)', opacity:0 }], { duration:900, easing:'cubic-bezier(.6,0,.9,.4)', fill:'forwards' });
          await wait(700); S('vaultFanfare');
          const v = slam(api, play, 'VICTORY!', 'gcvictory'); await wait(1300); v.remove();
        },
      };
      // GC-FX-END
      api.say && api.say('Tap the tiles that fit the rule!');
      later(startRound, 600);
    },
  });
})();
