/* FlipStax - the cast (Run 3; Run 4A): the host's companions, as pictures.

   - purple: Cleo Cosmic, the presenter. kandi: Kandi Cosmos, the second presenter - she has no pictures yet, so she sits
     out until data/cast/manifest.js lists one. (Run 4A: Barnaby, the orange sidekick, and the old pink presenter are out
     of the show; their picture files stay in data/cast.) flip: the host himself (HOST_NAME), his pose pictures from
     data/host (lib/host.js), for a failure reaction and the results outro.
   - Cast.show(name, pose, side, opts) slides a member in from that side ('left' | 'right') with a pop, bobs while
     idle and slides out again after opts.hold ms (or as soon as opts.while() turns false). opts.say puts a speech
     bubble over them; opts.peek shows them smaller, half past the screen edge; opts.lane puts them in the bottom lane
     (a small bust at the right, the bubble to their left - the strip every screen keeps clear); opts.minWidth: not on
     narrower screens. Cast.hide() sends whoever is out off now. Each member shows <dir>/<name>-<pose>.webp when it is
     listed in the manifest; otherwise their idle picture with a gentle bob; otherwise any picture of theirs; with none
     at all they sit the moment out.
   - Milestones only (DIRECTION.md, Run 4A): Cast.win(side) - a round-end game won: Cleo (or Kandi, when she has a
     picture) pops out from the side with the presenting pose, her open hand pointing in toward the score. Cast.oops() -
     a failure: Flip laughs or winces at the side. Each fires about one time in three (REACTION_CHANCE), never covers a
     control (pointer-events: none) and never holds up the show.
   - Same rule as the host's pictures (lib/host.js HOST_IMAGE_MODE): while the host is still the drawn SVG, the cast
     (3D renders) stays off. On localhost, ?castpreview=1 lets the cast on anyway, for checking the art.
   Motion: transform and opacity only; lite mode and reduced motion: a plain fade, no bob or wiggle. */
(function(root){
  const DIR = 'data/cast/', HOST_DIR = 'data/host/';
  const NAMES = { purple:'Cleo Cosmic', kandi:'Kandi Cosmos', flip: root.FLIPSTAX_HOST_NAME || 'Flip Sterling' };
  const MEMBERS = ['purple', 'kandi', 'flip'], PRESENTERS = ['purple', 'kandi'];
  const REACTION_CHANCE = 1 / 3;
  const OOPS_LINES = ['Ooh, so close!', 'Oof! Next one, Earthling!', 'Ha! Even I missed that one.'];
  let el = null, slot = null, hideT = 0, watchT = 0, episode = 0, wins = 0;
  const art = ()=> root.FLIPSTAX_CAST_ART || [];
  const hostArt = ()=> root.FLIPSTAX_HOST_POSES || [];
  // Flip's pictures are the host's poses (data/host/<pose>.webp); everyone else's are data/cast/<name>-<pose>.webp.
  const has = (name, pose)=> name === 'flip' ? hostArt().indexOf(pose) >= 0 : art().indexOf(name + '-' + pose) >= 0;
  const file = (name, pose)=> name === 'flip' ? HOST_DIR + pose + '.webp' : DIR + name + '-' + pose + '.webp';
  const quiet = ()=> document.documentElement.classList.contains('lite') || (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function preview(){
    try{ return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && new URLSearchParams(location.search).get('castpreview') === '1'; }catch(e){ return false; }
  }
  // The cast is on only when the host is pictures too (or the localhost preview).
  function enabled(){ return !!(root.Host && root.Host.imageMode) || preview(); }
  // The picture for name + pose: [src, how] (how: '' = the real pose, 'idle' = idle stands in, 'any' = another pose).
  function pick(name, pose){
    if (has(name, pose)) return [file(name, pose), ''];
    if (has(name, 'idle')) return [file(name, 'idle'), 'idle'];
    if (name === 'flip') return null;
    const other = art().find(a=> a.indexOf(name + '-') === 0);
    return other ? [DIR + other + '.webp', 'any'] : null;
  }
  function build(){
    if (el) return;
    el = document.createElement('div'); el.id = 'cast'; el.className = 'cast'; el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  function out(now){
    clearTimeout(hideT); clearInterval(watchT);
    const s = slot; slot = null;
    if (!s) return;
    if (now || quiet()){ s.remove(); return; }
    s.classList.remove('in'); s.classList.add('out');
    setTimeout(()=> s.remove(), 420);
  }
  const Cast = {
    MEMBERS, NAMES, REACTION_CHANCE,
    init(opts){ opts = opts || {}; if (opts.episode != null) episode = +opts.episode || 0; },
    setEpisode(n){ episode = +n || 0; },
    enabled,
    // Who presents: Cleo, or Kandi on alternate wins once she has a picture; null when neither has one.
    presenter(){
      const ready = PRESENTERS.filter(n=> pick(n, 'presenting'));
      return ready.length ? ready[(wins + Math.abs(episode)) % ready.length] : null;
    },
    show(name, pose, side, opts){
      opts = opts || {};
      if (!enabled() || MEMBERS.indexOf(name) < 0) return false;
      // nothing may cover an answer, a score, a timer or a control: no room for the size asked = no cast
      if (opts.minWidth && root.innerWidth < opts.minWidth) return false;
      if (opts.lane && root.innerHeight < 640) return false;
      const p = pick(name, pose || 'idle'); if (!p) return false;
      build(); out(true);
      side = side === 'left' ? 'left' : 'right';
      const s = document.createElement('div');
      s.className = 'cast-m ' + side + ' m-' + name + (opts.peek ? ' peek' : '') + (opts.lane ? ' lane' : '') + (opts.pop ? ' popup' : '') + (p[1] ? ' stand-in' : '') + (p[1] && pose === 'laugh' ? ' wiggle' : '');
      s.dataset.pose = pose || 'idle';
      s.innerHTML = '<div class="cast-fig"><img alt="" draggable="false" decoding="async" src="' + p[0] + '"></div>' +
        (opts.say ? '<div class="cast-say"></div>' : '');
      if (opts.say) s.querySelector('.cast-say').textContent = opts.say;
      el.appendChild(s); slot = s;
      void s.offsetWidth; s.classList.add('in');
      const hold = opts.hold || 2000;
      hideT = setTimeout(()=> out(), hold);
      if (opts.while) watchT = setInterval(()=>{ if (!opts.while()) out(); }, 200);
      return true;
    },
    hide(){ out(); },
    // A round-end game won: the presenter pops out from the side, pointing in toward the score (one time in three).
    win(opts){
      opts = opts || {};
      if (!enabled() || (!opts.always && Math.random() >= REACTION_CHANCE)) return false;
      const p = Cast.presenter(); if (!p) return false;
      wins++;
      return Cast.show(p, 'presenting', opts.side || 'left', { hold: opts.hold || 1800, while: opts.while, pop: true });
    },
    // A failure: Flip laughs or winces at the side (one time in three).
    oops(opts){
      opts = opts || {};
      if (!enabled() || (!opts.always && Math.random() >= REACTION_CHANCE)) return false;
      const pose = Math.random() < 0.5 ? 'laugh' : 'oops';
      return Cast.show('flip', pose, opts.side || 'right', { hold: opts.hold || 1700, say: OOPS_LINES[Math.floor(Math.random() * OOPS_LINES.length)], while: opts.while, peek: true });
    },
  };
  root.Cast = Cast;
})(typeof window !== 'undefined' ? window : globalThis);
