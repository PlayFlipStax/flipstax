/* FlipStax - fix 6: three new Mystery Games on the neon game-show stage - ZiG Zap ZaBam! (tic-tac-toe with trivia), Alien Blast (whack-a-mole)
   and Space Launch (timing). They register with window.MiniGames (lib/mini-games.js) and use its runner, so they get the same overlay, score pill,
   timer bar, sound helpers, FX, the lite / reduced-motion flags and api.finish (points x the act's multiplier, a key for a win).
   The chrome is Saucer Shuffle's, reused as is: the sign (.sc-sign: a dark navy glass plaque, gold-white title, cyan 'ROUND 1 OF 3'), the status pill
   (.sc-panel / .sc-msg), the neon stage art (data/scenes/saucer-shuffle-stage.webp) with the two spotlight cones; the instruction banner is the dark-glass
   cyan-edged panel the show uses (.nx-rule); Flip stands small in the bottom-left corner (Host.html, idle; wave on a win, shrug on a loss; he never bounces).
   The end: the shared BIG WIN CELEBRATION or the gentle LOSS (lib/celebrate.js), then api.finish.
   Motion is transform and opacity only; under 3 flashes a second; lite mode and reduced motion get plain fades. */
(function(){
  const MG = window.MiniGames; if (!MG) return;
  const esc = (t)=> String(t).replace(/[&<>"]/g, c=> ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  const wait = (ms)=> new Promise(r=> setTimeout(r, ms));
  const anim = (api, el, frames, opts)=>{ if (!el || !el.animate || api.lite || api.reduced) return { finished: Promise.resolve() }; return el.animate(frames, opts); };
  const pose = (p)=>{ try{ if (window.Host && Host.poseAll) Host.poseAll(p); }catch(e){} };

  // ---- the shared chrome: sign, instruction banner, play area, status pill, Flip in the corner ----
  function chrome(api, o){
    const s = api.stage, ov = api.overlay; s.classList.add('nx-stage'); ov.classList.add('mg-neo');
    s.innerHTML = '<div class="sc-casino nx-casino">' +
      '<div class="sc-sign nx-sign"><b></b><small></small></div>' +
      '<div class="nx-rule"></div>' +
      '<div class="nx-play"></div>' +
      '<div class="sc-panel nx-panel"><span class="sc-msg"></span><i class="nx-ptimer" aria-hidden="true"><b></b></i></div>' +
      '<div class="nx-host host-full" aria-hidden="true">' + api.hostSvg() + '</div></div>';
    const sign = s.querySelector('.nx-sign');
    sign.querySelector('b').textContent = o.title; sign.querySelector('small').textContent = o.sub || '';
    s.querySelector('.nx-rule').textContent = o.rule || '';
    const msg = s.querySelector('.sc-msg');
    const ui = {
      play: s.querySelector('.nx-play'), panel: s.querySelector('.nx-panel'), host: s.querySelector('.nx-host'), ptimer: s.querySelector('.nx-ptimer'),
      say: (t)=>{ msg.textContent = t; },
      sub: (t)=>{ sign.querySelector('small').textContent = t; },
      scoreEl: ov.querySelector('.mg-score'),
    };
    ui.say(o.msg || '');
    return ui;
  }
  // the end: the BIG WIN CELEBRATION (a win) or the gentle LOSS, then api.finish (the result pill and the act's points)
  function finale(api, ui, r){
    const C = window.Celebrate, scoreEl = ui.scoreEl, now = parseInt(scoreEl && scoreEl.textContent, 10) || 0;
    const fin = ()=> api.finish({ pts:r.pts, win:r.win, line:r.line });
    if (!C){ fin(); return; }
    if (r.win) C.win({ word:r.word, perfect:r.perfect, scoreEl, from:Math.min(now, r.pts), to:r.pts, plus:r.pts, sfx:api.sfx, done:fin });
    else C.loss({ word:r.lossWord || 'AWW!', scoreEl, to:r.pts, sfx:api.sfx, done:fin });
  }
  const slam = (api, parent, text, cls)=>{
    const b = document.createElement('div'); b.className = 'nx-slam ' + (cls || ''); b.textContent = text; parent.appendChild(b);
    if (api.lite || api.reduced || !b.animate) b.animate && b.animate([{ opacity:0 }, { opacity:1 }], { duration:250, fill:'both' });
    else b.animate([{ transform:'translate(-50%,-50%) scale(2.4)', opacity:0 }, { transform:'translate(-50%,-50%) scale(0.92)', opacity:1, offset:0.55 }, { transform:'translate(-50%,-50%) scale(1)', opacity:1 }], { duration:420, easing:'cubic-bezier(.3,1.3,.5,1)', fill:'both' });
    return b;
  };
  const floatText = (api, parent, x, y, text, cls)=>{
    const f = document.createElement('div'); f.className = 'nx-float ' + (cls || ''); f.textContent = text; f.style.left = x + 'px'; f.style.top = y + 'px'; parent.appendChild(f);
    if (api.lite || api.reduced || !f.animate){ setTimeout(()=> f.remove(), 700); return; }
    f.animate([{ transform:'translate(-50%,-50%) scale(0.6)', opacity:0 }, { transform:'translate(-50%,-90%) scale(1.15)', opacity:1, offset:0.25 }, { transform:'translate(-50%,-260%) scale(1)', opacity:0 }], { duration:850, easing:'ease-out', fill:'both' }).onfinish = ()=> f.remove();
  };
  const burst = (api, el, colors, count)=>{ if (!api.lite && !api.reduced && api.FX && api.FX.burstAt) try{ api.FX.burstAt(api.fxLayer, el, { count:count || 12, spread:60, shapes:['star', 'dot'], colors }); }catch(e){} };

  // ---- a game's own set (mega 4): a layer at the back of the overlay, under everything; the chrome's stage art and cones step aside for it
  function setLayer(api, cls, html){
    const L = document.createElement('div'); L.className = 'nx-set ' + cls; L.setAttribute('aria-hidden', 'true'); L.innerHTML = html;
    api.overlay.insertBefore(L, api.overlay.firstChild); api.overlay.classList.add('has-set');
    return L;
  }

  // =========================================================================== ZiG Zap ZaBam!
  // Tic-tac-toe against Flip, Hollywood Squares style (mega 4: a real opponent). Tap an empty square: it zooms up into a question card (a Brain Beam
  // question, 8 s); right - the square is yours (a cyan ZAP!); wrong or too slow - Flip claims it (a magenta BAM!). Flip's turn: he picks a square (win if
  // he can, block if he must, then centre, corners, edges) and answers his own Brain Beam question in the same glossy card - he thinks for about 1.2 s
  // (his portrait pulses, a trail of thinking dots), then his choice lights up; he is right ZZ_FLIP_RIGHT (60%) of the time and claims the square with a
  // magenta ZAP!. Wrong: his pill turns red with a buzzer and the player gets a STEAL - the right answer is NOT shown, the card stays with a 5 s timer
  // and a STEAL IT! banner; the right answer takes the square (a cyan ZAP and a STOLEN! stamp), a wrong tap or the timeout leaves it empty.
  // Three in a row wins; a full board with no line is a draw; about 2 minutes at most (then it is a draw).
  // Points (before the round's multiplier): a win ZZ_PTS.win (30), a draw 15, a loss 5. PERFECT: a win without one wrong answer (steals included).
  const ZZ_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const ZZ_Q_MS = 8000, ZZ_CAP_MS = 110000, ZZ_FLIP_RIGHT = 0.6, ZZ_THINK_MS = 1200, ZZ_STEAL_MS = 5000;
  const ZZ_PTS = { win:30, draw:15, loss:5 };
  const ZZ_UFO = '<img class="zz-ufo" src="data/saucer/saucer-chrome.webp" alt="" draggable="false">';
  const ZZ_FLIPMARK = '<svg class="zz-alien" viewBox="0 0 60 60" aria-hidden="true"><defs><radialGradient id="zzA" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#ffd1f0"/><stop offset="0.45" stop-color="#ff3fb5"/><stop offset="1" stop-color="#8a0f5c"/></radialGradient></defs>' +
    '<path d="M18 8 Q14 2 10 4" stroke="#ff3fb5" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M42 8 Q46 2 50 4" stroke="#ff3fb5" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="10" cy="4" r="3" fill="#ffd1f0"/><circle cx="50" cy="4" r="3" fill="#ffd1f0"/>' +
    '<path d="M30 8 C46 8 54 20 52 32 C50 46 38 56 30 56 C22 56 10 46 8 32 C6 20 14 8 30 8 Z" fill="url(#zzA)" stroke="#ffe0f4" stroke-width="2"/>' +
    '<ellipse cx="21" cy="31" rx="8" ry="10" transform="rotate(-20 21 31)" fill="#1a0420"/><ellipse cx="39" cy="31" rx="8" ry="10" transform="rotate(20 39 31)" fill="#1a0420"/>' +
    '<ellipse cx="19" cy="27" rx="2.5" ry="3.2" fill="#fff" opacity="0.85"/><ellipse cx="37" cy="27" rx="2.5" ry="3.2" fill="#fff" opacity="0.85"/><path d="M24 46 Q30 50 36 46" stroke="#1a0420" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="22" cy="15" rx="7" ry="3" fill="#fff" opacity="0.35"/></svg>';
  // the game-board set: a tall wall of glowing square panels (cyan, magenta, gold) lit in a slow wave, two crossing searchlights, a glossy checkered floor
  // with a reflection and a sunburst far behind (rotate / opacity only)
  const zzSetHtml = ()=>{
    const cols = 7, rows = 9, tones = ['c', 'm', 'g'];
    let wall = ''; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) wall += '<i class="' + tones[(r * 2 + c) % 3] + '" style="--d:' + ((c + r) * 0.22).toFixed(2) + 's;--k:' + (r * cols + c) + '"></i>';
    return '<i class="zs-sun"></i><div class="zs-wall">' + wall + '</div><i class="zs-beam l"></i><i class="zs-beam r"></i><i class="zs-floor"></i><i class="zs-refl"></i>';
  };
  MG.register('zigZap', {
    name: 'ZiG Zap ZaBam!', colors: ['#27e6ff', '#7a3cff', '#120a2e'], bulb: '#ffe27a',
    rule: 'Tap a square. Answer right to claim it!', host: '',
    available: ()=> true,
    run(api){
      const set = setLayer(api, 'zz-set', zzSetHtml());
      const ui = chrome(api, { title:'ZiG Zap ZaBam!', sub:'BEAT FLIP FOR THREE IN A ROW', rule:'Tap a square. Answer right to claim it!', msg:'Your move, Earthling!' });
      api.overlay.classList.add('nx-zz');
      const play = ui.play;
      play.innerHTML = '<div class="zz-wrap"><div class="zz-grid">' + Array.from({ length:9 }, (_, i)=> '<button type="button" class="zz-cell" data-i="' + i + '" aria-label="Square ' + (i + 1) + '"><i class="zz-wm" aria-hidden="true">Z</i><span class="zz-mark"></span></button>').join('') +
        '<i class="zz-line" aria-hidden="true"></i></div><i class="zz-floor" aria-hidden="true"></i></div>';
      const grid = play.querySelector('.zz-grid'), cells = [...play.querySelectorAll('.zz-cell')], line = play.querySelector('.zz-line');
      const board = Array(9).fill(null), testing = /[?&](replay|debug)=/.test(location.search);
      let busy = false, over = false, wrongs = 0, qn = 0, t0 = Date.now(), timers = [];
      const later = (fn, ms)=>{ const t = setTimeout(()=>{ if (!over) fn(); }, ms); timers.push(t); return t; };
      api.onClose = ()=>{ over = true; timers.forEach(clearTimeout); };
      const winnerOf = (b)=>{ for (const L of ZZ_LINES){ if (b[L[0]] && b[L[0]] === b[L[1]] && b[L[1]] === b[L[2]]) return { who:b[L[0]], line:L }; } return null; };
      const mark = (i, who)=>{
        board[i] = who; const c = cells[i], m = c.querySelector('.zz-mark');
        c.classList.remove('think'); c.classList.add(who === 'P' ? 'mine' : 'flip'); c.disabled = true;
        m.innerHTML = who === 'P' ? ZZ_UFO : ZZ_FLIPMARK;
        anim(api, m, [{ transform:'scale(1.8)', opacity:0 }, { transform:'scale(0.88)', opacity:1, offset:0.6 }, { transform:'scale(1)', opacity:1 }], { duration:380, easing:'cubic-bezier(.3,1.4,.5,1)', fill:'both' });
      };
      const stamp = (i, text, cls)=>{
        const c = cells[i], b = document.createElement('b'); b.className = 'zz-stamp ' + cls; b.textContent = text; c.appendChild(b);
        if (api.lite || api.reduced || !b.animate){ setTimeout(()=> b.remove(), 900); return; }
        b.animate([{ transform:'translate(-50%,-50%) scale(2) rotate(-12deg)', opacity:0 }, { transform:'translate(-50%,-50%) scale(0.95) rotate(-8deg)', opacity:1, offset:0.3 }, { transform:'translate(-50%,-50%) scale(1) rotate(-8deg)', opacity:1, offset:0.75 },
          { transform:'translate(-50%,-50%) scale(1.1) rotate(-8deg)', opacity:0 }], { duration:1000, easing:'ease-out', fill:'both' }).onfinish = ()=> b.remove();
      };
      const zap = (i, magenta)=>{
        const c = cells[i], z = document.createElement('i'); z.className = 'zz-bolt' + (magenta ? ' m' : ''); c.appendChild(z);
        if (!api.lite && !api.reduced && z.animate) z.animate([{ transform:'translate(-50%,-50%) scaleY(0.1) rotate(18deg)', opacity:0 }, { transform:'translate(-50%,-50%) scaleY(1) rotate(18deg)', opacity:1, offset:0.3 }, { transform:'translate(-50%,-50%) scaleY(1) rotate(18deg)', opacity:0 }], { duration:450, easing:'ease-out' }).onfinish = ()=> z.remove();
        else setTimeout(()=> z.remove(), 300);
        burst(api, c, magenta ? ['#ff3fb5', '#ffffff', '#ffd1f0'] : ['#27e6ff', '#ffffff', '#b8f7ff'], 14);
      };
      // ---- the glossy question card: zooms up out of the cell and shrinks back into it. flip: Flip's own question (his portrait, no answer taps until a steal)
      const openCard = (i, q, flip)=>{
        const card = document.createElement('div'); card.className = 'zz-q' + (flip ? ' flip' : '');
        card.innerHTML = (flip ? '<div class="zz-fhead"><span class="zz-face">' + api.hostSvg() + '</span><b>FLIP’S QUESTION</b><i class="zz-dots"><i></i><i></i><i></i></i></div>' : '') +
          '<i class="zz-qbar"><b></b></i><div class="zz-qtext"></div><div class="zz-opts">' +
          q.opts.map((o, k)=> '<button type="button" class="zz-opt" data-k="' + k + '"' + (flip ? ' disabled' : '') + '><span class="zz-key">' + 'ABCD'[k] + '</span><span class="zz-otxt">' + esc(o) + '</span></button>').join('') + '</div>';
        card.querySelector('.zz-qtext').textContent = q.question; if (q.question.length > 70) card.classList.add('long');
        play.appendChild(card);
        const cr = cells[i].getBoundingClientRect(), pr = card.getBoundingClientRect();
        const from = 'translate(' + (cr.left + cr.width / 2 - (pr.left + pr.width / 2)) + 'px,' + (cr.top + cr.height / 2 - (pr.top + pr.height / 2)) + 'px) scale(' + (cr.width / pr.width).toFixed(3) + ')';
        anim(api, card, [{ transform:from, opacity:0.4 }, { transform:'none', opacity:1 }], { duration:340, easing:'cubic-bezier(.2,.8,.3,1)', fill:'both' });
        if (api.lite || api.reduced) card.animate && card.animate([{ opacity:0 }, { opacity:1 }], { duration:200, fill:'both' });
        const bar = card.querySelector('.zz-qbar b');
        const runBar = (ms)=>{ bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = 'transform ' + (ms / 1000) + 's linear'; bar.style.transform = 'scaleX(0)'; };
        const stopBar = ()=>{ bar.style.transition = 'none'; };
        const close = ()=> new Promise(res=>{
          if (api.lite || api.reduced || !card.animate){ card.remove(); res(); return; }
          const back = card.animate([{ transform:'none', opacity:1 }, { transform:from, opacity:0 }], { duration:300, easing:'ease-in', fill:'both' });
          back.onfinish = ()=>{ card.remove(); res(); }; });
        return { card, opts:[...card.querySelectorAll('.zz-opt')], runBar, stopBar, close };
      };
      // the player's question: resolves true (right) or false (wrong / too slow)
      const ask = (i)=> new Promise(res=>{
        const q = api.quiz ? api.quiz(qn++) : null;
        if (!q){ res(false); return; }
        if (testing) window.__zzRight = q.correctIdx;   // (the test harness only)
        const c = openCard(i, q, false); c.runBar(api.dt(ZZ_Q_MS));
        let done = false;
        const answer = (k)=>{
          if (done || over) return; done = true; clearTimeout(qt); const ok = k === q.correctIdx; c.opts.forEach(b=> b.disabled = true); c.stopBar();
          if (ok){ c.opts[k].classList.add('right'); api.sfx.correct ? api.sfx.correct() : api.sfx.ding(); }
          else { if (k >= 0) c.opts[k].classList.add('wrong'); c.opts[q.correctIdx].classList.add('right'); api.sfx.wrong(); anim(api, c.card, [{ transform:'translateX(0)' }, { transform:'translateX(-10px)' }, { transform:'translateX(9px)' }, { transform:'translateX(-5px)' }, { transform:'translateX(0)' }], { duration:380 }); }
          later(()=>{ c.close().then(()=> res(ok)); }, ok ? 650 : 1300);
        };
        c.opts.forEach((b, k)=> b.addEventListener('click', ()=>{ api.sfx.tap && api.sfx.tap('top'); answer(k); }));
        const qt = later(()=>{ ui.say('Too slow, Earthling!'); answer(-1); }, api.dt(ZZ_Q_MS));
      });
      // ---- Flip's square: win if he can, block if he must, then the centre, the corners, the edges
      const flipPick = ()=>{
        const empty = board.map((v, i)=> v ? -1 : i).filter(i=> i >= 0); if (!empty.length) return -1;
        const tryFor = (who)=> empty.find(i=>{ const b = board.slice(); b[i] = who; const w = winnerOf(b); return w && w.who === who; });
        let i = tryFor('F'); if (i != null) return i;
        i = tryFor('P'); if (i != null) return i;
        if (board[4] == null) return 4;
        const corners = [0, 2, 6, 8].filter(k=> board[k] == null); if (corners.length) return corners[Math.floor(api.rng() * corners.length)];
        return empty[Math.floor(api.rng() * empty.length)];
      };
      // ---- Flip's turn: his own question, then a ZAP, or the player's STEAL
      const flipTurn = async ()=>{
        const i = flipPick(); if (i < 0) return;
        cells[i].classList.add('think'); ui.say('Flip’s turn! He picks a square...'); pose('think');
        const q = api.quiz ? api.quiz(qn++) : null;
        if (!q){ await wait(api.dt(800)); if (over) return; cells[i].classList.remove('think'); if (api.rng() < ZZ_FLIP_RIGHT){ mark(i, 'F'); zap(i, true); stamp(i, 'ZAP!', 'bam'); } pose('idle'); return; }
        const c = openCard(i, q, true); c.card.classList.add('thinking'); ui.host.classList.add('turn'); ui.panel.classList.add('thinking'); ui.say('Flip is thinking...');
        await wait(api.dt(ZZ_THINK_MS)); if (over) return;
        c.card.classList.remove('thinking'); ui.host.classList.remove('turn'); ui.panel.classList.remove('thinking');
        const right = api.rng() < ZZ_FLIP_RIGHT, others = [0, 1, 2, 3].filter(k=> k !== q.correctIdx && k < c.opts.length);
        const k = right ? q.correctIdx : others[Math.floor(api.rng() * others.length)];
        c.opts[k].classList.add('pick'); api.sfx.tick && api.sfx.tick(false);
        await wait(api.dt(600)); if (over) return;
        if (right){
          c.opts[k].classList.add('right', 'flipright'); api.sfx.slam ? api.sfx.slam() : api.sfx.ding(); ui.say('Flip got it! ZAP!');
          await wait(api.dt(550)); if (over) return; await c.close(); if (over) return;
          mark(i, 'F'); zap(i, true); stamp(i, 'ZAP!', 'bam');
          pose('idle'); return;
        }
        // Flip is wrong: his pill goes red with a buzzer, and the player can STEAL the square (the right answer is not shown)
        c.opts[k].classList.add('wrong'); api.sfx.wrong(); anim(api, c.opts[k], [{ transform:'translateX(0)' }, { transform:'translateX(-8px)' }, { transform:'translateX(7px)' }, { transform:'translateX(0)' }], { duration:320 });
        pose('shrug'); await wait(api.dt(450)); if (over) return;
        c.card.classList.add('steal'); const sb = document.createElement('div'); sb.className = 'zz-stealb'; sb.textContent = 'STEAL IT!'; c.card.appendChild(sb);
        anim(api, sb, [{ transform:'translate(-50%,-50%) scale(2) rotate(-6deg)', opacity:0 }, { transform:'translate(-50%,-50%) scale(1) rotate(-6deg)', opacity:1 }], { duration:320, easing:'cubic-bezier(.3,1.4,.5,1)', fill:'both' });
        ui.say('Flip missed! STEAL IT!'); c.runBar(api.dt(ZZ_STEAL_MS));
        if (testing) window.__zzRight = q.correctIdx;
        c.opts.forEach((b, kk)=>{ if (kk !== k) b.disabled = false; });
        const got = await new Promise(res=>{
          let done = false; const fin = (v)=>{ if (done) return; done = true; clearTimeout(st); c.opts.forEach(b=> b.disabled = true); c.stopBar(); res(v); };
          c.opts.forEach((b, kk)=>{ if (kk !== k) b.addEventListener('click', ()=>{ api.sfx.tap && api.sfx.tap('top'); fin(kk); }); });
          const st = later(()=> fin(-1), api.dt(ZZ_STEAL_MS));
        });
        if (over) return;
        if (got === q.correctIdx){
          c.opts[got].classList.add('right'); api.sfx.correct ? api.sfx.correct() : api.sfx.ding(); ui.say('STOLEN! The square is yours!');
          await wait(api.dt(550)); if (over) return; await c.close(); if (over) return;
          mark(i, 'P'); zap(i, false); stamp(i, 'STOLEN!', 'zap stolen');
        } else {
          if (got >= 0){ wrongs++; c.opts[got].classList.add('wrong'); api.sfx.wrong(); ui.say('No steal - the square stays empty.'); }
          else ui.say('Too slow - the square stays empty.');
          await wait(api.dt(700)); if (over) return; await c.close(); if (over) return;
          cells[i].classList.remove('think');
        }
        pose('idle');
      };
      // ---- the end: three in a row (a win or a loss) or a draw
      const end = (res)=>{
        if (over) return; over = true; timers.forEach(clearTimeout); cells.forEach(c=> c.disabled = true);
        if (res && res.line){
          res.line.forEach(k=> cells[k].classList.add('win', res.who === 'P' ? 'p' : 'f')); cells.forEach((c, k)=>{ if (res.line.indexOf(k) < 0) c.classList.add('dim'); });
          const a = cells[res.line[0]].getBoundingClientRect(), b = cells[res.line[2]].getBoundingClientRect(), g = grid.getBoundingClientRect();
          const x1 = a.left + a.width / 2 - g.left, y1 = a.top + a.height / 2 - g.top, x2 = b.left + b.width / 2 - g.left, y2 = b.top + b.height / 2 - g.top;
          const len = Math.hypot(x2 - x1, y2 - y1) + a.width * 0.6, ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
          line.style.left = ((x1 + x2) / 2) + 'px'; line.style.top = ((y1 + y2) / 2) + 'px'; line.style.width = len + 'px'; line.classList.add(res.who === 'P' ? 'p' : 'f');
          line.style.transform = 'translate(-50%,-50%) rotate(' + ang + 'deg) scaleX(0)'; line.style.opacity = '1';
          if (api.lite || api.reduced || !line.animate) line.style.transform = 'translate(-50%,-50%) rotate(' + ang + 'deg)';
          else line.animate([{ transform:'translate(-50%,-50%) rotate(' + ang + 'deg) scaleX(0)' }, { transform:'translate(-50%,-50%) rotate(' + ang + 'deg) scaleX(1)' }], { duration:420, easing:'ease-out', fill:'forwards' });
          const win = res.who === 'P';
          ui.say(win ? 'ZaBam! Three in a row!' : 'Flip got three in a row!');
          if (win){ set.classList.add('party'); setTimeout(()=> set.classList.remove('party'), 4400); }   // (the wall flashes in a chase and the searchlights sweep faster under the celebration)
          setTimeout(()=> finale(api, ui, win ? { win:true, perfect:!wrongs, pts:ZZ_PTS.win, word:'ZaBam!', line: !wrongs ? 'Perfect! Not one wrong answer!' : 'ZaBam! You beat Flip!' }
            : { win:false, pts:ZZ_PTS.loss, lossWord:'ZaBam!', line:'Flip wins this one. Rematch soon!' }), 700);
        } else {
          ui.say('A draw! Nobody wins the board.');
          anim(api, grid, [{ transform:'scale(1)' }, { transform:'scale(1.05)', offset:0.4 }, { transform:'scale(1)' }], { duration:600, easing:'ease-in-out' });
          const st = slam(api, play, 'DRAW!', 'neutral'); api.sfx.chime && api.sfx.chime(3);
          setTimeout(()=>{ st.remove(); api.score(ZZ_PTS.draw); api.finish({ pts:ZZ_PTS.draw, win:false, line:'A draw - half points!' }); }, 1800);
        }
      };
      const check = ()=>{ const w = winnerOf(board); if (w){ end(w); return true; } if (board.every(Boolean) || Date.now() - t0 > ZZ_CAP_MS){ end(null); return true; } return false; };
      cells.forEach((c, i)=> c.addEventListener('click', async ()=>{
        if (busy || over || board[i]) return; busy = true; api.sfx.tap && api.sfx.tap('top');
        cells.forEach(x=> x.classList.add('locked'));
        const ok = await ask(i); if (over) return;
        if (ok){ mark(i, 'P'); zap(i, false); stamp(i, 'ZAP!', 'zap'); ui.say('ZAP! Square claimed!'); }
        else { wrongs++; cells[i].classList.add('bamflash'); mark(i, 'F'); stamp(i, 'BAM!', 'bam'); ui.say('BAM! Flip claims it!'); }
        await wait(700); if (over) return;
        if (check()) return;
        await flipTurn(); if (over) return;
        await wait(400); if (over) return;
        if (check()) return;
        cells.forEach(x=> x.classList.remove('locked')); ui.say('Your move, Earthling!'); busy = false;
      }));
    },
  });

  // =========================================================================== ALIEN BLAST
  // Whack-a-mole: 25 s, a 3x3 field of portals in the stage floor. Green aliens pop up for about 0.8 s - tap them (+1, cyan sparkles; every 5 in a row
  // lights the combo row and the next hits count double). Red aliens and bombs are decoys (-2, the combo resets). The pace rises: up to 3 at once at the end.
  // Points: the score, at most AB_MAX. PERFECT: no decoy tapped and at least 80% of the green aliens hit. The win celebration from 60%.
  const AB_MS = 25000, AB_MAX = 40;
  const AB_GREEN = '<svg class="ab-svg" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="abG" cx="38%" cy="28%" r="75%"><stop offset="0" stop-color="#e9ffd6"/><stop offset="0.35" stop-color="#7dff6a"/><stop offset="0.8" stop-color="#1fae3a"/><stop offset="1" stop-color="#0b5e22"/></radialGradient>' +
    '<radialGradient id="abE" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#3a3a4a"/><stop offset="1" stop-color="#05050a"/></radialGradient></defs>' +
    '<path d="M36 18 Q28 4 20 6" stroke="#3bd15a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M64 18 Q72 4 80 6" stroke="#3bd15a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="20" cy="6" r="5" fill="#c8ff9a"/><circle cx="80" cy="6" r="5" fill="#c8ff9a"/>' +
    '<path d="M50 16 C74 16 86 34 84 54 C82 76 66 96 50 96 C34 96 18 76 16 54 C14 34 26 16 50 16 Z" fill="url(#abG)" stroke="#d9ffc8" stroke-width="2.5"/>' +
    '<ellipse cx="35" cy="52" rx="12" ry="16" transform="rotate(-22 35 52)" fill="url(#abE)"/><ellipse cx="65" cy="52" rx="12" ry="16" transform="rotate(22 65 52)" fill="url(#abE)"/>' +
    '<ellipse cx="32" cy="45" rx="4" ry="5" fill="#fff"/><ellipse cx="62" cy="45" rx="4" ry="5" fill="#fff"/><circle cx="38" cy="58" r="1.8" fill="#fff" opacity="0.7"/><circle cx="68" cy="58" r="1.8" fill="#fff" opacity="0.7"/>' +
    '<path d="M42 78 Q50 85 58 78" stroke="#0b3d17" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="26" rx="12" ry="5" fill="#fff" opacity="0.4"/></svg>';
  const AB_RED = '<svg class="ab-svg" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="abR" cx="38%" cy="28%" r="75%"><stop offset="0" stop-color="#ffd8c8"/><stop offset="0.35" stop-color="#ff5a3c"/><stop offset="0.8" stop-color="#b8160c"/><stop offset="1" stop-color="#5e0806"/></radialGradient>' +
    '<linearGradient id="abF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a3c"/><stop offset="0.6" stop-color="#ffb02e"/><stop offset="1" stop-color="#fff2a0"/></linearGradient></defs>' +
    '<path d="M30 22 C30 10 38 12 36 2 C46 8 44 16 50 10 C52 18 60 6 62 0 C70 10 70 18 70 22 Z" fill="url(#abF)"/>' +
    '<path d="M50 18 C74 18 86 36 84 56 C82 78 66 96 50 96 C34 96 18 78 16 56 C14 36 26 18 50 18 Z" fill="url(#abR)" stroke="#ffd0c0" stroke-width="2.5"/>' +
    '<path d="M24 44 L44 52" stroke="#2a0402" stroke-width="5" stroke-linecap="round"/><path d="M76 44 L56 52" stroke="#2a0402" stroke-width="5" stroke-linecap="round"/>' +
    '<ellipse cx="36" cy="60" rx="8" ry="7" fill="#1a0202"/><ellipse cx="64" cy="60" rx="8" ry="7" fill="#1a0202"/><circle cx="34" cy="58" r="2.4" fill="#ffe27a"/><circle cx="62" cy="58" r="2.4" fill="#ffe27a"/>' +
    '<path d="M38 82 L44 78 L50 82 L56 78 L62 82" stroke="#2a0402" stroke-width="3" fill="none" stroke-linejoin="round"/><ellipse cx="38" cy="30" rx="11" ry="4" fill="#fff" opacity="0.35"/></svg>';
  const AB_BOMB = '<svg class="ab-svg" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="abB" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#6a6a80"/><stop offset="0.45" stop-color="#22222e"/><stop offset="1" stop-color="#050508"/></radialGradient>' +
    '<radialGradient id="abS" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.4" stop-color="#ffd23f"/><stop offset="1" stop-color="rgba(255,120,30,0)"/></radialGradient></defs>' +
    '<path d="M58 26 Q66 12 78 14" stroke="#c9a46a" stroke-width="4" fill="none" stroke-linecap="round"/><circle class="ab-spark" cx="80" cy="13" r="10" fill="url(#abS)"/>' +
    '<rect x="46" y="22" width="16" height="12" rx="3" fill="#4a4a5c" stroke="#8a8aa0" stroke-width="1.5" transform="rotate(20 54 28)"/>' +
    '<circle cx="48" cy="62" r="32" fill="url(#abB)" stroke="#8a8aa8" stroke-width="2"/><ellipse cx="36" cy="46" rx="10" ry="6" transform="rotate(-30 36 46)" fill="#fff" opacity="0.4"/></svg>';
  MG.register('alienBlast', {
    name: 'Alien Blast', colors: ['#35f08a', '#7a3cff', '#120a2e'], bulb: '#ffe27a',
    rule: 'Tap the green aliens. Avoid the red ones!', host: '',
    available: ()=> true,
    run(api){
      const ui = chrome(api, { title:'ALIEN BLAST', sub:'TAP THE GREEN ALIENS', rule:'Tap the green aliens. Avoid the red ones!', msg:'Get ready...' });
      api.overlay.classList.add('nx-ab');
      const play = ui.play;
      play.innerHTML = '<div class="ab-field">' + Array.from({ length:9 }, (_, i)=> '<div class="ab-portal" data-i="' + i + '"><i class="ab-hole"></i><div class="ab-pit"></div><i class="ab-rim"></i></div>').join('') + '</div>' +
        '<div class="ab-combo" aria-hidden="true">' + Array.from({ length:5 }, ()=> '<i></i>').join('') + '<b class="ab-x2">x2</b></div>';
      const portals = [...play.querySelectorAll('.ab-portal')], field = play.querySelector('.ab-field'), comboLights = [...play.querySelectorAll('.ab-combo i')], x2 = play.querySelector('.ab-x2');
      ui.panel.classList.add('timed');
      let score = 0, combo = 0, greens = 0, hits = 0, decoys = 0, over = false, running = false, startAt = 0, spawnT = 0, timers = [];
      const later = (fn, ms)=>{ const t = setTimeout(()=>{ if (!over) fn(); }, ms); timers.push(t); return t; };
      api.onClose = ()=>{ over = true; timers.forEach(clearTimeout); clearTimeout(spawnT); };
      const setCombo = ()=>{ const n = combo ? ((combo - 1) % 5) + 1 : 0; comboLights.forEach((l, k)=> l.classList.toggle('on', k < n)); api.overlay.classList.toggle('ab-double', combo >= 5); };
      const busy = new Set();
      const spawn = (i, kind, upMs)=>{
        const p = portals[i], pit = p.querySelector('.ab-pit'); busy.add(i);
        const a = document.createElement('button'); a.type = 'button'; a.className = 'ab-actor ' + kind; a.setAttribute('aria-label', kind === 'green' ? 'Green alien' : kind === 'red' ? 'Red alien' : 'Bomb');
        a.innerHTML = kind === 'green' ? AB_GREEN : kind === 'red' ? AB_RED : AB_BOMB; pit.appendChild(a);
        if (kind === 'green') greens++;
        let gone = false;
        const down = (hit)=>{
          if (gone) return; gone = true; busy.delete(i);
          if (hit || api.lite || api.reduced || !a.animate){ a.remove(); return; }
          a.animate([{ transform:'translateY(0) scale(1)' }, { transform:'translateY(105%) scale(0.7)' }], { duration:200, easing:'ease-in', fill:'both' }).onfinish = ()=> a.remove();
        };
        anim(api, a, [{ transform:'translateY(105%) scale(0.6)' }, { transform:'translateY(-6%) scale(1.06)', offset:0.65 }, { transform:'translateY(0) scale(1)' }], { duration:220, easing:'ease-out', fill:'both' });
        later(()=> down(false), upMs);
        a.addEventListener('pointerdown', (e)=>{
          e.preventDefault(); if (gone || !running) return;
          const r = a.getBoundingClientRect(), pr = play.getBoundingClientRect(), x = r.left + r.width / 2 - pr.left, y = r.top - pr.top + r.height * 0.3;
          if (kind === 'green'){
            hits++; combo++; const v = combo > 5 ? 2 : 1; score += v; api.score(score);
            floatText(api, play, x, y, '+' + v, 'gold'); burst(api, a, ['#27e6ff', '#ffffff', '#35f08a'], 10);
            api.sfx.tap && api.sfx.tap('top'); if (api.FX && api.FX.sound) api.FX.sound('zap');
            if (combo % 5 === 0){ api.sfx.combo ? api.sfx.combo() : api.sfx.ding(); x2.classList.remove('go'); void x2.offsetWidth; x2.classList.add('go'); const mq = document.getElementById('showMarquee');
              if (mq && !api.lite && !api.reduced){ const bs = mq.querySelectorAll('i'); bs.forEach((b, k)=> b.style.setProperty('--p', (k / Math.max(1, bs.length)).toFixed(3))); mq.classList.remove('bw-chase'); void mq.offsetWidth; mq.classList.add('bw-chase'); setTimeout(()=> mq.classList.remove('bw-chase'), 1700); } }
            anim(api, a, [{ transform:'scale(1)', opacity:1 }, { transform:'scale(1.35)', opacity:0 }], { duration:200, easing:'ease-out', fill:'both' });
            setTimeout(()=> down(true), api.lite || api.reduced ? 0 : 190);
          } else {
            decoys++; combo = 0; score -= 2; api.score(score);
            floatText(api, play, x, y, '-2', 'red');
            const ring = document.createElement('i'); ring.className = 'ab-ring'; p.appendChild(ring);
            if (ring.animate && !api.lite && !api.reduced) ring.animate([{ transform:'translate(-50%,-50%) scale(0.4)', opacity:1 }, { transform:'translate(-50%,-50%) scale(1.5)', opacity:0 }], { duration:500, easing:'ease-out' }).onfinish = ()=> ring.remove();
            else setTimeout(()=> ring.remove(), 400);
            anim(api, field, [{ transform:'translateX(0)' }, { transform:'translateX(-6px)' }, { transform:'translateX(5px)' }, { transform:'translateX(-3px)' }, { transform:'translateX(0)' }], { duration:300 });
            api.sfx.buzzer ? api.sfx.buzzer() : api.sfx.wrong();
            down(true);
          }
          setCombo();
        });
      };
      // the pace: from one at a time every 0.95 s (up 1 s) to three at once every 0.42 s (up 0.65 s)
      const tick = ()=>{
        if (over || !running) return;
        const t = Math.min(1, (Date.now() - startAt) / api.dt(AB_MS)), gap = 950 - 530 * t, up = 1000 - 350 * t, most = t < 0.35 ? 1 : t < 0.7 ? 2 : 3;
        const free = portals.map((_, k)=> k).filter(k=> !busy.has(k));
        if (busy.size < most && free.length){
          const i = free[Math.floor(api.rng() * free.length)], r = api.rng();
          spawn(i, r < 0.72 ? 'green' : r < 0.88 ? 'red' : 'bomb', api.dt(up));
        }
        spawnT = later(tick, api.dt(gap * (0.75 + api.rng() * 0.5)));
      };
      const finish = ()=>{
        running = false; ui.say('TIME!'); const t = slam(api, play, 'TIME!', 'time'); api.sfx.buzzer ? api.sfx.buzzer() : api.sfx.wrong();
        portals.forEach(p=> p.querySelectorAll('.ab-actor').forEach(a=> a.remove()));
        later(()=>{
          t.remove();
          const ratio = greens ? hits / greens : 0, pts = Math.max(0, Math.min(AB_MAX, score)), perfect = !decoys && ratio >= 0.8, win = ratio >= 0.6;
          ui.say(hits + ' of ' + greens + ' aliens blasted!');
          finale(api, ui, win ? { win:true, perfect, pts, word:'BLASTED!', line: perfect ? 'Perfect aim, Earthling!' : 'Nice blasting!' } : { win:false, pts, lossWord:'AWW!', line:'Those aliens were slippery!' });
        }, 1100);
      };
      // 3, 2, 1, BLAST!
      (async ()=>{
        for (const n of ['3', '2', '1', 'BLAST!']){ if (over) return; const c = slam(api, play, n, n.length > 1 ? 'go' : 'count'); api.sfx.tick ? api.sfx.tick(n.length > 1) : null; await wait(api.dt(n.length > 1 ? 600 : 650)); c.remove(); }
        if (over) return;
        running = true; startAt = Date.now(); ui.say('Blast the green aliens!');
        const bar = ui.ptimer.querySelector('b'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = 'transform ' + (api.dt(AB_MS) / 1000) + 's linear'; bar.style.transform = 'scaleX(0)';
        tick(); later(finish, api.dt(AB_MS));
      })();
    },
  });

  // =========================================================================== SPACE LAUNCH
  // Three rounds: a marker sweeps up and down a tall power meter; tap LAUNCH (or anywhere) to stop it. The green zone shrinks (22%, 14%, 9% of the meter)
  // and the sweep speeds up. Dead centre (the middle 20% of the band) is PERFECT!, in the band GREAT!, just outside CLOSE, else OOPS. The rocket rises
  // by the hit; the three heights add up to the score. PERFECT LAUNCH: all three PERFECT!. A total of 17 or more wins.
  const SL_ROUNDS = [{ band:0.22, period:1800 }, { band:0.14, period:1350 }, { band:0.09, period:1000 }];
  const SL_PTS = { PERFECT:10, GREAT:7, CLOSE:3, OOPS:0 }, SL_RISE = { PERFECT:1, GREAT:0.7, CLOSE:0.38, OOPS:0 }, SL_WIN = 17;
  const SL_ROCKET = '<svg class="sl-rsvg" viewBox="0 0 60 130" aria-hidden="true"><defs><linearGradient id="slB" x1="0" x2="1"><stop offset="0" stop-color="#8a8fa6"/><stop offset="0.35" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d9dcea"/><stop offset="1" stop-color="#6a6f86"/></linearGradient>' +
    '<linearGradient id="slR" x1="0" x2="1"><stop offset="0" stop-color="#8a0c18"/><stop offset="0.4" stop-color="#ff5a5a"/><stop offset="1" stop-color="#7a0612"/></linearGradient><radialGradient id="slW" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#d9fbff"/><stop offset="0.5" stop-color="#27e6ff"/><stop offset="1" stop-color="#0a4a7a"/></radialGradient></defs>' +
    '<path d="M30 2 C44 18 46 44 44 92 L16 92 C14 44 16 18 30 2 Z" fill="url(#slB)" stroke="#4a4f66" stroke-width="1.5"/><path d="M30 2 C38 11 41 20 42 28 L18 28 C19 20 22 11 30 2 Z" fill="url(#slR)"/>' +
    '<circle cx="30" cy="48" r="8" fill="url(#slW)" stroke="#4a4f66" stroke-width="2"/><path d="M16 66 L2 92 L2 104 L16 94 Z" fill="url(#slR)"/><path d="M44 66 L58 92 L58 104 L44 94 Z" fill="url(#slR)"/>' +
    '<rect x="18" y="92" width="24" height="8" rx="2" fill="#4a4f66"/><path d="M22 70 L38 70" stroke="#ff5a5a" stroke-width="4"/><path d="M20 10 C22 30 21 60 20 86" stroke="#fff" stroke-width="2" opacity="0.6" fill="none"/></svg>';
  MG.register('spaceLaunch', {
    name: 'Space Launch', colors: ['#27e6ff', '#7a3cff', '#120a2e'], bulb: '#ffe27a',
    rule: 'Tap to stop the marker in the green zone!', host: '',
    available: ()=> true,
    run(api){
      const ui = chrome(api, { title:'SPACE LAUNCH', sub:'ROUND 1 OF 3', rule:'Tap to stop the marker in the green zone!', msg:'Stop it in the green!' });
      api.overlay.classList.add('nx-sl');
      const play = ui.play;
      play.innerHTML = '<div class="sl-wrap"><div class="sl-meter"><i class="sl-ticks"></i><i class="sl-band"><u></u></i><i class="sl-trail"></i><i class="sl-mark"></i></div>' +
        '<div class="sl-scene"><i class="sl-stars"></i><div class="sl-heights">' + Array.from({ length:10 }, ()=> '<i></i>').join('') + '</div>' +
        '<div class="sl-rocket"><i class="sl-flame"></i>' + SL_ROCKET + '</div><div class="sl-smoke"></div><div class="sl-pad"><i class="sl-bulbs"></i></div></div></div>' +
        '<button type="button" class="nx-gold sl-go">LAUNCH!</button>';
      const meter = play.querySelector('.sl-meter'), band = play.querySelector('.sl-band'), mark = play.querySelector('.sl-mark'), trail = play.querySelector('.sl-trail');
      const scene = play.querySelector('.sl-scene'), rocket = play.querySelector('.sl-rocket'), flame = play.querySelector('.sl-flame'), smoke = play.querySelector('.sl-smoke'), heights = [...play.querySelectorAll('.sl-heights i')], go = play.querySelector('.sl-go');
      let round = 0, total = 0, perfects = 0, over = false, live = false, raf = 0, t0 = 0, center = 0.5, pos = 0, timers = [];
      const later = (fn, ms)=>{ const t = setTimeout(()=>{ if (!over) fn(); }, ms); timers.push(t); return t; };
      api.onClose = ()=>{ over = true; live = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
      const H = ()=> meter.clientHeight;
      const place = ()=>{ const y = (1 - pos) * H(); mark.style.transform = 'translateY(' + y.toFixed(1) + 'px)'; trail.style.transform = 'translateY(' + y.toFixed(1) + 'px)'; };
      const sweep = (now)=>{
        if (!live || over) return;
        const per = api.dt(SL_ROUNDS[round].period), ph = ((now - t0) % (per * 2)) / per; pos = ph < 1 ? ph : 2 - ph;   // (up, then down)
        trail.classList.toggle('down', ph >= 1); place();
        raf = requestAnimationFrame(sweep);
      };
      const startRound = ()=>{
        const R = SL_ROUNDS[round]; ui.sub('ROUND ' + (round + 1) + ' OF 3');
        center = R.band / 2 + 0.06 + api.rng() * (0.88 - R.band);
        band.style.top = ((1 - center - R.band / 2) * 100) + '%'; band.style.height = (R.band * 100) + '%';
        anim(api, band, [{ opacity:0, transform:'scaleY(0.4)' }, { opacity:1, transform:'scaleY(1)' }], { duration:300, easing:'ease-out' });
        ui.say(round ? 'The zone is shrinking...' : 'Stop it in the green!');
        go.disabled = false; live = true; t0 = performance.now(); raf = requestAnimationFrame(sweep);
      };
      const rateOf = (p)=>{ const half = SL_ROUNDS[round].band / 2, d = Math.abs(p - center); return d <= half * 0.2 ? 'PERFECT' : d <= half ? 'GREAT' : d <= half + 0.08 ? 'CLOSE' : 'OOPS'; };
      const puff = (n, grey)=>{ for (let k = 0; k < n; k++){ const p = document.createElement('i'); p.className = 'sl-puff' + (grey ? ' grey' : ''); smoke.appendChild(p);
        const dx = (k - (n - 1) / 2) * 16 + (api.rng() - 0.5) * 10;
        if (api.lite || api.reduced || !p.animate){ setTimeout(()=> p.remove(), 500); continue; }
        p.animate([{ transform:'translate(-50%,0) scale(0.4)', opacity:0.9 }, { transform:'translate(calc(-50% + ' + dx + 'px), -' + (14 + k * 4) + 'px) scale(1.6)', opacity:0 }], { duration:1100 + k * 80, easing:'ease-out' }).onfinish = ()=> p.remove(); } };
      const launch = async ()=>{
        if (!live || over) return; live = false; cancelAnimationFrame(raf); go.disabled = true;
        const r = rateOf(pos); total += SL_PTS[r]; if (r === 'PERFECT') perfects++; api.score(total);
        mark.classList.add('hit'); slam(api, play, r === 'PERFECT' ? 'PERFECT!' : r === 'GREAT' ? 'GREAT!' : r === 'CLOSE' ? 'CLOSE' : 'OOPS', 'rate ' + r.toLowerCase());
        if (r === 'PERFECT' || r === 'GREAT') api.sfx.ding(); else if (r === 'CLOSE') api.sfx.chime && api.sfx.chime(2); else api.sfx.wrong();
        const sh = scene.clientHeight, rise = SL_RISE[r] * (sh - rocket.clientHeight - 30), lit = Math.round(SL_RISE[r] * heights.length);
        flame.classList.add('on'); puff(5, r === 'OOPS');
        if (r !== 'OOPS'){
          if (api.sfx.ufoBeam) api.sfx.ufoBeam();
          anim(api, play.querySelector('.sl-wrap'), [{ transform:'translate(0,0)' }, { transform:'translate(-2px,1px)' }, { transform:'translate(2px,-1px)' }, { transform:'translate(-1px,1px)' }, { transform:'translate(0,0)' }], { duration:300, iterations:3 });
          const up = anim(api, rocket, [{ transform:'translateY(0)' }, { transform:'translateY(' + (-rise) + 'px)' }], { duration:1300, easing:'cubic-bezier(.45,0,.3,1)', fill:'forwards' });
          if (api.lite || api.reduced) rocket.style.transform = 'translateY(' + (-rise) + 'px)';
          heights.slice(0, lit).forEach((h, k)=> later(()=> h.classList.add('on'), 200 + k * 110));
          if (r === 'PERFECT'){ for (let k = 0; k < 6; k++) later(()=> burst(api, rocket, ['#fff4d6', '#ffe27a', '#27e6ff'], 6), 250 + k * 170); later(()=>{ burst(api, rocket, ['#ffe27a', '#ffffff', '#ff3fb5', '#27e6ff'], 22); }, 1350); }
          await Promise.resolve(up.finished); await wait(api.lite || api.reduced ? 900 : 500);
        } else {
          // a sputter: the rocket wobbles a little way up and drops back in a puff of grey smoke
          await Promise.resolve(anim(api, rocket, [{ transform:'translateY(0) rotate(0deg)' }, { transform:'translateY(-26px) rotate(-6deg)', offset:0.3 }, { transform:'translateY(-30px) rotate(5deg)', offset:0.5 }, { transform:'translateY(-18px) rotate(-3deg)', offset:0.7 }, { transform:'translateY(0) rotate(0deg)' }], { duration:1100, easing:'ease-in-out' }).finished);
          puff(4, true); await wait(api.lite || api.reduced ? 900 : 300);
        }
        flame.classList.remove('on'); mark.classList.remove('hit'); play.querySelectorAll('.nx-slam').forEach(n=> n.remove());
        round++;
        if (round >= SL_ROUNDS.length){
          const perfect = perfects === 3, win = total >= SL_WIN;
          ui.say('Total height: ' + total + ' of 30');
          finale(api, ui, win ? { win:true, perfect, pts:total, word: perfect ? 'PERFECT LAUNCH!' : 'LIFT OFF!', line: perfect ? 'A perfect launch!' : 'Into orbit, Earthling!' } : { win:false, pts:total, lossWord:'AWW!', line:'Houston, we have a sputter.' });
          return;
        }
        // back to the pad for the next round
        await Promise.resolve(anim(api, rocket, [{ opacity:1 }, { opacity:0 }], { duration:250, fill:'forwards' }).finished);
        rocket.getAnimations && rocket.getAnimations().forEach(a=> a.cancel()); rocket.style.transform = '';
        heights.forEach(h=> h.classList.remove('on'));
        anim(api, rocket, [{ opacity:0, transform:'translateY(16px)' }, { opacity:1, transform:'translateY(0)' }], { duration:300, easing:'ease-out' });
        await wait(450); if (!over) startRound();
      };
      go.addEventListener('click', (e)=>{ e.stopPropagation(); launch(); });
      play.addEventListener('click', ()=> launch());
      later(startRound, 700);
    },
  });
})();
