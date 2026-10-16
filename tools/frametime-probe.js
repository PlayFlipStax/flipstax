// FlipStax frame-time probe (injected by tools/frametime.ps1). Plays one ?replay=1 episode by itself - taps a VS card,
// answers questions, stops Lucky Lights, drops the Orbit Drop chips - and records every animation frame's duration,
// grouped by the show director's current scene (window.__show, present with ?debug=fast or ?debug=1).
// Result: window.__ft.report = { scenes: { <scene>: { frames, p50, p95, max, dropped } }, total: {...} }.
(function(){
  if (window.__ft) return;
  const FT = window.__ft = { report: null, byScene: {} };
  const vis = el=> el && el.isConnected && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none';
  let last = performance.now(), sceneKey = 'start';
  const FRAME = 1000 / 60;
  function frame(now){
    const dt = now - last; last = now;
    const S = window.__show, key = S ? (S.scene === 'mystery' && S.info ? 'mystery:' + S.info : S.scene) : 'start';
    sceneKey = key;
    (FT.byScene[key] = FT.byScene[key] || []).push(dt);
    if (!FT.report) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // a simple player
  let acted = {}, gen = -1;
  function play(){
    if (FT.report) return;
    const S = window.__show;
    if (S && S.gen !== gen){ gen = S.gen; acted = {}; }
    const ro = document.getElementById('readoutOverlay');
    if (ro && ro.classList.contains('show')){ finish(); return; }
    if (S && S.scene === 'vs' && S.state === 'live' && !acted.vs && performance.now() - (acted.at || (acted.at = performance.now())) > 500){ acted.vs = 1; document.getElementById(Math.random() < 0.5 ? 'halfA' : 'halfB').click(); }
    const tiles = [...document.querySelectorAll('#eventOverlay .event-tile')].filter(t=> vis(t) && t.onclick);
    if (tiles.length && !acted.q){ acted.q = 1; setTimeout(()=> tiles[0].click(), 700); }
    document.querySelectorAll('.mg-overlay button').forEach(b=>{ if (vis(b) && !b.disabled && Math.random() < 0.15) b.click(); });
    const lock = document.querySelector('.guess-lock'); if (vis(lock) && !acted.g){ acted.g = 1; setTimeout(()=> lock.click(), 700); }
    const stop = document.querySelector('.ll-btn.stop'), bank = document.querySelector('.ll-btn.bank');
    if (vis(stop) && Math.random() < 0.3) stop.click(); if (vis(bank)) bank.click();
    const all = document.getElementById('plinkoAll'), drop = document.getElementById('plinkoDrop');
    if (vis(drop)) drop.click(); else if (vis(all) && performance.now() - (acted.o || 0) > 2000){ acted.o = performance.now(); all.click(); }
    setTimeout(play, 250);
  }
  setTimeout(play, 500);
  function stats(arr){
    const s = arr.slice().sort((a, b)=> a - b), q = p=> s[Math.min(s.length - 1, Math.floor(p * s.length))];
    const dropped = arr.reduce((a, dt)=> a + Math.max(0, Math.round(dt / FRAME) - 1), 0);
    return { frames: arr.length, p50: +q(0.5).toFixed(1), p95: +q(0.95).toFixed(1), max: +s[s.length - 1].toFixed(1), dropped };
  }
  function finish(){
    const scenes = {}; let all = [];
    Object.keys(FT.byScene).forEach(k=>{ const a = FT.byScene[k].slice(1); if (a.length > 5){ scenes[k] = stats(a); all = all.concat(a); } });
    FT.report = { scenes, total: stats(all), lite: document.documentElement.classList.contains('lite') };
  }
  FT.finish = finish;
})();
