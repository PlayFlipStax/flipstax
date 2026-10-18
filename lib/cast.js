/* FlipStax - the cast (Run 3): the host's showcase companions, as pictures.

   - orange: the sidekick. pink, purple: the presenters - one presents each episode, picked by the episode seed.
   - Cast.show(name, pose, side, opts) slides a member in from that side ('left' | 'right') with a pop, bobs while
     idle and slides out again after opts.hold ms (or as soon as opts.while() turns false). opts.say puts a speech
     bubble over them; opts.peek shows them smaller, half past the screen edge. Cast.hide() sends whoever is out off now. Each member shows data/cast/<name>-<pose>.webp when
     it is listed in data/cast/manifest.js; otherwise their idle picture with a gentle bob (a laugh: idle plus a quick
     wiggle); otherwise any picture of theirs; with none at all they sit the moment out.
   - Showcase only (DIRECTION.md): the game calls the cast at between-play moments - the Mystery Game door, the Cosmic
     Surprise prize, the big-win fanfare (Word Warp solved), the Lucky Lights bank, the results - never during timed
     play or on a VS card. Cast.oops(actKey): the sidekick laughs along ('Ooh, so close!') after a wrong answer that
     already shows its red X and buzzer (Brain Beam, the riddle, trivia), at most once per act.
   - Same rule as the host's pictures (lib/host.js HOST_IMAGE_MODE): while the host is still the drawn SVG, the cast
     (3D renders) stays off and the stage shows alone - the two looks never meet. On localhost, ?castpreview=1 lets
     the cast on anyway, for checking the art.
   Motion: transform and opacity only; lite mode and reduced motion: a plain fade, no bob or wiggle. */
(function(root){
  const DIR = 'data/cast/';
  const MEMBERS = ['orange', 'pink', 'purple'], LADIES = ['pink', 'purple'];
  const LINES = { laugh: 'Ooh, so close!' };
  const HOST_TEST = (()=>{ try{ const q = new URLSearchParams(root.location.search); return q.get('hosttest') === '1' && q.get('replay') === '1'; }catch(e){ return false; } })();
  let el = null, slot = null, hideT = 0, watchT = 0, episode = 0, oopsActs = new Set();
  const art = ()=> HOST_TEST ? ['orange-idle', 'pink-presenting'] : (root.FLIPSTAX_CAST_ART || []);   // (?hosttest=1: the pictures that exist - there is no purple-presenting yet)
  const has = (name, pose)=> art().indexOf(name + '-' + pose) >= 0;
  const quiet = ()=> document.documentElement.classList.contains('lite') || (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function preview(){
    try{ return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && new URLSearchParams(location.search).get('castpreview') === '1'; }catch(e){ return false; }
  }
  // The cast is on only when the host is pictures too (or the localhost preview).
  function enabled(){ return !!(root.Host && root.Host.imageMode) || preview(); }
  // The picture for name + pose: [file, how] (how: '' = the real pose, 'idle' = idle stands in, 'any' = another pose).
  function pick(name, pose){
    if (has(name, pose)) return [name + '-' + pose, ''];
    if (has(name, 'idle')) return [name + '-idle', 'idle'];
    const other = art().find(a=> a.indexOf(name + '-') === 0);
    return other ? [other, 'any'] : null;
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
    MEMBERS,
    init(opts){ opts = opts || {}; if (opts.episode != null) episode = +opts.episode || 0; },
    setEpisode(n){ episode = +n || 0; },
    enabled,
    // Tonight's presenter: by the episode seed, the other lady when this one has no picture yet.
    presenter(){
      const first = LADIES[Math.abs(episode) % 2], second = LADIES[(Math.abs(episode) + 1) % 2];
      return pick(first, 'presenting') ? first : pick(second, 'presenting') ? second : null;
    },
    show(name, pose, side, opts){
      opts = opts || {};
      if (!enabled() || MEMBERS.indexOf(name) < 0) return false;
      const p = pick(name, pose || 'idle'); if (!p) return false;
      build(); out(true);
      side = side === 'left' ? 'left' : 'right';
      const s = document.createElement('div');
      s.className = 'cast-m ' + side + ' m-' + name + (opts.peek ? ' peek' : '') + (p[1] ? ' stand-in' : '') + (p[1] && pose === 'laugh' ? ' wiggle' : '');
      s.dataset.pose = pose || 'idle';
      s.innerHTML = '<div class="cast-fig"><img alt="" draggable="false" decoding="async" src="' + DIR + p[0] + '.webp"></div>' +
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
    // The sidekick laughs along after a wrong answer (red X + buzzer already up): once per act, never on a VS card.
    oops(actKey, opts){
      opts = opts || {};
      if (!enabled() || oopsActs.has(actKey)) return false;
      if (!Cast.show('orange', 'laugh', opts.side || 'left', { hold: opts.hold || 1800, say: LINES.laugh, while: opts.while, peek: true })) return false;
      oopsActs.add(actKey);
      return true;
    },
    resetActs(){ oopsActs = new Set(); },
  };
  root.Cast = Cast;
})(typeof window !== 'undefined' ? window : globalThis);
