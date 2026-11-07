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
  // the little neon conveyor carts that roll along the road (an inline SVG in one of six neon colours - the old car emoji, taxi included, are gone)
  const SS_CART_COLORS = ['#7df9ff', '#ff5fd2', '#ffd23f', '#5effa0', '#b98bff', '#ff8a3c'];
  const ssCart = (i)=>{ const k = SS_CART_COLORS[i % SS_CART_COLORS.length]; return '<svg class="ss-cart" viewBox="0 0 100 54" aria-hidden="true"><path d="M10 8h80l-9 26H19z" fill="#1c1245" stroke="' + k + '" stroke-width="4" stroke-linejoin="round"/><path d="M22 16h56" stroke="' + k + '" stroke-width="3" stroke-linecap="round" opacity="0.8"/><rect x="6" y="34" width="88" height="7" rx="3.5" fill="' + k + '"/><circle cx="28" cy="46" r="7" fill="#0a0524" stroke="' + k + '" stroke-width="3.5"/><circle cx="72" cy="46" r="7" fill="#0a0524" stroke="' + k + '" stroke-width="3.5"/></svg>'; };
  const SS_LANES = ['belt', 'ground', 'belt', 'ufo', 'ground'];
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
      // Never the same sign twice in a row: build the order one sign at a time, each different from the one before; if the last few left are all
      // the same sign (a rare dead end), shuffle and build again.
      const deal = ()=>{
        const left = api.shuffle(words.slice(0, SS_ITEMS)), out = [];
        while (left.length){ const k = left.findIndex(x=> !out.length || x.w !== out[out.length - 1].w); if (k < 0) return null; out.push(left.splice(k, 1)[0]); }
        return out;
      };
      let order = null;
      for (let t = 0; t < 60 && !order; t++) order = deal();
      if (!order) order = api.shuffle(words.slice(0, SS_ITEMS));
      const lite = api.lite || api.reduced;
      // fix 4: the spiral galaxy. The whole vortex sits centred in the field with a bright core; a segmented glowing ring round it is the round's timer. Each word
      // comes in from a screen edge and spirals in toward the core along a curved path (a light trail behind it) - the same items, timing, scoring and rules as before.
      // A right tap: sparkles, the pill is sucked into the core and the core pulses once. A wrong tap: a red flash and the pill drifts off. Transform and opacity only.
      const s = api.stage; s.classList.add('ss-stage', 'ss-galaxy');
      const RING_N = 30;
      let ringSvg = '<svg class="ss-ring" viewBox="0 0 200 200" aria-hidden="true">';
      for (let k = 0; k < RING_N; k++){ const a0 = (k / RING_N) * Math.PI * 2 - Math.PI / 2, a1 = a0 + (Math.PI * 2 / RING_N) * 0.72, R = 92;
        ringSvg += '<path class="seg" d="M' + (100 + R * Math.cos(a0)).toFixed(2) + ' ' + (100 + R * Math.sin(a0)).toFixed(2) + ' A' + R + ' ' + R + ' 0 0 1 ' + (100 + R * Math.cos(a1)).toFixed(2) + ' ' + (100 + R * Math.sin(a1)).toFixed(2) + '"/>'; }
      ringSvg += '</svg>';
      s.innerHTML = '<div class="ss-cat"><span class="ss-badge ' + tier + '">' + tier.toUpperCase() + '</span><small>Tap the:</small>' + esc(c.cat.toUpperCase()) + '</div>' +
        '<div class="ss-combo"><span class="ss-cl">COMBO</span><span class="ss-pips"><i></i><i></i><i></i><i></i><i></i></span><span class="ss-tally"></span></div>' +
        '<div class="ss-field"><div class="ss-vortex" aria-hidden="true"><i class="ss-vimg"></i><i class="ss-vspin"></i>' + ringSvg + '<i class="ss-core"></i></div>' +
        '<div class="ss-lane"></div><div class="ss-glow"></div></div>';
      const field = s.querySelector('.ss-field'), lane = s.querySelector('.ss-lane'), tally = s.querySelector('.ss-tally'), pips = [...s.querySelectorAll('.ss-pips i')];
      const glow = s.querySelector('.ss-glow'), core = s.querySelector('.ss-core'), segs = [...s.querySelectorAll('.ss-ring .seg')];
      let right = 0, wrong = 0, ended = false, streak = 0, gone = 0, timer = null;
      const anims = [], spawns = [], live = new Set();
      const lerp = (pr, [a, b])=> a + (b - a) * pr;
      const setCombo = ()=>{ pips.forEach((p, k)=> p.classList.toggle('on', k < Math.min(5, streak))); s.querySelector('.ss-cl').textContent = streak >= 5 ? 'ON FIRE ×' + streak : streak >= 2 ? 'COMBO ×' + streak : 'COMBO'; s.querySelector('.ss-combo').classList.toggle('hot', streak >= 3); };
      const centre = ()=> [field.clientWidth / 2, field.clientHeight / 2];
      const sparkle = (x, y, good)=>{
        if (lite || !field.animate) return;
        for (let k = 0; k < (good ? 14 : 8); k++){
          const st = el('i', 'ss-spark' + (good ? '' : ' bad')); field.appendChild(st);
          const ang = k / (good ? 14 : 8) * Math.PI * 2 + Math.random() * 0.5, d = 26 + Math.random() * 30;
          st.style.left = x + 'px'; st.style.top = y + 'px';
          st.animate([{ transform:'translate(-50%,-50%) scale(0.4)', opacity:1 }, { transform:'translate(' + (Math.cos(ang) * d - 7) + 'px,' + (Math.sin(ang) * d - 7) + 'px) scale(1.1) rotate(180deg)', opacity:0 }], { duration:520, easing:'ease-out' }).onfinish = ()=> st.remove();
        }
      };
      const pulseCore = ()=>{ core.classList.remove('pulse'); void core.offsetWidth; core.classList.add('pulse'); };
      const lightFlash = (cls)=>{ glow.className = 'ss-glow ' + cls; if (glow.animate) glow.animate([{ opacity:0 }, { opacity:1, offset:0.18 }, { opacity:0 }], { duration: cls === 'lose' ? 420 : 520 }); };
      // the tapped pill: right - sucked into the core; wrong - flashes red and drifts off outward
      const fly = (node, good)=>{
        const fr = field.getBoundingClientRect(), r = node.getBoundingClientRect(), [cx, cy] = centre();
        const cl = node.cloneNode(true); cl.classList.add('ss-fly', good ? 'right' : 'wrong'); cl.style.cssText = 'left:0;top:0;width:' + r.width + 'px;height:' + r.height + 'px;margin:0';
        field.appendChild(cl);
        const x0 = r.left - fr.left, y0 = r.top - fr.top, mx = x0 + r.width / 2, my = y0 + r.height / 2;
        sparkle(mx, my, good);
        const T = (x, y, sc, rot)=> 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + sc + ') rotate(' + (rot || 0) + 'deg)';
        if (lite || !cl.animate){ cl.style.transform = T(x0, y0, 1); if (cl.animate) cl.animate([{ opacity:1 }, { opacity:0 }], { duration:380, fill:'forwards' }).onfinish = ()=> cl.remove(); else setTimeout(()=> cl.remove(), 380); if (good) pulseCore(); return; }
        if (good){
          const tx = cx - r.width / 2, ty = cy - r.height / 2;
          cl.animate([{ transform:T(x0, y0, 1), opacity:1 }, { transform:T(x0 + (tx - x0) * 0.35, y0 + (ty - y0) * 0.35 - 10, 1.08, 40), opacity:1, offset:0.3 }, { transform:T(tx, ty, 0.12, 300), opacity:0.1 }], { duration:560, easing:'cubic-bezier(.5,0,.9,.5)', fill:'forwards' }).onfinish = ()=>{ cl.remove(); pulseCore(); };
        } else {
          const dx = mx - cx, dy = my - cy, d = Math.max(1, Math.hypot(dx, dy)), ox = dx / d * 70, oy = dy / d * 70;
          cl.animate([{ transform:T(x0, y0, 1), opacity:1 }, { transform:T(x0 - 6, y0, 1), offset:0.1 }, { transform:T(x0 + 6, y0, 1), offset:0.2 }, { transform:T(x0, y0, 1), opacity:1, offset:0.3 }, { transform:T(x0 + ox, y0 + oy, 0.9, dx > 0 ? 14 : -14), opacity:0 }], { duration:760, easing:'ease-out', fill:'forwards' }).onfinish = ()=> cl.remove();
        }
      };
      const finishItem = ()=>{ gone++; if (gone >= SS_ITEMS && !ended) setTimeout(()=> end(), 500); };
      const sign = (item)=> '<button type="button" class="ss-word' + (item.ok ? ' fits' : '') + '">' + esc(item.w) + '</button>';
      // a spiral from the edge to the core: the angle turns about three quarters of a turn while the radius shrinks; the pill is kept wholly inside the field
      const spiralFrames = (i, w, h)=>{
        const W = field.clientWidth, H = field.clientHeight, [cx, cy] = centre(), dir = i % 2 ? -1 : 1;
        const a0 = (i * 2.399) % (Math.PI * 2), R0 = Math.hypot(W, H) / 2, rc = Math.min(W, H) * 0.07, turn = dir * Math.PI * 1.5, N = 28, out = [];
        for (let k = 0; k <= N; k++){
          const p = k / N, e = p, a = a0 + turn * p, rr = R0 * (1 - e) + rc * e;
          let x = cx + Math.cos(a) * rr - w / 2, y = cy + Math.sin(a) * rr * 0.92 - h / 2;
          x = Math.max(4, Math.min(W - w - 4, x)); y = Math.max(4, Math.min(H - h - 4, y));
          out.push({ transform:'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + (1 - 0.32 * p * p).toFixed(3) + ')', opacity: k === 0 ? 0 : k === N ? 0 : 1, offset:p });
        }
        out[1].opacity = 1; return out;
      };
      const spawn = (item, i)=>{
        if (ended) return;
        const pr = i / (SS_ITEMS - 1), dur = lerp(pr, SS_CROSS);
        const it = el('div', 'ss-item spiral'); it.innerHTML = sign(item); lane.appendChild(it);
        const w = it.offsetWidth, h = it.offsetHeight, frames = spiralFrames(i, w, h);
        const a = it.animate(frames, { duration: dur, easing:'linear', fill:'forwards' });
        anims.push(a); live.add(it);
        // the light trail: three glowing dots following the same path a moment behind
        const trail = [];
        if (!lite){ [90, 180, 270].forEach((lag, k)=>{ const d = el('i', 'ss-trail t' + k); d.style.left = (w / 2 - 5) + 'px'; d.style.top = (h / 2 - 5) + 'px'; lane.appendChild(d);
          const ta = d.animate(frames.map(f=> Object.assign({}, f, { opacity: f.opacity ? 0.7 - k * 0.2 : 0 })), { duration: dur, delay: lag, easing:'linear', fill:'both' }); anims.push(ta); ta.onfinish = ()=> d.remove(); trail.push(d); }); }
        const w0 = it.querySelector('.ss-word'); let taken = false;
        w0.addEventListener('click', (e)=>{
          e.stopPropagation(); if (ended || taken) return; taken = true; live.delete(it);
          const good = item.ok; fly(w0, good); it.style.visibility = 'hidden'; a.pause(); trail.forEach(d=> d.remove());
          if (good){ right++; streak++; api.score(right * 4); api.sfx.chime(Math.min(8, right + 2)); lightFlash('win'); }
          else { wrong++; streak = 0; api.sfx.wrong(); api.flash('lose'); lightFlash('lose'); if (timer) timer.add(-1000); if (item.why) api.say(item.w + '? ' + item.why + '!', 1600); }
          setCombo(); tally.textContent = right + ' snapped' + (wrong ? ' · ' + wrong + ' oops' : '');
          finishItem();
        });
        a.onfinish = ()=>{ if (live.delete(it)) finishItem(); it.remove(); };
      };
      let t = 300;
      order.forEach((item, i)=>{ spawns.push(setTimeout(()=> spawn(item, i), t)); t += lerp(i / (SS_ITEMS - 1), SS_GAP); });
      // the ring timer: its segments go dark one by one as the round's time runs down (it follows the real timer, a wrong tap's lost second included)
      let total = 0;
      const ringT = setInterval(()=>{ if (ended || !timer){ if (ended) clearInterval(ringT); return; } const left = timer.left(); total = Math.max(total, left); const lit = Math.ceil(RING_N * left / Math.max(1, total));
        segs.forEach((g, k)=> g.classList.toggle('off', k >= lit)); field.classList.toggle('ss-late', lit <= RING_N / 5); }, 200);
      function end(){
        if (ended) return; ended = true; spawns.forEach(clearTimeout); anims.forEach(a=>{ try{ a.pause(); }catch(e){} });
        const win = right >= 3; glow.className = 'ss-glow hold ' + (win ? 'win' : 'lose'); field.classList.add(win ? 'won' : 'lost');
        setTimeout(()=> api.finish({ pts: right * 4, win, line: right === yes.length && !wrong ? 'Snap-tastic! A perfect sort!' : win ? 'Sharp eyes!' : 'Those words were slippery!' }), 700);
      }
      api.onClose = ()=>{ ended = true; spawns.forEach(clearTimeout); };
      timer = api.timer(SS_MS, end);
    },
  });

  // ---------------------------------------------------------------- Price Probe (A+ rebuild, Oct 2026)
  // Three things side by side (emoji, short name, descriptor); tap the one that costs the MOST - or, in a question or two, the LEAST
  // (always spelled out). 5 questions. After a pick the three prices count up one at a time and the right one glows gold. A side
  // meter rises on a right answer and falls on a wrong one; 4 or more right wins an orb. Sets: data/price-sets.js. World: gold on money green.
  const PR_Q = 5, PR_Q_MS = 11000, PR_COUNT_MS = 1200, PR_PTS = 10;
  const prFmt = (n)=> '$' + Math.round(n).toLocaleString('en-US');
  MG.register('priceProbe', {
    name: 'Price Probe', colors: ['#ffe680', '#c98a00', '#0d3b26'], bulb: '#ffd23f',
    rule: 'Tap the one that costs the MOST - unless it says LEAST!', host: 'Open your wallets, Earthlings!',
    available: ()=> Array.isArray(window.FLIPSTAX_PRICE_SETS) && window.FLIPSTAX_PRICE_SETS.length >= 40,
    run(api){
      const prDay = api.opts && api.opts.day, S = window.FLIPSTAX_SCHED, PS = window.FLIPSTAX_PRICE_SETS;
      const prKey = (set)=> set.map(i=> i[1]).join('|'), prKeys = PS.map(prKey);
      const all = (prDay != null && S) ? Array.from({ length:PR_Q }, (_, k)=>{ const kk = S.pick('price-sets', prKeys, prDay, k, PR_Q); return PS[prKeys.indexOf(kk)]; })   // the frozen schedule: 5 sets a day through the whole bank
        : api.shuffle(PS).slice(0, PR_Q);
      // One or two of the five ask for the CHEAPEST.
      const leastAt = new Set(api.shuffle([1, 2, 3, 4]).slice(0, 1 + Math.floor(api.rng() * 2)));
      const lite = api.lite || api.reduced;
      const s = api.stage; s.classList.add('pr-stage');
      s.innerHTML = '<div class="pr-ask"></div><div class="pr-body"><div class="pr-cards"></div><div class="pr-meter" aria-hidden="true"><b class="pr-orb">●</b><div class="pr-col"><i class="pr-fill"></i><u class="pr-line"></u></div><span class="pr-q">0/5</span></div></div>' +
        '<div class="pr-dots">' + Array.from({ length: PR_Q }, ()=> '<i></i>').join('') + '</div><div class="pr-marq a"></div><div class="pr-marq b"></div><div class="pr-dim"></div>';
      const ask = s.querySelector('.pr-ask'), cardsEl = s.querySelector('.pr-cards'), fill = s.querySelector('.pr-fill'), meter = s.querySelector('.pr-meter'), qEl = s.querySelector('.pr-q'), dots = [...s.querySelectorAll('.pr-dots i')];
      let round = 0, right = 0, level = 0, locked = true, over = false, timer = null;
      const setMeter = ()=>{ fill.style.transform = 'scaleY(' + (level / PR_Q) + ')'; qEl.textContent = right + '/' + PR_Q; };
      const countUp = (node, to, cb)=>{
        const ms = api.dt(PR_COUNT_MS);
        if (lite){ node.textContent = prFmt(to); if (node.animate) node.animate([{ opacity:0 }, { opacity:1 }], { duration:240 }); setTimeout(cb, Math.min(ms, 400)); return; }
        const t0 = performance.now();
        const step = (t)=>{ if (over) return; const p = Math.min(1, (t - t0) / ms); node.textContent = prFmt(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else cb(); };
        requestAnimationFrame(step);
      };
      const burst = (el)=>{ if (!lite && api.FX && api.FX.burstAt) api.FX.burstAt(api.fxLayer, el, { count:14, spread:46, colors:['#fff3a0', '#ffd23f', '#ffffff', '#7dffa8'] }); };
      const show = ()=>{
        const set = all[round], least = leastAt.has(round);
        const items = api.shuffle(set.map(([g, n, d, p])=> ({ g, n, d, p })));
        const target = items.reduce((b, x)=> (least ? x.p < b.p : x.p > b.p) ? x : b);
        ask.innerHTML = 'Which costs the <b class="' + (least ? 'least' : 'most') + '">' + (least ? 'LEAST' : 'MOST') + '</b>?';
        ask.classList.toggle('least', least);
        cardsEl.innerHTML = items.map((x, i)=> '<button type="button" class="pr-card" data-i="' + i + '"><span class="pr-g">' + x.g + '</span><span class="pr-n">' + esc(x.n) + '</span><span class="pr-d">' + esc(x.d) + '</span><span class="pr-p">$ ?</span></button>').join('');
        const cards = [...cardsEl.querySelectorAll('.pr-card')];
        if (!lite && cardsEl.animate) cards.forEach((c, i)=> c.animate([{ transform:'translateY(26px)', opacity:0 }, { transform:'none', opacity:1 }], { duration:300, delay:i * 70, easing:'ease-out', fill:'backwards' }));
        locked = false;
        timer = api.timer(PR_Q_MS, ()=> pick(-1));
        cards.forEach((c, i)=> c.addEventListener('click', ()=>{ api.sfx.tap('top'); pick(i); }));
        const pick = (i)=>{
          if (locked || over) return; locked = true; if (timer) timer.stop();
          const ok = i >= 0 && items[i] === target;
          cards.forEach(c=> c.disabled = true);
          const tIdx = items.indexOf(target);
          if (i >= 0) cards[i].classList.add('picked');
          if (ok){ right++; level = Math.min(PR_Q, level + 1); cards[i].classList.add('good'); burst(cards[i]); if (api.smallWin) api.smallWin(cards[i]); { const pp = document.createElement('div'); pp.className = 'bb-pop pr-pop'; pp.textContent = '+' + PR_PTS; s.appendChild(pp); setTimeout(()=> pp.remove(), 900); }  api.sfx.ding(); api.flash('win'); meter.classList.add('up'); setTimeout(()=> meter.classList.remove('up'), 700); }
          else {
            level = Math.max(0, level - 1); api.sfx.wrong(); api.flash('lose'); meter.classList.add('down'); setTimeout(()=> meter.classList.remove('down'), 700);
            cards.forEach((c, k)=>{ if (k !== tIdx) c.classList.add('dim'); }); cards[tIdx].classList.add('lit'); s.classList.add('tint'); setTimeout(()=> s.classList.remove('tint'), 650);
            if (i < 0) api.say('Too slow, Earthling!', 1400);
          }
          dots[round].classList.add(ok ? 'right' : 'wrong'); setMeter();
          // The three prices count up one at a time, left to right; then the right one wears the gold glow.
          let k = 0;
          const next = ()=>{
            if (over) return;
            if (k >= cards.length){ cards[tIdx].classList.add('gold'); if (!ok) burst(cards[tIdx]); api.sfx.cashRegister && api.sfx.cashRegister(); return; }
            const c = cards[k++]; c.classList.add('shown'); api.sfx.tick && api.sfx.tick(false);
            countUp(c.querySelector('.pr-p'), items[k - 1].p, next);
          };
          next();
          api.hold(()=>{
            round++;
            if (round >= PR_Q){ end(); return; }
            show();
          }, { lead: cards.length * api.dt(PR_COUNT_MS) + 300 });
        };
      };
      const end = ()=>{
        if (over) return;
        over = true;
        const win = right >= 4; s.classList.add(win ? 'won' : 'lost');
        const perfect = right === PR_Q;
        const fin = ()=> api.finish({ pts: right * PR_PTS, win, line: right === PR_Q ? 'A perfect shopper!' : win ? 'Sharp shopping!' : 'Next time!' });
        if (win){ if (api.sfx.cashRegister) api.sfx.cashRegister(); prWinShow(perfect ? 'PRICE MASTER!' : 'SHARP SHOPPER!', right * PR_PTS, fin); return; }   // (run 2 job 9: the money show, in place of the shared Big Win)
        setTimeout(fin, 900);
      };
      // Run 2 job 9: the win show (about 2.8 s, then the results). About 30 gold coins and green cash notes (CSS) are tossed up from the middle and fall
      // across the screen, spinning (transform and opacity only); a big word bounces in and the points count up under it. Lite / reduced motion: the still word.
      const prWinShow = (word, pts, done)=>{
        const host = s.closest('.mg-overlay') || s;
        const fx = document.createElement('div'); fx.className = 'pr-winfx' + (lite ? ' still' : ''); fx.setAttribute('aria-hidden', 'true');
        const box = document.createElement('div'); box.className = 'pr-winbox' + (lite ? ' still' : '');
        box.innerHTML = '<b class="pr-winword">' + word + '</b><span class="pr-winpts">+0</span>';
        // fix pass 3: the coins fall BEHIND the cards (the layer goes in at the back of the overlay), the board dims (opacity), the round pill and the rule
        // line step aside, and the word and the points sit in the band between the title and the question, sized to fit it - never over the cards
        host.appendChild(fx); host.appendChild(box); host.classList.add('pr-celebrating');   // (Part A job 6: the coins fall in FRONT of the cards - the layer sits over the board, with its own dimming wash - and behind only the word and the +N)
        { const sign = host.querySelector('.mg-sign'), askEl = s.querySelector('.pr-ask'), hr = host.getBoundingClientRect();
          if (sign && askEl){ const top = sign.getBoundingClientRect().bottom - hr.top + 4, bot = askEl.getBoundingClientRect().top - hr.top - 4, gap = Math.max(40, bot - top);
            box.style.top = ((top + bot) / 2).toFixed(0) + 'px'; box.style.setProperty('--wf', Math.min(gap * 0.5, 0.115 * hr.width, 80).toFixed(0) + 'px'); box.style.setProperty('--pf', Math.min(gap * 0.36, 0.08 * hr.width, 56).toFixed(0) + 'px'); } }
        const ptsEl = box.querySelector('.pr-winpts');
        if (lite){ ptsEl.textContent = '+' + pts; setTimeout(()=>{ fx.remove(); box.remove(); host.classList.remove('pr-celebrating'); done(); }, 1800); return; }
        const W = host.clientWidth || innerWidth, H = host.clientHeight || innerHeight, N = 30;
        for (let k = 0; k < N; k++){
          const coin = k % 3 !== 2, el = document.createElement('i');
          el.className = coin ? 'pr-coin' : 'pr-note'; if (coin) el.textContent = '$';
          fx.appendChild(el);
          const up = k < 18;   // the first 18 are tossed up from the middle, the rest rain from the top
          const x0 = up ? W * 0.5 + (api.rng() - 0.5) * W * 0.2 : api.rng() * W, y0 = up ? H * 0.55 : -60;
          const xPeak = up ? x0 + (api.rng() - 0.5) * W * 0.9 : x0 + (api.rng() - 0.5) * 60, yPeak = up ? H * (0.08 + api.rng() * 0.3) : H * 0.3;
          const xEnd = xPeak + (api.rng() - 0.5) * 80, yEnd = H + 80, r = (api.rng() - 0.5) * 720, delay = up ? k * 22 : 250 + (k - 18) * 70;
          el.animate([
            { transform:'translate(' + x0 + 'px,' + y0 + 'px) rotate(0deg) scale(0.5)', opacity:1 },
            { transform:'translate(' + xPeak + 'px,' + yPeak + 'px) rotate(' + (r / 2) + 'deg) scale(1)', opacity:1, offset:0.35, easing:'ease-in' },
            { transform:'translate(' + xEnd + 'px,' + yEnd + 'px) rotate(' + r + 'deg) scale(1)', opacity:1 },
          ], { duration:2100 + api.rng() * 400, delay, easing:'ease-out', fill:'both' });
        }
        // the points count up under the word
        const t0 = performance.now() + 450, ms = 1100;
        const step = (t)=>{ if (!box.isConnected) return; const p = Math.max(0, Math.min(1, (t - t0) / ms)); ptsEl.textContent = '+' + Math.round(pts * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
        setTimeout(()=>{ if (box.animate) box.animate([{ opacity:1 }, { opacity:0 }], { duration:250, fill:'forwards' }); }, 2550);
        setTimeout(()=>{ fx.remove(); box.remove(); host.classList.remove('pr-celebrating'); done(); }, 2850);
      };
      if (window.FLIPSTAX_TEST_HOST === true && /[?&](replay|debug)=/.test(location.search)) window.__prEnd = (n)=>{ right = n; end(); };   // (tests only: end the game with n right)
      api.onClose = ()=>{ over = true; };
      setMeter(); show();
    },
  });

  // ---------------------------------------------------------------- E3. Zap Words
  // A 5 x 6 square letter grid: swipe across neighbouring letters (any of the 8 directions) to spell words. Longer words score
  // more. ZAP_SECONDS to play; one free hint (lights the first letter of a hidden word and says how long it is).
  // Every grid has a few good words planted along random paths. The word list is the plain file data/zap-words.txt:
  // real, common English words only (28,455 - Webster's 1934 entries and their plain inflections that macOS's
  // English word embedding and spell checker both know; no proper names, abbreviations or obscure entries; built by
  // tools/build-zap-words.py), loaded when the game starts - no network beyond the game's own files.
  // World: electric yellow on storm grey.
  const ZAP_SECONDS = 36;   // (Run 4A: 20 -> 28 s; A+: 28 -> 36 s, about 30% more)
  const ZAP_POINTS = [0, 0, 0, 2, 4, 7, 10, 14, 18];
  const ZAP_FOUND_COLORS = ['#35e0ff', '#ff4fa3', '#ffe640', '#ff9a2e', '#4bff8a', '#b57bff', '#ff6b6b', '#2ff0c8', '#7aa8ff', '#ffa8e8'];   // (neon: cyan, hot pink, yellow, orange, green, violet, coral, aqua, periwinkle, light pink - then round again; every one is bright enough for dark letters)
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
  // Square grid (A+, Oct 2026): 5 columns x 6 rows of rounded-square tiles; a tile touches the (up to) 8 tiles round it, diagonals included.
  const ZAP_COLS = 5, ZAP_ROWS = 6, ZAP_CELLS = ZAP_COLS * ZAP_ROWS;
  function zapNear(i){
    const r = Math.floor(i / ZAP_COLS), c = i % ZAP_COLS, out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++){
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < ZAP_ROWS && cc >= 0 && cc < ZAP_COLS) out.push(rr * ZAP_COLS + cc);
    }
    return out;
  }
  MG.zapNear = zapNear;
  // Plants words along random 8-direction paths in the 5 x 6 board, then fills the rest with common letters. Every planted word is a dictionary
  // word spelt along a path of touching tiles, so each puzzle always has findable words (MG.zapCheck verifies one).
  function zapGrid(rng){
    const N = ZAP_CELLS, near = zapNear;
    const pick = (a)=> a[Math.floor(rng() * a.length)];
    for (let attempt = 0; attempt < 60; attempt++){
      const g = new Array(N).fill(''), planted = [];
      const wants = [6, 5, 4, 4].map(len=>{ const pool = ZAP_SEED_WORDS.filter(w=> w.length === len || (len === 6 && w.length >= 5)); return pick(pool); });
      let ok = true;
      for (const word of wants){
        let placed = null;
        for (let t = 0; t < 120 && !placed; t++){
          let cur = Math.floor(rng() * N); if (g[cur] && g[cur] !== word[0].toUpperCase()) continue;
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
      for (let j = 0; j < N; j++) if (!g[j]) g[j] = ZAP_LETTERS[Math.floor(rng() * ZAP_LETTERS.length)];
      return { letters: g, planted };
    }
    return null;
  }
  // A puzzle is findable when every planted word is spelt by its path (touching tiles, no tile twice) and is in the dictionary.
  function zapCheck(g, dict){ return g.planted.length >= 3 && g.planted.every(p=> p.path.length === p.word.length && new Set(p.path).size === p.path.length && p.path.every((j, k)=> g.letters[j] === p.word[k].toUpperCase() && (!k || zapNear(p.path[k - 1]).indexOf(j) >= 0)) && dict.has(p.word)); }
  MG.zapCheck = zapCheck;
  MG.zapGrid = zapGrid; MG.ZAP_WORDS = ZAP_SEED_WORDS;
  // makeover job 2: the Zap Words logo, a still inline SVG - chunky glossy letters (a dark 3D extrusion, a bright gradient face, a white gloss
  // on the top half) with an electric zap bolt through them. textLength keeps it inside its box at every width; nothing in it animates.
  const ZAP_LOGO_SVG = (function(){
    const T = (txt, x, y, len, attrs)=> '<text x="' + x + '" y="' + y + '" text-anchor="middle" textLength="' + len + '" lengthAdjust="spacingAndGlyphs" ' + attrs + '>' + txt + '</text>';
    const word = (txt, x, len, face)=>{
      let out = '';
      for (let k = 12; k >= 2; k -= 2) out += T(txt, x, 128 + k, len, 'fill="#3a0c5c" stroke="#3a0c5c" stroke-width="16" stroke-linejoin="round"');   // the extrusion
      out += T(txt, x, 128, len, 'fill="url(#' + face + ')" stroke="#2a0846" stroke-width="12" stroke-linejoin="round" paint-order="stroke fill"');
      out += T(txt, x, 128, len, 'fill="#ffffff" stroke="#ffffff" stroke-width="3" stroke-opacity="0.7" opacity="0.92" clip-path="url(#zlTop)" style="mask:none" fill-opacity="0.38"');   // the gloss
      return out;
    };
    return '<svg class="zl-svg" viewBox="0 0 640 170" preserveAspectRatio="xMidYMid meet" role="img"><defs>' +
      '<linearGradient id="zlA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff36b"/><stop offset="0.5" stop-color="#ffb21e"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient>' +
      '<linearGradient id="zlB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ffcff"/><stop offset="0.5" stop-color="#3ad6ff"/><stop offset="1" stop-color="#ff3fb4"/></linearGradient>' +
      '<linearGradient id="zlZ" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#fffb9a"/><stop offset="1" stop-color="#7df9ff"/></linearGradient>' +
      '<clipPath id="zlTop"><rect x="0" y="0" width="640" height="78"/></clipPath></defs>' +
      // the zap: a big jagged bolt behind the letters (it shows in the gap between the words and past both ends), and a thin white spark line over them
      '<polygon points="0,40 250,70 232,88 420,80 400,100 640,142 372,118 392,100 204,108 222,90" fill="#2a0846" stroke="#2a0846" stroke-width="14" stroke-linejoin="round"/>' +
      '<polygon points="0,40 250,70 232,88 420,80 400,100 640,142 372,118 392,100 204,108 222,90" fill="url(#zlZ)"/>' +
      '<g style="font-family:var(--f-display, Impact, sans-serif); font-weight:900; font-size:132px; letter-spacing:0">' +
        word('ZAP', 136, 226, 'zlA') + word('WORDS', 452, 340, 'zlB') +
      '</g>' +
      '<polyline points="300,79 412,83 394,102 632,138" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>' +   // (run 1 job 14: the spark line only crosses WORDS - nothing ever covers ZAP)
      '<g fill="#fffb9a" stroke="#2a0846" stroke-width="3"><polygon points="606,14 615,34 636,38 617,47 612,68 601,49 582,47 598,36"/><polygon points="18,126 24,139 38,141 26,148 22,162 15,149 3,147 15,140"/></g>' +
    '</svg>';
  })();
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
      // A+ tier 2: a neon ZAP WORD title, rounded-square tiles (5 x 6, 8-direction touching), a lit yellow path, and
      // every word found leaves a trail in its own bright colour
      s.innerHTML = '<div class="zw-title zw-logo" aria-hidden="true">' + ZAP_LOGO_SVG + '</div><div class="zw-word" aria-live="polite">&nbsp;</div><div class="zw-grid sq" role="application" aria-label="Letter grid">' +
        grid.letters.map((ch, i)=> '<div class="zw-cell" data-i="' + i + '"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect class="hx" x="2" y="2" width="96" height="96" rx="22"/><rect class="lk" x="2" y="2" width="96" height="96" rx="22"/><rect class="kp" x="2" y="2" width="96" height="96" rx="22"/></svg><span>' + ch + '</span></div>').join('') + '<svg class="zw-trail" aria-hidden="true"><g class="zw-keeps"></g><polyline class="zw-glow" points=""/><polyline class="zw-line" points=""/></svg></div>' +
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
      const cellAt = (x, y)=>{   // inside the middle 80% of a tile (so a diagonal swipe through the corner gap does not pick a wrong tile)
        for (let i = 0; i < cells.length; i++){ const b = cells[i].getBoundingClientRect(), mx = b.width * 0.1, my = b.height * 0.1; if (x >= b.left + mx && x <= b.right - mx && y >= b.top + my && y <= b.bottom - my) return i; }
        return -1;
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
          used.forEach(i=>{ cells[i].style.setProperty('--kc', col); cells[i].classList.add('kept');
            const sv = cells[i].firstElementChild; if (sv && sv.animate && !api.reduced && !api.lite) sv.animate([{ transform:'scale(1)' }, { transform:'scale(1.16)', offset:0.4 }, { transform:'scale(1)' }], { duration:420, easing:'ease-out' }); });   // (the word's tiles light up in its colour with a short pulse)   // (the word's tiles keep a glowing outline in its colour to the end of the round; the newest word wins)
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
        const fin = ()=> api.finish({ pts, win: pts >= 8, line: pts >= 20 ? 'Zap-tastic vocabulary!' : pts >= 8 ? 'Electric spelling!' : 'The letters zapped back!' });
        // run 2 job 6: over 50 points, a party first - every tile blinks through its own colours (stacked colour layers taking turns, opacity only, at most
        // 2.5 changes a second), confetti, and ZAP-TASTIC! - for about 2 s, then on. Lite and reduced motion: the word, still.
        if (pts > 50){
          const still = api.lite || api.reduced;
          const PAL = [['#ff3fb5', '#27e6ff', '#ffe14a'], ['#4bff8a', '#ff8a1f', '#b57bff'], ['#27e6ff', '#ffe14a', '#ff3fb5'], ['#ff6b6b', '#4bff8a', '#7aa8ff']];
          if (!still) cells.forEach((c, k)=>{ const pal = PAL[k % PAL.length]; c.insertAdjacentHTML('beforeend', '<i class="zw-pc" aria-hidden="true" style="--pd:-' + ((k * 0.37) % 1.2).toFixed(2) + 's">' + pal.map(col=> '<b style="background:' + col + '"></b>').join('') + '</i>'); });
          const w = document.createElement('div'); w.className = 'zw-bigword' + (still ? ' still' : ''); w.textContent = 'ZAP-TASTIC!'; s.appendChild(w);
          // fix pass 3: the word sits in the band between the logo and the letter board (where the word being spelled shows), sized to fit it - never over the letters
          { const logo = s.querySelector('.zw-logo'), gridEl = s.querySelector('.zw-grid'), wordEl = s.querySelector('.zw-word'), sr = s.getBoundingClientRect();
            if (logo && gridEl){ const top = logo.getBoundingClientRect().bottom - sr.top, bot = gridEl.getBoundingClientRect().top - sr.top, gap = Math.max(26, bot - top);
              w.classList.add('band'); w.style.top = ((top + bot) / 2).toFixed(0) + 'px'; w.style.fontSize = Math.min(gap * 1.0, sr.width * 0.12, 64).toFixed(0) + 'px'; if (wordEl) wordEl.style.opacity = '0'; } }
          gEl.classList.add('zw-party'); api.sfx.cheer && api.sfx.cheer();
          if (!still && api.FX && api.FX.confettiBurst){ api.FX.confettiBurst(api.fxLayer); setTimeout(()=>{ if (!s.isConnected) return; api.FX.confettiBurst(api.fxLayer); }, 900); }
          setTimeout(fin, 2100); return;
        }
        setTimeout(fin, 700);
      };
      if (window.FLIPSTAX_TEST_HOST === true && /[?&](replay|debug)=/.test(location.search)) window.__zwEnd = (n)=>{ pts = n; end(); };   // (tests only: end the round with a given score)
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
      const tfDay = api.opts && api.opts.day, S = window.FLIPSTAX_SCHED;
      const pick = (tfDay != null && S) ? Array.from({ length:8 }, (_, k)=>{ const kk = S.pick('twin-flip', TF_POOL.map(p=> p.key), tfDay, k, 8); return TF_POOL.find(p=> p.key === kk); })   // the frozen schedule: 8 faces a day, 9 days to a lap
        : api.shuffle(TF_POOL).slice(0, 8);   // (api.shuffle uses the game's seeded rng)
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
      // Every pair found: a jackpot of about 2 s - a wave of flips ripples over the board (40 ms apart), marquee lights chase round the frame, gold coins and
      // stars rain from the top (at most 30), a UFO crosses with a golden beam sweeping the cards - and then the result. Lite / reduced motion: a gold glow.
      let tm = null;
      const jackpot = (then)=>{
        if (tm) tm.stop();
        api.sfx.cheer && api.sfx.cheer();
        const grid = s.querySelector('.tf-grid');
        const banner = '<b class="tf-perfect">PERFECT!</b>';
        if (api.reduced || api.lite || !s.animate){   // plain: a gold glow and the banner fades in (no motion)
          s.classList.add('tf-gold'); const fb = el('div', 'tf-fx', banner); fb.setAttribute('aria-hidden', 'true'); s.appendChild(fb);
          const pb = fb.firstChild; if (pb.animate && !api.reduced) pb.animate([{ opacity:0 }, { opacity:1 }], { duration:300, fill:'both' }); else pb.style.opacity = 1;
          setTimeout(()=>{ fb.remove(); then(); }, 1600); return; }
        const fx = el('div', 'tf-fx'); fx.setAttribute('aria-hidden', 'true');
        fx.innerHTML = '<i class="tf-marq a"></i><i class="tf-marq b"></i>' + banner; s.appendChild(fx);
        fx.firstChild.nextSibling.nextSibling.animate([{ transform:'translate(-50%,-50%) scale(0.2)', opacity:0 }, { transform:'translate(-50%,-50%) scale(1.25)', opacity:1, offset:0.35 }, { transform:'translate(-50%,-50%) scale(1)', opacity:1 }], { duration:600, easing:'cubic-bezier(.2,.9,.3,1.2)', fill:'both' });
        tiles.forEach((t, i)=>{ if (t.animate) t.animate([{ transform:'rotateY(0deg) scale(1)' }, { transform:'rotateY(180deg) scale(1.12)', offset:0.5 }, { transform:'rotateY(360deg) scale(1)' }], { duration:450, delay:i * 25, easing:'ease-in-out' }); });
        const H = s.clientHeight || 500, W = s.clientWidth || 360;
        for (let k = 0; k < 28; k++){
          const star = k % 3 === 2, c = el('i', 'tf-rain' + (star ? '' : ' coin'), star ? '⭐' : ''); c.style.left = (4 + Math.random() * 90) + '%'; c.style.fontSize = (20 + Math.random() * 12) + 'px'; fx.appendChild(c);
          c.animate([{ transform:'translateY(-40px) rotate(0deg)', opacity:1 }, { transform:'translateY(' + (H + 40) + 'px) rotate(' + (Math.random() < 0.5 ? -1 : 1) * 360 + 'deg)', opacity:1 }], { duration:900 + Math.random() * 500, delay:Math.random() * 500, easing:'cubic-bezier(.4,0,.9,.6)', fill:'both' });
          if (k % 6 === 0) setTimeout(()=> api.sfx.chime(Math.min(8, 3 + (k / 6 | 0))), 150 + k * 40);
        }
        const u = el('div', 'tf-ufo', '<i class="tf-beamsweep"></i>' + (api.FX && api.FX.ufoSvg ? api.FX.ufoSvg() : '🛸')); fx.appendChild(u);
        u.animate([{ transform:'translateX(-110px)' }, { transform:'translateX(' + (W + 110) + 'px)' }], { duration:1500, delay:200, easing:'ease-in-out', fill:'both' });
        setTimeout(()=>{ fx.remove(); then(); }, 2000);
      };
      const end = ()=>{ if (ended) return; ended = true;
        const go = ()=> api.finish({ pts: pairs * 4, win: pairs >= 4, line: pairs === 8 ? 'Total recall! Every twin found!' : pairs >= 4 ? 'Groovy memory!' : 'Those tiles were tricky!' });
        if (pairs === 8) setTimeout(()=> api.bigWin ? api.bigWin('TOTAL RECALL!', go) : jackpot(go), 300); else setTimeout(go, 500); };   // (mega 4: every twin found - the shared BIG WIN CELEBRATION)
      api.onClose = ()=>{ ended = true; };
      busy = true;
      const casc = cascade();
      setTimeout(()=>{ if (ended) return; busy = false; tm = api.timer(TF_MS, end); }, casc);
    },
  });

  // ---------------------------------------------------------------- E5. Fact or Fib
  // The host pops up from the bottom with a statement: TRUE or FIB? About 6 s each, 5 statements, +10 a right answer,
  // +20 more for 5 out of 5; after each answer the host adds a one-line fact or a cheeky reaction. The statements are
  // Checked (Oct 16): window.FACT_OR_FIB_REVIEWED is true in data/fact-or-fib.js, so the game is in the rotation
  // (setting it back to false takes it out; the TEST menu can always play it). World: tangerine and cream.
  const FF_ROUNDS = 5, FF_MS = 6000;
  // The frozen schedule for Fact or Fib (data/schedule.js 'fact-or-fib'): a list of days of five statements - never two on one topic in a day, and
  // 2-3 facts to 2-3 fibs where the bank allows - walked by the day number, wrapping only after every day has been used. A statement added to
  // the bank later is put on the end, five to a new day, in bank order; a removed one is just left out of its day. ffArrange builds the list once
  // (tools: __debug.buildSchedule); nothing computes it at run time.
  function ffArrange(all, order){
    const rest = order.slice(), chunks = [];
    while (rest.length){
      const c = [], ks = new Set(); let tr = 0, fa = 0;
      for (let pass = 0; pass < 2 && c.length < FF_ROUNDS; pass++){
        for (let i = 0; i < rest.length && c.length < FF_ROUNDS;){
          const x = all[rest[i]], k = x.k || x.s;
          if (!ks.has(k) && (pass || (x.t ? tr < 3 : fa < 3))){ c.push(rest[i]); ks.add(k); if (x.t) tr++; else fa++; rest.splice(i, 1); } else i++;
        }
      }
      for (let i = 0; c.length < FF_ROUNDS && i < order.length; i++){ const x = all[order[i]], k = x.k || x.s; if (c.indexOf(order[i]) < 0 && !ks.has(k)){ c.push(order[i]); ks.add(k); } }   // (a short last day is topped up from the start)
      chunks.push(c);
    }
    return chunks.map(c=> c.map(i=> all[i].s));
  }
  function ffChunks(all){
    const frozen = (window.FLIPSTAX_SCHEDULE || {})['fact-or-fib'] || [], byS = new Map(all.map(x=> [x.s, x])), used = new Set();
    const days = frozen.map(d=> d.map(s=>{ used.add(s); return byS.get(s); }).filter(Boolean)).filter(d=> d.length);
    const fresh = all.filter(x=> !used.has(x.s));
    for (let i = 0; i < fresh.length; i += FF_ROUNDS) days.push(fresh.slice(i, i + FF_ROUNDS));
    return days;
  }
  MG.schedBuild = (S)=>{
    const out = {}, tf = TF_POOL.map(p=> p.key); out['twin-flip'] = S.freeze('twin-flip', tf);
    const ps = window.FLIPSTAX_PRICE_SETS || []; out['price-sets'] = S.freeze('price-sets', ps.map(set=> set.map(i=> i[1]).join('|')));
    const all = window.FLIPSTAX_FACT_OR_FIB || [], idx = S.freeze('fact-or-fib', all.map((_, i)=> String(i))).map(Number); out['fact-or-fib'] = ffArrange(all, idx);
    return out;
  };
  MG.register('factOrFib', {
    name: 'Fact or Fib', colors: ['#ffd59a', '#e2731c', '#3a1503'], bulb: '#ffe0a8',
    rule: 'FACT or FIB? Trust your gut!',
    available: ()=> window.FACT_OR_FIB_REVIEWED === true && Array.isArray(window.FLIPSTAX_FACT_OR_FIB) && window.FLIPSTAX_FACT_OR_FIB.length >= 20,
    run(api){
      const all = window.FLIPSTAX_FACT_OR_FIB || [];
      // G5: never two statements on the same topic in one episode (`k` in data/fact-or-fib.js: the two peanut ones,
      // the two tomato ones...).
      const seen = new Set(), take = (list, n)=>{ const out = []; for (const x of list){ if (out.length >= n) break; const k = x.k || x.s; if (seen.has(k)) continue; seen.add(k); out.push(x); } return out; };
      const day = api.opts && api.opts.day;
      let qs;
      if (day != null && all.length >= FF_ROUNDS){   // the no-repeat schedule: the day's five from a fixed arrangement of the whole bank (2-3 facts, never two on one topic)
        const chunks = ffChunks(all); qs = api.shuffle(chunks[day % chunks.length].slice());
      } else {
        const t = take(api.shuffle(all.filter(x=> x.t)), 2 + Math.floor(api.rng() * 2)), f = take(api.shuffle(all.filter(x=> !x.t)), 3);
        qs = api.shuffle(t.concat(f)).slice(0, FF_ROUNDS);
      }
      const s = api.stage; s.classList.add('ff-stage', 'ff-show', 'ff-lie');   // (makeover job 12: ff-show = the game-show look; fix pass 2A: ff-lie = the lie-detector look on top of it, lib/juice.css)
      { const sg = api.overlay.querySelector('.mg-sign span'); if (sg) sg.innerHTML = '<b class="ff-fa">FACT</b> <i>OR</i> <b class="ff-fi">FIB</b>'; }   // (the gold marquee sign: FACT glows green, FIB red)
      s.innerHTML = '<div class="ff-dots">' + qs.map(()=> '<i></i>').join('') + '</div><div class="ff-bubble" aria-live="polite"><span class="ff-text"></span><span class="ff-fact"></span><b class="ff-stamp"></b></div>' +
        '<div class="ff-btns"><button type="button" class="ff-btn yes"><i class="ff-ico" aria-hidden="true">\u2714</i><span>FACT</span></button><button type="button" class="ff-btn no"><i class="ff-ico" aria-hidden="true">\u2716</i><span>FIB</span></button></div>' +
        '<div class="ff-host host-full">' + api.hostSvg() + '</div>';
      // fix pass 2A: the ALIEN LIE DETECTOR - a gauge (green, yellow and red arcs, tick marks, a swinging needle, a moving green wave line) above the
      // terminal screen; the statement types out on the terminal under an INCOMING TRANSMISSION line, with a blinking block cursor
      { const G = (a)=>{ const r = a * Math.PI / 180; return [(100 + Math.sin(r) * 80).toFixed(1), (100 - Math.cos(r) * 80).toFixed(1)]; };
        const arc = (a0, a1, col, cls)=>{ const p0 = G(a0), p1 = G(a1); return '<path class="' + cls + '" d="M' + p0[0] + ' ' + p0[1] + ' A80 80 0 0 1 ' + p1[0] + ' ' + p1[1] + '" stroke="' + col + '"/>'; };
        let ticks = ''; for (let a = -84; a <= 84; a += 12){ const r = a * Math.PI / 180, big = a % 36 === 0; ticks += '<line x1="' + (100 + Math.sin(r) * 66).toFixed(1) + '" y1="' + (100 - Math.cos(r) * 66).toFixed(1) + '" x2="' + (100 + Math.sin(r) * (big ? 54 : 59)).toFixed(1) + '" y2="' + (100 - Math.cos(r) * (big ? 54 : 59)).toFixed(1) + '"/>'; }
        let wave = 'M0 0'; for (let x = 0; x <= 240; x += 6) wave += ' L' + x + ' ' + (Math.sin(x / 9) * 6 + Math.sin(x / 3.7) * 3).toFixed(1);
        s.insertAdjacentHTML('afterbegin', '<div class="ff-sub" aria-hidden="true">ALIEN LIE DETECTOR</div><div class="ff-gauge" aria-hidden="true"><svg viewBox="0 0 200 128">' +
          '<g fill="none" stroke-width="14" stroke-linecap="butt">' + arc(-90, -32, '#2ee57a', 'fg-fact') + arc(-30, 30, '#ffd23f', 'fg-mid') + arc(32, 90, '#ff4060', 'fg-fib') + '</g>' +
          '<g stroke="#bff8ff" stroke-width="2.4" stroke-linecap="round">' + ticks + '</g>' +
          '<text x="44" y="96" class="fg-l">FACT</text><text x="156" y="96" class="fg-l r">FIB</text>' +
          '<clipPath id="ffWaveClip"><rect x="40" y="96" width="120" height="26"/></clipPath><g clip-path="url(#ffWaveClip)"><path class="fg-wave" d="' + wave + '" transform="translate(40 110)"/></g>' +
          '<g class="fg-needle"><path d="M98 100 L100 32 L102 100 Z" fill="#ffffff"/></g><circle cx="100" cy="100" r="8" fill="#ff3c5a" stroke="#ffffff" stroke-width="3"/></svg></div>');
        const bub = s.querySelector('.ff-bubble'); bub.insertAdjacentHTML('afterbegin', '<span class="ff-in" aria-hidden="true">&gt; INCOMING TRANSMISSION...</span>'); bub.querySelector('.ff-text').insertAdjacentHTML('afterend', '<i class="ff-cur" aria-hidden="true"></i>');
        const dots = s.querySelector('.ff-dots'); dots.insertAdjacentHTML('beforeend', '<b class="ff-gut">TRUST YOUR GUT</b>');
        s.insertAdjacentHTML('beforeend', '<i class="ff-static" aria-hidden="true"></i>'); }
      const needle = s.querySelector('.fg-needle'), gauge = s.querySelector('.ff-gauge'), staticEl = s.querySelector('.ff-static');
      const swing = (deg)=>{ gauge.classList.remove('idle'); needle.style.transform = 'rotate(' + deg + 'deg)'; };
      let typeT = 0;
      const typeOut = (full)=>{ clearInterval(typeT); if (api.reduced || api.lite){ text.textContent = full; return; }
        const step = Math.max(1, Math.ceil(full.length / 45)); let n = 0; text.textContent = '';   // (about 0.7 s for any statement: the 6 s answer clock keeps running)
        typeT = setInterval(()=>{ n = Math.min(full.length, n + step); text.textContent = full.slice(0, n); if (n >= full.length) clearInterval(typeT); }, 16); };
      const bubble = s.querySelector('.ff-bubble'), text = s.querySelector('.ff-text'), fact = s.querySelector('.ff-fact'), stamp = s.querySelector('.ff-stamp'), host = s.querySelector('.ff-host'), btns = [...s.querySelectorAll('.ff-btn')], dots = [...s.querySelectorAll('.ff-dots i')];
      // auto-fit: the statement and the fact shrink (down to 14 px) until they fit in at most three lines - never overflow the box
      const fit = (el, maxPx)=>{ if (!el) return; let px = maxPx; el.style.fontSize = px + 'px';
        const lines = ()=>{ const lh = parseFloat(getComputedStyle(el).lineHeight) || px * 1.2; return Math.round(el.scrollHeight / lh); };
        while (px > 14 && (lines() > 3 || el.scrollWidth > el.clientWidth + 1)){ px -= 1; el.style.fontSize = px + 'px'; } };
      const fitAll = ()=>{ const base = parseFloat(getComputedStyle(bubble).fontSize) || 26; fit(text, base); if (fact.textContent) fit(fact, Math.min(base * 0.8, 22));
        // then shrink both a pixel at a time until the whole bubble (statement + reveal line) fits its box - on a short phone the box is small and clips (overflow hidden)
        for (let g = 0; g < 40 && bubble.scrollHeight > bubble.clientHeight + 1; g++){
          const tp = parseFloat(getComputedStyle(text).fontSize), fp = fact.textContent ? parseFloat(getComputedStyle(fact).fontSize) : 0;
          if (tp <= 13 && (!fp || fp <= 12)) break;
          if (tp > 13) text.style.fontSize = (tp - 1) + 'px'; if (fp > 12) fact.style.fontSize = (fp - 1) + 'px'; } };
      // (test hook, TEST menu / ?debug only: show any statement - and its reveal line - in the bubble, fitted exactly as in play; tools/fact-or-fib-check.py)
      if (window.FLIPSTAX_TEST_HOST === true && /[?&](replay|debug)/.test(location.search)) window.__ffShow = (q, reveal)=>{ text.textContent = q.s; fact.textContent = ''; text.style.fontSize = ''; fact.style.fontSize = ''; bubble.classList.remove('said'); fitAll();
        if (reveal){ fact.textContent = q.r; bubble.classList.add('said'); fitAll(); } return { text, fact, bubble }; };
      let i = 0, right = 0, locked = true, timer = null, ended = false;
      const ask = ()=>{
        const q = qs[i]; text.textContent = q.s; fact.textContent = ''; text.style.fontSize = ''; fact.style.fontSize = ''; requestAnimationFrame(()=>{ fitAll(); typeOut(q.s); });
        gauge.classList.remove('lit-fact', 'lit-fib', 'lit-ok', 'lit-done'); needle.style.transform = ''; gauge.classList.add('idle'); stamp.className = 'ff-stamp'; stamp.textContent = ''; bubble.classList.remove('said');
        host.classList.remove('up'); void host.offsetWidth; host.classList.add('up');   // he pops up from the bottom
        if (!api.reduced) bubble.animate([{ transform:'scale(0.6)', opacity:0 }, { transform:'scale(1)', opacity:1 }], { duration:300, easing:'cubic-bezier(.2,1.5,.4,1)' });
        api.sfx.hostVoice(q.s); locked = false; btns.forEach(b=>{ b.disabled = false; b.classList.remove('glow', 'dim'); });
        timer = api.timer(FF_MS, ()=> answer(null));
      };
      const answer = (yes)=>{
        if (locked || ended) return; locked = true; btns.forEach(b=> b.disabled = true); if (timer) timer.stop();
        const q = qs[i], ok = yes !== null && yes === q.t;
        clearInterval(typeT); text.textContent = q.s;
        // the gauge: a right answer lights the arc green and swings the needle to the matching side (FACT left, FIB right); a wrong one gives a short static
        // flicker and swings the needle to the other side
        gauge.classList.add('lit-done', q.t ? 'lit-fact' : 'lit-fib');   // (Part A job 8: the true side's arc brightens in its own colour - FACT green, FIB red - and the yellow middle fades out)
        if (ok){ swing(q.t ? -62 : 62); gauge.classList.add('lit-ok'); }
        else { swing(q.t ? 62 : -62); if (!api.reduced && !api.lite && staticEl.animate) staticEl.animate([{ opacity:0 }, { opacity:0.8, offset:0.15 }, { opacity:0.15, offset:0.4 }, { opacity:0.7, offset:0.6 }, { opacity:0 }], { duration:650, easing:'linear' }); }
        stamp.textContent = q.t ? 'FACT!' : 'FIB!';
        btns[q.t ? 0 : 1].classList.add('glow'); btns[q.t ? 1 : 0].classList.add('dim');   // the reveal: the correct chip glows, the other dims (held for the shared reveal time) stamp.className = 'ff-stamp on ' + (q.t ? 'true' : 'fib');
        dots[i].classList.add(ok ? 'right' : 'wrong');
        // makeover job 12: the result - the stamp slams onto the screen, the right button bounces with a ring; a right answer bursts stars from it,
        // a wrong pick shakes (transform and opacity only; lite and reduced motion: no motion, the colours and the stamp only)
        if (!api.reduced && !api.lite && Element.prototype.animate){
          const rb = btns[q.t ? 0 : 1], picked = yes === null ? null : btns[yes ? 0 : 1];
          stamp.animate([{ transform:'rotate(8deg) scale(2.6)', opacity:0 }, { transform:'rotate(8deg) scale(0.9)', opacity:1, offset:0.7 }, { transform:'rotate(8deg) scale(1)', opacity:1 }], { duration:380, easing:'cubic-bezier(.3,1.2,.5,1)' });
          rb.animate([{ transform:'scale(1)' }, { transform:'scale(1.12)', offset:0.35 }, { transform:'scale(0.97)', offset:0.7 }, { transform:'scale(1)' }], { duration:520, easing:'ease-out' });
          const ring = document.createElement('i'); ring.className = 'ff-ring'; rb.appendChild(ring);
          ring.animate([{ transform:'scale(0.8)', opacity:0.9 }, { transform:'scale(1.6)', opacity:0 }], { duration:650, easing:'ease-out' }).onfinish = ()=> ring.remove();
          if (ok){ for (let k = 0; k < 12; k++){ const st = document.createElement('i'); st.className = 'ff-star'; rb.appendChild(st); const a = (k / 12) * Math.PI * 2, d = 70 + Math.random() * 60;
            st.animate([{ transform:'translate(-50%,-50%) scale(0.3) rotate(0deg)', opacity:1 }, { transform:'translate(calc(-50% + ' + (Math.cos(a) * d).toFixed(0) + 'px), calc(-50% + ' + (Math.sin(a) * d).toFixed(0) + 'px)) scale(1) rotate(160deg)', opacity:0 }], { duration:800, easing:'cubic-bezier(.2,.7,.3,1)' }).onfinish = ()=> st.remove(); } }
          else if (picked) picked.animate([{ transform:'translateX(0)' }, { transform:'translateX(-10px)' }, { transform:'translateX(10px)' }, { transform:'translateX(-6px)' }, { transform:'translateX(0)' }], { duration:360 });
        }
        if (ok){ right++; api.score(right * 10); api.sfx.ding(); api.flash('win'); api.mood('cheer'); if (api.smallWin) api.smallWin(btns[q.t ? 0 : 1]); }
        else { api.sfx.strike(); api.flash('lose'); api.mood('sad'); }
        setTimeout(()=>{ if (ended) return; fact.textContent = q.r; bubble.classList.add('said'); fitAll(); api.sfx.hostVoice(q.r); }, 650);   // (the statement stays, the fact goes under it)
        api.hold(()=>{
          if (ended) return; i++;
          if (i >= qs.length){ const pts = right * 10 + (right === qs.length ? 20 : 0);
            const fin = ()=> api.finish({ pts, win: right >= 3, line: right === qs.length ? 'Five for five! +20 bonus!' : right >= 3 ? 'You know your facts!' : 'Fooled you, Earthling!' });
            if (right === qs.length && api.bigWin){ ended = true; s.classList.add('ff-cleared'); api.bigWin('FIVE FOR FIVE!', ()=>{ ended = false; fin(); }, { wordTop:'34%' }); return; }   // (fix pass 2A: the terminal clears first, so the word never sits over the question)   // (mega 4: the shared BIG WIN CELEBRATION)
            fin(); return; }
          ask();
        }, { lead:650, min:1950, text: q.s + ' ' + q.r });   // (the fact lands at 0.65 s; the hold is PACE x 1.95 s or the statement and fact's reading time)
      };
      btns[0].addEventListener('click', ()=>{ api.sfx.tap('top'); answer(true); });
      btns[1].addEventListener('click', ()=>{ api.sfx.tap('bottom'); answer(false); });
      api.onClose = ()=>{ ended = true; clearInterval(typeT); };
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
  // makeover job 15: 3 saucers every round (was 3, 4 and 5), with a slightly faster and harder shuffle to make up for it - more swaps, each a little
  // quicker, and crossovers (the two outer saucers trading places over the middle one) from round 1. Was 4 / 7 / 10 swaps at 520 / 400 / 300 ms, 0 / 0 / 3 crossovers.
  const SU_ROUNDS = [{ n:3, swaps:6, ms:460, cross:1 }, { n:3, swaps:9, ms:360, cross:2 }, { n:3, swaps:12, ms:280, cross:4 }];
  const SU_LIGHT_COLORS = ['#ff4d6d', '#ffd23f', '#3de07a', '#39a7ff', '#c77dff'];
  const SU_LIGHTS = 14, SU_LIGHT_MS = 380;   // (one change per light per 380 ms = 2.6 a second at most)
  // the saucer is the chrome sprite (data/saucer/saucer-chrome.webp, 300 x 173, its own ring of coloured lights); the star is the plasma orb (data/saucer/orb-plasma.webp)
  const suSaucerSvg = ()=> '<img class="su-img" src="data/saucer/saucer-chrome.webp" alt="" draggable="false" decoding="async"><i class="su-shadow" aria-hidden="true"></i><i class="su-refl" aria-hidden="true"></i>';
  MG.register('saucerShuffle', {
    name: 'Saucer Shuffle', colors: ['#d9c2ff', '#6b2d8a', '#1a0826'], bulb: '#e9e4ff',
    rule: 'Watch the saucer with the star!', host: '',
    available: ()=> true,
    run(api){
      const s = api.stage; s.classList.add('sc-stage');
      s.innerHTML = '<div class="sc-casino"><i class="sc-curtain l"></i><i class="sc-curtain r"></i><i class="sc-spot a"></i><i class="sc-spot b"></i>' +
        (window.NeonLogo && NeonLogo.has('saucerShuffle') ? '<div class="sc-sign nx-sign neon">' + NeonLogo.html('saucerShuffle') + '<small class="sc-round">ROUND 1 OF 3</small></div>' : '<div class="sc-sign"><b>SAUCER SHUFFLE</b><small class="sc-round">ROUND 1 OF 3</small></div>') +   // (run 2 job 2: the neon sign)
        '<div class="sc-table"><i class="sc-cone a"></i><i class="sc-cone b"></i><i class="sc-cone c"></i><div class="sc-play"><div class="su-star" aria-hidden="true"><img src="data/saucer/orb-plasma.webp" alt="" draggable="false"></div></div></div>' +
        '<div class="sc-panel"><span class="sc-msg">Watch the saucer with the star!</span></div>' +
        '<i class="sc-blaze wall" aria-hidden="true"></i><i class="sc-blaze floor" aria-hidden="true"></i><i class="sc-blaze sweep" aria-hidden="true"></i><i class="sc-dimmer" aria-hidden="true"></i></div>';
      const play = s.querySelector('.sc-play'), star = s.querySelector('.su-star'), roundEl = s.querySelector('.sc-round'), msg = s.querySelector('.sc-msg');
      const say = (t)=>{ msg.textContent = t; };
      let saucers = [], lights = [], pos = [], N = 3;      // pos[saucer] = its slot - the truth
      let starAt = 0, round = 0, phase = 'show', right = 0, ended = false, timer = null, lightT = 0, lightTick = 0, shuffling = false;
      const W = ()=> play.clientWidth, H = ()=> play.clientHeight;
      // every round the saucers are about 31% of the table width: 3 in one row, 4 in a 2 x 2 grid, 5 as 3 on top and 2 below (centred between them);
      // the whole group is centred on the felt. slotXY(slot) is the centre of a slot; positions are transforms only.
      // A+ stage look: the saucers stand on the stage floor in two rows, about 55% and 75% of the way down the screen. 3 stand as a triangle and 4 as a 2 x 2,
      // about 40 percent bigger than before (their rims just overlap); 5 stand as 3 over 2, as big as the width allows. (Sizes only: the shuffle is unchanged.)
      // (fix 4: about 40 percent smaller - 3 stand in one row, 4 as a 2 x 2 and 5 as 3 over 2, always with clear gaps; the step keeps at least 12% of a saucer between them)
      // (run 1 job 13: 3 saucers are about 40% larger - 0.39 of the width, was 0.28 - and stand higher, as a triangle: one centre-back, two in front, so
      // they never overlap at phone widths)
      const SWFN = { 3:0.39, 4:0.3, 5:0.25 }, SWH = { 3:0.25, 4:0.17, 5:0.15 };
      const sw = ()=> Math.min(W() * (SWFN[N] || 0.25), innerHeight * (SWH[N] || 0.15)), shh = ()=> sw() * 173 / 300;
      const rowY = (f)=> innerHeight * f - play.getBoundingClientRect().top;
      const slotXY = (slot)=>{
        const w = W(), cx = w / 2, s = sw(), top = rowY(0.58), low = rowY(0.725);
        const step = N === 3 ? Math.min(s * 1.25, (w - s - 16) / 2) : N === 5 ? Math.min(s * 1.18, (w - s - 16) / 2) : Math.min(s * 1.3, w - s - 16), mid = (top + low) / 2;
        if (N === 3){ const t3 = rowY(0.49), l3 = rowY(0.62), st3 = Math.min(s * 1.18, w - s - 16); return slot === 1 ? [cx, t3] : [cx + (slot === 0 ? -0.5 : 0.5) * st3, l3]; }
        if (N === 4) return [cx + ((slot % 2) - 0.5) * step, slot < 2 ? top : low];
        return slot < 3 ? [cx + (slot - 1) * step, top] : [cx + ((slot - 3) - 0.5) * step, low];
      };
      const tableY = ()=> H() * 0.5;
      const tf = (xy, h)=> 'translate(' + (xy[0] - sw() / 2).toFixed(1) + 'px,' + (xy[1] - h / 2).toFixed(1) + 'px)';
      const place = (k)=>{ saucers[k].style.transform = tf(slotXY(pos[k]), saucers[k].offsetHeight || shh()); };
      const layout = ()=>{ saucers.forEach((sv, k)=>{ sv.style.width = sw().toFixed(0) + 'px'; sv.style.top = '0px'; place(k); }); };
      // the star sits directly under a saucer, centred on it (from the saucer's resting slot)
      const starUnder = (k)=>{ const xy = slotXY(pos[k]), d = Math.max(34, sw() * 0.44); star.style.width = d.toFixed(0) + 'px'; star.style.marginLeft = (-d / 2).toFixed(0) + 'px'; star.style.left = xy[0].toFixed(1) + 'px'; star.style.top = (xy[1] + shh() * 0.5 - d * 0.72).toFixed(1) + 'px'; };
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
      const lift = (k, up, ms)=> new Promise(res=>{ const base = saucers[k].style.transform, L = ' translateY(' + (-Math.round(shh() * 0.62)) + 'px)'; if (api.reduced){ saucers[k].classList.toggle('up', up); return res(); }
        saucers[k].animate([{ transform: base + (up ? '' : L) }, { transform: base + (up ? L : '') }], { duration: ms || 320, easing:'cubic-bezier(.3,1.3,.5,1)', fill:'forwards' }).onfinish = res; });
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
        say(['Eyes on the star!', 'Faster now!', 'Top speed! Hold on to your antennae!'][round]);
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
        if (hit){ right++; api.score(right * 10); say('You got it! +10'); stageFx('blaze'); if (api.smallWin) api.smallWin(saucers[k]); await lift(k, true); api.sfx.ding(); api.flash('win'); api.mood('cheer'); }
        else { say(k < 0 ? 'Too slow! It was this one.' : 'Ooh, it was this one!'); stageFx('dim'); await Promise.all(saucers.map((_, j)=> lift(j, true))); api.sfx.chime(2); api.mood('sad'); }
        await new Promise(r=> api.hold(r)); star.classList.remove('on'); round++;   // (A+: the shared reveal hold)
        if (round >= SU_ROUNDS.length || ended){ const fin = ()=> api.finish({ pts: right * 10, win: right >= 2, line: right === 3 ? 'Sharpest eyes in the galaxy!' : right >= 2 ? 'Nice tracking!' : 'Those saucers were sneaky!' });
          if (right >= 2 && !ended){ suWinShow(right === 3, fin); return; }   // (run 2 job 13: the saucers' send-off, in place of the shared Big Win)
          fin(); return; }
        playRound();
      }
      // fix 4: a right pick makes the whole stage blaze - the wall panels and the floor lights chase across (opacity and transform only, under 3 flashes a second),
      // confetti falls, then it settles; a wrong pick dims the stage for a moment. Lite mode and reduced motion: a plain fade.
      const casino = s.querySelector('.sc-casino');
      // fix 6 item 1: the stage itself lights up. A lit copy of the stage art (data/scenes/saucer-shuffle-stage-lit.webp, made by tools/make-stage-lit.py) sits
      // exactly over the normal one and cross-fades in a chase - lit, normal, lit, normal, lit, a beat lit, then back (opacity only, under 2 flashes a second);
      // small bulbs on the front rail chase along it. The layers belong to the overlay (the same box as its background) and leave with the game.
      const ov = api.overlay;
      ov.querySelectorAll('.sc-litbg, .sc-rail').forEach(n=> n.remove());
      const litBg = document.createElement('i'); litBg.className = 'sc-litbg'; litBg.setAttribute('aria-hidden', 'true'); ov.insertBefore(litBg, ov.firstChild);
      const rail = document.createElement('div'); rail.className = 'sc-rail'; rail.setAttribute('aria-hidden', 'true'); ov.insertBefore(rail, litBg.nextSibling);
      const SU_IMG = { w:1080, h:1756, railY:0.802 };   // (the stage art's size and its front rail of bulbs, as a share of its height)
      const placeRail = ()=>{
        const Wo = ov.clientWidth, Ho = ov.clientHeight; if (!Wo || !Ho) return;
        const k = Math.max(Wo / SU_IMG.w, Ho / SU_IMG.h), left = (Wo - SU_IMG.w * k) / 2, top = Ho - SU_IMG.h * k;   // (background cover, anchored 50% 100%)
        const n = Math.max(12, Math.min(40, Math.round(Wo / 22)));
        if (rail.children.length !== n) rail.innerHTML = Array.from({ length:n }, (_, i)=> '<i style="--i:' + i + '"></i>').join('');
        rail.style.top = Math.round(top + SU_IMG.railY * SU_IMG.h * k) + 'px'; rail.style.left = Math.max(0, Math.round(left)) + 'px'; rail.style.right = Math.max(0, Math.round(left)) + 'px';
      };
      // run 2 job 13: the backdrop's windows and light panels glow in turn - a soft light over each panel of the stage art fades up and down, the left and right
      // walls together, top to bottom, then the centre (opacity only; each panel once every 4.2 s). Lite mode and reduced motion: a steady soft glow.
      const SU_PANELS = [ [90,210,245,360,'#ff8ad0'], [258,250,352,370,'#ffd23f'],   // (the little windows at the top, left side; x0, y0, x1, y1 on the 1080 x 1756 art)
        [105,440,245,600,'#ff4fb4'], [258,440,350,600,'#ffb02e'], [105,615,245,735,'#3fd8ff'], [258,615,350,735,'#ff4fb4'], [110,740,245,830,'#ffb02e'], [258,745,350,830,'#ff4fb4'],
        [115,838,245,905,'#3fd8ff'], [258,850,350,915,'#4be683'], [105,915,245,1010,'#ff4fb4'], [258,930,350,1010,'#ffb02e'] ];
      const SU_CENTRE = [ [395,430,690,610,'#ff4fb4'], [395,615,690,745,'#3fd8ff'], [395,745,690,905,'#ffd23f'], [395,905,690,1010,'#c04cff'] ];
      const panelsEl = document.createElement('div'); panelsEl.className = 'su-panels'; panelsEl.setAttribute('aria-hidden', 'true'); ov.insertBefore(panelsEl, rail);
      // (each wall panel with its mirror on the other wall at the same moment, then the centre's four rows)
      { let h = ''; const STEP = 0.35, order = []; SU_PANELS.forEach((r, n)=>{ order.push([r, n]); order.push([[1080 - r[2], r[1], 1080 - r[0], r[3], r[4]], n]); }); SU_CENTRE.forEach((r, n)=> order.push([r, SU_PANELS.length * 0.5 + n]));
        order.forEach(([r, step])=>{ h += '<i style="--c:' + r[4] + ';--d:-' + (4.2 - (step * STEP) % 4.2).toFixed(2) + 's" data-r="' + r.slice(0, 4).join(',') + '"></i>'; });
        panelsEl.innerHTML = h; }
      const placePanels = ()=>{
        const Wo = ov.clientWidth, Ho = ov.clientHeight; if (!Wo || !Ho) return;
        const k = Math.max(Wo / SU_IMG.w, Ho / SU_IMG.h), left = (Wo - SU_IMG.w * k) / 2, top = Ho - SU_IMG.h * k;
        [...panelsEl.children].forEach(el=>{ const r = el.dataset.r.split(',').map(Number); el.style.left = (left + r[0] * k).toFixed(1) + 'px'; el.style.top = (top + r[1] * k).toFixed(1) + 'px'; el.style.width = ((r[2] - r[0]) * k).toFixed(1) + 'px'; el.style.height = ((r[3] - r[1]) * k).toFixed(1) + 'px'; });
      };
      placeRail(); placePanels(); const onRs = ()=>{ placeRail(); placePanels(); }; window.addEventListener('resize', onRs);
      // run 2 job 13: a win (2 or 3 found) - each saucer in turn rises, fires its beam down and flies off the top, then star dust falls; about 3 s, then
      // the results (PERFECT SHUFFLE! shows for all three). Lite mode and reduced motion: the beams shine, still, under the saucers (1.8 s).
      const suWinShow = (perfect, done)=>{
        phase = 'show'; const still = api.lite || api.reduced;
        if (perfect){ const w = document.createElement('div'); w.className = 'su-winword' + (still ? ' still' : ''); w.textContent = 'PERFECT SHUFFLE!'; casino.appendChild(w); }
        saucers.forEach((sv, n)=>{
          sv.getAnimations().forEach(a=>{ try{ a.cancel(); }catch(e){} }); place(n);
          const beam = document.createElement('i'); beam.className = 'su-wbeam' + (still ? ' still' : ''); sv.appendChild(beam);
          if (still) return;
          const base = sv.style.transform, up = ' translateY(' + (-Math.round(shh() * 0.7)) + 'px)', d = n * 280, dir = n === 1 ? 0 : n === 0 ? -1 : 1;
          sv.animate([{ transform:base }, { transform:base + up, offset:0.3 }, { transform:base + up, offset:0.55 },
            { transform:base + ' translate(' + (dir * 60) + 'px,' + (-(innerHeight)) + 'px) scale(0.35)' }], { duration:1700, delay:d, easing:'ease-in-out', fill:'forwards' });
          beam.animate([{ opacity:0, transform:'scaleY(0.2)' }, { opacity:1, transform:'scaleY(1)', offset:0.4 }, { opacity:1, transform:'scaleY(1)', offset:0.75 }, { opacity:0, transform:'scaleY(1)' }], { duration:900, delay:d + 380, fill:'both' });
        });
        if (api.sfx.ufoBeam) api.sfx.ufoBeam();
        if (!still) setTimeout(()=>{ if (ended) return;
          const dust = document.createElement('div'); dust.className = 'su-dust'; dust.setAttribute('aria-hidden', 'true'); casino.appendChild(dust);
          const Wc = casino.clientWidth, Hc = casino.clientHeight, cols = ['#ffffff', '#ffe27a', '#7ff3ff', '#ff8ad0', '#c8a8ff'];
          for (let k = 0; k < 44; k++){ const p = document.createElement('i'); p.className = k % 3 ? 'dot' : 'star'; p.style.color = cols[k % cols.length]; p.style.left = (Math.random() * 100) + '%'; dust.appendChild(p);
            p.animate([{ transform:'translateY(-20px) rotate(0deg)', opacity:0 }, { transform:'translateY(' + (Hc * 0.2) + 'px) rotate(90deg)', opacity:1, offset:0.2 }, { transform:'translateY(' + (Hc * (0.7 + Math.random() * 0.3)) + 'px) rotate(260deg)', opacity:0 }],
              { duration:1100 + Math.random() * 500, delay:Math.random() * 350, easing:'ease-in', fill:'both' }); }
        }, 1500);
        setTimeout(()=>{ casino.querySelectorAll('.su-winword, .su-dust').forEach(n=> n.remove()); done(); }, still ? 1800 : 3100);
      };
      let fxT = 0;
      const stageFx = (kind)=>{
        clearTimeout(fxT); casino.classList.remove('blaze', 'dim'); ov.classList.remove('su-lit'); void casino.offsetWidth; casino.classList.add(kind);
        if (kind === 'blaze'){ placeRail(); ov.classList.add('su-lit'); }
        if (kind === 'blaze' && !api.lite && !api.reduced && api.FX && api.FX.confettiBurst){ try{ api.FX.confettiBurst(api.fxLayer); }catch(e){} }
        fxT = setTimeout(()=>{ casino.classList.remove(kind); ov.classList.remove('su-lit'); }, kind === 'blaze' ? 3300 : 1100);
      };
      api.onClose = ()=>{ ended = true; clearInterval(lightT); clearTimeout(fxT); window.removeEventListener('resize', onRs); ov.classList.remove('su-lit'); litBg.remove(); rail.remove(); panelsEl.remove(); };
      if (window.FLIPSTAX_TEST_HOST === true && /[?&](replay|debug)=/.test(location.search)) window.__suStar = ()=> starAt;   // (tests only: which saucer has the star)
      requestAnimationFrame(()=>{ build(SU_ROUNDS[0].n); playRound(); });
    },
  });
})();
