/* FlipStax - the host alien, drawn once.
   Every place the host appears (the corner host and his speech bubble, the
   cold open, the riddle's Mystery Visitor, the Vault's little helper, the
   style board, the collection's alien card art) takes its picture from here,
   so swapping the character later means editing this one file.

   A simple, friendly green alien: a round green head, two small antennae,
   big solid black oval eyes with a small white highlight each, a simple
   smile. window.HostAlien.svg(className) returns the head (the corner host,
   card art); window.HostAlien.full(className) returns the whole host for the
   stage (the landing page, the cold open): a sparkly silver space suit with
   a magenta bow tie and a retro microphone in one hand, the other arm free
   to wave.

   The full host's parts carry classes for the CSS idle (show.css): .ha-eyes
   (blink), .ha-arm-wave (wave, pivots at the shoulder), .ha-spark (twinkle),
   .ha-mic. Image hook: set HostAlien.image = 'path/to/host.png' (or call
   HostAlien.useImage(url)) and full() returns that picture instead of the
   drawing - same box, so every stage layout keeps working. */
(function(root){
  const head = (eyes)=>
    '<g stroke="#2b8a2e" stroke-width="4" stroke-linecap="round" fill="none"><path d="M36 28 L26 9"/><path d="M64 28 L74 9"/></g>' +
    '<circle cx="26" cy="8" r="5.5" fill="#8cf06f" stroke="#2b8a2e" stroke-width="3"/><circle cx="74" cy="8" r="5.5" fill="#8cf06f" stroke="#2b8a2e" stroke-width="3"/>' +
    '<circle cx="50" cy="66" r="42" fill="#6fdc57" stroke="#2b8a2e" stroke-width="4"/>' +
    '<ellipse cx="38" cy="40" rx="14" ry="7" fill="#fff" opacity="0.22" transform="rotate(-24 38 40)"/>' +
    '<g class="' + (eyes || '') + '"><ellipse cx="34" cy="64" rx="9" ry="14" fill="#0b0b12"/><ellipse cx="66" cy="64" rx="9" ry="14" fill="#0b0b12"/>' +
    '<circle cx="31" cy="58" r="3.4" fill="#fff"/><circle cx="63" cy="58" r="3.4" fill="#fff"/></g>' +
    '<path d="M37 88 Q50 100 63 88" fill="none" stroke="#2b5a14" stroke-width="4" stroke-linecap="round"/>';
  // A four-point sparkle on the suit.
  const spark = (x, y, s, d)=> '<path class="ha-spark" style="animation-delay:' + d + 's" d="M' + x + ' ' + (y - s) + ' L' + (x + s * 0.28) + ' ' + (y - s * 0.28) + ' L' + (x + s) + ' ' + y +
    ' L' + (x + s * 0.28) + ' ' + (y + s * 0.28) + ' L' + x + ' ' + (y + s) + ' L' + (x - s * 0.28) + ' ' + (y + s * 0.28) + ' L' + (x - s) + ' ' + y + ' L' + (x - s * 0.28) + ' ' + (y - s * 0.28) + 'Z" fill="#fff"/>';
  // An arm: a dark outline under a silver sleeve, shoulder -> elbow -> hand, and a green hand.
  const arm = (pts, hand)=> '<path d="' + pts + '" fill="none" stroke="#4b5363" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + pts + '" fill="none" stroke="url(#haSleeve)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="' + hand[0] + '" cy="' + hand[1] + '" r="9.5" fill="#6fdc57" stroke="#2b8a2e" stroke-width="3"/>';
  root.HostAlien = {
    image: null,
    useImage: function(url){ this.image = url || null; },
    svg: function(cls){
      return '<svg class="' + (cls || 'alien-svg') + '" viewBox="0 0 100 112" aria-hidden="true" focusable="false">' + head('') + '</svg>';
    },
    full: function(cls){
      if (this.image) return '<img class="' + (cls || 'host-full-img') + '" src="' + this.image + '" alt="" aria-hidden="true">';
      return '<svg class="' + (cls || 'host-full-svg') + '" viewBox="0 0 200 330" aria-hidden="true" focusable="false">' +
        '<defs><linearGradient id="haSuit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fb"/><stop offset="0.45" stop-color="#c3cad6"/><stop offset="0.7" stop-color="#e9edf4"/><stop offset="1" stop-color="#8e97a8"/></linearGradient>' +
        '<linearGradient id="haSleeve" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfe4ec"/><stop offset="1" stop-color="#a7afbe"/></linearGradient>' +
        '<linearGradient id="haMic" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d6575"/><stop offset="0.45" stop-color="#e8ecf2"/><stop offset="1" stop-color="#4b5363"/></linearGradient></defs>' +
        '<ellipse class="ha-shadow" cx="100" cy="320" rx="54" ry="8" fill="rgba(0,0,0,0.35)"/>' +
        '<g class="ha-body">' +
          // legs and shoes
          '<path d="M70 232 L97 232 L95 304 L73 304 Z" fill="url(#haSuit)" stroke="#5a6272" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M103 232 L130 232 L127 304 L105 304 Z" fill="url(#haSuit)" stroke="#5a6272" stroke-width="3" stroke-linejoin="round"/>' +
          '<ellipse cx="82" cy="308" rx="17" ry="8" fill="#1b1b26"/><ellipse cx="118" cy="308" rx="17" ry="8" fill="#1b1b26"/>' +
          // a short neck, so the head sits on the collar
          '<path d="M89 112 H111 V142 H89 Z" fill="#62d24d" stroke="#2b8a2e" stroke-width="3" stroke-linejoin="round"/>' +
          // the jacket: silver, lapels, a white shirt V and a magenta bow tie, sparkles
          '<path d="M58 140 Q100 126 142 140 L152 236 Q100 248 48 236 Z" fill="url(#haSuit)" stroke="#5a6272" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M88 136 L100 176 L112 136 Z" fill="#fbfbff" stroke="#5a6272" stroke-width="2"/>' +
          '<path d="M86 137 L100 178 L78 160 Z M114 137 L100 178 L122 160 Z" fill="#a9b1c0" stroke="#5a6272" stroke-width="2" stroke-linejoin="round"/>' +
          '<path d="M100 142 L88 135 L88 151 Z M100 142 L112 135 L112 151 Z" fill="#ff3c9d" stroke="#8a0a4e" stroke-width="2" stroke-linejoin="round"/><circle cx="100" cy="143" r="4" fill="#ff7ac0" stroke="#8a0a4e" stroke-width="2"/>' +
          '<circle cx="100" cy="196" r="3" fill="#5a6272"/><circle cx="100" cy="214" r="3" fill="#5a6272"/>' +
          spark(70, 170, 6, 0) + spark(128, 200, 5, 0.7) + spark(76, 216, 4.5, 1.3) + spark(132, 160, 4, 2) + spark(112, 226, 4, 2.6) + spark(62, 196, 3.5, 1.8) +
          // the free (waving) arm, in front of the jacket, resting along his side; it pivots at the shoulder (140,148)
          '<g class="ha-arm-wave">' + arm('M141 147 L158 190 L157 226', [157, 229]) + '</g>' +
        '</g>' +
        // the head (its own coordinates scaled into place), then the mic arm in front of it
        '<g class="ha-head" transform="translate(52 22) scale(0.96)">' + head('ha-eyes') + '</g>' +
        // the near arm holding the retro mic up by the mouth
          '<g class="ha-arm-mic">' + arm('M60 148 L40 192 L66 172', [68, 170]) +
            '<path class="ha-mic" d="M70 168 L76 132" stroke="#2a2d36" stroke-width="6" stroke-linecap="round"/>' +
            '<rect x="66" y="108" width="20" height="28" rx="10" fill="url(#haMic)" stroke="#2a2d36" stroke-width="2.5" transform="rotate(10 76 122)"/>' +
            '<g transform="rotate(10 76 122)" stroke="#5d6575" stroke-width="1.4"><path d="M68 116 H84 M67 121 H85 M67 126 H85 M68 131 H84"/></g>' +
            '<rect x="66" y="132" width="20" height="5" rx="2" fill="#ffd23f" stroke="#8a5a00" stroke-width="1.5" transform="rotate(10 76 122)"/>' +
          '</g>' +
        '</svg>';
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
