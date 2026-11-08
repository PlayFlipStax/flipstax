/* Spotlights: soft stage beams sweeping slowly from their base, plus a few slow shimmer sparkles - a reusable background layer.
   Spotlights.mount(host, { colors, beams, sparkles, opacity, before }) puts a .spot-layer in host (before the element `before`, else first) and
   returns { el, destroy }. The layer is pointer-events:none and sits at z-index 1, so anything above it (a wheel, buttons, a result card) stays on top.
   colors: the beam colours, used in turn (default white and warm gold). beams: how many (default 4). sparkles: how many (default 20).
   opacity: each beam's peak opacity (default 0.16). Each beam sweeps between two angles round its base every 6-10 s (transform only); each
   sparkle fades in and out over 4-7 s (opacity and transform only). Lite mode and reduced motion: the beams stand still at their base angle and
   the sparkles stay still and faint (see lib/spotlights.css). Positions use Math.random, never a game's rng. */
(function(){
  'use strict';
  function mount(host, opts){
    opts = opts || {};
    const colors = opts.colors && opts.colors.length ? opts.colors : ['#ffffff', '#ffd88a'];
    const n = Math.max(1, opts.beams || 4), ns = Math.max(0, opts.sparkles == null ? 20 : opts.sparkles), op = opts.opacity || 0.16;
    const layer = document.createElement('div'); layer.className = 'spot-layer'; layer.setAttribute('aria-hidden', 'true');
    layer.style.setProperty('--spot-o', op);
    for (let i = 0; i < n; i++){
      const b = document.createElement('i'); b.className = 'spot-beam';
      const x = n === 1 ? 50 : 8 + (84 * i) / (n - 1);                  // the bases spread across the top
      const lean = (50 - x) * 0.32;                                       // each beam leans in toward the centre
      const swing = 9 + Math.random() * 6, dir = i % 2 ? 1 : -1;          // 9-15 degrees each way, alternate beams start the other way
      b.style.left = x.toFixed(1) + '%';
      b.style.setProperty('--c', colors[i % colors.length]);
      b.style.setProperty('--a0', (lean - dir * swing).toFixed(1) + 'deg');
      b.style.setProperty('--a1', (lean + dir * swing).toFixed(1) + 'deg');
      b.style.setProperty('--a', lean.toFixed(1) + 'deg');
      b.style.animationDuration = (6 + Math.random() * 4).toFixed(2) + 's';
      b.style.animationDelay = (-Math.random() * 6).toFixed(2) + 's';
      layer.appendChild(b);
    }
    for (let i = 0; i < ns; i++){
      const s = document.createElement('i'); s.className = 'spot-spark';
      s.style.left = (4 + Math.random() * 92).toFixed(1) + '%'; s.style.top = (4 + Math.random() * 88).toFixed(1) + '%';
      s.style.setProperty('--z', (0.6 + Math.random() * 0.8).toFixed(2));
      s.style.setProperty('--c', colors[i % colors.length]);
      s.style.animationDuration = (4 + Math.random() * 3).toFixed(2) + 's';
      s.style.animationDelay = (-Math.random() * 7).toFixed(2) + 's';
      layer.appendChild(s);
    }
    const ref = opts.before && opts.before.parentNode === host ? opts.before : host.firstChild;
    host.insertBefore(layer, ref);
    return { el: layer, destroy(){ layer.remove(); } };
  }
  window.Spotlights = { mount };
})();
