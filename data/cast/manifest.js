// FlipStax - which cast pictures exist (lib/cast.js), as <name>-<pose> for data/cast/<name>-<pose>.webp.
// tools/build-art.py writes the pictures (trimmed, 900 px tall, feet on the bottom edge); list a picture here once
// it is in the folder, so a missing one never costs a failed request. A pose without a picture falls back to the
// member's idle (with a gentle bob, or a quick wiggle for a laugh), else to any picture of theirs, else they sit out.
// Cast: orange (the sidekick), pink and purple (the presenters). purple-presenting has not been delivered yet.
window.FLIPSTAX_CAST_ART = [
  'orange-idle',
  'pink-presenting',
];
