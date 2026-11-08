# FlipStax design system

The look in one line: **a bright, cheeky 70s/80s TV game show** - bulb-marquee gold, hot pink, electric
blue and cream on a night stage. The tokens and components live in `lib/design.css` (loaded before
`lib/show.css`; show.css's older names such as `--gold-2`, `--pink`, `--f-display` stay as aliases).
DIRECTION.md says *what* the show is; this file says *how it looks*. If a screen needs something that
isn't here, add a token or a component here first.

## Tokens

### Colour - core palette

| Token | Value | Use it for |
|---|---|---|
| `--c-gold`, `-hi`, `-lo`, `-edge` | #ffd23f, #fff4b8, #f5a300, #7a3d00 | Bulbs, the primary button, the score chip, wins. Gold means "good / go / prize". |
| `--c-pink`, `-hi`, `-lo` | #ff3c9d, #ff9ad1, #c2187a | VS cards, accents, the second voice next to gold. |
| `--c-blue`, `-hi`, `-lo`, `--c-cyan` | #2f7bff, #8fd0ff, #1d3fb8, #7df9ff | Brain Beam, UFOs, cool highlights. Cyan is the "space" glow. |
| `--c-cream`, `-lo` | #fff6d8, #f1e3bd | Cards and plates you read from (question cards, cue cards). |
| `--c-ink`, `-soft` | #2a1300, #5a3a20 | Text on cream or gold. Never pure black. |
| `--c-night`, `-lo`, `--c-stage` | #1c0b3d, #0d0420, #2a0b4e | The dark stage behind everything. |
| `--c-text`, `--c-text-soft` | #fff, #e9dcff | Text on the stage; soft for secondary lines. |
| `--c-ok`, `-hi`, `-lo` | #22c56b, #5ee08a, #148a3c | Right answer, BANK, HIGHER, TRUE. |
| `--c-bad`, `-hi`, `-lo` | #ff3b3b, #ff6a7d, #c0263f | Wrong answer, STOP, LOWER, FIB, a miss. Never on a VS minority pick. |
| `--c-goop` | #6fe63c | Only the GOOP. |

### Colour - game worlds

Every game owns one world: `--world-<game>-a` (light), `-b` (mid), `-c` (deep), `-bulb` (its bulb
colour). Use the three stops for its background gradient and `-bulb` for its marquee and plate edge.
Worlds: `vs`, `beam`, `riddle`, `portal`, `emoji`, `time`, `warp`, `orbit`, `peak`, `snap`, `zap`,
`twin`, `fact`, `saucer`. One world per screen; never mix two.

### Type

| Token | Value | Rule |
|---|---|---|
| `--f-display` | Big Shoulders Display | Titles, numbers, buttons. Always uppercase or a single word/number. |
| `--f-body` | Inter | Sentences. |
| `--fs-display` | clamp(40px, 12vw, 58px) | One hero word or number per screen (the result, the score). |
| `--fs-title` | clamp(26px, 8vw, 34px) | Plates, game names, big buttons. |
| `--fs-body` | 17px | Every sentence. **Body text is never below 16px.** |
| `--fs-small` | 14px | Labels and tags only (uppercase, tracked with `--ls-label`). Never for a sentence. |
| `--lh-tight`, `--lh-body` | 1, 1.35 | Display type tight, sentences open. |

### Spacing, radii, shadows

- Spacing: `--sp-1` .. `--sp-10` in 4px steps (4, 8, 12, 16, 20, 24, 32, 40). `--gutter` (16px) is the
  screen's side padding; `--safe-top` / `--safe-bottom` include the phone's safe areas.
- Radii: `--r-sm` 8, `--r-md` 14, `--r-lg` 20, `--r-xl` 28, `--r-pill` 999. Buttons and cards use `--r-lg`,
  tags and chips `--r-pill`.
- Shadows: `--sh-card` (raised panel), `--sh-press` / `--sh-press-down` (a button's lip, up and pressed),
  `--sh-soft` (floating). Glows: `--glow-gold`, `--glow-pink`, `--glow-blue`, `--glow-ok`, `--glow-bad` -
  one glow per element. `--text-on-busy` for any text over rays or art.

### Motion

- Easing: `--ease-pop` (things that land: plates, results, stamps), `--ease-out` (arrive), `--ease-in`
  (leave), `--ease-io` (sway, bob).
- Durations: `--d-tap` 120ms (press feedback), `--d-fast` 160ms, `--d-mid` 320ms (most entrances),
  `--d-slow` 700ms (big reveals). `--stagger` 80ms between siblings.
- `--tap-min` 44px: the smallest tap target anywhere.

## Components

| Class | What it is | Rule |
|---|---|---|
| `.ds-plate` (`.cream`) | Title banner, a bulb-lit sign | One per screen, at the top. Put `.sign-bulbs` inside for bulbs; `--plate-edge` sets its colour. |
| `.ds-pill` (`.gold`, `.pink`) | A short tag: act, category, status | 1-3 words, uppercase, `--fs-small`. Never a sentence. |
| `.ds-btn` (primary), `.secondary`, `.go`, `.stop` | Buttons | At most one primary per screen; 44px minimum; press moves 3px down with the shorter lip. |
| `.ds-card` (`.dark`) | A raised panel for content | Cream for things you read; `.dark` on the stage. `--card-edge` sets the dark border. |
| `.ds-timer` / `.ds-ring` | Time left: a bar (`<i>` fill) or a ring (`--p` 0-1) | The fill scales with `transform`, never `width`. The last 3 seconds tick. |
| `.ds-score` | The running score | Top right of the play area, display type. |
| `.ds-result` (`.win`, `.miss`) | The big outcome | Lands with `--ease-pop`; on screen at least 1.5s (CINEMATIC_MIN). |
| `.ds-enter` + `--i` | Staggered entrance | Give siblings `--i: 0, 1, 2...`; each starts `--stagger` later. |

## Motion standards

- **Animate only `transform` and `opacity`.** Never `width`, `height`, `top`, `left`, `margin`, `box-shadow`,
  `filter` or `background` in an animation or a transition that runs during play.
- **Entrances are staggered 60-120ms** (`--stagger`, 80ms by default), each `--d-mid` with `--ease-out`.
- **No layout thrashing:** never read layout (`getBoundingClientRect`, `offsetWidth`) inside an animation
  frame loop after writing styles; measure once, then animate.
- **`will-change` sparingly:** only on elements that move continuously (falling chips, drifting words,
  the rays), never as a blanket rule.
- **Lite mode** (`:root.lite`, `?lite=1` or automatic below 40fps) stops decorative loops (rays, bulb
  chases, sways) and heavy filters; it **never** changes timing or content. Reduced motion shows still end
  states.
- Every cinematic moment is at least 1.5s on screen and can be skipped only after 1s (data/rundown.js).

## The mini-game template

All six newer games (Peak or Plunge, Snap Sort, Zap Words, Twin Flip, Fact or Fib, Saucer Shuffle) share one
layout (`.mg-*` in flipstax.html, the games' own parts in `lib/mini-games.css`): **header plate** (game name +
act pill) -> **host zone** (rule line, or the game's own stage host) -> **play area** -> **footer** (timer bar +
score chip), inside the safe areas. The background is `--game-bg`: `style-board/assets/bg-<game>.png` when that
file exists, otherwise a gradient in the game's world plus a pattern, so no screen is ever empty.

## The stage

The show happens on one photo set - `data/stage/` (built by `tools/build-art.py` from the big renders, which stay
out of git) - shown by `lib/stage.js` / `lib/stage.css` in three camera shots:

| Shot | Picture | Motion | For |
|---|---|---|---|
| `close` | `stage-close.webp`, 3:4 portrait crop on the arch, 1080 px | a slow push-in 1.00 -> 1.06 over the scene | reveals |
| `wide` | `stage-wide.webp`, the whole set, 1600 px | a slow pan from one end of the stage to the other | establishing shots, the end |
| `dim` | `stage-dim.webp`, the close shot pre-blurred (about 6 CSS px), 540 px | none | every gameplay screen |

A camera cut is a 600 ms crossfade. Only transform and opacity move; a slow light sweep and a glow pulse give the
close and wide shots some life. Lite mode and reduced motion: still pictures (cuts still crossfade). The close shot is
preloaded, the dim one loads at once, the wide one lazily from the cold open. If the pictures cannot load, nothing
changes: `:root.stage-on` is only set once they have.

### Scene -> shot

| Scene | Shot | Marquee text |
|---|---|---|
| Landing | close | TONIGHT'S SHOW / EPISODE n (mostly behind the logo sign) |
| Menu | close | none (the menu says the episode itself) |
| Cold open | wide while the curtain opens, then a push in on close as the host walks out | WELCOME TO / FLIPSTAX, then FLIPSTAX |
| Act cards (and the grand finale card) | close, pushing in | the act: ACT 1 / THE OPENER, ACT 3 · POINTS ×3 / LIGHTNING ROUND ... |
| Mystery Game door reveal | close, pushing in | the act |
| Results (Daily), the Infinity run-complete screen (the outro) | wide | THAT'S OUR SHOW / SEE YOU TOMORROW (or FINAL SCORE) |
| VS cards, Brain Beam, the riddle, Portal Pick, Cosmic Surprise, Crowd Scan, Lucky Lights, Word Warp, the older Mystery Games and the six new mini-games | dim | - |
| Orbit Drop, the Vault, the commercial, the round bumpers, the disco | their own looks (no stage) | - |

The game cues only the cinematics (`Stage.cue('close', { over, cls, push, ms, sign })`); everything else the stage
works out from the screen on top. Behind a full-screen overlay the stage takes that overlay's z-index and paints just
under it (the overlay gets `.stage-backed`, which clears its own backdrop); behind gameplay it sits at z -3 under the
show's world layer, which goes clear. The full-screen game overlays paint the same dim picture as their own backdrop
(same crop, so nothing jumps).

### The marquee

The blank sign above the arch is found in each picture (`tools/build-art.py`; `Stage.SIGN`, in percent of the
picture) and the live text sits on it at any crop (`tools/stage-sign-check.py`). The close shot's cream panel is
darkened to match the wide shot's dark sign. Text: Big Shoulders 900, uppercase; the main line white with a pink neon
glow, an optional gold sub line above it. One or two short lines - the act, the episode, a sign-off - never a sentence.

### Scrim rules (legibility first)

- **dim**: a scrim of at least 45% (it is 55%) plus a vignette over the blurred picture; the sign is darkened in the
  picture too. Worst case, the brightest spot of the dim shot gives white text 7.7:1 (5.9:1 at the 45% floor) - never
  below 4.5:1.
- Landing and menu: a soft scrim at the top and the bottom where the text and buttons sit, the middle clear for the set.
- Results and outro: a 30-60% scrim over the wide shot; the score panel itself is unchanged.
- The stage never sits in front of anything: buttons, cards, timers and text keep their own panels and colours,
  and no game screen's layout moves for it.

## The cast

`lib/cast.js` / `lib/cast.css`, pictures in `data/cast/<name>-<pose>.webp` listed in `data/cast/manifest.js`
(trimmed, 900 px tall, feet on the bottom edge - one shared baseline).

- Members (Run 4A): `purple` = **Cleo Cosmic**, the presenter (`purple-presenting`, cut out of its studio backdrop on
  Oct 22); `kandi` = **Kandi Cosmos**, who sits out until a `kandi-*` picture is listed; `flip` = the host himself
  (`HOST_NAME` in data/game-names.js), his pictures taken from data/host. Barnaby (the orange sidekick) and the old
  pink presenter are out of the show; their files stay in data/cast, unlisted.
- `Cast.show(name, pose, side, { hold, while, say, peek })`, `Cast.hide()`. Entrance: a slide in from the side with
  a pop; idle bob; exit: a slide back out. Transform and opacity only; lite mode and reduced motion: a plain fade.
  Cleo's picture points to its left, so it is mirrored on the left side - her open hand always points in.
- **Milestone reactions only**, each about one time in three (`Cast.REACTION_CHANCE`), never taking a tap
  (pointer-events: none) and never holding up the next screen:
  - `Cast.win()` - a round-end game won: the presenter (Cleo, or Kandi on alternate wins once she has a picture)
    pops out from the left, small (`peek`), pointing toward the score.
  - `Cast.oops()` - a failure (a wrong Brain Beam or riddle pick, a lost round-end game): the host laughs or winces
    (laugh / oops poses) at the right with a short line.
- Gated with the host: the cast shows only in HOST_IMAGE_MODE (lib/host.js); on localhost `?castpreview=1` lets the
  cast on for checking the art.

## The show flow (Run 4A)

The episode: cold open -> six rounds -> the Word Warp finale -> the outro -> results (data/rundown.js). A round:
title card -> zoom in -> VS block -> Brain Beam -> game intro -> explainer -> round-end game -> reward beat -> (zoom out
into the next round's title card).

| Piece | What it is | Rules |
|---|---|---|
| Cue line (`.fs-line`) | The host's line as a cream caption plate at the foot of the stage, with his voice blips | Up for 1 s + 0.25 s a word, never under 2 s (`CUE_LINE_MIN`). Body type, never under 16 px. |
| Cold open | ENTER -> the curtains part -> the host's four intro lines (data/game-names.js `intro.first`) | About 20 s the first time, one 3 s line for a returning player; a tap skips (after `SKIP_AFTER`). |
| Round title card (`.flipstage`) | The host on the stage, one announcement line; the marquee shows ROUND N / OF 6, a POINTS xN pill | `ACT_CARD_HOLD` or as long as the line needs. The first time, the host's VS explanation follows as a second line (a tap skips it). |
| Zoom through the marquee | The stage and the host push toward the marquee, a gold-white bloom swells to one peak, the play is swapped in under it, the bloom fades | `ZOOM_MS` (0.9 s), one pulse, transform/opacity only, no live blur; reversed (zoom out) at the next round. Lite / reduced motion: a 0.3 s dark crossfade. |
| Game intro (`.gintro`) | A spotlight sweeps once, the game's title slams onto a bulb-lit plate in its colours, the bulbs chase | `GAME_INTRO_MS` (2 s). Before every round-end game and the Word Warp. Lite / reduced motion: the title fades in. |
| Explainer card (`.explainer`) | The game's rule: full the first time a player meets it, one line after (data/game-names.js `explainers`) | 1 s + 0.25 s a word; over 15 words it waits for GOT IT. A tap skips. Seen keys in localStorage `flipstax_explainers_v1`. |
| ? button (`.help-btn`) | Bottom left, in the lane the corner host used to keep: replays the full explainer as a small card | Shown on a VS card, a round-end game and the Word Warp; never pauses play; a tap closes the card. |
| Reward beat (`.reward`) | ROUND N DONE!: the round's points, its letter (? or X), its gold keys, the running totals | `REWARD_HOLD` (2.2 s); a tap skips after `SKIP_AFTER`. |
| Round tracker (`.sp-rounds`) | Six segments along the bottom of the HUD pill: done (gold), now (pink, a slow glow), to come | The pill's label reads R3 x2 (the round and its multiplier). |

**Light and motion safety:** no element flashes more than 3 times a second (every steps(1) blink is at least 0.36 s a
cycle), no large saturated red flash (a wrong answer is a thin red edge and a low glow, one pulse), and
`prefers-reduced-motion` swaps every fancy transition for a plain crossfade or a still end state.

## The host

Run 4A: the host appears only in the cold open, the round title cards, the outro and his failure reactions - no corner host on gameplay screens, none at the Mystery Door or in the disco. Every host is a **rig** from `lib/host.js`:
`Host.html({ kind:'full'|'head', pose })` makes one, `Host.pose(el, name, { hold, then })` changes what he does,
`Host.poseAll(name)` poses the one on screen. Poses: `idle`, `idleClosed`, `blink`, `wave`, `point`, `cheer`,
`think`, `shrug`, `wink`, `oops`, `gasp`, `presenting`, `laugh`, and for the disco `discoPoint`, `swayL`, `swayR`,
`spin`. One-shot poses (cheer, wave, shrug, oops, gasp, laugh, wink, blink) go back to idle by themselves.

- **Art:** `data/host/<pose>.webp` (tools/build-art.py: cut out, one shared crop box, 900 px tall, feet on the
  bottom edge), listed in `data/host/manifest.js`. **HOST_IMAGE_MODE**: the host is all pictures or all the drawn SVG,
  never a mix - it switches to pictures only when the manifest lists at least idle, blink, wave, cheer, think, shrug,
  oops, laugh and presenting (`Host.IMAGE_SET`); then a pose without its own picture borrows the nearest one. Until
  then the drawn SVG host acts out every pose (lib/host.css) and the rendered cast stays off. **It is on since Oct 18** (idle, blink, wave, cheer, think, shrug, presenting, oops, laugh, discoPoint registered; borrowed: idleClosed and wink -> blink, point -> presenting, gasp -> oops, swayL / swayR / spin -> discoPoint); the drawn host is never put in the page. The act cue card shows the host whole in front of the stage below the card.
- **Events:** a right answer = `cheer`; a wrong one = `shrug` or `oops`; a question or a game in play = `think`; an
  intro (landing, cold open, menu) = `wave`; a reveal (act card, Mystery Game door) = `presenting`; the GOOP = `gasp`;
  THE MOTHERSHIP = `laugh`.
- Motion: idle bob, slow sway and blink; a quick pop on every pose change; transform and opacity only; still in lite
  mode. Saucer Shuffle's host never moves (his arms are drawn to the saucers).
