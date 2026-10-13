// FlipStax - game names and the alien host's lines, in one place to edit.
//
// `names` are what players see for each game or round (the code keeps its
// own internal names). `host` is the one-line, cheeky rule the alien host
// says in a speech bubble the first time each game shows up in an Infinity
// run (a player's first 3 runs; after that just the `quip`). Keep host lines short (about 60 characters or less) and funny, like a
// 70s game-show host - never techy.
window.FLIPSTAX_NAMES = {
  names: {
    orbitDrop:      'Orbit Drop',            // the bonus finale (was Plinko)
    cosmicSurprise: 'Cosmic Surprise',       // the wild card power-up
    crowdScan:      'Crowd Scan',            // guess the crowd's split (was Guess the Crowd)
    brainBeam:      'Brain Beam',            // trivia
    riddleRound:    'Riddle Round',
    zapWords:       'Zap Words',             // word hunt (not built yet)
    priceProbe:     'Price Probe',
    oddballAlert:   'Oddball Alert',
    emojiDecode:    'Emoji Decode',
    timeWarp:       'Time Warp',
    portalPick:     'Portal Pick',           // the pick-a-door power-up
    wordWarp:       'Word Warp',             // Daily's finale word jumble
    vault:          'The Mothership Vault',
  },
  host: {
    brainBeam:      'Get it right for points and a key. Wrong? No harm, no foul!',
    riddleRound:    'Riddle me this! Four answers, one winner. Tick tock!',
    crowdScan:      'Guess how the crowd voted. No peeking, Earthling.',
    cosmicSurprise: 'Could be a prize, could be a pickle. Feeling lucky?',
    orbitDrop:      'Aim for the glowing slot, Earthling.',
    vault:          'Crack the vault, grab the coins. Don’t be shy!',
  },
  // After a player's first 3 runs the host just quips (a one-liner, about a second).
  quip: {
    brainBeam:      'Brain Beam! Think fast.',
    crowdScan:      'Crowd Scan! Read the room.',
    cosmicSurprise: 'Ooh, what\u2019s in the box?',
    orbitDrop:      'Orbit Drop! Aim true.',
    vault:          'Vault time, baby!',
  },
  // Daily's host cameos (the speech bubble in the corner, about a second
  // each): one is picked at random for the moment.
  cameo: {
    right:   ['Ding ding ding!', 'Out of this world!', 'Big brain energy!', 'Give that Earthling a letter!'],
    wrong:   ['Ooh, so close!', 'The crowd groans!', 'Not quite, Earthling.', 'Shake it off!'],
    slow:    ['Tick tock, Earthling!', 'Time’s up, folks!'],
    portal:  ['Pick a portal, any portal!', 'What’s behind door number…?'],
    points10:  'Ten shiny points!',
    slowclock: 'Fifteen extra seconds for the Word Warp!',
    wildcard:  'Ooh, a Cosmic Surprise!',
    hint:      'A hint for the Word Warp. Shh!',
    match:   ['With the crowd!', 'The crowd agrees!', 'You read the room!'],
    combo:   ['You’re on fire!', 'Streak, streak, streak!', 'The crowd loves you!'],
  },
};
