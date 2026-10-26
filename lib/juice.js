/* FlipStax - Run 5A "juice": the shared visual pieces of the VS card, Brain Beam and Word Warp screens.

   - Sunburst.set(scheme, host): the backdrop - oversized conic-gradient rays turning slowly (one turn in 75 s, transform
     only) in a colour scheme per game ('vs', 'beam', 'warp'); low contrast, a dark vignette in the middle so text on top
     always reads. host: the element it sits in (default: the page, fixed behind the play); null hides it.
     Lite mode and reduced motion: the rays stand still.
   (The feedback effects - Juice.correct / Juice.wrong - are added below by later items.) */
(function(root){
  const els = new Map();   // host element -> its sunburst
  function make(host){
    const d = document.createElement('div');
    d.className = 'sunburst' + (host === document.body ? ' sb-page' : ' sb-in');
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<i class="sb-rays"></i><i class="sb-cone l"></i><i class="sb-cone r"></i><i class="sb-vignette"></i>';
    host.insertBefore(d, host.firstChild);
    return d;
  }
  const Sunburst = {
    // scheme: 'vs' | 'beam' | 'warp' | null; host: where (default document.body)
    set(scheme, host){
      host = host || document.body;
      let d = els.get(host);
      if (!scheme){ if (d) d.classList.remove('on'); return; }
      if (!d){ d = make(host); els.set(host, d); }
      d.dataset.sb = scheme;
      d.classList.add('on');
    },
    hideAll(){ els.forEach(d=> d.classList.remove('on')); },
  };
  root.Sunburst = Sunburst;
})(typeof window !== 'undefined' ? window : globalThis);
/* ---- 3. Feedback effects: Juice.correct(el) / Juice.wrong(el) ----
   correct(el): a bright laser sweeps across the element, a ring of bulbs chases round its border (each bulb lights about
   twice a second - well under 3 flashes a second), and a small burst of particles (at most 24). wrong(el): a quick dim
   over it and a short shake. Everything is transform and opacity on a fixed layer over the page; it never takes a tap.
   Lite mode and reduced motion: correct = a gold ring fading in and out; wrong = the dim only (no shake, no particles). */
(function(root){
  const MAX_PARTICLES = 24;
  let layer = null;
  function fx(){
    if (layer && layer.isConnected) return layer;
    layer = document.createElement('div'); layer.className = 'jc-fx'; layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer); return layer;
  }
  const quiet = ()=> document.documentElement.classList.contains('lite') || (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) || !Element.prototype.animate;
  // the element's layout box, centred where it is drawn (a tile mid-flip or mid-pop still gets its full size)
  function rectOf(el){
    const g = el.getBoundingClientRect(), w = el.offsetWidth || g.width, h = el.offsetHeight || g.height;
    const left = g.left + g.width / 2 - w / 2, top = g.top + g.height / 2 - h / 2;
    return { left, top, width:w, height:h };
  }
  function box(el, cls){
    const r = rectOf(el), b = document.createElement('div');
    b.className = 'jc-box ' + cls;
    const rad = getComputedStyle(el).borderRadius;
    b.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;border-radius:' + (parseFloat(rad) ? rad : '14px');
    fx().appendChild(b); return { b, r };
  }
  function correct(el, opts){
    if (!el || !el.getBoundingClientRect) return;
    opts = opts || {};
    const { b, r } = box(el, 'jc-correct' + (quiet() ? ' quiet' : ''));
    if (quiet()){ setTimeout(()=> b.remove(), 900); return; }
    // the laser: a bright slanted bar across the element
    b.innerHTML = '<i class="jc-clip"><i class="jc-laser"></i></i>';
    b.firstChild.firstChild.animate([{ transform:'translateX(-60%) skewX(-18deg)', opacity:0 }, { transform:'translateX(40%) skewX(-18deg)', opacity:1, offset:0.3 }, { transform:'translateX(260%) skewX(-18deg)', opacity:0 }], { duration:520, easing:'cubic-bezier(.3,0,.3,1)' });
    // the bulb chase: bulbs round the border, lit in turn
    const per = 2 * (r.width + r.height), n = Math.max(10, Math.min(28, Math.round(per / 26)));
    for (let k = 0; k < n; k++){
      let d = (k / n) * per, x, y;
      if (d < r.width){ x = d; y = 0; } else if ((d -= r.width) < r.height){ x = r.width; y = d; } else if ((d -= r.height) < r.width){ x = r.width - d; y = r.height; } else { d -= r.width; x = 0; y = r.height - d; }
      const i = document.createElement('i'); i.className = 'jc-bulb'; i.style.left = x + 'px'; i.style.top = y + 'px';
      i.style.animationDelay = (-(k % 4) * 0.12) + 's';
      b.appendChild(i);
    }
    burstAt(r, opts.count || 18);
    setTimeout(()=> b.remove(), 1300);
  }
  // a small burst of particles (at most 24) from the middle of a rect
  function burstAt(r, count){
    const cnt = Math.min(MAX_PARTICLES, count || 18), L = fx(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const colors = ['#ffd23f', '#7df9ff', '#ff3c9d', '#ffffff'];
    for (let k = 0; k < cnt; k++){
      const p = document.createElement('i'); p.className = 'jc-spark'; p.style.left = cx + 'px'; p.style.top = cy + 'px'; p.style.background = colors[k % colors.length];
      L.appendChild(p);
      const a = (k / cnt) * Math.PI * 2 + Math.random() * 0.4, dist = 50 + Math.random() * Math.min(110, r.width * 0.5);
      p.animate([{ transform:'translate(-50%, -50%) scale(1)', opacity:1 }, { transform:'translate(calc(-50% + ' + (Math.cos(a) * dist).toFixed(1) + 'px), calc(-50% + ' + (Math.sin(a) * dist).toFixed(1) + 'px)) scale(0.3)', opacity:0 }],
        { duration:600 + Math.random() * 250, easing:'cubic-bezier(.2,.8,.3,1)' }).onfinish = ()=> p.remove();
    }
  }
  // burst(el): particles only (the VS winner); nothing in lite mode or reduced motion
  function burst(el, opts){
    if (!el || !el.getBoundingClientRect || quiet()) return;
    burstAt(rectOf(el), (opts || {}).count);
  }
  function wrong(el){
    if (!el || !el.getBoundingClientRect) return;
    const { b } = box(el, 'jc-wrong');
    b.animate([{ opacity:0 }, { opacity:1, offset:0.25 }, { opacity:0 }], { duration:520, easing:'ease-out' }).onfinish = ()=> b.remove();
    if (!quiet()) el.animate([{ transform:'translateX(0)' }, { transform:'translateX(-7px)' }, { transform:'translateX(6px)' }, { transform:'translateX(-4px)' }, { transform:'translateX(2px)' }, { transform:'translateX(0)' }], { duration:300, easing:'ease-out' });
  }
  // ripple(container, items): a light ripple - the items hop in a wave, left to right, and a soft band of light crosses
  // the container (Word Warp: a guess that locks new letters). Nothing in lite mode or reduced motion.
  function ripple(container, items){
    if (!container || quiet()) return;
    Array.from(items || container.children).forEach((it, k)=>{
      it.animate([{ transform:'translateY(0) scale(1)' }, { transform:'translateY(-7px) scale(1.08)', offset:0.4 }, { transform:'translateY(0) scale(1)' }], { duration:300, delay:k * 45, easing:'ease-out' });
    });
    const { b } = box(container, 'jc-ripple');
    b.innerHTML = '<i class="jc-clip"><i class="jc-band"></i></i>';
    b.firstChild.firstChild.animate([{ transform:'translateX(-100%)', opacity:0 }, { transform:'translateX(30%)', opacity:1, offset:0.35 }, { transform:'translateX(220%)', opacity:0 }], { duration:560, easing:'ease-in-out' }).onfinish = ()=> b.remove();
  }
  // flash(el, color): ONE soft flash over the element (opacity only) - the right answer's gold flash.
  function flash(el, color){
    if (!el || !el.getBoundingClientRect) return;
    const { b } = box(el, 'jc-flash');
    b.style.background = 'radial-gradient(circle at 50% 50%, ' + (color || 'rgba(255,224,102,0.95)') + ', rgba(255,210,63,0.35) 70%, rgba(255,210,63,0))';
    if (!b.animate){ setTimeout(()=> b.remove(), 400); return; }
    b.animate([{ opacity:0 }, { opacity:0.95, offset:0.3 }, { opacity:0 }], { duration:quiet() ? 300 : 420, easing:'ease-out' }).onfinish = ()=> b.remove();
  }
  // trace(el, color): a light travels once round the element's border (a lit dot with a short tail, transform only) -
  // the right answer, shown after a miss. Lite mode and reduced motion: the border glows once, no travel.
  function trace(el, color, ms){
    if (!el || !el.getBoundingClientRect) return;
    color = color || '#5dff8a'; ms = ms || 1100;
    const { b, r } = box(el, 'jc-trace');
    if (quiet() || !b.animate){
      b.style.boxShadow = '0 0 0 4px ' + color + ', 0 0 18px 4px ' + color;
      if (b.animate) b.animate([{ opacity:0 }, { opacity:1, offset:0.3 }, { opacity:0 }], { duration:700, easing:'ease-out' });
      setTimeout(()=> b.remove(), 800); return;
    }
    const inset = 2, rad = Math.min(18, r.height / 2 - 2), w = r.width - inset * 2, h = r.height - inset * 2;
    const arcs = [w - 2 * rad, Math.PI * rad / 2, h - 2 * rad, Math.PI * rad / 2, w - 2 * rad, Math.PI * rad / 2, h - 2 * rad, Math.PI * rad / 2], total = arcs.reduce((a, c)=> a + c, 0);
    const at = d=>{   // a point d along the perimeter, clockwise from the top edge's start
      d = ((d % total) + total) % total; let i = 0; while (d > arcs[i]){ d -= arcs[i]; i = (i + 1) % arcs.length; }
      const L = arcs[i], k = L ? d / L : 0, a = k * Math.PI / 2;
      switch (i){
        case 0: return [inset + rad + d, inset];
        case 1: return [inset + w - rad + Math.sin(a) * rad, inset + rad - Math.cos(a) * rad];
        case 2: return [inset + w, inset + rad + d];
        case 3: return [inset + w - rad + Math.cos(a) * rad, inset + h - rad + Math.sin(a) * rad];
        case 4: return [inset + w - rad - d, inset + h];
        case 5: return [inset + rad - Math.sin(a) * rad, inset + h - rad + Math.cos(a) * rad];
        case 6: return [inset, inset + h - rad - d];
        default: return [inset + rad - Math.cos(a) * rad, inset + rad - Math.sin(a) * rad];
      }
    };
    const N = 48;
    [0, 0.045, 0.09, 0.135].forEach((lag, k)=>{
      const dot = document.createElement('i'); dot.className = 'jc-trace-dot'; dot.style.background = color; dot.style.opacity = String(1 - k * 0.22);
      dot.style.width = dot.style.height = (13 - k * 2) + 'px'; b.appendChild(dot);
      const frames = []; for (let s = 0; s <= N; s++){ const p = at(total * (s / N) - total * lag); frames.push({ transform:'translate(' + (p[0] - 6) + 'px,' + (p[1] - 6) + 'px)' }); }
      dot.animate(frames, { duration:ms, easing:'linear', fill:'both' });
    });
    setTimeout(()=> b.remove(), ms + 120);
  }
  // electric(el, { color, arcs }): the neon outline an answer gets - ONE electric effect at a time (a new call, or
  // electricOff(), clears the last). A bright spark travels once round the border (a rotating conic gradient on one overlay,
  // transform only), arcs (3 pre-made SVG zigzags, swapped at most 3 times a second for about 1.2 s) flicker at the edges when
  // opts.arcs, then the outline settles into a steady glow with a slow pulse (opacity, one cycle in 2 s). Lite mode and
  // reduced motion: just the steady outline.
  const ARC_SVG = [
    '<svg viewBox="0 0 44 26" width="44" height="26" aria-hidden="true"><polyline points="1,20 10,6 17,17 26,3 34,15 43,5" fill="none" stroke="#7df9ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/><polyline points="1,20 10,6 17,17 26,3 34,15 43,5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 44 26" width="44" height="26" aria-hidden="true"><polyline points="2,6 12,19 19,5 27,21 35,8 42,18" fill="none" stroke="#7df9ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/><polyline points="2,6 12,19 19,5 27,21 35,8 42,18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '<svg viewBox="0 0 44 26" width="44" height="26" aria-hidden="true"><polyline points="1,13 9,4 15,20 24,6 31,22 43,9" fill="none" stroke="#7df9ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/><polyline points="1,13 9,4 15,20 24,6 31,22 43,9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ];
  let neon = null;
  function electricOff(){
    if (!neon) return;
    clearInterval(neon.t); clearTimeout(neon.t2); neon.nodes.forEach(n=> n.remove()); neon = null;
  }
  function electric(el, opts){
    electricOff();
    if (!el) return;
    opts = opts || {};
    const color = opts.color || '#ffe066', nodes = [];
    const add = (cls, html)=>{ const i = document.createElement('i'); i.className = cls; i.style.setProperty('--ne', color); if (html) i.innerHTML = html; el.appendChild(i); nodes.push(i); return i; };
    add('ne-glow' + (quiet() ? ' still' : ''));
    neon = { nodes, t:0, t2:0 };
    if (quiet()) return;
    const wrap = add('ne-spin-wrap'); wrap.innerHTML = '<i class="ne-spin"></i>';
    const spin = wrap.firstChild;
    if (spin.animate) spin.animate([{ transform:'translate(-50%, -50%) rotate(0deg)' }, { transform:'translate(-50%, -50%) rotate(360deg)' }], { duration:1200, easing:'linear' });
    if (wrap.animate) wrap.animate([{ opacity:1 }, { opacity:1, offset:0.85 }, { opacity:0 }], { duration:1300, fill:'forwards' });
    if (opts.arcs){
      const arcs = ARC_SVG.map((svg, k)=>{ const a = add('ne-arc a' + k, svg); a.style.opacity = '0'; return a; });
      const states = [[0, 2], [1], [0, 1], [2]]; let s = 0;
      const step = ()=>{ if (!neon) return; arcs.forEach((a, k)=> a.style.opacity = states[s] && states[s].indexOf(k) >= 0 ? '1' : '0'); s++; if (s > states.length){ clearInterval(neon.t); arcs.forEach(a=> a.remove()); } };
      step(); neon.t = setInterval(step, 340);   // (3 swaps a second at most, about 1.2 s)
    }
  }
  root.Juice = Object.assign(root.Juice || {}, { correct, wrong, burst, ripple, flash, trace, electric, electricOff, MAX_PARTICLES });
})(typeof window !== 'undefined' ? window : globalThis);
