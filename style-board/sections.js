/* FlipStax style board - the sample screens (shared by both directions).
   Builds one phone-width sample of every screen type into #board and wires
   the taps. The look comes entirely from the page's own CSS (its tokens
   block and components); each screen gets a .w-<name> class for its colour
   world and a .stage with the content. Nothing here talks to the game. */
(function(){
  const $ = (s, el)=> (el || document).querySelector(s), $$ = (s, el)=> [...(el || document).querySelectorAll(s)];
  const ALIEN = ()=> '<div class="alien" aria-hidden="true">' + FX.alienSvg() + '</div>';
  const RESET = (label)=> '<button class="btn btn-ghost reset" type="button">' + (label || '↺ Again') + '</button>';

  const SCREENS = [
    { id:'entry', name:'Entry screen', sig:'The logo drops in letter by letter; the mode buttons pop with a burst.', hint:'Tap a mode button. Tap the logo to replay its drop.',
      html:'<div class="logo" role="button" tabindex="0" aria-label="FlipStax"><span class="lw">' + 'FlipStax'.split('').map((c, i)=> '<b style="--k:' + i + '">' + c + '</b>').join('') + '</span></div>' +
        '<div class="tagline panel">Pick a side. See what the crowd picked.</div>' + ALIEN() +
        '<button class="btn btn-gold big" data-mode="daily" type="button">☀️ Daily Stax<small>Today’s 7-minute run</small></button>' +
        '<button class="btn btn-alt big" data-mode="infinity" type="button">♾️ Infinity Flips<small>Race to 250 points</small></button>' +
        '<div class="chip">🔥 4-day streak · 1,240 Flipz</div>' },
    { id:'vs', name:'Daily VS card', sig:'The VS badge stamps down; the UFO beams the next matchup in.', hint:'Tap a card to vote. "Next matchup" beams in a new pair.',
      html:'<div class="topbar panel"><span>POINTS <b class="num">42</b></span><span>LETTERS <b class="num">3/6</b></span><span>⏱ <b class="num">4:12</b></span></div>' +
        '<div class="vs-wrap"><button class="vs-card a" type="button" data-side="a"><span class="tag">🍕 Food</span><span class="glyph">🍕</span><span class="name panel">Pizza</span><span class="res"><b class="pct">0%</b><i class="bar"><u></u></i><em>Your pick</em></span></button>' +
        '<div class="vs-badge">VS</div>' +
        '<button class="vs-card b" type="button" data-side="b"><span class="tag">🌮 Food</span><span class="glyph">🌮</span><span class="name panel">Tacos</span><span class="res"><b class="pct">0%</b><i class="bar"><u></u></i><em>Your pick</em></span></button></div>' +
        '<div class="verdict"></div>' + ALIEN() + RESET('Next matchup ▶') },
    { id:'trivia', name:'Trivia question', sig:'Answers flip in one by one; right lights the frame gold, wrong flashes red and shakes.', hint:'Saturn is right; anything else shows the wrong state.',
      html:'<div class="chip eyebrow">🧠 TRIVIA · +5 points · 🔑</div><div class="timer"><i></i></div>' +
        '<div class="q panel">Which planet has the most known moons?</div>' +
        '<div class="answers">' + [['Jupiter', 0], ['Saturn', 1], ['Neptune', 0], ['Mars', 0]].map(([t, ok], i)=> '<button class="ans" type="button" style="--k:' + i + '" data-ok="' + ok + '"><span class="ans-key">' + 'ABCD'[i] + '</span>' + t + '</button>').join('') + '</div>' +
        '<div class="verdict"></div>' + ALIEN() + RESET('Another question') },
    { id:'powerup', name:'Power-up screen', sig:'Four prize doors shimmer; the one you pick swings open and its prize zooms out.', hint:'Pick a door.',
      html:'<div class="gift">🎁</div><div class="chip eyebrow">🎉 POWER-UP DROPPED</div><div class="title">Pick a door!</div>' +
        '<div class="doors">' + [['⚡', '+10 Points'], ['🪙', 'Coin Flip'], ['🎁', 'Wild Card'], ['🔑', 'Golden Key']].map(([ic, l], i)=>
          '<button class="door" type="button" style="--k:' + i + '"><span class="door-prize"><span class="pu-icon">' + ic + '</span><span class="pu-label">' + l + '</span></span><span class="door-front"><span class="door-num">' + (i + 1) + '</span><span class="door-knob"></span></span></button>').join('') + '</div>' +
        '<div class="verdict"></div>' + RESET() },
    { id:'jumble', name:'Word jumble', sig:'The UFO beams the letters down; a solved word is beamed up in a burst.', hint:'Tap letters into the tray (O, E, Y spell COMEDY). Check it.',
      html:'<div class="chip eyebrow">🔤 SOLVE THE WORD · <b class="num">0:48</b></div><div class="clue panel">Hint: it makes you laugh</div>' +
        '<div class="tray">' + 'COMEDY'.split('').map((c, i)=> [0, 2, 4].indexOf(i) !== -1 ? '<span class="slot locked">' + c + '<i class="lock">🔒</i></span>' : '<span class="slot" data-want="' + c + '"></span>').join('') + '</div>' +
        '<div class="tiles">' + ['Y', 'A', 'O', 'E', 'R'].map(c=> '<button class="tile" type="button">' + c + '</button>').join('') + '</div>' +
        '<div class="btn-row"><button class="btn btn-ghost clear" type="button">Clear</button><button class="btn btn-gold check" type="button">Check ✓</button></div><div class="verdict"></div>' },
    { id:'results', name:'Results screen', sig:'The score counts up under a shower of coins while the bulbs race.', hint:'Tap "Replay" to run the count again.',
      html:'<div class="chip eyebrow">♾️ INFINITY FLIPS · RUN COMPLETE</div><div class="score num">0</div><div class="sub">POINTS · 262 run + 200 Plinko bonus</div>' +
        '<div class="card-img"><img src="../images/personality-cards/starseeker.jpg" alt="Starseeker card"></div>' +
        '<div class="stat panel">Matched the crowd 73% · 8 keys · Finished in 7:36</div>' +
        '<div class="badges"><span class="pill">✨ New card: Starseeker</span><span class="pill">🛸 Mothership Jackpot</span><span class="pill">🦉 Night Owl</span></div>' +
        '<div class="btn-row"><button class="btn btn-gold" type="button">📤 Share</button><button class="btn btn-alt" type="button">New run ▶</button></div>' + RESET('↺ Replay') },
    { id:'price', name:'Price Check', sig:'The price tag rolls like slot-machine reels to the real price.', hint:'Higher is right ($849); Lower shows the wrong state.',
      html:'<div class="chip eyebrow">💲 PRICE CHECK</div><div class="product panel"><span class="glyph">🛋️</span><span class="pname">A three-seat sofa</span><span class="pnote">at a big-box store</span></div>' +
        '<div class="pricetag"><span class="cur">$</span>' + '0499'.split('').map(d=> '<span class="reel"><span class="strip">' + Array.from({ length:20 }, (_, k)=> '<b>' + (k % 10) + '</b>').join('') + '</span></span>').join('') + '</div>' +
        '<div class="q2">Is the real price <b>higher</b> or <b>lower</b> than $499?</div>' +
        '<div class="btn-row"><button class="btn btn-gold" data-g="higher" type="button">⬆ Higher</button><button class="btn btn-alt" data-g="lower" type="button">⬇ Lower</button></div><div class="verdict"></div>' + RESET() },
    { id:'odd', name:'Odd One Out', sig:'The UFO beams the odd one out right off the board.', hint:'Carrot is the odd one out (not a fruit).',
      html:'<div class="chip eyebrow">👽 ODD ONE OUT</div><div class="title">Which one doesn’t belong?</div>' +
        '<div class="odd-grid">' + [['🍎', 'Apple', 0], ['🍌', 'Banana', 0], ['🥕', 'Carrot', 1], ['🍇', 'Grapes', 0]].map(([g, n, ok], i)=> '<button class="odd" type="button" style="--k:' + i + '" data-ok="' + ok + '"><span class="glyph">' + g + '</span><span class="oname">' + n + '</span></button>').join('') + '</div>' +
        '<div class="verdict"></div>' + ALIEN() + RESET() },
    { id:'emoji', name:'Emoji Decode', sig:'The clue’s emoji bounce in like marquee letters; a right answer spins them into stars.', hint:'The Lion King is right.',
      html:'<div class="chip eyebrow">🔎 EMOJI DECODE · a movie</div><div class="clue-emoji">' + ['🦁', '👑', '🌅'].map((e, i)=> '<span class="em" style="--k:' + i + '">' + e + '</span>').join('') + '</div>' +
        '<div class="answers">' + [['The Lion King', 1], ['King Kong', 0], ['Madagascar', 0], ['Jungle Cruise', 0]].map(([t, ok], i)=> '<button class="ans" type="button" style="--k:' + i + '" data-ok="' + ok + '"><span class="ans-key">' + 'ABCD'[i] + '</span>' + t + '</button>').join('') + '</div><div class="verdict"></div>' + RESET() },
    { id:'first', name:'Which Came First', sig:'Both cards slide onto a timeline and their years stamp down.', hint:'Facebook (2004) came first; YouTube is 2005.',
      html:'<div class="chip eyebrow">⏳ WHICH CAME FIRST?</div>' +
        '<div class="wcf">' + [['📘', 'Facebook', 2004, 1], ['📺', 'YouTube', 2005, 0]].map(([g, n, y, ok], i)=> '<button class="wcf-card" type="button" data-ok="' + ok + '" data-k="' + i + '"><span class="glyph">' + g + '</span><span class="oname">' + n + '</span><span class="year">' + y + '</span></button>').join('<div class="or">OR</div>') + '</div>' +
        '<div class="timeline"><i class="line"></i><span class="tick t1">2000</span><span class="tick t2">2010</span></div><div class="verdict"></div>' + RESET() },
    { id:'hunt', name:'Word Hunt grid', sig:'Found words get zapped by the UFO’s laser, letter by letter.', hint:'Tap a word’s first letter, then its last (FLIP, STAX, UFO, WIN, STAR).',
      html:'<div class="chip eyebrow">🔍 WORD HUNT · <b class="num found-n">0</b>/5</div><div class="hunt-ufo">' + FX.ufoSvg() + '</div>' +
        '<div class="grid">' + ['FLIPKZ', 'SUHWET', 'TFBIMA', 'AOGNYR', 'XQSTAR', 'DCLVJB'].map((row, r)=> row.split('').map((c, k)=> '<button class="cell" type="button" data-r="' + r + '" data-c="' + k + '">' + c + '</button>').join('')).join('') + '</div>' +
        '<div class="words">' + ['FLIP', 'STAX', 'UFO', 'WIN', 'STAR'].map(w=> '<span class="word" data-w="' + w + '">' + w + '</span>').join('') + '</div><div class="verdict"></div>' + RESET() },
  ];

  function build(){
    const board = $('#board');
    board.innerHTML = SCREENS.map(s=>
      '<section class="screen w-' + s.id + '" id="' + s.id + '"><header class="screen-label"><b>' + s.name + '</b><span>' + ((window.BOARD_SIG || {})[s.id] || s.sig) + '</span></header>' +
      '<div class="frame"><div class="bg"><i class="rays"></i><i class="glow"></i></div><div class="amb"></div><div class="marquee" aria-hidden="true"></div>' +
      '<div class="stage">' + s.html + '</div><div class="fx-layer" aria-hidden="true"></div></div><p class="try">' + s.hint + '</p></section>').join('');
    $$('.screen').forEach(sc=>{
      FX.watch(sc); FX.confetti($('.amb', sc), 9);
      if (['entry', 'vs', 'price', 'emoji', 'first', 'results'].indexOf(sc.id) !== -1) FX.ufoPasses(sc, $('.amb', sc));
    });
    layout(); window.addEventListener('resize', ()=>{ clearTimeout(build._t); build._t = setTimeout(layout, 150); });
    wire();
  }
  function layout(){ $$('.screen .frame').forEach(f=> FX.marquee(f, getComputedStyle(document.documentElement).getPropertyValue('--bulb-gap') ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bulb-gap')) : 26)); }

  const win = (sc, el, msg)=>{ const f = $('.frame', sc); FX.flash(f, 'win'); if (el) FX.burstAt($('.fx-layer', sc), el); FX.sound('win'); FX.alien($('.alien', sc), 'cheer'); say(sc, msg, 'good'); };
  const lose = (sc, msg)=>{ FX.flash($('.frame', sc), 'lose'); FX.sound('lose'); FX.alien($('.alien', sc), 'sad'); say(sc, msg, 'bad'); };
  const say = (sc, msg, kind)=>{ const v = $('.verdict', sc); if (!v) return; v.className = 'verdict show ' + (kind || ''); v.textContent = msg; };
  const unsay = (sc)=>{ const v = $('.verdict', sc); if (v){ v.className = 'verdict'; v.textContent = ''; } };
  const replay = (el, cls)=>{ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  function wire(){
    // entry
    const en = $('#entry');
    $$('[data-mode]', en).forEach(b=> b.addEventListener('click', ()=>{ FX.pop(b); win(en, b, b.dataset.mode === 'daily' ? 'Daily Stax: go!' : 'Infinity: go!'); }));
    $('.logo', en).addEventListener('click', ()=>{ replay($('.logo', en), 'drop'); FX.sound('tap'); }); replay($('.logo', en), 'drop');
    // vs
    const vs = $('#vs'); let vsN = 0;
    const PAIRS = [['🍕', 'Pizza', '🌮', 'Tacos', '🍕 Food'], ['🐶', 'Dogs', '🐱', 'Cats', '🐾 Pets'], ['🏖️', 'Beach', '🏔️', 'Mountains', '✈️ Travel']];
    $$('.vs-card', vs).forEach(c=> c.addEventListener('click', ()=>{
      if (vs.classList.contains('voted')) return; vs.classList.add('voted'); c.classList.add('picked'); FX.sound('tap');
      const a = 40 + Math.floor(Math.random() * 30), pct = { a, b: 100 - a }, mine = pct[c.dataset.side];
      $$('.vs-card', vs).forEach(k=>{ const p = pct[k.dataset.side]; FX.countUp($('.pct', k), p, 700); $('.bar u', k).style.transform = 'scaleX(' + p / 100 + ')'; k.style.setProperty('--p', p); });
      setTimeout(()=>{ if (mine >= 50) win(vs, c, 'With the crowd! ' + mine + '% agree'); else { FX.flash($('.frame', vs), 'win'); FX.alien($('.alien', vs), 'cheer'); say(vs, 'Bold pick! Only ' + mine + '% agree', 'bold'); FX.sound('coin'); } }, 720);
    }));
    $('.reset', vs).addEventListener('click', async ()=>{
      const p = PAIRS[++vsN % PAIRS.length]; vs.classList.remove('voted'); unsay(vs);
      $$('.vs-card', vs).forEach((k, i)=>{ k.classList.remove('picked'); $('.glyph', k).textContent = p[i * 2]; $('.name', k).textContent = p[i * 2 + 1]; $('.tag', k).textContent = p[4]; $('.pct', k).textContent = '0%'; $('.bar u', k).style.transform = 'scaleX(0)'; });
      replay($('.vs-badge', vs), 'stamp');
      vs.classList.add('busy'); await FX.beam($('.fx-layer', vs), $('.vs-wrap', vs), false); vs.classList.remove('busy');
    });
    replay($('.vs-badge', vs), 'stamp');
    // trivia + emoji decode (multiple choice)
    ['trivia', 'emoji'].forEach(id=>{
      const sc = $('#' + id);
      $$('.ans', sc).forEach(b=> b.addEventListener('click', ()=>{
        if (sc.classList.contains('answered')) return; sc.classList.add('answered');
        $$('.ans', sc).forEach(x=>{ if (x.dataset.ok === '1') x.classList.add('right'); });
        if (b.dataset.ok === '1'){ win(sc, b, id === 'trivia' ? 'Correct! +5 points · 🔑' : 'You got it! 🦁👑'); if (id === 'emoji') replay($('.clue-emoji', sc), 'solved'); }
        else { b.classList.add('wrong'); lose(sc, id === 'trivia' ? 'Not quite. It’s Saturn.' : 'Nope, it’s The Lion King.'); }
      }));
      const again = ()=>{ sc.classList.remove('answered'); unsay(sc); $$('.ans', sc).forEach(x=> x.classList.remove('right', 'wrong')); replay($('.answers', sc), 'deal'); if (id === 'emoji'){ $('.clue-emoji', sc).classList.remove('solved'); replay($('.clue-emoji', sc), 'deal'); } if (id === 'trivia') replay($('.timer', sc), 'run'); };
      $('.reset', sc).addEventListener('click', again); again();
    });
    // power-up doors
    const pu = $('#powerup');
    $$('.door', pu).forEach(d=> d.addEventListener('click', ()=>{
      if (pu.classList.contains('chosen')) return; pu.classList.add('chosen'); d.classList.add('open'); FX.sound('tap');
      setTimeout(()=> win(pu, d, 'You got ' + $('.pu-label', d).textContent + '!'), 520);
    }));
    $('.reset', pu).addEventListener('click', ()=>{ pu.classList.remove('chosen'); unsay(pu); $$('.door', pu).forEach(d=> d.classList.remove('open')); replay($('.doors', pu), 'deal'); });
    // jumble
    const ju = $('#jumble'), slots = ()=> $$('.slot:not(.locked)', ju);
    const fill = (tile)=>{
      const s = slots().find(x=> !x.textContent); if (!s || tile.classList.contains('used')) return;
      const from = tile.getBoundingClientRect(), to = s.getBoundingClientRect();
      s.textContent = tile.textContent; s._tile = tile; tile.classList.add('used'); FX.sound('tap');
      if (!FX.reduced() && s.animate) s.animate([{ transform:'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(1.1)' }, { transform:'none' }], { duration:280, easing:'cubic-bezier(.3,1.3,.5,1)' });
    };
    $$('.tile', ju).forEach(t=> t.addEventListener('click', ()=> fill(t)));
    $$('.slot:not(.locked)', ju).forEach(s=> s.addEventListener('click', ()=>{ if (s._tile){ s._tile.classList.remove('used'); s._tile = null; s.textContent = ''; } }));
    const clear = ()=> slots().forEach(s=>{ if (s._tile) s._tile.classList.remove('used'); s._tile = null; s.textContent = ''; });
    $('.clear', ju).addEventListener('click', ()=>{ clear(); unsay(ju); });
    $('.check', ju).addEventListener('click', async ()=>{
      const ok = slots().every(s=> s.textContent === s.dataset.want);
      if (!slots().every(s=> s.textContent)){ say(ju, 'Fill every gap first'); FX.shake($('.tray', ju)); return; }
      if (ok){ win(ju, $('.tray', ju), 'COMEDY! Solved'); ju.classList.add('busy'); await FX.beam($('.fx-layer', ju), $('.tray', ju), true); $('.tray', ju).getAnimations().forEach(a=> a.cancel()); ju.classList.remove('busy'); }
      else { lose(ju, 'Not the word. Try again'); FX.shake($('.tray', ju)); setTimeout(clear, 500); }
    });
    (async ()=>{ await new Promise(r=> setTimeout(r, 900)); ju.classList.add('busy'); await FX.beam($('.fx-layer', ju), $('.tiles', ju), false); ju.classList.remove('busy'); })();
    // results
    const rs = $('#results');
    const runResults = ()=>{
      FX.countUp($('.score', rs), 462, 1600); rs.classList.add('racing'); setTimeout(()=> rs.classList.remove('racing'), 1800);
      const layer = $('.fx-layer', rs), W = layer.clientWidth;
      for (let k = 0; k < 4; k++) setTimeout(()=>{ FX.burst(layer, W * (0.2 + 0.2 * k), 30, { count:10, spread:90, shapes:['coin'] }); FX.sound('coin'); }, k * 280);
      setTimeout(()=> FX.flash($('.frame', rs), 'win'), 1600);
    };
    $('.reset', rs).addEventListener('click', runResults); setTimeout(runResults, 700);
    // price check
    const pr = $('#price');
    const setPrice = (digits, ms)=> $$('.reel .strip', pr).forEach((st, i)=>{ const d = +digits[i]; st.style.transitionDuration = (FX.reduced() ? 0 : ms + i * 180) + 'ms'; st.style.transform = 'translateY(-' + ((ms ? 10 : 0) + d) * 5 + '%)'; });
    setPrice('0499', 0);
    $$('[data-g]', pr).forEach(b=> b.addEventListener('click', ()=>{
      if (pr.classList.contains('answered')) return; pr.classList.add('answered'); setPrice('0849', 900); FX.sound('tick');
      setTimeout(()=>{ if (b.dataset.g === 'higher') win(pr, $('.pricetag', pr), 'Right! It’s $849'); else lose(pr, 'Too low, it’s $849'); }, 1500);
    }));
    $('.reset', pr).addEventListener('click', ()=>{ pr.classList.remove('answered'); unsay(pr); $$('.reel .strip', pr).forEach(st=>{ st.style.transitionDuration = '0ms'; }); setPrice('0499', 0); });
    // odd one out
    const od = $('#odd');
    $$('.odd', od).forEach(b=> b.addEventListener('click', async ()=>{
      if (od.classList.contains('answered')) return; od.classList.add('answered');
      if (b.dataset.ok === '1'){ win(od, b, 'Carrot! It’s the only vegetable'); od.classList.add('busy'); await FX.beam($('.fx-layer', od), b, true); od.classList.remove('busy'); b.classList.add('gone'); }
      else { b.classList.add('wrong'); FX.shake(b); lose(od, 'That one’s a fruit. Carrot was the odd one'); $$('.odd', od).forEach(x=>{ if (x.dataset.ok === '1') x.classList.add('right'); }); }
    }));
    $('.reset', od).addEventListener('click', ()=>{ od.classList.remove('answered'); unsay(od); $$('.odd', od).forEach(x=>{ x.classList.remove('wrong', 'right', 'gone'); x.getAnimations().forEach(a=> a.cancel()); }); replay($('.odd-grid', od), 'deal'); });
    // which came first
    const wc = $('#first');
    $$('.wcf-card', wc).forEach(b=> b.addEventListener('click', ()=>{
      if (wc.classList.contains('answered')) return; wc.classList.add('answered'); b.classList.add('picked');
      setTimeout(()=>{ if (b.dataset.ok === '1') win(wc, b, 'Facebook: 2004. YouTube: 2005.'); else lose(wc, 'Facebook came first (2004)'); }, 650);
    }));
    $('.reset', wc).addEventListener('click', ()=>{ wc.classList.remove('answered'); unsay(wc); $$('.wcf-card', wc).forEach(x=> x.classList.remove('picked')); });
    // word hunt
    const hu = $('#hunt'), WORDS = { FLIP:[[0,0],[0,3]], STAX:[[1,0],[4,0]], UFO:[[1,1],[3,1]], WIN:[[1,3],[3,3]], STAR:[[4,2],[4,5]] };
    let first = null;
    const cell = (r, c)=> $('.cell[data-r="' + r + '"][data-c="' + c + '"]', hu);
    const line = (a, b)=>{ const dr = Math.sign(b[0] - a[0]), dc = Math.sign(b[1] - a[1]), n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); return Array.from({ length:n + 1 }, (_, k)=> cell(a[0] + dr * k, a[1] + dc * k)); };
    $$('.cell', hu).forEach(c=> c.addEventListener('click', ()=>{
      const rc = [+c.dataset.r, +c.dataset.c]; FX.sound('tap');
      if (!first){ first = rc; c.classList.add('start'); return; }
      $$('.cell.start', hu).forEach(x=> x.classList.remove('start'));
      const hit = Object.entries(WORDS).find(([w, [a, b]])=> (a + '' === first + '' && b + '' === rc + '') || (b + '' === first + '' && a + '' === rc + ''));
      const pick = first; first = null;
      if (hit && !$('.word[data-w="' + hit[0] + '"]', hu).classList.contains('found')){
        const cells = line(hit[1][0], hit[1][1]);
        $('.hunt-ufo', hu).classList.add('firing'); setTimeout(()=> $('.hunt-ufo', hu).classList.remove('firing'), 200 + cells.length * 90);
        FX.blast($('.fx-layer', hu), cells); cells.forEach((x, k)=> setTimeout(()=> x.classList.add('hit'), k * 90));
        $('.word[data-w="' + hit[0] + '"]', hu).classList.add('found');
        const n = $$('.word.found', hu).length; $('.found-n', hu).textContent = n;
        if (n === 5) setTimeout(()=> win(hu, $('.grid', hu), 'All five found!'), cells.length * 90 + 200); else say(hu, hit[0] + '!', 'good');
      } else { const cs = line(pick, rc).filter(Boolean); cs.forEach(x=>{ x.classList.add('miss'); setTimeout(()=> x.classList.remove('miss'), 500); }); FX.shake($('.grid', hu)); FX.sound('lose'); say(hu, 'No word there', 'bad'); }
    }));
    $('.reset', hu).addEventListener('click', ()=>{ first = null; unsay(hu); $$('.cell', hu).forEach(x=> x.classList.remove('hit', 'start', 'miss')); $$('.word', hu).forEach(x=> x.classList.remove('found')); $('.found-n', hu).textContent = 0; });
  }

  // header switches: sound (off by default) and a reduce-motion preview
  function controls(){
    const s = $('#soundBtn'), m = $('#motionBtn');
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){ document.documentElement.classList.add('rm'); if (m){ m.setAttribute('aria-pressed', 'true'); m.textContent = '🐢 Reduced motion'; } }
    if (s) s.addEventListener('click', ()=>{ FX.muted = !FX.muted; s.setAttribute('aria-pressed', String(!FX.muted)); s.textContent = FX.muted ? '🔇 Sound off' : '🔊 Sound on'; FX.sound('tap'); });
    if (m) m.addEventListener('click', ()=>{ const on = document.documentElement.classList.toggle('rm'); m.setAttribute('aria-pressed', String(on)); m.textContent = on ? '🐢 Reduced motion' : '✨ Full motion'; });
  }
  window.addEventListener('DOMContentLoaded', ()=>{ build(); controls(); });
})();
