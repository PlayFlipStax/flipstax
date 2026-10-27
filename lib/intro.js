/* FlipStax - the mothership intro (Oct 25): the landing page and the 18 s portrait video that plays on ENTER.

   Landing: two stills from the video (data/intro/frame0.webp, frame1.webp) crossfading slowly (one fade every 3 s), twinkling CSS
   stars, the chrome FlipStax wordmark, 'Galactic Game Night' and a gold pulsing ENTER button.
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
  let land = null, player = null, video = null, flashEl = null, skipBtn = null, linkEl = null, busy = false, opts = {}, timers = [];
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
    land.innerHTML = '<img class="il-img a" alt="" src="' + DIR + 'frame0.webp"><img class="il-img b" alt="" src="' + DIR + 'frame1.webp"><div class="il-shade"></div><div class="il-stars">' + stars + '</div>' +
      '<div class="il-title"><b class="il-mark">FlipStax</b><span class="il-tag">Galactic Game Night</span></div>';
    host.insertBefore(land, host.firstChild);
    // the player: the video, the poster, SKIP, and the flash
    player = document.createElement('div'); player.id = 'introPlayer'; player.setAttribute('role', 'dialog'); player.setAttribute('aria-label', 'Intro');
    player.innerHTML = '<video id="introVideo" muted playsinline preload="auto" poster="' + DIR + 'poster.webp"></video><img class="ip-poster" alt="" src="' + DIR + 'poster.webp"><button type="button" class="ip-skip" aria-label="Skip the intro">SKIP</button>';
    document.body.appendChild(player);
    video = player.querySelector('video'); skipBtn = player.querySelector('.ip-skip');
    video.muted = true; video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', '');
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
  function stop(){ clearAll(); busy = false; if (player) player.classList.remove('on', 'poster'); try{ video.pause(); }catch(e){} }

  const Intro = {
    // opts.testing(): true in the test modes (no video there)
    init(o){ opts = o || {}; if (q.has('oldintro')) return; const host = document.getElementById('homeOverlay'); if (!host || land) return; build(host); doc.classList.add('intro-new'); },
    get enabled(){ return enabled(); },
    get busy(){ return busy; },
    // The ENTER tap: play the intro (first visit), then a flash, then done() - the curtains. force: 'Watch intro' - play it, flash, nothing after.
    run(done, o){
      o = o || {};
      if (busy) return; busy = true;
      const go = ()=>{ stop(); if (done) done(); };
      if (!o.force && (testing() || (seen() && !q.has('intro')))){ flash(go); return; }   // repeat visits and the test modes: no video
      markSeen(); refreshLink();
      let finished = false, started = false;
      const finish = ()=>{ if (finished) return; finished = true; clearAll(); try{ video.pause(); }catch(e){} player.classList.remove('on', 'poster'); busy = false; flash(()=>{ if (done) done(); }); };
      const posterThenGo = ()=>{ if (finished) return; clearAll(); try{ video.pause(); }catch(e){} player.classList.add('on', 'poster'); skipBtn.classList.remove('show'); later(1500, finish); };
      player.classList.add('on'); player.classList.remove('poster'); skipBtn.classList.remove('show');
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
    },
    stop,
  };
  root.Intro = Intro;
})(typeof window !== 'undefined' ? window : globalThis);
