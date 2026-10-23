// FlipStax touch-episode probe (J2). Injected into a REAL-SPEED Daily episode (?debug=1 on localhost, so the show
// director is on window.__show) by tools/touch-episode.py - or any driver that can run a script in the page and read
// window.__tt.report afterwards (e.g. the CDP setup in tools/frametime.ps1).
//
// It plays like a fast, slightly sloppy phone player. Every tap is a real-phone sequence: touchstart + pointerdown,
// ~80 ms later touchend + pointerup, then ~300 ms later a click on WHATEVER IS UNDER THE FINGER AT THAT MOMENT (the
// way a phone's synthesized click works). During every cinematic (cold open, act cards, the Mystery reveal, the
// Cosmic intro, cue cards) it keeps tapping every 150-400 ms where the VS cards sit, to catch taps that leak through.
//
// The report checks: the scenes come in the rundown's exact order with every VS block's count; no cinematic ends
// sooner than its minimum (act card ACT_CARD_HOLD, Mystery reveal MYSTERY_REVEAL_HOLD, any skippable one
// CINEMATIC_MIN); no VS card is voted within 250 ms of appearing (a tap meant for the screen before it); no two
// advances within 400 ms; and how long the episode took.
(function(){
  if (window.__tt) return;
  const TT = window.__tt = { report: null, taps: 0, ghost: 0, log: [] };
  const opts = window.__ttOpts || {};
  const rnd = (a, b)=> a + Math.random() * (b - a);
  const vis = el=> el && el.isConnected && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none';
  const fire = (el, type, x, y, Ctor)=>{
    if (!el) return;
    let ev;
    try{ ev = new (Ctor || Event)(type, { bubbles:true, cancelable:true, clientX:x, clientY:y, pointerId:9, pointerType:'touch', isPrimary:true, view:window }); }
    catch(e){ ev = new Event(type, { bubbles:true, cancelable:true }); }
    el.dispatchEvent(ev);
  };
  // One phone tap at (x, y).
  function tap(x, y, why){
    TT.taps++;
    const t0 = performance.now(), down = document.elementFromPoint(x, y);
    fire(down, 'touchstart', x, y); fire(down, 'pointerdown', x, y, window.PointerEvent);
    setTimeout(()=>{
      fire(down, 'touchend', x, y); fire(down, 'pointerup', x, y, window.PointerEvent);
      setTimeout(()=>{
        const now = document.elementFromPoint(x, y);   // the synthesized click goes to what is there NOW
        if (now !== down) TT.ghost++;
        fire(now, 'click', x, y, window.MouseEvent);
      }, opts.clickDelay != null ? opts.clickDelay : 300);
    }, 80);
    TT.log.push(Math.round(t0) + ' tap ' + why);
  }
  const center = el=>{ const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const tapEl = (el, why)=>{ const [x, y] = center(el); tap(x, y, why); };
  // The player.
  let next = performance.now() + 800, lastGen = -1, sceneAt = 0;
  function step(){
    if (TT.report) return;
    const S = window.__show, now = performance.now();
    const ro = document.getElementById('readoutOverlay');
    if (ro && ro.classList.contains('show')){ finish(); return; }
    if (S && S.gen !== lastGen){ lastGen = S.gen; sceneAt = now; next = now + (S.scene === 'vs' && opts.vsMin ? rnd(opts.vsMin, opts.vsMax) : opts.cine === false ? rnd(opts.firstMin || 1500, opts.firstMax || 3500) : rnd(150, 400)); }   // (opts.vsMin: how long a player takes on a VS card)
    if (now >= next){
      const sc = document.getElementById('showCard'), ev = document.getElementById('eventOverlay'), mg = document.getElementById('mgOverlay');
      const lucky = document.getElementById('luckyOverlay'), solve = document.getElementById('solveOverlay'), fin = document.getElementById('finOverlay'), guess = document.getElementById('guessOverlay');
      const A = document.getElementById('halfA'), B = document.getElementById('halfB');
      if (sc && vis(sc)){   // a cinematic: keep tapping where the cards are (and the skip tap on it) - unless opts.cine is false (a patient player)
        if (opts.cine !== false) tapEl(Math.random() < 0.5 ? A : B, 'cinematic ' + sc.className.replace('show-card', '').trim());
        else if (sc.classList.contains('ex-wait')) tapEl(sc.querySelector('.ex-go') || sc, 'explainer got it');   // (a card that waits for a tap)
        next = now + rnd(150, 400);
      } else if (fin && vis(fin)){
        const all = document.getElementById('plinkoAll'), go = document.getElementById('plinkoDrop');
        if (go && vis(go)) tapEl(go, 'results'); else if (all && vis(all)) tapEl(all, 'auto-drop');
        next = now + rnd(800, 1500);
      } else if (solve && vis(solve)){
        const tiles = [...solve.querySelectorAll('#solveRack .solve-tile:not(.used), .solve-key')].filter(vis);
        if (tiles.length && Math.random() < 0.7) tapEl(tiles[Math.floor(Math.random() * tiles.length)], 'letter');
        else { const sub = document.getElementById('solveSubmit'); if (sub) tapEl(sub, 'submit'); }
        next = now + rnd(opts.wwMin || 500, opts.wwMax || 1400);
      } else if (lucky && vis(lucky)){
        const b = [...lucky.querySelectorAll('.ll-btn')].filter(vis)[0]; if (b) tapEl(b, 'lucky ' + b.textContent);
        next = now + rnd(opts.luckyMin || 1200, opts.luckyMax || 2500);
      } else if (guess && vis(guess)){
        const b = guess.querySelector('.guess-lock'); if (b && vis(b)) tapEl(b, 'crowd scan lock'); else tapEl(guess, 'crowd scan');
        next = now + rnd(1500, 2500);
      } else if (mg){
        const b = [...mg.querySelectorAll('button')].filter(x=> vis(x) && !x.disabled);
        if (b.length) tapEl(b[Math.floor(Math.random() * b.length)], 'mini game');
        next = now + rnd(opts.mgMin || 500, opts.mgMax || 1500);
      } else if (ev && vis(ev)){
        const t = [...ev.querySelectorAll('.event-tile')].filter(vis);
        if (t.length) tapEl(t[Math.floor(Math.random() * t.length)], 'answer');
        next = now + rnd(opts.ansMin || 700, opts.ansMax || 2200);
      } else {
        tapEl(Math.random() < 0.5 ? A : B, 'vs');
        next = now + rnd(opts.vsMin || 400, opts.vsMax || 2500);
      }
    }
    setTimeout(step, 30);
  }
  function finish(){
    const S = window.__show, T = window.__timing || {}, plan = (window.__showPlan && window.__showPlan()) || [];
    const enters = S.log.filter(e=> e.kind === 'enter');
    const scenes = enters.map((e, i)=> ({ scene: e.scene, info: e.detail, t: e.t, ms: (enters[i + 1] ? enters[i + 1].t : e.t) - e.t }));
    // the expected order from the rundown
    const want = [];
    plan.forEach(st=>{
      if (st.t === 'vs') for (let k = 0; k < st.n; k++) want.push('vs');
      else if (st.t === 'act') want.push('act');
      else if (st.t === 'quiz') want.push('quiz');
      else if (st.t === 'mystery' || st.t === 'break') want.push('mystery');
      else if (st.t === 'portal') want.push('portal');
      else if (st.t === 'lucky') want.push('lucky');
      else if (st.t === 'game') want.push('game');
      else if (st.t === 'reward') want.push('reward');
      else if (st.t === 'cosmic') want.push('cosmic');
      else if (st.t === 'finale') want.push('wordwarp');
      else if (st.t === 'ad' && st.forced) want.push('ad');
    });
    const got = scenes.map(s=> s.scene).filter(s=> s !== 'coldopen' && s !== 'orbit' && s !== 'results' && s !== 'end');
    const cosmicIdx = scenes.filter(s=> s.scene === 'cosmic').length;
    const problems = [];
    // (a Cosmic Surprise is its own rundown step, in place of a VS card: it must come exactly there)
    if (got.join(',') !== want.join(',')) problems.push('scene order differs: got ' + got.join(',') + ' want ' + want.join(','));
    // (opts.fast: a ?debug=fast episode - time is scaled, so the real-time minimums and the 250 / 400 ms checks are off)
    const minFor = { act: T.ACT_CARD_HOLD || 2800, mystery: T.MYSTERY_REVEAL_HOLD || 3000, coldopen: T.CINEMATIC_MIN || 1500 };
    if (!opts.fast) scenes.forEach(s=>{ const m = minFor[s.scene]; if (m && s.ms < m - 40) problems.push(s.scene + (s.info ? ' ' + s.info : '') + ' lasted ' + s.ms + ' ms (min ' + m + ')'); });
    // no VS card dealt twice
    const ids = (S.stats.dealt || []).map(d=> d.id), dup = ids.filter((id, i)=> ids.indexOf(id) !== i);
    if (dup.length) problems.push('VS card dealt twice: ' + dup.join(', '));
    // a VS card voted within 250 ms of appearing
    const vsEnter = S.log.filter(e=> e.kind === 'enter' && e.scene === 'vs'), voted = S.log.filter(e=> e.kind === 'state' && e.scene === 'vs' && /revealing|voted/.test(e.state || ''));
    if (!opts.fast) vsEnter.forEach(e=>{ const v = voted.find(x=> x.t >= e.t); if (v && v.t - e.t < 250) problems.push('VS card ' + e.detail + ' voted ' + Math.round(v.t - e.t) + ' ms after it appeared'); });
    const adv = S.log.filter(e=> e.kind === 'state' && e.state === 'leaving');
    if (!opts.fast) for (let i = 1; i < adv.length; i++) if (adv[i].t - adv[i - 1].t < 400) problems.push('two advances ' + Math.round(adv[i].t - adv[i - 1].t) + ' ms apart (' + adv[i - 1].scene + ' -> ' + adv[i].scene + ')');
    const coldAt = (enters.find(e=> e.scene === 'coldopen') || enters[0] || { t:0 }).t;
    const errs = (window.__qa && window.__qa.errors || []).concat(window.__qa && window.__qa.rejections || []);
    if (errs.length) problems.push('script errors: ' + errs.slice(0, 3).join(' | '));
    TT.report = { ok: !problems.length, problems, cosmic: cosmicIdx, plan: want.length, minutes: +((performance.now() - coldAt) / 60000).toFixed(2), taps: TT.taps, ghostClicks: TT.ghost,
      vsCards: got.filter(s=> s === 'vs').length, scenes: scenes.map(s=> s.scene + (s.info && s.scene !== 'vs' ? ':' + s.info : '') + ' ' + s.ms + 'ms'), drops: S.stats.drops };
  }
  step();
})();
