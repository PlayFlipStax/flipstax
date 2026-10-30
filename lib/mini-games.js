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
  // A category; words and phrases on little signs ride a conveyor belt, hang from a UFO's tractor beam or race along the
  // ground on toy cars and tiny coloured UFOs; tap the ones that belong (+4 each, they fly into the blue bin), skip the
  // rest (a wrong tap flies into the red bin and costs a second; the host says why). 20 items a round, speeding up.
  // The combo meter and the sparkles are for show - the scoring is unchanged. World: orange and teal, a showroom floor.
  // G6: difficulty follows the act - easy in Act 1, medium in Act 2, hard in Act 3 - and the hard tier only plays once
  // SNAP_SORT_REVIEWED is true (until then Act 3 gets a medium category; the TEST menu can force any tier).
  const SS_MS = 24000, SS_ITEMS = 20, SS_GAP = [1100, 560], SS_CROSS = [5400, 3300];
  const SS_CARS = ['🚗', '🚕', '🏎️', '🚙', '🛵', '🚓'], SS_LANES = ['belt', 'ground', 'belt', 'ufo', 'ground'];
  MG.register('snapSort', {
    name: 'Snap Sort', colors: ['#ffb347', '#e0701f', '#0f4f58'], bulb: '#ffe9a0',
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
      // Every item that belongs (3 to 6) once, and decoys (repeated if need be) to make up 20 signs.
      const yes = api.shuffle(c.yes).slice(0, 6), decoys = api.shuffle(c.no).map(d=> ({ w: Array.isArray(d) ? d[0] : d, why: Array.isArray(d) ? d[1] : '', ok:false }));
      const words = yes.map(w=> ({ w, ok:true }));
      for (let r = 0; words.length < SS_ITEMS; r++){ const d = r % decoys.length === 0 && r ? api.shuffle(decoys) : decoys; words.push(d[r % d.length]); }
      let order = api.shuffle(words.slice(0, SS_ITEMS));
      for (let i = 1; i < order.length; i++) if (order[i].w === order[i - 1].w){ const j = (i + 3) % order.length; [order[i], order[j]] = [order[j], order[i]]; }
      const lite = api.lite || api.reduced;
      const s = api.stage; s.classList.add('ss-stage');
      s.innerHTML = '<div class="ss-cat"><small>TAP THE · ' + tier.toUpperCase() + '</small>' + esc(c.cat.toUpperCase()) + '</div>' +
        '<div class="ss-combo"><span class="ss-cl">COMBO</span><span class="ss-pips"><i></i><i></i><i></i><i></i><i></i></span><span class="ss-tally"></span></div>' +
        '<div class="ss-field"><div class="ss-bin red"><b>✖</b></div><div class="ss-bin blue"><b>✔</b></div>' +
        '<div class="ss-belt"><div class="ss-belt-top"><i class="ss-pat"></i></div><div class="ss-belt-bot"><i class="ss-pat"></i></div><span class="ss-leg l"></span><span class="ss-leg r"></span></div>' +
        '<div class="ss-road"></div><div class="ss-lane"></div>' +
        '<div class="ss-ufo"><img alt="" src="images/saucer-sprite.webp" draggable="false"><i class="ss-beam"></i><span class="ss-carry"></span></div>' +
        '<div class="ss-glow"></div><div class="ss-lights"></div></div>';
      const field = s.querySelector('.ss-field'), lane = s.querySelector('.ss-lane'), tally = s.querySelector('.ss-tally'), pips = [...s.querySelectorAll('.ss-pips i')];
      const ufo = s.querySelector('.ss-ufo'), carry = s.querySelector('.ss-carry'), glow = s.querySelector('.ss-glow');
      const bin = { red: s.querySelector('.ss-bin.red'), blue: s.querySelector('.ss-bin.blue') };
      let right = 0, wrong = 0, ended = false, streak = 0, spawned = 0, gone = 0, carrying = false, timer = null;
      const anims = [], spawns = [], live = new Set();
      const lerp = (pr, [a, b])=> a + (b - a) * pr;
      const setCombo = ()=>{ pips.forEach((p, k)=> p.classList.toggle('on', k < Math.min(5, streak))); s.querySelector('.ss-cl').textContent = streak >= 5 ? 'ON FIRE ×' + streak : streak >= 2 ? 'COMBO ×' + streak : 'COMBO'; s.querySelector('.ss-combo').classList.toggle('hot', streak >= 3); };
      const sparkle = (x, y, good)=>{
        if (lite || !field.animate) return;
        for (let k = 0; k < 9; k++){
          const st = el('i', 'ss-spark' + (good ? '' : ' bad')); field.appendChild(st);
          const ang = k / 9 * Math.PI * 2 + Math.random() * 0.5, d = 26 + Math.random() * 30;
          st.style.left = x + 'px'; st.style.top = y + 'px';
          st.animate([{ transform:'translate(-50%,-50%) scale(0.4)', opacity:1 }, { transform:'translate(' + (Math.cos(ang) * d - 7) + 'px,' + (Math.sin(ang) * d - 7) + 'px) scale(1.1) rotate(180deg)', opacity:0 }], { duration:520, easing:'ease-out' }).onfinish = ()=> st.remove();
        }
      };
      const bump = (b)=>{ if (!lite && b.animate) b.animate([{ transform:'scale(1)' }, { transform:'scale(1.14)', offset:0.35 }, { transform:'scale(1)' }], { duration:360 }); };
      const lightFlash = (cls)=>{ glow.className = 'ss-glow ' + cls; if (glow.animate) glow.animate([{ opacity:0 }, { opacity:1, offset:0.18 }, { opacity:0 }], { duration: cls === 'lose' ? 420 : 520 }); };
      const shake = ()=>{ if (!lite && field.animate) field.animate([{ transform:'translateX(0)' }, { transform:'translateX(-6px)', offset:0.2 }, { transform:'translateX(5px)', offset:0.45 }, { transform:'translateX(-3px)', offset:0.7 }, { transform:'translateX(0)' }], { duration:320 }); };
      // A tapped sign flies into its bin (a fade in lite mode); the original is hidden at once.
      const fly = (node, good)=>{
        const fr = field.getBoundingClientRect(), r = node.getBoundingClientRect(), b = bin[good ? 'blue' : 'red'], br = b.getBoundingClientRect();
        const cl = node.cloneNode(true); cl.classList.add('ss-fly', good ? 'right' : 'wrong'); cl.style.cssText = 'left:0;top:0;width:' + r.width + 'px;height:' + r.height + 'px;margin:0';
        field.appendChild(cl);
        const x0 = r.left - fr.left, y0 = r.top - fr.top, x1 = br.left - fr.left + br.width / 2 - r.width * 0.2, y1 = br.top - fr.top + br.height * 0.3;
        sparkle(x0 + r.width / 2, y0 + r.height / 2, good);
        const done = ()=>{ cl.remove(); bump(b); };
        if (lite || !cl.animate){ cl.style.transform = 'translate(' + x0 + 'px,' + y0 + 'px)'; setTimeout(done, 380); if (cl.animate) cl.animate([{ opacity:1 }, { opacity:0 }], { duration:380, fill:'forwards' }); return; }
        cl.animate([{ transform:'translate(' + x0 + 'px,' + y0 + 'px) scale(1)', opacity:1 }, { transform:'translate(' + x0 + 'px,' + (y0 - 18) + 'px) scale(1.18)', opacity:1, offset:0.22 }, { transform:'translate(' + x1 + 'px,' + y1 + 'px) scale(0.35)', opacity:0.25 }], { duration:480, easing:'cubic-bezier(.4,0,.8,.6)', fill:'forwards' }).onfinish = done;
      };
      const finishItem = ()=>{ gone++; if (gone >= SS_ITEMS && !ended) setTimeout(()=> end(), 500); };
      const attach = (node, item, o)=>{
        const w = node.querySelector('.ss-word'); let taken = false;
        const take = ()=>{
          if (ended || taken) return false; taken = true; live.delete(node);
          const good = item.ok; fly(w, good); node.style.visibility = 'hidden'; if (o.anim) o.anim.pause();
          if (good){ right++; streak++; api.score(right * 4); api.sfx.chime(Math.min(8, right + 2)); lightFlash('win'); }
          else { wrong++; streak = 0; api.sfx.wrong(); api.flash('lose'); lightFlash('lose'); shake(); if (timer) timer.add(-1000); if (item.why) api.say(item.w + '? ' + item.why + '!', 1600); }
          setCombo(); tally.textContent = right + ' snapped' + (wrong ? ' · ' + wrong + ' oops' : '');
          if (o.after) o.after();
          return true;
        };
        w.addEventListener('click', (e)=>{ e.stopPropagation(); take(); });
        return take;
      };
      const sign = (item)=> '<button type="button" class="ss-word' + (item.ok ? ' fits' : '') + '">' + esc(item.w) + '</button>';
      const spawn = (item, i)=>{
        if (ended) return;
        const pr = i / (SS_ITEMS - 1), cross = lerp(pr, SS_CROSS), W = field.clientWidth;
        let kind = SS_LANES[i % SS_LANES.length];
        if (kind === 'ufo' && carrying) kind = 'belt';
        if (kind === 'ufo'){
          // The UFO swings back and forth over the belt with the sign in its beam; it lets go after a moment (a miss costs nothing).
          carrying = true; carry.innerHTML = sign(item); ufo.classList.add('has');
          const hold = lerp(pr, [3200, 2300]), node = ufo, w = carry.firstChild;
          const take = (()=>{ let taken = false; return ()=>{
            if (ended || taken) return; taken = true; const good = item.ok; fly(w, good); w.style.visibility = 'hidden';
            if (good){ right++; streak++; api.score(right * 4); api.sfx.chime(Math.min(8, right + 2)); lightFlash('win'); }
            else { wrong++; streak = 0; api.sfx.wrong(); api.flash('lose'); lightFlash('lose'); shake(); if (timer) timer.add(-1000); if (item.why) api.say(item.w + '? ' + item.why + '!', 1600); }
            setCombo(); tally.textContent = right + ' snapped' + (wrong ? ' · ' + wrong + ' oops' : '');
            release(true);
          }; })();
          let released = false;
          const release = (tapped)=>{ if (released) return; released = true; ufo.classList.remove('has'); carrying = false;
            if (!tapped){ if (!lite && carry.animate) carry.animate([{ transform:'translate(-50%,0)', opacity:1 }, { transform:'translate(-50%,46px)', opacity:0 }], { duration:300 });}
            setTimeout(()=>{ carry.innerHTML = ''; }, tapped ? 0 : 280); finishItem(); };
          w.addEventListener('click', (e)=>{ e.stopPropagation(); take(); });
          spawns.push(setTimeout(()=> release(false), hold));
          return;
        }
        const it = el('div', 'ss-item ' + kind);
        if (kind === 'belt'){ it.innerHTML = sign(item); it.style.top = '60%'; }
        else {
          const car = Math.random() < 0.4;
          it.innerHTML = sign(item) + (car ? '<img class="ss-mini" alt="" src="images/saucer-sprite.webp" style="filter:hue-rotate(' + ((i * 67) % 360) + 'deg)">' : '<span class="ss-car">' + SS_CARS[i % SS_CARS.length] + '</span>');
          it.style.top = '86%';
        }
        lane.appendChild(it);
        const iw = it.offsetWidth, dir = kind === 'ground' && i % 2 ? -1 : 1, dur = kind === 'ground' ? cross * 0.72 : cross;
        const from = dir > 0 ? W : -iw - 10, to = dir > 0 ? -iw - 10 : W;
        if (kind === 'ground') it.classList.toggle('flip', dir > 0);   // (the toy cars face their way of travel)
        const a = it.animate([{ transform:'translate(' + from + 'px,-50%)' }, { transform:'translate(' + to + 'px,-50%)' }], { duration: dur, easing:'linear', fill:'forwards' });
        anims.push(a); live.add(it);
        const o = { anim: a, after: finishItem };
        attach(it, item, o);
        a.onfinish = ()=>{ if (live.delete(it)) finishItem(); it.remove(); };
      };
      let t = 300;
      order.forEach((item, i)=>{ spawns.push(setTimeout(()=> spawn(item, i), t)); t += lerp(i / (SS_ITEMS - 1), SS_GAP); });
      // The UFO sweeps across the belt for the whole round.
      requestAnimationFrame(()=>{ const W = field.clientWidth, uw = ufo.offsetWidth; if (ufo.animate) anims.push(ufo.animate([{ transform:'translateX(' + Math.max(0, 70 - uw / 2) + 'px)' }, { transform:'translateX(' + Math.max(80, W - 70 - uw / 2) + 'px)' }], { duration:3600, direction:'alternate', iterations:Infinity, easing:'ease-in-out' })); });
      function end(){
        if (ended) return; ended = true; spawns.forEach(clearTimeout); anims.forEach(a=>{ try{ a.pause(); }catch(e){} });
        const win = right >= 3; glow.className = 'ss-glow hold ' + (win ? 'win' : 'lose'); field.classList.add(win ? 'won' : 'lost');
        setTimeout(()=> api.finish({ pts: right * 4, win, line: right === yes.length && !wrong ? 'Snap-tastic! A perfect sort!' : win ? 'Sharp eyes!' : 'Those words were slippery!' }), 700);
      }
      api.onClose = ()=>{ ended = true; spawns.forEach(clearTimeout); };
      timer = api.timer(SS_MS, end);
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
  const ZAP_SECONDS = 36;   // (Run 4A: 20 -> 28 s; A+: 28 -> 36 s, about 30% more)
  const ZAP_POINTS = [0, 0, 0, 2, 4, 7, 10, 14, 18];
  const ZAP_FOUND_COLORS = ['#7fd0ff', '#ff8a8a', '#ffe640', '#ff9a2e', '#4be07a', '#a566ff', '#ff6fc0', '#2fd9c8'];   // (light blue, light red, yellow, orange, green, purple, pink, teal - then round again)
  //   // (hot pink, teal, lime, orange, blue - one per found word, in turn)   // (J4: one per found word)
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
  // Honeycomb (Oct 26): flat-top hexagons, 6 columns x 6 rows, the odd columns half a tile lower. A tile touches up to 6 others:
  // above and below in its column, and in each side column the two tiles it shares an edge with.
  const ZAP_N = 6;
  function zapNear(i){
    const N = ZAP_N, r = Math.floor(i / N), c = i % N, d = c % 2 ? 1 : 0, out = [];   // (d: an odd column sits half a tile lower)
    const add = (rr, cc)=>{ if (rr >= 0 && rr < N && cc >= 0 && cc < N) out.push(rr * N + cc); };
    add(r - 1, c); add(r + 1, c); add(r - 1 + d, c - 1); add(r + d, c - 1); add(r - 1 + d, c + 1); add(r + d, c + 1);
    return out;
  }
  MG.zapNear = zapNear;
  // Plants words along random honeycomb paths in a 6x6 board, then fills the rest with common letters.
  function zapGrid(rng){
    const N = ZAP_N, near = zapNear;
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
  const ZAP_HEX = '26.2,1.75 73.8,1.75 98.25,50 73.8,98.25 26.2,98.25 1.75,50';   // (a flat-top hexagon with a thin gap around it)
  MG.zapGrid = zapGrid; MG.ZAP_WORDS = ZAP_SEED_WORDS;
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
      s.innerHTML = '<div class="zw-title" aria-hidden="true"><span class="zp">ZAP</span> <span class="zc">WORD</span></div><div class="zw-word" aria-live="polite">&nbsp;</div><div class="zw-grid hc" role="application" aria-label="Letter grid">' +
        grid.letters.map((ch, i)=>{ const c = i % ZAP_N, r = Math.floor(i / ZAP_N), P = ZAP_HEX;
          return '<div class="zw-cell" data-i="' + i + '" style="left:' + (c * 15.7895).toFixed(3) + '%;top:' + ((r + (c % 2) * 0.5) / 6.5 * 100).toFixed(3) + '%;width:21.0526%;height:15.3846%"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon class="hx" points="' + P + '"/><polygon class="lk" points="' + P + '"/><polygon class="kp" points="' + P + '"/></svg><span>' + ch + '</span></div>'; }).join('') + '<svg class="zw-trail" aria-hidden="true"><g class="zw-keeps"></g><polyline class="zw-glow" points=""/><polyline class="zw-line" points=""/></svg></div>' +
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
      // the tile under a finger: the nearest tile centre, if it is inside that tile (neighbouring centres are 0.87 of a tile apart)
      const cellAt = (x, y)=>{
        const r = gEl.getBoundingClientRect(), w = r.width * 0.210526; let best = -1, bd = 1e9;
        for (let i = 0; i < cells.length; i++){ const c = i % ZAP_N, rw = Math.floor(i / ZAP_N), cx = r.left + (c * 0.157895 + 0.105263) * r.width, cy = r.top + (rw + (c % 2) * 0.5 + 0.5) / 6.5 * r.height, d = Math.hypot(x - cx, y - cy); if (d < bd){ bd = d; best = i; } }
        return bd <= w * 0.43 ? best : -1;
      };
      const touching = (a, b)=> zapNear(a).indexOf(b) >= 0;
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
          used.forEach(i=>{ cells[i].style.setProperty('--kc', col); cells[i].classList.add('kept'); });   // (the word's tiles keep a glowing outline in its colour to the end of the round; the newest word wins)
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
  const TF_MS = 32000;   // (A+: 25 s -> 32 s, about 30% more)
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
    rule: 'FACT or FIB? Trust your gut!',
    available: ()=> window.FACT_OR_FIB_REVIEWED === true && Array.isArray(window.FLIPSTAX_FACT_OR_FIB) && window.FLIPSTAX_FACT_OR_FIB.length >= 20,
    run(api){
      const all = window.FLIPSTAX_FACT_OR_FIB || [];
      // G5: never two statements on the same topic in one episode (`k` in data/fact-or-fib.js: the two peanut ones,
      // the two tomato ones...).
      const seen = new Set(), take = (list, n)=>{ const out = []; for (const x of list){ if (out.length >= n) break; const k = x.k || x.s; if (seen.has(k)) continue; seen.add(k); out.push(x); } return out; };
      const t = take(api.shuffle(all.filter(x=> x.t)), 2 + Math.floor(api.rng() * 2)), f = take(api.shuffle(all.filter(x=> !x.t)), 3);
      const qs = api.shuffle(t.concat(f)).slice(0, FF_ROUNDS);
      const s = api.stage; s.classList.add('ff-stage');
      { const sg = api.overlay.querySelector('.mg-sign span'); if (sg) sg.innerHTML = '<b class="ff-fa">FACT</b> <i>OR</i> <b class="ff-fi">FIB</b>'; }   // (the gold marquee sign: FACT glows green, FIB red)
      s.innerHTML = '<div class="ff-dots">' + qs.map(()=> '<i></i>').join('') + '</div><div class="ff-bubble" aria-live="polite"><span class="ff-text"></span><span class="ff-fact"></span><b class="ff-stamp"></b></div>' +
        '<div class="ff-btns"><button type="button" class="ff-btn yes">FACT</button><button type="button" class="ff-btn no">FIB</button></div>' +
        '<div class="ff-host host-full">' + api.hostSvg() + '</div>';
      const bubble = s.querySelector('.ff-bubble'), text = s.querySelector('.ff-text'), fact = s.querySelector('.ff-fact'), stamp = s.querySelector('.ff-stamp'), host = s.querySelector('.ff-host'), btns = [...s.querySelectorAll('.ff-btn')], dots = [...s.querySelectorAll('.ff-dots i')];
      // auto-fit: the statement and the fact shrink (down to 14 px) until they fit in at most three lines - never overflow the box
      const fit = (el, maxPx)=>{ if (!el) return; let px = maxPx; el.style.fontSize = px + 'px';
        const lines = ()=>{ const lh = parseFloat(getComputedStyle(el).lineHeight) || px * 1.2; return Math.round(el.scrollHeight / lh); };
        while (px > 14 && (lines() > 3 || el.scrollWidth > el.clientWidth + 1)){ px -= 1; el.style.fontSize = px + 'px'; } };
      const fitAll = ()=>{ const base = parseFloat(getComputedStyle(bubble).fontSize) || 26; fit(text, base); if (fact.textContent) fit(fact, Math.min(base * 0.8, 22)); };
      let i = 0, right = 0, locked = true, timer = null, ended = false;
      const ask = ()=>{
        const q = qs[i]; text.textContent = q.s; fact.textContent = ''; text.style.fontSize = ''; fact.style.fontSize = ''; requestAnimationFrame(fitAll); stamp.className = 'ff-stamp'; stamp.textContent = ''; bubble.classList.remove('said');
        host.classList.remove('up'); void host.offsetWidth; host.classList.add('up');   // he pops up from the bottom
        if (!api.reduced) bubble.animate([{ transform:'scale(0.6)', opacity:0 }, { transform:'scale(1)', opacity:1 }], { duration:300, easing:'cubic-bezier(.2,1.5,.4,1)' });
        api.sfx.hostVoice(q.s); locked = false; btns.forEach(b=>{ b.disabled = false; b.classList.remove('glow', 'dim'); });
        timer = api.timer(FF_MS, ()=> answer(null));
      };
      const answer = (yes)=>{
        if (locked || ended) return; locked = true; btns.forEach(b=> b.disabled = true); if (timer) timer.stop();
        const q = qs[i], ok = yes !== null && yes === q.t;
        stamp.textContent = q.t ? 'FACT!' : 'FIB!';
        btns[q.t ? 0 : 1].classList.add('glow'); btns[q.t ? 1 : 0].classList.add('dim');   // the reveal: the correct chip glows, the other dims (held for the shared reveal time) stamp.className = 'ff-stamp on ' + (q.t ? 'true' : 'fib');
        dots[i].classList.add(ok ? 'right' : 'wrong');
        if (ok){ right++; api.score(right * 10); api.sfx.ding(); api.flash('win'); api.mood('cheer'); }
        else { api.sfx.strike(); api.flash('lose'); api.mood('sad'); }
        setTimeout(()=>{ if (ended) return; fact.textContent = q.r; bubble.classList.add('said'); fitAll(); api.sfx.hostVoice(q.r); }, 650);   // (the statement stays, the fact goes under it)
        api.hold(()=>{
          if (ended) return; i++;
          if (i >= qs.length){ const pts = right * 10 + (right === qs.length ? 20 : 0);
            api.finish({ pts, win: right >= 3, line: right === qs.length ? 'Five for five! +20 bonus!' : right >= 3 ? 'You know your facts!' : 'Fooled you, Earthling!' }); return; }
          ask();
        }, { lead:650, min:1950, text: q.s + ' ' + q.r });   // (the fact lands at 0.65 s; the hold is PACE x 1.95 s or the statement and fact's reading time)
      };
      btns[0].addEventListener('click', ()=>{ api.sfx.tap('top'); answer(true); });
      btns[1].addEventListener('click', ()=>{ api.sfx.tap('bottom'); answer(false); });
      api.onClose = ()=>{ ended = true; };
      ask();
    },
  });

  // ---------------------------------------------------------------- E6. Saucer Shuffle (A+ job 2: the casino table)
  // A green felt table with a gold rail, red curtains at the sides, a marquee-framed title sign and a purple panel for the prompt and the result.
  // Glossy silver saucers (SVG) with a ring of small coloured lights. One lifts to show the star, they settle and shuffle, then you tap one.
  // Harder each round: 3 saucers / 4 swaps (moderate), 4 / 7 (faster), 5 / 10 (fast, a few crossovers: a swap of saucers that are not next to each
  // other, one arcing over the other). DECOY LIGHTS: while they shuffle the lights shift colours in changing patterns (a colour change at most
  // 3 times a second per light, no on-off strobing; lite mode and reduced motion keep them steady). The saucers' positions come from the game
  // logic and are always exact. Scoring is unchanged: +10 per right pick.
  const SU_ROUNDS = [{ n:3, swaps:4, ms:520, cross:0 }, { n:4, swaps:7, ms:400, cross:0 }, { n:5, swaps:10, ms:300, cross:3 }];
  const SU_LIGHT_COLORS = ['#ff4d6d', '#ffd23f', '#3de07a', '#39a7ff', '#c77dff'];
  const SU_LIGHTS = 14, SU_LIGHT_MS = 380;   // (one change per light per 380 ms = 2.6 a second at most)
  // the saucer is a sprite (images/saucer-sprite.webp, about 2.2 : 1); the decoy lights are small dots drawn along the ring painted on it
  const suSaucerSvg = ()=> {
    let l = ''; for (let i = 0; i < SU_LIGHTS; i++){ const t = Math.PI * (0.05 + 0.9 * i / (SU_LIGHTS - 1)), x = 450 + 318 * Math.cos(t), y = 130 + 88 * Math.sin(t); l += '<circle class="lt" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="17" fill="#fff3a8" stroke="rgba(0,0,0,0.35)" stroke-width="3"/>'; }
    return '<img class="su-img" src="images/saucer-sprite.webp" alt="" draggable="false" decoding="async"><svg class="su-ufo" viewBox="0 0 900 407" aria-hidden="true">' + l + '</svg>';
  };
  MG.register('saucerShuffle', {
    name: 'Saucer Shuffle', colors: ['#d9c2ff', '#6b2d8a', '#1a0826'], bulb: '#e9e4ff',
    rule: 'Watch the saucer with the star!', host: '',
    available: ()=> true,
    run(api){
      const s = api.stage; s.classList.add('sc-stage');
      s.innerHTML = '<div class="sc-casino"><i class="sc-curtain l"></i><i class="sc-curtain r"></i><i class="sc-spot a"></i><i class="sc-spot b"></i>' +
        '<div class="sc-sign"><b>SAUCER SHUFFLE</b><small class="sc-round">ROUND 1 OF 3</small></div>' +
        '<div class="sc-table"><i class="sc-cone a"></i><i class="sc-cone b"></i><i class="sc-cone c"></i><div class="sc-play"><div class="su-star" aria-hidden="true">&#11088;</div></div></div>' +
        '<div class="sc-panel"><span class="sc-msg">Watch the saucer with the star!</span></div></div>';
      const play = s.querySelector('.sc-play'), star = s.querySelector('.su-star'), roundEl = s.querySelector('.sc-round'), msg = s.querySelector('.sc-msg');
      const say = (t)=>{ msg.textContent = t; };
      let saucers = [], lights = [], pos = [], N = 3;      // pos[saucer] = its slot - the truth
      let starAt = 0, round = 0, phase = 'show', right = 0, ended = false, timer = null, lightT = 0, lightTick = 0, shuffling = false;
      const W = ()=> play.clientWidth, H = ()=> play.clientHeight;
      // every round the saucers are about 29% of the table width: 3 in one row, 4 in a 2 x 2 grid, 5 as 3 on top and 2 below (centred between them);
      // the whole group is centred on the felt. slotXY(slot) is the centre of a slot; positions are transforms only.
      const GAPF = 0.04, SWF = 0.29;
      const sw = ()=> W() * SWF, shh = ()=> sw() * 407 / 900, ROWDY = ()=> shh() + 82;   // (rows leave room for the star under a saucer)
      const slotXY = (slot)=>{
        const w = W(), cx = w / 2, step = sw() + w * GAPF, cy = H() * 0.5, dy = ROWDY() / 2;
        if (N === 3) return [cx + (slot - 1) * step, cy];
        if (N === 4) return [cx + ((slot % 2) - 0.5) * step, cy + (slot < 2 ? -dy : dy)];
        return slot < 3 ? [cx + (slot - 1) * step, cy - dy] : [cx + ((slot - 3) - 0.5) * step, cy + dy];
      };
      const tableY = ()=> H() * 0.5;
      const tf = (xy, h)=> 'translate(' + (xy[0] - sw() / 2).toFixed(1) + 'px,' + (xy[1] - h / 2).toFixed(1) + 'px)';
      const place = (k)=>{ saucers[k].style.transform = tf(slotXY(pos[k]), saucers[k].offsetHeight || shh()); };
      const layout = ()=>{ saucers.forEach((sv, k)=>{ sv.style.width = sw().toFixed(0) + 'px'; sv.style.top = '0px'; place(k); }); };
      // the star sits directly under a saucer, centred on it (from the saucer's resting slot)
      const starUnder = (k)=>{ const xy = slotXY(pos[k]); star.style.left = xy[0].toFixed(1) + 'px'; star.style.top = (xy[1] + shh() * 0.5 + 2).toFixed(1) + 'px'; };
      const build = (n)=>{
        N = n; play.querySelectorAll('.su-saucer').forEach(e=> e.remove()); saucers = []; lights = []; pos = [];
        for (let k = 0; k < n; k++){
          const b = document.createElement('button'); b.type = 'button'; b.className = 'su-saucer'; b.dataset.k = k; b.setAttribute('aria-label', 'Saucer ' + (k + 1)); b.innerHTML = suSaucerSvg();
          play.appendChild(b); saucers.push(b); pos.push(k); lights.push([...b.querySelectorAll('.lt')]);
          b.addEventListener('click', ()=>{ if (phase === 'pick'){ api.sfx.tap('top'); pick(k); } });
        }
        layout();
      };
      // the decoy lights: patterns that change every 1.6 s (a chase, an alternation, a wave across the saucers, scattered); steady in lite mode, reduced motion, and off the shuffle
      const steady = (c)=> lights.forEach(a=> a.forEach(l=> l.setAttribute('fill', c)));
      const paintLights = ()=>{
        const pat = Math.floor(lightTick * SU_LIGHT_MS / 1600) % 4, P = SU_LIGHT_COLORS.length;
        lights.forEach((a, k)=> a.forEach((l, i)=>{
          let c;
          if (pat === 0) c = (i + lightTick) % P;                          // a chase round each saucer
          else if (pat === 1) c = (i % 2 ? lightTick + 2 : lightTick) % P;  // two interleaved colours trading places
          else if (pat === 2) c = (k * 2 + i + lightTick * 2) % P;          // a wave running across the saucers
          else c = (i * 3 + k + lightTick * 3 + ((lightTick >> 1) & 1)) % P;  // scattered
          const col = SU_LIGHT_COLORS[c]; if (l.getAttribute('fill') !== col) l.setAttribute('fill', col);
        }));
      };
      const startLights = ()=>{ stopLights(); if (api.lite || api.reduced){ steady('#ffd23f'); return; } lightTick = 0; paintLights(); lightT = setInterval(()=>{ if (ended) return stopLights(); lightTick++; paintLights(); }, SU_LIGHT_MS); };
      const stopLights = ()=>{ clearInterval(lightT); lightT = 0; steady('#fff3a8'); };
      const lift = (k, up, ms)=> new Promise(res=>{ const base = saucers[k].style.transform; if (api.reduced){ saucers[k].classList.toggle('up', up); return res(); }
        saucers[k].animate([{ transform: base + (up ? '' : ' translateY(-60px)') }, { transform: base + (up ? ' translateY(-60px)' : '') }], { duration: ms || 320, easing:'cubic-bezier(.3,1.3,.5,1)', fill:'forwards' }).onfinish = res; });
      const settle = ()=> saucers.forEach(sv=> sv.getAnimations().forEach(a=>{ try{ a.cancel(); }catch(e){} }));
      const swap = (a, b, ms)=> new Promise(res=>{
        const ia = pos[a], ib = pos[b]; pos[a] = ib; pos[b] = ia; api.sfx.whoosh();
        if (api.reduced || !saucers[a].animate){ place(a); place(b); return setTimeout(res, 80); }
        const h = saucers[a].offsetHeight || shh(), pa = slotXY(ia), pb = slotXY(ib), far = Math.abs(ia - ib) > 1;
        const A = [pa[0] - sw() / 2, pa[1] - h / 2], B = [pb[0] - sw() / 2, pb[1] - h / 2], mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
        const T = (xy, dy)=> 'translate(' + xy[0].toFixed(1) + 'px,' + (xy[1] + (dy || 0)).toFixed(1) + 'px)';
        const arc = (from, to, dy)=> [{ transform:T(from) }, { transform:T(mid, dy), offset:0.5 }, { transform:T(to) }];
        saucers[a].style.zIndex = 3; saucers[b].style.zIndex = 4;
        saucers[a].animate(arc(A, B, far ? -30 : -20), { duration: ms, easing:'ease-in-out' });
        saucers[b].animate(arc(B, A, far ? 14 : 10), { duration: ms, easing:'ease-in-out' }).onfinish = ()=>{ place(a); place(b); saucers[a].style.zIndex = ''; saucers[b].style.zIndex = ''; res(); };
      });
      const wait = (ms)=> new Promise(r=> setTimeout(r, ms));
      async function playRound(){
        if (ended) return;
        const R = SU_ROUNDS[round]; roundEl.textContent = 'ROUND ' + (round + 1) + ' OF 3';
        phase = 'show'; play.classList.remove('picking'); stopLights(); build(R.n); starAt = Math.floor(api.rng() * R.n);
        say(['Eyes on the star!', 'Faster now! More saucers!', 'Five saucers! Hold on to your antennae!'][round]);
        await wait(450); if (ended) return;
        starUnder(starAt); star.classList.add('on');
        await lift(starAt, true); api.sfx.chime(5); await wait(650); await lift(starAt, false); star.classList.remove('on'); settle(); layout();
        await wait(300); if (ended) return;
        say('Follow that saucer!'); shuffling = true; startLights();
        // the shuffle: always two different saucers; in the last round a few swaps are crossovers (saucers that are not neighbours)
        const crossAt = new Set(); while (crossAt.size < R.cross) crossAt.add(1 + Math.floor(api.rng() * (R.swaps - 1)));
        for (let n = 0; n < R.swaps && !ended; n++){
          let a = Math.floor(api.rng() * R.n), b;
          if (crossAt.has(n)){ const far = []; for (let j = 0; j < R.n; j++) if (Math.abs(pos[j] - pos[a]) > 1) far.push(j); b = far.length ? far[Math.floor(api.rng() * far.length)] : (a + 1) % R.n; }
          else b = (a + 1 + Math.floor(api.rng() * (R.n - 1))) % R.n;
          await swap(a, b, R.ms);
        }
        shuffling = false; stopLights(); if (ended) return;
        say('Which one, Earthling?'); phase = 'pick'; play.classList.add('picking');
        timer = api.timer(6000, ()=> pick(-1));
      }
      async function pick(k){
        if (phase !== 'pick' || ended) return; phase = 'reveal'; play.classList.remove('picking'); if (timer) timer.stop();
        const hit = k === starAt;
        starUnder(starAt); star.classList.add('on');   // the star marker under the winning saucer
        if (hit){ right++; api.score(right * 10); say('You got it! +10'); await lift(k, true); api.sfx.ding(); api.flash('win'); api.mood('cheer'); }
        else { say(k < 0 ? 'Too slow! It was this one.' : 'Ooh, it was this one!'); await Promise.all(saucers.map((_, j)=> lift(j, true))); api.sfx.chime(2); api.mood('sad'); }
        await new Promise(r=> api.hold(r)); star.classList.remove('on'); round++;   // (A+: the shared reveal hold)
        if (round >= SU_ROUNDS.length || ended){ api.finish({ pts: right * 10, win: right >= 2, line: right === 3 ? 'Sharpest eyes in the galaxy!' : right >= 2 ? 'Nice tracking!' : 'Those saucers were sneaky!' }); return; }
        playRound();
      }
      api.onClose = ()=>{ ended = true; clearInterval(lightT); };
      requestAnimationFrame(()=>{ build(SU_ROUNDS[0].n); playRound(); });
    },
  });
})();
