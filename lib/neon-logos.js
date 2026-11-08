/* FlipStax - NEON LOGOS (run 2 job 2): each game's title as a real neon sign, in the style of the Orbit Drop sign - a dark panel with a glowing coloured
   border, a ring of bulbs that chase round it, glowing two-line lettering and the game's own icon, drawn in SVG / CSS (no emoji, no pictures), so it
   looks the same on every phone. NeonLogo.html(key) returns the markup; NeonLogo.has(key) says whether a sign exists for that game.
   Motion (lib/neon-logos.css): the bulbs chase in three steps (opacity only, under 3 changes a second), the border's glow breathes (opacity only), and each
   icon has its own small transform animation. Lite mode and reduced motion: everything still.
   The look of each sign follows the mockups in incoming-assets/gemini/logo-*.png (references only - they are not shipped). */
(function(){
  'use strict';
  const NL = window.NeonLogo = {};
  // ---- the icons (SVG; viewBox 0 0 100 100 unless noted) ----
  const ICON = {
    // a colour wheel with a gold rim and a white hub; the face turns slowly
    wheel: '<div class="nli-wheel"><i class="nlw-face"></i><i class="nlw-hub"></i></div>',
    // a yellow disc with a dark question mark (two of them, one each side); they bob
    qdisc: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ffe27a" stroke="#fff6c2" stroke-width="5"/><text x="50" y="67" text-anchor="middle" font-size="52" font-weight="900" fill="#103a1a" font-family="Arial, Helvetica, sans-serif">?</text></svg>',
    // alien jaws: an upper and a lower purple jaw with white pointed teeth, hinged at the back (left), two glowing green eyes on top
    jaws: '<svg viewBox="0 0 120 100">' +
      '<g class="nlj-up"><path d="M14 52 Q14 14 60 12 Q104 12 108 48 L108 52 Z" fill="#8a3cff" stroke="#e8d4ff" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M22 52 L29 64 L36 52 L43 64 L50 52 L57 64 L64 52 L71 64 L78 52 L85 64 L92 52 L99 64 L106 52 Z" fill="#ffffff" stroke="#e8d4ff" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<circle class="nlj-eye" cx="42" cy="20" r="10" fill="#b8ff3a" stroke="#ffffff" stroke-width="2.5"/><circle cx="44" cy="20" r="4" fill="#123"/>' +
        '<circle class="nlj-eye" cx="80" cy="20" r="10" fill="#b8ff3a" stroke="#ffffff" stroke-width="2.5"/><circle cx="82" cy="20" r="4" fill="#123"/></g>' +
      '<g class="nlj-lo"><path d="M14 56 Q16 92 60 92 Q102 92 108 56 Z" fill="#6a24d6" stroke="#e8d4ff" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M22 56 L29 45 L36 56 L43 45 L50 56 L57 45 L64 56 L71 45 L78 56 L85 45 L92 56 L99 45 L106 56 Z" fill="#ffffff" stroke="#e8d4ff" stroke-width="1.5" stroke-linejoin="round"/></g></svg>',
    // an hourglass: gold caps, a cyan glass, pink sand running from the top bulb to the bottom
    hourglass: '<svg viewBox="0 0 80 100"><rect x="8" y="4" width="64" height="9" rx="4" fill="#ffd23f"/><rect x="8" y="87" width="64" height="9" rx="4" fill="#ffd23f"/>' +
      '<path d="M16 13 L64 13 Q64 40 44 50 Q64 60 64 87 L16 87 Q16 60 36 50 Q16 40 16 13 Z" fill="rgba(95,244,255,0.12)" stroke="#5ff4ff" stroke-width="4" stroke-linejoin="round"/>' +
      '<path class="nlh-top" d="M22 20 L58 20 Q56 38 40 47 Q24 38 22 20 Z" fill="#ff5fb4"/><path class="nlh-bot" d="M22 82 L58 82 Q52 66 40 62 Q28 66 22 82 Z" fill="#ff5fb4"/>' +
      '<rect class="nlh-run" x="38.5" y="47" width="3" height="20" fill="#ff8ad0"/></svg>',
    // a yellow lightning bolt (two of them, one each side); they flash
    bolt: '<svg viewBox="0 0 60 100"><path d="M36 2 L8 56 L28 56 L20 98 L52 38 L32 38 Z" fill="#ffe14a" stroke="#fff6c2" stroke-width="3" stroke-linejoin="round"/></svg>',
    // a rocket: white body, red nose and fins, a blue window, a flame
    rocket: '<svg viewBox="0 0 100 100"><g class="nlr-body"><path class="nlr-flame" d="M40 74 Q36 88 30 96 Q46 90 50 80 Q54 90 70 96 Q64 88 60 74 Z" fill="#ffb02e"/><path d="M44 74 Q46 84 50 90 Q54 84 56 74 Z" fill="#fff3a0"/>' +
      '<path d="M50 6 Q68 22 68 52 L68 74 L32 74 L32 52 Q32 22 50 6 Z" fill="#dfe6f0" stroke="#ffffff" stroke-width="2"/><path d="M50 6 Q60 14 64 26 L36 26 Q40 14 50 6 Z" fill="#ff3c5a"/>' +
      '<circle cx="50" cy="44" r="9" fill="#3fa9ff" stroke="#1a3a6a" stroke-width="3"/><path d="M32 56 L18 76 L32 72 Z" fill="#ff3c5a"/><path d="M68 56 L82 76 L68 72 Z" fill="#ff3c5a"/></g>' +
      '<g fill="#ffffff"><circle cx="16" cy="18" r="2"/><circle cx="86" cy="30" r="1.6"/><circle cx="82" cy="12" r="1.2"/></g></svg>',
    // an alien head in a green starburst
    alien: '<svg viewBox="0 0 100 100"><path class="nla-burst" d="M50 2 L58 30 L84 14 L70 40 L98 48 L70 58 L86 84 L58 70 L50 98 L42 70 L14 84 L30 58 L2 48 L30 40 L16 14 L42 30 Z" fill="#8bdc2a" stroke="#c8ff6a" stroke-width="2"/>' +
      '<path d="M50 24 Q72 24 72 46 Q72 64 50 76 Q28 64 28 46 Q28 24 50 24 Z" fill="#c9d3dc" stroke="#ffffff" stroke-width="2"/>' +
      '<path d="M32 46 Q38 38 46 46 Q42 56 34 54 Z" fill="#3a2010"/><path d="M68 46 Q62 38 54 46 Q58 56 66 54 Z" fill="#3a2010"/><path d="M44 64 Q50 68 56 64" stroke="#3a2010" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
    // two flying saucers, one pink, one cyan
    saucers: '<div class="nli-saucers"><svg class="nls a" viewBox="0 0 100 50"><path d="M30 24 Q32 6 50 6 Q68 6 70 24 Z" fill="#e8fbff" stroke="#ffffff" stroke-width="2"/><ellipse cx="50" cy="30" rx="46" ry="14" fill="#ff8ad0" stroke="#ffd0ec" stroke-width="2"/></svg>' +
      '<svg class="nls b" viewBox="0 0 100 50"><path d="M30 24 Q32 6 50 6 Q68 6 70 24 Z" fill="#e8fbff" stroke="#ffffff" stroke-width="2"/><ellipse cx="50" cy="30" rx="46" ry="14" fill="#7df9ff" stroke="#d8fdff" stroke-width="2"/></svg></div>',
  };
  // ---- the signs: border, bulbs, the two lines (style: 'sm' a small spaced line, 'lg' the big line), the icon(s) and the layout ----
  const DEF = {
    lucky:         { border:'#ffc83a', bulb:'#ff4fb4', lines:[['MYSTERY', 'sm', '#ff8ad0'], ['WHEEL', 'lg', '#ffd23f']], icon:'wheel' },
    riddle:        { border:'#d8ff3a', bulb:'#f0ff7a', lines:[['RIDDLE', 'lg', '#e8ff5a'], ['ROUND', 'sm', '#ffffff']], icon:'qdisc', both:true, ghosts:true },
    munchMix:      { border:'#b04aff', bulb:'#b8ff5a', lines:[['GALACTIC', 'sm', '#d8b4ff'], ['CHOMPER', 'lg', '#b8ff3a']], icon:'jaws', iconW:42 },
    timeWarp:      { border:'#5ff4ff', bulb:'#ff8ad0', lines:[['TIME', 'sm', '#ff9ad8'], ['WARP', 'lg it', '#5ff4ff']], icon:'hourglass', iconW:22 },
    zigZap:        { border:'#ff3fb5', bulb:'#ffc46a', lines:[['ZiG ZAP', 'md', '#5ff4ff'], ['ZaBAM!', 'lg', '#ffe14a']], icon:'bolt', both:true, iconW:14 },
    spaceLaunch:   { border:'#4a8cff', bulb:'#ffa040', lines:[['SPACE', 'sm', '#ffb870'], ['LAUNCH', 'lg', '#ffffff']], icon:'rocket' },
    alienBlast:    { border:'#7dff2a', bulb:'#ff9a2e', lines:[['ALIEN', 'sm', '#b8ff5a'], ['BLAST!', 'lg', '#ff5a3a']], icon:'alien' },
    saucerShuffle: { border:'#2ee8ff', bulb:'#c46aff', lines:[['SAUCER', 'md', '#5ff4ff'], ['SHUFFLE', 'lg', '#ff8ad0']], icon:'saucers' },
  };
  NL.has = (key)=> !!DEF[key];
  NL.html = (key)=>{
    const d = DEF[key]; if (!d) return '';
    const icon = (side)=> '<div class="nl-icon ' + side + '" style="--iw:' + (d.iconW || 26) + '%">' + ICON[d.icon] + '</div>';
    const text = '<div class="nl-text">' + d.lines.map(([t, sz, col])=> '<span class="nl-l ' + sz + '" style="--c:' + col + '">' + t + '</span>').join('') + '</div>';
    return '<div class="nl nl-' + key + (d.both ? ' both' : '') + '" role="img" aria-label="' + d.lines.map(l=> l[0]).join(' ') + '" style="--nb:' + d.border + ';--nbulb:' + d.bulb + '">' +
      '<i class="nl-glow" aria-hidden="true"></i><i class="nl-bulbs" aria-hidden="true"><i></i><i></i><i></i></i>' +
      (d.ghosts ? '<i class="nl-ghost g1" aria-hidden="true">?</i><i class="nl-ghost g2" aria-hidden="true">?</i><i class="nl-ghost g3" aria-hidden="true">?</i>' : '') +
      '<div class="nl-panel">' + icon('l') + text + (d.both ? icon('r') : '') + '</div></div>';
  };
})();
