/* FlipStax - the Part E Mystery Games (Oct 2026).
   Each game registers here; flipstax.html's runMiniGame gives it a full-screen stage in its own colour world (a
   bulb-lit sign, a rule line, a timer bar, a score pill) and an `api`:
     api.stage            the element to build the game in
     api.timer(ms, cb)    starts the timer bar (the last 3 s tick); returns { stop(), left(), add(ms) }
     api.score(n)         shows the running score
     api.flash('win'|'lose'), api.sfx.*, api.FX, api.fxLayer, api.say(text), api.mood(m), api.hostSvg()
     api.rng(), api.shuffle(array)   seeded by the episode
     api.lite, api.reduced           lite mode / reduced motion: no heavy or moving extras
     api.finish({ pts, win, line })  ends the game: points (the act's multiplier is applied), a key for a win
   Games: { name, colors:[light, mid, dark], bulb, rule, available(), run(api) }. Motion is transform and opacity. */
(function(){
  const MG = window.MiniGames = { games: {}, register(key, g){ this.games[key] = g; } };
  const el = (tag, cls, html)=>{ const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (t)=> String(t).replace(/[&<>"]/g, c=> ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  MG.util = { el, esc };

  // ---------------------------------------------------------------- E1. Peak or Plunge (higher or lower)
  // A thing and its number; the next thing's number is hidden: HIGHER or LOWER? 5 rounds, +10 each, 7 s a round.
  // World: coral sunset over navy peaks.
  const PP_ROUNDS = 5, PP_ROUND_MS = 7000;
  const ppFmt = (it)=> it.cat === 'year' ? String(it.value) : it.value.toLocaleString('en-US');
  MG.register('peakOrPlunge', {
    name: 'Peak or Plunge', colors: ['#ff9b7a', '#c2386a', '#16123f'], bulb: '#ffc2a8',
    rule: 'Is the next number HIGHER or LOWER?',
    host: 'Climb high or crash low, Earthling!',
    available: ()=> Array.isArray(window.FLIPSTAX_PEAK_OR_PLUNGE) && window.FLIPSTAX_PEAK_OR_PLUNGE.length >= 20,
    run(api){
      const all = window.FLIPSTAX_PEAK_OR_PLUNGE, cats = ['height', 'year', 'count'];
      let chain = [];
      for (let tries = 0; tries < 6 && chain.length < PP_ROUNDS + 1; tries++){
        const cat = cats[Math.floor(api.rng() * cats.length)];
        chain = [];
        for (const it of api.shuffle(all.filter(x=> x.cat === cat))){ if (chain.length > PP_ROUNDS) break; if (!chain.length || it.value !== chain[chain.length - 1].value) chain.push(it); }
      }
      const s = api.stage;
      s.classList.add('pp-stage');
      s.innerHTML = '<div class="pp-card pp-known"></div><div class="pp-vs">HIGHER OR LOWER?</div><div class="pp-card pp-next"></div>' +
        '<div class="pp-btns"><button type="button" class="pp-btn hi">&#9650; HIGHER</button><button type="button" class="pp-btn lo">&#9660; LOWER</button></div>' +
        '<div class="pp-dots">' + Array.from({ length: PP_ROUNDS }, ()=> '<i></i>').join('') + '</div>';
      const known = s.querySelector('.pp-known'), next = s.querySelector('.pp-next'), btns = [...s.querySelectorAll('.pp-btn')], dots = [...s.querySelectorAll('.pp-dots i')];
      const card = (it, hide)=> '<span class="pp-glyph">' + it.glyph + '</span><span class="pp-name">' + esc(it.name) + '</span>' +
        '<span class="pp-val">' + (hide ? '<b class="pp-q">?</b>' : '<b>' + ppFmt(it) + '</b>') + (it.text ? ' <small>' + esc(it.text) + '</small>' : '') + '</span>';
      let round = 0, right = 0, locked = true, timer = null;
      const show = ()=>{
        known.innerHTML = card(chain[round]); next.innerHTML = card(chain[round + 1], true);
        if (!api.reduced){ next.animate([{ transform:'translateY(30px)', opacity:0 }, { transform:'none', opacity:1 }], { duration:280, easing:'ease-out' }); }
        locked = false; btns.forEach(b=> b.disabled = false);
        timer = api.timer(PP_ROUND_MS, ()=> pick(null));
      };
      const pick = (dir)=>{
        if (locked) return; locked = true; btns.forEach(b=> b.disabled = true); if (timer) timer.stop();
        const a = chain[round], b = chain[round + 1], ok = dir === 'hi' ? b.value > a.value : dir === 'lo' ? b.value < a.value : false;
        const v = next.querySelector('.pp-val b'); v.classList.remove('pp-q'); v.textContent = ppFmt(b);
        if (!api.reduced) v.animate([{ transform:'scale(1.8)', opacity:0 }, { transform:'scale(0.9)', opacity:1, offset:0.6 }, { transform:'scale(1)' }], { duration:380, easing:'ease-out' });
        next.classList.add(ok ? 'right' : 'wrong'); dots[round].classList.add(ok ? 'right' : 'wrong');
        if (ok){ right++; api.score(right * 10); api.sfx.ding(); api.flash('win'); }
        else { api.sfx.wrong(); api.flash('lose'); if (dir === null) api.say('Too slow, Earthling!', 1200); }
        setTimeout(()=>{
          next.classList.remove('right', 'wrong'); round++;
          if (round >= PP_ROUNDS || round + 1 >= chain.length){
            api.finish({ pts: right * 10, win: right >= 3, line: right === PP_ROUNDS ? 'A perfect climb!' : right >= 3 ? 'Peak performance!' : 'What a plunge!' });
            return;
          }
          show();
        }, 1150);
      };
      btns[0].addEventListener('click', ()=>{ api.sfx.tap('top'); pick('hi'); });
      btns[1].addEventListener('click', ()=>{ api.sfx.tap('bottom'); pick('lo'); });
      show();
    },
  });

  // ---------------------------------------------------------------- E2. Snap Sort
  // A category; words drift across three lanes; tap the ones that belong (+4 each), skip the rest. A wrong tap costs a
  // second. 15 s. World: neon lime on black (a snapshot flash).
  const SS_MS = 15000, SS_SPAWN = 1250, SS_CROSS = 4600;
  MG.register('snapSort', {
    name: 'Snap Sort', colors: ['#9fd43a', '#26440a', '#050802'], bulb: '#e4ff7a',
    rule: 'Tap only the ones that fit. A wrong tap costs a second!', host: 'Snap the right ones, skip the rest!',
    available: ()=> Array.isArray(window.FLIPSTAX_SNAP_SORT) && window.FLIPSTAX_SNAP_SORT.length >= 10,
    run(api){
      const list = window.FLIPSTAX_SNAP_SORT, c = list[Math.floor(api.rng() * list.length)];
      const yes = api.shuffle(c.yes).slice(0, 5), no = api.shuffle(c.no).slice(0, 4);
      const words = api.shuffle(yes.map(w=> ({ w, ok:true })).concat(no.map(w=> ({ w, ok:false }))));
      const s = api.stage; s.classList.add('ss-stage');
      s.innerHTML = '<div class="ss-cat"><small>TAP THE</small>' + esc(c.cat.toUpperCase()) + '</div><div class="ss-field"></div><div class="ss-tally"></div>';
      const field = s.querySelector('.ss-field'), tally = s.querySelector('.ss-tally');
      let right = 0, wrong = 0, ended = false, k = 0;
      const anims = [], spawns = [];
      const lanes = [0.16, 0.5, 0.84];
      const spawn = (item, i)=>{
        if (ended) return;
        const b = el('button', 'ss-word' + (item.ok ? ' fits' : ''), esc(item.w)); b.type = 'button';
        b.style.top = (lanes[i % 3] * 100) + '%'; field.appendChild(b);
        const W = field.clientWidth, w = b.offsetWidth;
        const a = b.animate([{ transform:'translate(' + W + 'px,-50%)' }, { transform:'translate(' + (-w - 10) + 'px,-50%)' }], { duration: SS_CROSS, easing:'linear', fill:'forwards' });
        anims.push(a); a.onfinish = ()=> b.remove();
        b.addEventListener('click', ()=>{
          if (ended || b.classList.contains('done')) return; b.classList.add('done'); a.pause();
          if (item.ok){ right++; api.score(right * 4); api.sfx.chime(Math.min(8, right + 2)); b.classList.add('right'); }
          else { wrong++; b.classList.add('wrong'); api.sfx.wrong(); api.flash('lose'); if (timer) timer.add(-1000); }
          tally.textContent = right + ' snapped' + (wrong ? ' · ' + wrong + ' oops' : '');
          b.animate([{ transform:getComputedStyle(b).transform }, { transform:getComputedStyle(b).transform + ' scale(1.25)', opacity:1, offset:0.4 }, { transform:getComputedStyle(b).transform + ' scale(0.6)', opacity:0 }], { duration:420, fill:'forwards' }).onfinish = ()=> b.remove();
        });
      };
      words.forEach((item, i)=> spawns.push(setTimeout(()=> spawn(item, i), 300 + i * SS_SPAWN)));
      const end = ()=>{
        if (ended) return; ended = true; spawns.forEach(clearTimeout); anims.forEach(a=>{ try{ a.pause(); }catch(e){} });
        api.finish({ pts: right * 4, win: right >= 3, line: right === yes.length && !wrong ? 'Snap-tastic! A perfect sort!' : right >= 3 ? 'Sharp eyes!' : 'Those words were slippery!' });
      };
      api.onClose = ()=>{ ended = true; spawns.forEach(clearTimeout); };
      const timer = api.timer(SS_MS, end);
    },
  });
})();
