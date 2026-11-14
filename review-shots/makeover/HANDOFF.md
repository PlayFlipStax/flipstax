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
