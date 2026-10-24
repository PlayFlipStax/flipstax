/* FlipStax - the stage-lights backdrop (Oct 24): one reusable layer behind the play screens that are not the VS card or Brain Beam -
   the Riddle Round, Lucky Lights, Zap Words, Twin Flip, Snap Sort, Orbit Drop and Word Warp.

   Layers, back to front (lib/lights.css): the dim studio picture (a warmer, darker copy: data/stage/stage-dim-warm.webp), a warm
   gold / teal wash, three or four soft spotlight beams sweeping slowly, drifting light spots (a tiled texture, like a disco ball's
   reflections), and a CSS disco ball hanging from the top with a slow sway and a few twinkling glints.
   Transform and opacity only; lite mode and reduced motion keep the beams still, no sway, no drift.

   How it sits: one fixed layer first in <body>. While one of the listed overlays is up it takes that overlay's z-index (earlier in
   the page, so it paints just under it), the overlay gets .lt-backed (its own backdrop and decorative layers step aside - the
   game's panels, tiles and accent colours stay) and the page's sunburst is hidden; with none up, the layer is hidden. */
(function(root){
  if (typeof document === 'undefined') return;
  // The overlays that get it. `when` narrows one that is shared with another screen.
  const TARGETS = [
    { sel:'#mgOverlay' }, { sel:'#luckyOverlay' }, { sel:'#irOverlay' }, { sel:'#finOverlay.daily-orbit' }, { sel:'#solveOverlay' },
  ];
  const doc = document.documentElement;
  let el = null, backed = null, raf = 0, mo = null, watched = new Set();
  const up = (e)=>{ if (!e || !e.isConnected || e.classList.contains('hidden')) return false; const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden') return false; const r = e.getBoundingClientRect(); return r.width > 200 && r.height > 200; };

  function build(){
    el = document.createElement('div');
    el.id = 'lights'; el.className = 'lt'; el.setAttribute('aria-hidden', 'true');
    let glints = '';
    [[-34, 18], [-6, -8], [24, 6], [40, 34], [-26, 40], [8, 52], [-44, 6], [30, -14]].forEach(([x, y], k)=>{ glints += '<i style="left:' + x + 'px;top:' + (34 + y) + 'px;animation-delay:' + (-k * 0.37) + 's;animation-duration:' + (1.5 + (k % 4) * 0.35) + 's"></i>'; });
    el.innerHTML = '<div class="lt-img"></div><div class="lt-warm"></div>' +
      '<div class="lt-beams"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i></div>' +
      '<div class="lt-spots"><i></i></div>' +
      '<div class="lt-ball"><b class="lt-cord"></b><span class="lt-sphere"></span><span class="lt-glints">' + glints + '</span></div>';
    document.body.insertBefore(el, document.body.firstChild);
    mo = window.MutationObserver ? new MutationObserver(soon) : null;
    if (mo){ mo.observe(document.body, { childList:true }); }
  }
  function check(){
    raf = 0; if (!el) return;
    let top = null, topZ = -1e9;
    TARGETS.forEach(t=>{
      const e = document.querySelector(t.sel); if (!e) return;
      if (mo && !watched.has(e)){ watched.add(e); mo.observe(e, { attributes:true, attributeFilter:['class', 'style'] }); }
      if (!up(e)) return;
      const z = parseInt(getComputedStyle(e).zIndex, 10) || 0; if (z >= topZ){ topZ = z; top = e; }
    });
    if (top !== backed){
      if (backed) backed.classList.remove('lt-backed');
      if (top) top.classList.add('lt-backed');
      backed = top;
    } else if (top && !top.classList.contains('lt-backed')) top.classList.add('lt-backed');   // (an overlay that rewrote its own class)
    el.dataset.for = top ? top.id : '';   // (CSS: the Word Warp - the finale - gets the brightest version)
    if (top){ el.style.zIndex = topZ; el.classList.add('on'); doc.classList.add('lt-active'); }
    else { el.classList.remove('on'); doc.classList.remove('lt-active'); }
  }
  function soon(){ if (!raf) raf = requestAnimationFrame(check); }
  root.Lights = { init(){ if (el) return; build(); check(); setInterval(soon, 600); }, check: soon, get active(){ return !!backed; } };   // (the slow poll is a backstop for overlays that show without a class change)
})(typeof window !== 'undefined' ? window : globalThis);
