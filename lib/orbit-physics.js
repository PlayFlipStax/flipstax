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
    W: 320, H: 420,
    BALL_R: 7, PEG_R: 4.5,
    GRAVITY: 900,            // units / s^2
    STEP_S: 1 / 240,         // physics step
    RESTITUTION: 0.3,        // bounce off pegs
    WALL_RESTITUTION: 0.35,
    FRICTION: 0.985,         // tangential speed kept per peg contact
    LUCK: 0.12,              // random sideways nudge per peg bounce, x the chip's speed
    LAUNCH_JITTER: 10,       // a little random sideways speed as it leaves the UFO (units/s)
    GUARD_LUCK: 3.5,         // ...times this on the guard pegs (no sure-fire line into a ringed slot)
    MAX_SPEED: 520,
    STUCK_SPEED: 25, STUCK_STEPS: 48, STUCK_KICK: 70,   // a chip resting on pegs this long gets a nudge (never hangs)
    DROP_Y: 16, AIM_MARGIN: 18,
    SLOT_TOP: 338, FLOOR_Y: 412,
    // left to right: [kind, width]; widths add up to W
    // (the jackpot's guard pegs must leave a gap wider than the chip: 24 - 2 x PEG_R > 2 x BALL_R)
    SLOTS: [['x1', 40], ['x3', 26], ['x2', 52], ['+50', 30], ['jackpot', 24], ['x2', 52], ['+50', 30], ['x3', 26], ['x1', 40]],
    SLOT_POINTS: { x1:20, x2:40, x3:60, '+50':50, jackpot:100 },
    PEG_ROWS: 2, PEG_ROW_Y0: 140, PEG_ROW_DY: 70, PEG_DX: 72, PEG_EDGE: 28,
    GUARD_DY: 16,            // guard pegs sit this far above the slot tops...
    GUARD_GAP: 0,            // ...this far inside each edge of a guarded (non-x1/x2) slot (0 = on the dividers)
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
      if (kind === 'x1' || kind === 'x2') return;
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
      return { slot, kind, pts: C.SLOT_POINTS[kind], x, t, steps: step, path, hits };
    }
    return { C, BOARD:{ w:C.W, h:C.H }, SLOTS:C.SLOTS, SLOT_POINTS:C.SLOT_POINTS, slotEdges:edges, pegs, dividers, AIM_MIN, AIM_MAX, simulate };
  }
  // mulberry32: a small seeded generator
  function rng(seed){ let a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const board = build();
  root.OrbitPhysics = Object.assign({ DEFAULTS, build, rng }, board);
})(typeof window !== 'undefined' ? window : globalThis);
