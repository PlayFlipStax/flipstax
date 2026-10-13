/* FlipStax - the game-show animation helpers (window.FX), shared by the
   game (flipstax.html) and the style board (style-board/a.html); their
   styles are in lib/show.css. Marquee frames (style board only), correct /
   wrong flashes, bursts, ambient confetti,
   the UFO (pass, beam up, beam down, blast) and the alien's moods, plus
   sound blips. Rules kept everywhere:
   - only transform and opacity are animated;
   - particles are capped (FX.MAX_PARTICLES live at once);
   - a screen scrolled out of view, or a hidden tab, pauses its motion;
   - prefers-reduced-motion (or the board's "Reduce motion" switch) skips
     movement and shows end states instead;
   - sound only plays when the board's sound switch is on (off by default);
     the game routes FX.sound to its own sounds and mute (FX.soundHook). */
(function(){
  const FX = window.FX = {};
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches:false };
  FX.MAX_PARTICLES = 90;
  FX.muted = true;
  FX.reduced = ()=> mq.matches || document.documentElement.classList.contains('rm');
  FX.theme = { burst:['#ffd23f', '#ff8a1f', '#ff3cac', '#7df9ff', '#ffffff'], shapes:['star', 'coin', 'strip'] };   // each direction overrides
  let live = 0;

  // ---------- pause when hidden ----------
  // .offscreen pauses CSS animations (see the tokens block); JS loops ask FX.awake(screen).
  FX.awake = (screen)=> !document.hidden && !(screen && screen.classList.contains('offscreen'));
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es=> es.forEach(e=> e.target.classList.toggle('offscreen', !e.isIntersecting)), { rootMargin:'80px' }) : null;
  FX.watch = (screen)=>{ if (io) io.observe(screen); };
  document.addEventListener('visibilitychange', ()=> document.documentElement.classList.toggle('tab-hidden', document.hidden));

  // ---------- marquee frame ----------
  // Bulbs evenly round the frame's edge; the chase is a CSS opacity animation
  // staggered by --i. flash(frame, 'win' | 'lose') swaps the whole ring.
  FX.marquee = (frame, spacing)=>{
    const ring = frame.querySelector('.marquee'); if (!ring) return;
    ring.innerHTML = '';
    const w = frame.clientWidth, h = frame.clientHeight, gap = spacing || 26, inset = 9;
    const per = (len)=> Math.max(2, Math.round(len / gap));
    const pts = [];
    const nx = per(w - 2 * inset), ny = per(h - 2 * inset);
    for (let i = 0; i < nx; i++) pts.push([inset + (w - 2 * inset) * i / nx, inset]);
    for (let i = 0; i < ny; i++) pts.push([w - inset, inset + (h - 2 * inset) * i / ny]);
    for (let i = 0; i < nx; i++) pts.push([w - inset - (w - 2 * inset) * i / nx, h - inset]);
    for (let i = 0; i < ny; i++) pts.push([inset, h - inset - (h - 2 * inset) * i / ny]);
    pts.forEach(([x, y], i)=>{ const b = document.createElement('i'); b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; b.style.setProperty('--i', i % 4); ring.appendChild(b); });
  };
  FX.flash = (frame, kind)=>{
    frame.classList.remove('flash-win', 'flash-lose'); void frame.offsetWidth;
    frame.classList.add(kind === 'win' ? 'flash-win' : 'flash-lose');
    clearTimeout(frame._flashT); frame._flashT = setTimeout(()=> frame.classList.remove('flash-win', 'flash-lose'), 1100);
    if (kind !== 'win') FX.shake(frame.querySelector('.stage') || frame);
  };
  FX.shake = (el)=>{ if (FX.reduced() || !el.animate) return; el.animate([{ transform:'translateX(0)' }, { transform:'translateX(-9px)' }, { transform:'translateX(8px)' }, { transform:'translateX(-6px)' }, { transform:'translateX(4px)' }, { transform:'translateX(0)' }], { duration:420, easing:'ease-out' }); };
  FX.pop = (el, scale)=>{ if (FX.reduced() || !el.animate) return; el.animate([{ transform:'scale(1)' }, { transform:'scale(' + (scale || 1.12) + ')' }, { transform:'scale(1)' }], { duration:320, easing:'cubic-bezier(.3,1.6,.5,1)' }); };

  // ---------- bursts ----------
  // Particles fly out from (x, y) in the layer's coordinates. Shapes come from
  // the theme: star (svg), coin and strip (styled boxes).
  const SHAPES = {
    star:'<svg viewBox="0 0 20 20"><path d="M10 0l3 7 7 .6-5.3 4.6L16.3 20 10 16.3 3.7 20l1.6-7.8L0 7.6 7 7z"/></svg>',
  };
  FX.burst = (layer, x, y, opts)=>{
    if (FX.reduced() || !layer || !layer.animate) return;
    opts = opts || {};
    const n = Math.min(opts.count || 22, FX.MAX_PARTICLES - live); if (n <= 0) return;
    const colors = opts.colors || FX.theme.burst, shapes = opts.shapes || FX.theme.shapes;
    for (let i = 0; i < n; i++){
      const p = document.createElement('i'), shape = shapes[i % shapes.length], c = colors[i % colors.length];
      p.className = 'fx-p fx-' + shape;
      if (SHAPES[shape]){ p.innerHTML = SHAPES[shape]; p.style.color = c; } else p.style.background = c;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      layer.appendChild(p); live++;
      const a = Math.random() * Math.PI * 2, d = (opts.spread || 120) * (0.45 + Math.random() * 0.75), rot = (Math.random() - 0.5) * 720;
      const dx = Math.cos(a) * d, dy = Math.sin(a) * d - 30, fall = 60 + Math.random() * 80;
      p.animate([
        { transform:'translate(-50%,-50%) scale(0.4) rotate(0deg)', opacity:1 },
        { transform:'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1) rotate(' + rot / 2 + 'deg)', opacity:1, offset:0.45 },
        { transform:'translate(calc(-50% + ' + dx * 1.15 + 'px), calc(-50% + ' + (dy + fall) + 'px)) scale(0.8) rotate(' + rot + 'deg)', opacity:0 },
      ], { duration: 900 + Math.random() * 500, easing:'cubic-bezier(.2,.7,.3,1)' }).onfinish = ()=>{ p.remove(); live--; };
    }
  };
  FX.burstAt = (layer, el, opts)=>{ const l = layer.getBoundingClientRect(), r = el.getBoundingClientRect(); FX.burst(layer, r.left - l.left + r.width / 2, r.top - l.top + r.height / 2, opts); };

  // ---------- tap effects (A5: varied, by weight of the moment) ----------
  //   routine tap   -> FX.ripple (a ring) or FX.spark (a few dots) - each game picks its own (FX.tapFx)
  //   correct       -> FX.glowSweep (a gold sweep across the thing) + a star burst
  //   streak / big  -> coins (FX.burst shapes:['coin'])
  //   biggest       -> FX.confetti burst (results, end of a game) - nothing else uses confetti
  //   wrong         -> FX.flash(frame, 'lose') (soft shake + red edge)
  FX.ripple = (layer, x, y, color, size)=>{
    if (FX.reduced() || !layer.animate) return;
    const r = document.createElement('i'); r.className = 'fx-ripple'; r.style.left = x + 'px'; r.style.top = y + 'px';
    r.style.borderColor = color || '#fff3c4'; r.style.width = r.style.height = (size || 70) + 'px'; r.style.margin = (-(size || 70) / 2) + 'px 0 0 ' + (-(size || 70) / 2) + 'px';
    layer.appendChild(r);
    r.animate([{ transform:'scale(0.2)', opacity:0.95 }, { transform:'scale(1)', opacity:0 }], { duration:460, easing:'cubic-bezier(.2,.8,.3,1)' }).onfinish = ()=> r.remove();
  };
  FX.spark = (layer, x, y, color)=> FX.burst(layer, x, y, { count:6, spread:30, colors:[color || '#fff3c4'], shapes:['dot'] });
  FX.glowSweep = (layer, el)=>{
    if (FX.reduced() || !layer.animate) return;
    const l = layer.getBoundingClientRect(), r = el.getBoundingClientRect();
    const w = document.createElement('i'); w.className = 'fx-sweep';
    w.style.left = (r.left - l.left) + 'px'; w.style.top = (r.top - l.top) + 'px'; w.style.width = r.width + 'px'; w.style.height = r.height + 'px'; w.style.borderRadius = getComputedStyle(el).borderRadius;
    w.innerHTML = '<b></b>'; layer.appendChild(w);
    w.firstChild.animate([{ transform:'translateX(-120%) skewX(-20deg)' }, { transform:'translateX(260%) skewX(-20deg)' }], { duration:650, easing:'ease-in-out' }).onfinish = ()=> w.remove();
  };
  FX.winBurst = (layer, el)=>{ FX.glowSweep(layer, el); FX.burstAt(layer, el, { count:14, spread:110, shapes:['star'], colors:['#ffd23f', '#fff3c4', '#ffb21f'] }); };
  FX.coinShower = (layer, n)=>{ const W = layer.clientWidth; for (let k = 0; k < (n || 3); k++) setTimeout(()=>{ FX.burst(layer, W * (0.25 + 0.25 * k), 30, { count:9, spread:90, shapes:['coin'] }); FX.sound('coin'); }, k * 220); };
  FX.confettiBurst = (layer)=>{ const W = layer.clientWidth; [0.2, 0.5, 0.8].forEach((f, k)=> setTimeout(()=> FX.burst(layer, W * f, 20, { count:18, spread:140, shapes:['strip', 'star'] }), k * 160)); };
  // One signature tap per game (name -> effect), for routine taps.
  FX.tapFx = (kind, layer, x, y)=>{
    const t = { ring:()=> FX.ripple(layer, x, y), pink:()=> FX.ripple(layer, x, y, '#ff7cc4', 80), blue:()=> FX.spark(layer, x, y, '#9fdcff'), gold:()=>{ FX.ripple(layer, x, y, '#ffd23f', 60); FX.spark(layer, x, y, '#ffe680'); },
      orange:()=> FX.ripple(layer, x, y, '#ffb35f', 54), coin:()=> FX.burst(layer, x, y, { count:3, spread:34, shapes:['coin'] }), purple:()=> FX.ripple(layer, x, y, '#c792ff', 76),
      sparkle:()=> FX.burst(layer, x, y, { count:5, spread:40, shapes:['star'], colors:['#fff6c2', '#ffe24a'] }), teal:()=>{ FX.ripple(layer, x, y, '#7ff5ea', 56); setTimeout(()=> FX.ripple(layer, x, y, '#7ff5ea', 84), 90); },
      zap:()=> FX.spark(layer, x, y, '#5ff8ff') };
    (t[kind] || t.ring)();
  };

  // ---------- ambient confetti ----------
  // A few slow drifting pieces per screen (CSS keyframes on transform);
  // they stop with the screen's other motion when it's out of view.
  FX.confetti = (layer, n)=>{
    const colors = FX.theme.burst;
    for (let i = 0; i < (n || 10); i++){
      const p = document.createElement('i'); p.className = 'drift';
      p.style.left = (Math.random() * 100).toFixed(1) + '%';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dur', (9 + Math.random() * 9).toFixed(1) + 's');
      p.style.setProperty('--delay', (-Math.random() * 18).toFixed(1) + 's');
      p.style.setProperty('--sway', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
      p.style.setProperty('--spin', (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 360) + 'deg');
      layer.appendChild(p);
    }
  };

  // ---------- the UFO and the alien ----------
  FX.ufoSvg = ()=> '<svg class="ufo-svg" viewBox="0 0 120 70" aria-hidden="true">' +
    '<ellipse class="ufo-dome" cx="60" cy="28" rx="24" ry="20"/><ellipse class="ufo-dome-shine" cx="52" cy="20" rx="7" ry="5"/>' +
    '<ellipse class="ufo-body" cx="60" cy="40" rx="56" ry="15"/><ellipse class="ufo-rim" cx="60" cy="36" rx="50" ry="7"/>' +
    '<circle class="ufo-light l1" cx="22" cy="42" r="4"/><circle class="ufo-light l2" cx="42" cy="47" r="4"/><circle class="ufo-light l3" cx="60" cy="49" r="4"/><circle class="ufo-light l2" cx="78" cy="47" r="4"/><circle class="ufo-light l1" cx="98" cy="42" r="4"/></svg>';
  FX.alienSvg = ()=> '<svg class="alien-svg" viewBox="0 0 80 90" aria-hidden="true">' +
    '<line class="al-ant" x1="28" y1="18" x2="20" y2="4"/><line class="al-ant" x1="52" y1="18" x2="60" y2="4"/><circle class="al-ant-tip" cx="20" cy="4" r="4"/><circle class="al-ant-tip" cx="60" cy="4" r="4"/>' +
    '<ellipse class="al-head" cx="40" cy="40" rx="30" ry="27"/><ellipse class="al-eye" cx="29" cy="38" rx="8" ry="10"/><ellipse class="al-eye" cx="51" cy="38" rx="8" ry="10"/>' +
    '<circle class="al-shine" cx="31" cy="34" r="3"/><circle class="al-shine" cx="53" cy="34" r="3"/><path class="al-mouth" d="M31 54 Q40 61 49 54"/>' +
    '<ellipse class="al-body" cx="40" cy="80" rx="16" ry="10"/></svg>';
  // mood: 'cheer' | 'sad' | 'idle'
  FX.alien = (el, mood)=>{ if (!el) return; el.classList.remove('cheer', 'sad'); void el.offsetWidth; if (mood && mood !== 'idle') el.classList.add(mood); clearTimeout(el._t); el._t = setTimeout(()=> el.classList.remove('cheer', 'sad'), 1600); };

  // The UFO glides across a screen now and then (ambient).
  FX.ufoPasses = (screen, layer)=>{
    const u = document.createElement('div'); u.className = 'ufo ufo-pass'; u.innerHTML = FX.ufoSvg(); layer.appendChild(u);
    const go = ()=>{
      if (FX.awake(screen) && !FX.reduced() && !screen.classList.contains('busy')){
        const W = layer.clientWidth, y = 40 + Math.random() * 90, ltr = Math.random() < 0.5;
        u.animate([{ transform:'translate(' + (ltr ? -90 : W + 10) + 'px,' + y + 'px) rotate(' + (ltr ? 6 : -6) + 'deg)', opacity:1 },
                   { transform:'translate(' + (W / 2 - 40) + 'px,' + (y - 14) + 'px) rotate(0deg)', opacity:1, offset:0.5 },
                   { transform:'translate(' + (ltr ? W + 10 : -90) + 'px,' + y + 'px) rotate(' + (ltr ? -6 : 6) + 'deg)', opacity:1 }],
                  { duration:5200, easing:'ease-in-out' });
      }
      screen._ufoT = setTimeout(go, 9000 + Math.random() * 7000);
    };
    screen._ufoT = setTimeout(go, 1500 + Math.random() * 5000);
  };

  // The mascot UFO flies over an element and beams it up (up = true) or a
  // new thing down onto it. Resolves when done. With reduced motion it just
  // resolves (the caller shows the end state).
  FX.beam = (layer, target, up)=> new Promise(res=>{
    if (FX.reduced() || !layer.animate){ res(); return; }
    const l = layer.getBoundingClientRect(), r = target.getBoundingClientRect();
    const cx = r.left - l.left + r.width / 2, top = Math.max(6, r.top - l.top - 96);
    const u = document.createElement('div'); u.className = 'ufo ufo-beamer'; u.innerHTML = FX.ufoSvg() + '<i class="beam"></i>';
    u.style.setProperty('--beam-h', Math.max(40, r.top - l.top + r.height - top - 46) + 'px');
    layer.appendChild(u); FX.sound('beam');
    const at = 'translate(' + (cx - 45) + 'px,' + top + 'px)';
    u.animate([{ transform:'translate(' + (cx - 45) + 'px,-90px)' }, { transform:at }], { duration:420, easing:'cubic-bezier(.2,.9,.3,1.1)', fill:'forwards' });
    setTimeout(()=>{
      u.classList.add('on');
      if (up) target.animate([{ transform:'none', opacity:1 }, { transform:'translateY(-' + (r.top - l.top - top) + 'px) scale(0.3)', opacity:0 }], { duration:700, easing:'ease-in', fill:'forwards' });
      else target.animate([{ transform:'translateY(-80px) scale(0.4)', opacity:0 }, { transform:'none', opacity:1 }], { duration:600, easing:'cubic-bezier(.2,.9,.3,1.2)', fill:'forwards' });
    }, 380);
    setTimeout(()=>{ u.classList.remove('on'); u.animate([{ transform:at }, { transform:'translate(' + (cx - 45) + 'px,-110px)' }], { duration:420, easing:'ease-in', fill:'forwards' }).onfinish = ()=>{ u.remove(); res(); }; }, 1250);
  });
  // The UFO flies over a set of elements (a word in Word Hunt), shines its
  // beam down over all of them, and each one bursts in turn. Resolves when
  // it has gone; with reduced motion it resolves at once.
  FX.beamHit = (layer, els)=> new Promise(res=>{
    if (FX.reduced() || !layer.animate || !els.length){ res(); return; }
    const l = layer.getBoundingClientRect(), rs = els.map(e=> e.getBoundingClientRect());
    const left = Math.min(...rs.map(r=> r.left)) - l.left, right = Math.max(...rs.map(r=> r.right)) - l.left;
    const topY = Math.min(...rs.map(r=> r.top)) - l.top, botY = Math.max(...rs.map(r=> r.bottom)) - l.top;
    const cx = (left + right) / 2, top = Math.max(4, topY - 70);
    const u = document.createElement('div'); u.className = 'ufo ufo-beamer'; u.innerHTML = FX.ufoSvg() + '<i class="beam"></i>';
    u.style.setProperty('--beam-h', Math.max(40, botY - top - 36) + 'px');
    u.style.setProperty('--beam-w', Math.max(90, right - left + 40) + 'px');
    layer.appendChild(u); FX.sound('beam');
    const at = 'translate(' + (cx - 45) + 'px,' + top + 'px)';
    u.animate([{ transform:'translate(' + (cx - 45) + 'px,-90px)' }, { transform:at }], { duration:380, easing:'cubic-bezier(.2,.9,.3,1.1)', fill:'forwards' });
    setTimeout(()=> u.classList.add('on'), 340);
    els.forEach((e, k)=> setTimeout(()=>{ FX.burstAt(layer, e, { count:7, spread:44 }); FX.sound('zap'); }, 560 + k * 80));
    setTimeout(()=>{ res(); u.classList.remove('on'); u.animate([{ transform:at }, { transform:'translate(' + (cx - 45) + 'px,-110px)' }], { duration:380, easing:'ease-in', fill:'forwards' }).onfinish = ()=> u.remove(); }, 640 + els.length * 80);
  });
  // A quick laser zap from the UFO to each element.
  FX.blast = (layer, els)=>{
    if (FX.reduced()) return;
    const l = layer.getBoundingClientRect();
    els.forEach((el, k)=> setTimeout(()=>{
      const r = el.getBoundingClientRect(), x = r.left - l.left + r.width / 2, y = r.top - l.top + r.height / 2;
      const z = document.createElement('i'); z.className = 'zap'; z.style.left = x + 'px'; z.style.height = y + 'px'; layer.appendChild(z);
      z.animate([{ opacity:0, transform:'scaleY(0.2)' }, { opacity:1, transform:'scaleY(1)', offset:0.3 }, { opacity:0, transform:'scaleY(1)' }], { duration:260, easing:'ease-out' }).onfinish = ()=> z.remove();
      FX.burst(layer, x, y, { count:6, spread:40 }); FX.sound('zap');
    }, k * 90));
  };

  // ---------- count up ----------
  FX.countUp = (el, to, ms, from)=>{
    from = from || 0; if (FX.reduced() || !ms){ el.textContent = to.toLocaleString(); return; }
    const t0 = performance.now();
    (function f(now){ const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3); el.textContent = Math.round(from + (to - from) * e).toLocaleString(); if (t < 1) requestAnimationFrame(f); })(t0);
  };

  // ---------- sound ----------
  let ac = null;
  const tone = (f, t, d, type, v)=>{ const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, ac.currentTime + t);
    g.gain.setValueAtTime(0.0001, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(v || 0.08, ac.currentTime + t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + d);
    o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + d + 0.02); };
  FX.soundHook = null;   // the game sets this: (kind) => plays it through its own mixer (and mute)
  FX.sound = (kind)=>{
    if (FX.soundHook){ FX.soundHook(kind); return; }
    if (FX.muted) return;
    try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); }catch(e){ return; }
    if (kind === 'win'){ [523, 659, 784, 1047].forEach((f, i)=> tone(f, i * 0.07, 0.22, 'triangle', 0.07)); }
    else if (kind === 'lose'){ tone(196, 0, 0.18, 'sawtooth', 0.05); tone(147, 0.16, 0.3, 'sawtooth', 0.05); }
    else if (kind === 'tap'){ tone(880, 0, 0.06, 'square', 0.03); }
    else if (kind === 'beam'){ const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(300, ac.currentTime); o.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.7);
      g.gain.setValueAtTime(0.04, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.8); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.82); }
    else if (kind === 'zap'){ tone(1400, 0, 0.05, 'square', 0.03); tone(700, 0.04, 0.06, 'square', 0.02); }
    else if (kind === 'coin'){ tone(1568, 0, 0.08, 'square', 0.03); tone(2093, 0.06, 0.12, 'square', 0.03); }
    else if (kind === 'tick'){ tone(1200, 0, 0.025, 'square', 0.02); }
  };
})();
