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
