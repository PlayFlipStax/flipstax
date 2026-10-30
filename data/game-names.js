// FlipStax - game names and the alien host's lines, in one place to edit.
//
// `names` are what players see for each game or round (the code keeps its
// own internal names). `host` is the one-line, cheeky rule the alien host
// says in a speech bubble the first time each game shows up in an Infinity
// run (a player's first 3 runs; after that just the `quip`). Keep host lines short (about 60 characters or less) and funny, like a
// 70s game-show host - never techy.
// The host's name, in one place (Run 4A): every line that names him reads HOST_NAME (lib/cast.js reads window.FLIPSTAX_HOST_NAME).
const HOST_NAME = 'Flip Sterling';
window.FLIPSTAX_HOST_NAME = HOST_NAME;
window.FLIPSTAX_NAMES = {
  names: {
    orbitDrop:      'Orbit Drop',            // the bonus finale (was Plinko)
    cosmicSurprise: 'Cosmic Surprise',       // the wild card power-up
    crowdScan:      'Crowd Scan',            // guess the crowd's split (was Guess the Crowd)
    brainBeam:      'Brain Beam',            // trivia
    riddleRound:    'Riddle Round',
    zapWords:       'Zap Words',             // swipe words in a letter grid (a Mystery Game)
    peakOrPlunge:   'Peak or Plunge',        // higher or lower (a Mystery Game)
    snapSort:       'Snap Sort',             // tap the words that fit the category
    twinFlip:       'Twin Flip',             // memory match
    factOrFib:      'Fact or Fib',           // true or false
    saucerShuffle:  'Saucer Shuffle',        // follow the star under the saucers
    priceProbe:     'Price Probe',
    oddballAlert:   'Oddball Alert',
    emojiDecode:    'Emoji Decode',
    timeWarp:       'Time Warp',
    portalPick:     'Portal Pick',           // the pick-a-door power-up
    wordWarp:       'Word Warp',             // Daily's finale word jumble
    vault:          'The Mothership Vault',
  },
  host: {
    brainBeam:      'Get it right for points and an orb. Wrong? No harm, no foul!',
    riddleRound:    'Riddle me this! Four answers, one winner. Tick tock!',
    crowdScan:      'Guess how the crowd voted. No peeking, Earthling.',
    cosmicSurprise: 'Could be a prize, could be a pickle. Feeling lucky?',
    orbitDrop:      'Aim for the glowing slot, Earthling.',
    priceProbe:     'Which costs more? Tap the pricier one!',
    oddballAlert:   'One of these is not like the others. Tap it!',
    emojiDecode:    'Read the emojis. What do they spell out?',
    timeWarp:       'Which came first? Tap the earlier one!',
    vault:         'Crack the vault, grab the coins. Don’t be shy!',
  },
  // After a player's first 3 runs the host just quips (a one-liner, about a second).
  quip: {
    brainBeam:      'Brain Beam! Think fast.',
    crowdScan:      'Crowd Scan! Read the room.',
    cosmicSurprise: 'Ooh, what\u2019s in the box?',
    orbitDrop:      'Orbit Drop! Aim true.',
    vault:          'Vault time, baby!',
  },
  // The titles on Daily's round bumper cards (the one-second title card before each round):
  // show-style names, never the name of a game (Brain Beam is the trivia game only).
  // Round 1 is the opener, a riddle round is the head scratcher, the finale is the grand
  // finale, and the rounds in between take these in turn (round numbers keep counting up
  // when the show repeats).
  // Run 4A: the host's introduction after the curtains open (four cue lines, each up for at least 2 s), the one line
  // a returning player gets (about 3 s), and his outro before the results.
  intro: {
    first: [
      'Greetings, Earthlings! I\u2019m ' + HOST_NAME + ', and welcome to Galactic Game Night!',
      'My whole planet is hooked on game shows, and yours are the best in the galaxy. So here I am!',
      'We aliens think you humans are the coolest creatures in the Milky Way. I\u2019m here to learn what you like and how you think, and bring the funk back to my dull home galaxy!',
      'Tonight: VS matchups, trivia, riddles, mini-games and a Word Warp finale. Ready? Let\u2019s play!',
    ],
    back: 'Welcome back, Earthlings! Let\u2019s play!',
    outro: 'That\u2019s our show, Earthlings! See you tomorrow!',
  },
  // Run 4A: the explainer cards - `full` the first time a player meets the game, `short` after that (the ? button
  // replays the full one). A card stays up 1 s plus 0.25 s a word; over 15 words it waits for a tap. VS is the host's
  // own line on the first round's card.
  explainers: {
    vs:        { full:'Pick the one YOU prefer. There\u2019s no right or wrong answer! We\u2019re learning from the coolest cats in the Milky Way.', short:'Pick the one YOU prefer!' },
    riddle:    { full:'Read the riddle, then pick the right answer. Think fast, Earthling!', short:'Solve the riddle!' },
    lucky:     { full:'Spin the wheel, then hit STOP! Three spins for points and orbs - or BANK what you have. Beware the GOOP!', short:'SPIN, STOP or BANK!' },
    door:      { full:'Pick a portal. Behind it hides a surprise game!', short:'Pick a portal!' },
    zapWords:  { full:'Swipe across letters to spell words before time runs out!', short:'Spell the words!' },
    twinFlip:  { full:'Flip the cards and match every pair before time runs out!', short:'Match the pairs!' },
    orbitDrop: { full:'Drop your chips from the UFO. Land in the Mothership slot for the jackpot!', short:'Drop your chips!' },
    wordWarp:  { full:'Unscramble the six letters you earned. Beat the clock to win big!', short:'Unscramble the word!' },
  },
  roundTitles: {
    opener:  'THE OPENER',
    riddle:  'HEAD SCRATCHER',
    finale:  'GRAND FINALE',
    list:    ['CROWD SHOWDOWN', 'THE HOT SEAT', 'TWIST OF FATE', 'BIG MONEY ROUND', 'DOUBLE TROUBLE', 'TOP OF THE SHOW'],
  },
  // Daily's host cameos (the speech bubble in the corner, about a second
  // each): one is picked at random for the moment.
  cameo: {
    right:   ['Ding ding ding!', 'Out of this world!', 'Big brain energy!', 'Give that Earthling a letter!'],
    wrong:   ['Ooh, so close!', 'The crowd groans!', 'Not quite, Earthling.', 'Shake it off!'],
    slow:    ['Tick tock, Earthling!', 'Time’s up, folks!'],
    portal:  ['Pick a portal, any portal!', 'Which portal hides the prize?'],
    points10:  'Ten shiny points!',
    slowclock: 'Fifteen extra seconds for the Word Warp!',
    wildcard:  'Ooh, a Cosmic Surprise!',
    hint:      'A hint for the Word Warp. Shh!',
    match:   ['With the crowd!', 'The crowd agrees!', 'You read the room!'],
    combo:   ['You’re on fire!', 'Streak, streak, streak!', 'The crowd loves you!'],
  },
};
