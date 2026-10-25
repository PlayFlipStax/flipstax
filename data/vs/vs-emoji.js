// FlipStax - the VS emoji rule (Oct 24): every VS card shows an emoji on BOTH sides, and the two are never the same.
// One table for the game (flipstax.html), the importer (tools/vs-import.js) and the check (tools/vs-verify.py).
//   fallback[category]  the emoji a side gets when it has none (empty, or the old '✨' placeholder)
//   family[category]    other emoji from the same family, for when both sides end up with the same one
//   fix(cat, ga, gb, seed) -> [ga, gb]: fills an empty side from fallback, then, if both sides match, changes the RIGHT side
//                          (or the side that was filled) to another from the family, picked by `seed` so every device agrees
//   problems(cards)     -> a list of sentences: any side empty or '✨', any card whose two sides match (cards: { category, a, b, glyphA, glyphB })
(function(root){
  const fallback = {
    actors:'🎬', actresses:'🎬', celebrity:'⭐', tv:'📺', realitytv:'📺', movies:'🎞️', music:'🎵', albums:'💿', podcasts:'🎙️', books:'📚', sports:'🏅',
    games:'🎮', food:'🍽️', drinks:'🥤', cars:'🚗', tech:'📱', nostalgia:'📼', toys:'🧸', cartoons:'🖍️', internet:'🌐', fitness:'💪', travel:'✈️',
    history:'🏛️', geography:'🌍', money:'💵', pets:'🐾', style:'👗', brands:'🏷️', creators:'🎥', comedy:'😂', ideas:'💡', life:'🌱', wild:'🎲',
  };
  const family = {
    actors:['🎬','🎭','🎤','🎞️','⭐'], actresses:['🎬','🎭','🎤','🎞️','⭐'], celebrity:['⭐','📸','💃','🕶️','👑'], tv:['📺','📡','🛋️','🍿','📼'],
    realitytv:['📺','📡','🎙️','🔥','🍿'], movies:['🎞️','🎬','🍿','🎥','🎟️'], music:['🎵','🎤','🎸','🎧','🎹','🥁','📻'], albums:['💿','📀','🎶','📻','🎧'],
    podcasts:['🎙️','🎧','📻','🗣️'], books:['📚','📖','📕','🔖'], sports:['🏅','🏆','🥇','📣','🏟️','⏱️'], games:['🎮','🕹️','👾','🏆'],
    food:['🍽️','😋','🥄','🍴','🧂'], drinks:['🥤','🧃','🧊','☕','🍹'], cars:['🚗','🏎️','🛻','🔧','🛣️'], tech:['📱','💻','🔌','📡','🖥️'],
    nostalgia:['📼','📻','🕰️','📺','💾'], toys:['🧸','🪀','🧩','🎲','🪁'], cartoons:['🖍️','🎨','📺','🐭','🍿'], internet:['🌐','💻','📲','🔗','🛜'],
    fitness:['💪','🏋️','🏃','🥇','🧘'], travel:['✈️','🧳','🗺️','🏝️','🚆'], history:['🏛️','📜','🗿','⚔️','🕰️'], geography:['🌍','🗺️','🧭','⛰️','🌊'],
    money:['💵','💰','🪙','💳','📈'], pets:['🐾','🐶','🐱','🦴','🐟'], style:['👗','👟','🧥','👜','🕶️'], brands:['🏷️','🛍️','💼','⭐'], creators:['🎥','📹','📲','⭐','🎬'],
    comedy:['😂','🎤','🤣','🎭'], ideas:['💡','🧠','🤔','🎯'], life:['🌱','🏡','☀️','🍀','🧭'], wild:['🎲','🎉','🌀','🔥','💫'],
    _:['⭐','🔥','🎯','🎉','💫'],
  };
  const PLACEHOLDER = '✨';
  const norm = s=> String(s || '').replace(/️/g, '').trim();
  const missing = g=> !norm(g) || norm(g) === norm(PLACEHOLDER);
  const hash = s=>{ let h = 0; for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h; };
  const fb = cat=> fallback[cat] || '🎲';
  function fix(cat, ga, gb, seed){
    let a = ga, b = gb, filledA = false, filledB = false;
    if (missing(a)){ a = fb(cat); filledA = true; }
    if (missing(b)){ b = fb(cat); filledB = true; }
    if (norm(a) === norm(b)){
      const alts = (family[cat] || family._).filter(g=> norm(g) !== norm(a) && norm(g) !== norm(b));
      const pick = alts[hash(seed) % alts.length];
      if (filledA && !filledB) a = pick; else b = pick;   // (the filled side moves; otherwise the right side)
    }
    return [a, b];
  }
  function problems(cards){
    const out = [];
    cards.forEach(c=>{
      const nm = c.id || (c.a + ' v ' + c.b);
      if (missing(c.glyphA)) out.push(nm + ': no emoji on the left (' + c.a + ')');
      if (missing(c.glyphB)) out.push(nm + ': no emoji on the right (' + c.b + ')');
      if (!missing(c.glyphA) && norm(c.glyphA) === norm(c.glyphB)) out.push(nm + ': the same emoji on both sides (' + c.glyphA + ')');
    });
    return out;
  }
  root.FLIPSTAX_VS_EMOJI = { fallback, family, fix, problems, missing, PLACEHOLDER };
})(typeof window !== 'undefined' ? window : globalThis);
