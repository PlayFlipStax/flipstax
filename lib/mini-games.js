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
    available: ()=> Array.isArray(window.FLIPSTAX_PEAK_OR_PLUNGE) && window.FLIPSTAX_PEAK_OR_PLUNGE.length >= 20,
    run(api){
      const all = window.FLIPSTAX_PEAK_OR_PLUNGE, cats = ['height', 'year', 'count'];
      let chain = [];
      for (let tries = 0; tries < 6 && chain.length < PP_ROUNDS + 1; tries++){
        const cat = cats[Math.floor(api.rng() * cats.length)];
        chain = [];
        for (const it of api.shuffle(all.filter(x=> x.cat === cat))){ if (chain.length > PP_ROUNDS) break; if (!chain.length || it.value !== chain[chain.length - 1].value) chain.push(it); }
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
        else { api.sfx.wrong(); api.flash('lose'); if (dir === null) api.say('Too slow, Earthling!', 1200); }
        setTimeout(()=>{
          next.classList.remove('right', 'wrong'); round++;
          if (round >= PP_ROUNDS || round + 1 >= chain.length){
            api.finish({ pts: right * 10, win: right >= 3, line: right === PP_ROUNDS ? 'A perfect climb!' : right >= 3 ? 'Peak performance!' : 'What a plunge!' });
            return;
          }
          show();
        }, 1150);
      };
      btns[0].addEventListener('click', ()=>{ api.sfx.tap('top'); pick('hi'); });
      btns[1].addEventListener('click', ()=>{ api.sfx.tap('bottom'); pick('lo'); });
      show();
    },
  });

  // ---------------------------------------------------------------- E2. Snap Sort
  // A category; words drift across three lanes; tap the ones that belong (+4 each), skip the rest. A wrong tap costs a
  // second. 15 s. World: neon lime on black (a snapshot flash).
  const SS_MS = 15000, SS_SPAWN = 1250, SS_CROSS = 4600;
  MG.register('snapSort', {
    name: 'Snap Sort', colors: ['#9fd43a', '#26440a', '#050802'], bulb: '#e4ff7a',
    rule: 'Tap only the ones that fit. A wrong tap costs a second!', host: 'Snap the right ones, skip the rest!',
    available: ()=> Array.isArray(window.FLIPSTAX_SNAP_SORT) && window.FLIPSTAX_SNAP_SORT.length >= 10,
    run(api){
      const list = window.FLIPSTAX_SNAP_SORT, c = list[Math.floor(api.rng() * list.length)];
      const yes = api.shuffle(c.yes).slice(0, 5), no = api.shuffle(c.no).slice(0, 4);
      const words = api.shuffle(yes.map(w=> ({ w, ok:true })).concat(no.map(w=> ({ w, ok:false }))));
      const s = api.stage; s.classList.add('ss-stage');
      s.innerHTML = '<div class="ss-cat"><small>TAP THE</small>' + esc(c.cat.toUpperCase()) + '</div><div class="ss-field"></div><div class="ss-tally"></div>';
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
          else { wrong++; b.classList.add('wrong'); api.sfx.wrong(); api.flash('lose'); if (timer) timer.add(-1000); }
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
  // Every grid has a few good words planted along random paths. The word list is the plain file data/zap-words.txt
  // (Webster's 1934, public domain, 3-8 letters; simple -s / -es / -ed / -ing forms of its words count too), loaded
  // when the game starts - no network beyond the game's own files. World: electric yellow on storm grey.
  const ZAP_SECONDS = 20;
  const ZAP_POINTS = [0, 0, 0, 2, 4, 7, 10, 14, 18];
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
  function zapValid(w, dict){
    if (w.length < 3) return false;
    if (dict.has(w)) return true;
    if (w.length >= 4 && w.endsWith('s') && dict.has(w.slice(0, -1))) return true;
    if (w.length >= 5 && w.endsWith('es') && dict.has(w.slice(0, -2))) return true;
    if (w.length >= 5 && w.endsWith('ed') && (dict.has(w.slice(0, -2)) || dict.has(w.slice(0, -1)))) return true;
    if (w.length >= 6 && w.endsWith('ing') && (dict.has(w.slice(0, -3)) || dict.has(w.slice(0, -3) + 'e'))) return true;
    return false;
  }
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
    name: 'Zap Words', colors: ['#d9d36a', '#3a4152', '#0b0d14'], bulb: '#fff27a',
    rule: 'Swipe across touching letters to spell words. Longer words zap more!', host: 'Zap words out of the grid, Earthling!',
    available: ()=> typeof fetch === 'function',
    run(api){
      const s = api.stage; s.classList.add('zw-stage');
      const grid = zapGrid(api.rng);
      if (!grid){ api.finish({ pts: 0 }); return; }
      api.overlay._zap = grid;   // (tests read the planted words)
      s.innerHTML = '<div class="zw-word" aria-live="polite">&nbsp;</div><div class="zw-grid" role="application" aria-label="Letter grid">' +
        grid.letters.map((ch, i)=> '<div class="zw-cell" data-i="' + i + '"><span>' + ch + '</span></div>').join('') + '<svg class="zw-trail" aria-hidden="true"><polyline points=""/></svg></div>' +
        '<div class="zw-foot"><button type="button" class="zw-hint">&#128161; HINT</button><div class="zw-found"></div></div>';
      const gEl = s.querySelector('.zw-grid'), cells = [...s.querySelectorAll('.zw-cell')], wordEl = s.querySelector('.zw-word'), line = s.querySelector('.zw-trail polyline'), foundEl = s.querySelector('.zw-found'), hintBtn = s.querySelector('.zw-hint');
      const found = new Set(); let pts = 0, path = [], live = false, ended = false, dict = null, timer = null;
      wordEl.textContent = 'Loading the letters...';
      const center = (i)=>{ const c = cells[i], r = gEl.getBoundingClientRect(), b = c.getBoundingClientRect(); return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2]; };
      const draw = ()=>{
        cells.forEach((c, i)=> c.classList.toggle('on', path.indexOf(i) >= 0));
        line.setAttribute('points', path.map(i=> center(i).map(v=> v.toFixed(1)).join(',')).join(' '));
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
        if (!path.length){ path.push(i); api.sfx.clack(); draw(); return; }
        if (i === last) return;
        if (path.length >= 2 && i === path[path.length - 2]){ path.pop(); draw(); return; }   // backtrack
        if (path.indexOf(i) >= 0 || !touching(last, i)) return;
        path.push(i); api.sfx.chime(Math.min(8, path.length)); draw();
      };
      const release = ()=>{
        if (!path.length) return;
        const w = path.map(i=> grid.letters[i]).join('').toLowerCase(), used = path.slice();
        path = []; draw();
        if (w.length < 3) return;
        const flashCells = (cls)=>{ used.forEach(i=> cells[i].classList.add(cls)); setTimeout(()=> used.forEach(i=> cells[i].classList.remove(cls)), 450); };
        if (found.has(w)){ wordEl.textContent = w.toUpperCase() + ' — got it already'; flashCells('dup'); return; }
        if (dict && zapValid(w, dict)){
          found.add(w); const p = ZAP_POINTS[Math.min(8, w.length)]; pts += p; api.score(pts);
          wordEl.textContent = w.toUpperCase() + '  +' + p; flashCells('good'); api.sfx.ding(); if (w.length >= 5) api.flash('win');
          foundEl.textContent = [...found].map(x=> x.toUpperCase()).join(' · ');
          if (hintAt >= 0 && used[0] === hintAt) cells[hintAt].classList.remove('hint');
        } else { wordEl.textContent = w.toUpperCase() + '?'; flashCells('bad'); api.sfx.whoosh(); }
      };
      gEl.addEventListener('pointerdown', (e)=>{ if (!live) return; e.preventDefault(); try{ gEl.setPointerCapture(e.pointerId); }catch(err){} path = []; add(cellAt(e.clientX, e.clientY)); });
      gEl.addEventListener('pointermove', (e)=>{ if (!live || !path.length) return; e.preventDefault(); add(cellAt(e.clientX, e.clientY)); });
      gEl.addEventListener('pointerup', ()=>{ if (live) release(); });
      gEl.addEventListener('pointercancel', ()=>{ path = []; draw(); });
      let hintAt = -1;
      hintBtn.addEventListener('click', ()=>{
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
  MG.register('twinFlip', {
    name: 'Twin Flip', colors: ['#c040ff', '#330d55', '#07031a'], bulb: '#7df9ff',
    rule: 'Flip two tiles at a time. Find all 8 pairs!', host: 'Match the twins before the clock runs out!',
    available: ()=> true,
    run(api){
      const s = api.stage; s.classList.add('tf-stage');
      const deck = api.shuffle(TF_ICONS.concat(TF_ICONS).map((ic, i)=> ({ key: ic[0], svg: tfSvg(ic[2], ic[1]), c: ic[1] })));
      s.innerHTML = '<div class="tf-grid">' + deck.map((d, i)=> '<button type="button" class="tf-tile" data-i="' + i + '" aria-label="Tile ' + (i + 1) + '"><span class="tf-back">FS</span><span class="tf-face" style="color:' + d.c + '">' + d.svg + '</span></button>').join('') + '</div><div class="tf-pairs">0 / 8 pairs</div>';
      const tiles = [...s.querySelectorAll('.tf-tile')], pairsEl = s.querySelector('.tf-pairs');
      let open = [], pairs = 0, busy = false, ended = false;
      // The flip: the tile turns edge-on, swaps face, turns back (no backface-visibility).
      const flip = (t, up)=>{
        if (api.reduced || !t.animate){ t.classList.toggle('up', up); return; }
        t.animate([{ transform:'scaleX(1)' }, { transform:'scaleX(0)' }], { duration:110, easing:'ease-in' }).onfinish = ()=>{
          t.classList.toggle('up', up); t.animate([{ transform:'scaleX(0)' }, { transform:'scaleX(1)' }], { duration:150, easing:'ease-out' });
        };
      };
      tiles.forEach((t, i)=> t.addEventListener('click', ()=>{
        if (ended || busy || t.classList.contains('up') || t.classList.contains('done')) return;
        api.sfx.clack(); flip(t, true); open.push(i);
        if (open.length < 2) return;
        busy = true;
        const [a, b] = open; open = [];
        if (deck[a].key === deck[b].key){
          setTimeout(()=>{ tiles[a].classList.add('done'); tiles[b].classList.add('done'); pairs++; pairsEl.textContent = pairs + ' / 8 pairs'; api.score(pairs * 4);
            api.sfx.chime(Math.min(8, pairs + 1)); busy = false;
            if (pairs === 8){ api.flash('win'); end(); } }, 280);
        } else {
          setTimeout(()=>{ flip(tiles[a], false); flip(tiles[b], false); api.sfx.whoosh(); busy = false; }, 700);
        }
      }));
      const end = ()=>{ if (ended) return; ended = true; setTimeout(()=> api.finish({ pts: pairs * 4, win: pairs >= 4, line: pairs === 8 ? 'Total recall! Every twin found!' : pairs >= 4 ? 'Groovy memory!' : 'Those tiles were tricky!' }), 500); };
      api.onClose = ()=>{ ended = true; };
      api.timer(TF_MS, end);
    },
  });
})();
