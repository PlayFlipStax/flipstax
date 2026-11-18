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


---

# Polish pass (branch `polish`, from `main`): one studio for the whole show

Look only. Nothing pushed. Fast check on the tip: **commercial break: ok, 3 of 3 pass**. Looked at 390x844 and 360x640 in normal mode and at 390x844 in lite mode (`?lite=1`), no console errors. Stills (local only): `review-shots/polish/` - `compare-1` to `compare-6` are before / after sheets; `b-*` are the before shots, `after-*` and `lite-*` the final ones.

| Commit | What |
|---|---|
| `d025c54` | The drawn orbiting studio replaces the close and wide stage photos everywhere (opener from its first frame, Round 1, Grand Finale, outro card, menu, results backdrop). |
| `5354675` | Rounds 2-6 title cards and ROUND DONE: the girls, lifted off the old gold-stage pictures, stand in the studio. |
| `28376d0` | Mystery Game reveal: neon plate, indigo console, blast doors instead of gold frame and red curtain. |
| `a7265f5` | The ending: the goodbye video is replaced by the cast in the studio, blast doors closing under a neon FLIPSTAX sign. |
| `c24c2d8` | Game spotlight card: no UFO, no rays, no swinging beams - the dimmed studio, a ceiling rig, one still pool of light. |
| `989f360` | The moving cosmos in the window (stars, galaxy, planet; transform only). |
| `6c1bf7d` | The ringed planet is solid, ring behind the top half and in front of the bottom half. |

How it is built
- **The studio** is the block between `STUDIO:BEGIN` / `STUDIO:END` at the end of `lib/stage.css`, written by `python3 tools/build-studio-css.py` (edit the script, then run it). It restyles `#stage .stg-close` and `.stg-wide` to the same drawing, on a 390 x 844 plate that covers the screen. Back to front: sky (shot background), far stars (`.stg-plate::before`), galaxy (shot `::before`), near stars (`.stg-sweep`), planet (`.stg-glow`), the wall with a real window opening + neon + floor (`.stg-plate::after`), the neon sign (`.stg-sign`). The photos `data/stage/stage-close.webp` and `stage-wide.webp` are still downloaded by `lib/stage.js` (their `<img>` is hidden) - see "Left" below.
- **The opener's own furniture** (blast doors, ceiling beam, lights, hover pad) is still in `lib/intro.css`.
- **The cast** is `data/cast/studio/*.webp` (30-90 KB each), made by `tools/cutout.swift` on each old picture and then `tools/build-studio-cast.py <folder of the lifted PNGs>`. `ROUND_TITLE_CAST` in `flipstax.html` maps rounds 2-6 to them; the card class is `has-cast` (the old `has-art art-title` rules are now unused). CSS: the `POLISH PASS` blocks at the end of `lib/juice.css`.
- **JS touched (look only)**: `showActCard` (cast picture, the stage cue for every round), `showRewardBeat` (`ROUND_DONE_VIDEO = false`, the cast still, a stage cue), `showGameIntro` (a stage cue), `outroMount` / `startOutro` (`OUTRO_STUDIO = true`: the set is built once, a 10 s timer stands in for the video's `ended`).

What changed that is more than a backdrop - please confirm
- **ROUND DONE no longer plays `dance-girls.mp4`**: the three girls are a still, lifted from the video's poster frame. The video could not be re-dressed. Set `ROUND_DONE_VIDEO = true` and drop the `has-cast` class to bring it back.
- **The ending no longer plays `data/outro/outro.mp4`** (the cast waving, the blue curtain). Same 10 s, same skip, same results; the cast is a still with a slow bob and the doors close at 6.6 s. `OUTRO_STUDIO = false` brings the video back.
- The Reward beat is on the "do not touch" list, but ROUND DONE was asked for by name: only its backdrop and picture changed, the panel is as it was.

Left / not done
- **The share picture** still draws on `data/outro/poster.webp` (the old stage). Not a show beat; untouched.
- **The intro video** (`data/intro/mothership-intro.mp4`, `?intro=1` / `?intro=full`) is a rendered film; its behaviour is untouched and it was not looked at in this pass. If its last frame shows the old stage, the hand-over to the studio opener will show a change of set.
- **The commercial break** (`data/scenes/sponsor.webp`) and the blurred stage behind gameplay (`stage-dim.webp`) still use the old photos - game screens and the break were out of scope.
- `lib/stage.js` still loads `stage-close.webp` (156 KB) and `stage-wide.webp` (229 KB) although they are never shown now. Skipping those two loads would save memory, but `stage-on` waits on the close picture loading, so it needs a careful change and its own fast check.
- **Reduced motion** could not be switched on in the offscreen test browser: its rules sit beside the lite rules and were checked by reading, not by eye. Lite was checked by eye and by measuring (all four sky layers report no animation).
- Not checked: a real phone, tablets and wide screens (the plate crops like the old opener did), the opener after the intro video (`intro-curt`), browsers without `:has()` (the ending's backdrop and the reveal's cool sweep use it; without it the ending keeps a dark scrim over the studio).
- The fast check was run on the working tree, not on a frozen copy on its own port (that needs a copy outside this folder).
- The test stills and scripts are in `screenshots/qa/tools/` (`polish_shots.py`, `polish_sheet.py`, `polish_motion.py`, `polish_probe.py`, `cut/`), not in git.


---

# Solo pass (branch `polish`, Nov 16 2026): Flip alone, the saucer intro, the intro theme

Nothing pushed. Fast check on the tip: **commercial break: ok, 3 of 3 pass**. Looked at 390x844 and 360x640, lite (`?lite=1`) and simulated reduced motion; no console errors. Stills (local only): `review-shots/solo/` - `compare-1` to `compare-5` are the before / after sheets, `before-*` / `after-*` the single shots. Test scripts: `screenshots/qa/tools/solo_shots.py`, `solo_probe.py` (the intro's timeline), `solo_theme.py` (the theme's playback state), `solo_sheet.py`.

| Commit | What |
|---|---|
| `4c89e22` | The girls are out: round cards 2-6 show Flip on his pad (`ROUND_TITLE_POSE`: presenting, wave, think, cheer, shrug, presenting), ROUND DONE shows `data/host/cheer.webp`, the ending shows `data/host/wave.webp`, the pop-out presenter (`Cast.win`) is switched off, the old group picture is no longer loaded for the results. No files deleted. |
| `69052c2` | ROUND DONE party (`.rw-party` in `showRewardBeat`; CSS block `ROUND DONE PARTY` at the end of `lib/juice.css`): turning rays, two shockwave rings, falling confetti, Flip bouncing. |
| `515796e` | The saucer intro (`showColdOpen`, class `saucer`; CSS block `THE SAUCER INTRO` at the end of `lib/intro.css`). `lib/intro.js`: the first-visit welcome no longer plays the video - only `?intro=full` and the test host's Watch intro link do. |
| `4971975` | The intro theme (block `THE INTRO THEME` in `flipstax.html`, before the Infinity playlist): `playIntroTheme(ms)` / `endIntroTheme()` / `primeIntroTheme()`, track key `theme`. |

The intro's timeline (first visit, measured): doors 0 s, saucer in 0.15-1.05 s, beam 1.0 s, Flip down 1.1-2.2 s, pad lights 2.2 s, sign 2.3 s, greeting 2.4 s, saucer leaves 2.8 s, ends 5.9 s. Returning: about 3.1 s with the Welcome back line. The sign reads EPISODE N (small) over GALACTIC GAME NIGHT.

The theme: default Alien Disco Fever, from 154.26 s (0.3 s before the downbeat at 154.56 s). `?theme=N` (test hosts only): 1 Nebula Nights 80.30, 2 Cosmic Cruise 47.34, 3 Warp Speed Boogie 133.52, 4 Moonbase Groove 125.11, 5 Stardust Shuffle 126.47, 6 Saturn Strut 112.36, 7 Alien Disco Fever 154.56, 8 Meteor Mayhem 73.08 (the downbeat each snippet lands on, `INTRO_THEME_HITS`). To change the default, set `INTRO_THEME_DEFAULT` (0-based).

Not done / to check
- **Nobody has listened to the theme.** The offsets were picked by measuring loudness and onsets in the files, not by ear; the harness is silent. It was checked that the element seeks to the snippet, the gain ramps up in 0.3 s and down over the last 0.6 s, and the run's music takes over. Listen to all eight and move an offset if a snippet starts in an odd place.
- A real iPhone: the muted start inside the tap and the later unmute, and the fade (it needs the Web Audio route).
- A local server without range requests cannot seek into the mp3; the theme then stays silent rather than play the song's opening (1.5 s guard in `playIntroTheme`).
- After `?intro=full` the video still ends on the old stage (its last frame, `data/intro/poster.webp`) and hands over to the old door-slide opener, not the saucer.
- Still showing the old stage (no girls in any of them): the share picture (`data/outro/poster.webp`, the blue curtain), the commercial break (`data/scenes/sponsor.webp`), the blurred backdrop behind gameplay (`data/stage/stage-dim.webp`). None is a simple CSS swap; left alone.
- Unused now, files kept: `data/cast/studio/*`, `data/scenes/round/*`, `data/cast/purple-presenting.webp` (still listed in `data/cast/manifest.js`), `ROUND_TITLE_CAST`, the `has-cast` rules for the round cards.
- At 360x640 the greeting bubble covers Flip's legs in the intro (three lines of text); the host's size and place there were not changed.

## One Flip (Nov 16 2026, after the solo pass)

Flip is one size on every show beat: block `ONE FLIP` at the end of `lib/juice.css`. `--flip-h` = min(430 px, screen height - 320 px), so 430 px at 390x844 and 320 px at 360x640; the opener (`.co-stage-host` in the saucer intro), round cards 1-6 and the Grand Finale (`.fs-host`), ROUND DONE and the ending all use it, on a 240 px pad. Sizes only: no text, timing or skip change. The test menu gained Round 2 / 4 / 6 card entries. Fast check: commercial break ok, 3 of 3. Stills: `review-shots/solo/compare-6-one-flip-390.png`, `compare-7-one-flip-360.png`, `compare-8-one-flip-still.png`.
Known: at 360x640 the opener's bubble covers his legs (face clear); the antenna tips come close to the points badge; in the still intro the parked saucer sits right on his antennae; after `?intro=full` the old opener still places him at the video's size.

## Lite / reduced-motion ending (Nov 16 2026)

Measured (`screenshots/qa/tools/solo_settled.py`, cards held with `__previewHold`): Flip's box is identical in normal, lite and reduced motion on the opener, round cards 1-6, the Grand Finale card and ROUND DONE - 290 x 430 at 390x844, 216 x 320 at 360x640; no lite or reduced-motion rule changes his size or place. The one real difference was the ending: lite / reduced motion shut the doors from the first frame with Flip hidden. Now `startOutro` sets `.still` (not `.poster-on`) for the 1.5 s hold: Flip stands still on his pad in front of the open doors, then the results come in over the closed doors as before (`solo_ending.py` traces it). Fast test runs (`?debug=fast`) keep the old path. CSS reduced motion cannot be switched on in the test browser: only the script side is simulated, so ROUND DONE's still version in reduced motion is checked by reading the rules, and by eye in lite mode only.

## One render (Nov 16 2026)

Two sets of Flip pictures live in `data/host/`: the full-body set `flip2-idle / flip2-wave / flip2-mic / flip2-shrug` (what `lib/host.js` serves for every pose while `FLIP2` is true: cheer and discoPoint borrow the wave, think and blink the idle, presenting and laugh the mic, oops the shrug) and the older big-head sprites (`idle, wave, cheer, presenting, think, shrug, oops, laugh, blink, discoPoint .webp`). ROUND DONE and the ending had been pointed straight at the old `cheer.webp` / `wave.webp`; both now use `flip2-wave.webp`, so every show beat is the same render at the same size. There is no cheering picture in the full-body set - a new pose would have to be drawn. Stills: `review-shots/solo/compare-13-one-render-390.png`, `compare-14-one-render-360.png`.

## The deck in orbit (Nov 16 2026, the show stage)

Look only, one commit, nothing pushed. Rollback tag: `before-stage-life-20261116`. The stage the opener, round cards, ROUND DONE, the Grand Finale card, the ending, the Mystery Game reveal, the game spotlight card and the results backdrop stand in is no longer a violet wall with an arched window: the show stands on an open glass dance deck floating in space.

- **Back to front**: the sky (magenta / violet nebula ribbon with a dark dust lane, a teal cloud, a banded planet rising behind the deck on the left with a lit rim, a teal moon, a small gold ringed planet, near stars with glints), the drifting starfield, the turning galaxy (upper left), the gliding ringed planet (upper right), two searchlights from above that slowly open and close, the dance floor (perspective glass tiles with neon joints, a pink-white-teal light wave rolling under the glass, two sets of lit tiles - magenta / teal and violet / gold - taking turns in an 8-beat pattern), two pairs of neon ring pylons (the back pair smaller: depth) with their reflections in the floor, the deck's neon rim, a breathing neon glow on the pylons and the rim, the sign.
- **How it is built**: block `STAGE LIFE` at the end of `lib/stage.css`, written by `tools/build-stage-life.ps1` (PowerShell - this PC has no Python; edit the script, then `powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-stage-life.ps1`). It overrides the `STUDIO` block above it (still written by `tools/build-studio-css.py`, unchanged). `lib/stage.js` gains five empty elements per shot (`.stg-floor` with `.sf-wave`, `.sf-glass`, `.sf-sim.a`, `.sf-sim.b`, and `.stg-pulse`); nothing else in JS changed. `.stg-sweep` (was the near stars) is now the searchlights; `.stg-plate::after` (was the wall and window) is now the pylons, rim and haze.
- **Motion budget**: 8 moving layers on the shot on screen, 7 on ROUND DONE (its own rays; the searchlights rest). Transform and opacity only, no animated blur or shadow. Tiles change on a 0.6 s beat (each set at most one on/off cycle per 1.2 s). Measured with `document.getAnimations()`: the 8 names on the shot that is on; none in lite (`?lite=1`) or with reduced motion emulated in Chrome (`Emulation.setEmulatedMedia`, the real media query - not just the script side this time).
- **Fixed on the way**: the old STUDIO rules gave the planet and stars `animation: ... !important`, which outranked the base "shot off screen holds still" rule, so the hidden shot kept animating; a later rule now pauses every stage layer on a shot that is not on.
- **Still version** (lite / reduced motion): nothing moves; the floor shows both tile sets part-lit and the wave parked mid-floor, the glow at 80%.
- **Memory**: data-URI SVGs only (about 73 KB of CSS), no images or video. The two biggest moving layers are the starfield (2 x plate width, sky height) and the searchlights (plate width, 78% height); the glow layer covers only the pylon band.

Checked: opener (held at 5.2 s), Round 2 card, ROUND ONE DONE, the ending (4.5 s and the results at 13 s) at 390x844 and 360x640, the landing and the game spotlight card, lite and reduced motion; no console errors. Fast check on the working tree: **commercial break: ok** (a PowerShell / Chrome port of `tools/commercial-break-check.py`, same four modes) and **3 of 3 pass** (`tools/flow-episodes.ps1 -Normal 3 -Lite 0 -Other 0`). Stills (local only): `review-shots/stage-life/` - `compare-390x844.png`, `compare-360x640.png` (before / after per beat), `compare-still.png` (lite / reduced motion), `before-*` and `after-*` singles, `a1-*` to `a3-*` the revision passes.
Screenshots: the dev server `.devserver.ps1` answers one request at a time, so the shots and checks ran against a 12-thread copy of it (an HttpListener with a runspace pool, serving the same folder on 8834), several headless Chromes in parallel.

Not checked / left
- A real iPhone (frame rate with 8 layers, the 2x-wide starfield's memory).
- The opener's own blast doors park at the screen edges and hide the front pylons there - that is the intro's furniture, untouched.
- The Grand Finale card and the Mystery Game reveal were not shot (same stage, same rules).
- `tools/build-studio-css.py` would still rewrite only the STUDIO block; if it is run, run `build-stage-life.ps1` after it (the STAGE LIFE block is kept, but it is the one that wins).

## The girls and the cutscenes are back (Nov 17 2026)

Rollback tag before this pass: `before-girls-videos-20261117`. The owner decided to keep the alien girls and the CGI cutscenes; the solo-pass removals are undone and the polish work (stage, floor tiles, text-size fix, game changes) is kept. One commit per item; nothing pushed until the last step.

| Item | Commit | What |
|---|---|---|
| videos | `8cb3e89` | ffmpeg was available (WinGet). Compressed copies, 720x1280 H.264 main profile, fast-start (moov first), 24 fps, AAC 96k: `data/intro/intro-saucer.mp4` 2.7 MB, `data/wheel/dance-party-a.mp4` 3.4 MB, `data/outro/finale-b.mp4` 3.6 MB (each 10 s). `incoming-assets/new-videos` untouched; `dance-duo-a.mp4` not used. |
| 2 girls | `7a878a1` | Rounds 2-6 title cards: the three girls (`data/cast/studio`, lifted cutouts, the POLISH PASS layout) on the new deck again (`tArt` in `showActCard`). ROUND ONE DONE plays `dance-girls.mp4` full-card as in the A+ build (class `rw-vid`; lite and reduced motion stand the lifted girls on the pad as a still). The presenter pop-out (`Cast.win`) is back. Round 1 and the Grand Finale are Flip - they never had the girls in any version (checked against main and e30922a). The solo ROUND DONE party (rays, rings, confetti) is removed with the solo card. |
| 3 dance | `85c6b0a` | Wheel DANCE PARTY plays `dance-party-a.mp4` (one-line src change; wedge, label, +10, odds, fade, skip, 12 s net untouched). |
| 4 ending | `6942e5d` | `OUTRO_STUDIO = false`: the ending plays `finale-b.mp4` (muted, the run's music under it), then the results over its last frame; skip, watchdog and hand-off as before; lite / reduced motion / failure show `data/outro/finale-b-poster.webp` (its last frame) for 1.5 s. The last frame is dimmed to 66% once the results are up. The studio ending (cast on the pad, closing doors) stays in the code and CSS behind the flag. The share picture still draws from `data/outro/poster.webp`. |
| 1 intro | `8e9df20` | The show opens on `intro-saucer.mp4` (`showVideoOpen` in `flipstax.html`, CSS block THE VIDEO OPENER in `lib/intro.css`). First visit and `?intro=full`: the whole 10 s, freeze on the last frame (`data/intro/intro-saucer-last.webp` is laid over the video so the freeze is exact), the FlipStax lockup (`images/flipstax-lockup-800.webp`) slams in (scale 2.5 -> 1 with a settle), one light burst, a fan of rays, one shine sweep through a mask of the logo, the EPISODE tag, hold 1.5 s, then Flip's greeting bubble and Round 1: 16.4 s in all (measured through the real ENTER tap). Returning visit: video from 7.0 s (3 s), hold 0.8 s, the welcome-back line: about 7 s. Lite / reduced motion: no video is loaded - the still last frame, the logo and the line, no motion (5.3 s). Tap to skip works at any moment after SKIP_MIN_MS (checked at 7 s of a `?intro=full` run). The CSS saucer intro (Flip shrinking and growing) is switched off (`INTRO_VIDEO`), the old CGI `mothership-intro.mp4` plays only from the test host's Watch intro link; the landing now warms the cache with a fetch of the new video on a first visit. |
| fine-tune | `e69fe08` | `--flip-h` = min(430 px, screen height - 336 px): 430 on a tall phone, 304 at 360x640 (was 320) so his antennae clear the GRAND PRIZE pill. |

Checked (Chrome over CDP, headless; no Python on this PC): 390x844 and 360x640, normal and lite, for the intro, rounds 1-6, ROUND ONE DONE, the grand finale, the ending and the results; the Dance Party wedge; reduced motion only as far as the lite path (the same JS branch: the OS media query was emulated for the stage in the earlier pass, not for these cards). Every wheel wedge was spun from the TEST menu: JACKPOT +100, ORB +1 (both), GOOP -25 / -50, +25, LOSE A SPIN (and the wheel closes at DONE), DANCE PARTY (+10 and the new video plays 10 s, then back to the wheel), Mystery Game (Snap Sort opens, then the wheel returns), Riddle Round (the riddle opens, the wheel is hidden behind it): each landed, paid and handed off as before. Fast check on the final code (`e69fe08`): **commercial break: ok** (the CDP port of tools/commercial-break-check.py, all four modes) and **3 of 3 pass** (tools/flow-episodes.ps1 -Normal 3 -Lite 0 -Other 0: 173, 176 and 178 s, each with the new opener and the ending video). The lite episodes were not run (as in the earlier passes).
Tools used (kept out of git, in the session scratchpad): `shoot2.ps1` (parallel stills per beat, size, lite), `wheel.ps1` (spins every wedge), `introflow.ps1` (real ENTER flow: first / returning / `?intro=full`, skip), `cbcheck.ps1` (the commercial-break check ported to CDP), a 12-thread copy of the dev server (the repo's `.devserver.ps1` answers one request at a time). Stills (local only): `review-shots/girls-videos/` - `compare-390x844-a/b.png`, `compare-360x640-a/b.png` (before / after of the opener, rounds 1-6, ROUND DONE, finale, ending, results), `compare-dance.png`, `sheet-afterlite-*.png`, `sheet-after-*.png`; singles `before-*`, `after-*`, `afterlite-*`, `i1/i2-*` (the opener).

Known / bigger
- **Flip's size across the opener and the cards.** The opener video's Flip is about 66% of the screen height (390x844: 560 px), the code-drawn Flip on Round 1 and the Finale is 51% (430 px). The cards cannot hold a bigger one without his head meeting the sign and the pill, or the feet meeting the bubble. A bigger fix would be a re-framed (zoomed-out) intro render, or a taller Flip render on the cards with a lower sign. Not done.
- **The video soundtracks are not used.** The intro video is muted so it does not clash with the intro theme (set `INTRO_VIDEO_SOUND = true` to hear its own track when sound is on - then also skip `playIntroTheme`); the ending video is muted as before; the dance video follows the sound switch as the old one did. Nobody has listened to the theme over the longer intro (it still starts 0.3 s before the downbeat at the start of the video, plays for the whole 16 s and fades out over 0.6 s).
- ROUND ONE DONE in normal mode shows the dance video's own gold stage, not the new deck (a video cannot be re-dressed); only the bottom strip of the card shows the stage.
- At 360x640 the test harness's TEST button covers the end of the greeting bubble and the round line (test mode only).
- A real iPhone has not been tried: inline autoplay of the three videos, memory with a 2.7-3.6 MB video plus the stage's 8 moving layers, and the theme's muted start inside the tap.

---

# Fix pass (branch polish, rollback tag `before-fixes-20261117`)

One commit per item, in this order (see `git log`): 1 the ending, 2 Watch intro, 3 ROUND DONE / round cards on the new deck, 4 one Flip on the opener, 5 the break dance, 6 cache headers.

1. **Ending.** The results ending (`startOutro`) was already finale-b. The old dance people saw was a separate hard-coded video that plays first when the Word Warp is SOLVED: `WW_FINALE_SRC` = `media/ww-finale-540.mp4` (old stage, 7 s). It now plays `data/outro/finale-b.mp4` (10 s; timers 7 -> 10 s; sound at the effects volume; skip, WARPED IT! card, watchdog and disco fallback kept). `WW_FINALE_PLAYED` makes the results come in over its last frame (poster) instead of replaying it. Unsolved: finale-b plays at the results as before. The Orbit Drop jackpot dance (`OD_DANCE_SRC`) also pointed at an old-stage video; it now plays `data/wheel/dance-party-a.mp4`.
2. **Watch intro.** Both buttons call `Intro.run(null,{force:true})`; the force branch still played `mothership-intro.mp4`. `lib/intro.js` now hands over to `window.__watchIntro` (flipstax.html), which runs `showVideoOpen` (intro-saucer + logo card + greeting) over the screen, lifted by `:root.watching-intro` (lib/intro.css), then restores the menu music. `?intro=full` through the real ENTER tap already reached the new opener (first and returning visit).
3. **ROUND DONE and the title cards.** ROUND DONE no longer plays `dance-girls.mp4` (old gold stage). The card is `cast2`: new deck, Flip in his fixed box with his pad, two dancers in fixed slots. Round cards 2-6 use the same slots (`ROUND_TITLE_SLOTS`; round 1 and the finale are Flip alone). CSS: lib/juice.css "FIX PASS" blocks (`.cast-slot`: 66% of Flip's height, feet on his line, inner edge 20% of his width from the centre, in front of the pad, a small hop; still in lite / reduced motion). On a short phone the ROUND DONE panel is compacted so the title clears the pad.
4. **One Flip.** Card Flip box is `[50,218,290,430]` at 390x844 and `[78,186,205,304]` at 360x640 on rounds 1-6, ROUND DONE and the finale card, normal and lite (measured). The opener video's Flip (69% of the height) is scaled about his feet by `--ci-s` (`.ci-fit`, lib/intro.css) so he overlays the Round 1 Flip.
5. **Break dance.** `showBreakDance` runs before `showSponsor` (data/break/dance-duo-a.mp4, 2 MB, 720x1280, no audio; poster webp). Lite / reduced motion: the poster for 2 s. `?debug=fast` skips it so the break's own check is unchanged.
6. **Cache.** No service worker anywhere. `vercel.json` now says `Cache-Control: public, max-age=0, must-revalidate` for the page, lib, data, media, images, audio.

Checked: every beat at 390x844 and 360x640, normal and lite (`review-shots/fixes/_ba-*.png`, before/after sheets; `after.log` has the Flip boxes); each beat played from the TEST menu ends and moves on; `tools/commercial-break-check.py` prints `commercial break: ok`; `flow-episodes.py normal=1 lite=1 other=1 parallel=1` prints `3 of 3 pass`.

Old-stage places still in the normal show: the Cosmo Burger / Fizz Nova ad card (its own orange look, not the stage), the share picture (data/outro/poster.webp is its source), `stage-dim.webp` (the blurred gameplay backdrop, an old photo under the deck's CSS life; nothing gold shows), and the CSS-hidden old files (`dance-girls.mp4`, `ww-finale-540.mp4`, `od-dance-540.mp4`, `mothership-intro.mp4`, all still on disk; the last is still the code path in lib/intro.js if `__watchIntro` were missing).
Not done / not checked: a real iPhone; true prefers-reduced-motion (only the JS side was simulated); the finale-b and dance videos keep their own framing (Flip dances at a different size inside a cutscene); the live site's headers (nothing was pushed).

## Fix pass 2 (short phone screens) - rollback tag `before-short-screens-20261117`

1. `67901ff` Short screens: Flip's box is now worked out from the room there is (`--app-h` = 100dvh, `--flip-b`, `--flip-t` in `lib/juice.css`), not from fixed 336 / 196 numbers with a 660 px breakpoint. One box feeds the card Flip, the dancer slots, the goodbye card and the opener video scale. Antennae stay under the banner and points pill at 390x664, 390x700, 390x844, 360x640 and 375x560.
2. `ccdde9b` ROUND ONE DONE: the compact panel (24 px headline, tighter frame and chips) now applies at 700 px high and under (was 660), so the headline clears Flip's pad with the stats tiles showing.
3. `7a9a999` Break dance: the gold beam was the board's glow sweep (`FX.glowSweep`, drawn on `#showFx`, above every card). `:root.bd-up #showFx{visibility:hidden}` while the dance is up.
4. `a1d1088` Round 3 (and every card): Flip was on stage from the first frame but faded in from opacity 0 together with the sign and bubble (scene fade `sceneIn`, 600 ms, plus `hostStillIn` from 0). `sceneIn` now skips `.fs-host`, `hostStillIn` starts at 0.75, lite / reduced motion show him at full strength at once.
5. 360x640 check: opener video plays to 10 s then holds on the logo; the break dance (`break/dance-duo-a.mp4`) plays then the sponsor card; the ending video (`outro/finale-b.mp4`) plays, then the goodbye card, then results. Stills in `review-shots/fixes2/` (`p5-*`, `_p5-*`, `before-*` / `after-*`, `_before-after-*`).

Not checked: a real iPhone (dvh and Safari's bars are assumed from the 664 px figure); true prefers-reduced-motion (only the CSS rule is in place).

## Fix pass 3 (old art and videos sweep) - rollback tag `before-old-sweep-20261117`

### 1. Every video the game can play (the only ones named in the HTML, JS, CSS and data files; no .webm anywhere)

| File | Plays when | Where in the code |
|---|---|---|
| `data/intro/intro-saucer.mp4` | The show's opener: first visit and `?replay=1` / `?intro=full` / the test host's "Watch intro" play all 10 s (the saucer's beam drops Flip onto the pad); a returning player gets only its last 3 s (from 7.0 s). Lite and reduced motion: no video, a still of its last frame. | `showVideoOpen` (flipstax.html), preloaded by `lib/intro.js` |
| `data/wheel/dance-party-a.mp4` | (a) Mystery Wheel, DANCE PARTY wedge. (b) Orbit Drop jackpot (the middle slot), once per episode. Lite / reduced motion: frame at 3 s as a still for 2.5 s on the jackpot. | wheel dance (flipstax.html ~11941); `jackpotDance` / `OD_DANCE_SRC` |
| `data/break/dance-duo-a.mp4` | The short dance before the commercial break (10 s, tap to skip). Lite: its poster 2 s. Skipped in `?debug=fast`. | `showBreakDance` / `BREAK_DANCE_SRC` |
| `data/outro/finale-b.mp4` | The ending. After a Word Warp WIN it plays once, right after the black hole and big bang (`WW_FINALE_SRC`, `wwFinaleWin`); then "See you tomorrow"; then the score card comes in over its last-frame still. If the Word Warp is NOT won: "See you tomorrow", then it plays once behind the score card as before (`startOutro`, `#outroVideo`). Lite / reduced motion: its still only. | `wwFinaleWin`, `startOutro`, `preloadOutro` |

Files still on disk that NOTHING plays any more (kept, not deleted): `data/outro/outro.mp4` (comment only), `data/wheel/dance-party.mp4`, `data/scenes/round/dance-girls.mp4` (only behind `ROUND_DONE_VIDEO = false`), `media/od-dance-540.mp4`, `media/ww-finale-540.mp4`, `data/intro/mothership-intro.mp4` (only in `lib/intro.js` if `window.__watchIntro` were missing, which it never is).
The one old-looking dance that can still appear is the hand-drawn disco scene (`discoCelebrate`) - only as the fall-back when `finale-b.mp4` or `dance-party-a.mp4` errors or freezes.

### 2 and 3. Orbit Drop jackpot and the ending - checked, nothing left to change
Both were fixed in the first fix pass: the Word Warp win's dance is `a3dd0ef` (`WW_FINALE_SRC` = finale-b.mp4); the jackpot dance moved to `dance-party-a.mp4` in `642178b` (`OD_DANCE_SRC`). Re-checked this pass at 390x664, 390x844 and 360x640, normal and lite: the Word Warp win plays exactly one video (`finale-b.mp4`), then the goodbye, then the score card over a still; tap on the dance goes straight to the goodbye; tap on the goodbye goes straight to the score card; lite shows WARPED IT! 2 s, the goodbye, the score card, no video. The jackpot plays `dance-party-a.mp4` (lite: its frame at 3 s). Kept as is: when the Word Warp is NOT won, the dance plays behind the score card AFTER "See you tomorrow" (one dance, new).

### 4. Smaller / older Flips
Every Flip in the normal show is the full-body `flip2-*.webp` at the one box size, except the results screen's Flip line, which was a 46 px round head crop - now the full-body Flip (54 px wide) - commit `28f6960`. Left alone: the corner host `#showAlien` (a head rig that has zero size, never visible), the neo-games `.nx-host` and Fact or Fib `.ff-host` (hidden in every game), the old big-head files `data/host/wave.webp`, `cheer.webp` etc. (not used; `lib/juice.css:4272` and the share picture use `flip2-wave`), and `images/kofi-logo.webp`, a 40 px round brand badge of Flip's face on the Buy Flip a coffee button (a picture, not a Flip rig; making it full-body would need new art).

### 5. Old backdrops
Changed (commit `54c9b38`): the blurred old arch photo `data/stage/stage-dim.webp` painted behind every game screen and the stage's dim shot; it is now `data/stage/stage-dim-deck.webp`, a render of the new deck, blurred. Left (listed): the Cosmo Burger / Fizz Nova ad cards (own look, allowed); the SHARE picture the player posts (`data/outro/poster.webp` curtain poster and `data/stage/stage-close.webp` are drawn into it - it is a generated image, not a screen, and re-composing it needs a layout pass); the old `stage-close.webp` / `stage-wide.webp` are still fetched but hidden by CSS (never visible); `data/wheel/stage.webp` is the Mystery Wheel's own dark pedestal art (hidden behind the deck in the beats checked); Orbit Drop keeps its own galaxy background (`data/orbit/bg.webp`, not an old stage).

### 6. When does the UFO drop Flip off?
Two saved flags decide, both in the browser's localStorage: `flipstax_intro_seen_v1` (lib/intro.js, set when the landing intro has played or been skipped) and `flipstax_coldopen_seen_v2` (set once the show's opener has finished). `showColdOpen` plays the full opener (`first`) when the cold-open flag is missing, or when lib/intro.js says this is a first visit (`__introSaucer`), or on `?intro=full`; otherwise it is a returning visit: only the video's last 3 s, so Flip is already standing there. The test modes (`?replay=1`, `?debug=fast`) skip lib/intro.js's hand-over, so on a computer that had seen the show `?replay=1` used to give the short version - that is what you saw. Commit `1213a8b`: `?replay=1` now always plays the whole opener. Returning players (plain URL, flags set) still get the short one. Lite / reduced motion never play the video (a still: Flip on the pad). Checked: fresh visit starts the video at 0 s, returning visit at 7 s, `?replay=1` on a returning computer at 0 s.

## Fix pass 4 (round done cards, ending, Flip size, opener) - rollback tag `before-round-done-fix-20261118` (local only)

Items 1, 2 and 3 were reported from a deployed preview; they do NOT reproduce in the code on `polish` (367bd45). The live preview (flipstax-git-polish-flip-stax.vercel.app, read on Nov 18 2026) was still serving a flipstax.html with `ROUND_DONE_VIDEO = !isLite() && ...` (the old dance-girls video on the gold arch) and `WW_FINALE_SRC = 'media/ww-finale-540.mp4'` (the old win dance), Last-Modified Nov 18 01:27 GMT - before the fix-pass commits (a3dd0ef, 67901ff..367bd45). So the root cause is a stale deployment, not code. Redeploy / hard-refresh the preview.

Checked in REAL play-throughs (real ENTER tap, whole show played by tools/touch-episode-probe.js at real speed, `?debug=fast&replay=1&realtime=1`, a Word Warp win through the game's own `winWarp`), at 390x664, 390x700, 390x844 and 360x640, a screenshot of every beat (review-shots/round-done-fix/real-*):
- ROUND ONE..SIX DONE all draw through `showRewardBeat` (one code path) on the new deck: `ROUND_DONE_VIDEO = false`, Flip + two girl slots, no video.
- Win ending: WARPED IT! over finale-b.mp4 (new deck, once) -> SEE YOU TOMORROW card -> score card over the still. The old arch dance is not in the path (only `discoCelebrate`, a fall-back if finale-b.mp4 errors).
- Flip's box is identical on every card at each size (opener card, rounds 1-6, ROUND n DONE, grand finale, see you tomorrow). Measured [left, top, right, bottom]: 390x664 85,188,305,514 (banner 78..144); 390x700 73,188,317,550 (banner 78..144); 390x844 50,218,340,648 (banner 86..170); 360x640 78,188,282,490 (banner 78..144). Antennae sit 44-48 px under the banner and 11 px under the points pill everywhere.

Changed: item 4 only (`e5592ad`) - `TITLE_EXTRA_MS = 2000` in `showVideoOpen`: logo + EPISODE line hold 3.5 s on a first visit (opener 18.2 s, was 16.4), 2.8 s for a returning player (10 s, was about 7), lite mode 2 s later too. Skip, mute, theme length and the first / returning rule unchanged.

Fast check: commercial break ok; 3 of 3 pass (Chrome-over-CDP port and tools/flow-episodes.ps1, no Python on this PC).
Not checked: a real iPhone.
