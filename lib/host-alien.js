/* FlipStax - the host alien, drawn once.
   Every place the host appears (the corner host and his speech bubble, the
   cold open, the riddle's Mystery Visitor, the Vault's little helper, the
   style board, the collection's alien card art) takes its picture from here,
   so swapping the character later means editing this one function.

   A simple, friendly green alien: a round green head, two small antennae,
   big solid black oval eyes with a small white highlight each, a simple
   smile. window.HostAlien.svg(className) returns the SVG markup. */
(function(root){
  root.HostAlien = {
    svg: function(cls){
      return '<svg class="' + (cls || 'alien-svg') + '" viewBox="0 0 100 112" aria-hidden="true" focusable="false">' +
        '<g stroke="#2b8a2e" stroke-width="4" stroke-linecap="round" fill="none"><path d="M36 28 L26 9"/><path d="M64 28 L74 9"/></g>' +
        '<circle cx="26" cy="8" r="5.5" fill="#8cf06f" stroke="#2b8a2e" stroke-width="3"/><circle cx="74" cy="8" r="5.5" fill="#8cf06f" stroke="#2b8a2e" stroke-width="3"/>' +
        '<circle cx="50" cy="66" r="42" fill="#6fdc57" stroke="#2b8a2e" stroke-width="4"/>' +
        '<ellipse cx="38" cy="40" rx="14" ry="7" fill="#fff" opacity="0.22" transform="rotate(-24 38 40)"/>' +
        '<ellipse cx="34" cy="64" rx="9" ry="14" fill="#0b0b12"/><ellipse cx="66" cy="64" rx="9" ry="14" fill="#0b0b12"/>' +
        '<circle cx="31" cy="58" r="3.4" fill="#fff"/><circle cx="63" cy="58" r="3.4" fill="#fff"/>' +
        '<path d="M37 88 Q50 100 63 88" fill="none" stroke="#2b5a14" stroke-width="4" stroke-linecap="round"/>' +
        '</svg>';
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
