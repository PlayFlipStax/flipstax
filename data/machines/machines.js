// FlipStax - the machines' regions (Run 7), measured on each clean picture from a 1%-grid overlay, as fractions of the picture
// (x, w of its width; y, h of its height). lib/machine.js turns them into px custom properties for the game's own live DOM.
(function(){
  const M = window.Machine; if (!M) return;
  const $ = (id)=> document.getElementById(id);
  // Brain Beam and the Riddle Round share one machine layout: a top screen, four answer panels with a round button each
  const QUIZ = {
    screen: { x: 0.165, y: 0.088, w: 0.670, h: 0.195 },
    p1: { x: 0.300, y: 0.395, w: 0.565, h: 0.087 }, p2: { x: 0.300, y: 0.526, w: 0.565, h: 0.087 },
    p3: { x: 0.300, y: 0.657, w: 0.565, h: 0.087 }, p4: { x: 0.300, y: 0.788, w: 0.565, h: 0.087 },
    b1: { x: 0.110, y: 0.398, w: 0.138, h: 0.077 }, b2: { x: 0.110, y: 0.529, w: 0.138, h: 0.077 },
    b3: { x: 0.110, y: 0.660, w: 0.138, h: 0.077 }, b4: { x: 0.110, y: 0.791, w: 0.138, h: 0.077 },
    strip: { x: 0.080, y: 0.915, w: 0.840, h: 0.050 },
  };
  M.register('bb', { bg: ['#020206', '#755826'], img: 'bb-console', w: 768, h: 1376, lit: true, shiftY: 1, regions: QUIZ,
    match: ()=>{ const o = $('eventOverlay'); return o && M.visible(o) && o.classList.contains('quiz-beam') && document.documentElement.classList.contains('mode-daily') ? o : null; } });
  M.register('riddle', { bg: ['#030409', '#0a4f3c'], img: 'riddle-console', w: 768, h: 1376, lit: true, shiftY: 1, regions: QUIZ,
    match: ()=>{ const o = $('eventOverlay'); return o && M.visible(o) && o.classList.contains('quiz-riddle') && document.documentElement.classList.contains('mode-daily') ? o : null; } });
  // Word Warp: the top screen, the small square (timer), the wide dark panel (the six slots), the plaque (guesses left), the two
  // button pockets (CLEAR, SUBMIT); the empty purple area right of the square holds the letters to place, the small pocket left of
  // the plaque the hint button
  M.register('ww', { bg: ['#020206', '#231841'], img: 'ww-console', w: 768, h: 1376, lit: true, pulse: true, top: 26, regions: {
      screen: { x: 0.165, y: 0.088, w: 0.670, h: 0.195 },
      timer:  { x: 0.105, y: 0.380, w: 0.165, h: 0.115 },
      rack:   { x: 0.300, y: 0.378, w: 0.585, h: 0.120 },
      slots:  { x: 0.130, y: 0.528, w: 0.730, h: 0.078 },
      plaque: { x: 0.305, y: 0.662, w: 0.555, h: 0.072 },
      hint:   { x: 0.095, y: 0.660, w: 0.190, h: 0.076 },
      clear:  { x: 0.348, y: 0.806, w: 0.200, h: 0.046 },
      submit: { x: 0.618, y: 0.806, w: 0.200, h: 0.046 },
    },
    match: ()=>{ const o = $('solveOverlay'); return o && M.visible(o) && document.documentElement.classList.contains('mode-daily') ? o : null; } });
  // Mystery Door: four pods (the doors) with a ring above each (the door's number) and a round button below each (taps the door);
  // the prompt and the pick timer go in the dark recess between the pods and the buttons
  const POD = (cx)=> ({ x: cx - 0.083, y: 0.462, w: 0.166, h: 0.212 }), RING = (cx)=> ({ x: cx - 0.07, y: 0.303, w: 0.14, h: 0.072 }), BTN = (cx)=> ({ x: cx - 0.07, y: 0.822, w: 0.14, h: 0.068 });
  const DX = [0.182, 0.390, 0.615, 0.818], RX = [0.175, 0.392, 0.610, 0.825];
  const DOORS = { prompt: { x: 0.060, y: 0.9205, w: 0.560, h: 0.054 } };
  DX.forEach((c, k)=>{ DOORS['pod' + (k + 1)] = POD(c); DOORS['ring' + (k + 1)] = RING(RX[k]); DOORS['btn' + (k + 1)] = BTN(RX[k]); });
  M.register('doors', { bg: ['#010a1b', '#2d214a'], img: 'doors', w: 736, h: 1433, lit: true, below: true, regions: DOORS,
    match: ()=>{ const o = $('eventOverlay'); return o && M.visible(o) && o.classList.contains('mdoor') && document.documentElement.classList.contains('mode-daily') ? o : null; } });
  // the four round buttons are real buttons too: each taps its door (only while the doors are up)
  document.addEventListener('DOMContentLoaded', ()=>{
    const ov = $('eventOverlay'); if (!ov || $('mcDoorBtns')) return;
    const box = document.createElement('div'); box.id = 'mcDoorBtns'; box.className = 'mc-door-btns';
    box.innerHTML = [1, 2, 3, 4].map(n=> '<button type="button" class="mc-door-btn b' + n + '" aria-label="Door ' + n + '"></button>').join('');
    ov.appendChild(box);
    box.querySelectorAll('button').forEach((b, k)=> b.addEventListener('click', (e)=>{ e.stopPropagation(); const t = ov.querySelectorAll('.event-tile')[k]; if (t && t.onclick){ b.classList.add('press'); setTimeout(()=> b.classList.remove('press'), 180); t.click(); } }));
  });
  // Lucky Lights: the game's own wheel covers the picture's (centred on it, under its pointer); the big pink button is STOP;
  // BANK and SPIN AGAIN on the coloured strip buttons; the bank and spin count on a small plaque under the wheel
  M.register('lucky', { bg: ['#020512', '#392a53'], img: 'lucky-console', w: 736, h: 1433, lit: true, top: 22, regions: {
      wheel:  { x: 0.075, y: 0.2655, w: 0.850, h: 0.4365 },
      stop:   { x: 0.395, y: 0.715, w: 0.210, h: 0.108 },
      bank:   { x: 0.018, y: 0.772, w: 0.282, h: 0.056 },
      note:   { x: 0.080, y: 0.874, w: 0.840, h: 0.036 },
      bankBtn:{ x: 0.085, y: 0.918, w: 0.270, h: 0.058 },
      againBtn:{ x: 0.372, y: 0.918, w: 0.270, h: 0.058 },
    },
    match: ()=>{ const o = $('luckyOverlay'); return o && M.visible(o) && document.documentElement.classList.contains('mode-daily') ? o : null; } });
  // The Mystery Games built on the shared template (#mgOverlay, .mg-<game>): Twin Flip, Zap Words (and Snap Sort, when its art arrives)
  const mg = (key)=> ()=>{ const o = $('mgOverlay'); return o && M.visible(o) && o.classList.contains('mg-' + key) && document.documentElement.classList.contains('mode-daily') ? o : null; };
  // Twin Flip: the 16 windows hold the tiles; the name, the round and the pairs on the top screen; the score and the timer on the control strip
  M.register('twin', { bg: ['#030309', '#261943'], img: 'twin-console', w: 736, h: 1433, lit: true, pulse: true, top: 24, regions: {
      screen: { x: 0.150, y: 0.085, w: 0.700, h: 0.195 },
      grid:   { x: 0.118, y: 0.392, w: 0.776, h: 0.486 },
      strip:  { x: 0.100, y: 0.926, w: 0.820, h: 0.046 },
      score:  { x: 0.610, y: 0.929, w: 0.320, h: 0.040 },
      timer:  { x: 0.115, y: 0.898, w: 0.770, h: 0.010 },
    }, match: mg('twinFlip') });
  // Zap Words: the letters as lit bulbs in the 36 sockets; the word so far and the points on the small screen of the control panel;
  // the hint on the first big button; the found words along the bottom grille; the baked ROUND 4 x2 plate stays
  M.register('zap', { img: 'zap-console', w: 736, h: 1433, lit: true, rest: true, bg: ['#080c12', '#0e242b'], zoom: { region: 'grid', frac: 0.90, anchorY: 0.084 }, regions: {
      grid:   { x: 0.1765, y: 0.3015, w: 0.6510, h: 0.3708 },
      rule:   { x: 0.200, y: 0.2845, w: 0.600, h: 0.015 },
      timer:  { x: 0.200, y: 0.6755, w: 0.600, h: 0.005 },
      word:   { x: 0.185, y: 0.6835, w: 0.270, h: 0.046 },
      score:  { x: 0.470, y: 0.6835, w: 0.130, h: 0.046 },
      hint:   { x: 0.625, y: 0.6835, w: 0.190, h: 0.046 },
      found:  { x: 0.185, y: 0.7330, w: 0.630, h: 0.030 },
    }, match: mg('zapWords') });
  // Orbit Drop: the pegs, the UFO, the chips and the nine slot values drawn live in the empty field, the slots over the tray strip;
  // the slider groove aims the UFO (the UFO stays draggable); the dome under the groove is the DROP button
  M.register('orbit', { bg: ['#01060a', '#1f100a'], img: 'orbit-console', w: 768, h: 1376, lit: false, top: 4, regions: {
      line:   { x: 0.200, y: 0.222, w: 0.600, h: 0.022 },
      field:  { x: 0.168, y: 0.287, w: 0.664, h: 0.548 },
      status: { x: 0.175, y: 0.258, w: 0.650, h: 0.024 },
      groove: { x: 0.245, y: 0.880, w: 0.510, h: 0.044 },
      handle: { x: 0.548, y: 0.872, w: 0.068, h: 0.060 },
      dome:   { x: 0.445, y: 0.950, w: 0.110, h: 0.048 },
      tally:  { x: 0.060, y: 0.926, w: 0.880, h: 0.022 },
      auto:   { x: 0.090, y: 0.952, w: 0.300, h: 0.040 },
    },
    match: ()=>{ const o = $('finOverlay'), p = $('finPlinko'); return o && M.visible(o) && o.classList.contains('daily-orbit') && p && M.visible(p) ? o : null; } });
  // the slider and the DROP dome: real controls, added once
  document.addEventListener('DOMContentLoaded', ()=>{
    const fp = $('finPlinko'); if (!fp || $('mcOrbitCtl')) return;
    const box = document.createElement('div'); box.id = 'mcOrbitCtl'; box.className = 'mc-orbit-ctl';
    box.innerHTML = '<i class="mc-orbit-patch" aria-hidden="true"></i><input type="range" class="mc-orbit-slider" min="0" max="1000" value="500" aria-label="Aim the UFO">' +
      '<button type="button" class="mc-orbit-drop" aria-label="Drop the chip">DROP</button>';
    fp.appendChild(box);
    const sl = box.querySelector('input'), go = box.querySelector('button');
    sl.addEventListener('input', ()=>{ if (window.FlipstaxOrbit) window.FlipstaxOrbit.aimFrac(sl.value / 1000); });
    go.addEventListener('click', (e)=>{ e.stopPropagation(); go.classList.add('press'); setTimeout(()=> go.classList.remove('press'), 160); if (window.FlipstaxOrbit) window.FlipstaxOrbit.drop(); });
    // the slider follows the UFO when it is dragged on the board
    setInterval(()=>{ if (box.offsetParent && window.FlipstaxOrbit && document.activeElement !== sl) sl.value = Math.round(window.FlipstaxOrbit.aimNow() * 1000); }, 200);
  });
  // Snap Sort: the floating word pills live inside the big glass window (the plaque with the category at its top, the rule under it);
  // progress and score on the small plate at the bottom
  M.register('snap', { img: 'snap-console', w: 768, h: 1376, lit: true, bg: ['#03080c', '#2a1e12'], below: true, regions: {
      glass:  { x: 0.196, y: 0.292, w: 0.616, h: 0.608 },
      plaque: { x: 0.235, y: 0.305, w: 0.530, h: 0.062 },
      rule:   { x: 0.215, y: 0.372, w: 0.570, h: 0.024 },
      field:  { x: 0.205, y: 0.405, w: 0.600, h: 0.485 },
      plate:  { x: 0.105, y: 0.9245, w: 0.790, h: 0.040 },
      timer:  { x: 0.215, y: 0.9035, w: 0.570, h: 0.008 },
    }, match: mg('snapSort') });
})();
