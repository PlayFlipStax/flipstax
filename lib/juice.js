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
    d.innerHTML = '<i class="sb-rays"></i><i class="sb-vignette"></i>';
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
  root.Juice = Object.assign(root.Juice || {}, { correct, wrong, burst, ripple, MAX_PARTICLES });
})(typeof window !== 'undefined' ? window : globalThis);
