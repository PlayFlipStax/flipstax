# FlipStax Orbit Drop chip economy (J6): simulates Daily episodes and prints how many Orbit Drop chips players get.
# Chips = keys + bonus chips + 1 for a solved Word Warp, clamped to [ORBIT_MIN_CHIPS, DAILY_ORBIT_MAX] (dailyChipsFor).
# Sources modelled from flipstax.html:
#   - Mystery Game 1 (the Riddle) and Mystery Game 2: a win = a key
#   - Lucky Lights: 12 squares (KEY x2, CHIP x2, GOOP x2 ...), up to 3 spins; the GOOP loses everything won there;
#     a KEY square = a key, a CHIP square = a chip
#   - Cosmic Surprise in 1 episode of 3: in the show the prize is a key 10/100, a chip 8/100 (else points)
#   - a solved Word Warp: +1 chip
# Player skill (an assumption, not measured): average = Riddle 60%, Game 2 55%, Word Warp 70%, banks Lucky Lights
# as soon as a key or chip is won; weak = 35% / 30% / 35%, banks after the first spin that doesn't GOOP.
#   python3 tools/chip-economy-sim.py [episodes=10000]
import random, sys
N = int(sys.argv[1]) if len(sys.argv) > 1 else 10000
SQUARES = ['+20', 'KEY', '+50', 'GOOP', '+20', 'x2', 'CHIP', '+20', 'GOOP', '+50', 'KEY', 'CHIP']
MAX = 6
SKILL = { 'average': dict(riddle=0.60, game2=0.55, warp=0.70, greedy=True), 'weak': dict(riddle=0.35, game2=0.30, warp=0.35, greedy=False) }
def lucky(greedy, rng):
    keys = chips = 0
    for spin in range(3):
        sq = rng.choice(SQUARES)
        if sq == 'GOOP': return 0, 0
        if sq == 'KEY': keys += 1
        if sq == 'CHIP': chips += 1
        if not greedy or keys + chips > 0: break   # bank
    return keys, chips
def episode(sk, rng):
    keys = (rng.random() < sk['riddle']) + (rng.random() < sk['game2'])
    k, c = lucky(sk['greedy'], rng); keys += k; chips = c
    if rng.random() < 1 / 3:
        r = rng.random() * 100
        if r < 10: keys += 1
        elif r < 18: chips += 1
    return keys + chips + (rng.random() < sk['warp'])
rng = random.Random(16)
for name, sk in SKILL.items():
    raw = [episode(sk, rng) for _ in range(N)]
    for mn in (2, 3):
        got = [max(mn, min(MAX, x)) for x in raw]
        dist = { n: 100 * got.count(n) / N for n in range(mn, MAX + 1) }
        print('%-8s ORBIT_MIN_CHIPS=%d  avg %.2f  ' % (name, mn, sum(got) / N) + '  '.join('%d:%4.1f%%' % (n, p) for n, p in dist.items()) + '   (earned 0-1: %.0f%%)' % (100 * sum(1 for x in raw if x <= 1) / N))
