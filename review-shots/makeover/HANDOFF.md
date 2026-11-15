# Makeover handoff (branch `makeover`, rollback tag `before-makeover`)

Look-only pass on four games. **None of it has been through the fast check, and there are no lite or reduced-motion screenshots.** Each game was opened once from the TEST menu at 390x844 (normal mode) with no console errors. Nothing was pushed (this shell has no GitHub login). `data/schedule.js`, scoring, rules and timing are untouched.

Commits: Twin Flip `cbd879a` + `e0ebb19`, Fact or Fib `e4e1160`, Price Probe `d88f928`, Emoji Decode `ef68a6b`.

Screenshots (gitignored, local only): `review-shots/makeover/` - `tf-normal-result-390.png`, `faces-sheet.png`, `ff-normal-result-390.png`, `pp-normal-result-390.png`, `ed-normal-play-390.png`, `select-390.png`, plus `*-before-*` shots.

## First thing to run

1. The fast check on the tip of `makeover` ("commercial break: ok", "3 of 3 pass"). The old script was lost; a rebuilt one is described in the session (frozen copy on its own port, `tools/commercial-break-check.py`, then `tools/flow-episodes.py normal=3 lite=0 other=0`).
2. Play / result screenshots in normal, lite (`?lite=1`) and reduced motion for all four games.
3. 360x640 for all four (only 390x844 was looked at).

The browser harness and the local test server do not run inside the Claude Code sandbox (WebKit helpers and port binding are blocked).

## 1. Twin Flip

Done
- 40 space faces in `lib/twin-flip-faces.js` (aliens, UFOs, planets, rockets, moons, comets, stars; inline SVG, one dark outline, told apart by shape). Contact sheet: `faces-sheet.png` (page: `faces.html`).
- Card backs: grey alien face on a navy / teal / rose nebula. Galaxy behind the board. Face-up cards are pale star-chart cards. Title marks are stars and a moon. Marquee and stage floor kept. CSS is the "MAKEOVER job 1" block at the end of `lib/juice.css`, scoped to `.tf-stage.tf-space`.

Wiring - please check, this was done before the "look only" change of plan
- The pool IS already wired in `lib/mini-games.js` (twinFlip `run`): it uses `window.FLIPSTAX_TF_FACES` under its own schedule name `'twin-flip-space'`, 8 a day, falling back to the old 72-face pool only if the new file failed to load. `flipstax.html` loads `lib/twin-flip-faces.js` before `lib/mini-games.js`.
- Route: a new pool, not a redraw of the 72 keys. `'twin-flip-space'` has no entry in `data/schedule.js`, so the scheduler walks the pool in the file's own order. The file is 5 days of 8, each day laid out by hand so no two faces look alike. New faces must only be added at the end, 8 at a time.
- If you want it frozen like the other pools, add a `'twin-flip-space'` list to `data/schedule.js` - that needs the owner's say-so, as that file is off limits.

Check
- That a day really gets 8 different faces (day index from the show, not the TEST menu, which draws at random and can pair any two of the 40).
- The match glow, spark ring and bolt still read on the new cards; the TOTAL RECALL win.
- `alien-square` reads a little like a robot; `ufo-flat` was redrawn once to stop it looking like the ringed planet.
- The galaxy is mostly hidden by the cards; it shows in the gaps only.

Risks
- The two backgrounds are inline SVG data URIs; the galaxy one uses an SVG blur filter (drawn once, static). Check it paints on iPhone Safari.

## 2. Fact or Fib

Done
- Class `ff-warm` added in `run` (on top of `ff-show ff-lie`): crimson curtain, amber spotlight, wooden floor; brass-and-cream dial; statement on a cream cue card in the body font; explanation on a gold strip; Flip shown beside the dial; lamps and labels in gold. CSS: "MAKEOVER job 2" block in `lib/juice.css`.
- Neon sign: `NeonLogo` entry `factOrFib` (new `gauge` icon) is appended into `.mg-sign` (class `ff-neon`); the plate's own bulbs and title stay in the DOM, hidden, because `ringBulbs` holds on to them.
- Explanation size: `fitAll` now starts the explanation at the statement's size (`fit(fact, base)`, was `min(base * 0.8, 22)`).
- Select tile logo: the dial (via `NeonLogo.icon`).

Not wired / not finished
- Flip is a still wave pose placed beside the dial (`.ff-host` forced visible and static). He does not react or "work" the detector. The old pop-up animation is switched off for this look.
- The FACT / FIB buttons are unchanged (already large round buttons).

Check
- **Longest statements at 360x640** (`tools/fact-or-fib-check.py`, `window.__ffShow`). The sign is taller than the old plate and the explanation is bigger, so the card has less room. At 390x844 the fit loop shrank both lines to about 16 px on a short statement - the starting sizes or the dial height may need tuning so the text is not smaller than before.
- The harness hides Flip unless `QA_HOST=1` is set.
- The stamp (FACT! / FIB!) position on the cue card; the wrong-answer static flicker over the cream dial.

Risks
- Heavy use of `:has()` and stacked `:root` selectors with `!important` to beat the older terminal rules. If something looks half teal on a phone, it is a specificity miss.

## 3. Price Probe

Done
- Class `pr-show` added in `run`: orange and gold sunburst, hot-pink side curtains, gold floor; gold-rimmed tags; price plates in deep pink and gold; meter and lamps recoloured. CSS: "MAKEOVER job 3" block.
- Neon sign: `NeonLogo` entry `priceProbe` (new `tag` icon, swings) appended into `.mg-sign` (class `pp-neon`), same pattern as Fact or Fib.
- MOST / LEAST: 1.5x lettering, white ring, glow. MOST is gold on hot pink; LEAST is white on electric blue (the one cool colour on screen, on purpose).
- Unpicked tags after the reveal: full-strength cream under a light brown shade (`.pr-card.dim` no longer goes to 45% opacity).
- Select tile logo: the price tag.

Check
- A LEAST round (only MOST was seen). The win effect (`pr-winfx`, coins) reads the sign's rectangle - check it still lands right with the new sign.
- The rule line overlaps the pink curtains slightly at 390 px; 360x640 not looked at.
- The lit (correct) tag stays green.

Risks
- The sunburst is a `repeating-conic-gradient` on the overlay - static, but check paint cost on an older iPhone.

## 4. Emoji Decode

Done
- Neon sign on the title plate: `setQuizPlate` now maps `'EMOJI DECODE'` (and `'PRICE PROBE'`) to their `NeonLogo` entries; new `tv` icon (eyes blink). Kept compact (66% wide) so the four answers keep their room.
- Set: teal and navy space in place of the purple wash, galaxy dimmed, a lit stage floor, three more planets (ringed gold, moon, green) and three saucers that drift slowly. Added to `#edSpace` in `flipstax.html`; CSS: "MAKEOVER job 4" block.
- Select tile logo: the TV.

Check
- The fourth answer's bottom edge is at 762 px of 844 (was about 751): still clear of Flip's bubble at 390x844, but re-check 360x640 and a five-emoji row / long answer (`window.__edFit`).
- The PERFECT DECODE win and the big X still read over the new background.
- The stage floor uses a 3D `rotateX` transform (static).

Risks
- Three more animated layers (transform only, 9-14 s). Stopped in lite, reduced motion, paused and hidden-tab states by CSS; confirm.

## Shared

- `lib/neon-logos.js`: three new icons (`gauge`, `tag`, `tv`) and three new signs. `lib/neon-logos.css`: their motion (transform only).
- `NeonLogo.has('priceProbe')` and `has('emojiDecode')` are now true. Nothing else keys off those two names, but grep `NeonLogo.has` if a sign appears somewhere unexpected.
- Not done: the old QA scripts in `screenshots/qa/tools/` that call removed hooks (see the earlier door / portal job).


---

# Addendum: the full redesign pass (after the note above)

Five more look-only commits on `makeover`, on top of everything above. Same status: **no fast check, no lite / reduced-motion / 360x640 shots**; each screen opened once at 390x844 from the TEST menu with no console errors. All of it is CSS appended at the end of `lib/juice.css` in blocks headed `REDESIGN 1` to `REDESIGN 5` (no JS or data changes in this pass).

| Screen | Commit | Idea |
|---|---|---|
| VS cards | `675ba9f` | A chrome mothership in the gap, the gold VS as its hub, a beam over both cards; a ringed planet / cratered moon in the card corners; the drifting pattern is planets, saucers, rockets and stars. Card colours untouched. |
| Twin Flip | `4468a83` | The mothership's card table: hull across the top with the title as its neon sign, a tractor beam over a glass table with a teal rim, a planet horizon below. |
| Fact or Fib | `519ef6c` | The TRUTH-O-TRON: one turquoise-and-chrome machine holds the dial, the statement ticket and the buttons; antennae with glowing bulbs. Flip is hidden on this screen. |
| Price Probe | `8bdc706` | The tags hang from an orange-and-gold saucer over an alien sunset, with a round gold display stage. |
| Emoji Decode | see `git log` (the commit after `8bdc706`) | Alien TV live from orbit: a big ringed planet behind the TV, a gold-lit moon horizon, signal rings from the antennae. The stage floor and the gold planet from the earlier pass are hidden. |

Check, per screen
- **VS cards**: the mothership is drawn on `.divider::before/::after` (the divider's own background is now transparent). Check the deal-in animation, the result state (crowd board over it), Infinity mode (rules are scoped to `.mode-daily`), and that the beam (a see-through white fan over both cards, opacity pulse 2.4 s) does not hurt the title plates' readability. `.gloss::before/::after` carry the planet and the moon.
- **Twin Flip**: the hull's lower edge sits behind the title; check 360x640 and tablets, where the hull is capped at 680 px wide. The old floor-spotlight elements in `.mg-bg` are hidden while `.tf-space` is on.
- **Fact or Fib**: the cabinet's frame takes about 50 px, so the dial is 13.5svh tall and the buttons about 110 px across at 390x844 (were about 140). Still large, but confirm the tap targets and **the longest statements at 360x640**. The antennae sit above the cabinet in the gap under the ROUND pill.
- **Price Probe**: the saucer is `.pr-body::before` (behind the tags), the beam `.pr-body::after`. The question line has `z-index:2` so it stays above them. Check a LEAST round and the win effect.
- **Emoji Decode**: the signal rings are `.ed-ant::before/::after` (scale + opacity, 2.6 s).

Self-critique: VS, Twin Flip and Fact or Fib are clear steps up. Price Probe is better but the least resolved - the planet behind the sign reads as a pale blob and the saucer is thin. Emoji Decode gained depth, not a new composition.


---

# Addendum 2: the six-screen design pass (latest; supersedes the notes above where they differ)

Design only. **No fast check, no lite / reduced-motion screenshots.** Each screen was opened from the TEST menu at 390x844 with no console errors; Fact or Fib was also measured at 360x640. Everything is CSS appended at the end of `lib/juice.css` (no JS, no data, `data/schedule.js` untouched). Later blocks override earlier ones for the same screen, so the earlier "REDESIGN" blocks for Price Probe and Emoji Decode are now mostly dead CSS - safe to prune once the look is approved.

| # | Screen | Commit | Idea |
|---|---|---|---|
| 1 | Price Probe | `2643307` | THE COSMIC BAZAAR. New layout: three wide stacked hover-trays (item in a round porthole, name + detail, big price plate). Behind: a striped synth sun setting behind an alien bazaar skyline, a neon grid floor. |
| 2 | Emoji Decode | `b6a9b26` | THE DECODER DECK. New layout: emoji on a big cyan hologram projected from a starship console; the four answers are a 2x2 block of chunky console keys with letter caps. |
| 3 | Snap Sort | `12d0459` | ALIEN RADAR. A chrome-bezel radar scope with green rings and a turning sweep; amber timer lamps on the bezel; a saucer at the centre; words are phosphor-green blips; gold-green lock on a right tap, red on a wrong one; the category on an amber mission plate. Built on the existing Snap Sort screen (it runs; TEST menu "Snap Sort: easy"). |
| 4 | VS cards | `f78e1e2` | Full-colour cartoon stickers on every card (ringed planet + saucer on top; peeking green alien + rocket on the bottom) and a bigger mothership in the gap. |
| 5 | Twin Flip | `1b3beae` | The top is the mothership itself: chrome hull, teal dome, three windows with grey aliens watching, gold lights, a beam emitter; the title is its neon sign; matched pairs glow gold and teal. |
| 6 | Fact or Fib | see `git log` (the commit after `1b3beae`) | Layout fix: buttons wholly inside the cabinet on an inset deck, clear of the timer bar and score chip (measured at 390x844 and 360x640). |

## What Opus needs to finish, per screen

**Price Probe**
- Check 360x640: three trays must fit `.pr-body` (rows are `flex:1`, min 84 px, max 128 px).
- A LEAST round, the reveal (lit tag green, unpicked tags under a light shade), and the win effect (`pr-winfx` reads the sign's rectangle).
- Long item names: the name wraps in the middle column; check the longest names and details do not push the price plate off.
- The meter is still a vertical tube on the right.

**Emoji Decode**
- **Answer text**: the keys force `white-space:normal` and a fixed size with `!important`, overriding the inline sizes `edFit` sets. Check the longest answers wrap to at most 3 lines in a key at 360 px wide; if not, teach `edFit` about the 2x2 layout instead of the CSS override.
- The flip-in covers (`.ed-cover`), the green tick / red X marks (now on the key's top-right corner), PERFECT DECODE and the big X.
- The emoji row still uses `edFit` to fit the hologram.
- 360x640 has its own block (`max-height:700px`): hologram 118 px, keys 74 px. Not looked at.

**Snap Sort**
- It is on hold in the show; nothing was re-enabled. The wheel's mystery wedge still plays Saucer Shuffle / ZiG Zap - wiring Snap Sort in is yours.
- The items are still WORDS spiralling into the centre (the existing mechanic). The brief's "things fly by" with pictures (dolphin, shark) needs item art or emoji in the data and probably a new flight path - a mechanics decision, not done.
- **Win and loss moments were not designed** beyond the tap feedback: the round ends through the shared result card. Suggested: on a good round the sweep speeds up and the scope floods gold-green with "ALL CLEAR"; on a poor one the scope goes to red static with "SIGNAL LOST".
- The scope is sized `min(90vw, 39svh)`; check 360x640 (the rule line is hidden under 700 px tall).
- Nothing in the styling tells a right word from a wrong one before the tap (`.fits` has the same rim) - keep it that way.
- The old vortex photo (`data/scenes/snap-sort-vortex.webp`) is no longer shown; the file is untouched.

**VS cards**
- The stickers sit on `.gloss::before/::after` inside each card, under the content. Check they never sit behind important text: the alien is bottom-right of the bottom card and is overlapped by long title plates (plate on top); the help button is bottom-left.
- The drifting pattern draws over the stickers faintly. If that bothers, raise the stickers above `.dd` (z-index) - not done.
- Result state, deal-in, Infinity mode (rules are `.mode-daily` only), twist cards with cream text panels.

**Twin Flip**
- The board is a little smaller to make room for the ship (`100dvh - 292px`); check tap targets at 360x640 (`100dvh - 262px` there).
- The TOTAL RECALL win still uses the shared big-win celebration; a ship-themed win (the aliens cheer, the beam pulses) is not built.
- The pool wiring from the first pass still stands (see section 1 above).

**Fact or Fib**
- Longest statements at 360x640: the ticket window is now flexible (min 78 px) and the text shrinks to fit it.
- Buttons are 110 px at 390x844 and 86 px at 360x640.

## iPhone risks of the new looks
- **Inline SVG backgrounds** (Price Probe's scene, Twin Flip's mothership, the VS stickers): static, small, but each is decoded as a bitmap at the element's size. The Price Probe one covers the whole screen.
- **`conic-gradient`** for the radar sweep (rotated by transform, 4 s) and `repeating-radial-gradient` for the rings: check smoothness on an older iPhone; the sweep layer has `will-change:transform`.
- **Heavy `:has()`, stacked `:root` selectors and `!important`** to beat older rules. A half-old look on a phone means a specificity miss.
- **Big glows** (`box-shadow` blur on the scope, the hologram, the trays) are static, never animated.
- New motion added in this pass: the radar sweep (transform), the blip dots (opacity). Everything else is still.


---

# Addendum 3: the whole-game look pass (latest)

Aesthetics only, all CSS appended at the end of `lib/juice.css`. **No fast check, no lite / reduced-motion, 390x844 only** (one screenshot per screen from the TEST menu, no console errors).

| Screen | Commit | Idea | Opus: check |
|---|---|---|---|
| Fact or Fib | `3ac17eb` | The TRUTH-O-TRON on a moon: navy space, a huge warm ringed planet, atomic starbursts, a cratered moon surface. Red curtain gone. | One full-screen inline SVG background. 360x640. |
| Snap Sort | `f5be041` | Cosmic Radar: category plate directly under ROUND, combo under it, scope `min(94vw, 50svh)`; navy deck with nebula glows; blue scope, cyan rings, pink sweep; candy-coloured blips. | **The rule box is hidden on this screen** (`.mg-snapSort .mg-rule{display:none}`) - confirm the explainer card still explains the game. Blip colour is by `nth-child` only (not right / wrong) - keep. The stage has `margin-top:-12px`. 360x640. Still on hold in the show. |
| Game title card | `0019812` | Live from orbit: a mothership the beams come from, the icon on a halo, a neon sign in the game's colour over a fan of rays, a planet horizon in the game's colour. | Uses `color-mix()` (Safari 16.2+) - on older iOS the tints fall back to nothing; add plain fallbacks if old phones matter. Check every game's card (colours come from `--gi-a` / `--gi-b`), the Select Game card (`.gi-portal`), long names at 360 px (sign is `clamp(40px, 12.4vw, 76px)`). The ray fan is a static masked conic gradient. |
| Zap Words | `9946441` | Storm planet: dusk sky, a huge sun, mesas, lightning down the sides; the grid on a dark power board with a yellow rim. | **Tile size and spacing were not changed** (cell 68 px, pitch 74 px at 390 wide) - the board is `.zw-grid::before` at `inset:-7px`, and the grid got `position:relative; isolation:isolate`. Confirm swiping still works and the board does not cover the HINT button (`.zw-foot` raised to `z-index:2`). |
| Saucer Shuffle | see `git log` (after `9946441`) | The landing pad: cobalt sky, coral ringed planet, concentric neon rings under the saucers, a glow on each saucer. | The photo wall, curtains, wall / floor blaze layers and the `su-panels` lights are hidden with `display:none` - check the shuffle, the reveal and the PERFECT SHUFFLE win still read without them. The saucer glow is a static `drop-shadow` on an image that moves by transform: watch frame rate on an older iPhone; drop the filter if it stutters. |

Not started: Alien Blast (already one of the strongest; left alone), Word Warp (looked at; holds up - any new layer there must be added to the memory clean-up from `8a9a942`), Results, Game Select, Orbit Drop, ZiG Zap, Price Probe's light touch.


---

# Addendum 4: VS cards, "The Orbit Stage" (latest VS pass)

CSS only, the last block in `lib/juice.css`. One 390x844 play shot and one after-vote shot, no console errors. No 360x640, lite or reduced-motion check.

What changed: show lighting on each card (`.gloss::before`: a pool of light toward the ship, darker far corners); the picture on a hover-pad (`.scene::after`, unrevealed cards only); the name on a neon marquee plate (`.half:not(.revealed) .content`); the mothership redrawn with the gold coin inside the drawing (`.divider::before`) and a blinking layer of rim lights (`.divider::after`, opacity only, `steps(1)` 1 s = one change every 0.5 s); the hint is a gold pill; the background behind the cards is navy with stars.

Opus should check
- **Long names at 360x640** on the marquee plate (it has a 3 px border and a glow; the text size is unchanged).
- The hover-pad under very wide or very tall pictures and under avatar cards; it is hidden once a card is revealed.
- The mothership is `min(310px, 80vw)` wide and 118 px tall, centred on the gap: confirm it never covers a category chip or a name on short screens, and how it looks in the deal-in animation and under the crowd board.
- The hint pill: both texts ("Tap the one you prefer", "Tap who wins") and the after-vote text fit on one line at 360 px; it is `width:max-content`.
- Infinity mode is untouched (all rules are `.mode-daily`).
- The blinking stops in lite and reduced motion (rule included, not verified).
- The purple spotlight background still shows in the thin margins (the `.show-bg.w-vs` override only dims its children) - finish or drop.

---

# Addendum 5: the frame alternative (`?frame=new`)

- What it is: "the neon orbit" - a 3 px neon tube 5 px in from the edge in the screen's own `--bulb` colour, a fine white inner line, and the old bulbs shrunk to 7 px white running lights riding on it (same four fading groups). Default (no parameter) is unchanged; the switch is one line after `buildMarquee()` and the CSS is the `:root.frame-new` block at the end of `lib/juice.css`.
- Opus should check: screens whose `--bulb` is white or pale (Twin Flip) read as a white tube - give those games a stronger frame colour if wanted; the Mystery Wheel's per-bulb colour rules and the `.blink / .unison / .miss / .strobe / .disco` marquee states with the small dots; that nothing near the edge is covered at 360x640 (Zap Words, Saucer Shuffle, the ? button).
- Also check: lite and reduced motion (the existing still rules apply to the dots; not verified), and that `.show-frame`'s gold line being hidden in this mode does not remove anything else it was used for.

## Addendum 6 - whole-game polish, batch 1 (frame, opener, Results, Mystery Wheel)

Look only. Nothing pushed. Fresh 390x844 stills of every screen are in this folder as `p0-*.png` (before) and `p1-*.png` / `f2-*.png` (after).

1. **The frame** (`e820ed6`): the neon tube is now the default (class `frame-new` on the root unless `?frame=bulbs`). The tube colour is `--tube` on `#showMarquee`, set by `syncTube()` in `flipstax.html` (a MutationObserver on the frame's style): a game's neon-sign border colour (`NeonLogo.defs`, now exposed), else `TUBE_GAMES`, else the game's first colour made vivid, else `TUBE_COLORS` for the world. White-hot core line, more static glow, 6 px white sparks. The VS cards' edge bulbs (`.mq-ring`) are hidden in this mode and each card has a white neon tube edge.
2. **The opener** (`db6afe4`): landing pitch is two lines (`.il-tagline b` / `span`), the button says PLAY with an arrow and is wider, a stage-floor glow fills the dark bottom third. The intro video's skip button shows after 0.12 s (was 1 s). In the cold open the stage sign shows one line (EPISODE N) because the valance covered the top line.
3. **Results** (`b11194f`): `#outroStats` is one dark-glass scorecard (header GALACTIC GAME NIGHT - EPISODE #N, hero score, six stat tiles). The small score pill is hidden in the end state. Halo, sheen and two twinkling stars run on after the confetti. The coffee button is a dark glass button.
4. **Mystery Wheel** (this commit): labels are upright (`.mw-up` groups, turned by `mwUpright()` when the wheel lands, called from `markWin`).

**For Opus to check:** 360x640 on all four (landing pitch width, the scorecard's height and whether SHARE stays on screen, wheel labels at a small wheel); lite and reduced motion (scorecard animations are switched off there, the wheel labels cut to upright; the frame sparks use the old rules); the frame's `miss / strobe / unison / disco` states with the 6 px sparks; the tube colour on every game and in Infinity; the Results layouts other than `.outro.blue` (the scorecard rules apply to all, only blue was looked at); a results card with fewer stats (the grid is three columns); the old-browser fallback for `:has()` on the cold-open sign and the wheel's tube colour; `outline` with rounded corners on the scorecard needs Safari 16.4+ (older shows a square hairline - remove the outline if that matters).

**Not done yet (batch 2, item 5):** the game screens one by one.

## Addendum 7 - whole-game polish, batch 2 (the game screens)

Look only. Nothing pushed. Every game and event screen was shot fresh at 390x844 and judged side by side (`p0-sheet0..3.jpg`, `q0-sheet.jpg` in this folder). Only the screens weaker than their neighbours were changed, one commit each:

- **Mystery Wheel start** (`1993b43`): the starting state sets every label upright explicitly (`setUp(rot)` when the wheel is built). It measured upright already; this makes it certain.
- **Explainer card** (`ce59502`): starfield in the game's colours, dark-glass card with the neon tube (`--gi-a`), glowing title, larger white rule. Uses `color-mix()`.
- **Peak or Plunge** (`dee91a7`): new dusk-planet background drawn in `.mg-bg` (forced visible - the old art file `--game-bg` is covered, not removed), neon title sign, both cards dark glass with neon tubes.
- **Riddle Round** (this commit): deep-space green backdrop on `#eventOverlay.quiz-riddle`, `.show-bg.w-riddle`, `#evBg.w-riddle` and Infinity's `.bg.w-riddle`; old rays and marks dimmed.

**Judged good enough and left alone:** VS cards, Brain Beam, Select Game, Price Probe, Emoji Decode, Time Warp, Snap Sort, Zap Words, Twin Flip, Fact or Fib, Saucer Shuffle, ZiG Zap, Alien Blast, Galactic Chomper, Star Sequence, Space Launch, Word Warp, Orbit Drop, the round cards.

**Seen but not done (weaker, lower priority):** the Infinity-mode riddle card (orange paper style) and the Vault / Infinity results card (orange rays, bevelled buttons) still use the old look; Snap Sort's title is a plain neon box with no icon sign; Oddball Alert, Crowd Scan, Cosmic Surprise and Reward beat were not captured (the TEST-menu shots moved on to the next screen before the still), so they were not judged.

**For Opus to check:** Peak or Plunge right / wrong card states and 360x640 fit (cards are flex, untouched in size); Riddle Round in Infinity and on the wheel (same rules apply, not looked at); the explainer card with a long rule and with TAP TO SKIP instead of GOT IT; `color-mix()` and rounded `outline` fallbacks on old Safari; lite and reduced motion (all three screens are still, nothing new animates).

## Addendum 8 - sci-fi pass on three screens (Brain Beam, Riddle Round, Mystery Wheel)

Look only. Nothing pushed. Before / after stills at 390x844: `r0-brain-beam.png` / `r1-brain-beam.png`, `q1-riddle.png` / `r1-riddle.png`, `p1-wheel-rest.png` / `r1-wheel.png`, `r1-wheel-land.png`. No other screen was touched or shot.

- **Brain Beam, "the signal"** (`47dc861`): all rules are under `.event-overlay.stack.quiz-beam` at the end of `lib/juice.css`. Deep-blue space and a beam cone painted on the overlay itself (`.ov-tint` cleared), the title plate as a saucer console (`.qz-plate::before/::after` are a saucer and signal arcs), the question on a holo-screen (`.event-prompt::before` is the INCOMING SIGNAL tag, `::after` the corner brackets - the old bulb rings are gone here), answers as neon pods (`--pod` per tile). Tiles with `.is-right` / `.is-wrong` are left on their old solid styling on purpose.
- **Riddle Round, "the intercept"** (`129e689`): rules under `.event-overlay.stack.quiz-riddle`. Radar rings in `.ov-tint`, the riddle on a terminal (`::before` is the TRANSMISSION INTERCEPTED tag, `::after` a signal trace), answers as squared signal keys in lime, mint, yellow and aqua. The deep-space backdrop from Addendum 7 (also used by Infinity and the wheel's riddle) is unchanged.
- **Mystery Wheel, "the orbital dial"** (this commit): the stage photo `data/wheel/stage.webp` is replaced by one inline SVG drawing on `.mw-bg` with the same proportions (the JS that places the wheel on the ring is untouched, so the wheel sits where it did). `.mw-rot::before` is an indigo ring covering the painted gold rim (labels are `z-index:2` above it), `.mw-wheel::before` is a saucer on a 26 s rotate loop, hub / pointer / lights / spins plate / result card / sign border recoloured, the Spotlights call in `flipstax.html` now uses cyan and pink. One spin from the TEST menu landed and paid (+10, then -50 on a second run), labels upright after landing.

**For Opus to check:** right and wrong answer states on both quiz screens next to the new dark pods (solid old style - confirm they read well); long questions and long answers at 360x640 (the pods are fully rounded, so check text does not touch the curved ends; the plate's subtitle with the side icons); Brain Beam and Riddle Round reached from other places (second-chance question, the wheel's riddle wedge - same classes, not looked at); the wheel in the wide layout (`.mw-wide`) and at 360x640; the wheel's goop, dance-party and mystery-game hand-offs (Snap Sort / Saucer Shuffle / Riddle wedges were not spun to); lite and reduced motion (the saucer loop has its off rules; nothing else new moves); `color-mix()`, `conic-gradient` and rounded `outline` on old Safari; the wheel's painted wedge colours are still the original art (only the rim is covered).

## Addendum 9 - Brain Beam and Riddle Round redone (they replace the Addendum 8 versions of these two)

Look only. Nothing pushed. The Addendum 8 blocks for these two screens were removed from `lib/juice.css` and replaced (the Mystery Wheel block is untouched). Stills: `s0-brain-beam.png` (before) / `s1-brain-beam.png`, `s1-brain-beam-360.png` (360x640 with long test answers typed in); `r1-riddle.png` (before) / `s1-riddle.png`, `s1-riddle-360.png`.

- **Brain Beam, "the abduction beam"** (`d8f1d64`), block `BRAIN BEAM, "THE ABDUCTION BEAM"`:
  - **Layout changed:** the four answers are now a 2 x 2 grid (`.event-grid` is `display:grid`, tiles have a `min-height` clamp and wrap long text; the number badge sits on each key's outer top corner; the right-answer tick sits on the key's bottom edge). The question (`.event-prompt`) takes the spare height (`flex:1`).
  - The title plate is one SVG saucer (`.qz-plate` background, `container-type:inline-size`; the title and the full subtitle are placed over it in `cqw`). `.qz-plate::after` is the rim lights. The beam is `#eventOverlay::before`, the sliding bands `.ov-tint::before`, the radar scope `.event-grid::before/::after`, the planet and the little alien are background images on the overlay (bottom padding 104 px).
  - Four loops, transform / opacity only: saucer bob 3.4 s, rim lights 2 s steps, bands 1.6 s, radar sweep 3 s. Off rules for lite and reduced motion are at the end of the block.
  - `.is-wrong` and the gold right state keep their own backgrounds; a right answer keeps its key colour with the existing green ring and tick.
- **Riddle Round, "the decoder"** (this commit), block `RIDDLE ROUND, "THE DECODER"`: the NeonLogo sign inside `.qz-plate` is restyled only here (bulbs, ghosts and the "?" discs hidden; `.nl-icon` shows an eye and blinks; `.nl-panel::after` is the glyph ticker). `#eventOverlay::before/::after` are the two glyph streams. Keys keep the stacked layout. A `max-height:700px` rule makes the sign smaller, hides the SOLVE THE RIDDLE line and the trace, and tightens the terminal so the keys stay about 54 px tall at 360x640.

**For Opus to check:** right / wrong / gold states on both (not looked at); Brain Beam with very long questions at 360x640 (the prompt is flexible, the pad is fixed height - check nothing is pushed off the bottom) and on wide screens (>= 600 px, where older rules size the plate); the second-chance question and any other screen that reuses `quiz-beam` / `quiz-riddle`; keyboard 1-4 hints still make sense with the 2 x 2 order (1 2 / 3 4); the riddle's ridge drawing in `.ov-tint` does not show (covered or clipped - harmless, remove or fix); glyph streams extend 110 px below the overlay by design; lite and reduced motion; `cqw`, `color-mix()`, `conic-gradient` on old Safari.

## Addendum 10 - Brain Beam and Riddle Round, third pass (replaces the Addendum 9 versions)

Look only. Nothing pushed. Stills at 390x844: Brain Beam before `s1-brain-beam.png`, after `t1-brain-beam.png`, the tap beam `t1-brain-beam-tap.png`, 360x640 with long test answers `t1-brain-beam-360.png`; Riddle Round before `s1-riddle.png`, after `t1-riddle.png`, 360x640 `t1-riddle-360.png`.

- **Brain Beam** (`6c7e284`):
  - Answers are four stacked full-width bars again (`.event-grid` is a flex column; bars have a `min-height` clamp and grow for two-line answers; the question takes the spare height). The 2 x 2 pad and the radar scope are removed.
  - New colours: violet-black space with a magenta nebula, electric yellow `#ffe83a` as the one accent. The saucer is wider (`--sw` on the overlay sets its width; the beam's top is computed from it).
  - The rays (`#eventOverlay::before`) and the particles (`.ov-tint::before/::after`) are drawn ABOVE the question and bars at low alpha (`z-index:4`, `pointer-events:none`) so the beam is seen across the whole screen.
  - **One small script, look only:** `bbShot()` in `flipstax.html` (just above "The marquee frame"), called from a capture-phase click listener on `#eventGrid .event-tile`. It adds two elements (`.bb-shot`, `.bb-hit`) to the overlay for 0.45 s and removes them. It runs only on a tap, once per question (skipped if a verdict class is already on a tile or within 1.5 s of the last shot), and is off in lite mode and reduced motion. It reads nothing about the right answer.
- **Riddle Round** (this commit): the decoder block now paints its own violet / indigo / teal backdrop on the Daily overlay and on `.mode-daily .show-bg.w-riddle`; the shared green rule from Addendum 7 is still there and still serves Infinity. `TUBE_COLORS.riddle` is now teal. New: `.qz-plate::before/::after` are the radio-wave rings; `.event-prompt::after` is the oscilloscope strip. The fixes from Addendum 9 (ticker tile size, id selectors for `.ov-tint` / `.rd-sky`) are kept.

**For Opus to check:** the tap beam on a real phone (keyboard answers do not fire it unless they call `click()`); right / wrong / gold bar states on Brain Beam with the rays drawn over them, and `.picked-wait`; the rays' contrast over the question on a dim screen (lower the alphas in `#eventOverlay.quiz-beam::before` if needed); a four-line question at 360x640 on both screens; the riddle on the wheel (Daily rules apply there) and in Infinity (unchanged green); lite and reduced motion; `repeating-conic-gradient`, `cqw`, `color-mix()` on old Safari.

## Finishing pass (Opus, Nov 15 2026) - mechanics, correctness, safety

Rollback tag before this pass: `before-finishing-20261115`. Nothing pushed. Hashes below are from `git log` (some tables above are out of date - trust `git log`).
Test scripts: `screenshots/qa/tools/finishing/` (wheel.py, snapsort.py, twinflip.py, zapwords.py, layout.py, frames.py, quiz.py, play.py, wordwarp.py, still.py, title.py). Shots: `review-shots/makeover/finishing/`.

| Item | Commit | What |
|---|---|---|
| 1 Snap Sort / wheel | `c9d6b4c` | The wheel's MYSTERY GAME wedge plays Snap Sort (Saucer Shuffle only if Snap Sort's data is missing). Snap Sort win / loss / wrong taps / close checked; wheel hand-off and return checked. Saucer Shuffle still on Game Select. |
| 2 Twin Flip | `d0bc7c0` | Win flourish (fast flip wave + saucer beam, 1.3 s; still gold glow in lite / reduced motion). 40 space faces, 8 a day, 5-day lap confirmed; data/schedule.js unchanged against main. |
| 3 Zap Words | - | Tile size and spacing identical to before the makeover (measured both versions at 390 and 360); swipe and HINT work. |
| 4 Mystery Wheel | - | All 10 wedges spun: each lands, pays as before, labels upright at rest and after landing; Snap Sort and Riddle Round hand off and return. |
| 5 Layouts | `585d94e` | 360x640 fixes: Price Probe card text, long VS names under the saucer, landing PLAY over the pitch, cold-open EPISODE sign under the valance. |
| 6 Frame | - | Neon tube on all 20 active screens, each its own colour; `?frame=bulbs` still gives the gold bulbs. |
| 7 Brain Beam / Riddle | `d7c6168` | Question panel above the rays; rays fainter over the bars. Long text OK at both sizes; tap beam is gone in 0.75 s and the verdict comes at the same time as on Riddle Round (no beam). |
| 8 Saucer Shuffle, Alien Blast, Word Warp | - | All play to a result and close. Word Warp's win: clean-up runs (stage hidden, sky removed) during the video, then Results. The makeover added no new Word Warp layers. |
| 9 Older Safari | `89b38e4`, `411bf9a` | color-mix fallbacks (@supports not); Twin Flip title icon is now the alien face. |
| 10 Still versions | `2f9adad` | Snap Sort swirl + word blips (lite and reduced motion), VS spotlights and landing doodles (reduced motion). |
| 11 Memory | `1eb416b` | Brain Beam: one moving layer instead of three. |
| 12 Fast check | - | 3 of 3 pass; commercial break: ok. |

**Not checked here (needs a real phone or another browser):** an actual iPhone (memory, frame rate, touch feel); Safari older than 16.2 (the fallbacks are written but not seen); sound; reduced motion is simulated (the real OS setting was not used).
**Known, left as is:** in lite mode a few small loops from before the makeover keep moving (falling confetti specks, the round timer's shimmer, the landing texture, the Results bulbs). Snap Sort's tier on the wheel follows the act like everywhere else (medium in late rounds until SNAP_SORT_REVIEWED is true).

## The show opener redesigned: "the orbiting studio" (Nov 15 2026)

Look only, one commit, nothing pushed. Block `THE SHOW OPENER, "THE ORBITING STUDIO"` at the end of `lib/intro.css`; every rule is scoped with `:root:has(#showCard.curtain:not(.hidden))`, so only the opener card changes (a browser without `:has()` keeps the old theatre whole). The stage photo is hidden while the card is up (`.stg-img` display none - the file is still used by other screens) and one inline SVG on `#stage .stg-close` draws the studio. `.co-drape` are the blast doors (same opening animation), `.co-valance` the ceiling beam, `.stg-sign` the neon EPISODE plate (now both lines, below the beam), `.co-stage-host::before/::after` Flip's hover pad. No new animation. The earlier fixes that hid the sign's top line under the valance were removed (not needed now). Stills: `u0-opener-390.png` / `u1-opener-390.png`, `u0-opener-360.png` / `u1-opener-360.png`. Fast check: 3 of 3, commercial break ok.
Not looked at: the doors fully closed before they open, the short variant after the intro video (`intro-curt`), lite / reduced motion (nothing new moves), a real phone.
