// FlipStax - the episode rundown (see DIRECTION.md).
//
// One fixed show for everyone, the same all day and new every day. The game
// reads this file to build the episode, so the order can be tuned here without
// touching code. Run 4A: a cold open, six rounds, the Word Warp finale, the results.
// Every round: its title card (the host announces it), a VS block, one Brain Beam,
// the round-end game, then a reward beat. Step types:
//   { vs: N }                N VS cards (tap a card to pick; the crowd's split is revealed)
//   { beam: 'easy' | 'medium' | 'hard' }   a Brain Beam at that level (each earns one Word Warp letter)
//   { game: key }            the round-end game: 'riddle', 'lucky', 'door' (Mystery Door: four doors, a bonus
//                            game behind each, see `door`), 'zapWords', 'twinFlip', 'orbitDrop'
//   { reward: true }         the reward beat: what the round paid (points, the letter, gold keys)
//   { wordWarp: true }       the Word Warp (the 6-letter word from the six Brain Beams)
// `mult` multiplies every point won in the round; `vsTimerMs` is how long each VS card waits for a pick;
// `announce` is the host's one line on the round's title card.

// ---- Hold times (ms) - every cinematic moment's length, in one place (G2, Oct 16; Run 4A) ----
const ACT_CARD_HOLD = 2800;          // a round's title card: the host's line and ROUND N on the marquee
const MYSTERY_REVEAL_HOLD = 3000;    // the Mystery Door opening on its game's name
const STAR_WIPE = 1600;              // (the old act card's star wipe; kept for the TEST menu)
const ROUND_BUMPER_HOLD = 2200;      // a round title card (the "Round N" bumper)
const COSMIC_SURPRISE_INTRO = 2000;  // the Cosmic Surprise machine on screen before its reels spin
const CINEMATIC_MIN = 1500;          // no cinematic moment is shorter than this
const SKIP_AFTER = 1000;             // tap-to-skip works only after this long
const ZOOM_MS = 900;                 // Run 4A: the zoom through the marquee (one glow pulse), in and out
const GAME_INTRO_MS = 2000;          // Run 4A: a round-end game's intro (spotlight sweep, title slam, bulb chase)
const REWARD_HOLD = 2200;            // Run 4A: the reward beat after a round-end game

// G3 (Oct 16): the commercial break is cut from the show. Its code and the "Brought to you by" sponsor field stay;
// set this to true to bring it back (it plays after the round named in commercial.after).
const COMMERCIAL_ENABLED = false;
window.FLIPSTAX_TIMING = { ACT_CARD_HOLD, MYSTERY_REVEAL_HOLD, STAR_WIPE, ROUND_BUMPER_HOLD, COSMIC_SURPRISE_INTRO, CINEMATIC_MIN, SKIP_AFTER, ZOOM_MS, GAME_INTRO_MS, REWARD_HOLD };

// VS cards per round (Oct 22: 6, was 4) and how long each waits for a pick. The player's tap ends the wait: the card advances as
// soon as the reveal (VS_REVEAL_HOLD, 1.2 s) has played. 'Relaxed pace' (the sound/settings popover) gives 8 s a card instead of 5.
const VS_PER_ROUND = 6;
const VS_TIMER_MS = 5000, VS_TIMER_RELAXED_MS = 8000;
window.FLIPSTAX_VS_TIMER = { normal: VS_TIMER_MS, relaxed: VS_TIMER_RELAXED_MS };

window.FLIPSTAX_RUNDOWN = {
  coldOpen: { firstMs: 12000, returningMs: 3000 },
  acts: [
    { id:'r1', round:1, title:'ROUND ONE',   sub:'ROUND 1', mult:1, vsTimerMs:VS_TIMER_MS, world:'vs',
      announce:'Round One! Let’s warm up those Earth brains!',
      steps:[ { vs:VS_PER_ROUND }, { beam:'easy' },   { game:'riddle' },    { reward:true } ] },
    { id:'r2', round:2, title:'ROUND TWO',   sub:'ROUND 2', mult:1, vsTimerMs:VS_TIMER_MS, world:'vs',
      announce:'Round Two! Things are heating up!',
      steps:[ { vs:VS_PER_ROUND }, { beam:'easy' },   { game:'lucky' },     { reward:true } ] },
    { id:'r3', round:3, title:'ROUND THREE', sub:'ROUND 3 · POINTS x2', mult:2, vsTimerMs:VS_TIMER_MS, world:'powerup',
      announce:'Round Three! Doors, my friends. Doors!',
      steps:[ { vs:VS_PER_ROUND }, { beam:'medium' }, { game:'door' },      { reward:true } ] },
    { id:'r4', round:4, title:'ROUND FOUR',  sub:'ROUND 4 · POINTS x2', mult:2, vsTimerMs:VS_TIMER_MS, world:'powerup',
      announce:'Round Four! Time to hunt some words!',
      steps:[ { vs:VS_PER_ROUND }, { beam:'medium' }, { game:'zapWords' },  { reward:true } ] },
    { id:'r5', round:5, title:'ROUND FIVE',  sub:'ROUND 5 · POINTS x3', mult:3, vsTimerMs:VS_TIMER_MS, world:'jumble',
      announce:'Round Five! Keep your eyes sharp!',
      steps:[ { vs:VS_PER_ROUND }, { beam:'hard' },   { game:'twinFlip' },  { reward:true } ] },
    { id:'r6', round:6, title:'ROUND SIX',   sub:'ROUND 6 · POINTS x3', mult:3, vsTimerMs:VS_TIMER_MS, world:'jumble',
      announce:'Round Six! The big drop!',
      steps:[ { vs:VS_PER_ROUND }, { beam:'hard' },   { game:'orbitDrop' }, { reward:true } ] },
    { id:'finale', title:'GRAND FINALE', sub:'WORD WARP', mult:1, world:'results',
      announce:'The Grand Finale! Word Warp!',
      steps:[ { wordWarp:true } ] },
  ],
  // The Mystery Door (Round 3): four doors, a different bonus game behind each, drawn by the date (the same for
  // everyone that day; no game twice in an episode). Out of the pool: Peak or Plunge (off), Oddball Alert,
  // Crowd Scan, and Twin Flip (Round 5's game). A game whose data didn't load is left out.
  door: {
    pool: [ 'emojiDecode', 'timeWarp', 'snapSort', 'saucerShuffle', 'factOrFib', 'priceProbe' ],
  },
  // (Older builds drew two Mystery Games a day from here; the results' "Tomorrow" tease still reads it.)
  mystery: {
    pool: [
      { game: 'emojiDecode',  weight: 1 },
      { game: 'timeWarp',     weight: 1 },
      { game: 'snapSort',     weight: 1 },
      { game: 'saucerShuffle', weight: 1 },
      { game: 'factOrFib',    weight: 1 },
      { game: 'priceProbe',   weight: 1, price: true },
    ],
  },
  // Games switched off in the show (their code and data stay; the TEST menu still plays them).
  off: [ 'peakOrPlunge' ],
  // About one episode in three, one random VS card is replaced by a Cosmic Surprise twist.
  cosmicSurpriseChance: 1 / 3,
  // The commercial break: a 3-second fake 70s ad for a fictional product (one a day, by
  // the date). Skippable. Built so a real ad can replace it later.
  commercial: {
    enabled: COMMERCIAL_ENABLED,
    after: 'r2',   // (when enabled: between Round 2 and Round 3)
    ms: 3000,
    // A real sponsor later: set `sponsor` (shown as BROUGHT TO YOU BY ...) and/or add its ad here. Invented brands only until then.
    sponsor: null,
    // `art` is the flat 80s product drawing: can, boots, bowl, jar, robot, pudding.
    ads: [
      { brand: 'ZING COLA',         line: 'Tastes like tomorrow!',               glyph: '🥤', art: 'can',     colors: ['#ff3c9d', '#ffd23f'] },
      { brand: 'ZOOMO JET BOOTS',   line: 'Be home before you leave!',           glyph: '👟', art: 'boots',   colors: ['#2fd5ff', '#ff6a2b'] },
      { brand: 'COSMO CRUNCH',      line: 'The cereal that crunches back!',      glyph: '🥣', art: 'bowl',    colors: ['#ffb21f', '#3b7bff'] },
      { brand: 'MOONGLOW HAIR GEL', line: 'Hold so strong, it holds you!',       glyph: '💇', art: 'jar',     colors: ['#c792ff', '#7dff9e'] },
      { brand: 'DUST-O-TRON 3000',  line: 'It cleans. It thinks. It judges.',    glyph: '🤖', art: 'robot',   colors: ['#7df9ff', '#ff3c9d'] },
      { brand: 'SPACE PUDDING',     line: 'Wobbles in zero gravity!',            glyph: '🍮', art: 'pudding', colors: ['#ffd23f', '#a34dff'] },
    ],
  },
};
