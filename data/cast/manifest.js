// FlipStax - which cast pictures exist (lib/cast.js), as <name>-<pose> for data/cast/<name>-<pose>.webp.
// tools/build-art.py writes the pictures (trimmed, 900 px tall, feet on the bottom edge); list a picture here once
// it is in the folder, so a missing one never costs a failed request. A member with no picture listed sits out.
// Cast (Run 4A): purple = Cleo Cosmic, the presenter; kandi = Kandi Cosmos (no pictures yet). The host's own pictures
// are data/host (data/host/manifest.js).
// Not listed any more (Run 4A, out of the show; the files stay in the folder): orange-idle (Barnaby, the sidekick),
// pink-presenting (the old presenter).
// Kandi: add data/cast/kandi-presenting.webp and list 'kandi-presenting' below.
window.FLIPSTAX_CAST_ART = [
  'purple-presenting',   // Cleo Cosmic (Oct 22: cut out of the studio backdrop, trimmed, 900 px tall)
];
