// FlipStax - where things sit on the VS console picture (data/vs/console-clean.webp, 780 x 1519), as fractions of the
// picture (x, w of its width; y, h of its height). Measured on Oct 23 (Run 6) from a 1%-grid overlay and dark-blob detection
// on the picture; lib/vs-console.js places the live cards, the HUD, the bulbs and the effects from these numbers.
window.FLIPSTAX_VS_LAYOUT = {
  image: { w: 780, h: 1519 },
  // the screens inside the two card frames (the safe area for a card: a little inside the bevel)
  topWindow:    { x: 0.205, y: 0.252, w: 0.590, h: 0.200 },
  bottomWindow: { x: 0.200, y: 0.572, w: 0.610, h: 0.213 },
  // the HUD pill under the sign: the dark grill on the left (points and round text) and six round sockets on the right
  hudPill:  { x: 0.186, y: 0.148, w: 0.624, h: 0.047 },
  hudGrill: { x: 0.198, y: 0.156, w: 0.200, h: 0.032 },
  hudSockets: { y: 0.1705, d: 0.050, x: [0.438, 0.501, 0.564, 0.627, 0.690, 0.754] },   // centres; d = diameter (of the width)
  // the empty small readout box under the sign
  readout: { x: 0.402, y: 0.108, w: 0.195, h: 0.028 },
  // the green tab above the top window (the VS timer bar goes along it)
  timerTab: { x: 0.375, y: 0.2155, w: 0.250, h: 0.008 },
  // the blank gold VS coin between the windows: centre and the blank face's diameter (of the width)
  coin: { x: 0.500, y: 0.5045, d: 0.150 },
  // the dark bulb sockets round the lower tray: top row (the coin covers its middle), the two slanted sides, the bottom row
  sockets: [
    [0.195, 0.511], [0.233, 0.509], [0.271, 0.507], [0.309, 0.506], [0.347, 0.506], [0.385, 0.506],
    [0.615, 0.506], [0.653, 0.506], [0.691, 0.506], [0.729, 0.507], [0.767, 0.509], [0.805, 0.511],
    [0.845, 0.521], [0.867, 0.535], [0.878, 0.550], [0.892, 0.567], [0.904, 0.584], [0.917, 0.602], [0.930, 0.620], [0.944, 0.640], [0.959, 0.661], [0.976, 0.683], [0.990, 0.707],
    [0.964, 0.849], [0.901, 0.849], [0.836, 0.849], [0.773, 0.849], [0.713, 0.849], [0.651, 0.849], [0.590, 0.849], [0.528, 0.849], [0.470, 0.849], [0.409, 0.849], [0.347, 0.849], [0.286, 0.849], [0.224, 0.849], [0.163, 0.849], [0.096, 0.849], [0.036, 0.849],
    [0.010, 0.707], [0.024, 0.683], [0.040, 0.661], [0.056, 0.640], [0.070, 0.620], [0.084, 0.601], [0.097, 0.584], [0.108, 0.567], [0.122, 0.550], [0.133, 0.535], [0.156, 0.521],
  ],
  socketD: 0.020,
  // the five arcade buttons under the tray (left to right: green, yellow, orange, pink, magenta)
  buttons: [
    { x: 0.087, y: 0.876, w: 0.138, h: 0.042, c: '#5dff7a' },
    { x: 0.262, y: 0.876, w: 0.134, h: 0.042, c: '#ffe45c' },
    { x: 0.434, y: 0.876, w: 0.132, h: 0.042, c: '#ffae4a' },
    { x: 0.605, y: 0.876, w: 0.136, h: 0.042, c: '#ff5fa8' },
    { x: 0.776, y: 0.876, w: 0.140, h: 0.042, c: '#ff3fd0' },
  ],
  // each crackle ring's bright line in its own picture (tools/build-vs-art.py prints these): the ring is lined up with a window
  crackle: {
    aspect: 1.791,
    green: { x: 0.1681, y: 0.1443, w: 0.6569, h: 0.7065 },
    cyan:  { x: 0.1694, y: 0.1493, w: 0.6528, h: 0.6965 },
    pink:  { x: 0.1667, y: 0.1443, w: 0.6583, h: 0.7090 },
  },
};
