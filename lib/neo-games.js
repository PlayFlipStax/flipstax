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
    // run 2 job 2: a game with a neon sign shows it in place of the plain title (the small line - WAVE 1 OF 3, ROUND 1 OF 3 - stays under it)
    { const key = ({ 'GALACTIC CHOMPER':'munchMix', 'ZiG Zap ZaBam!':'zigZap', 'SPACE LAUNCH':'spaceLaunch', 'ALIEN BLAST':'alienBlast' })[o.title];
      if (key && window.NeonLogo && NeonLogo.has(key)){ sign.classList.add('neon'); sign.querySelector('b').remove(); sign.insertAdjacentHTML('afterbegin', NeonLogo.html(key)); } }
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
    if (api.lite || api.reduced || !b.animate){ /* (mega 5 item 11: lite and reduced motion - the word is simply there, no fade) */ }
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

  // (mega 4+: the shared chrome and helpers, for games in other files - lib/munch-mix.js)
  MG.neo = { chrome, finale, slam, floatText, burst, anim, wait, pose, esc, setLayer };

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
  const ZZ_PAUSE_MS = 1000;   // (run 2 job 10: the pauses - after a pick, after a reveal, before the next turn)
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
      const board = Array(9).fill(null), testing = window.FLIPSTAX_TEST_HOST === true && /[?&](replay|debug)=/.test(location.search);   // (launch safety: never on a production host)
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
          '<i class="zz-qbar"><b></b></i><div class="zz-qtext"><i class="zz-qbulbs" aria-hidden="true"><i></i><i></i><i></i></i><span class="zz-qt"></span></div><div class="zz-opts">' +
          q.opts.map((o, k)=> '<button type="button" class="zz-opt" data-k="' + k + '"' + (flip ? ' disabled' : '') + '><span class="zz-key">' + (k + 1) + '</span><span class="zz-otxt">' + esc(o) + '</span></button>').join('') + '</div>';
        card.querySelector('.zz-qt').textContent = q.question; if (q.question.length > 70) card.classList.add('long');
        play.appendChild(card); api.overlay.classList.add('zz-asking');   // (mega 5: a class, not only :has(), hides the status pill while a question is up)
        const cr = cells[i].getBoundingClientRect(), pr = card.getBoundingClientRect();
        const from = 'translate(' + (cr.left + cr.width / 2 - (pr.left + pr.width / 2)) + 'px,' + (cr.top + cr.height / 2 - (pr.top + pr.height / 2)) + 'px) scale(' + (cr.width / pr.width).toFixed(3) + ')';
        anim(api, card, [{ transform:from, opacity:0.4 }, { transform:'none', opacity:1 }], { duration:340, easing:'cubic-bezier(.2,.8,.3,1)', fill:'both' });
        if (api.lite || api.reduced) card.animate && card.animate([{ opacity:0 }, { opacity:1 }], { duration:200, fill:'both' });
        const bar = card.querySelector('.zz-qbar b');
        const runBar = (ms)=>{ bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = 'transform ' + (ms / 1000) + 's linear'; bar.style.transform = 'scaleX(0)'; };
        const stopBar = ()=>{ bar.style.transition = 'none'; };
        const close = ()=> new Promise(res=>{
          const gone = ()=>{ card.remove(); if (!play.querySelector('.zz-q')) api.overlay.classList.remove('zz-asking'); };
          if (api.lite || api.reduced || !card.animate){ gone(); res(); return; }
          const back = card.animate([{ transform:'none', opacity:1 }, { transform:from, opacity:0 }], { duration:300, easing:'ease-in', fill:'both' });
          back.onfinish = ()=>{ gone(); res(); }; });
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
          if (k >= 0){ c.opts[k].classList.add('chosen'); later(()=> reveal(k, ok), api.dt(ZZ_PAUSE_MS)); } else reveal(k, ok);   // (run 2 job 10: a pause after the pick)
        };
        const reveal = (k, ok)=>{
          if (k >= 0) c.opts[k].classList.remove('chosen');
          if (ok){ c.opts[k].classList.add('right'); api.sfx.correct ? api.sfx.correct() : api.sfx.ding(); }
          else { if (k >= 0) c.opts[k].classList.add('wrong'); c.opts[q.correctIdx].classList.add('right'); api.sfx.wrong(); anim(api, c.card, [{ transform:'translateX(0)' }, { transform:'translateX(-10px)' }, { transform:'translateX(9px)' }, { transform:'translateX(-5px)' }, { transform:'translateX(0)' }], { duration:380 }); }
          later(()=>{ c.close().then(()=> res(ok)); }, api.dt(ok ? ZZ_PAUSE_MS : ZZ_PAUSE_MS + 300));   // (run 2 job 10: about 1 s after the reveal)
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
        await wait(api.dt(ZZ_PAUSE_MS)); if (over) return;   // (run 2 job 10: a pause after his pick)
        if (right){
          c.opts[k].classList.add('right', 'flipright'); api.sfx.slam ? api.sfx.slam() : api.sfx.ding(); ui.say('Flip got it! ZAP!');
          await wait(api.dt(ZZ_PAUSE_MS)); if (over) return; await c.close(); if (over) return;
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
          await wait(api.dt(ZZ_PAUSE_MS)); if (over) return; await c.close(); if (over) return;
          mark(i, 'P'); zap(i, false); stamp(i, 'STOLEN!', 'zap stolen');
        } else {
          if (got >= 0){ wrongs++; c.opts[got].classList.add('wrong'); api.sfx.wrong(); ui.say('No steal - the square stays empty.'); }
          else ui.say('Too slow - the square stays empty.');
          await wait(api.dt(ZZ_PAUSE_MS)); if (over) return; await c.close(); if (over) return;
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
          if (win){ set.classList.add('party'); setTimeout(()=> set.classList.remove('party'), 4400); zzWinShow(res.line); return; }   // (the wall flashes in a chase and the searchlights sweep faster)
          setTimeout(()=> finale(api, ui, { win:false, pts:ZZ_PTS.loss, lossWord:'ZaBam!', line:'Flip wins this one. Rematch soon!' }), 700);
        } else {
          ui.say('A draw! Nobody wins the board.');
          anim(api, grid, [{ transform:'scale(1)' }, { transform:'scale(1.05)', offset:0.4 }, { transform:'scale(1)' }], { duration:600, easing:'ease-in-out' });
          const st = slam(api, play, 'DRAW!', 'neutral'); api.sfx.chime && api.sfx.chime(3);
          setTimeout(()=>{ st.remove(); api.score(ZZ_PTS.draw); api.finish({ pts:ZZ_PTS.draw, win:false, line:'A draw - half points!' }); }, 1800);
        }
      };
      // Run 2 job 10: three in a row - the line lights, the three squares burst into sparkles and confetti, ZaBAM! flashes big (twice, under 3 a second),
      // the points go on the score; about 2.7 s, then the results. Lite and reduced motion: the lit line and a still ZaBAM!.
      const zzWinShow = (L)=>{
        const still = api.lite || api.reduced, perfect = !wrongs;
        const word = document.createElement('div'); word.className = 'zz-bigword' + (still ? ' still' : ''); word.innerHTML = 'ZaBAM!' + (perfect ? '<small>PERFECT!</small>' : ''); play.appendChild(word);
        if (api.sfx.slam) api.sfx.slam(); else api.sfx.ding();
        if (!still){
          setTimeout(()=>{ if (!grid.isConnected) return;
            L.forEach((k, n)=>{ const c = cells[k];
              burst(api, c, ['#ffffff', '#7ff3ff', '#ffe27a', '#ff3fb5'], 22);
              c.animate([{ transform:'scale(1)', opacity:1 }, { transform:'scale(1.25)', opacity:1, offset:0.35 }, { transform:'scale(0.2)', opacity:0 }], { duration:650, delay:n * 90, easing:'ease-in', fill:'forwards' }); });
            if (api.FX && api.FX.confettiBurst) try{ api.FX.confettiBurst(api.fxLayer); }catch(e){}
            line.animate([{ opacity:1 }, { opacity:0 }], { duration:500, delay:300, fill:'forwards' });
          }, 520);
        }
        api.score && api.score(ZZ_PTS.win);
        setTimeout(()=>{ word.remove(); api.finish({ pts:ZZ_PTS.win, win:true, line: perfect ? 'Perfect! Not one wrong answer!' : 'ZaBam! You beat Flip!' }); }, still ? 1800 : 2700);
      };
      const check = ()=>{ const w = winnerOf(board); if (w){ end(w); return true; } if (board.every(Boolean) || Date.now() - t0 > ZZ_CAP_MS){ end(null); return true; } return false; };
      cells.forEach((c, i)=> c.addEventListener('click', async ()=>{
        if (busy || over || board[i]) return; busy = true; api.sfx.tap && api.sfx.tap('top');
        cells.forEach(x=> x.classList.add('locked'));
        const ok = await ask(i); if (over) return;
        if (ok){ mark(i, 'P'); zap(i, false); stamp(i, 'ZAP!', 'zap'); ui.say('ZAP! Square claimed!'); }
        else { wrongs++; cells[i].classList.add('bamflash'); mark(i, 'F'); stamp(i, 'BAM!', 'bam'); ui.say('BAM! Flip claims it!'); }
        await wait(api.dt(ZZ_PAUSE_MS)); if (over) return;   // (run 2 job 10: about 1 s before the next turn)
        if (check()) return;
        await flipTurn(); if (over) return;
        await wait(api.dt(ZZ_PAUSE_MS)); if (over) return;
        if (check()) return;
        cells.forEach(x=> x.classList.remove('locked')); ui.say('Your move, Earthling!'); busy = false;
      }));
    },
  });

  // =========================================================================== ALIEN BLAST
  // Whack-a-mole: 25 s on an alien planet at night (mega 4), a 3x3 field of craters. Three waves of about 8 s, each with its banner (WAVE 2, WAVE 3):
  //   green aliens +1 (every 5 in a row lights the combo row, then hits count double); red angry aliens and bombs are decoys (-2, the combo resets);
  //   from wave 2: a golden alien (fast and rare, +5, a sparkle trail), an armoured alien (2 taps - the shield cracks on the first; +2), a sleepy alien
  //   (tap it while it dozes, +1 - it wakes up as a red angry one), and a UFO flying across the top (+3). Later waves: up to 4 at once, faster pop-ups, more decoys.
  // Hits: a green pop with a ring and stars; a red alien steams, a crackle of lightning across its crater, a red ring, a short shake and GRR!; a bomb
  //   explodes - a shockwave ring, smoke, flying debris, a small screen shake, a brief red vignette, BOOM! and the -2 floating up.
  // Points: the score, at most AB_MAX (40, as before). Good targets: everything but the decoys. PERFECT: no decoy tapped and at least 80% of the good
  //   targets hit; the win celebration from 60%.
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
  // the extra targets: a golden alien, an armoured alien (a steel shield over the dome), a sleepy alien (closed eyes, Zzz)
  const AB_GOLD = AB_GREEN.replace(/abG/g, 'abGd').replace('#e9ffd6', '#fffbe0').replace('#7dff6a', '#ffd23f').replace('#1fae3a', '#e09a00').replace('#0b5e22', '#7a4a00').replace(/#3bd15a/g, '#ffcc33').replace(/#c8ff9a/g, '#fff4b0').replace('#d9ffc8', '#fff4d6').replace('#0b3d17', '#5a3200');
  const AB_ARMOR = AB_GREEN.replace('</svg>', '<path class="ab-shield" d="M16 54 C14 30 30 14 50 14 C70 14 86 30 84 54 L84 60 L16 60 Z" fill="url(#abSh)" stroke="#e8f0ff" stroke-width="2.5"/>' +
    '<defs><linearGradient id="abSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8ff"/><stop offset="0.45" stop-color="#9fb0cc"/><stop offset="1" stop-color="#4a5670"/></linearGradient></defs>' +
    '<path d="M24 40 L76 40" stroke="#ffffff" stroke-width="2" opacity="0.6"/><circle cx="30" cy="50" r="2.4" fill="#e8f0ff"/><circle cx="50" cy="50" r="2.4" fill="#e8f0ff"/><circle cx="70" cy="50" r="2.4" fill="#e8f0ff"/>' +
    '<path class="ab-crack" d="M50 16 L46 28 L54 34 L47 46 L53 58 M46 28 L36 30 M54 34 L64 30" stroke="#1a1f2e" stroke-width="2.6" fill="none" stroke-linejoin="round"/></svg>');
  const AB_SLEEPY = AB_GREEN.replace(/<ellipse cx="35" cy="52"[^>]*\/><ellipse cx="65" cy="52"[^>]*\/>/, '<path d="M24 54 Q35 60 46 54" stroke="#0b3d17" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M54 54 Q65 60 76 54" stroke="#0b3d17" stroke-width="4" fill="none" stroke-linecap="round"/>')
    .replace(/<ellipse cx="32" cy="45"[^>]*\/><ellipse cx="62" cy="45"[^>]*\/><circle cx="38" cy="58"[^>]*\/><circle cx="68" cy="58"[^>]*\/>/, '').replace('</svg>', '<text x="74" y="22" font-size="18" font-weight="900" fill="#e9ffd6" font-family="Arial">z</text><text x="86" y="10" font-size="13" font-weight="900" fill="#e9ffd6" font-family="Arial">z</text></svg>');
  const AB_UFOSVG = '<svg viewBox="0 0 120 60" aria-hidden="true"><defs><radialGradient id="abU" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#e8ffff"/><stop offset="1" stop-color="#27e6ff"/></radialGradient><linearGradient id="abUb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4ff"/><stop offset="0.5" stop-color="#a8a8c8"/><stop offset="1" stop-color="#4a4a68"/></linearGradient></defs>' +
    '<ellipse cx="60" cy="24" rx="22" ry="16" fill="url(#abU)" stroke="#fff" stroke-width="2"/><ellipse cx="60" cy="36" rx="56" ry="13" fill="url(#abUb)" stroke="#fff" stroke-width="2"/><circle cx="30" cy="38" r="4" fill="#ff3fb5"/><circle cx="60" cy="42" r="4" fill="#ffd23f"/><circle cx="90" cy="38" r="4" fill="#35f08a"/></svg>';
  // the night planet set: a teal-to-violet sky with stars, a huge ringed planet, a green aurora waving slowly, rocky ground with glowing crystals and mushrooms,
  // drifting fireflies and two sweeping searchlights (transform / opacity only)
  const abSetHtml = ()=>{
    let stars = ''; for (let k = 0; k < 40; k++) stars += '<i class="as-star" style="left:' + ((k * 37) % 100) + '%;top:' + ((k * 53) % 55) + '%;--d:' + ((k % 7) * 0.6).toFixed(1) + 's"></i>';
    let flies = ''; for (let k = 0; k < 12; k++) flies += '<i class="as-fly" style="left:' + (6 + (k * 29) % 88) + '%;top:' + (48 + (k * 17) % 40) + '%;--d:' + (-(k * 1.3)).toFixed(1) + 's;--dx:' + (((k % 2) ? 1 : -1) * (18 + k * 3)) + 'px"></i>';
    let glow = ''; const gx = [4, 14, 27, 71, 83, 93]; gx.forEach((x, k)=> glow += '<i class="as-cry ' + (k % 2 ? 'mush' : '') + '" style="left:' + x + '%;--d:' + (k * 0.7).toFixed(1) + 's"></i>');
    // makeover job 14: a deep starfield drifting slowly down behind everything (two layers, transform only) and a few shooting stars
    const field = '<i class="as-field f1"></i><i class="as-field f2"></i>' + [0, 1, 2].map(k=> '<i class="as-shoot" style="left:' + (15 + k * 30) + '%;top:' + (6 + k * 9) + '%;--d:' + (k * 2.7).toFixed(1) + 's"></i>').join('');
    return '<i class="as-sky"></i>' + field + stars + '<i class="as-planet"><i class="as-ring"></i></i><i class="as-aurora a"></i><i class="as-aurora b"></i>' +
      '<i class="as-beam l"></i><i class="as-beam r"></i><i class="as-ground"></i>' + glow + flies + '<i class="as-vig"></i>';
  };
  MG.register('alienBlast', {
    name: 'Alien Blast', colors: ['#35f08a', '#7a3cff', '#120a2e'], bulb: '#ffe27a',
    rule: 'Tap the green aliens. Avoid the red ones!', host: '',
    available: ()=> true,
    run(api){
      const set = setLayer(api, 'ab-set', abSetHtml()), vig = set.querySelector('.as-vig');
      const ui = chrome(api, { title:'ALIEN BLAST', sub:'WAVE 1 OF 3', rule:'Tap the green aliens. Avoid the red ones!', msg:'Get ready...' });
      api.overlay.classList.add('nx-ab');
      const play = ui.play;
      play.innerHTML = '<div class="ab-sky" aria-hidden="false"></div><div class="ab-field">' + Array.from({ length:9 }, (_, i)=> '<div class="ab-portal" data-i="' + i + '"><i class="ab-hole"></i><div class="ab-pit"></div><i class="ab-rim"></i></div>').join('') + '</div>' +
        '<div class="ab-combo" aria-hidden="true">' + Array.from({ length:5 }, ()=> '<i></i>').join('') + '<b class="ab-x2">x2</b></div>';
      const portals = [...play.querySelectorAll('.ab-portal')], field = play.querySelector('.ab-field'), sky = play.querySelector('.ab-sky'), comboLights = [...play.querySelectorAll('.ab-combo i')], x2 = play.querySelector('.ab-x2');
      ui.panel.classList.add('timed');
      let score = 0, combo = 0, goods = 0, hits = 0, decoys = 0, over = false, running = false, startAt = 0, spawnT = 0, timers = [], wave = 1;
      const later = (fn, ms)=>{ const t = setTimeout(()=>{ if (!over) fn(); }, ms); timers.push(t); return t; };
      api.onClose = ()=>{ over = true; timers.forEach(clearTimeout); clearTimeout(spawnT); };
      const quiet = api.lite || api.reduced;
      const setCombo = ()=>{ const n = combo ? ((combo - 1) % 5) + 1 : 0; comboLights.forEach((l, k)=> l.classList.toggle('on', k < n)); api.overlay.classList.toggle('ab-double', combo >= 5); };
      const at = (el, fy)=>{ const r = el.getBoundingClientRect(), pr = play.getBoundingClientRect(); return [r.left + r.width / 2 - pr.left, r.top - pr.top + r.height * (fy == null ? 0.3 : fy)]; };
      const fx = (cls, parent, x, y)=>{ const e = document.createElement('i'); e.className = cls; e.style.left = x + 'px'; e.style.top = y + 'px'; parent.appendChild(e); return e; };
      const shake = (px, ms)=> anim(api, api.stage, [{ transform:'translate(0,0)' }, { transform:'translate(' + -px + 'px,' + px / 2 + 'px)' }, { transform:'translate(' + px + 'px,' + -px / 2 + 'px)' }, { transform:'translate(' + -px / 2 + 'px,0)' }, { transform:'translate(0,0)' }], { duration:ms });
      const ring = (p, cls)=>{ const r = document.createElement('i'); r.className = 'ab-ring ' + (cls || ''); p.appendChild(r);
        if (r.animate && !quiet) r.animate([{ transform:'translate(-50%,-50%) scale(0.4)', opacity:1 }, { transform:'translate(-50%,-50%) scale(1.6)', opacity:0 }], { duration:500, easing:'ease-out' }).onfinish = ()=> r.remove(); else setTimeout(()=> r.remove(), 400); };
      // makeover job 14: a particle burst on every hit - a bright pop, a ring of sparks and a few glowing shards flying out (transform and opacity only)
      const hitBurst = (x, y, colors)=>{
        if (quiet || !Element.prototype.animate) return;
        const C = colors || ['#27e6ff', '#ffffff', '#35f08a'];
        const pop = fx('ab-pop', play, x, y); pop.style.setProperty('--c', C[0]);
        pop.animate([{ transform:'translate(-50%,-50%) scale(0.2)', opacity:1 }, { transform:'translate(-50%,-50%) scale(1.3)', opacity:0 }], { duration:320, easing:'ease-out', fill:'both' }).onfinish = ()=> pop.remove();
        for (let k = 0; k < 16; k++){ const sp = fx('ab-spark2', play, x, y), ang = k / 16 * Math.PI * 2, d = 40 + (k % 4) * 16; sp.style.setProperty('--c', C[k % C.length]);
          sp.animate([{ transform:'translate(-50%,-50%) rotate(' + (ang * 57.3).toFixed(0) + 'deg) translateX(0) scaleX(0.6)', opacity:1 }, { transform:'translate(-50%,-50%) rotate(' + (ang * 57.3).toFixed(0) + 'deg) translateX(' + d + 'px) scaleX(1.2)', opacity:0 }], { duration:480 + (k % 3) * 80, easing:'cubic-bezier(.2,.7,.3,1)', fill:'both' }).onfinish = ()=> sp.remove(); }
      };
      const gain = (v, a, x, y, colors)=>{ hitBurst(x, y, colors); hits++; combo++; const m = combo > 5 ? 2 : 1; score += v * m; api.score(score); floatText(api, play, x, y, '+' + v * m, 'gold'); burst(api, a, colors || ['#27e6ff', '#ffffff', '#35f08a'], 12);
        api.sfx.tap && api.sfx.tap('top'); if (api.FX && api.FX.sound) api.FX.sound('zap');
        if (combo % 5 === 0){ api.sfx.combo ? api.sfx.combo() : api.sfx.ding(); x2.classList.remove('go'); void x2.offsetWidth; x2.classList.add('go'); const mq = document.getElementById('showMarquee');
          if (mq && !quiet){ const bs = mq.querySelectorAll('i'); bs.forEach((b, k)=> b.style.setProperty('--p', (k / Math.max(1, bs.length)).toFixed(3))); mq.classList.remove('bw-chase'); void mq.offsetWidth; mq.classList.add('bw-chase'); setTimeout(()=> mq.classList.remove('bw-chase'), 1700); } }
        setCombo(); };
      const lose = (x, y)=>{ decoys++; combo = 0; score -= 2; api.score(score); floatText(api, play, x, y, '-2', 'red'); setCombo(); };
      // the BOMB: a big explosion - flash, a shockwave ring, smoke, debris flying out, a small screen shake, a brief red vignette, BOOM! and the -2
      const boom = (p, a)=>{
        const [x, y] = at(a, 0.55); lose(x, y - 20);
        api.sfx.buzzer ? api.sfx.buzzer() : api.sfx.wrong(); if (api.sfx.slam) api.sfx.slam();
        const w = slam(api, play, 'BOOM!', 'boom'); w.style.left = Math.max(70, Math.min(play.clientWidth - 70, x)) + 'px'; w.style.top = y + 'px'; setTimeout(()=> w.remove(), 900);
        if (quiet){ vig.style.opacity = 0.5; setTimeout(()=> vig.style.opacity = 0, 350); return; }
        const fl = fx('ab-flash', play, x, y); fl.animate([{ transform:'translate(-50%,-50%) scale(0.2)', opacity:1 }, { transform:'translate(-50%,-50%) scale(1.4)', opacity:0 }], { duration:380, easing:'ease-out', fill:'both' }).onfinish = ()=> fl.remove();
        const sw = fx('ab-shock', play, x, y); sw.animate([{ transform:'translate(-50%,-50%) scale(0.2)', opacity:1 }, { transform:'translate(-50%,-50%) scale(2.6)', opacity:0 }], { duration:700, easing:'ease-out', fill:'both' }).onfinish = ()=> sw.remove();
        { const sw2 = fx('ab-shock', play, x, y); sw2.animate([{ transform:'translate(-50%,-50%) scale(0.2)', opacity:0.8 }, { transform:'translate(-50%,-50%) scale(1.8)', opacity:0 }], { duration:600, delay:120, easing:'ease-out', fill:'both' }).onfinish = ()=> sw2.remove(); }
        for (let k = 0; k < 10; k++){ const fi = fx('ab-fire', play, x, y), ang = k / 10 * Math.PI * 2, dist = 34 + (k % 3) * 18;   // (makeover job 14: fireballs rolling out)
          fi.animate([{ transform:'translate(-50%,-50%) scale(0.5)', opacity:1 }, { transform:'translate(calc(-50% + ' + (Math.cos(ang) * dist).toFixed(0) + 'px), calc(-50% + ' + (Math.sin(ang) * dist - 10).toFixed(0) + 'px)) scale(1.6)', opacity:0 }], { duration:620 + (k % 3) * 90, easing:'ease-out', fill:'both' }).onfinish = ()=> fi.remove(); }
        for (let k = 0; k < 3; k++){ const sm = fx('ab-smoke', play, x + (k - 1) * 16, y); sm.animate([{ transform:'translate(-50%,-50%) scale(0.4)', opacity:0.9 }, { transform:'translate(-50%,' + (-60 - k * 14) + 'px) scale(1.9)', opacity:0 }], { duration:900 + k * 150, delay:80, easing:'ease-out', fill:'both' }).onfinish = ()=> sm.remove(); }
        for (let k = 0; k < 16; k++){ const d = fx('ab-debris', play, x, y), ang = k / 16 * Math.PI * 2 + 0.3, dist = 80 + (k % 3) * 30;
          d.animate([{ transform:'translate(-50%,-50%) rotate(0deg)', opacity:1 }, { transform:'translate(calc(-50% + ' + Math.cos(ang) * dist + 'px), calc(-50% + ' + (Math.sin(ang) * dist + 30) + 'px)) rotate(' + (k * 97) + 'deg)', opacity:0 }], { duration:650, easing:'cubic-bezier(.2,.7,.4,1)', fill:'both' }).onfinish = ()=> d.remove(); }
        shake(9, 360);
        vig.animate([{ opacity:0 }, { opacity:0.75, offset:0.25 }, { opacity:0 }], { duration:450, easing:'ease-out' });
      };
      // the RED ANGRY ALIEN: steam puffs, a crackle of lightning across its crater, a red ring, a short shake, GRR!
      const grr = (p, a)=>{
        const [x, y] = at(a, 0.2); lose(x, y);
        api.sfx.buzzer ? api.sfx.buzzer() : api.sfx.wrong();
        const w = slam(api, play, 'GRR!', 'grr'); w.style.left = Math.max(60, Math.min(play.clientWidth - 60, x)) + 'px'; w.style.top = (y - 30) + 'px'; setTimeout(()=> w.remove(), 800);
        ring(p, 'red');
        if (quiet) return;
        [-1, 1].forEach((s)=>{ const st = fx('ab-steam', play, x + s * 18, y); st.animate([{ transform:'translate(-50%,-50%) scale(0.5)', opacity:0.9 }, { transform:'translate(calc(-50% + ' + s * 14 + 'px), -40px) scale(1.6)', opacity:0 }], { duration:700, easing:'ease-out', fill:'both' }).onfinish = ()=> st.remove(); });
        const bolt = document.createElement('i'); bolt.className = 'ab-crackle'; bolt.innerHTML = '<svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 15 L14 6 L24 20 L38 4 L50 22 L62 6 L74 20 L86 8 L100 16" stroke="#fff6a0" stroke-width="3.5" fill="none" stroke-linejoin="round"/><path d="M0 15 L14 6 L24 20 L38 4 L50 22 L62 6 L74 20 L86 8 L100 16" stroke="#ff4d3c" stroke-width="8" fill="none" opacity="0.45"/></svg>';
        p.appendChild(bolt); bolt.animate([{ opacity:0, transform:'translate(-50%,-50%) scaleX(0.4)' }, { opacity:1, transform:'translate(-50%,-50%) scaleX(1)', offset:0.2 }, { opacity:0, transform:'translate(-50%,-50%) scaleX(1.05)' }], { duration:420, easing:'ease-out', fill:'both' }).onfinish = ()=> bolt.remove();
        anim(api, field, [{ transform:'translateX(0)' }, { transform:'translateX(-5px)' }, { transform:'translateX(4px)' }, { transform:'translateX(0)' }], { duration:260 });
      };
      const busy = new Set();
      const spawn = (i, kind, upMs)=>{
        const p = portals[i], pit = p.querySelector('.ab-pit'); busy.add(i);
        const a = document.createElement('button'); a.type = 'button'; a.className = 'ab-actor ' + kind;
        a.setAttribute('aria-label', { green:'Green alien', red:'Red alien', bomb:'Bomb', gold:'Golden alien', armor:'Armoured alien', sleepy:'Sleepy alien' }[kind]);
        a.innerHTML = { green:AB_GREEN, red:AB_RED, bomb:AB_BOMB, gold:AB_GOLD, armor:AB_ARMOR, sleepy:AB_SLEEPY }[kind]; pit.appendChild(a);
        let bad = kind === 'red' || kind === 'bomb', taps = 0, gone = false, trail = 0;
        if (!bad) goods++;
        const down = (hit)=>{
          if (gone) return; gone = true; busy.delete(i); clearInterval(trail);
          if (hit || quiet || !a.animate){ a.remove(); return; }
          a.animate([{ transform:'translateY(0) scale(1)' }, { transform:'translateY(105%) scale(0.7)' }], { duration:200, easing:'ease-in', fill:'both' }).onfinish = ()=> a.remove();
        };
        anim(api, a, [{ transform:'translateY(105%) scale(0.6)' }, { transform:'translateY(-6%) scale(1.06)', offset:0.65 }, { transform:'translateY(0) scale(1)' }], { duration:220, easing:'ease-out', fill:'both' });
        if (kind === 'gold' && !quiet) trail = setInterval(()=>{ if (gone) return; const [x, y] = at(a, 0.5); const t = fx('ab-trail', play, x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 30);
          t.animate([{ transform:'translate(-50%,-50%) scale(1) rotate(0deg)', opacity:1 }, { transform:'translate(-50%,-80%) scale(0.2) rotate(90deg)', opacity:0 }], { duration:600, easing:'ease-out', fill:'both' }).onfinish = ()=> t.remove(); }, 110);
        // the sleepy alien wakes up as a red angry one
        if (kind === 'sleepy') later(()=>{ if (gone) return; bad = true; goods--; a.className = 'ab-actor red woke'; a.innerHTML = AB_RED; a.setAttribute('aria-label', 'Red alien'); anim(api, a, [{ transform:'scale(1)' }, { transform:'scale(1.18) rotate(-6deg)', offset:0.4 }, { transform:'scale(1)' }], { duration:300 }); }, Math.round(upMs * 0.5));
        later(()=> down(false), upMs);
        a.addEventListener('pointerdown', (e)=>{
          e.preventDefault(); if (gone || !running) return;
          const [x, y] = at(a);
          if (bad){ if (a.classList.contains('bomb') || kind === 'bomb') boom(p, a); else grr(p, a); down(true); return; }
          if (kind === 'armor' && taps === 0){ taps++; a.classList.add('cracked'); api.sfx.clack ? api.sfx.clack() : (api.sfx.tick && api.sfx.tick(false)); anim(api, a, [{ transform:'translateX(0)' }, { transform:'translateX(-4px)' }, { transform:'translateX(4px)' }, { transform:'translateX(0)' }], { duration:200 }); floatText(api, play, x, y, 'CRACK!', 'white'); return; }
          const v = kind === 'gold' ? 5 : kind === 'armor' ? 2 : 1;
          gain(v, a, x, y, kind === 'gold' ? ['#ffe27a', '#ffffff', '#ffd23f'] : null);
          ring(p, kind === 'gold' ? 'gold' : 'cyan');
          anim(api, a, [{ transform:'scale(1)', opacity:1 }, { transform:'scale(1.35)', opacity:0 }], { duration:200, easing:'ease-out', fill:'both' });
          setTimeout(()=> down(true), quiet ? 0 : 190);
        });
      };
      // the UFO crossing the top: tap it for +3
      const flyUfo = ()=>{
        if (over || !running) return;
        const u = document.createElement('button'); u.type = 'button'; u.className = 'ab-ufo'; u.setAttribute('aria-label', 'UFO'); u.innerHTML = AB_UFOSVG; sky.appendChild(u); goods++;
        const W = play.clientWidth, dir = api.rng() < 0.5 ? 1 : -1, ms = api.dt(2600);
        let hit = false;
        const go = u.animate ? u.animate([{ transform:'translateX(' + (dir > 0 ? -90 : W + 10) + 'px)' }, { transform:'translateX(' + (dir > 0 ? W + 10 : -90) + 'px)' }], { duration:ms, easing:'linear', fill:'both' }) : null;
        if (!go){ u.style.left = '40%'; }
        later(()=>{ if (!hit) u.remove(); }, ms + 50);
        u.addEventListener('pointerdown', (e)=>{ e.preventDefault(); if (hit || !running) return; hit = true; const r = u.getBoundingClientRect(), pr = play.getBoundingClientRect(); gain(3, u, r.left + r.width / 2 - pr.left, r.top - pr.top + 10, ['#27e6ff', '#ff3fb5', '#ffe27a']);
          if (go) go.pause(); anim(api, u, [{ opacity:1 }, { opacity:0 }], { duration:250, fill:'both' }); setTimeout(()=> u.remove(), 260); });
      };
      // the waves: about 8 s each - the pace, how many at once and the mix get harder
      const WAVES = [ { gap:900, up:1000, most:2, mix:[['green', 0.76], ['red', 0.14], ['bomb', 0.10]] },
        { gap:700, up:820, most:3, mix:[['green', 0.50], ['red', 0.15], ['bomb', 0.11], ['gold', 0.06], ['armor', 0.10], ['sleepy', 0.08]] },
        { gap:480, up:660, most:4, mix:[['green', 0.40], ['red', 0.18], ['bomb', 0.14], ['gold', 0.07], ['armor', 0.10], ['sleepy', 0.11]] } ];
      const waveMs = ()=> api.dt(AB_MS) / 3;
      const tick = ()=>{
        if (over || !running) return;
        const W = WAVES[wave - 1], free = portals.map((_, k)=> k).filter(k=> !busy.has(k));
        if (busy.size < W.most && free.length){
          const i = free[Math.floor(api.rng() * free.length)]; let r = api.rng(), kind = W.mix[0][0];
          for (const [k, w] of W.mix){ if (r < w){ kind = k; break; } r -= w; }
          spawn(i, kind, api.dt(kind === 'gold' ? Math.round(W.up * 0.6) : kind === 'armor' ? Math.round(W.up * 1.35) : W.up));
        }
        spawnT = later(tick, api.dt(W.gap * (0.75 + api.rng() * 0.5)));
      };
      const nextWave = (n)=>{
        if (over || !running) return; wave = n; ui.sub('WAVE ' + n + ' OF 3');
        const b = slam(api, play, 'WAVE ' + n, 'wave'); api.sfx.chime && api.sfx.chime(3 + n); setTimeout(()=> b.remove(), 900);
        ui.say(n === 2 ? 'Golden aliens are worth 5!' : 'Here they come! Tap the UFOs!');
        if (n === 2) later(flyUfo, api.dt(3000));
        if (n === 3){ later(flyUfo, api.dt(1500)); later(flyUfo, api.dt(5200)); }
      };
      const finish = ()=>{
        running = false; ui.say('TIME!'); const t = slam(api, play, 'TIME!', 'time'); api.sfx.buzzer ? api.sfx.buzzer() : api.sfx.wrong();
        portals.forEach(p=> p.querySelectorAll('.ab-actor').forEach(a=> a.remove())); sky.textContent = '';
        later(()=>{
          t.remove();
          const ratio = goods ? hits / goods : 0, pts = Math.max(0, Math.min(AB_MAX, score)), perfect = !decoys && ratio >= 0.8, win = ratio >= 0.6;
          ui.say(hits + ' of ' + goods + ' targets blasted!');
          finale(api, ui, win ? { win:true, perfect, pts, word:'BLASTED!', line: perfect ? 'Perfect aim, Earthling!' : 'Nice blasting!' } : { win:false, pts, lossWord:'AWW!', line:'Those aliens were slippery!' });
        }, 1100);
      };
      // 3, 2, 1, BLAST!
      (async ()=>{
        for (const n of ['3', '2', '1', 'BLAST!']){ if (over) return; const c = slam(api, play, n, n.length > 1 ? 'go' : 'count'); api.sfx.tick ? api.sfx.tick(n.length > 1) : null; await wait(api.dt(n.length > 1 ? 600 : 650)); c.remove(); }
        if (over) return;
        running = true; startAt = Date.now(); ui.say('Blast the green aliens!');
        const bar = ui.ptimer.querySelector('b'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(1)'; void bar.offsetWidth; bar.style.transition = 'transform ' + (api.dt(AB_MS) / 1000) + 's linear'; bar.style.transform = 'scaleX(0)';
        tick(); later(()=> nextWave(2), waveMs()); later(()=> nextWave(3), waveMs() * 2); later(finish, api.dt(AB_MS));
        if (window.FLIPSTAX_TEST_HOST === true && /[?&](replay|debug)=/.test(location.search)) window.__abSpawn = (i, kind)=> spawn(i, kind, api.dt(3000));   // (tests only)
      })();
    },
  });

  // =========================================================================== SPACE LAUNCH
  // Three rounds: a marker sweeps up and down a tall power meter; tap LAUNCH (or anywhere) to stop it. The green zone shrinks (22%, 14%, 9% of the meter)
  // and the sweep speeds up. Dead centre (the middle 20% of the band) is PERFECT!, in the band GREAT!, just outside CLOSE, else OOPS. The rocket rises
  // by the hit; the three heights add up to the score. PERFECT LAUNCH: all three PERFECT!. A total of 17 or more wins.
  // mega 4: a launch site - a twilight sky in layers (stars, distant clouds, a horizon glow) that scroll with parallax as the rocket rises, a launch tower with
  // blinking lights, sweeping searchlights and a pad lit by the flame. A 3, 2, 1 countdown with the pad lights and a rumble opens the game; on liftoff the camera
  // follows (the layers scroll, clouds streak past, the flame grows, stage-separation pieces fall away on a GREAT or better, the height ticks light up); a miss
  // sputters and drops back in smoke. PERFECT LAUNCH: on through the clouds, the atmosphere and space with streaking stars to the MOON - its surface rises into
  // view with craters and the Earth glowing in the sky, the rocket lands slowly on its thrusters, a flag goes in, fireworks, searchlights, MOON LANDING! - then
  // the shared BIG WIN CELEBRATION (about 7 s; a tap skips). The rocket and the pad are about 30% larger.
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
      setLayer(api, 'sl-set', '<i class="ls-sky"></i><i class="ls-glow"></i><i class="ls-beam l"></i><i class="ls-beam r"></i><i class="ls-hills"></i>');
      const ui = chrome(api, { title:'SPACE LAUNCH', sub:'ROUND 1 OF 3', rule:'Tap to stop the marker in the green zone!', msg:'Countdown...' });
      api.overlay.classList.add('nx-sl');
      const play = ui.play;
      play.innerHTML = '<div class="sl-wrap"><div class="sl-meter"><i class="sl-ticks"></i><i class="sl-band"><u></u></i><i class="sl-trail"></i><i class="sl-mark"></i></div>' +
        '<div class="sl-scene"><i class="sl-sky"></i><div class="sl-par far"><i class="sl-stars"></i></div>' +
        '<div class="sl-par mid"><i class="sl-cloud c1"></i><i class="sl-cloud c2"></i><i class="sl-cloud c3"></i></div>' +
        '<div class="sl-par near"><i class="sl-hglow"></i><i class="sl-land"></i><div class="sl-tower"><i class="sl-tl a"></i><i class="sl-tl b"></i><i class="sl-tl c"></i></div>' +
        '<div class="sl-pad"><i class="sl-bulbs"></i></div><i class="sl-padlight"></i></div><div class="sl-streaks"></div>' +
        '<div class="sl-heights">' + Array.from({ length:10 }, ()=> '<i></i>').join('') + '</div>' +
        '<div class="sl-rocket"><i class="sl-flame"></i>' + SL_ROCKET + '</div><div class="sl-smoke"></div></div></div>' +
        '<button type="button" class="nx-gold sl-go">LAUNCH!</button>';
      const meter = play.querySelector('.sl-meter'), band = play.querySelector('.sl-band'), mark = play.querySelector('.sl-mark'), trail = play.querySelector('.sl-trail');
      const scene = play.querySelector('.sl-scene'), rocket = play.querySelector('.sl-rocket'), flame = play.querySelector('.sl-flame'), smoke = play.querySelector('.sl-smoke'), heights = [...play.querySelectorAll('.sl-heights i')], go = play.querySelector('.sl-go');
      const pars = { far:play.querySelector('.sl-par.far'), mid:play.querySelector('.sl-par.mid'), near:play.querySelector('.sl-par.near') }, streaks = play.querySelector('.sl-streaks'), quiet = api.lite || api.reduced;
      const PAR_F = { far:0.18, mid:0.5, near:0.95 };
      // the camera follows the rocket: the layers scroll down by their parallax factor (and back for the next round)
      const parallax = (dy, ms)=> Object.keys(pars).forEach(k=>{ const el = pars[k], to = 'translateY(' + (dy * PAR_F[k]).toFixed(1) + 'px)';
        if (quiet || !el.animate){ el.style.transform = to; return; } const from = el.style.transform || 'translateY(0px)'; el.style.transform = to; el.animate([{ transform:from }, { transform:to }], { duration:ms, easing:'cubic-bezier(.45,0,.3,1)' }); });
      const streak = (n, cls, ms)=>{ if (quiet) return; for (let k = 0; k < n; k++){ const c = document.createElement('i'); c.className = cls; c.style.left = (8 + api.rng() * 80) + '%'; streaks.appendChild(c);
        c.animate([{ transform:'translateY(-120%)', opacity:0 }, { transform:'translateY(40%)', opacity:0.9, offset:0.3 }, { transform:'translateY(' + (scene.clientHeight + 60) + 'px)', opacity:0 }], { duration:ms + api.rng() * 250, delay:k * 140, easing:'linear', fill:'both' }).onfinish = ()=> c.remove(); } };
      const separate = ()=>{ if (quiet) return; [-1, 1].forEach((d)=>{ const pc = document.createElement('i'); pc.className = 'sl-sep'; rocket.appendChild(pc);
        pc.animate([{ transform:'translate(-50%,0) rotate(0deg)', opacity:1 }, { transform:'translate(calc(-50% + ' + d * 34 + 'px), 150px) rotate(' + d * 220 + 'deg)', opacity:0 }], { duration:1100, easing:'cubic-bezier(.4,0,.8,.6)', fill:'both' }).onfinish = ()=> pc.remove(); }); };
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
          const climb = rise * 0.55;   // (the rocket climbs part of the way; the camera follows it for the rest - the layers scroll with parallax)
          const up = anim(api, rocket, [{ transform:'translateY(0)' }, { transform:'translateY(' + (-climb) + 'px)' }], { duration:1300, easing:'cubic-bezier(.45,0,.3,1)', fill:'forwards' });
          if (api.lite || api.reduced) rocket.style.transform = 'translateY(' + (-climb) + 'px)';
          parallax(rise * 0.9, 1300); streak(r === 'PERFECT' ? 4 : 3, 'sl-cstreak', 700);
          anim(api, flame, [{ transform:'scaleY(1)' }, { transform:'scaleY(' + (1.4 + SL_RISE[r]) + ')' }], { duration:900, easing:'ease-out', fill:'forwards' });
          if (r === 'PERFECT' || r === 'GREAT') later(separate, 520);
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
          if (perfect){ ui.say('Next stop: the MOON!'); await moonLanding(); if (over) return; }
          finale(api, ui, win ? { win:true, perfect, pts:total, word: perfect ? 'PERFECT LAUNCH!' : 'LIFT OFF!', line: perfect ? 'A perfect launch!' : 'Into orbit, Earthling!' } : { win:false, pts:total, lossWord:'AWW!', line:'Houston, we have a sputter.' });
          return;
        }
        // back to the pad for the next round
        await Promise.resolve(anim(api, rocket, [{ opacity:1 }, { opacity:0 }], { duration:250, fill:'forwards' }).finished);
        rocket.getAnimations && rocket.getAnimations().forEach(a=> a.cancel()); rocket.style.transform = '';
        flame.getAnimations && flame.getAnimations().forEach(a=> a.cancel());
        heights.forEach(h=> h.classList.remove('on')); parallax(0, 350);
        anim(api, rocket, [{ opacity:0, transform:'translateY(16px)' }, { opacity:1, transform:'translateY(0)' }], { duration:300, easing:'ease-out' });
        await wait(450); if (!over) startRound();
      };
      go.addEventListener('click', (e)=>{ e.stopPropagation(); launch(); });
      play.addEventListener('click', ()=> launch());
      // the opening countdown: 3, 2, 1 with the pad lights and a rumble, then the first round
      (async ()=>{
        await wait(api.dt(400)); scene.classList.add('count');
        for (const n of ['3', '2', '1']){ if (over) return; const c = slam(api, play, n, 'count'); api.sfx.tick ? api.sfx.tick(n === '1') : null;
          anim(api, play.querySelector('.sl-wrap'), [{ transform:'translate(0,0)' }, { transform:'translate(-2px,1px)' }, { transform:'translate(2px,-1px)' }, { transform:'translate(0,0)' }], { duration:200, iterations:2 });
          await wait(api.dt(650)); c.remove(); }
        scene.classList.remove('count'); if (!over) startRound();
      })();
      // PERFECT LAUNCH: the voyage to the moon (about 7 s; a tap skips to the landing)
      function moonLanding(){
        return new Promise(res=>{
          const v = document.createElement('div'); v.className = 'sl-voyage';
          v.innerHTML = '<i class="sv-space"></i><div class="sv-stars"></div><i class="sv-earth"></i><div class="sv-moon"><i class="sv-cr a"></i><i class="sv-cr b"></i><i class="sv-cr c"></i><i class="sv-cr d"></i></div>' +
            '<i class="sv-beam l"></i><i class="sv-beam r"></i><div class="sv-rocket"><i class="sv-thrust"></i>' + SL_ROCKET + '</div><div class="sv-flag"><i class="sv-pole"></i><i class="sv-cloth"></i></div><div class="sv-fw"></div><div class="sv-skip">TAP TO SKIP</div>';
          play.appendChild(v); api.overlay.classList.add('sl-voyaging');
          const stars = v.querySelector('.sv-stars'), moon = v.querySelector('.sv-moon'), vr = v.querySelector('.sv-rocket'), flag = v.querySelector('.sv-flag'), fw = v.querySelector('.sv-fw');
          let doneV = false; const t = [];
          const at = (ms, fn)=> t.push(setTimeout(()=>{ if (!doneV && !over) fn(); }, api.dt(ms)));
          const finishV = ()=>{ if (doneV) return; doneV = true; t.forEach(clearTimeout); v.classList.add('landed', 'flag', 'out'); setTimeout(()=>{ v.remove(); api.overlay.classList.remove('sl-voyaging'); res(); }, quiet ? 200 : 450); };
          v.addEventListener('click', (e)=>{ e.stopPropagation(); if (!v.classList.contains('landed')){ t.forEach(clearTimeout); v.classList.add('landed', 'flag'); slamMoon(); at(1600, finishV); } else finishV(); });
          const slamMoon = ()=>{ const b = slam(api, v, 'MOON LANDING!', 'moon'); b.style.top = '30%'; if (api.sfx.slam) api.sfx.slam(); };
          if (quiet){ v.classList.add('landed', 'flag'); slamMoon(); at(2200, finishV); return; }
          // 1. on through the clouds, the atmosphere and space: the sky darkens, stars streak past
          v.classList.add('rise');
          for (let k = 0; k < 26; k++){ const st = document.createElement('i'); st.style.left = (api.rng() * 100) + '%'; stars.appendChild(st);
            st.animate([{ transform:'translateY(-30px) scaleY(1)', opacity:0 }, { transform:'translateY(' + (v.clientHeight * 0.5) + 'px) scaleY(5)', opacity:1, offset:0.5 }, { transform:'translateY(' + (v.clientHeight + 40) + 'px) scaleY(2)', opacity:0 }],
              { duration:700 + api.rng() * 500, delay:api.rng() * 1900, iterations:2, easing:'linear', fill:'both' }); }
          if (api.sfx.ufoBeam) api.sfx.ufoBeam();
          // 2. the moon rises into view, the Earth glows in the sky, the rocket comes down slowly on its thrusters
          at(2300, ()=>{ v.classList.add('moon'); });
          at(2700, ()=>{ v.classList.add('descend'); });
          // 3. touchdown: dust, the flag, fireworks, the searchlights sweep and MOON LANDING!
          at(4700, ()=>{ v.classList.add('landed'); api.sfx.whoosh && api.sfx.whoosh(); burst(api, vr, ['#d9d9e6', '#ffffff'], 10); });
          at(5000, ()=>{ v.classList.add('flag'); api.sfx.ding(); });
          at(5300, ()=>{ slamMoon(); for (let k = 0; k < 5; k++) at(150 + k * 260, ()=>{ const p = document.createElement('i'); p.className = 'sv-pop'; p.style.left = (15 + api.rng() * 70) + '%'; p.style.top = (8 + api.rng() * 28) + '%'; fw.appendChild(p);
            burst(api, p, [['#ff3fb5', '#ffe27a'], ['#27e6ff', '#ffffff'], ['#35f08a', '#ffe27a']][k % 3].concat(['#ffffff']), 18); setTimeout(()=> p.remove(), 900); }); });
          at(7000, finishV);
        });
      }
    },
  });
})();
