// FlipStax - which host pose pictures exist (lib/host.js).
// Pictures are data/host/<pose>.webp, made by tools/build-art.py (cut out, one shared crop box, 900 px tall, feet on the bottom
// edge - so switching poses never jumps). HOST_IMAGE_MODE: the host is pictures only once this list holds at least idle, blink,
// wave, cheer, think, shrug, oops, laugh and presenting (it does since Oct 18); the drawn host is then never shown.
// Poses: idle, idleClosed, blink, wave, point, cheer, think, shrug, wink, oops, gasp, presenting, laugh,
//        discoPoint, swayL, swayR, spin
window.FLIPSTAX_HOST_POSES = [
  'idle', 'blink', 'wave', 'cheer', 'think', 'shrug', 'presenting', 'oops', 'laugh', 'discoPoint',
];
// Borrowed (no picture of their own; lib/host.js STAND_IN): idleClosed and wink -> blink, point -> presenting, gasp -> oops,
// swayL, swayR and spin -> discoPoint. Add <pose>.webp here and it is used instead.
