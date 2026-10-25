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
  M.register('bb', { img: 'bb-console', w: 768, h: 1376, lit: true, shiftY: 1, regions: QUIZ,
    match: ()=>{ const o = $('eventOverlay'); return o && M.visible(o) && o.classList.contains('quiz-beam') && document.documentElement.classList.contains('mode-daily') ? o : null; } });
  M.register('riddle', { img: 'riddle-console', w: 768, h: 1376, lit: true, shiftY: 1, regions: QUIZ,
    match: ()=>{ const o = $('eventOverlay'); return o && M.visible(o) && o.classList.contains('quiz-riddle') && document.documentElement.classList.contains('mode-daily') ? o : null; } });
})();
