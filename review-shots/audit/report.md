# FlipStax look-and-feel audit

- **Date:** 13 Nov 2026
- **Build:** branch `a-plus` at `e3ab573`, run locally
- **Size:** 390 x 844, normal mode (not lite, not reduced motion)
- **Read-only:** no game file was changed, nothing was committed or pushed
- **Stills:** 40, in this folder; all of them together in `contact-sheet.png`

## How it was done

Each screen was opened from the TEST menu (`?replay=1&realtime=1&test=1`) in headless Chrome and played at real speed. A frame was saved every 1.5 s and the typical moment and the win or result moment were picked from those frames. Nine games were played by the project's own test player (random taps). Seven were played by a scratch helper that uses the games' test hooks so they reach a real win (Chomper, Twin Flip, Zap Words, Star Sequence, Space Launch, ZiG Zap, Word Warp).

Scores are my judgement from the stills and the frame series, 1 (weak) to 5 (strong). The purple figure is measured: the share of the typical still's pixels whose hue is purple (250 to 300 degrees), including dark purple.

**Not covered:** lite mode, reduced motion, 360 x 640, real phones, sound. "Alive" is judged from frames 1.5 s apart, not from video.

## Scores

| # | Screen | Fits neon / 70s game show | Readable on a phone | Colour variety | Alive | Purple share |
|---|---|:-:|:-:|:-:|:-:|:-:|
| 1 | Landing | 5 | 5 | 3 | 3 | 14% (blue 48%) |
| 2 | Intro (Flip Sterling) | 5 | 5 | 5 | 4 | 8% |
| 3 | Crowd Showdown (VS cards) | 4 | 5 | 5 | 4 | 10% |
| 4 | Game title card | 3 | 5 | **1** | 3 | **84%** |
| 5 | Game Select | 3 | 4 | 4 | 4 | **42%** |
| 6 | Mystery Wheel | 5 | 4 | 5 | 4 | 6% |
| 7 | Zap Words | 3 | 5 | 4 | 3 | 3% |
| 8 | Galactic Chomper | 4 | 4 | 5 | 5 | 9% |
| 9 | Twin Flip | 4 | 5 | 4 | 4 | 13% |
| 10 | Orbit Drop | 5 | 4 | 4 | 4 | 26% |
| 11 | Word Warp | 3 | 5 | 3 | 4 | **34%** |
| 12 | Round-done card (alien girls) | 5 | 4 | 5 | 4 | 6% |
| 13 | Goodbye (Flip and the girls) | 5 | 5 | 5 | 4 | 11% |
| 14 | Results | 4 | 3 | 4 | 2 | 3% |
| 15 | Alien Blast | 3 | 4 | 2 | 4 | **39%** |
| 16 | Fact or Fib | **2** | 3 | 2 | 3 | 0% (teal 57%) |
| 17 | Emoji Decode | 4 | 3 | 5 | 4 | 20% |
| 18 | Time Warp | 4 | 4 | 4 | 4 | 16% |
| 19 | Star Sequence | 4 | 5 | 4 | 5 | 22% (blue 42%) |
| 20 | Space Launch | 4 | 5 | 4 | 5 | **33%** |
| 21 | Price Probe | 3 | 4 | 3 | 3 | 1% |
| 22 | Saucer Shuffle | 5 | 5 | 3 | 5 | **43%** |
| 23 | ZiG Zap ZaBAM! | 4 | 4 | 4 | 4 | **30%** |

### Purple flags

Only one screen is mostly purple outright: the **game title card** (84%), which plays before every game.

Purple is the single biggest colour on eight more: Saucer Shuffle (43%), Game Select (42%), Alien Blast (39%), Word Warp (34%), Space Launch (33%), ZiG Zap (30%), Orbit Drop (26%) and Emoji Decode (20%).

Star Sequence and the Landing are blue-violet rather than purple (blue 42% and 48%), so they read as purple at a glance.

Fact or Fib has the opposite problem: it is one colour too, but teal (57%).

## Notes per screen

1. **Landing.** Strong neon logo, UFO, disco balls. The only moving thing I saw was the ENTER glow. Purple-navy backdrop and a purple saucer.
2. **Intro.** The best "show" frame in the game: red curtain, bulb arch, Flip Sterling in the burgundy tux, disco floor.
3. **Crowd Showdown.** Bright candy cards, easy to read. The frame around the cards (header and backdrop) is purple. "Tap the one you prefer" at the bottom is small.
4. **Game title card.** A plain purple field with spotlights and a small plaque. It plays before every game, so it is where most of the purple comes from.
5. **Game Select.** 80s arcade by design, so it is neon but not 70s game show. Names are legible; the tile numbers are small. Dark purple backdrop.
6. **Mystery Wheel.** Gold bulbs, black and gold stage, full-colour wheel. Wedge labels are small and half of them are upside down at rest.
7. **Zap Words.** Orange and pink comic-book look with white tiles: clear, but not neon and not the show. The board is still until you swipe. Two small things: the result chip says +50 while the score chip says 25, and the found-word chips slide under the HINT button once there are four.
8. **Galactic Chomper.** A different galaxy per board, a real character, a big win (VICTORY, PERFECT). Longer words on tiles ("lemonade", "tomatoes") are small.
9. **Twin Flip.** The best Vegas marquee title in the game, and a lit stage floor. The card faces are the weak part: basketball, joystick, roller skate, bowling, dinosaur, flamingo, crystal ball, UFO. They have no theme, and two are animals.
10. **Orbit Drop.** Neon pegs, gold frame, neon sign. The slot labels at the bottom are small and the landed orbs sit on top of the "+20" figures.
11. **Word Warp.** Reads very well. It is a purple and magenta galaxy with no show-set, so it feels like a different game from the intro. The win (explosion, disco ball, dance) is strong.
12. **Round-done card.** The alien girls on the gold stage. Warm, on-brand, 6% purple.
13. **Goodbye.** Flip and the girls on the neon stage with confetti. On-brand.
14. **Results.** Neon FLIPSTAX sign on a navy curtain. The big numbers read well; the labels under them ("FLIPZ EARNED", "LETTERS WON") and "Tell us what you think" are tiny. Nothing moves once the confetti ends.
15. **Alien Blast.** Neon sign, ringed planet, crystals. The play area is nine black ovals on a flat teal-to-purple gradient; there is no ground or set.
16. **Fact or Fib.** A teal computer terminal with green typewriter text. It looks like a different app: no bulbs' warmth, no host, no stage. The line that explains each answer, which is the payoff, is the smallest text on the screen.
17. **Emoji Decode.** Good set (TV, saucer answers, planets). Two layout faults at 390 x 844: the outer two emoji are cropped by the TV frame, and a two-line fourth answer runs off the bottom and under Flip's speech bubble ("LET SLEEPING DOGS LIE" is cut).
18. **Time Warp.** Neon sign, dial, orange and pink cards. Solid.
19. **Star Sequence.** Saucer, five coloured beams, neon sign, big win. Blue-violet galaxy behind.
20. **Space Launch.** Sunset sky, rocket, gantry, altitude readout. Very alive. The top half of the sky is deep purple.
21. **Price Probe.** Blue sunburst and cream price tags. It has a Price-is-Right feel but no neon and no stage. After the reveal the two tags you didn't pick fade to grey-on-blue and are hard to read.
22. **Saucer Shuffle.** The richest set in the game (neon wall, chrome saucers, mirror floor). Also the most purple of any game.
23. **ZiG Zap ZaBAM!** Neon sign, colour-block wall, good question card. The squares are see-through over a busy wall, so the unclaimed "Z" marks are faint.

## Things that cut across screens

- **The bulb border is already one shared piece.** It is drawn once (`buildMarquee` in `flipstax.html`, the `.show-marquee` layer) and only its colour changes: one colour per part of the show (`BULB_COLORS`) and one per mini-game (`bulb:` in each game's definition). Today that gives pink bulbs on VS, cyan on Zap Words, white on Twin Flip, gold on the Wheel, and so on. Making it "the Vegas marquee" everywhere is a change in one place.
- **Flip Sterling and the alien girls are outside the games, not in them.** They appear in the intro, the round-done card, the goodbye and (Flip, as a small portrait) the results. Inside all 14 games Flip is only a speech bubble.
- **Old "Mystery Doors" wording is still shown to players** in three places: the title card before Game Select ("MYSTERY DOORS / Pick a portal!", `flipstax.html:11443` and `:12968`, `data/game-names.js:81`) and Flip's line "Round One! Doors, my friends. Doors!" (`data/rundown.js:49`).
- **Four games ask for a background picture that does not exist.** Zap Words, Twin Flip, Fact or Fib and Saucer Shuffle each request `style-board/assets/bg-<game>.png` and get a 404 on every play. It is an old optional art slot and harmless, but it is a wasted request on a phone.
- **A testing trap, not a player problem.** The local dev server (`.devserver.ps1`) answers one request at a time. While a video is loading, pictures behind it can fail to arrive, and a game then shows with a black background or a missing saucer. This cost three capture passes. The stills here were taken through a scratch server that answers many requests at once, with no failed picture downloads.

## Games that most lack a look, in order of need

1. **Twin Flip (the cards).**
   - *Change:* a grey alien on the card back, a galaxy behind the board, faces from five families only: aliens, UFOs, planets, rockets, stars. Keep the marquee title and the stage floor.
   - *Hardest to do safely:* the faces. There are 72 today (8 line drawings and 64 emoji) and their daily order is frozen in `data/schedule.js`, which must not be edited. Faces must not simply be removed from the pool: the picker skips a missing face to the next one, so two pairs on the same day can get the same picture. The safe route is a new pool under its own schedule name (no change to `data/schedule.js`), or keeping all 72 keys and redrawing each. Either way the faces must be easy to tell apart at about 70 px; planets and stars will look alike if they differ only by colour.
2. **Fact or Fib.**
   - *Change:* move it onto the show stage: marquee sign, warm colours, Flip Sterling working the lie detector. Make the explanation line as big as the statement.
   - *Hardest to do safely:* text fitting. Statements vary a lot in length and the game resizes them to fit its box; a new frame changes that box, so the longest statements need re-checking at 360 x 640.
3. **Price Probe.**
   - *Change:* a neon sign and a showcase stage behind the tags; keep the cream tags; keep the unpicked tags readable after the reveal.
   - *Hardest to do safely:* the MOST / LEAST switch. It is the game's trick and it must stay the loudest thing on screen.
4. **Zap Words.**
   - *Change:* a neon sign in place of the comic logo, a darker stage so the tiles glow, some idle motion on the board.
   - *Hardest to do safely:* the swipe. Hit-testing uses the middle 80% of each tile, so any change to tile size or spacing changes how diagonal swipes feel. Restyle the tiles; don't move them.
5. **Alien Blast.**
   - *Change:* give the holes a place to be (a cratered moon surface or a stage floor) and take the purple out of the lower half.
   - *Hardest to do safely:* green and red aliens must stay easy to tell apart, so the new set can't use strong red or green.
6. **Word Warp.**
   - *Change:* swap the purple galaxy for one in another colour (teal, gold, orange) and add a little of the show's set, so the finale belongs to the show.
   - *Hardest to do safely:* memory. The last stability fix (`8a9a942`) dismantles this screen layer by layer when the finale video starts. Any new layer has to be added to that clean-up or the phone crash can return.
7. **Game title card** (not a game, but seen before every game).
   - *Change:* a non-purple field per game, or the stage itself, behind the plaque.
   - *Hardest to do safely:* little risk; one template feeds every game. Timing must not change.
8. **Results.**
   - *Change:* bigger labels under the numbers, some slow motion (bulb chase on the sign, a sparkle on the score).
   - *Hardest to do safely:* the share picture is built separately from this screen; leave that alone.

Not on the list because the look is already there: Mystery Wheel, Saucer Shuffle, Galactic Chomper, Star Sequence, Space Launch, Orbit Drop, Time Warp, ZiG Zap, Crowd Showdown. Emoji Decode needs its two layout faults fixed, not a new look.

## Recommended build order

| Order | Upgrade | Size | Why here |
|:-:|---|:-:|---|
| 1 | Shared Vegas bulb border on every screen | Small to medium | One place in the code, touches every screen, and every later screenshot gets judged with it on. |
| 2 | Quick fixes: "Mystery Doors" wording (3 places), Emoji Decode cut-off answer and cropped emoji | Small | Visible faults today; no design decisions needed. |
| 3 | Twin Flip space cards | Medium (large if all 72 faces are redrawn) | Already specified; the biggest gap between brief and screen. Size depends on how much art is supplied. |
| 4 | Purple pass on the game title card and the VS frame | Small to medium | Removes the most purple for the least work: these are the screens seen most often. |
| 5 | Fact or Fib onto the stage, with Flip | Medium | Lowest look score. |
| 6 | Price Probe stage and sign | Small to medium | |
| 7 | Zap Words neon restyle | Medium | Plays every show (Round 3), so it is worth more than its rank suggests. |
| 8 | Alien Blast set | Small to medium | |
| 9 | Word Warp backdrop | Medium | Small as art, medium because of the clean-up it must respect. |
| 10 | Results labels and motion | Small | |
| 11 | Purple trim on Saucer Shuffle, Game Select, Space Launch, ZiG Zap, Orbit Drop | Small each | Recolouring only; do after the border so the amount needed is clear. |
| 12 | Landing backdrop | Small if new art is supplied | |

**Hardest part of step 1:** the bulbs sit 8 px from the screen edge and several games draw right up to it. Bigger bulbs will cover content on Zap Words, Saucer Shuffle and the "?" button. The border is built as four groups that fade in turn (4 animations instead of about 90), and it stands still in lite and reduced motion; both need to stay that way.

## Constraints for the build (from the brief)

- Keep Flip Sterling and the alien girls.
- Use the Vegas marquee bulbs as the shared border.
- Don't use purple as a main colour.
- Every Twin Flip card is space-themed: a grey alien on the back, a galaxy background, faces of aliens, UFOs, planets, rockets and stars. No animals, no unicorns.

## Stills

| File | Screen | Moment |
|---|---|---|
| 01-landing.png | Landing | ENTER screen |
| 02-intro-flip-sterling.png | Intro | Flip Sterling's welcome |
| 03-crowd-showdown-vote.png | Crowd Showdown | typical |
| 04-crowd-showdown-result.png | Crowd Showdown | after the vote |
| 05-game-title-card.png | Game title card | before a game |
| 06-game-select.png | Game Select | nothing picked |
| 07-game-select-picked.png | Game Select | a game picked |
| 08-mystery-wheel.png | Mystery Wheel | typical |
| 09-mystery-wheel-result.png | Mystery Wheel | JACKPOT |
| 10-zap-words.png | Zap Words | swiping a word |
| 11-zap-words-result.png | Zap Words | round over |
| 12-galactic-chomper.png | Galactic Chomper | board 2 of 3 |
| 13-galactic-chomper-win.png | Galactic Chomper | PERFECT |
| 14-twin-flip.png | Twin Flip | 3 of 8 pairs |
| 15-twin-flip-win.png | Twin Flip | TOTAL RECALL |
| 16-orbit-drop.png | Orbit Drop | orb falling |
| 17-orbit-drop-result.png | Orbit Drop | all orbs in |
| 18-word-warp.png | Word Warp | clock running |
| 19-word-warp-win.png | Word Warp | WARPED IT |
| 20-round-done-card.png | Round-done card | the alien girls |
| 21-goodbye.png | Goodbye | Flip and the girls |
| 22-results.png | Results | final score |
| 23-alien-blast.png, 24-alien-blast-result.png | Alien Blast | typical, result |
| 25-fact-or-fib.png, 26-fact-or-fib-result.png | Fact or Fib | typical, result |
| 27-emoji-decode.png, 28-emoji-decode-result.png | Emoji Decode | typical, result |
| 29-time-warp.png, 30-time-warp-result.png | Time Warp | typical, result |
| 31-star-sequence.png, 32-star-sequence-win.png | Star Sequence | typical, win |
| 33-space-launch.png, 34-space-launch-result.png | Space Launch | typical, result |
| 35-price-probe.png, 36-price-probe-result.png | Price Probe | typical, result |
| 37-saucer-shuffle.png, 38-saucer-shuffle-result.png | Saucer Shuffle | typical, result |
| 39-zig-zap-zabam.png, 40-zig-zap-zabam-result.png | ZiG Zap ZaBAM! | typical, result |

Two notes on the stills. Word Warp opened from the TEST menu starts with all six letters already won, so its typical still shows the word filled in. ZiG Zap's result is a loss (Flip made the row); the helper answered every question right but Flip still got three in a row first.
