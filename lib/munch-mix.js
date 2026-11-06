/* FlipStax - GALACTIC CHOMPS (registry id munchMix; a spare Mystery Game: in the TEST menu as 'Munch Mix', NOT in the show's pools - see data/rundown.js).
   Three rounds, MATH, SCIENCE, ENGLISH (data/munch-packs.js): a 4 x 5 board of glass tiles, about 7 of them (35%) fit the round's rule.
   Tap a tile and the chomper HOPS there (safe, even on a wrong tile); the gold CHOMP button (or a tap on the chomper's own tile) eats it. A right tile goes
   blank (a dark socket) and never refills; all the right tiles eaten within 45 s clears the round (10 points). If the clock runs out first the round scores
   1 per right tile eaten. 3 STRIKES for the whole game: a wrong chomp or a snake bite costs one and the board cracks - the player FALLS THROUGH into the next
   category, keeping that round's points. A strike or a timeout on round 3 sucks the board into a BLACK HOLE (then the gentle LOSS). Clearing round 3 is a
   HYPERSPACE jump and VICTORY; two or more cleared rounds then win (the shared BIG WIN), otherwise the gentle LOSS. PERFECT: all three cleared, no strikes.
   The SNAKE slithers one tile a step (0.7 s / 0.55 s / 0.45 s; 3, 4 and 5 segments), never reversing, turning toward the chomper about 40% of the time; the
   tile its head will enter next glows at its rim first. Its head entering the chomper's tile, or a chomp on a tile it is on, is a bite.
   The chrome (sign, banner, status pill, score pill, frame) and the endings are the shared ones (lib/neo-games.js MG.neo, lib/celebrate.js). No Flip here.
   Transform and opacity only; at most 3 flashes a second; lite mode and reduced motion: plain fades and a still galaxy. */
(function(){
  const MG = window.MiniGames; if (!MG || !MG.neo) return;
  const { chrome, finale, slam, floatText, burst, anim, wait } = MG.neo;
  const GC_COLS = 4, GC_ROWS = 5, GC_N = GC_COLS * GC_ROWS, GC_RIGHT = 7, GC_ROUND_MS = 45000, GC_CLEAR_PTS = 10, GC_STRIKES = 3;
  const GC_STEP_MS = [700, 550, 450], GC_LEN = [3, 4, 5], GC_CHASE = 0.4, GC_START = 17;   // (the chomper starts on the bottom row, second from the left)
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
        '</div></div></div><button type="button" class="nx-gold gc-chomp">CHOMP!</button>';
      const wrap = play.querySelector('.gc-wrap'), slab = play.querySelector('.gc-slab'), board = play.querySelector('.gc-board');
      const tiles = [...play.querySelectorAll('.gc-tile')], labs = [...play.querySelectorAll('.gc-lab')], chomper = play.querySelector('.gc-chomper'), cbody = play.querySelector('.gc-cb');
      const snakeEl = play.querySelector('.gc-snake'), chompBtn = play.querySelector('.gc-chomp'), crack = play.querySelector('.gc-crack');
      const testing = /[?&](replay|debug)=/.test(location.search);
      let round = 0, total = 0, cleared = 0, strikes = 0, eaten = 0, streak = 0, live = false, busy = false, over = false, rule = null, look = GC_LOOK.MATH;
      let ok = [], val = [], blank = [], cIdx = GC_START, cXY = [0, 0], snake = [], sDir = [0, 1], sNext = -1, sT = 0, timers = [], roundT = 0, roundPts = 0;
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
      // ---- the chomper: stands on a tile (feet at its lower edge, under the tile text), hops in an arc
      const anchor = (i)=>{ const b = tileBox(i); return [b.x + b.w / 2, b.y + b.h]; };
      const placeC = (i)=>{ cIdx = i; cXY = anchor(i); chomper.style.transform = 'translate(' + cXY[0] + 'px,' + cXY[1] + 'px)'; };
      const sizeC = ()=>{ const b = tileBox(0); chomper.style.setProperty('--th', b.h + 'px'); snakeEl.style.setProperty('--tw', Math.min(b.w, b.h) + 'px'); };
      const hop = (i)=> FXK.hop(i);
      // ---- strikes, falls and the round's end
      const strike = (why, kind)=>{
        if (!live) return; live = false; strikes++; setStrikes(); streak = 0;
        anim(api, strikesEl, [{ transform:'scale(1)' }, { transform:'scale(1.3)' }, { transform:'scale(1)' }], { duration:320 });
        ui.say(why);
        endRound(kind === 'bite' ? 'bite' : 'strike');
      };
      // ---- a tap on a tile: hop there first; a tap on the chomper's own tile (or the CHOMP button) chomps
      const tap = async (i)=>{
        if (!live || busy || over) return;
        if (i !== cIdx){ busy = true; S('tap', 'top'); await hop(i); busy = false; return; }
        doChomp();
      };
      const doChomp = async ()=>{
        if (!live || busy || over) return;
        const i = cIdx;
        if (blank[i]){ ui.say('Already chomped! Hop to another tile.'); return; }
        busy = true;
        if (snake.indexOf(i) >= 0){ FXK.bite(i); busy = false; strike('The snake bit you! SSSS!', 'bite'); return; }
        if (ok[i]){
          blank[i] = true; eaten++; streak++; roundPts = eaten;
          S('clack'); await FXK.chomp(i, eaten); if (over) return;
          ui.say(rightLeft() ? eaten + ' chomped! ' + rightLeft() + ' to go.' : 'All chomped!');
          if (!rightLeft()){ busy = false; endRound('clear'); return; }
        } else {
          S('buzzer'); await FXK.nope(i); busy = false;
          strike('Nope! That one does not fit.', 'nope'); return;
        }
        busy = false;
      };
      tiles.forEach((t, i)=> t.addEventListener('click', ()=> tap(i)));
      chompBtn.addEventListener('click', ()=> doChomp());
      // ---- the snake: one tile a step, never reversing; the head's next tile glows at its rim first
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
        const L = GC_LEN[round], path = [7, 3, 2, 1, 0];   // (it comes in at the top right, its head on the second row, heading down)
        snake = path.slice(0, L); sDir = [0, 1]; FXK.drawSnake(false);
        warnNext(); sT = later(stepSnake, api.dt(GC_STEP_MS[round]));
      };
      // ---- the rounds
      const startRound = async ()=>{
        rule = rules[round]; if (!rule){ end(false); return; }
        eaten = 0; roundPts = 0; streak = 0;
        ui.sub('ROUND ' + (round + 1) + ' OF 3 · ' + rule.pack); ruleEl.textContent = rule.text;
        anim(api, ruleEl, [{ opacity:0, transform:'translateY(-6px)' }, { opacity:1, transform:'none' }], { duration:300 });
        setLook(rule.pack); fill(); sizeC(); placeC(GC_START); chomper.classList.remove('woozy', 'open');
        await FXK.arrive(rule.pack); if (over) return;
        ui.say(round === 0 ? 'Tap a tile to hop, then CHOMP!' : round === 1 ? 'Faster snake! Watch the glowing rims!' : 'Last round! The snake is hungry!');
        live = true;
        const bar = ui.ptimer.querySelector('b'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = 'transform ' + (api.dt(GC_ROUND_MS) / 1000) + 's linear'; bar.style.transform = 'scaleX(0)';
        roundT = later(()=>{ if (live){ live = false; ui.say('Time! ' + eaten + ' chomped.'); endRound('time'); } }, api.dt(GC_ROUND_MS));
        startSnake();
        if (testing) window.__gc = { right: ()=> ok.map((v, i)=> v && !blank[i] && snake.indexOf(i) < 0 ? i : -1).filter(i=> i >= 0), wrong: ()=> ok.map((v, i)=> !v && snake.indexOf(i) < 0 ? i : -1).filter(i=> i >= 0),
          chomper: ()=> cIdx, snake: ()=> snake.slice(), live: ()=> live, round: ()=> round, strikes: ()=> strikes, total: ()=> total, tap, chomp: doChomp, busy: ()=> busy };
      };
      const endRound = async (how)=>{
        live = false; clearTimeout(roundT); clearTimeout(sT); tiles.forEach(t=> t.classList.remove('warn'));
        const bar = ui.ptimer.querySelector('b'); const cs = getComputedStyle(bar).transform; bar.style.transition = 'none'; bar.style.transform = cs;
        const pts = how === 'clear' ? GC_CLEAR_PTS : roundPts;
        total += pts; if (how === 'clear') cleared++; api.score(total);
        const last = round >= 2 || strikes >= GC_STRIKES;
        if (how === 'clear'){
          S('levelUp');
          if (round >= 2){ await FXK.hyperspace(); end(true); return; }
          await FXK.roundClear(pts);
        } else if (how === 'time'){
          if (last){ await FXK.blackHole(); end(false); return; }
          const b = slam(api, play, 'TIME! +' + pts, 'neutral'); await wait(api.dt(1100)); b.remove();
        } else {
          if (last){ await FXK.blackHole(); end(false); return; }
          await FXK.fall();
        }
        if (over) return;
        round++; startRound();
      };
      const end = (reachedEnd)=>{
        if (over) return;
        const perfect = cleared === 3 && strikes === 0, win = reachedEnd && cleared >= 2;
        ui.say('You scored ' + total + ' of 30!');
        finale(api, ui, win ? { win:true, perfect, pts:total, word: perfect ? 'PERFECT CHOMPS!' : 'VICTORY!', line: perfect ? 'Three boards, no strikes! A perfect feast!' : 'Galactic chomping, Earthling!' }
          : { win:false, pts:total, lossWord:'AWW!', line: strikes >= GC_STRIKES ? 'Three strikes - the galaxy got the last bite!' : 'The black hole got hungry too!' });
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
      const FXK = {
        hop: (i)=>{ placeC(i); return Promise.resolve(); },
        chomp: (i)=>{ tiles[i].classList.add('blank'); labs[i].classList.add('gone'); floatText(api, board, centre(i)[0], centre(i)[1], '+1', 'gold'); return wait(120); },
        nope: (i)=>{ tiles[i].classList.add('nope'); floatText(api, board, centre(i)[0], centre(i)[1], 'NOPE', 'red'); return wait(500); },
        bite: (i)=>{ floatText(api, board, centre(i)[0], centre(i)[1], 'SSSS!', 'red'); },
        drawSnake: ()=>{ snakeEl.innerHTML = snakeHtml(); },
        arrive: ()=> wait(300),
        roundClear: (pts)=>{ const b = slam(api, play, 'BOARD CLEAR! +' + pts, 'gcclear'); return wait(1200).then(()=> b.remove()); },
        fall: ()=> wait(600),
        blackHole: ()=> wait(600),
        hyperspace: ()=> wait(600),
      };
      // GC-FX-END
      chompBtn.style.touchAction = 'manipulation';
      api.say && api.say('Chomp the tiles that fit the rule!');
      later(startRound, 600);
    },
  });
})();
