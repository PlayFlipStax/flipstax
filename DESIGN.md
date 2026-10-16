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

## The host

One host per screen (the disco celebration is the only exception). Every host is a **rig** from `lib/host.js`:
`Host.html({ kind:'full'|'head', pose })` makes one, `Host.pose(el, name, { hold, then })` changes what he does,
`Host.poseAll(name)` poses the one on screen. Poses: `idle`, `idleClosed`, `blink`, `wave`, `point`, `cheer`,
`think`, `shrug`, `wink`, `oops`, `gasp`, `presenting`, `laugh`, and for the disco `discoPoint`, `swayL`, `swayR`,
`spin`. One-shot poses (cheer, wave, shrug, oops, gasp, laugh, wink, blink) go back to idle by themselves.

- **Art:** `data/host/<pose>.png`, listed in `data/host/manifest.js` once the file is there. All pictures share one
  canvas (600 x 990 suggested, transparent) and one baseline - feet on the bottom edge - so poses crossfade without
  a jump. Until a pose has art, the drawn SVG host acts it out (lib/host.css).
- **Events:** a right answer = `cheer`; a wrong one = `shrug` or `oops`; a question or a game in play = `think`; an
  intro (landing, cold open, menu) = `wave`; a reveal (act card, Mystery Game door) = `presenting`; the GOOP = `gasp`;
  THE MOTHERSHIP = `laugh`.
- Motion: idle bob, slow sway and blink; a quick pop on every pose change; transform and opacity only; still in lite
  mode. Saucer Shuffle's host never moves (his arms are drawn to the saucers).
