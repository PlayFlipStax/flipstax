/* FlipStax - the stage (Run 3). The photo studio set behind the show, in three camera shots:

   - close: the arch and the marquee (data/stage/stage-close.webp, portrait), a slow push-in 1.00 -> 1.06 over the scene
   - wide:  the whole set (stage-wide.webp, landscape), object-fit cover, a slow pan from one side of the stage to the other
   - dim:   the close shot pre-blurred (stage-dim.webp) under a dark scrim and a vignette - behind every gameplay screen

   A camera cut is a 600 ms crossfade. Only transform and opacity move. Lite mode and reduced motion: still pictures.
   Gentle life on close and wide: a slow light sweep and a glow pulse. The marquee (the blank sign above the arch) shows
   live text - Stage.sign('ACT 1', 'THE OPENER') - placed in percent of the picture, so it stays on the sign at any crop.

   Where the stage sits: one fixed layer, first in <body>. Behind a full-screen overlay (the landing, the menu, a
   cinematic, the results) it takes that overlay's z-index - same z, earlier in the page, so it paints just under it and
   over everything below - and the overlay gets .stage-backed (lib/stage.css clears its own backdrop). Behind gameplay it
   drops to z -3 under the show's world layer. Which shot: an explicit cue (Stage.cue, from a cinematic) while its
   overlay is up, else the screen on top (landing / menu: close; results: wide; a run: dim). It re-checks itself when
   those screens open or close (MutationObserver), so the game only cues the cinematics.

   Loading: the close and dim pictures at once; the wide one lazily (Stage.loadWide(), called by the cold open) - a
   wide cue before it has loaded shows the close shot and cuts to wide when it arrives. If the pictures cannot load,
   :root never gets .stage-on and every screen keeps its old backdrop. */
(function(root){
  const DIR = 'data/stage/';
  // The blank marquee in each picture, in percent of the picture (tools/build-art.py finds it).
  const SIGN = { close:{ x:32.4, y:7.5, w:35.2, h:9.2 }, wide:{ x:39.8, y:7.4, w:20.5, h:9.0 } };
  const CUT_MS = 600;
  let el = null, shots = {}, ready = false, wideState = 'none', cue = null, cur = { shot:null, over:null, z:null, key:'' };
  let episode = '', sign = { sub:'', main:'' }, observed = new Set(), mo = null, raf = 0;
  const vis = (e)=> !!e && e.isConnected && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none';
  const $ = (id)=> document.getElementById(id);

  function plate(name){
    const s = SIGN[name];
    return '<div class="stg-shot stg-' + name + '"><div class="stg-plate">' +
      '<img class="stg-img" alt="" decoding="async" draggable="false">' +
      (name === 'close' ? '<i class="stg-panel" style="left:' + (s.x - 0.8) + '%;top:' + (s.y - 0.9) + '%;width:' + (s.w + 1.6) + '%;height:' + (s.h + 1.8) + '%"></i>' : '') +
      '<i class="stg-glow"></i><i class="stg-sweep"></i>' +
      '<div class="stg-sign" style="left:' + s.x + '%;top:' + s.y + '%;width:' + s.w + '%;height:' + s.h + '%"><b class="stg-sub"></b><span class="stg-main"></span></div>' +
      '</div></div>';
  }
  function build(){
    el = document.createElement('div');
    el.id = 'stage'; el.className = 'stage'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = plate('close') + plate('wide') + '<div class="stg-shot stg-dim"><img class="stg-img" alt="" decoding="async" draggable="false"><i class="stg-scrim"></i></div>';
    document.body.insertBefore(el, document.body.firstChild);
    ['close', 'wide', 'dim'].forEach(n=> shots[n] = el.querySelector('.stg-' + n));
  }
  function load(name, file){
    return new Promise((res, rej)=>{
      const img = shots[name].querySelector('.stg-img');
      img.onload = ()=> res(); img.onerror = ()=> rej(new Error(file));
      img.src = DIR + file;
    });
  }
  function loadWide(){
    if (!el || wideState !== 'none') return;
    wideState = 'loading';
    load('wide', 'stage-wide.webp').then(()=>{ wideState = 'ready'; check(); }, ()=>{ wideState = 'failed'; });
  }
  // What the stage should show now.
  function desired(){
    if (cue && cue.until()) return cue;
    cue = null;
    const home = $('homeOverlay'), menu = $('modeSelectOverlay'), ro = $('readoutOverlay'), fin = $('finOverlay');
    const epSign = { sub:'TONIGHT’S SHOW', main: episode ? 'EPISODE ' + episode : 'FLIPSTAX' };
    if (vis(home)) return { shot:'close', over:home, sign:epSign };
    if (ro && ro.classList.contains('show')) return { shot:'wide', over:ro, sign:{ sub:'THAT’S OUR SHOW', main:'SEE YOU TOMORROW' } };
    if (vis(fin) && vis($('finComplete'))) return { shot:'wide', over:fin, sign:{ sub:'THAT’S OUR SHOW', main:'FINAL SCORE' } };
    if (vis(menu)) return { shot:'close', over:menu, sign:null };   // (the menu says the episode itself, right under the sign)
    const r = document.documentElement.classList;
    if (r.contains('mode-daily') || r.contains('mode-infinity')) return { shot:'dim', over:null, z:-3 };
    return { shot:'close', over:null, z:-5, sign:epSign };
  }
  function setSign(s){
    s = s || { sub:'', main:'' };
    if (s.sub === sign.sub && s.main === sign.main) return;
    sign = { sub:s.sub || '', main:s.main || '' };
    el.querySelectorAll('.stg-sign').forEach(g=>{
      g.querySelector('.stg-sub').textContent = sign.sub;
      g.querySelector('.stg-main').textContent = sign.main;
      g.classList.toggle('two', !!sign.sub); g.classList.toggle('on', !!sign.main);
      g.classList.toggle('long', sign.main.length > 12); g.classList.toggle('xlong', sign.main.length > 17);
    });
  }
  function apply(d){
    if (d.shot === 'wide') loadWide();
    const want = d.shot === 'wide' && wideState !== 'ready' ? 'close' : d.shot;   // (the wide shot until it has loaded)
    const z = d.over ? (parseInt(getComputedStyle(d.over).zIndex, 10) || 0) : d.z;
    if (cur.over && cur.over !== d.over) cur.over.classList.remove('stage-backed');
    // (re-added whenever it is missing: a cinematic that sets the card's className afresh wipes it)
    if (d.over && !d.over.classList.contains('stage-backed')) d.over.classList.add('stage-backed');
    if (z !== cur.z) el.style.zIndex = z;
    if (want !== cur.shot){
      Object.keys(shots).forEach(n=> shots[n].classList.toggle('on', n === want));
      el.dataset.shot = want;
    }
    // The push-in restarts with each cue that asks for it (its length = the scene's).
    // (A shot being cut away from keeps its framing while it fades; a fresh cut to close without a push starts at 1.00.)
    const close = shots.close, key = d.push ? 'p' + d.id : '';
    if (d.push && key !== cur.key){
      close.classList.remove('push'); close.style.setProperty('--push-ms', (d.ms || 9000) + 'ms'); void close.offsetWidth; close.classList.add('push');
    } else if (!d.push && want === 'close' && cur.shot !== 'close') close.classList.remove('push');
    setSign(d.sign);
    cur = { shot:want, over:d.over || null, z, key };
  }
  function check(){ raf = 0; if (ready) apply(desired()); }
  const soon = ()=>{ if (!raf) raf = requestAnimationFrame(check); };
  function watch(e){
    if (!e || observed.has(e) || !mo) return;
    observed.add(e); mo.observe(e, { attributes:true, attributeFilter:['class'] });
  }
  let cueN = 0;
  const Stage = {
    SIGN, CUT_MS,
    init(opts){
      if (el) return;
      opts = opts || {};
      episode = opts.episode != null ? String(opts.episode) : '';
      build();
      mo = window.MutationObserver ? new MutationObserver(soon) : null;
      [document.documentElement, $('homeOverlay'), $('modeSelectOverlay'), $('readoutOverlay'), $('finOverlay'), $('finComplete'), $('showCard')].forEach(watch);
      Promise.all([load('close', 'stage-close.webp'), load('dim', 'stage-dim.webp')]).then(()=>{
        ready = true; document.documentElement.classList.add('stage-on'); apply(desired());
      }, ()=>{ /* no stage: every screen keeps its own backdrop */ });
    },
    // A cinematic's shot while `over` is up: Stage.cue('close', { over, cls, sign:{ sub, main }, push:true, ms }).
    cue(shot, opts){
      if (!el) return;
      opts = opts || {};
      const over = opts.over || null;
      if (over) watch(over);
      cue = { shot, over, z: opts.z, sign: opts.sign || null, push: !!opts.push, ms: opts.ms, id: ++cueN,
        // (while `over` is up - and still showing this cinematic: `cls`, since the card is reused straight away by the next one)
        until: opts.until || (()=> !!over && vis(over) && (!opts.cls || over.classList.contains(opts.cls))) };
      if (shot === 'wide') loadWide();
      if (ready) apply(desired());
    },
    release(){ cue = null; if (ready) apply(desired()); },
    loadWide,
    setEpisode(n){ episode = String(n); soon(); },
    get shot(){ return cur.shot; },
    get ready(){ return ready; },
  };
  root.Stage = Stage;
})(typeof window !== 'undefined' ? window : globalThis);
