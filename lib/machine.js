/* FlipStax - the machines (Run 7): each round-end game drawn on its own full-screen vintage machine picture, like the VS console.

   Machine.register(name, cfg) - one small config per game:
     img      the picture's stem in data/machines/ (<img>-clean.webp, and <img>-lit.webp when cfg.lit)
     w, h     the picture's size (its aspect ratio)
     regions  named boxes measured on the clean picture, as fractions of it: { key: { x, y, w, h } }
     match()  returns the overlay element when this game's screen is up (else null) - the machine shows behind it
   The picture is fitted to the screen's width (or its height on a short screen), centred, with a matching dark background
   round it. Every region becomes px custom properties on :root (--mc-<key>-x / -y / -w / -h, in screen px, and --mc-x/-y/-w/-h
   for the picture), and the overlay gets .mc-backed and .mc-<name>, so lib/machine.css (and each game's rules) can place the
   game's own live DOM - text, tiles, buttons - on the picture. Nothing is baked: all text is real DOM text (Righteous).
   The lit layer: Machine.light(on) crossfades the lit picture over the dim one (opacity only); Machine.lightRegion(key, on)
   lights one region (a clipped copy of the lit picture); Machine.pulse(on) a slow bulb pulse (one fade a second at most).
   Lite mode and reduced motion: no pulse, and the lit picture switches at once.
   Machine.preload(name) warms a game's pictures (called on the round's title card, the screen before the game).
   Like the stage, one fixed layer first in <body> takes the overlay's z-index, so it paints just under it. */
(function(root){
  if (typeof document === 'undefined') return;
  const DIR = 'data/machines/';
  const games = {}, warm = {};
  const doc = document.documentElement;
  let el = null, cur = null, curOver = null, raf = 0, mo = null, watched = new Set(), litRegions = {};
  const px = (n)=> (Math.round(n * 100) / 100) + 'px';
  const quiet = ()=> doc.classList.contains('lite') || (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function build(){
    el = document.createElement('div'); el.id = 'machine'; el.className = 'mc'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="mc-box"><img class="mc-img mc-clean" alt="" draggable="false"><img class="mc-img mc-lit" alt="" draggable="false"><div class="mc-regions"></div></div>';
    document.body.insertBefore(el, document.body.firstChild);
    mo = root.MutationObserver ? new MutationObserver(soon) : null;
    if (mo) mo.observe(document.body, { childList:true });
    root.addEventListener('resize', ()=>{ if (cur) measure(); });
  }
  function measure(){
    const g = games[cur]; if (!g) return;
    const W = root.innerWidth, H = root.innerHeight, r = g.h / g.w;
    let w = Math.min(W, g.maxW || 560), h = w * r;
    if (h > H){ h = H; w = h / r; }
    const x = (W - w) / 2, y = Math.max(0, (H - h) / 2) + (g.shiftY ? g.shiftY * (H - h) / 2 : 0);
    const s = doc.style;
    s.setProperty('--mc-x', px(x)); s.setProperty('--mc-y', px(y)); s.setProperty('--mc-w', px(w)); s.setProperty('--mc-h', px(h));
    Object.keys(g.regions || {}).forEach(k=>{ const q = g.regions[k];
      s.setProperty('--mc-' + k + '-x', px(x + q.x * w)); s.setProperty('--mc-' + k + '-y', px(y + q.y * h)); s.setProperty('--mc-' + k + '-w', px(q.w * w)); s.setProperty('--mc-' + k + '-h', px(q.h * h)); });
    Machine.box = { x, y, w, h };
  }
  function show(name, over){
    const g = games[name];
    if (cur !== name){
      if (cur) doc.classList.remove('mc-on-' + cur);
      cur = name; litRegions = {};
      el.querySelector('.mc-regions').innerHTML = '';
      el.classList.remove('lit', 'pulse');
      el.querySelector('.mc-clean').src = DIR + g.img + '-clean.webp';
      el.querySelector('.mc-lit').src = g.lit ? DIR + g.img + '-lit.webp' : '';
      el.dataset.game = name;
      doc.classList.add('mc-on-' + name);
      measure();
    }
    if (curOver !== over){ if (curOver) curOver.classList.remove('mc-backed', 'mc-' + curOver.dataset.mc); curOver = over; }
    over.dataset.mc = name;
    if (!over.classList.contains('mc-backed')) over.classList.add('mc-backed', 'mc-' + name);
    el.style.zIndex = parseInt(getComputedStyle(over).zIndex, 10) || 0;
    el.classList.add('on'); doc.classList.add('mc-active');
  }
  function hide(){
    if (!cur) return;
    doc.classList.remove('mc-on-' + cur, 'mc-active');
    if (curOver) curOver.classList.remove('mc-backed', 'mc-' + curOver.dataset.mc);
    curOver = null; cur = null; el.classList.remove('on', 'lit', 'pulse');
  }
  function check(){
    raf = 0; if (!el) return;
    let hit = null, over = null;
    for (const name of Object.keys(games)){
      const g = games[name]; let o = null;
      try{ o = g.match(); }catch(e){}
      if (o){ if (mo && !watched.has(o)){ watched.add(o); mo.observe(o, { attributes:true, attributeFilter:['class'] }); } hit = name; over = o; break; }
    }
    if (hit) show(hit, over); else hide();
  }
  function soon(){ if (!raf) raf = requestAnimationFrame(check); }
  const visible = (e)=>{ if (!e || !e.isConnected || e.classList.contains('hidden')) return false; const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden'; };

  const Machine = {
    box: null, games, visible,
    register(name, cfg){ games[name] = cfg; soon(); },
    init(){ if (el) return; build(); check(); setInterval(soon, 500); },   // (the slow poll is a backstop for screens that open without a class change)
    check: soon,
    get current(){ return cur; },
    // the lit picture over the dim one (opacity only; instant in lite / reduced motion)
    light(on){ if (!el) return; el.classList.toggle('quiet', quiet()); el.classList.toggle('lit', !!on); },
    // one region lit: a copy of the lit picture clipped to the region
    lightRegion(key, on, cls){
      const g = games[cur]; if (!el || !g || !g.lit || !g.regions[key]) return;
      let r = litRegions[key];
      if (!r){
        const q = g.regions[key];
        r = document.createElement('img'); r.className = 'mc-img mc-litr'; r.alt = ''; r.src = DIR + g.img + '-lit.webp';
        r.style.clipPath = 'inset(' + (q.y * 100) + '% ' + ((1 - q.x - q.w) * 100) + '% ' + ((1 - q.y - q.h) * 100) + '% ' + (q.x * 100) + '% round 3%)';
        el.querySelector('.mc-regions').appendChild(r); litRegions[key] = r;
      }
      el.classList.toggle('quiet', quiet());
      if (cls) r.dataset.fx = cls; else delete r.dataset.fx;
      if (on){ void r.offsetWidth; } r.classList.toggle('on', !!on);
    },
    clearRegions(){ Object.values(litRegions).forEach(r=> r.classList.remove('on')); },
    // a slow bulb pulse: the lit picture breathing in and out (one fade a second at most; none in lite / reduced motion)
    pulse(on){ if (el) el.classList.toggle('pulse', !!on && !quiet()); },
    preload(name){
      const g = games[name]; if (!g || warm[name]) return; warm[name] = true;
      [g.img + '-clean'].concat(g.lit ? [g.img + '-lit'] : []).forEach(f=>{ const i = new Image(); i.decoding = 'async'; i.src = DIR + f + '.webp'; });
    },
  };
  root.Machine = Machine;
})(typeof window !== 'undefined' ? window : globalThis);
