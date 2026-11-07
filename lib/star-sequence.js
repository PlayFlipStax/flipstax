/* FlipStax - STAR SEQUENCE (registry id starSequence; a spare Mystery Game: the end of the Mystery Portal pool in data/rundown.js and the TEST menu's
   'Star Sequence'; not on the Wheel). A memory game: Flip's saucer lights five beams (blue, pink, orange, green, gold), each with its own note, one at a
   time in a pattern; the player repeats it by tapping the beams. The pattern starts at SQ_START (3) steps and grows by one each round up to SQ_MAX (7);
   the game ends on the first wrong tap or when the 7-step pattern is repeated. SCORING (the constants below): all 7 = SQ_PTS_ALL (30) and the Big Win;
   a longest repeated pattern of SQ_GOOD_MIN (5) or 6 steps = SQ_PTS_GOOD (15); fewer = SQ_PTS_LOW (5) and the gentle loss.
   The look: the Galactic Chomper Math galaxy turning behind (90 s a turn, easing up to 6 times as fast while notes play), a neon STAR / SEQUENCE sign with a
   chasing ring of bulbs, the Chomper-style status bar, the saucer (data/star-sequence/saucer.png) bobbing with twinkling glow dots on its lights, five
   feathered beams fanning out to five faceted gem stars on glowing pools, and 4 progress dots. Every note fires a photon bolt down its beam.
   Safety: transform and opacity only (the beams' soft edges are a STATIC SVG blur, never animated); notes at most 2 a second (taps that come faster are
   queued); one beam lights at a time; no full-screen or full-sign on/off flashing. Lite mode and reduced motion: nothing turns, bobs, pulses, chases or
   twinkles; a played beam just changes brightness, with no bolt and no sparkles. */
(function(){
  const MG = window.MiniGames; if (!MG || !MG.neo) return;
  const { chrome, finale, slam, wait } = MG.neo;
  // ---- the numbers to tune (the SCORING lives here)
  const SQ_START = 3;          // steps in the first pattern
  const SQ_MAX = 7;            // the longest pattern; repeating it wins
  const SQ_PTS_ALL = 30;       // all 7 steps: the Big Win
  const SQ_PTS_GOOD = 15;      // a longest repeated pattern of SQ_GOOD_MIN (5) or 6 steps
  const SQ_GOOD_MIN = 5;
  const SQ_PTS_LOW = 5;        // fewer: the gentle loss
  const SQ_NOTE_MS = 650;      // Flip's notes, one every 0.65 s; a player's notes at least SQ_MIN_GAP_MS apart (never more than 2 a second)
  const SQ_MIN_GAP_MS = 500;
  const SQ_ON_MS = 300, SQ_FADE_MS = 400;   // a lit beam: full for 0.3 s, then fades back over 0.4 s
  const SQ_IDLE_MS = 12000;    // no tap for 12 s on the player's turn ends the game (so the show never stalls); START starts by itself after 12 s
  const SQ_COLORS = ['#3fa9ff', '#ff4fb4', '#ff9a2e', '#3cf07c', '#ffd23f'];
  const SQ_ART = 'data/star-sequence/saucer.png', SQ_GALAXY = 'data/chomps/galaxy-math.webp';
  // the saucer picture is 630 x 354; its coloured lights (in its own pixels): the three big body lights, the ring round the dome, the two amber side lights
  const SAUCER = { w:630, h:354, lights:[
    [183, 240, '#3cf07c', 1.25], [313, 252, '#ff3d6b', 1.25], [452, 240, '#3cf07c', 1.25],
    [161, 112, '#ff4d6d', 0.8], [164, 132, '#3fe0c0', 0.8], [188, 151, '#ffb347', 0.85], [222, 163, '#3fe0c0', 0.85], [255, 167, '#ff3d6b', 0.95],
    [317, 175, '#38e8d0', 1.05], [397, 165, '#ffc04d', 0.95], [441, 151, '#9fb4ff', 0.85], [470, 131, '#ffb347', 0.8],
    [50, 158, '#ffa040', 1.0], [583, 158, '#ffa040', 1.0] ] };
  const NS = 'http://www.w3.org/2000/svg';
  // colour helpers: a lighter / darker shade of a hex colour
  const mix = (hex, to, t)=>{ const n = parseInt(hex.slice(1), 16), a = [n >> 16 & 255, n >> 8 & 255, n & 255], b = to === 'w' ? [255, 255, 255] : [0, 0, 0];
    return 'rgb(' + a.map((v, k)=> Math.round(v + (b[k] - v) * t)).join(',') + ')'; };
  // a faceted gem star: 10 triangles from the centre to the edge, alternating lighter and darker shades, a thin light outline, a small white highlight
  function gemSvg(col){
    const pts = []; for (let k = 0; k < 10; k++){ const r = k % 2 ? 19 : 48, a = -Math.PI / 2 + k * Math.PI / 5; pts.push([50 + Math.cos(a) * r, 52 + Math.sin(a) * r]); }
    let tri = ''; for (let k = 0; k < 10; k++){ const p = pts[k], q = pts[(k + 1) % 10];
      tri += '<path d="M50 52 L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + 'Z" fill="' + (k % 2 ? mix(col, 'k', 0.2) : mix(col, 'w', 0.55)) + '"/>'; }
    const outline = pts.map((p, k)=> (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + 'Z';
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + tri + '<path d="' + outline + '" fill="none" stroke="' + mix(col, 'w', 0.75) + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="43" cy="36" r="4.2" fill="#ffffff" opacity="0.95"/><circle cx="49" cy="31" r="1.8" fill="#ffffff" opacity="0.8"/></svg>';
  }
  const goldStar = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 L62 38 L96 39 L69 60 L79 93 L50 73 L21 93 L31 60 L4 39 L38 38Z" fill="rgba(255,210,63,0.12)" stroke="#ffd23f" stroke-width="7" stroke-linejoin="round"/>' +
    '<path d="M50 6 L62 38 L96 39 L69 60 L79 93 L50 73 L21 93 L31 60 L4 39 L38 38Z" fill="none" stroke="#fff6cf" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  const neon = (word, cls)=> '<span class="sq-neon ' + cls + '"><span class="t base">' + word + '</span><span class="t glow" aria-hidden="true">' + word + '</span>' +
    '<span class="t boost" aria-hidden="true">' + word + '</span><span class="t core" aria-hidden="true">' + word + '</span></span>';

  MG.register('starSequence', {
    name: 'Star Sequence', colors: ['#ff4fb4', '#27e6ff', '#0b0726'], bulb: '#ffe27a',
    quietMusic: true,   // (run 1 job 3: the show's music pauses while it plays and carries on after)
    rule: 'Watch the lights. Copy the pattern!', host: '',
    available: ()=> true,   // (a spare: it plays only where a pool or the TEST menu names it)
    run(api){
      const quiet = api.lite || api.reduced, sfx = api.sfx || {}, S = (k, ...a)=>{ try{ if (sfx[k]) sfx[k](...a); }catch(e){} };
      const testing = window.FLIPSTAX_TEST_HOST === true && /[?&](replay|debug)=/.test(location.search);   // (launch safety: never on a production host)
      const set = MG.neo.setLayer(api, 'sq-set', '<i class="sq-galaxy" style="background-image:url(' + SQ_GALAXY + ')"></i><i class="sq-veil"></i>');
      const ui = chrome(api, { title:'STAR SEQUENCE', sub:'', rule:'', msg:'Tap START!' });
      api.overlay.classList.add('nx-sq');
      // the neon sign replaces the plaque's text: a dark panel, mounting dots, a dotted inner border, STAR / SEQUENCE in neon tubing, gold stars, 24 bulbs
      const sign = api.stage.querySelector('.nx-sign');
      sign.className = 'sq-sign'; sign.setAttribute('role', 'img'); sign.setAttribute('aria-label', 'Star Sequence');
      sign.innerHTML = '<i class="sq-mount a"></i><i class="sq-mount b"></i><i class="sq-mount c"></i><i class="sq-mount d"></i><div class="sq-bulbs" aria-hidden="true"></div>' +
        '<div class="sq-sign-in"><div class="sq-row1"><span class="sq-gold">' + goldStar + '</span>' + neon('STAR', 'pink') + '<span class="sq-gold">' + goldStar + '</span></div>' +
        '<div class="sq-row2">' + neon('SEQUENCE', 'cyan') + '</div></div>';
      const bulbsEl = sign.querySelector('.sq-bulbs'), BULBS = 24;
      for (let k = 0; k < BULBS; k++){ const b = document.createElement('i'); b.style.animationDelay = (-(k / BULBS) * 2).toFixed(3) + 's'; bulbsEl.appendChild(b); }
      const placeBulbs = ()=>{   // evenly round the panel's border (a rounded rectangle's straight edges and corners)
        const w = sign.clientWidth, h = sign.clientHeight, r = Math.min(18, h / 4), straight = 2 * (w - 2 * r) + 2 * (h - 2 * r), arc = 2 * Math.PI * r, P = straight + arc;
        [...bulbsEl.children].forEach((b, k)=>{
          let d = (k + 0.5) / BULBS * P, x, y; const segs = [['h', w - 2 * r], ['c', arc / 4, 0], ['v', h - 2 * r], ['c', arc / 4, 1], ['h-', w - 2 * r], ['c', arc / 4, 2], ['v-', h - 2 * r], ['c', arc / 4, 3]];
          let px = r, py = 0;
          for (const s of segs){
            if (d <= s[1]){
              if (s[0] === 'h'){ x = px + d; y = 0; } else if (s[0] === 'v'){ x = w; y = py + d; } else if (s[0] === 'h-'){ x = px - d; y = h; } else if (s[0] === 'v-'){ x = 0; y = py - d; }
              else { const cs = [[w - r, r, -Math.PI / 2], [w - r, h - r, 0], [r, h - r, Math.PI / 2], [r, r, Math.PI]][s[2]], a = cs[2] + d / r; x = cs[0] + Math.cos(a) * r; y = cs[1] + Math.sin(a) * r; }
              break; }
            d -= s[1];
            if (s[0] === 'h'){ px = w - r; py = 0; } else if (s[0] === 'v'){ px = w; py = h - r; } else if (s[0] === 'h-'){ px = r; py = h; } else if (s[0] === 'v-'){ px = 0; py = r; }
            else if (s[2] === 0){ px = w; py = r; } else if (s[2] === 1){ px = w - r; py = h; } else if (s[2] === 2){ px = 0; py = h - r; } else { px = r; py = 0; }
          }
          b.style.left = x.toFixed(1) + 'px'; b.style.top = y.toFixed(1) + 'px';
        });
      };
      const rule = api.stage.querySelector('.nx-rule'); if (rule) rule.remove();
      // the field: saucer, beams, stars, pools, the START button; the progress dots and their label under it
      const play = ui.play;
      play.innerHTML = '<div class="sq-field"><div class="sq-saucer"><i class="sq-sglow"></i><i class="sq-sflare"></i><img class="sq-simg" src="' + SQ_ART + '" alt="" draggable="false"><div class="sq-lights"></div></div>' +
        '<div class="sq-beams"></div><svg class="sq-hit" aria-hidden="true"></svg><div class="sq-stars"></div>' +
        '<button type="button" class="sq-start">START</button></div>' +
        '<div class="sq-prog"><span class="sq-plabel">PRESS START</span><span class="sq-dots"><i></i><i></i><i></i><i></i></span></div>';
      const field = play.querySelector('.sq-field'), saucer = play.querySelector('.sq-saucer'), lightsEl = play.querySelector('.sq-lights'), beamsEl = play.querySelector('.sq-beams');
      const hit = play.querySelector('.sq-hit'), starsEl = play.querySelector('.sq-stars'), startBtn = play.querySelector('.sq-start'), sglow = play.querySelector('.sq-sglow'), sflare = play.querySelector('.sq-sflare');
      const plabel = play.querySelector('.sq-plabel'), dots = [...play.querySelectorAll('.sq-dots i')];
      SAUCER.lights.forEach(L=>{ const d = document.createElement('i'); d.style.left = (L[0] / SAUCER.w * 100).toFixed(2) + '%'; d.style.top = (L[1] / SAUCER.h * 100).toFixed(2) + '%';
        d.style.setProperty('--lc', L[2]); d.style.setProperty('--ls', L[3]); d.style.animationDuration = (0.6 + Math.random() * 0.6).toFixed(2) + 's'; d.style.animationDelay = (-Math.random() * 1.2).toFixed(2) + 's'; lightsEl.appendChild(d); });
      const beams = [], stars = [];
      for (let i = 0; i < 5; i++){
        const base = document.createElementNS(NS, 'svg'), lit = document.createElementNS(NS, 'svg');
        base.setAttribute('class', 'sq-bbase'); lit.setAttribute('class', 'sq-blit'); base.setAttribute('aria-hidden', 'true'); lit.setAttribute('aria-hidden', 'true');
        beamsEl.appendChild(base); beamsEl.appendChild(lit);
        const st = document.createElement('div'); st.className = 'sq-star'; st.style.setProperty('--c', SQ_COLORS[i]);
        st.innerHTML = '<i class="sq-pool"></i><i class="sq-pflare"></i><i class="sq-sglo"></i><div class="sq-gem">' + gemSvg(SQ_COLORS[i]) + '</div><i class="sq-flare"></i>';
        starsEl.appendChild(st);
        beams.push({ base, lit }); stars.push(st);
      }
      // ---- the layout (and again on a resize): every size from the field's own box
      let G = null;
      const layout = ()=>{
        const W = field.clientWidth, H = field.clientHeight; if (!W || !H) return;
        const k = Math.min(W / 390, H / 400), sw = Math.min(0.56 * W, 220 * k), sh = sw * SAUCER.h / SAUCER.w, sy = 2 * k;
        const y0 = sy + sh * 0.74, yPool = H - 16 * k, yStar = yPool - 30 * k, cx = W / 2;
        G = { W, H, k, sw, sh, y0, yPool, yStar, cx, xTop:(i)=> cx + (i - 2) * 20 * k, xBot:(i)=> cx + (i - 2) * 76 * k };
        saucer.style.width = sw.toFixed(1) + 'px'; saucer.style.height = sh.toFixed(1) + 'px'; saucer.style.left = (cx - sw / 2).toFixed(1) + 'px'; saucer.style.top = sy.toFixed(1) + 'px';
        field.style.setProperty('--k', k.toFixed(3)); field.style.setProperty('--dot', (9 * sw / 220).toFixed(1) + 'px');
        const poly = (i, wt, wb, yb)=>{ const a = G.xTop(i), b = G.xBot(i); return [[a - wt / 2, y0], [a + wt / 2, y0], [b + wb / 2, yb], [b - wb / 2, yb]].map(p=> p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '); };
        beams.forEach((bm, i)=>{
          const c = SQ_COLORS[i], id = 'sq' + i + '-' + Math.round(Math.random() * 1e6), bl = (3.2 * k).toFixed(2);
          [bm.base, bm.lit].forEach(s=>{ s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); s.setAttribute('width', W); s.setAttribute('height', H); });
          // the unlit beam: its colour, strongest at the top and the bottom, a soft fade between; feathered by a static blur
          bm.base.innerHTML = '<defs><linearGradient id="' + id + 'g" x1="0" y1="' + y0 + '" x2="0" y2="' + yPool + '" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + c + '" stop-opacity="0.95"/>' +
            '<stop offset="0.45" stop-color="' + c + '" stop-opacity="0.38"/><stop offset="1" stop-color="' + c + '" stop-opacity="0.92"/></linearGradient>' +
            '<filter id="' + id + 'f" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="' + bl + '"/></filter></defs>' +
            '<polygon points="' + poly(i, 14 * k, 70 * k, yPool) + '" fill="url(#' + id + 'g)" filter="url(#' + id + 'f)"/>';
          // the lit beam (the same width): full strength, a soft halo in its own colour and a white-hot core down its middle
          bm.lit.innerHTML = '<defs><linearGradient id="' + id + 'l" x1="0" y1="' + y0 + '" x2="0" y2="' + yPool + '" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + mix(c, 'w', 0.35) + '"/>' +
            '<stop offset="0.5" stop-color="' + c + '" stop-opacity="0.85"/><stop offset="1" stop-color="' + mix(c, 'w', 0.3) + '"/></linearGradient>' +
            '<filter id="' + id + 'h" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="' + (9 * k).toFixed(2) + '"/></filter>' +
            '<filter id="' + id + 'c" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="' + (2.4 * k).toFixed(2) + '"/></filter></defs>' +
            '<polygon points="' + poly(i, 26 * k, 92 * k, yPool) + '" fill="' + c + '" opacity="0.5" filter="url(#' + id + 'h)"/>' +
            '<polygon points="' + poly(i, 14 * k, 70 * k, yPool) + '" fill="url(#' + id + 'l)" filter="url(#' + id + 'f2)"/>' +
            '<polygon points="' + poly(i, 3 * k, 13 * k, yPool) + '" fill="#ffffff" opacity="0.95" filter="url(#' + id + 'c)"/>';
          bm.lit.querySelector('defs').insertAdjacentHTML('beforeend', '<filter id="' + id + 'f2" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="' + bl + '"/></filter>');
          const st = stars[i]; st.style.left = G.xBot(i).toFixed(1) + 'px'; st.style.top = yStar.toFixed(1) + 'px';
        });
        // the tap targets: each beam's whole area from the saucer down past its pool; neighbours touch (no dead gaps)
        hit.setAttribute('viewBox', '0 0 ' + W + ' ' + H); hit.setAttribute('width', W); hit.setAttribute('height', H);
        hit.innerHTML = beams.map((_, i)=> '<polygon data-i="' + i + '" points="' + poly(i, 20 * k, 76 * k, H) + '" fill="#000" fill-opacity="0" pointer-events="all"/>').join('');
        hit.querySelectorAll('polygon').forEach(p=>{ p.addEventListener('pointerdown', (e)=>{ e.preventDefault(); onTap(+p.dataset.i); }); });
        startBtn.style.top = ((y0 + yStar) / 2).toFixed(1) + 'px';
        placeBulbs();
      };
      requestAnimationFrame(layout);
      const onResize = ()=> layout(); addEventListener('resize', onResize);
      // ---- the galaxy: 90 s a turn; its speed eases (never jumps) toward a target - 6 times while notes play, back to 1 after
      let galAnim = null, rate = 1, want = 1, rateRaf = 0, calmT = 0, over = false;
      if (!quiet){ const g = set.querySelector('.sq-galaxy'); galAnim = g.animate([{ transform:'rotate(0deg)' }, { transform:'rotate(360deg)' }], { duration:90000, iterations:Infinity }); }
      const easeRate = ()=>{ cancelAnimationFrame(rateRaf); let last = performance.now();
        const step = (now)=>{ const dt = Math.min(0.05, (now - last) / 1000); last = now; rate += (want - rate) * (1 - Math.exp(-dt / 0.45));
          if (Math.abs(want - rate) < 0.02) rate = want; if (galAnim) galAnim.updatePlaybackRate(rate); if (rate !== want && !over) rateRaf = requestAnimationFrame(step); };
        rateRaf = requestAnimationFrame(step); };
      const busyLights = (on)=>{ if (quiet) return; [...lightsEl.children].forEach(d=> d.getAnimations().forEach(a=> a.updatePlaybackRate(on ? 2.4 : 1))); };
      const notePlaying = ()=>{ if (quiet) return; clearTimeout(calmT); if (want !== 6){ want = 6; easeRate(); } busyLights(true);
        calmT = setTimeout(()=>{ want = 1; easeRate(); busyLights(false); }, 1100); };
      // ---- one note: the photon bolt, the beam brightening (white-hot core), sparkles off the pool, the star lighting with its flare, the pool flaring,
      // the sign's quick brightening, the saucer's glow flaring in the beam's colour; then it all fades back over 0.4 s
      const A = (el, kf, o)=> el.animate ? el.animate(kf, o) : null;
      const litNow = new Set();
      const fire = (i)=>{
        S('starNote', i); if (over && !G) return;
        const bm = beams[i], st = stars[i], c = SQ_COLORS[i], T = SQ_ON_MS + SQ_FADE_MS, on = SQ_ON_MS / T;
        litNow.add(i); bm.base.style.zIndex = 3; bm.lit.style.zIndex = 4; st.classList.add('on');
        setTimeout(()=>{ litNow.delete(i); if (!litNow.has(i)){ bm.base.style.zIndex = ''; bm.lit.style.zIndex = ''; st.classList.remove('on'); } }, T);
        if (quiet){ bm.base.style.opacity = 1; bm.lit.style.opacity = 1; setTimeout(()=>{ bm.base.style.opacity = ''; bm.lit.style.opacity = ''; }, SQ_ON_MS); return; }
        notePlaying();
        A(bm.lit, [{ opacity:0 }, { opacity:1, offset:0.1 }, { opacity:1, offset:on }, { opacity:0 }], { duration:T, easing:'ease-out' });
        A(bm.base, [{ opacity:0.7 }, { opacity:1, offset:0.1 }, { opacity:1, offset:on }, { opacity:0.7 }], { duration:T, easing:'ease-out' });
        const gem = st.querySelector('.sq-gem');
        A(gem, [{ transform:'scale(1)', opacity:0.9 }, { transform:'scale(1.333)', opacity:1, offset:0.12 }, { transform:'scale(1.333)', opacity:1, offset:on }, { transform:'scale(1)', opacity:0.9 }], { duration:T, easing:'ease-out' });
        A(st.querySelector('.sq-flare'), [{ transform:'scale(0.4) rotate(0deg)', opacity:0 }, { transform:'scale(1) rotate(20deg)', opacity:1, offset:0.2 }, { transform:'scale(0.9) rotate(30deg)', opacity:0.9, offset:on }, { transform:'scale(0.5) rotate(45deg)', opacity:0 }], { duration:T, easing:'ease-out' });
        A(st.querySelector('.sq-sglo'), [{ opacity:0 }, { opacity:0.9, offset:0.15 }, { opacity:0.8, offset:on }, { opacity:0 }], { duration:T });
        A(st.querySelector('.sq-pflare'), [{ transform:'scale(0.8)', opacity:0 }, { transform:'scale(1.25)', opacity:1, offset:0.4 }, { transform:'scale(1.1)', opacity:0 }], { duration:T, easing:'ease-out' });
        // the bolt: from under the saucer down the beam to its pool in 0.25 s
        if (G){
          const x0 = G.xTop(i), x1 = G.xBot(i), y0 = G.y0, y1 = G.yPool, deg = Math.atan2(x1 - x0, y1 - y0) * 180 / Math.PI;
          const b = document.createElement('i'); b.className = 'sq-bolt'; b.style.setProperty('--c', c); field.appendChild(b);
          const tf = (x, y)=> 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (-deg).toFixed(1) + 'deg)';
          const ba = A(b, [{ transform:tf(x0, y0), opacity:0 }, { transform:tf(x0 + (x1 - x0) * 0.15, y0 + (y1 - y0) * 0.15), opacity:1, offset:0.15 }, { transform:tf(x1, y1 - 10 * G.k), opacity:1, offset:0.9 }, { transform:tf(x1, y1), opacity:0 }], { duration:250, easing:'ease-in' });
          if (ba) ba.onfinish = ()=> b.remove(); else b.remove();
          // 4 to 6 sparkles off the landing pool
          setTimeout(()=>{ if (over && !field.isConnected) return; const n = 4 + Math.floor(Math.random() * 3);
            for (let s = 0; s < n; s++){ const sp = document.createElement('i'); sp.className = 'sq-spark'; sp.style.setProperty('--c', s % 2 ? '#ffffff' : c); field.appendChild(sp);
              const a = Math.PI + Math.random() * Math.PI, d = (26 + Math.random() * 26) * G.k, px = x1 + Math.cos(a) * d, py = y1 + Math.sin(a) * d * 0.7;
              const sa = A(sp, [{ transform:'translate(' + x1.toFixed(1) + 'px,' + y1.toFixed(1) + 'px) scale(0.3)', opacity:0 }, { transform:'translate(' + ((x1 + px) / 2).toFixed(1) + 'px,' + ((y1 + py) / 2).toFixed(1) + 'px) scale(1)', opacity:1, offset:0.3 },
                { transform:'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) scale(0.4)', opacity:0 }], { duration:520 + Math.random() * 160, easing:'ease-out' });
              if (sa) sa.onfinish = ()=> sp.remove(); else sp.remove(); } }, 230);
        }
        // the sign brightens a little (opacity only), the saucer's glow flares in the beam's colour
        sign.querySelectorAll('.t.boost').forEach(el=> A(el, [{ opacity:0 }, { opacity:0.7, offset:0.3 }, { opacity:0 }], { duration:420, easing:'ease-out' }));
        sflare.style.setProperty('--c', c); A(sflare, [{ opacity:0, transform:'scale(0.85)' }, { opacity:0.9, transform:'scale(1.05)', offset:0.25 }, { opacity:0, transform:'scale(1)' }], { duration:T, easing:'ease-out' });
      };
      // ---- the game
      let pattern = [], round = 0, idx = 0, phase = 'idle', best = 0, lastNote = 0, queue = [], qT = 0, idleT = 0, startT = 0;
      const next = ()=>{ let v; do { v = Math.floor(api.rng() * 5); } while (pattern.length >= 2 && v === pattern[pattern.length - 1] && v === pattern[pattern.length - 2]); return v; };
      const setDots = ()=> dots.forEach((d, k)=> d.classList.toggle('on', k < round - 1));
      const showLabel = (t)=>{ plabel.textContent = t; };
      if (testing) window.__sq = { pattern: ()=> pattern.slice(), phase: ()=> phase, best: ()=> best, tap:(i)=> onTap(i), start: ()=> begin(), fire };
      const playPattern = async ()=>{
        phase = 'watch'; round++; setDots(); showLabel('WATCH · ROUND ' + round); ui.say('Watch Flip’s lights...'); field.classList.remove('yours');
        await wait(api.dt ? api.dt(700) : 700);
        for (let s = 0; s < pattern.length; s++){ if (over) return; fire(pattern[s]); lastNote = performance.now(); await wait(SQ_NOTE_MS); }
        if (over) return;
        phase = 'input'; idx = 0; showLabel('YOUR TURN'); ui.say('Your turn! Copy the pattern'); field.classList.add('yours'); armIdle();
      };
      const armIdle = ()=>{ clearTimeout(idleT); idleT = setTimeout(()=>{ if (phase === 'input' && !over){ ui.say('Too slow, Earthling!'); lose(); } }, api.dt ? api.dt(SQ_IDLE_MS) : SQ_IDLE_MS); };
      const onTap = (i)=>{
        if (phase !== 'input' || over) return;
        queue.push(i); pump();
      };
      const pump = ()=>{
        if (qT || !queue.length || phase !== 'input' || over) return;
        const gap = performance.now() - lastNote;
        if (gap < SQ_MIN_GAP_MS){ qT = setTimeout(()=>{ qT = 0; pump(); }, SQ_MIN_GAP_MS - gap); return; }
        const i = queue.shift(); lastNote = performance.now(); armIdle();
        fire(i);
        if (i !== pattern[idx]){ wrong(); return; }
        idx++;
        if (idx >= pattern.length){
          best = pattern.length; queue = []; clearTimeout(idleT);
          if (pattern.length >= SQ_MAX){ phase = 'done'; round++; setDots(); win(); return; }
          phase = 'between'; ui.say(['Nice!', 'Stellar!', 'Out of this world!', 'Cosmic memory!'][Math.min(3, round - 1)]);
          setTimeout(()=>{ if (over) return; pattern.push(next()); playPattern(); }, api.dt ? api.dt(900) : 900);
          return;
        }
        if (queue.length) pump();
      };
      const wrong = ()=>{
        phase = 'done'; queue = []; clearTimeout(idleT); S('buzzer');
        // a quick shake and a buzz, not a flash
        A(field, [{ transform:'translateX(0)' }, { transform:'translateX(-9px)' }, { transform:'translateX(8px)' }, { transform:'translateX(-6px)' }, { transform:'translateX(4px)' }, { transform:'translateX(0)' }], { duration:quiet ? 1 : 380, easing:'ease-out' });
        ui.say('Oops! Wrong star'); setTimeout(lose, 650);
      };
      const cleanup = ()=>{ over = true; clearTimeout(idleT); clearTimeout(qT); clearTimeout(calmT); clearTimeout(startT); cancelAnimationFrame(rateRaf); removeEventListener('resize', onResize); };
      const win = ()=>{ cleanup(); ui.say('All ' + SQ_MAX + ' stars! Perfect memory!'); api.score(SQ_PTS_ALL);
        setTimeout(()=> finale(api, ui, { win:true, perfect:true, pts:SQ_PTS_ALL, word:'PERFECT SEQUENCE!', line:'Seven stars in a row - a memory out of this world!' }), 500); };
      const lose = ()=>{
        if (over) return; cleanup();
        if (best >= SQ_GOOD_MIN){ ui.say(best + ' stars - great memory!'); api.score(SQ_PTS_GOOD); const w = slam(api, play, 'GREAT MEMORY!', 'sqgood');
          setTimeout(()=>{ w.remove(); api.finish({ pts:SQ_PTS_GOOD, win:true, line: best + ' stars in a row - stellar!' }); }, 1500); return; }
        ui.say(best ? best + ' stars this time' : 'The stars got away!');
        finale(api, ui, { win:false, pts:SQ_PTS_LOW, lossWord:'AWW!', line: best ? best + ' stars in a row. So close!' : 'The stars got the better of you!' });
      };
      const begin = ()=>{
        if (phase !== 'idle') return; clearTimeout(startT);
        phase = 'starting'; startBtn.classList.add('gone'); startBtn.disabled = true;
        try{ const ctx = window.AudioContext || window.webkitAudioContext; if (ctx && sfx.tap) sfx.tap(); }catch(e){}
        if (!quiet && sign.animate) sign.animate([{ opacity:1 }, { opacity:0.55, offset:0.2 }, { opacity:1, offset:0.45 }, { opacity:0.8, offset:0.65 }, { opacity:1 }], { duration:900 });   // (the sign flickers on once: 2 dips in 0.9 s)
        for (let s = 0; s < SQ_START; s++) pattern.push(next());
        setTimeout(()=>{ if (!over) playPattern(); }, 500);
      };
      startBtn.addEventListener('click', begin);
      startT = setTimeout(()=>{ if (phase === 'idle' && !over) begin(); }, api.dt ? api.dt(SQ_IDLE_MS) : SQ_IDLE_MS);
    },
  });
})();
