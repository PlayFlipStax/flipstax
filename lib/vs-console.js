/* FlipStax - the VS console (Run 6): the Daily VS card screen drawn on the console picture (data/vs/console-*.webp).

   The picture keeps its own aspect ratio: it is scaled to the screen's width (or its height, on a screen too short for
   it), centred, and any spare room is a matching dark purple. The regions measured on the picture (data/vs/console-layout.js,
   fractions of it) are turned into pixel boxes on every resize and handed to the CSS as custom properties
   (--vsc-<region>-x/-y/-w/-h on :root), so the live cards, the HUD and the effects sit exactly on the art.

   On while the Daily show is on the VS board (:root.mode-daily, the picture loaded: :root.vsc-ready); a Brain Beam or a
   power-up opening over the board (:root.event-open) brings the old board layout back for its own screen. Infinity is
   untouched. Transform and opacity animations only. */
(function(root){
  const L = root.FLIPSTAX_VS_LAYOUT;
  if (!L || typeof document === 'undefined') return;
  const DIR = 'data/vs/', RATIO = L.image.h / L.image.w;
  const doc = document.documentElement;
  let el = null, frame = null, rv = null, ready = false, raf = 0, hudEls = null, hudKey = '', rvTimers = [];
  const px = (n)=> Math.round(n * 100) / 100 + 'px';

  function build(){
    el = document.createElement('div');
    el.className = 'vsc'; el.id = 'vsConsole'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="vsc-frame"><img class="vsc-img vsc-clean" alt="" draggable="false" decoding="async">' +
      '<img class="vsc-img vsc-lit" alt="" draggable="false" decoding="async">' +
      // the HUD: points and round on the grill, the six round sockets lit by state
      '<div class="vsc-hud"><b class="vsc-pts"><small>PTS</small><span>0</span></b><span class="vsc-round"></span><em class="vsc-combo"></em></div>' +
      '<div class="vsc-rs">' + L.hudSockets.x.map(()=> '<i></i>').join('') + '</div>' +
      // the VS cog on the blank coin
      '<img class="vsc-badge" alt="" draggable="false" decoding="async" src="' + DIR + 'badge.webp">' +
      // the bulbs in the sockets round the lower tray (a travelling chase) and a glow over each arcade button
      '<div class="vsc-bulbs">' + L.sockets.map(()=> '<i></i>').join('') + '</div>' +
      '<div class="vsc-btns">' + L.buttons.map(()=> '<i></i>').join('') + '</div>' +
      // each window: a dark cover (a card comes up out of the dark) and its crackle ring (4 versions, flickered)
      '<i class="vsc-cover top"></i><i class="vsc-cover bot"></i>' +
      '<div class="vsc-ring top" data-c="green">' + [0, 1, 2, 3].map(k=> '<img alt="" data-k="' + k + '">').join('') + '</div>' +
      '<div class="vsc-ring bot" data-c="cyan">' + [0, 1, 2, 3].map(k=> '<img alt="" data-k="' + k + '">').join('') + '</div>' +
      '</div>';
    document.body.insertBefore(el, document.body.firstChild);
    // the reveal layer: above the cards, never taking a tap
    rv = document.createElement('div'); rv.className = 'vsr'; rv.setAttribute('aria-hidden', 'true');
    rv.innerHTML = '<i class="vsr-laser l"></i><i class="vsr-laser r"></i>' +
      '<div class="vsr-ring">' + [0, 1, 2, 3].map(k=> '<img alt="" data-k="' + k + '">').join('') + '</div>' +
      '<div class="vsr-frame"><div class="vsr-bulbs">' + Array.from({ length: 22 }, ()=> '<i></i>').join('') + '</div><div class="vsr-card"><div class="vsr-glyph"></div><div class="vsr-take"></div></div></div>' +
      '<div class="vsr-msg"><b></b><small></small></div>';
    document.body.appendChild(rv);
    // the frame's bulbs, evenly round its edge (percent of the frame)
    const fb = [...rv.querySelectorAll('.vsr-bulbs i')], per = [7, 4, 7, 4];
    let k = 0;
    for (let e = 0; e < 4; e++) for (let j = 0; j < per[e]; j++, k++){ const t = (j + 0.5) / per[e], b = fb[k];
      const [x, y] = e === 0 ? [t, 0] : e === 1 ? [1, t] : e === 2 ? [1 - t, 1] : [0, 1 - t]; b.style.left = (x * 100) + '%'; b.style.top = (y * 100) + '%'; b.style.animationDelay = (-(k / fb.length) * 0.9) + 's'; }
    frame = el.querySelector('.vsc-frame');
    const clean = el.querySelector('.vsc-clean');
    clean.onload = ()=>{ ready = true; doc.classList.add('vsc-ready'); measure(); };
    clean.src = DIR + 'console-clean.webp';
    el.querySelector('.vsc-lit').src = DIR + 'console-lit.webp';
    // the round sockets sit on the measured centres (fractions of the picture: no px needed)
    el.querySelectorAll('.vsc-rs i').forEach((i, k)=>{ const d = L.hudSockets.d; i.style.left = ((L.hudSockets.x[k] - d / 2) * 100) + '%'; i.style.width = (d * 100) + '%'; i.style.top = 'calc(' + (L.hudSockets.y * 100) + '% - ' + (d / 2 * 100) + 'cqw)'; });
    // bulbs: on the socket centres, in warm pink, cyan and gold by turn; each one's chase phase follows its place round the ring
    const COLORS = ['#ff6fc8', '#5ff2ff', '#ffd75a'], n = L.sockets.length;
    el.querySelectorAll('.vsc-bulbs i').forEach((b, k)=>{ const [x, y] = L.sockets[k]; b.style.left = (x * 100) + '%'; b.style.top = (y * 100) + '%'; b.style.setProperty('--c', COLORS[k % 3]); b.style.setProperty('--k', k / n); });
    el.querySelectorAll('.vsc-btns i').forEach((b, k)=>{ const r = L.buttons[k]; b.style.left = (r.x * 100) + '%'; b.style.top = (r.y * 100) + '%'; b.style.width = (r.w * 100) + '%'; b.style.height = (r.h * 100) + '%'; b.style.setProperty('--c', r.c); b.style.setProperty('--k', k); });
    // the crackle pictures load once the console is up (they are only needed from the first card on)
    const loadRings = ()=>{ el.querySelectorAll('.vsc-ring').forEach(r=> r.querySelectorAll('img').forEach(i=>{ i.decoding = 'async'; i.src = DIR + 'crackle-' + r.dataset.c + '-' + i.dataset.k + '.webp'; }));
      rv.querySelectorAll('.vsr-ring img').forEach(i=>{ i.decoding = 'async'; i.src = DIR + 'crackle-pink-' + i.dataset.k + '.webp'; }); };
    (root.requestIdleCallback || ((f)=> setTimeout(f, 300)))(loadRings);
    hudEls = { pts: el.querySelector('.vsc-pts span'), round: el.querySelector('.vsc-round'), combo: el.querySelector('.vsc-combo'), rs: [...el.querySelectorAll('.vsc-rs i')] };
  }
  // The picture's box on screen, then every region's box (px, relative to the picture's top-left corner).
  function measure(){
    raf = 0;
    const W = root.innerWidth, H = root.innerHeight;
    let w = W, h = w * RATIO;
    if (h > H){ h = H; w = h / RATIO; }
    const x = (W - w) / 2, y = (H - h) / 2;
    const s = doc.style;
    s.setProperty('--vsc-x', px(x)); s.setProperty('--vsc-y', px(y)); s.setProperty('--vsc-w', px(w)); s.setProperty('--vsc-h', px(h));
    const box = (name, r)=>{ s.setProperty('--vsc-' + name + '-x', px(r.x * w)); s.setProperty('--vsc-' + name + '-y', px(r.y * h)); s.setProperty('--vsc-' + name + '-w', px(r.w * w)); s.setProperty('--vsc-' + name + '-h', px(r.h * h)); };
    box('top', L.topWindow); box('bot', L.bottomWindow);
    // a crackle ring's picture placed so its bright line lies on the window's edge (the tendrils spill outside)
    const ring = (name, r, color)=>{ const c = L.crackle[color]; const iw = r.w * w / c.w, ih = r.h * h / c.h;
      s.setProperty('--vsc-ring-' + name + '-x', px(r.x * w - c.x * iw)); s.setProperty('--vsc-ring-' + name + '-y', px(r.y * h - c.y * ih)); s.setProperty('--vsc-ring-' + name + '-w', px(iw)); s.setProperty('--vsc-ring-' + name + '-h', px(ih)); };
    ring('top', L.topWindow, 'green'); ring('bot', L.bottomWindow, 'cyan'); box('pill', L.hudPill); box('grill', L.hudGrill); box('readout', L.readout); box('tab', L.timerTab);
    const cd = L.coin.d * w;
    box('coin', { x: L.coin.x - L.coin.d / 2, y: L.coin.y - (cd / h) / 2, w: L.coin.d, h: cd / h });
    VsConsole.box = { x, y, w, h };
  }
  const soon = ()=>{ if (!raf) raf = requestAnimationFrame(measure); };

  const quiet = ()=> doc.classList.contains('lite') || (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const later = (ms, f)=> rvTimers.push(setTimeout(f, ms));
  function clearReveal(){
    rvTimers.forEach(clearTimeout); rvTimers = [];
    if (el) el.classList.remove('lit');
    if (rv) rv.className = 'vsr';
    document.querySelectorAll('#board .half.vsc-dim, #board .half.vsc-gone').forEach(h=> h.classList.remove('vsc-dim', 'vsc-gone'));
    el && el.querySelectorAll('.vsc-ring.burst').forEach(r=> r.classList.remove('burst'));
  }
  const VsConsole = {
    layout: L, box: null,
    init(){
      if (el) return;
      build(); measure();
      // reduced motion as a class (the CSS treats it like lite: no crackle, lasers or chase)
      try{ const mq = root.matchMedia('(prefers-reduced-motion: reduce)'); const set = ()=> doc.classList.toggle('vsc-rm', !!mq.matches); set(); if (mq.addEventListener) mq.addEventListener('change', set); }catch(e){}
      root.addEventListener('resize', soon);
      root.addEventListener('orientationchange', soon);
    },
    get ready(){ return ready; },
    // The tap: the chosen card squishes (its own .tap-chosen), the console crossfades to the lit picture (0.2 s) with every
    // bulb on and racing round the tray, the chosen window's crackle ring bursts for 0.5 s (green top, cyan bottom), the other
    // card dims; at 0.42 s the chosen card scales up into the middle in a bulb-lit gold frame with pink laser streaks from
    // the top corners and the pink crackle ring round the frame, and the crowd's verdict (VsConsole.result) under it. All of
    // it is over by 1.2 s; nothing takes a tap.
    tap(side){
      if (!el || !ready || !doc.classList.contains('mode-daily') || doc.classList.contains('event-open')) return;
      clearReveal();
      const q = quiet(), A = document.getElementById('halfA'), B = document.getElementById('halfB'), mine = side === 'A' ? A : B, other = side === 'A' ? B : A;
      if (!mine) return;
      el.classList.add('lit');
      other.classList.add('vsc-dim');
      if (!q){ const r = el.querySelector('.vsc-ring.' + (side === 'A' ? 'top' : 'bot')); void r.offsetWidth; r.classList.add('burst'); }
      // the frame takes the chosen card's picture and label
      const g = mine.querySelector('.scene .glyph'), t = mine.querySelector('.take');
      rv.querySelector('.vsr-glyph').innerHTML = g ? g.innerHTML : '';
      rv.querySelector('.vsr-take').textContent = t ? t.textContent : '';
      { const n = (t && t.textContent || '').length; rv.querySelector('.vsr-take').classList.toggle('vsc-long', n > 22 && n <= 40); rv.querySelector('.vsr-take').classList.toggle('vsc-xlong', n > 40); }
      rv.querySelector('.vsr-msg b').textContent = ''; rv.querySelector('.vsr-msg small').textContent = '';
      rv.classList.toggle('bottom', side === 'B');
      later(q ? 200 : 420, ()=>{
        const bx = VsConsole.box; if (!bx) return;
        const fw = Math.min(bx.w * 0.8, 340), fh = Math.max(bx.h * 0.2, 130), fx = bx.x + (bx.w - fw) / 2, fy = bx.y + bx.h * 0.5 - fh / 2 - bx.h * 0.03;
        const s = rv.style; s.setProperty('--fx', fx + 'px'); s.setProperty('--fy', fy + 'px'); s.setProperty('--fw', fw + 'px'); s.setProperty('--fh', fh + 'px');
        // the pink ring round the frame (its bright line on the frame's edge)
        const c = L.crackle.pink, iw = fw / c.w, ih = fh / c.h;
        s.setProperty('--rx', (fx - c.x * iw) + 'px'); s.setProperty('--ry', (fy - c.y * ih) + 'px'); s.setProperty('--rw', iw + 'px'); s.setProperty('--rh', ih + 'px');
        // the frame grows out of the chosen card's own box
        const m = mine.getBoundingClientRect();
        s.setProperty('--from', 'translate(' + (m.left + m.width / 2 - (fx + fw / 2)) + 'px,' + (m.top + m.height / 2 - (fy + fh / 2)) + 'px) scale(' + (m.width / fw).toFixed(3) + ')');
        // the lasers: from the screen's top corners to the frame's top corners
        const W = root.innerWidth;
        [['l', 0, fx + 10], ['r', W, fx + fw - 10]].forEach(([n, x0, x1])=>{ const dx = x1 - x0, dy = fy + 6, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
          s.setProperty('--' + n + 'len', len + 'px'); s.setProperty('--' + n + 'ang', ang + 'deg'); });
        mine.classList.add('vsc-gone');
        void rv.offsetWidth; rv.classList.add('on');
      });
      later(1020, ()=>{ el.classList.remove('lit'); rv.classList.add('out'); other.classList.remove('vsc-dim'); mine.classList.remove('vsc-gone'); });   // (the chosen card is back in its window until the next one)
      later(1200, ()=>{ rv.className = 'vsr' + (side === 'B' ? ' bottom' : ''); });
    },
    // The crowd's verdict under the frame: the percentage and whether the player matched the crowd.
    result(o){
      if (!rv) return;
      const b = rv.querySelector('.vsr-msg b'), sm = rv.querySelector('.vsr-msg small');
      if (!o.real){ b.textContent = o.others > 0 ? 'EARLY CROWD' : 'YOU\u2019RE THE FIRST TO VOTE!'; sm.textContent = o.others > 0 ? 'only ' + o.others + ' vote' + (o.others === 1 ? '' : 's') + ' so far' : 'the crowd starts with you'; }
      else if (!o.counted){ b.textContent = 'DEAD HEAT!'; sm.textContent = o.pctA + '% / ' + o.pctB + '%'; }
      else if (o.matched){ b.textContent = 'YOU MATCHED THE CROWD!'; sm.textContent = o.pct + '% picked this'; }
      else { b.textContent = o.pct <= 30 ? 'HOT TAKE!' : 'BOLD PICK!'; sm.textContent = 'only ' + o.pct + '% picked this'; }
      rv.classList.add('msg');
    },
    // A card is dealt: both windows start dark, then each card fades and slides in under a short crackle flicker
    // (about 0.5 s, the four ring versions swapped at 8 a second, low contrast). Nothing waits for it: the card's timer
    // started when it was dealt, and it can be tapped at once.
    deal(){
      if (!el || !ready) return;
      clearReveal();
      el.classList.remove('dealt'); void el.offsetWidth; el.classList.add('dealt');
      // long labels step down a size (and may take a third line) rather than lose words
      document.querySelectorAll('#board .half .take').forEach(t=>{ const n = (t.textContent || '').length; t.classList.toggle('vsc-long', n > 22 && n <= 40); t.classList.toggle('vsc-xlong', n > 40); });
      const b = document.getElementById('board');
      if (b){ b.classList.remove('vsc-deal'); void b.offsetWidth; b.classList.add('vsc-deal'); }
    },
    // The HUD on the grill: points, the round (n of total; 0 = before the first, total + 1 = the finale), the crowd combo.
    hud(o){
      if (!hudEls) return;
      const key = [o.pts, o.round, o.total, o.combo].join('|'); if (key === hudKey) return; hudKey = key;
      hudEls.pts.textContent = o.pts;
      hudEls.round.textContent = o.round > o.total ? 'FINALE' : o.round ? 'ROUND ' + o.round : '';
      hudEls.combo.textContent = o.combo > 1 ? '\u00D7' + (o.combo % 1 ? o.combo.toFixed(1) : o.combo) : '';
      hudEls.rs.forEach((i, k)=>{ const n = k + 1; i.className = n < o.round ? 'done' : n === o.round ? 'now' : ''; });
    },
  };
  root.VsConsole = VsConsole;
})(typeof window !== 'undefined' ? window : globalThis);
