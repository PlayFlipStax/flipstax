/* FlipStax - GAME SELECT (the Mystery Portal's screen): a retro 80s arcade game-select screen. All the Portal's games at once in a 3 x 3 grid of neon
   tiles; a tap highlights a tile and shows its name and one line about it, the big PLAY button confirms. A star marks each game the player has played
   (the caller keeps that on the device). GameSelect.open(opts) builds the screen and returns { close }:
     opts.title, opts.show          the big title (two words go on two lines) and the small show name above it
     opts.games                     [{ key, name, desc, color, art }] - art is ready markup (a logo's SVG, a picture or an emoji)
     opts.played                    { key:true } - the games with a star
     opts.locked                    a game key: today's game is already chosen (the once-a-day rule) - only that tile can be played
     opts.autoMs                    with no tap for this long the screen picks for the player, so the show never stalls
     opts.onPick(key)               called once, after PLAY (or the automatic pick)
     opts.sfx                       the game's sounds (tap, lockIn)
   The pixel lettering is drawn here from a 5 x 7 bitmap alphabet as crisp SVG rectangles - no font file, nothing loaded from the network.
   Motion is in lib/game-select.css (transform and opacity only; lite mode and reduced motion: still, the glow stays). Images and CSS only, no video. */
(function(){
  'use strict';
  // ---- the 5 x 7 pixel alphabet (each row is 5 bits, left to right)
  const G = {
    A:'01110 10001 10001 11111 10001 10001 10001', B:'11110 10001 10001 11110 10001 10001 11110', C:'01110 10001 10000 10000 10000 10001 01110',
    D:'11110 10001 10001 10001 10001 10001 11110', E:'11111 10000 10000 11110 10000 10000 11111', F:'11111 10000 10000 11110 10000 10000 10000',
    G:'01110 10001 10000 10111 10001 10001 01111', H:'10001 10001 10001 11111 10001 10001 10001', I:'11111 00100 00100 00100 00100 00100 11111',
    J:'00111 00010 00010 00010 00010 10010 01100', K:'10001 10010 10100 11000 10100 10010 10001', L:'10000 10000 10000 10000 10000 10000 11111',
    M:'10001 11011 10101 10101 10001 10001 10001', N:'10001 11001 10101 10011 10001 10001 10001', O:'01110 10001 10001 10001 10001 10001 01110',
    P:'11110 10001 10001 11110 10000 10000 10000', Q:'01110 10001 10001 10001 10101 10010 01101', R:'11110 10001 10001 11110 10100 10010 10001',
    S:'01111 10000 10000 01110 00001 00001 11110', T:'11111 00100 00100 00100 00100 00100 00100', U:'10001 10001 10001 10001 10001 10001 01110',
    V:'10001 10001 10001 10001 10001 01010 00100', W:'10001 10001 10001 10101 10101 11011 10001', X:'10001 10001 01010 00100 01010 10001 10001',
    Y:'10001 10001 01010 00100 00100 00100 00100', Z:'11111 00001 00010 00100 01000 10000 11111',
    0:'01110 10001 10011 10101 11001 10001 01110', 1:'00100 01100 00100 00100 00100 00100 01110', 2:'01110 10001 00001 00010 00100 01000 11111',
    3:'11110 00001 00001 01110 00001 00001 11110', 4:'00010 00110 01010 10010 11111 00010 00010', 5:'11111 10000 11110 00001 00001 10001 01110',
    6:'00110 01000 10000 11110 10001 10001 01110', 7:'11111 00001 00010 00100 01000 01000 01000', 8:'01110 10001 10001 01110 10001 10001 01110',
    9:'01110 10001 10001 01111 00001 00010 01100',
    '!':'00100 00100 00100 00100 00100 00000 00100', '?':'01110 10001 00001 00010 00100 00000 00100', '-':'00000 00000 00000 11111 00000 00000 00000',
    '.':'00000 00000 00000 00000 00000 01100 01100', "'":'00100 00100 01000 00000 00000 00000 00000', ':':'00000 01100 01100 00000 01100 01100 00000',
    '+':'00000 00100 00100 11111 00100 00100 00000', '*':'00100 00100 11111 01110 01110 11011 10001', '&':'01100 10010 10100 01000 10101 10010 01101',
  };
  // pixel text as one SVG path (runs of pixels merged along each row); `shadow` adds a hard offset copy one pixel down and right
  function pix(text, cls, shadow){
    const s = String(text == null ? '' : text).toUpperCase(); let d = '', x0 = 0;
    for (const ch of s){
      const g = G[ch];
      if (g){ g.split(' ').forEach((row, y)=>{ let x = 0; while (x < 5){ if (row[x] === '1'){ let w = 1; while (x + w < 5 && row[x + w] === '1') w++; d += 'M' + (x0 + x) + ' ' + y + 'h' + w + 'v1h-' + w + 'z'; x += w; } else x++; } }); }
      x0 += 6;
    }
    const w = Math.max(1, x0 - 1) + (shadow ? 1 : 0), h = 7 + (shadow ? 1 : 0);
    return '<svg class="gs-px ' + (cls || '') + '" viewBox="0 0 ' + w + ' ' + h + '" style="--pw:' + w + ';--ph:' + h + '" shape-rendering="crispEdges" aria-hidden="true">' +
      (shadow ? '<path class="sh" transform="translate(1 1)" d="' + d + '"/>' : '') + '<path d="' + d + '"/></svg>';
  }
  const esc = (t)=> String(t == null ? '' : t).replace(/[&<>"]/g, c=> ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const ufo = '<svg viewBox="0 0 60 34" aria-hidden="true"><path d="M20 15 Q21 3 30 3 Q39 3 40 15 Z" fill="#7df9ff" opacity="0.9"/><ellipse cx="30" cy="18" rx="27" ry="8" fill="#b9c0d8"/><ellipse cx="30" cy="16.5" rx="27" ry="6" fill="#e6eaf6"/>' +
    '<circle cx="12" cy="19" r="2" fill="#ff3fb5"/><circle cx="24" cy="21.5" r="2" fill="#ffd23f"/><circle cx="36" cy="21.5" r="2" fill="#4be683"/><circle cx="48" cy="19" r="2" fill="#27e6ff"/><path d="M22 25 L38 25 L44 34 L16 34 Z" fill="#7df9ff" opacity="0.25"/></svg>';
  // a tile's name: one line, or two when it is long (SAUCER / SHUFFLE)
  function nameLines(name){
    const w = String(name).trim().split(/\s+/); if (w.length < 2 || name.length <= 8) return [name];
    let best = 1, diff = 1e9; for (let k = 1; k < w.length; k++){ const a = w.slice(0, k).join(' ').length, b = w.slice(k).join(' ').length, dd = Math.max(a, b) * 10 + Math.abs(a - b); if (dd < diff){ diff = dd; best = k; } }
    return [w.slice(0, best).join(' '), w.slice(best).join(' ')];
  }

  function open(o){
    o = o || {};
    const games = (o.games || []).slice(0, 9), played = o.played || {}, sfx = o.sfx || {}, S = (k)=>{ try{ if (sfx[k]) sfx[k](); }catch(e){} };
    const old = document.getElementById('gsOverlay'); if (old) old.remove();
    const ov = document.createElement('div'); ov.id = 'gsOverlay'; ov.className = 'gs'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', o.title || 'Select game');
    const titleWords = String(o.title || 'SELECT GAME').trim().split(/\s+/), titleLines = titleWords.length === 2 ? titleWords : [titleWords.join(' ')];
    const nPlayed = games.filter(g=> played[g.key]).length;
    let stars = ''; for (let k = 0; k < 2; k++) stars += '<i class="gs-stars s' + (k + 1) + '"><b></b></i>';
    ov.innerHTML = '<div class="gs-bg" aria-hidden="true">' + stars + '<i class="gs-shoot"></i><i class="gs-ufo u1">' + ufo + '</i><i class="gs-ufo u2">' + ufo + '</i></div>' +
      '<div class="gs-floor" aria-hidden="true"><i class="gs-horizon"></i><div class="gs-plane"><i></i></div></div>' +
      '<div class="gs-inner">' +
        '<div class="gs-show">' + pix(o.show || '', 'px-show') + '</div>' +
        '<h2 class="gs-title" aria-label="' + esc(o.title || '') + '">' + titleLines.map((t, k)=> pix(t, 'px-title l' + (k + 1), true)).join('') + '</h2>' +
        '<div class="gs-count">' + pix(nPlayed + ' OF ' + games.length + ' PLAYED', 'px-count') + '</div>' +
        '<div class="gs-grid">' + games.map((g, i)=>
          '<button type="button" class="gs-tile' + (played[g.key] ? ' played' : '') + (o.locked && o.locked !== g.key ? ' locked' : '') + '" data-k="' + esc(g.key) + '" style="--c:' + g.color + ';--i:' + i + '" aria-label="' + esc(g.name) + (played[g.key] ? ' (played)' : '') + '">' +
            '<span class="gs-frame"><span class="gs-face">' +
              '<span class="gs-num">' + pix(i + 1, 'px-num') + '</span>' + (played[g.key] ? '<span class="gs-star">' + pix('*', 'px-star') + '</span>' : '') +
              '<span class="gs-art">' + g.art + '</span>' +
              '<span class="gs-name">' + nameLines(g.name).map(l=> pix(l, 'px-name')).join('') + '</span>' +
            '</span></span></button>').join('') + '</div>' +
        '<div class="gs-slot"><div class="gs-hint">' + pix('- TAP A GAME -', 'px-hint') + '</div><div class="gs-info" aria-live="polite"><b></b><span></span></div></div>' +
        '<button type="button" class="gs-play" disabled>' + pix('PLAY', 'px-play', true) + '</button>' +
      '</div><i class="gs-scan" aria-hidden="true"></i><i class="gs-vig" aria-hidden="true"></i>';
    document.body.appendChild(ov);
    const tiles = [...ov.querySelectorAll('.gs-tile')], playBtn = ov.querySelector('.gs-play'), info = ov.querySelector('.gs-info'), hint = ov.querySelector('.gs-hint');
    let sel = null, done = false, autoT = 0;
    const byKey = (k)=> games.find(g=> g.key === k);
    const select = (k, quiet)=>{
      if (done) return; const g = byKey(k); if (!g || (o.locked && o.locked !== k)) return;
      sel = k; tiles.forEach(t=> t.classList.toggle('sel', t.dataset.k === k));
      info.querySelector('b').textContent = g.name; info.querySelector('span').textContent = (o.locked ? 'Today2019s game 00B7 ' : '') + (g.desc || ''); info.style.setProperty('--c', g.color); info.classList.add('on'); ov.classList.add('has-info');
      playBtn.disabled = false; ov.classList.add('has-sel'); if (!quiet) S('tap');
    };
    const hover = (k)=>{ if (done || sel) return; const g = byKey(k); if (!g || (o.locked && o.locked !== k)) return;
      info.querySelector('b').textContent = g.name; info.querySelector('span').textContent = (o.locked ? 'Today2019s game 00B7 ' : '') + (g.desc || ''); info.style.setProperty('--c', g.color); info.classList.add('on'); ov.classList.add('has-info'); };
    const arm = ()=>{ clearTimeout(autoT); if (o.autoMs > 0) autoT = setTimeout(auto, o.autoMs); };
    const confirm = ()=>{
      if (done || !sel) return; done = true; clearTimeout(autoT); S('lockIn');
      ov.classList.add('picked'); tiles.forEach(t=>{ t.disabled = true; }); playBtn.disabled = true;
      setTimeout(()=>{ if (o.onPick) o.onPick(sel); }, o.confirmMs == null ? 650 : o.confirmMs);
    };
    // nobody tapped: the highlighted game, else a game not yet played, else any
    function auto(){
      if (done) return;
      if (!sel){ const open = games.filter(g=> !o.locked || o.locked === g.key), fresh = open.filter(g=> !played[g.key]), pool = fresh.length ? fresh : open; if (!pool.length) return; select(pool[Math.floor(Math.random() * pool.length)].key, true); }
      confirm();
    }
    tiles.forEach(t=>{
      t.addEventListener('click', ()=>{ select(t.dataset.k); arm(); });
      t.addEventListener('pointerenter', (e)=>{ if (e.pointerType === 'mouse') hover(t.dataset.k); });
    });
    playBtn.addEventListener('click', confirm);
    ov.addEventListener('pointerdown', arm);
    if (o.locked) select(o.locked, true);
    arm();
    if (/[?&](replay|debug)=/.test(location.search) && window.FLIPSTAX_TEST_HOST === true) window.__gs = { select, confirm, keys: ()=> games.map(g=> g.key), sel: ()=> sel };   // (tests only, never on a production host)
    return { el: ov, close(){ done = true; clearTimeout(autoT); ov.remove(); } };
  }
  window.GameSelect = { open, pix };
})();
