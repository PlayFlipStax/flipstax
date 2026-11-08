# FlipStax a-plus - transitions and timed screens, BEFORE the pacing pass (563f2a7)

All times are real-speed (the ?debug=fast test mode divides them by 6). "Cut" = the old screen is hidden and the new one shown in the same frame, no crossfade.

| Moment | Code | Hold / timing before | Tap to skip after | Transition |
|---|---|---|---|---|
| Landing -> CGI intro | lib/intro.js | ENTER starts the video at once; poster fallback 1.5 s; skip button after 1 s | 1 s | cyan flash 0.23 s, crossfade 0.46 s |
| Intro -> stage (cold open) | showColdOpen | host cue lines: 1 s + 0.25 s/word, min 2.0 s each | SKIP_MIN_MS = 1.5 s | crossfade 0.4 s (intro.js) |
| Round title card (act card) | showActCard | ACT_CARD_HOLD 2.8 s or the cue line + 0.5 s | 1.5 s | cut in, zoom 0.9 s out |
| Zoom through the marquee | zoomThrough | ZOOM_MS 0.9 s | - | transform zoom |
| VS card result (reveal) | VS_REVEAL_HOLD | 1.2 s, then the next card | - | slide 0.25-0.4 s |
| VS time-out ("Too slow!") | TOO_SLOW_NEXT_MS | 0.9 s, then the next card | - | slide |
| Round-end game title card | showGameIntro | GAME_INTRO_MS 2.0 s | min(1.5 s, ms - 0.2 s) | cut in, cut out |
| Explainer card | showExplainer | 1 s + 0.25 s/word (a 6-word line: 2.5 s; a 3-word line: 1.75 s) | 0.35 s | cut in, cut out (VS cards could show behind) |
| Mystery Game reveal | showMysteryReveal | MYSTERY_REVEAL_HOLD 3.0 s | - | cut in, cut out |
| Brain Beam / Riddle win | resolveRunTrivia | 2.2 s after the flip | 0.8 s | cut to the next scene |
| Brain Beam / Riddle miss | resolveRunTrivia | 2.6 s after the flip | 0.8 s | cut |
| Brain Break result | runBrainBreak | REVEAL_HOLD 1.4 s (Price Probe 2.2 s) after 0.3 s | 0.8 s | cut |
| Mini-game answer reveals (Peak or Plunge, Fact or Fib, Saucer Shuffle) | api.hold | 1.4 s (Fact or Fib 2.6 s) | 0.8 s | in-game |
| Mini-game result (+N / MISSED) | runMiniGame finish | 1.7 s, then the overlay is removed | - | cut |
| Lucky Lights result banner | land / finish | REVEAL_HOLD 1.4 s; banked 1.7 s, gooped 2.3 s | 0.8 s | cut |
| Mystery Portal pick -> game | runMysteryDoor | drumroll 0.45 s + swing 0.7 s + 1.4 s | 0.8 s | cut straight into the game (no title card) |
| Round Done (reward card) | showRewardBeat | REWARD_HOLD 2.2 s | 1.5 s | cut |
| Orbit Drop (Round 6) -> Word Warp finale | renderPlinkoTally | waits for the 'On with the show' button (no timer) | button | cut |
| Orbit Drop (final) -> results | renderPlinkoTally | waits for 'See your results' (no timer) | button | cut |
| Word Warp solved -> end | celebrateSolve | reveal + 1.5 s | - | cut |
| Word Warp missed -> end | missWarp | reveal + 1.5 s | - | cut |
| Guess round reveal (Infinity) | GUESS_REVEAL_HOLD_MS | 1.8 s | 1 s | cut |
| Commercial (off) | showCommercial | 3.0 s | 1.5 s | cut |
| Help peek (?) | helpBtn | max(2.5 s, explainer + 1 s) | tap | - |
