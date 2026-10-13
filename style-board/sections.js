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
    { id:'entry', name:'Entry screen', sig:'The game’s own mode picker, now over one slow sunburst: the rays turn behind both halves and change colour where the horizon splits Daily from Infinity.', hint:'Tap either half to pick a mode.',
      html:'<div class="ms-screen">' +
        '<div class="ms-gold" data-mode="infinity" role="button" tabindex="0" aria-label="Play Infinity Flips"><div class="ms-bg"><i class="ms-rays"></i></div>' +
          '<div class="ms-body ms-body-inf"><div class="ms-wm" aria-hidden="true"><span>INFINITY</span><svg viewBox="0 0 64 32" width="44" height="22"><defs><linearGradient id="sbInfGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff2f9e"/><stop offset="1" stop-color="#19b6e6"/></linearGradient></defs><path d="M32 16 C26 7 18 5 12 8 C4 12 4 20 12 24 C18 27 26 25 32 16 C38 7 46 5 52 8 C60 12 60 20 52 24 C46 27 38 25 32 16 Z" fill="none" stroke="url(#sbInfGrad)" stroke-width="5.5" stroke-linejoin="round"/></svg><span>FLIPS</span></div>' +
          '<div class="ms-tag">No clock. No limit.</div><div class="ms-desc">Endless flipping. Vote on opinions forever, climb the tiers, and chase streaks and bonus rounds.</div><div class="ms-cta">START FLIPPING &#9654;</div></div></div>' +
        '<div class="ms-seam ms-seam-glow"></div><div class="ms-seam ms-seam-line"></div>' +
        '<div class="ms-sky" data-mode="daily" role="button" tabindex="0" aria-label="Play Daily Stax"><div class="ms-bg"><i class="ms-rays"></i></div>' +
          '<div class="ms-body ms-body-daily"><div class="ms-wm" aria-hidden="true"><span>DAILY</span><svg viewBox="0 0 48 34" width="40" height="28"><g stroke="#0d2b5e" stroke-width="2" stroke-linejoin="round"><rect x="7" y="6" width="17" height="24" rx="3" fill="#ff7a59" transform="rotate(-18 15.5 18)"/><rect x="24" y="6" width="17" height="24" rx="3" fill="#2dd4c4" transform="rotate(18 32.5 18)"/><rect x="15.5" y="3" width="17" height="24" rx="3" fill="#ffd93d"/></g><path d="M24 9.5 l1.9 4.2 4.6.5-3.4 3.1 1 4.5-4.1-2.4-4.1 2.4 1-4.5-3.4-3.1 4.6-.5z" fill="#fff" stroke="#0d2b5e" stroke-width="0.8" stroke-linejoin="round"/></svg><span>STAX</span></div>' +
          '<div class="ms-tag">One run. Once a day.</div><div class="ms-desc">Tap your pick for points, answer trivia, collect letters, and solve today’s hidden word before time runs out.</div><div class="ms-cta">PLAY TODAY &#9654;</div></div></div>' +
        '<div class="split-select-header"><div class="logo"><span class="flip">Flip</span><span class="stax">Stax</span></div><div class="split-select-title">Choose your mode</div></div>' +
        '<div class="ms-divider-ring" aria-hidden="true"><span></span><span></span><span></span><span></span></div><div class="split-divider">OR</div></div>' },
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
      html:'<div class="chip eyebrow">🔤 SOLVE THE WORD · <b class="num">0:48</b></div>' +
        '<div class="tray">' + 'COMEDY'.split('').map((c, i)=> [0, 2, 4].indexOf(i) !== -1 ? '<span class="slot locked">' + c + '<i class="lock">🔒</i></span>' : '<span class="slot" data-want="' + c + '"></span>').join('') + '</div>' +
        '<div class="tiles">' + ['Y', 'A', 'O', 'E', 'R'].map(c=> '<button class="tile" type="button">' + c + '</button>').join('') + '</div>' +
        '<div class="btn-row"><button class="btn btn-ghost clear" type="button">Clear</button><button class="btn btn-gold check" type="button">Check ✓</button></div><div class="verdict"></div>' },
    { id:'results', name:'Results screen', sig:'The score counts up under a shower of coins while the bulbs race.', hint:'Tap "Replay" to run the count again.',
      html:'<div class="chip eyebrow">♾️ INFINITY FLIPS · RUN COMPLETE</div><div class="score num">0</div><div class="sub">POINTS · 262 run + 200 Plinko bonus</div>' +
        '<div class="card-img"><img src="../images/personality-cards/starseeker.jpg" alt="Starseeker card"></div>' +
        '<div class="stat panel">Matched the crowd 73% · 8 keys · Finished in 7:36</div>' +
        '<div class="badges"><span class="pill">✨ New card: Starseeker</span><span class="pill">🛸 Mothership Jackpot</span><span class="pill">🦉 Night Owl</span></div>' +
        '<div class="btn-row"><button class="btn btn-gold" type="button">📤 Share</button><button class="btn btn-alt" type="button">New run ▶</button></div>' + RESET('↺ Replay') },
    { id:'price', name:'Price Check', sig:'Which costs more? Both price tags roll like slot-machine reels to the real prices.', hint:'The sofa ($849) costs more than the scooter ($499).',
      html:'<div class="chip eyebrow">💲 PRICE CHECK</div><div class="title">Which costs more?</div>' +
        '<div class="pc-pair">' + [['🛴', 'Electric scooter', '499', 0], ['🛋️', 'Three-seat sofa', '849', 1]].map(([g, n, p, ok], i)=>
          '<button class="pc-card" type="button" data-ok="' + ok + '" data-price="' + p + '" style="--k:' + i + '"><span class="glyph">' + g + '</span><span class="pname">' + n + '</span>' +
          '<span class="pricetag"><span class="cur">$</span>' + [0, 1, 2].map(()=> '<span class="reel"><span class="strip"><b>?</b>' + Array.from({ length:20 }, (_, k)=> '<b>' + (k % 10) + '</b>').join('') + '</span></span>').join('') + '</span></button>').join('<div class="or">OR</div>') + '</div>' +
        '<div class="verdict"></div>' + RESET() },
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
    { id:'hunt', name:'Word Hunt (Boggle-style)', sig:'Tap neighbouring letters to spell a word; they light up, the UFO beams the word, it bursts and stays coloured.', hint:'Spell with touching letters (diagonals count), e.g. SOUND, TRAIN, COAST, AROUND. Tap the last letter again or Zap it. 60 seconds.',
      html:'<div class="chip eyebrow">🔍 WORD HUNT</div>' +
        '<div class="hunt-hud"><span class="hud">⏱ <b class="num h-time">1:00</b></span><span class="hud">SCORE <b class="num h-score">0</b></span><span class="hud">WORDS <b class="num h-words">0</b></span></div>' +
        '<div class="grid boggle">' + ['FLIPS', 'TRANE', 'SOUND', 'COIST', 'HEARM'].map((row, r)=> row.split('').map((c, k)=> '<button class="cell" type="button" data-r="' + r + '" data-c="' + k + '">' + c + '</button>').join('')).join('') + '</div>' +
        '<div class="h-current panel"><span class="h-word">Tap a letter to start</span></div>' +
        '<div class="btn-row"><button class="btn btn-ghost h-clear" type="button">Clear</button><button class="btn btn-gold h-go" type="button">Zap it ⚡</button></div>' + RESET('↺ New game') },
  ];

  function build(){
    const board = $('#board');
    board.innerHTML = SCREENS.map(s=>
      '<section class="screen w-' + s.id + '" id="' + s.id + '"><header class="screen-label"><b>' + s.name + '</b><span>' + s.sig + '</span></header>' +
      '<div class="frame"><div class="bg"><i class="rays"></i><i class="glow"></i></div><div class="amb"></div><div class="marquee" aria-hidden="true"></div>' +
      '<div class="stage">' + s.html + '</div><div class="fx-layer" aria-hidden="true"></div></div><p class="try">' + s.hint + '</p></section>').join('');
    $$('.screen').forEach(sc=>{
      FX.watch(sc); if (sc.id === 'entry') return;
      FX.confetti($('.amb', sc), 9);
      if (['vs', 'price', 'emoji', 'first', 'results'].indexOf(sc.id) !== -1) FX.ufoPasses(sc, $('.amb', sc));
    });
    layout(); window.addEventListener('resize', ()=>{ clearTimeout(build._t); build._t = setTimeout(layout, 150); });
    wire();
  }
  // (The entry screen - the game's mode picker - has no marquee bulbs; the game screens do.)
  function layout(){ $$('.screen:not(#entry) .frame').forEach(f=> FX.marquee(f, getComputedStyle(document.documentElement).getPropertyValue('--bulb-gap') ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bulb-gap')) : 26)); }

  const win = (sc, el, msg, big)=>{ const f = $('.frame', sc), layer = $('.fx-layer', sc); FX.flash(f, 'win'); if (el) FX.winBurst(layer, el); if (big === 'coins') FX.coinShower(layer, 3); if (big === 'confetti'){ FX.confettiBurst(layer); FX.coinShower(layer, 2); }
    FX.sound('win'); FX.alien($('.alien', sc), 'cheer'); say(sc, msg, 'good'); };
  const lose = (sc, msg)=>{ FX.flash($('.frame', sc), 'lose'); FX.sound('lose'); FX.alien($('.alien', sc), 'sad'); say(sc, msg, 'bad'); };
  const say = (sc, msg, kind)=>{ const v = $('.verdict', sc); if (!v) return; v.className = 'verdict show ' + (kind || ''); v.textContent = msg; };
  const unsay = (sc)=>{ const v = $('.verdict', sc); if (v){ v.className = 'verdict'; v.textContent = ''; } };
  const replay = (el, cls)=>{ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  // Routine taps: each game's own little effect where the finger lands (A5).
  const TAP_SIG = { entry:'gold', vs:'pink', trivia:'blue', powerup:'gold', jumble:'orange', results:'coin', price:'coin', odd:'purple', emoji:'sparkle', first:'teal', hunt:'zap' };
  function wireTaps(){
    $$('.screen').forEach(sc=> $('.stage', sc).addEventListener('pointerdown', e=>{
      if (!e.target.closest('button, [role=button]')) return;
      const l = $('.fx-layer', sc).getBoundingClientRect(); FX.tapFx(TAP_SIG[sc.id], $('.fx-layer', sc), e.clientX - l.left, e.clientY - l.top);
    }));
  }
  function wire(){
    wireTaps();
    // entry: the mode picker - a tap on either half
    const en = $('#entry');
    $$('[data-mode]', en).forEach(b=> b.addEventListener('click', ()=>{ const cta = $('.ms-cta', b); FX.pop(cta, 1.08); FX.flash($('.frame', en), 'win'); FX.burstAt($('.fx-layer', en), cta); FX.sound('win'); }));
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
      if (ok){ win(ju, $('.tray', ju), 'COMEDY! Solved', 'coins'); ju.classList.add('busy'); await FX.beam($('.fx-layer', ju), $('.tray', ju), true); $('.tray', ju).getAnimations().forEach(a=> a.cancel()); ju.classList.remove('busy'); }
      else { lose(ju, 'Not the word. Try again'); FX.shake($('.tray', ju)); setTimeout(clear, 500); }
    });
    (async ()=>{ await new Promise(r=> setTimeout(r, 900)); ju.classList.add('busy'); await FX.beam($('.fx-layer', ju), $('.tiles', ju), false); ju.classList.remove('busy'); })();
    // results
    const rs = $('#results');
    const runResults = ()=>{
      FX.countUp($('.score', rs), 462, 1600); rs.classList.add('racing'); setTimeout(()=> rs.classList.remove('racing'), 1800);
      const layer = $('.fx-layer', rs), W = layer.clientWidth;
      for (let k = 0; k < 4; k++) setTimeout(()=>{ FX.burst(layer, W * (0.2 + 0.2 * k), 30, { count:10, spread:90, shapes:['coin'] }); FX.sound('coin'); }, k * 280);
      setTimeout(()=>{ FX.flash($('.frame', rs), 'win'); FX.confettiBurst(layer); }, 1600);
    };
    $('.reset', rs).addEventListener('click', runResults); setTimeout(runResults, 700);
    // price check: which costs more? (each tag's reels: '?', then 0-9 twice)
    const pr = $('#price');
    const rollTo = (card, ms)=> $$('.reel .strip', card).forEach((st, k)=>{ const d = +card.dataset.price[k], cell = st.firstElementChild.offsetHeight;
      st.style.transitionDuration = (FX.reduced() || !ms ? 0 : ms + k * 220) + 'ms'; st.style.transform = ms === null ? 'none' : 'translateY(-' + (11 + d) * cell + 'px)'; });
    $$('.pc-card', pr).forEach(c=> c.addEventListener('click', ()=>{
      if (pr.classList.contains('answered')) return; pr.classList.add('answered'); c.classList.add('picked'); FX.sound('tick');
      $$('.pc-card', pr).forEach((x, k)=> setTimeout(()=> rollTo(x, 900), k * 250));
      setTimeout(()=>{ $$('.pc-card', pr).forEach(x=>{ if (x.dataset.ok === '1') x.classList.add('right'); });
        if (c.dataset.ok === '1') win(pr, c, 'Right! The sofa’s $849'); else { c.classList.add('wrong'); lose(pr, 'The sofa costs more: $849'); } }, 2000);
    }));
    $('.reset', pr).addEventListener('click', ()=>{ pr.classList.remove('answered'); unsay(pr); $$('.pc-card', pr).forEach(x=>{ x.classList.remove('picked', 'right', 'wrong'); rollTo(x, null); }); });
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
    // word hunt, Boggle-style: tap touching letters in order; tap the last
    // letter again (or Zap it) to play the word. 60 seconds, longer words
    // score more, found letters stay coloured.
    const hu = $('#hunt'), POINTS = { 3:1, 4:2, 5:4, 6:6, 7:10, 8:15 }, HUE = ['#ff3c9d', '#22c3ff', '#ffb21f', '#7c4dff', '#22c56b', '#ff6a2b'];
    let path = [], found = new Set(), score = 0, timeLeft = 60, timer = null, over = false, busy = false;
    const words = fetch('hunt-words.json').then(r=> r.json()).then(l=> new Set(l)).catch(()=> new Set());
    const wordOf = ()=> path.map(c=> c.textContent).join('');
    const showWord = (t)=> $('.h-word', hu).textContent = t || (path.length ? wordOf() : 'Tap a letter to start');
    const near = (a, b)=> Math.abs(+a.dataset.r - +b.dataset.r) <= 1 && Math.abs(+a.dataset.c - +b.dataset.c) <= 1;
    const clearPath = ()=>{ path.forEach(c=> c.classList.remove('sel')); path = []; showWord(); };
    const fmt = (t)=> Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    const tick = ()=>{ if (!FX.awake(hu)) return; timeLeft--; $('.h-time', hu).textContent = fmt(Math.max(0, timeLeft)); if (timeLeft <= 10) $('.h-time', hu).classList.add('low');
      if (timeLeft <= 0){ clearInterval(timer); over = true; clearPath(); hu.classList.add('over'); showWord('Time! ' + found.size + ' words · ' + score + ' points'); FX.flash($('.frame', hu), 'win'); FX.confettiBurst($('.fx-layer', hu)); FX.sound('win'); } };
    const start = ()=>{ if (!timer && !over) timer = setInterval(tick, 1000); };
    async function play(){
      if (busy || over) return;
      const w = wordOf().toLowerCase(), cells = path.slice();
      if (w.length < 3){ FX.shake($('.h-current', hu)); showWord('3 letters or more'); setTimeout(()=> showWord(), 900); return; }
      const dict = await words;
      if (found.has(w)){ FX.shake($('.h-current', hu)); FX.sound('lose'); clearPath(); showWord(w.toUpperCase() + ': already found'); return; }
      if (!dict.has(w)){ cells.forEach(c=>{ c.classList.add('miss'); setTimeout(()=> c.classList.remove('miss'), 500); }); FX.shake($('.grid', hu)); FX.sound('lose'); clearPath(); showWord(w.toUpperCase() + ' isn’t a word here'); return; }
      busy = true; found.add(w);
      const pts = POINTS[Math.min(8, w.length)], hue = HUE[found.size % HUE.length];
      await FX.beamHit($('.fx-layer', hu), cells);
      cells.forEach(c=>{ c.classList.remove('sel'); c.style.setProperty('--hue', hue); c.classList.remove('found'); void c.offsetWidth; c.classList.add('found'); });
      score += pts; FX.countUp($('.h-score', hu), score, 400, score - pts); $('.h-words', hu).textContent = found.size; FX.pop($('.h-score', hu).parentElement);
      path = []; showWord(w.toUpperCase() + '  +' + pts); FX.sound('win'); busy = false;
      if (w.length >= 6) FX.coinShower($('.fx-layer', hu), 2);   // a long word is a big win
    }
    $$('.cell', hu).forEach(c=> c.addEventListener('click', ()=>{
      if (busy || over) return; start(); FX.sound('tap');
      const last = path[path.length - 1], at = path.indexOf(c);
      if (c === last){ play(); return; }                                      // the last letter again: play the word
      if (at !== -1){ path.slice(at + 1).forEach(x=> x.classList.remove('sel')); path = path.slice(0, at + 1); showWord(); return; }   // back up to it
      if (last && !near(last, c)) clearPath();                                // not touching: start a new word here
      path.push(c); c.classList.add('sel'); showWord();
    }));
    $('.h-go', hu).addEventListener('click', play);
    $('.h-clear', hu).addEventListener('click', clearPath);
    $('.reset', hu).addEventListener('click', ()=>{ clearInterval(timer); timer = null; over = false; busy = false; clearPath(); found = new Set(); score = 0; timeLeft = 60; hu.classList.remove('over');
      $('.h-time', hu).textContent = '1:00'; $('.h-time', hu).classList.remove('low'); $('.h-score', hu).textContent = '0'; $('.h-words', hu).textContent = '0'; $$('.cell', hu).forEach(c=> c.classList.remove('found', 'sel', 'miss')); });
  }
  // header switches: sound (off by default) and a reduce-motion preview
  function controls(){
    const s = $('#soundBtn'), m = $('#motionBtn');
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){ document.documentElement.classList.add('rm'); if (m){ m.setAttribute('aria-pressed', 'true'); m.textContent = '🐢 Reduced (system setting)'; } }
    if (s) s.addEventListener('click', ()=>{ FX.muted = !FX.muted; s.setAttribute('aria-pressed', String(!FX.muted)); s.textContent = FX.muted ? '🔇 Sound off' : '🔊 Sound on'; FX.sound('tap'); });
    if (m) m.addEventListener('click', ()=>{ const on = document.documentElement.classList.toggle('rm'); m.setAttribute('aria-pressed', String(on)); m.textContent = on ? '🐢 Reduced motion' : '✨ Full motion'; });
  }
  window.addEventListener('DOMContentLoaded', ()=>{ build(); controls(); });
})();
