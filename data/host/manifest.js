// FlipStax - which host pose pictures exist (lib/host.js).
// Pictures are data/host/<pose>.webp, made by tools/build-art.py (cut out, trimmed to one shared crop box, 900 px
// tall, the feet on the bottom edge - so switching poses never jumps). HOST_IMAGE_MODE (Run 3): the host switches
// to pictures only once this list holds at least idle, blink, wave, cheer, think, shrug, oops, laugh and presenting;
// until then every pose stays the drawn SVG host and the rendered cast stays off. In the folder but not listed yet
// (Oct 16): discoPoint, oops, laugh.
// Poses: idle, idleClosed, blink, wave, point, cheer, think, shrug, wink, oops, gasp, presenting, laugh,
//        discoPoint, swayL, swayR, spin
window.FLIPSTAX_HOST_POSES = [
  // 'idle', 'wave', 'cheer', ...
];
