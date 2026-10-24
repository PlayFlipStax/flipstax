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
  let el = null, frame = null, ready = false, raf = 0, hudEls = null, hudKey = '';
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
      '</div>';
    document.body.insertBefore(el, document.body.firstChild);
    frame = el.querySelector('.vsc-frame');
    const clean = el.querySelector('.vsc-clean');
    clean.onload = ()=>{ ready = true; doc.classList.add('vsc-ready'); measure(); };
    clean.src = DIR + 'console-clean.webp';
    el.querySelector('.vsc-lit').src = DIR + 'console-lit.webp';
    // the round sockets sit on the measured centres (fractions of the picture: no px needed)
    el.querySelectorAll('.vsc-rs i').forEach((i, k)=>{ const d = L.hudSockets.d; i.style.left = ((L.hudSockets.x[k] - d / 2) * 100) + '%'; i.style.width = (d * 100) + '%'; i.style.top = 'calc(' + (L.hudSockets.y * 100) + '% - ' + (d / 2 * 100) + 'cqw)'; });
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
    box('top', L.topWindow); box('bot', L.bottomWindow); box('pill', L.hudPill); box('grill', L.hudGrill); box('readout', L.readout); box('tab', L.timerTab);
    const cd = L.coin.d * w;
    box('coin', { x: L.coin.x - L.coin.d / 2, y: L.coin.y - (cd / h) / 2, w: L.coin.d, h: cd / h });
    VsConsole.box = { x, y, w, h };
  }
  const soon = ()=>{ if (!raf) raf = requestAnimationFrame(measure); };

  const VsConsole = {
    layout: L, box: null,
    init(){
      if (el) return;
      build(); measure();
      root.addEventListener('resize', soon);
      root.addEventListener('orientationchange', soon);
    },
    get ready(){ return ready; },
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
