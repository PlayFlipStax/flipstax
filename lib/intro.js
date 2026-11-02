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
  let land = null, player = null, video = null, flashEl = null, warpEl = null, blastEl = null, coverEl = null, flightCleanup = null, blastRaf = 0, blastDone = false, skipBtn = null, linkEl = null, busy = false, opts = {}, timers = [];
  const later = (ms, f)=>{ const t = setTimeout(f, ms); timers.push(t); return t; };
  const clearAll = ()=>{ timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(blastRaf); blastRaf = 0; };
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
    land.innerHTML = '<div class="il-pic"><img class="il-bg" alt="" src="images/enter-bg.webp" width="900" height="1612"><i class="il-beampulse"></i></div><i class="il-enterglow" aria-hidden="true"></i>' +
      '<div class="il-shipwrap" aria-hidden="true"><i class="il-shipglow"></i><img class="il-ship" alt="" src="images/saucer-purple.webp"></div>';
    host.insertBefore(land, host.firstChild);
    // the player: the video, the poster, SKIP, and the flash
    player = document.createElement('div'); player.id = 'introPlayer'; player.setAttribute('role', 'dialog'); player.setAttribute('aria-label', 'Intro');
    player.innerHTML = '<video id="introVideo" muted playsinline preload="auto" poster="' + DIR + 'poster.webp"></video><img class="ip-poster" alt="" src="' + DIR + 'poster.webp"><button type="button" class="ip-skip" aria-label="Skip the intro">SKIP</button>';
    document.body.appendChild(player);
    video = player.querySelector('video'); skipBtn = player.querySelector('.ip-skip');
    blastEl = document.createElement('div'); blastEl.id = 'introBlast'; blastEl.setAttribute('aria-hidden', 'true'); blastEl.innerHTML = '<i></i>'; player.insertBefore(blastEl, skipBtn);
    coverEl = document.createElement('div'); coverEl.id = 'introCover'; coverEl.setAttribute('aria-hidden', 'true'); player.insertBefore(coverEl, blastEl); placeCover(0);
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
  function stop(){ clearAll(); if (flightCleanup) flightCleanup(); busy = false; if (player) player.classList.remove('on', 'poster'); try{ video.pause(); }catch(e){} }

  // Cyan cuts on the video's clock (measured by frame differences; review-shots/aplus/cuts/ has before / after thumbnails). All opacity and transform only,
  // never more than one pulse at a time, at least 3 s apart. `at` is the cut; the cyan is at full for `hold` ms around it so the cut happens underneath.
  //  - 3.65 s: Flip's face in the cockpit pulls back to the ship from outside (a 0.2 s cyan dissolve)
  //  - 5.45 s: the ship's belly orb (it starts to light at 4.7 s, is full white by 5.0 and turns cyan as the beam fires at 5.45 - frames in review-shots/aplus/cuts/sheet-4_4-6_2.png)
  //            - the PHOTON BLAST, a cyan bar swelling from 5.25 s to a full screen, the beam firing underneath, gone by 5.65 s (0.4 s in all)
  //  - 8.42 s: the front view of the saucer firing its beam dissolves (8.25 to 8.6 s) into the view from below with the tall beam (frames in review-shots/aplus/cuts/):
  //            a cyan-white glow ramps from nothing to the full screen over the 1.0 s before the cut, peaks at the cut itself (the dissolve happens under the white-out) and fades over 0.4 s
  //  - 12.72 s: the beam over the stage cuts to the curtains (a 0.25 s cyan dissolve)
  // Lite mode and reduced motion never play the video (its poster shows instead), so they never see any of this. Watched by a rAF loop.
  const CUES = [ { at:3.65, in:80, hold:0, out:120, bar:false }, { at:5.45, in:100, hold:0, out:100, bar:true, peak:0.4 }, { at:8.42, in:1000, hold:0, out:400, bar:false, glow:true }, { at:12.72, in:100, hold:0, out:150, bar:false } ];
  // The video's own first 3 s have a hard horizon edge near the top (a dark band with a pale glow above it, the edge climbing from about 34% to
  // 12% of the height) - a flaw in the picture itself, so the video is full-bleed but that band is hidden by a soft dark cover that rides the edge
  // (transform only) and fades out by 3.2 s. Edge positions measured by frame differences (fractions of the height).
  const EDGE = [[0, 0.344], [0.5, 0.32], [1.0, 0.286], [1.1, 0.30], [1.5, 0.28], [2.0, 0.23], [2.3, 0.14], [2.5, 0.12], [2.7, 0.095], [3.0, 0.05], [3.2, 0.0]];
  function placeCover(t){
    if (!coverEl) return;
    if (t >= 3.2){ coverEl.style.opacity = '0'; return; }
    let y = EDGE[EDGE.length - 1][1]; for (let i = 1; i < EDGE.length; i++){ if (t <= EDGE[i][0]){ const a = EDGE[i - 1], b = EDGE[i]; y = a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); break; } }
    const H = player.clientHeight || root.innerHeight;
    coverEl.style.transform = 'translateY(' + ((y + 0.035 - 1) * H).toFixed(1) + 'px)';
    coverEl.style.opacity = t > 2.9 ? String(Math.max(0, (3.2 - t) / 0.3)) : '1';
  }
  function blastWatch(){
    cancelAnimationFrame(blastRaf); blastDone = false;
    if (!blastEl || !blastEl.animate) return;
    const done = CUES.map(()=> false);
    const tick = ()=>{
      blastRaf = requestAnimationFrame(tick);
      const t = video.currentTime || 0;
      placeCover(t);
      if (video.paused) return;
      CUES.forEach((c, i)=>{
        if (done[i]) return;
        const start = c.at - c.hold / 2000 - c.in / 1000;
        if (t >= start && t < start + 0.25){
          done[i] = true;
          const bar = blastEl.firstChild, plain = quiet(), lead = Math.max(0, (start + c.in / 1000 - t) * 1000), total = lead + c.hold + c.out;
          blastEl.classList.toggle('plain', plain); blastEl.classList.toggle('diss', !c.bar && !c.glow); blastEl.classList.toggle('glow', !!c.glow);
          const o = lead / total, hold = (lead + c.hold) / total;
          const pk = plain && c.glow ? 1 : (c.peak || 1);
          blastEl.animate([{ opacity:0, easing:'ease-in' }, { opacity:pk, offset:Math.max(o, 0.001) }, { opacity:pk, offset:hold, easing:'ease-out' }, { opacity:0 }], { duration:total, fill:'none' });
          if (!plain && c.bar) bar.animate([{ transform:'scaleX(1)', easing:'ease-in' }, { transform:'scaleX(9)', offset:Math.max(o, 0.001) }, { transform:'scaleX(9)' }], { duration:total });
        }
      });
      if (done.every(Boolean) || t > 13.2){ cancelAnimationFrame(blastRaf); blastRaf = 0; }
    };
    blastRaf = requestAnimationFrame(tick);
  }

  // ENTER to the close-up: the landing fades in 0.45 s and the saucer flies in for FLIGHT_MS (0.9 s, it was 3 s of an empty dark sky with a small ship), then the
  // video crossfades in over 0.35 s - about 1.2 s from the tap to the close-up, and never more than a moment of empty dark frame
  const FLIGHT_MS = 900;
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
      { transform: at(fx, fy, 1, 0), opacity:1 }], { duration:FLIGHT_MS, easing:'cubic-bezier(.45,.05,.4,1)', fill:'forwards' });
    // the ship's last moments end in one short bright warp flash (0.4 s, opacity only): at its fully opaque peak the silver ship is removed and
    // the video (whose ship is purple) starts underneath, then the flash fades away over it - the swap is never seen
    warpEl.classList.remove('go'); void warpEl.offsetWidth;
    // (no white warp flash any more: the video starts under the landing and crossfades in once its first frame is painted)
    flightCleanup = ()=>{ wrap.classList.remove('on'); doc.classList.remove('il-leaving'); try{ a.cancel(); }catch(e){} flightCleanup = null; };
    later(FLIGHT_MS - 20, ()=>{ then(); });
    later(FLIGHT_MS + 1300, ()=>{ if (flightCleanup) flightCleanup(); });
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
      // The video's last frame is held (no black dip: the player stays on, the video paused on its final frame), the stage is built underneath, and after a moment to
      // paint the held frame crossfades into the stage over 0.5 s (opacity only; the same plain fade in lite mode and reduced motion, where the poster is the last frame).
      const finish = ()=>{ if (finished) return; finished = true; clearAll(); try{ video.pause(); }catch(e){} busy = false;
        skipBtn.classList.remove('show');
        root.__introCurtainsOpen = true; if (done) done();
        later(120, ()=>{ player.classList.add('fade'); later(560, ()=>{ player.classList.remove('on', 'poster', 'fade', 'dip'); if (flightCleanup) flightCleanup(); }); }); };
      const posterThenGo = ()=>{ if (finished) return; clearAll(); try{ video.pause(); }catch(e){} player.classList.add('on', 'poster'); skipBtn.classList.remove('show'); later(Math.round(1500 * ((root.FLIPSTAX_PACE && root.FLIPSTAX_PACE.PACE) || 1)), finish); };   // (A+ pacing: PACE x the poster hold)
      const startVideo = (xfade)=>{
      player.classList.add('on'); player.classList.remove('poster'); skipBtn.classList.remove('show');
      // the video is full-bleed from its very first frame (the poster, the same picture, sits under it); when the landing is still showing (the ship flight)
      // the player starts invisible and crossfades in over 0.35 s once the first frame has been painted - never an empty frame
      let xinOff = ()=>{}; if (xfade){ player.classList.add('xin'); let off = false; xinOff = ()=>{ if (off) return; off = true; requestAnimationFrame(()=> player.classList.remove('xin')); }; later(700, xinOff); }
      skipBtn.onclick = (e)=>{ e.stopPropagation(); finish(); };
      later(1000, ()=> skipBtn.classList.add('show'));
      if (quiet()){ posterThenGo(); return; }
      try{
        if (!video.getAttribute('src')){ video.src = DIR + 'mothership-intro.mp4'; video.load(); }
        video.currentTime = 0; video.muted = true;
        video.onended = finish; video.onerror = posterThenGo; video.onplaying = ()=>{ started = true; if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(()=> xinOff()); else later(120, xinOff); };
        const p = video.play(); if (p && p.catch) p.catch(posterThenGo);
        blastWatch();
      }catch(e){ posterThenGo(); return; }
      later(4500, ()=>{ if (!started) posterThenGo(); });          // never stuck on a stalled load
      later(26000, finish);                                          // the whole intro is 18 s: a hard cap
      };
      // Overnight job 6: on ENTER (first visit) the logo and button fade, the saucer comes in small from the side edge, banks along a curve and
      // grows toward the camera (about 3 s, a soft glow), landing exactly where the video's own ship sits in its first frame; the video then
      // crossfades in. Lite / reduced motion / no animation support: straight to the video as before.
      if (!o.force && done && !quiet() && land && land.animate && flyShip(()=> startVideo(true))) return;
      startVideo(false);
    },
    stop,
    __cover: (t)=> placeCover(t),   // (test hook)
  };
  root.Intro = Intro;
})(typeof window !== 'undefined' ? window : globalThis);
