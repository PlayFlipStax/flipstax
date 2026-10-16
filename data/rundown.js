// FlipStax - the episode rundown (see DIRECTION.md).
//
// One fixed show for everyone, the same all day and new every day. The game
// reads this file to build the episode, so the order can be tuned here without
// touching code. Step types:
//   { vs: N }                N VS cards (tap a card to pick; the crowd's split is revealed)
//   { beam: 'easy' | 'medium' | 'hard' }   a Brain Beam at that level (each earns one prize-track tile)
//   { mystery: 1 | 2 }       the day's Mystery Game 1 or 2 (picked by the date - see `mystery`)
//   { portal: true }         Portal Pick
//   { lucky: true }          Lucky Lights
//   { wordWarp: true }       the Word Warp (the 6-letter word from the prize track)
//   { orbitDrop: true }      Orbit Drop, the grand prize
// An act opens with the host holding up its cue card. `mult` multiplies every
// point won in the act; `vsTimerMs` is how long each VS card waits for a pick.
window.FLIPSTAX_RUNDOWN = {
  coldOpen: { firstMs: 12000, returningMs: 3000 },
  acts: [
    { id: 'act1', title: 'THE OPENER', sub: 'ACT 1', mult: 1, vsTimerMs: 7000, world: 'vs',
      steps: [ { vs: 5 }, { beam: 'easy' }, { vs: 4 }, { mystery: 1 }, { beam: 'easy' } ] },
    { ad: true },
    { id: 'act2', title: 'DOUBLE TROUBLE', sub: 'ACT 2 · POINTS x2', mult: 2, vsTimerMs: 7000, world: 'powerup',
      steps: [ { vs: 5 }, { beam: 'medium' }, { portal: true }, { vs: 4 }, { mystery: 2 }, { beam: 'medium' } ] },
    { id: 'act3', title: 'LIGHTNING ROUND', sub: 'ACT 3 · POINTS x3', mult: 3, vsTimerMs: 5000, world: 'jumble',
      steps: [ { vs: 6 }, { beam: 'hard' }, { beam: 'hard' }, { lucky: true } ] },
    { id: 'finale', title: 'GRAND FINALE', sub: 'PLAY FOR THE GRAND PRIZE', mult: 1, world: 'results',
      steps: [ { wordWarp: true }, { orbitDrop: true } ] },
  ],
  // Mystery Games: two a day, picked by the date. A game never comes up on two days
  // in a row, at most one price game an episode; `weight` 2 is twice as likely.
  mystery: {
    fixed1: 'riddle',   // Mystery Game 1 is the Riddle, every episode (Oct 16); Game 2 is drawn from the pool below
    pool: [
      { game: 'emojiDecode',  weight: 2 },
      { game: 'crowdScan',    weight: 2 },
      { game: 'timeWarp',     weight: 1 },
      { game: 'peakOrPlunge', weight: 1 },
      { game: 'snapSort',     weight: 1 },
      { game: 'zapWords',     weight: 1 },
      { game: 'twinFlip',     weight: 1 },
      // (Oct 16: Price Probe and Oddball Alert are out of the pool - their code and data stay, and the TEST menu still plays them.)
    ],
  },
  // About one episode in three, one random VS card is replaced by a Cosmic Surprise twist.
  cosmicSurpriseChance: 1 / 3,
  // The commercial break: a 3-second fake 70s ad for a fictional product (one a day, by
  // the date). Skippable. Built so a real ad can replace it later.
  commercial: {
    ms: 3000,
    ads: [
      { brand: 'ZING COLA',         line: 'Tastes like tomorrow!',               glyph: '🥤', colors: ['#ff3c9d', '#ffd23f'] },
      { brand: 'ZOOMO JET BOOTS',   line: 'Be home before you leave!',           glyph: '👟', colors: ['#2fd5ff', '#ff6a2b'] },
      { brand: 'CAPTAIN CRUNCHO',   line: 'The cereal that crunches back!',      glyph: '🥣', colors: ['#ffb21f', '#3b7bff'] },
      { brand: 'MOONGLOW HAIR GEL', line: 'Hold so strong, it holds you!',       glyph: '💇', colors: ['#c792ff', '#7dff9e'] },
      { brand: 'ROBO-VAC 3000',     line: 'It cleans. It thinks. It judges.',    glyph: '🤖', colors: ['#7df9ff', '#ff3c9d'] },
      { brand: 'SPACE PUDDING',     line: 'Wobbles in zero gravity!',            glyph: '🍮', colors: ['#ffd23f', '#a34dff'] },
    ],
  },
};
