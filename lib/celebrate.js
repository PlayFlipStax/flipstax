/* FlipStax - the shared BIG WIN CELEBRATION and the gentle LOSS (fix 6), for Word Warp, ZiG Zap ZaBam!, Alien Blast and Space Launch.
   Celebrate.win({ word, wordTop, perfect, scoreEl, from, to, plus, sfx, done })   (wordTop: where the big word sits, '42%' by default)
     1. a 0.15 s freeze, then the frame's marquee bulbs chase round twice;
     2. a huge cream-and-gold word slams in at the centre (scale 0.4 > 1.15 > 1.0 over 0.5 s) with a ring of sparkles;
     3. confetti in cyan, magenta, gold and green rains from the top for about 3 s, in two bursts;
     4. five laser bars fan up from the bottom and sweep slowly (rotate only) for about 2.5 s;
     5. two spotlight cones swing from the top corners while the stage lights brighten in a chase (opacity, under 3 flashes a second);
     6. four-point sparkles pop and twinkle all over, a few larger ones near the word;
     7. Flip waves (no bouncing);
     8. the score pill counts up with a pulse and the +N floats up. It settles in about 4 s, then done() - the next screen takes over.
     PERFECT: a gold ring burst and the PERFECT banner on top.
   Celebrate.loss({ word, scoreEl, to, sfx, done })
     the lights dim to about 55% over 0.4 s under a soft violet wash, Flip shrugs, a drooping word drops in and settles with a small bounce, a few slow
     grey-blue sparkles drift down, a soft wah; the score pill shows the consolation points; after about 2.5 s it fades through to done().
   Transform and opacity only (no animated blur or shadows). Lite mode and reduced motion: plain fades, the word and the score only. */
(function(){
  const C = window.Celebrate = {};
  const quiet = ()=> document.documentElement.classList.contains('lite') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || !Element.prototype.animate;
  const mk = (tag, cls, parent)=>{ const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  const pose = (p)=>{ try{ if (window.Host && Host.poseAll) Host.poseAll(p); }catch(e){} };
  const COLORS = ['#27e6ff', '#ff3fb5', '#f5b83a', '#35f08a', '#ffe27a'];
  const layerOf = (kind)=>{ document.querySelectorAll('.bw-layer').forEach(n=> n.remove()); const L = mk('div', 'bw-layer ' + kind, document.body); L.setAttribute('aria-hidden', 'true'); return L; };
  // the score pill: counts up with a pulse; the +N floats up from it
  const scoreUp = (o, ms)=>{
    const el = o.scoreEl; if (!el || o.to == null) return;
    const from = o.from != null ? o.from : 0, to = o.to;
    if (quiet() || !ms){ el.textContent = to.toLocaleString(); }
    else { const t0 = performance.now(); (function f(now){ const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3); el.textContent = Math.round(from + (to - from) * e).toLocaleString(); if (t < 1) requestAnimationFrame(f); })(t0);
      el.animate([{ transform:'scale(1)' }, { transform:'scale(1.22)', offset:0.3 }, { transform:'scale(1)' }], { duration:Math.min(900, ms), easing:'ease-out' }); }
    if (o.plus){ const r = el.getBoundingClientRect(), p = mk('div', 'bw-plus', document.body); p.textContent = '+' + o.plus; p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = r.top + 'px';
      if (quiet()) setTimeout(()=> p.remove(), 1400);
      else p.animate([{ transform:'translate(-50%, 0) scale(0.6)', opacity:0 }, { transform:'translate(-50%, -26px) scale(1.1)', opacity:1, offset:0.25 }, { transform:'translate(-50%, -90px) scale(1)', opacity:0 }], { duration:1500, easing:'ease-out', fill:'both' }).onfinish = ()=> p.remove(); }
  };
  // a four-point star at (x, y)
  const sparkle = (L, x, y, size, delay, color)=>{
    const s = mk('i', 'bw-spark', L); s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.width = s.style.height = size + 'px'; if (color) s.style.background = color;
    s.animate([{ transform:'translate(-50%,-50%) scale(0) rotate(0deg)', opacity:0 }, { transform:'translate(-50%,-50%) scale(1.2) rotate(45deg)', opacity:1, offset:0.3 }, { transform:'translate(-50%,-50%) scale(0.7) rotate(70deg)', opacity:0.8, offset:0.6 },
      { transform:'translate(-50%,-50%) scale(0) rotate(90deg)', opacity:0 }], { duration:900 + Math.random() * 500, delay, easing:'ease-out', fill:'both' });
  };
  C.win = (o)=>{
    o = o || {};
    const L = layerOf('win'), W = innerWidth, H = innerHeight, q = quiet();
    const end = ()=>{ if (L._done) return; L._done = true; L.animate ? L.animate([{ opacity:1 }, { opacity:0 }], { duration:300, fill:'forwards' }).onfinish = ()=>{ L.remove(); o.done && o.done(); } : (L.remove(), o.done && o.done()); };
    const word = mk('div', 'bw-word', L); word.textContent = o.word || 'YOU WIN!'; if (o.wordTop) word.style.top = o.wordTop;
    if (q){
      word.animate && word.animate([{ opacity:0 }, { opacity:1 }], { duration:300, fill:'both' });
      if (o.perfect){ const b = mk('div', 'bb-banner big bw-perfect', L); b.textContent = 'PERFECT!'; }
      pose('wave'); if (o.sfx && o.sfx.cheer) o.sfx.cheer(); scoreUp(o, 0);
      setTimeout(end, 2400); return { end };
    }
    word.style.opacity = 0;
    const cones = [mk('i', 'bw-cone l', L), mk('i', 'bw-cone r', L)], glow = mk('i', 'bw-glow', L);
    setTimeout(()=>{
      // 1. the frame bulbs chase round twice
      const mq = document.getElementById('showMarquee');
      if (mq){ const bs = mq.querySelectorAll('i'); bs.forEach((b, i)=> b.style.setProperty('--p', (i / Math.max(1, bs.length)).toFixed(3))); mq.classList.remove('bw-chase'); void mq.offsetWidth; mq.classList.add('bw-chase'); setTimeout(()=> mq.classList.remove('bw-chase'), 1800); }
      // 2. the word slams in, with a ring of sparkles
      word.animate([{ transform:'translate(-50%,-50%) scale(0.4)', opacity:0 }, { transform:'translate(-50%,-50%) scale(1.15)', opacity:1, offset:0.6 }, { transform:'translate(-50%,-50%) scale(1)', opacity:1 }], { duration:500, easing:'cubic-bezier(.2,.9,.3,1.2)', fill:'both' });
      const cx = W / 2, cy = H * (o.wordTop ? parseFloat(o.wordTop) / 100 : 0.42);
      for (let k = 0; k < 12; k++){ const a = k / 12 * Math.PI * 2, s = mk('i', 'bw-spark', L); s.style.left = cx + 'px'; s.style.top = cy + 'px'; s.style.width = s.style.height = '16px';
        s.animate([{ transform:'translate(-50%,-50%) scale(0.2)', opacity:0 }, { transform:'translate(calc(-50% + ' + Math.cos(a) * 70 + 'px), calc(-50% + ' + Math.sin(a) * 50 + 'px)) scale(1) rotate(45deg)', opacity:1, offset:0.35 },
          { transform:'translate(calc(-50% + ' + Math.cos(a) * 170 + 'px), calc(-50% + ' + Math.sin(a) * 120 + 'px)) scale(0.4) rotate(90deg)', opacity:0 }], { duration:1100, delay:250, easing:'ease-out', fill:'both' }); }
      if (o.perfect){
        const ring = mk('i', 'bw-ring', L); ring.style.left = cx + 'px'; ring.style.top = cy + 'px';
        ring.animate([{ transform:'translate(-50%,-50%) scale(0.2)', opacity:1 }, { transform:'translate(-50%,-50%) scale(8)', opacity:0 }], { duration:1300, delay:200, easing:'ease-out', fill:'both' });
        const b = mk('div', 'bb-banner big bw-perfect', L); b.textContent = 'PERFECT!';
      }
      // 3. confetti rains in two bursts
      const drop = (n, d)=>{ for (let k = 0; k < n; k++){ const c = mk('i', 'bw-conf', L), x = Math.random() * W, sway = (Math.random() - 0.5) * 120, rot = (Math.random() - 0.5) * 900, dur = 2000 + Math.random() * 1000;
        c.style.left = x + 'px'; c.style.background = COLORS[k % COLORS.length]; if (k % 3 === 0){ c.style.width = '9px'; c.style.height = '9px'; c.style.borderRadius = '50%'; }
        c.animate([{ transform:'translate(0,-30px) rotate(0deg)', opacity:1 }, { transform:'translate(' + sway / 2 + 'px,' + H * 0.5 + 'px) rotate(' + rot / 2 + 'deg)', opacity:1, offset:0.5 }, { transform:'translate(' + sway + 'px,' + (H + 40) + 'px) rotate(' + rot + 'deg)', opacity:0.6 }],
          { duration:dur, delay:d + Math.random() * 500, easing:'linear', fill:'both' }); } };
      drop(36, 100); drop(30, 1300);
      // 4. laser bars fan up from the bottom and sweep
      for (let k = 0; k < 5; k++){ const z = mk('i', 'bw-laser ' + (k % 2 ? 'm' : 'c'), L), base = -36 + k * 18, sw = k % 2 ? 14 : -14;
        z.animate([{ transform:'rotate(' + base + 'deg)', opacity:0 }, { transform:'rotate(' + (base + sw * 0.4) + 'deg)', opacity:0.8, offset:0.15 }, { transform:'rotate(' + (base - sw * 0.5) + 'deg)', opacity:0.8, offset:0.55 },
          { transform:'rotate(' + (base + sw) + 'deg)', opacity:0.75, offset:0.85 }, { transform:'rotate(' + (base + sw) + 'deg)', opacity:0 }], { duration:2500, delay:150 + k * 60, easing:'ease-in-out', fill:'both' }); }
      // 5. the spotlight cones swing; the stage lights brighten in a chase (about 2.2 a second)
      cones.forEach((c, k)=> c.animate([{ transform:'rotate(' + (k ? 18 : -18) + 'deg)', opacity:0 }, { transform:'rotate(' + (k ? -8 : 8) + 'deg)', opacity:0.55, offset:0.3 }, { transform:'rotate(' + (k ? 16 : -16) + 'deg)', opacity:0.55, offset:0.65 }, { transform:'rotate(' + (k ? -4 : 4) + 'deg)', opacity:0 }], { duration:3200, easing:'ease-in-out', fill:'both' }));
      glow.animate([{ opacity:0 }, { opacity:0.55, offset:0.1 }, { opacity:0.15, offset:0.25 }, { opacity:0.55, offset:0.4 }, { opacity:0.15, offset:0.55 }, { opacity:0.55, offset:0.7 }, { opacity:0 }], { duration:2700, easing:'linear', fill:'both' });
      // 6. sparkles all over, a few larger near the word
      for (let k = 0; k < 22; k++) sparkle(L, Math.random() * W, Math.random() * H * 0.9, 8 + Math.random() * 10, 300 + Math.random() * 2600);
      for (let k = 0; k < 5; k++) sparkle(L, cx + (Math.random() - 0.5) * 260, cy + (Math.random() - 0.5) * 120, 22 + Math.random() * 12, 500 + k * 380, '#fff4d6');
      // 7. Flip waves; 8. the score counts up, +N floats
      pose('wave');
      if (o.sfx){ if (o.sfx.cheer) o.sfx.cheer(); if (o.sfx.cashRegister) setTimeout(()=> o.sfx.cashRegister(), 500); }
      setTimeout(()=> scoreUp(o, 1100), 600);
    }, 150);
    setTimeout(end, 4100);
    return { end };
  };
  C.loss = (o)=>{
    o = o || {};
    const L = layerOf('loss'), W = innerWidth, H = innerHeight, q = quiet();
    const end = ()=>{ if (L._done) return; L._done = true; L.animate ? L.animate([{ opacity:1 }, { opacity:0 }], { duration:350, fill:'forwards' }).onfinish = ()=>{ L.remove(); o.done && o.done(); } : (L.remove(), o.done && o.done()); };
    const dim = mk('i', 'bw-dim', L), violet = mk('i', 'bw-violet', L), word = mk('div', 'bw-word sad', L); word.textContent = o.word || 'AWW!';
    pose('shrug'); if (o.sfx && o.sfx.wahwah) o.sfx.wahwah(); else if (o.sfx && o.sfx.wrong) o.sfx.wrong();
    scoreUp(o, q ? 0 : 700);
    if (q || !L.animate){ [dim, violet, word].forEach(e=> e.style.opacity = 1); setTimeout(end, 2300); return { end }; }
    dim.animate([{ opacity:0 }, { opacity:1 }], { duration:400, fill:'both' }); violet.animate([{ opacity:0 }, { opacity:1 }], { duration:400, fill:'both' });
    word.animate([{ transform:'translate(-50%, calc(-50% - 80px)) rotate(-6deg)', opacity:0 }, { transform:'translate(-50%, calc(-50% + 10px)) rotate(3deg)', opacity:1, offset:0.6 }, { transform:'translate(-50%, calc(-50% - 4px)) rotate(-1deg)', opacity:1, offset:0.8 },
      { transform:'translate(-50%, -50%) rotate(0deg)', opacity:1 }], { duration:700, delay:200, easing:'ease-out', fill:'both' });
    for (let k = 0; k < 4; k++){ const s = mk('i', 'bw-spark grey', L), x = W * (0.2 + 0.2 * k + (Math.random() - 0.5) * 0.08); s.style.left = x + 'px'; s.style.top = (H * 0.3) + 'px'; s.style.width = s.style.height = (10 + k * 2) + 'px';
      s.animate([{ transform:'translate(-50%,-50%) scale(0.4)', opacity:0 }, { transform:'translate(-50%, calc(-50% + 40px)) scale(1) rotate(30deg)', opacity:0.7, offset:0.3 }, { transform:'translate(-50%, calc(-50% + ' + (H * 0.35) + 'px)) scale(0.6) rotate(60deg)', opacity:0 }], { duration:2200, delay:300 + k * 250, easing:'ease-in', fill:'both' }); }
    setTimeout(end, 2500);
    return { end };
  };
})();
