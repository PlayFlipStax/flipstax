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
- [x] F8. Host SVG: a short neck; fix the arm hanging behind the body; Saucer Shuffle arms normal length with sleeve and hand shapes
- [x] F9. Peak or Plunge and Fact or Fib fill a tall screen (bigger blocks and buttons, spread vertically)
- [x] F10. Zap Words: why MELO counted; only real, common English words; report the final list size
- [x] F11. PEAK_OR_PLUNGE_REVIEWED = false (out of the rotation, TEST menu still plays it); data/peak-or-plunge.txt export; data/fact-or-fib.txt up to date; nothing marked reviewed

## G. Fix and content pass (Oct 16, afternoon)

- [x] G1. Flow: one show director (scene + gen, a single timer queue, everything pending cancelled on leaving a scene, double-advance guard); ?debug=1 overlay (step, card id, transition state, last 20 transitions); 30 automated random-tap runs: no VS card skipped or repeated, step count matches the rundown
- [x] G2. Timing constants at the top of data/rundown.js (ACT_CARD_HOLD 2800, MYSTERY_REVEAL_HOLD 3000, STAR_WIPE 1600, ROUND_BUMPER_HOLD 2200, COSMIC_SURPRISE_INTRO 2000); no cinematic moment under 1500ms; tap-to-skip only after 1000ms; auto-lite changes visuals only; episode length at a human pace (target 4:30-5:30)
- [x] G3. Commercial break out of the rundown (COMMERCIAL_ENABLED = false, code and the "Brought to you by" sponsor field kept); DIRECTION.md updated
- [x] G4. Peak or Plunge: item 31 "The first website opens to the public"; same-category pairs, no equal neighbours, no near-ties within 10%; PEAK_OR_PLUNGE_REVIEWED = true
- [x] G5. Fact or Fib edits (#4, #10, #35, #39, #55, #86, #93, #111, #117), a topic tag per statement and a no-duplicate-topic picker; data/fact-or-fib.txt; FACT_OR_FIB_REVIEWED = true
- [x] G6. Snap Sort tiers (easy Act 1 / medium Act 2 / hard Act 3), every category with 3-6 items, 6-10 near-miss decoys and a note each; 60+ new categories, 20+ hard; data/snap-sort.txt; SNAP_SORT_REVIEWED = false (hard = TEST menu only)
- [x] G7. Lucky Lights palettes as CSS variables: 1 burgundy velvet + warm gold bulbs (default), 2 midnight indigo + white/yellow bulbs + hot pink, 3 near-black + rainbow bulbs + bright white tiles; GOOP green on all; TEST menu and ?luckytheme=1/2/3

G2 measured (Oct 16, one real-time episode at 4 s a VS pick, 8 s a question, full game timers): 6:03 with the 12 s first-time cold open, 5:54 for a returning player - over the 4:30-5:30 target. Where it goes: 24 VS cards 2:36 (about 6.5 s each), Word Warp 1:04 (its full 60 s timer), 6 Brain Beams 1:00, Mystery Games 0:33 (Riddle 13 s, Snap Sort 20 s), act cards 0:12, Lucky Lights 0:07, Portal Pick 0:06, Orbit Drop 0:06. Nothing trimmed without asking.

## H. Cleanup pass (Oct 16, evening)

- [ ] H1. Old test suites (Infinity phase 2, Infinity phase 4, results image fit): NOT DONE - they are not in this repository (no test files are tracked; the old harness lived in an ignored screenshots/qa folder that is not on this machine). Needs the machine that has them: fix, update or delete each one
- [x] H2. Orbit chips economy checked with 1,000 simulated episodes: average player 2 chips 50%, 3 chips 33%, 4 chips 12%, 5 chips 4%, 6 chips 1%; weak player 81 / 15 / 3 / 0 / 0. LUCKY_PLINKO_MIN (280) is NOT the chip rule - it is the Orbit Drop score a player needs for the Lucky Bounce personality card - so it was left alone; the minimum-chips rule is ORBIT_MIN_CHIPS = 2. Half of average players sit on the 2-chip minimum (over the 15% line) - a design call, not changed: see the report
- [x] H3. Anonymous event counting (/api/event, /api/stats, /stats page with STATS_KEY); about 12 Redis commands per episode for events. The existing vote writes are far bigger (about 7 commands per vote, 24 votes an episode)
- [x] H4. PROGRESS.md and DIRECTION.md brought up to date
- [x] H5. Orbit Drop: an early Auto-drop tap during the host intro could strand "See your results" - fixed

NEXT: H1 (needs the machine with the old test suites); set STATS_KEY in the Vercel project (Production and Preview) before opening /stats; decide the Redis plan (see H3); pick a Lucky Lights palette (TEST menu or ?luckytheme=1|2|3); check data/snap-sort.txt (hard tier) and then set SNAP_SORT_REVIEWED = true; the episode runs about 5:35 first time - decide whether to trim it (see PROGRESS G2 note).

## I. Run 2 - design foundation (Oct 16, night). Looks, structure and motion only: no game logic, content, director or rundown timing changes.

- [x] I0. ORBIT_MIN_CHIPS 2 -> 3. Re-simulated (1,000 episodes each): average player 3 chips 83%, 4 chips 12%, 5 chips 4%, 6 chips 1% (avg 3.22, was 2.72); weak player 3 chips 96%, 4 chips 3% (avg 3.05, was 2.24). Nobody gets 2 any more; most players now sit on the new floor of 3, so the earned chips only show up from 4 up
- [x] I1. Design system: lib/design.css tokens + shared components, DESIGN.md
- [x] I2. One mini-game template for the six new games, --game-bg with gradient + pattern fallbacks, 360/390 px checks
- [x] I3. Motion standards in DESIGN.md (transform/opacity only, 60-120 ms staggers, no layout thrash, will-change sparingly, lite = looks only). tools/frametime.ps1 + tools/frametime-probe.js: plays a ?replay=1 episode (fast-forwarded) in headless Chrome on a 390x844 phone with the CPU throttled 4x, prints per-screen p50/p95/max frame ms and dropped frames (-Lite, -Profile for layouts/style recalcs per second). Worst offenders fixed: the VS round timer drained by animating width and its shimmer by animating left (a layout every frame) - both are transforms now, as is the Brain Beam timer bar; the ~90 marquee bulbs each ran their own chase animation with will-change - now 4 groups of bulbs, 4 animations; the results Ko-fi button idles only while the results are up.
  Before (full mode, CPU x4): all screens p95 33.7 ms, 475 dropped frames; VS p95 34.1 ms / 285 dropped, Lucky Lights 34.2 / 36, Brain Beam 33.8 / 45, Portal Pick 33.7 / 8; about 57 layouts a second on every screen.
  After (full mode): all screens p95 17.3 ms, 123 dropped; VS 17.3 / 40, Lucky Lights 17.4 / 14, Brain Beam 17.3 / 18, Portal Pick 17.3 / 6; VS layouts 57 -> 15 a second. Lite mode: all screens p95 17.2 ms, 106 dropped (Portal Pick p95 33.8 over only 57 frames). Still heaviest: style recalcs from the host SVG's inner animations (blink, wave, sparkles) - see I4.
- [x] I4. Host pose system (lib/host.js), PNG poses with SVG fallback, callers migrated, events mapped to poses
- [x] I5. Landing / menu and cold open polish with the tokens
- [x] I6. Verified: the 40-episode flow set, random taps at 40-2500 ms - 15 normal + 15 in lite mode (?lite=1) + 10 on random other days (3 with a Cosmic Surprise): 40 of 40 pass, no VS card skipped or repeated, every block dealt its count, scenes in rundown order, no script errors. Screenshots of every screen at 360 and 390 px in screenshots/run2/screens (local only - screenshots/ is git-ignored); the template passes in run2/i2, host poses in run2/i4, landing/menu/cold open in run2/i5. Fixed on the way: a TEST-menu jump left the previous Mystery Game's overlay over the next screen.
  Still weak: (1) Word Warp - an empty lower half, small Clear / Submit buttons; (2) Results - the Ko-fi DONATIONS button overlaps the CONGRATULATIONS ribbon, and the page runs long (the new-card section needs a scroll); (3) Cosmic Surprise - a small slot machine in a big empty stage, reels blank until they spin; (4) Portal Pick - small doors and gift with empty space above; (5) Twin Flip - an empty glow band above the grid; (6) the host is still the drawn SVG everywhere - no pose art in data/host yet, so poses are CSS moves.

## J. Real-phone bug-fix pass (Oct 16). An episode on a real phone lasted ~2.5 min; act cards popped up over running VS cards.

- [x] J1. Flight recorder (?debug=1): every scene transition with time and trigger (named timer, tap, skip, watchdog), pointer events (touchstart, pointerdown, click) with targets, two advances within 400 ms flagged; viewport, userAgent, devicePixelRatio, auto-lite and why, service worker / cache version, the rundown loaded; a Copy log button on the results screen and an elapsed-time badge; nothing sent to the server
- [x] J2. Find and fix the cause (touch + click double advance, a skip tap passing through, auto-lite shortening scenes, timers surviving their scene, a stale service worker / cache); a test with real touch sequences (touchstart, touchend, a synthesized click ~300 ms later, a tap during every cinematic) through a whole episode, asserting the scene order and minimum cinematic durations; reproduce first if possible
- [x] J3. Print today's rundown (acts, games and counts, letter-giving trivia, riddles); expected 6 trivia and 1 riddle (fixed Mystery Game 1)
- [x] J4. Zap Words: found words stay highlighted (a colour per word) and go in a found list; only invalid swipes flash and clear; tested with simulated swipes
- [x] J5. Cosmic Surprise: the prize applies and shows clearly what was won; a test
- [x] J6. ORBIT_MIN_CHIPS 3 (already 3 since I0) and the chip economy simulation re-run
  J2 result: REPRODUCED with tools/touch-episode.py (real speed, phone-style taps: touchstart/pointerdown, touchend/pointerup, a click 300 ms later on whatever is under the finger, taps through every cinematic): the episode took 2.58 min and VS cards were voted 7-152 ms after they appeared - (b) a tap meant for one screen landing as a click on the next (the VS halves stay put, so the new card took the vote). Also a cold open skipped at 1.25 s (SKIP_AFTER 1000 < CINEMATIC_MIN 1500). Fixed: a ghost-click guard (a click whose finger came down before the current scene began is dropped and logged) and skips only after max(SKIP_AFTER, CINEMATIC_MIN). After: 2 normal + 1 lite episodes pass (exact scene order, minimum cinematic times, no card voted under 250 ms, no two advances within 400 ms), 10-14 ghost clicks swallowed per episode. Ruled out: (a) touch + click double advance (nothing advances on touch/pointer events), (c) auto-lite shortening scenes (a lite episode has the same timings), (d) timers surviving their scene (the director drops them; 0 stale advances seen), (e) a service worker / cache (none registered; the recorder logs both). A very fast tapper still finishes in about 2.6-2.7 min - that is their pace, not skipped scenes.
  J3 result (episode 16, Oct 16): Act 1 THE OPENER - 5 VS, Brain Beam easy (letter), 4 VS, Mystery Game 1 Riddle (fixed; a key, no letter), Brain Beam easy (letter). Act 2 DOUBLE TROUBLE x2 - 5 VS, Brain Beam medium (letter), Portal Pick, 4 VS, Mystery Game 2 Zap Words, Brain Beam medium (letter). Act 3 LIGHTNING ROUND x3 - 6 VS, Brain Beam hard (letter) x2, Lucky Lights. Grand finale - Word Warp, then Orbit Drop. 24 VS cards, 6 Brain Beams (all 6 give a letter), 1 riddle, no Cosmic Surprise today, no commercial. As expected - nothing to fix.
  J5 result: every prize did apply (points, key, chip - checked in the run state), but nobody could see it: the prize was a small line under the slot and the screen closed 0.5 s after the reels stopped, with the act multiplier left off. Now a big prize pill (YOU WON! +20 POINTS / +1 KEY / +1 CHIP and what it is for), a cash-register ding, the HUD score or key count popping, held 1.8 s. tools/cosmic-prize-test.py checks all four prizes.
  J6 result: ORBIT_MIN_CHIPS was already 3 (since I0); left as is. tools/chip-economy-sim.py (new, 20,000 episodes each; Mystery Game wins, Lucky Lights with GOOP, Cosmic Surprise 1 in 3, a solved Word Warp; the skill levels are assumptions): average player - min 2: avg 2.67 chips, 49% sit on the minimum; min 3: avg 3.16, 84% on 3, 15% on 4, 1% on 5. Weak player - min 2: avg 2.15, 87% on the minimum; min 3: avg 3.02, 98% on 3. 16% of average and 57% of weak players earn only 0-1 chips themselves, so with 3 the floor sets most players' finale; nobody reaches the cap of 6.

## K. Run 3 - stage and cast (Oct 16-17). Looks only: no game logic, content, director, timing or J2 guard changes.

- [x] K1. Art (99bf672): tools/build-art.py - stage WebP (close 1080x1440 153 KB, wide 1600x1195 224 KB, dim 540x720 16 KB); the character PNGs had no alpha (flat grey backdrop), so tools/cutout.swift lifts them (macOS Vision), then trim, one baseline, 900 px tall WebP: host discoPoint/oops/laugh 52-54 KB, cast orange-idle 65 KB, pink-presenting 65 KB; 682 KB in all. The art was in the repo root, not data/stage, data/host, data/cast; purple-presenting.png was missing; originals not committed.
- [x] K2. Stage system (00ea9e9): lib/stage.js + lib/stage.css - close (push-in 1.00 -> 1.06), wide (pan), dim (pre-blurred, 55% scrim, vignette); 600 ms crossfade cuts; light sweep and glow pulse; close preloaded, wide lazy from the cold open; lite / reduced motion still.
- [x] K3. Marquee (27049a9): the sign found in both pictures, live text in percent of the picture, the close shot's cream panel darkened; tools/stage-sign-check.py - 0.0 px off at 360-1024 px, no clipping.
- [x] K4. Scenes (6e1cac6): the table in DESIGN.md "The stage"; dim behind all gameplay (white text worst case 7.7:1); Orbit Drop, Vault, commercial, bumpers and disco keep their looks.
- [x] K5. Cast (ba913dd): lib/cast.js + lib/cast.css + data/cast/manifest.js; showcase moments only (door, Cosmic prize, Word Warp solve, Lucky Lights bank, results); the sidekick's laugh once per act after a red-X wrong pick; presenter by episode seed.
- [x] K6. Host image mode (c0587b0): HOST_IMAGE_MODE needs idle, blink, wave, cheer, think, shrug, oops, laugh, presenting in data/host/manifest.js (nothing registered); the cast follows it, so today the stage shows alone. tools/host-mode-check.py: 11 checks pass.
- [x] K7. Verified (Mac): frame times with tools/frametime-webkit.py (the probe in WebKit, no CPU throttle - Chrome / tools/frametime.ps1 is not on this Mac): before (1c8c466) vs after, full and lite - every screen p95 17-18 ms on both, the same; 'results' shows p95 66-76 ms on both builds (its ~12 frames are the moment the results first lay out, as the probe stops). Touch episodes (real speed): after 3 of 5 pass, before 2 of 2; the 2 fails were one VS card each voted 200 / 247 ms in - a test tap whose finger came down ~10 ms before the previous tap's delayed click, which the J2 guard (left alone) reads as a fresh tap; not from Run 3. Flow set tools/flow-episodes.py: 40 of 40 pass (15 today, 15 lite, 10 other days, 4 with a Cosmic Surprise). Screenshots of every screen at 360 and 390 px in screenshots/run3 (local only).


## L. Run 4A - show structure and flow (Oct 22). Flow, structure, transitions and intros only: no restyle of games, palettes or tiles.

Verify on Windows: `tools/flow-episodes.ps1` (the 40-episode set in headless Chrome over CDP: 15 today, 15 lite, 10 other days; `-RealTime` for real-speed episodes with a patient player) and `tools/frametime.ps1` (full and `-Lite`, CPU x4).
- [x] L1. Round structure: cold open, six rounds (title card, VS block, one Brain Beam, the round-end game, a reward beat), the Word Warp finale, the results. Round-end games: R1 Riddle Round (30 s), R2 Lucky Lights, R3 Mystery Door, R4 Zap Words (28 s), R5 Twin Flip (25 s), R6 Orbit Drop (now mid-show; its winnings go straight into the score, then the Word Warp). Brain Beams easy / easy / medium / medium / hard / hard; points x1 / x1 / x2 / x2 / x3 / x3. Gold keys (keys and chips are one thing now: each is an Orbit Drop chip, ORBIT_MIN_CHIPS 3, at most 6); Lucky Lights' CHIP squares are gold keys; the Word Warp no longer adds a chip (it comes after Orbit Drop). Round tracker under the HUD pill. Peak or Plunge off (`RUNDOWN.off`). ACT -> ROUND in every on-screen text; flips -> cards. Verified: 40 of 40 fast episodes pass (15 today, 15 lite, 10 other days; 3 re-run after a test-port clash, none a game fault); frame times full p95 16.9 ms / 462 dropped, lite 16.8 ms / 259 (before: 16.9 / 498, 16.9 / 268). A real-speed check (patient player) reached Round 5 at 4:00 - about 5:30 an episode before the intros and explainers.
- [x] L2. Cast: Barnaby and the pink presenter out (files kept); Cleo Cosmic (purple-presenting, cut out of its studio backdrop, 900 px WebP) is the presenter; Kandi Cosmos wired up, sitting out until she has a picture; the corner host is off every gameplay screen; reactions on milestones only, about one time in three: Cleo pops out on a round-end game won, the host laughs or winces on a failure. `HOST_NAME = 'Flip Sterling'` (data/game-names.js). incoming-assets/ in .vercelignore. Verified: 40 of 40 fast episodes pass; frame times full p95 16.8 ms / 257 dropped, lite 16.8 / 142 (Stage 1 on the same quiet machine: lite 16.8 / 140).
- [x] L3. A simple ENTER screen (the host sized to the room under the button - he covered it at 390x760); ENTER goes straight into today's show: the curtains part and the host introduces himself in four cue lines (each at least 2 s; returning players: one 3 s line); each round announced in one line; an outro before the results. No How to play walkthrough before the show any more. Verified: 39 of 40 fast episodes pass - the one miss never got past the landing (the test tapped ENTER before the page was ready; the runner now waits for it) - and 6 of 6 more after that fix; frame times full p95 16.8 ms / 293 dropped, lite 16.8 / 247.
- [x] L4. One game intro (spotlight sweep, title slam, bulb chase, 2 s) before every round-end game and the Word Warp; explainer cards (full the first time, one line after; 1 s + 0.25 s a word; over 15 words waits for a tap; seen keys in localStorage, versioned); the ? button; the host explains VS on the first round's card the first time. Verified: 34 of 40 fast episodes pass - the 6 misses lost their Chrome connection (no game result; the test machine was out of memory at 6 in parallel) - and 6 of 6 re-run at 3 in parallel; frame times full p95 16.8 ms / 733 dropped, lite 16.8 / 410 (dropped frames vary a lot from run to run here).
- [x] L5. The zoom through the marquee (0.9 s, one bloom pulse, transform and opacity only; reversed at the next round; lite and reduced motion: a quick crossfade). Round titles on the marquee for the card's length. Verified: 5 of 5 fast episodes pass; frame times full p95 16.8 ms / 455 dropped, lite 16.8 / 444.
- [x] L6. The Mystery Door: four doors, four different bonus games by the date (Emoji Decode, Time Warp, Snap Sort, Saucer Shuffle, Fact or Fib, Price Probe); the picked one plays, the others are shown. No power-ups from the door (the Portal Pick code stays, TEST menu only). Snap Sort behind the door plays its medium tier (rounds 1-2 easy, 5-6 hard); the event counters know the door and Orbit Drop. Verified: 5 of 5 fast episodes pass; frame times full p95 16.8 ms / 416 dropped, lite 16.8 / 205.
- [x] L7. Brain Beam: the face-down ? tile now leaves from the answer's letter badge clear of the UFO (it rose through it) and lands before the result closes; no bouncing YOU GOT IT! over the Daily panel. Light safety: every blink at least 0.36 s a cycle (bulb strobe, marquee blink and miss, Lucky Lights hit, the Cosmic reel bulbs, the vault laser, the Brain Beam win blink, the riddle TV static), the wrong-answer red edge softened. SNAP_SORT_REVIEWED and COMMERCIAL_ENABLED stay false. DESIGN.md: "The show flow (Run 4A)" and the cast updated. Verified: 5 of 5 fast episodes pass; frame times full p95 16.8 ms / 422 dropped, lite 16.8 / 362.

## M. Follow-up #2 (Oct 22) - VS pace
- [x] M1. VS cards: 5 s a card for every round (VS_TIMER_MS in data/rundown.js; it was 7 s in rounds 1-4); a tap ends the wait and the next card comes once the 1.2 s reveal has played (that was already so); 6 VS cards a round (VS_PER_ROUND, was 4): 36 a show (35 + a Cosmic Surprise on days it rolls). 'Relaxed pace' in the sound popover (tap the speaker): 8 s a card, kept on this device (flipstax_relaxed_pace).
- [x] M2. VS inventory: tools/vs-inventory.py - 869 unique cards (Daily 440, Infinity 429, none in both), counts by category and (hand-tagged) era; the cards carry no era field.
- [x] M3. ?replay=1&realtime=1: real speed even next to ?debug=fast, the replay tag shows an episode clock.
- Episode length, a first-time player (12 s cold open), real speed, whole show cold open to results (tools/touch-episode.py paces=...): fast tapper (0.4-2.5 s a VS card, answers in under 2 s) 5.1 min; average (1.5-3.5 s a card, 3-8 s reading a Brain Beam) 6.5 min; slow (3-4.8 s a card) 7.2 min; never taps (every card runs its 5 s out) 7.2 min. Relaxed pace: average 6.6 min; never taps (8.9 s a card) 9.0 min.


## N. VS block and one card pool (Oct 23)

- [x] N1. 8 VS cards a round (VS_PER_ROUND in data/rundown.js, was 6), still 5 s a card (VS_TIMER_MS; Relaxed pace 8 s). An episode now has 48 VS slots (one may be a Cosmic Surprise).
- [x] N2. One VS pool: buildCardPools merges the Daily and Infinity lists (a card in both, by its two sides, once); both modes draw from it, each keeps its own deck (Daily in the date's order, Infinity shuffled). 869 cards (440 from the Daily list, 429 from the Infinity list, none in both).
- [x] N3. data/vs-export.txt: every VS card as `category | left | emoji | right | emoji | era`, with the count per category (25 categories; wild 112, movies 109, sports 102, music 84, food 77 ...) and 501 cards with no era. Eras come from the hand tags in tools/vs-inventory.py (classic / modern / now / cross-era); untagged names count as no era.
- [x] N4. Code only Infinity mode uses (nothing removed yet):
  - Entry: the menu's Infinity half (`#modeInfinityBtn`, `.ms-gold`, `#msInfDesc`, the INFINITY FLIPS wordmarks), `inInfinity()` and the `mode-infinity` class (about 30 and 210 uses), `contentPoolKey()`'s infinity branch, `decks.infinity`.
  - The run: `infRun` and `ensureInfRun / saveInfRun / startNewInfRun`, the 10-minute run clock (`INF_RUN_CLOCK_MS`, `startInfClock / renderInfClock`), FINISH_POINTS and the points bar, keys and the key meter (`addInfKey`, `keyMeterHtml`, `INF_KEY_CAP`, `INF_MATCHES_PER_KEY`, WORDHUNT_KEYS / Zap Words milestone), star cards (`INF_STAR_POINTS`), milestones (`INF_MILESTONES`), `INF_PICK_MS` / `INF_ZONE_PICK_MS`.
  - Its rounds: Infinity trivia (`runWildEvent`, `INF_TRIVIA_CHANCE`), the power-up round (`runPowerUpRound`, the `POWERUPS` list: +10 Points, Coin Flip, Cosmic Surprise, Golden Key; `runCoinFlip`, `startCoinRays`, `runWildGift`), the Points Zone (`startBonusZone`, `INF_ZONE_CHANCE`, Noon Rush), the Infinity riddle (`startInfRiddle / resolveInfRiddle / closeInfRiddle`, `#irOverlay`, `INF_RIDDLE_*`, the riddle bag), the host intro cards (`hostIntro`, `#hostOverlay`, HOST_LINES / quips in data/game-names.js `host`).
  - Its finale: `openInfFinale / buildInfFinale / showFinStage / closeInfFinaleView`, `#finComplete`, the Mothership Vault (`#finVault`, `renderVault`, `vaultDrama`, the vault alien), Orbit Drop through `infRun.finale` (pkF's Infinity branch), the 50-card award (`showInfAward`, `#infAwardOverlay`, `INF_AWARD_VOTES`, `INF_BLOCK_KEY`).
  - Sharing and collection: `buildInfinityShareData`, `renderInfinityRunShare`, `infRunShareText`, Infinity badges (`infinityKeysBy`, category badges counted on the Infinity list's card ids only).
  - Saved on the device: `flipstax_inf_run_v1`, `flipstax_inf_runs_v1`, `flipstax_inf_block_v1`, `flipstax_inf_riddles_v3`.
  - Other: the How to play Infinity screens (`HOWTO_RUN_INFINITY`, `HOWTO_LAST_INFINITY`), the TEST menu's Infinity jumps (`infReplayEnter`, `INF_SAMPLE`, `INF_MID`), the Infinity CSS blocks (`.mode-infinity ...`, `.inf-*`, `.ir-*`, `.fin-vault`, `.host-overlay`).
  - Not Infinity-only (keep): data/infinity-riddles.js (the Daily Riddle Round uses it), the INFINITY_*_RAW card lists (now in the one pool), Crowd Scan (TEST menu), Orbit Drop's board.
- [x] N5. Final check (0656a7f): 10 of 10 fast episodes pass (5 today, 3 lite, 2 other days); frame times full p95 16.8 ms / 239 dropped, lite 16.8 / 291; 3 real-speed episodes (a patient player, first time: explainers in full) 463, 478 and 499 s - average 480 s (8:00). Per round about: cold open 19 s, R1 65, R2 65, R3 61, R4 88, R5 81, R6 61, finale 23-53 s.
