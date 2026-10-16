# FlipStax progress

The mega build (Oct 16), on `infinity-finale` only (main stays on e183f2c). Work the items in
order; after each: test, tick it here, commit, push. A new session continues from the first
unticked item. Rules: DIRECTION.md (incl. "Decisions, Oct 15"), lite mode intact for every new
effect (`?lite=1`, auto below 40fps), transform/opacity motion, one colour world per game, no
new fonts, original art, no real brand or show names, every new game gets a TEST-menu jump and a sound.

## A. Opening (highest priority)

- [x] A1. Landing page (before Enter): TV game-show lobby - logo as a bulb-lit marquee sign (slow chase), purple/magenta stage and floor, host alien lower right, "Tonight's show" line with the EPISODE number, big glowing ENTER button, existing menu cards and donation buttons restyled onto the stage, slow spotlight beams
- [x] A2. Background after Enter (menu, between screens): the same studio set (dark stage, soft spotlights, faint audience lights, slow rays) instead of the plain sky / old yellow Infinity look
- [x] A3. Cold open: ~4s fabric curtain pull with sway; no alien head, loose cards or VS SHOWDOWN/?/GRAND PRIZE; full host alien (silver suit, retro mic) at center stage; plates WELCOME TO FLIPSTAX! then EPISODE n (each >= 1s), bulbs flash on the plate, a spotlight follows him; 12s first / 3s returning / tap to skip
- [x] A4. Motion: spotlight beams sweep and sway (soft cones, own timings, 6-10s); static glow in lite mode; host idles (bob, wave, blink), slides to center on Enter as beams swing to him; host SVG in lib/host-alien.js (silver suit, mic) with an image-swap hook

## B. Bugs

- [x] B1. Brain Beam answers don't register after a TEST-menu jump
- [x] B2. A normal full run (?replay=1, no TEST menu) never repeats a VS card and never skips an act or Mystery Game (Mewtwo vs Mew repeating, "speeding up and skipping")
- [x] B3. The star wipe is too big / covers the screen too long: cap it so the card is visible at least 1s
- [x] B4. Orbit Drop: "See your results" only after the last chip lands

## C. VS cards

- [x] C1. A minority pick is never punished: no red X, MISSED or negative sound; a gold-to-pink HOT TAKE! / BOLD PICK! tag, at most a soft whoosh; a crowd match keeps the gold pill and chime; red X + buzzer only for Brain Beam and Riddle
- [x] C2. Selection sounds: soft same-instrument DING (top card) and DONG a major third lower (bottom), each < 200ms, mute and master volume respected

## D. Overhaul

- [x] D1. Oddball Alert and Price Probe out of the Mystery pool (code kept)
- [x] D2. Riddle: fixed Mystery Game 1 (Act 1, every episode); restyled after refs/riddle (split-flap tiles, riddle-show look, green world with flying ?s); multiple choice kept
- [x] D3. Mystery Game 2 from the pool (Emoji Decode x2, Crowd Scan x2, Time Warp, the Part E games; Fact or Fib only when FACT_OR_FIB_REVIEWED); no game on consecutive days; the spinning wheel replaced by a ~2s host reveal (a small curtain/door opens on the name). (Each Part E game joins the pool in data/rundown.js when it ships.)
- [x] D4. Cosmic Surprise: a small 3-reel slot machine (~2s, small prizes: points, a key, a chip) instead of the gift box; still ~1 episode in 3
- [x] D5. Lucky Lights: deep red and white marquee bulbs on a dark teal stage; DIRECTION.md colour table updated
- [x] D6. Word Warp: the UFO hovers over the tiles; a correct letter/word beams the letters up with an animal (cow, or one picked by the date seed); a wrong guess makes the beam flicker and miss
- [x] D7. Disco celebration on THE MOTHERSHIP (max once an episode): disco ball lowered from the UFO, lights dim, mirror spots, a second alien hops out, ~4s dance with bulb flashes, tap to skip; lite mode = static ball + sparkles; noted in DIRECTION.md as the one exception to "one host per screen"; audio-sting hook (silent)
- [x] D8. (done after Part E) (lowest priority) The commercial break as a retro TV ad: scanlines, curved TV frame, flat 80s product art, announcer tagline, "We'll be right back" 3-2-1 bumper; invented brands only; a "Brought to you by" field for a future sponsor

## E. New Mystery Games (20-45s, tap-based, own colour world, bulbs, sounds, lite-safe, names in data/game-names.js, TEST-menu jump each)

- [x] E1. Peak or Plunge (higher/lower): 5 rounds, +10 each; data file of ~60 items, every number sourced in a comment
- [x] E2. Snap Sort: a category, 8-10 words fly by, tap the ones that belong (a wrong tap costs a second), 15s, ~40 categories
- [x] E3. Zap Words: 6x6 grid, swipe neighbouring letters, longer words score more, ZAP_SECONDS = 20, a hint, good phone swiping, a plain word list in the repo, grids with guaranteed words
- [x] E4. Twin Flip: 4x4 memory match, original 70s/80s neon icons, 25s, stage look after refs/memory-match
- [x] E5. Fact or Fib: host pops up with a statement, TRUE / FIB buttons, ~6s each, 5 statements, +10 each, +20 for 5/5, a one-line reaction after each; ~120 statements in data/fact-or-fib.js + data/fact-or-fib.txt, marked NOT FACT-CHECKED, out of rotation until FACT_OR_FIB_REVIEWED
- [x] E6. Saucer Shuffle: three saucers on a table, the host shuffles them (arms and eyes follow the logic's exact positions), 3 rounds faster each time, tap the star's saucer, +10, ~25s

## F. Fix pass (Oct 16, after the mega build)

- [x] F1. Fact or Fib: TRUE / FIB fully visible and tappable on a 390x844 phone (safe-area padding), the host's bubble never covers them, the statement stays readable with the one-line fact after the answer
- [x] F2. VS with no real crowd (first vote, or under 30 votes): no CROWD SAYS numbers and no HOT TAKE / BOLD PICK - a friendly "You're the first to vote!" note instead (keep "Early crowd" under 30 if it exists); same rule in Crowd Scan
- [x] F3. The HOT TAKE / BOLD PICK tag as a corner pill at the card's edge, off the art
- [x] F4. Menu: TONIGHT'S EPISODE n as the title (keep the same-show-for-everyone line), "How to play" (no "Daily"), less empty space at the top
- [x] F5. Landing: host ~40% larger and centred on the stage, tighter spacing so logo, episode line, button and host read as one scene
- [x] F6. Act cards: the new host cropped (head and shoulders with the mic) instead of the old head-only alien
- [x] F7. Star wipe ~60% of its size; the card fully readable for at least 1 s
- [ ] F8. Host SVG: a short neck; fix the arm hanging behind the body; Saucer Shuffle arms normal length with sleeve and hand shapes
- [ ] F9. Peak or Plunge and Fact or Fib fill a tall screen (bigger blocks and buttons, spread vertically)
- [ ] F10. Zap Words: why MELO counted; only real, common English words; report the final list size
- [ ] F11. PEAK_OR_PLUNGE_REVIEWED = false (out of the rotation, TEST menu still plays it); data/peak-or-plunge.txt export; data/fact-or-fib.txt up to date; nothing marked reviewed
