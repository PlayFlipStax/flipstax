# FlipStax direction

This is the brief every change follows. If a change goes against it, the brief wins.

## What FlipStax is

**One daily game show.** One episode a day, the same for everyone, new every day.
Daily Stax *is* the show. Infinity Flips is hidden from the menu; its code stays in place.

The episode runs from a single rundown (`data/rundown.js`), so the order of the show can be
tuned without touching code:

1. **Cold open** - red velvet curtain, an EPISODE number plate, the curtain parts, FLIPSTAX
   lights up letter by letter, the host slides in, three cue cards fan out
   (VS SHOWDOWN, ?, GRAND PRIZE). 12 s the first time, 3 s for returning players, tap to skip.
2. **Act 1 - THE OPENER** (x1 points): 5 VS, Brain Beam (easy), 4 VS, Mystery Game 1, Brain Beam (easy).
3. **Commercial break** - a 3 s fake 70s ad for a fictional product, skippable.
4. **Act 2 - DOUBLE TROUBLE** (x2): 5 VS, Brain Beam (medium), Portal Pick, 4 VS, Mystery Game 2, Brain Beam (medium).
5. **Act 3 - LIGHTNING ROUND** (x3, 5 s VS timer): 6 VS, two hard Brain Beams back to back, Lucky Lights.
   Lucky Lights has two GOOP squares: landing on the GOOP loses the whole Lucky Lights bonus
   (a green slime splat that says GOOPED!). The commercial's product is ZING COLA.
6. **Grand finale** - Word Warp, then Orbit Drop for the grand prize (the jackpot slot is THE MOTHERSHIP).
7. **Results** - the share card, a score breakdown, your best moment, the personality card,
   the streak, a "Tomorrow on FlipStax" tease and a countdown to the next episode.

Each act opens with the host holding up a cue card and a colour sweep.

## Style

A bright, cheeky 70s/80s TV game show.

- **Clean beats busy.** One hero element per screen. No more than 2 decorative animations
  competing with the question.
- **Premium, not cheap.** Never a casino or slot-machine look.
- **One host per screen.**
- **Runs smoothly on a 3-year-old phone.** Transform and opacity animations; a lite mode cuts
  the heaviest effects when the frame rate drops (or with `?lite=1`).

### Colour worlds - each game owns one

| Game | World |
|---|---|
| VS cards | hot pink |
| Brain Beam | royal blue |
| Riddle | green, with flying question marks |
| Portal Pick | teal |
| Price Probe | gold |
| Oddball Alert | orange |
| Emoji Decode | cyan |
| Time Warp | violet |
| Word Warp | red |
| Orbit Drop | deep-space neon |
| Lucky Lights | gold and black |

### Bulbs

- Normally: a slow chase in the world colour.
- Right answer or crowd match: every bulb flashes white-gold together, twice (about 0.4 s).
- Miss: they flicker red.
- Jackpot: they strobe gold.

### The prize track

The Word Warp word is never visible before the finale. The HUD shows 6 face-down tiles: an
earned tile glows gold with a "?", a missed tile shows a red X. Letters appear only in Word Warp.

## Never

- Real show names or catchphrases: Survey says, Come on down, Whammy, Plinko, Zonk,
  Daily Double, Bankrupt, Lose a Turn, 50:50, Ask the Audience.
- Game types or features beyond the brief.
- Lifeline buttons, "VOTE NOW" buttons (tapping a card is the vote), casino buttons.
