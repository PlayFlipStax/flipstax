/* FlipStax - Orbit Drop physics (shared by the game and the headless
   balance simulation, so both always agree).

   A chip (a disc) falls from the UFO at the x the player aimed at, bounces
   off round pegs, the walls and the slot dividers, and settles in a slot.
   Fixed time step (STEP_S), so the same aim and the same luck seed always
   give the same path. "Luck": every peg bounce gets a small random nudge
   (LUCK) from a seeded generator - aim matters, but nothing is certain.

   All the balance numbers are in DEFAULTS; build(overrides) makes a board
   from them (the game uses the defaults; screenshots/qa/tools/orbit_sim.py
   tries variations). High-value slots are narrow and ringed by guard pegs,
   low-value slots are wide. */
(function(root){
  const DEFAULTS = {
    // Rebuilt Oct 2026 as a proper Plinko board: 9 staggered rows of big pegs
    // (14 units across), a 26-unit chip, big slots. The board scales to the
    // screen (about 1 unit = 1px on a phone), so the chip is ~24-26px and
    // the pegs ~13px. Tuned with screenshots/qa/tools/orbit_sim.py: a random
    // dropper averages ~37 a chip (the old board: 40.9), the jackpot comes
    // ~5% of random chips; with this many rows the bounces are chaotic, so
    // aiming helps by about +12% (the 2-row board gave +31%).
    W: 360, H: 560,
    BALL_R: 13, PEG_R: 7,
    GRAVITY: 2000,           // units / s^2
    STEP_S: 1 / 240,         // physics step
    RESTITUTION: 0.45,       // bounce off pegs
    WALL_RESTITUTION: 0.35,
    FRICTION: 0.9,           // tangential speed kept per peg contact
    LUCK: 0.03,              // random sideways nudge per peg bounce, x the chip's speed
    LAUNCH_JITTER: 2,        // a little random sideways speed as it leaves the UFO (units/s)
    GUARD_LUCK: 6,           // ...times this on the guard pegs (no sure-fire line into a ringed slot)
    MAX_SPEED: 900,
    STUCK_SPEED: 25, STUCK_STEPS: 48, STUCK_KICK: 90,   // a chip resting on pegs this long gets a nudge (never hangs)
    DROP_Y: 26, AIM_MARGIN: 28,
    SLOT_TOP: 462, FLOOR_Y: 552,
    // left to right: [kind, width]; widths add up to W. A guarded slot's gap
    // (width - 2 x PEG_R) must clear the chip (2 x BALL_R): 44 - 14 = 30 > 26.
    SLOTS: [['x1', 36], ['x3', 44], ['x2', 42], ['+50', 36], ['jackpot', 44], ['+50', 36], ['x2', 42], ['x3', 44], ['x1', 36]],
    SLOT_POINTS: { x1:20, x2:40, x3:60, '+50':50, jackpot:100 },
    PEG_ROWS: 9, PEG_ROW_Y0: 86, PEG_ROW_DY: 38, PEG_DX: 66, PEG_EDGE: 48,
    GUARDED: ['x3', 'jackpot'],   // slots ringed by guard pegs
    GUARD_DY: 18,            // guard pegs sit this far above the slot tops...
    GUARD_GAP: 0,            // ...this far inside each edge of a guarded slot (0 = on the dividers)
    JACKPOT_CAP_DY: 0,       // and one more could cap the jackpot's ring from above (0 = none: too hard)
  };
  function build(over){
    const C = Object.assign({}, DEFAULTS, over || {});
    const edges = [0]; C.SLOTS.forEach(s=> edges.push(edges[edges.length - 1] + s[1]));
    const pegs = [];
    for (let r = 0; r < C.PEG_ROWS; r++){
      const y = C.PEG_ROW_Y0 + r * C.PEG_ROW_DY, off = r % 2 ? C.PEG_DX / 2 : 0;
      for (let x = C.PEG_EDGE + off; x <= C.W - C.PEG_EDGE + 0.01; x += C.PEG_DX) pegs.push({ x, y, row:r });
    }
    const guardY = C.SLOT_TOP - C.GUARD_DY;
    C.SLOTS.forEach(([kind], i)=>{
      if (C.GUARDED.indexOf(kind) < 0) return;
      const l = edges[i], rr = edges[i + 1];
      pegs.push({ x: l + C.GUARD_GAP, y: guardY, guard:true }); pegs.push({ x: rr - C.GUARD_GAP, y: guardY, guard:true });
      if (kind === 'jackpot' && C.JACKPOT_CAP_DY) pegs.push({ x: (l + rr) / 2, y: guardY - C.JACKPOT_CAP_DY, guard:true });
    });
    const dividers = edges.slice(1, -1);
    const AIM_MIN = C.AIM_MARGIN, AIM_MAX = C.W - C.AIM_MARGIN;

    // One drop. Returns { slot, kind, pts, x, t, path:[x,y,t, ...] every
    // `sample` steps (unless noPath), hits:[peg index, t, ...] }. Pure.
    function simulate(aimX, seed, opts){
      opts = opts || {};
      const sample = opts.sample || 4, rand = rng(seed || 1), R = C.BALL_R, min = C.BALL_R + C.PEG_R;
      let x = Math.max(AIM_MIN, Math.min(AIM_MAX, aimX)), y = C.DROP_Y, vx = (rand() - 0.5) * 2 * C.LAUNCH_JITTER, vy = 40, t = 0;
      const path = opts.noPath ? null : [x, y, 0], hits = [];
      let lastPeg = -1, step = 0, rest = 0, still = 0;
      while (step < 4800){
        step++; t += C.STEP_S;
        vy += C.GRAVITY * C.STEP_S;
        const sp = Math.hypot(vx, vy); if (sp > C.MAX_SPEED){ vx *= C.MAX_SPEED / sp; vy *= C.MAX_SPEED / sp; }
        x += vx * C.STEP_S; y += vy * C.STEP_S;
        if (x < R){ x = R; vx = Math.abs(vx) * C.WALL_RESTITUTION; }
        if (x > C.W - R){ x = C.W - R; vx = -Math.abs(vx) * C.WALL_RESTITUTION; }
        for (let i = 0; i < pegs.length; i++){
          const p = pegs[i], dx = x - p.x, dy = y - p.y, d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
          x = p.x + nx * min; y = p.y + ny * min;
          const vn = vx * nx + vy * ny;
          if (vn < 0){
            const tx = -ny, ty = nx, vt = vx * tx + vy * ty, hit = -vn, speed = Math.hypot(vx, vy);
            const nvn = hit * C.RESTITUTION, nvt = vt * C.FRICTION + (rand() - 0.5) * 2 * C.LUCK * (p.guard ? C.GUARD_LUCK : 1) * speed;
            vx = nx * nvn + tx * nvt; vy = ny * nvn + ty * nvt;
            if (i !== lastPeg){ hits.push(i, t); lastPeg = i; }
          }
        }
        if (y + R > C.SLOT_TOP){
          for (let k = 0; k < dividers.length; k++){
            const wx = dividers[k], dx = x - wx;
            if (Math.abs(dx) >= R) continue;
            if (y < C.SLOT_TOP){   // landed on a divider's top: rolls off to one side
              const side = dx === 0 ? (rand() < 0.5 ? -1 : 1) : Math.sign(dx);
              x = wx + side * R; vx = side * Math.max(40, Math.abs(vx)) * 0.6;
            } else { x = wx + Math.sign(dx || 1) * R; vx = -vx * C.WALL_RESTITUTION; }
          }
        }
        if (y > C.FLOOR_Y - R){ y = C.FLOOR_Y - R; vy = -vy * 0.25; vx *= 0.6; if (Math.abs(vy) < 30) rest++; }
        if (y + R < C.SLOT_TOP && Math.hypot(vx, vy) < C.STUCK_SPEED){ if (++still > C.STUCK_STEPS){ vx = (rand() < 0.5 ? -1 : 1) * C.STUCK_KICK; vy = -20; still = 0; } } else still = 0;
        if (path && step % sample === 0) path.push(x, y, t);
        if (rest > 6) break;
      }
      if (path) path.push(x, y, t);
      let slot = C.SLOTS.length - 1;
      for (let i = 0; i < C.SLOTS.length; i++){ if (x < edges[i + 1]){ slot = i; break; } }
      const kind = C.SLOTS[slot][0];
      return { slot, kind, pts: C.SLOT_POINTS[kind], x, y, t, steps: step, path, hits };
    }
    return { C, BOARD:{ w:C.W, h:C.H }, SLOTS:C.SLOTS, SLOT_POINTS:C.SLOT_POINTS, slotEdges:edges, pegs, dividers, AIM_MIN, AIM_MAX, simulate };
  }
  // mulberry32: a small seeded generator
  function rng(seed){ let a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const board = build();
  root.OrbitPhysics = Object.assign({ DEFAULTS, build, rng }, board);
})(typeof window !== 'undefined' ? window : globalThis);
