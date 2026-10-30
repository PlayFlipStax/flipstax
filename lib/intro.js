/* FlipStax - the mothership intro (Oct 25): the landing page and the 18 s portrait video that plays on ENTER.

   Landing (overnight job 6): the video's twilight sky (data/intro/sky.webp - its first frame with the ship painted out, framed like the video),
   twinkling CSS stars, the real FlipStax logo, 'Galactic Game Night' and a gold pulsing ENTER button; on ENTER the saucer flies in (flyShip).
   ENTER (a user gesture): the video plays full screen (muted, playsinline, object-fit cover; preloaded while the landing shows), a small
   SKIP appears after 1 s; when it ends or is skipped, one soft cyan flash, then the show's own curtains and Flip's four intro lines.
   If the video can't play (autoplay blocked, an error, lite mode, reduced motion) the poster (the video's last frame) shows for 1.5 s and
   the show goes on. The intro never blocks the game: a watchdog ends it if the video stalls. It has played once -> flipstax_intro_seen_v1
   in localStorage (in try/catch); on repeat visits ENTER skips the video (flash, curtains) and a small 'Watch intro' link plays it again.
   Off in the test modes (?replay=1, ?debug=...); ?intro=1 forces it; ?oldintro=1 brings back the old landing (kept, behind this flag).
   Transform and opacity only; no animated shadows; one flash. */
(function(root){
  if (typeof document === 'undefined') return;
  const DIR = 'data/intro/', SEEN_KEY = 'flipstax_intro_seen_v1';
  const q = (()=>{ try{ return new URLSearchParams(root.location.search); }catch(e){ return new URLSearchParams(''); } })();
  const doc = document.documentElement;
  let land = null, player = null, video = null, flashEl = null, warpEl = null, skipBtn = null, linkEl = null, busy = false, opts = {}, timers = [];
  const later = (ms, f)=>{ const t = setTimeout(f, ms); timers.push(t); return t; };
  const clearAll = ()=>{ timers.forEach(clearTimeout); timers = []; };
  const seen = ()=>{ try{ return !!localStorage.getItem(SEEN_KEY); }catch(e){ return false; } };
  const markSeen = ()=>{ try{ localStorage.setItem(SEEN_KEY, '1'); }catch(e){} };
  const quiet = ()=> doc.classList.contains('lite') || (root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) || doc.classList.contains('rm');
  const enabled = ()=> !q.has('oldintro') && !!land;
  // the test modes skip the video (every test taps ENTER and goes on); ?intro=1 plays it anyway
  const testing = ()=> !q.has('intro') && !!(opts.testing && opts.testing());

  function build(host){
    land = document.createElement('div'); land.id = 'introLand'; land.setAttribute('aria-hidden', 'true');
    let stars = ''; for (let k = 0; k < 34; k++){ const r = (n)=> ((k * 9301 + n * 49297) % 233280) / 233280;
      stars += '<i style="left:' + (r(1) * 100).toFixed(1) + '%;top:' + (r(2) * 62).toFixed(1) + '%;width:' + (1.5 + r(3) * 2.5).toFixed(1) + 'px;height:' + (1.5 + r(3) * 2.5).toFixed(1) + 'px;animation-delay:' + (-r(4) * 4).toFixed(2) + 's;animation-duration:' + (1.6 + r(5) * 2.4).toFixed(2) + 's"></i>'; }
    // (overnight job 6: no Flip on the landing - the twilight sky of the video's first frame with the ship painted out, framed exactly like the
    // video (cover, centred), the real logo, the tagline, the stars; the ship flies in on ENTER)
    land.innerHTML = '<img class="il-img sky" alt="" src="' + DIR + 'sky.webp"><div class="il-stars">' + stars + '</div>' +
      '<div class="il-title"><img class="il-logo" src="images/flipstax-logo-final.webp" alt="FlipStax"><span class="il-tag">Galactic Game Night</span></div>' +
      '<div class="il-shipwrap" aria-hidden="true"><i class="il-shipglow"></i><img class="il-ship" alt="" src="images/saucer-purple.webp"></div>';
    host.insertBefore(land, host.firstChild);
    // the player: the video, the poster, SKIP, and the flash
    player = document.createElement('div'); player.id = 'introPlayer'; player.setAttribute('role', 'dialog'); player.setAttribute('aria-label', 'Intro');
    player.innerHTML = '<video id="introVideo" muted playsinline preload="auto" poster="' + DIR + 'poster.webp"></video><img class="ip-poster" alt="" src="' + DIR + 'poster.webp"><button type="button" class="ip-skip" aria-label="Skip the intro">SKIP</button>';
    document.body.appendChild(player);
    video = player.querySelector('video'); skipBtn = player.querySelector('.ip-skip');
    video.muted = true; video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', '');
    warpEl = document.createElement('div'); warpEl.id = 'introWarp'; warpEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(warpEl);
    flashEl = document.createElement('div'); flashEl.id = 'introFlash'; flashEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(flashEl);
    // preload while the landing shows (a repeat visit loads it only for the 'Watch intro' link: after the first paint)
    const load = ()=>{ try{ video.src = DIR + 'mothership-intro.mp4'; video.load(); }catch(e){} };
    (root.requestIdleCallback || ((f)=> setTimeout(f, 600)))(()=>{ if (!quiet()) load(); });
    // the 'Watch intro' link (repeat visits)
    linkEl = document.createElement('button'); linkEl.type = 'button'; linkEl.id = 'introWatch'; linkEl.textContent = 'Watch intro'; linkEl.hidden = true;
    linkEl.addEventListener('click', (e)=>{ e.stopPropagation(); Intro.run(null, { force:true }); });
    host.appendChild(linkEl);
    refreshLink();
  }
  function refreshLink(){ if (linkEl) linkEl.hidden = !seen(); }

  // one soft cyan flash (a single pulse: it never repeats); `then` runs while it is at its brightest
  function flash(then){
    if (!flashEl){ then && then(); return; }
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    later(quiet() ? 0 : 230, ()=>{ then && then(); });
    later(700, ()=> flashEl.classList.remove('go'));
  }
  // the last frame (or the poster) fades into the stage over 0.8 s (opacity); lite and reduced motion cut
  function fadeOut(){
    if (!player) return;
    if (quiet()){ player.classList.remove('on', 'poster', 'fade'); return; }
    later(120, ()=>{ player.classList.add('fade'); later(860, ()=> player.classList.remove('on', 'poster', 'fade')); });
  }
  function stop(){ clearAll(); busy = false; if (player) player.classList.remove('on', 'poster'); try{ video.pause(); }catch(e){} }

  function flyShip(then){
    const wrap = land.querySelector('.il-shipwrap'), ship = land.querySelector('.il-ship'); if (!wrap || !ship || !warpEl) return false;
    const W = root.innerWidth, H = root.innerHeight, k = Math.max(W / 540, H / 960), ox = (W - 540 * k) / 2, oy = (H - 960 * k) / 2;
    const fx = ox + 270 * k, fy = oy + 473 * k, fw = 334 * k;   // the video's ship in its first frame: centre (270, 473), 334 px wide of 540 x 960
    wrap.style.width = fw.toFixed(1) + 'px'; doc.classList.add('il-leaving'); wrap.classList.add('on');
    const at = (x, y, s, r)=> 'translate(' + (x - fw / 2).toFixed(1) + 'px,' + (y - fw * 0.226).toFixed(1) + 'px) scale(' + s + ') rotate(' + r + 'deg)';
    const a = wrap.animate([
      { transform: at(-0.18 * W, 0.30 * H, 0.1, -16), opacity:0 },
      { transform: at(0.10 * W, 0.24 * H, 0.16, -12), opacity:1, offset:0.1 },
      { transform: at(0.82 * W, 0.20 * H, 0.32, 12), offset:0.42 },
      { transform: at(0.34 * W, 0.34 * H, 0.6, -9), offset:0.74 },
      { transform: at(fx, fy, 1, 0), opacity:1 }], { duration:3000, easing:'cubic-bezier(.45,.05,.4,1)', fill:'forwards' });
    // the ship's last moments end in one short bright warp flash (0.4 s, opacity only): at its fully opaque peak the silver ship is removed and
    // the video (whose ship is purple) starts underneath, then the flash fades away over it - the swap is never seen
    warpEl.classList.remove('go'); void warpEl.offsetWidth;
    later(2800, ()=>{ warpEl.classList.add('go'); });
    later(2980, ()=>{ wrap.classList.remove('on'); doc.classList.remove('il-leaving'); try{ a.cancel(); }catch(e){} then(); });
    later(3300, ()=> warpEl.classList.remove('go'));
    return true;
  }
  const Intro = {
    // opts.testing(): true in the test modes (no video there)
    init(o){ opts = o || {}; if (q.has('oldintro')) return; const host = document.getElementById('homeOverlay'); if (!host || land) return; build(host); doc.classList.add('intro-new'); },
    get enabled(){ return enabled(); },
    get busy(){ return busy; },
    // a returning visitor (the intro played before, not a test mode): lands straight on the Play Today screen
    get returning(){ return enabled() && seen() && !testing() && !q.has('intro'); },
    // The ENTER tap: play the intro (first visit), then a flash, then done() - the curtains. force: 'Watch intro' - play it, flash, nothing after.
    run(done, o){
      o = o || {};
      if (busy) return; busy = true;
      const go = ()=>{ stop(); if (done) done(); };
      if (!o.force && (testing() || (seen() && !q.has('intro')))){ flash(go); return; }   // repeat visits and the test modes: no video
      markSeen(); refreshLink();
      let finished = false, started = false;
      // finish: the last frame stays up under one cyan flash; at the flash's peak the stage is built underneath (curtains already open: no second curtain), then the last frame crossfades into it over 0.4 s
      // A+: the video's Flip and the studio's Flip are never on screen together: the video (or its poster) fades to black over 0.3 s, the stage is built
      // under the black, then the black fades away over 0.5 s to show the studio (opacity only; the same plain fades in lite mode and reduced motion).
      const finish = ()=>{ if (finished) return; finished = true; clearAll(); try{ video.pause(); }catch(e){} busy = false;
        player.classList.add('dip'); skipBtn.classList.remove('show');
        later(320, ()=>{ root.__introCurtainsOpen = true; if (done) done();
          later(40, ()=>{ player.classList.add('fade'); later(580, ()=>{ player.classList.remove('on', 'poster', 'fade', 'dip'); }); }); }); };
      const posterThenGo = ()=>{ if (finished) return; clearAll(); try{ video.pause(); }catch(e){} player.classList.add('on', 'poster'); skipBtn.classList.remove('show'); later(Math.round(1500 * ((root.FLIPSTAX_PACE && root.FLIPSTAX_PACE.PACE) || 1)), finish); };   // (A+ pacing: PACE x the poster hold)
      const startVideo = (xfade)=>{
      player.classList.add('on'); player.classList.remove('poster'); skipBtn.classList.remove('show');
      if (xfade){ player.classList.add('xin'); requestAnimationFrame(()=> requestAnimationFrame(()=> player.classList.remove('xin'))); }
      skipBtn.onclick = (e)=>{ e.stopPropagation(); finish(); };
      later(1000, ()=> skipBtn.classList.add('show'));
      if (quiet()){ posterThenGo(); return; }
      try{
        if (!video.getAttribute('src')){ video.src = DIR + 'mothership-intro.mp4'; video.load(); }
        video.currentTime = 0; video.muted = true;
        video.onended = finish; video.onerror = posterThenGo; video.onplaying = ()=>{ started = true; };
        const p = video.play(); if (p && p.catch) p.catch(posterThenGo);
      }catch(e){ posterThenGo(); return; }
      later(4500, ()=>{ if (!started) posterThenGo(); });          // never stuck on a stalled load
      later(26000, finish);                                          // the whole intro is 18 s: a hard cap
      };
      // Overnight job 6: on ENTER (first visit) the logo and button fade, the saucer comes in small from the side edge, banks along a curve and
      // grows toward the camera (about 3 s, a soft glow), landing exactly where the video's own ship sits in its first frame; the video then
      // crossfades in. Lite / reduced motion / no animation support: straight to the video as before.
      if (!o.force && done && !quiet() && land && land.animate && flyShip(()=> startVideo(false))) return;
      startVideo(false);
    },
    stop,
  };
  root.Intro = Intro;
})(typeof window !== 'undefined' ? window : globalThis);
