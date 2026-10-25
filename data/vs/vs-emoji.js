// FlipStax - the VS emoji rule (Oct 24): every VS card shows an emoji on BOTH sides, and the two are never the same.
// One table for the game (flipstax.html), the importer (tools/vs-import.js) and the check (tools/vs-verify.py).
//   fallback[category]  the emoji a side gets when it has none (empty, or the old '✨' placeholder)
//   family[category]    other emoji from the same family, for when both sides end up with the same one
//   fix(cat, ga, gb, seed, nameA, nameB) -> [ga, gb] (with the names it also swaps a decorative emoji on a person or team for theirs): fills an empty side from fallback, then, if both sides match, changes the RIGHT side
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
  // ---- people and teams (Oct 24): a PERSON or TEAM never wears a decorative emoji (a star, medal, crown, ticket, stopwatch...) ----
  // music artists 🎤, actors and actresses 🎬, football (soccer) clubs ⚽, other clubs and athletes their sport (fighters 🥊).
  // A specific emoji the data already has (🤠 Dolly Parton, 🦸 a hero, 🏀 a basketballer) is kept: only decorative ones change.
  const DECORATIVE = new Set('⭐ 🌟 ✨ 🏅 🥇 🥈 🥉 🏆 🎠 👑 💫 🎉 🎊 🏟️ ⏱️ 📣 🎟️ 🕶️ 🎖️ 🔖 🎪 🪩'.split(' ').map(g=> g.replace(/\uFE0F/g, '')));
  const decorative = g=> DECORATIVE.has(String(g || '').replace(/\uFE0F/g, '').trim());
  const nk = n=> String(n || '').toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim();
  const SPORT = {};
  const sport = (g, names)=> names.split('|').forEach(n=> SPORT[nk(n)] = g);
  sport('🏀', "Michael Jordan|Kevin Durant|Kobe Bryant|Hakeem Olajuwon|Stephen Curry|Steph Curry|Angel Reese|Joel Embiid|Giannis Antetokounmpo|Shaquille O'Neal|Cooper Flagg|Luka Dončić|Luka Doncic|LeBron James|Magic Johnson|Larry Bird|Jayson Tatum|Victor Wembanyama|Caitlin Clark|Lakers|Celtics|Knicks|Nets|Warriors");
  sport('🥊', "Mike Tyson|Floyd Mayweather|Khabib Nurmagomedov|Alex Pereira|Nate Diaz|Charles Oliveira|Valentina Shevchenko|Daniel Cormier|Georges St-Pierre|Amanda Nunes|Muhammad Ali|Conor McGregor|Jon Jones|Israel Adesanya|Islam Makhachev|Anderson Silva|Ronda Rousey");
  sport('🏈', "Aaron Rodgers|Randy Moss|Patrick Mahomes|Joe Montana|Josh Allen|J.J. Watt|Peyton Manning|Tom Brady|Jerry Rice|Lawrence Taylor|Ravens|Steelers|Chiefs|Bills|Cowboys|Eagles|Patriots|Packers|Bears");
  sport('⚾', "Shohei Ohtani|Ronald Acuña Jr.|Hank Aaron|Alex Rodriguez|Babe Ruth|Derek Jeter|Mike Trout|Aaron Judge|Dodgers|Giants|Yankees|Mets|Red Sox|Cubs|Cardinals");
  sport('🏒', "Mario Lemieux|Sidney Crosby|Wayne Gretzky|Alexander Ovechkin|Connor McDavid|Penguins|Capitals|Rangers|Islanders|Bruins|Canadiens");
  sport('⚽', "Pelé|Erling Haaland|Cristiano Ronaldo|Lionel Messi|Diego Maradona|Kylian Mbappé|Real Madrid|Barcelona|Manchester United|Liverpool|Arsenal|Tottenham");
  sport('🎾', "Roger Federer|Venus Williams|Naomi Osaka|Rafael Nadal|Serena Williams|Novak Djokovic");
  sport('⛳', "Rory McIlroy|Jack Nicklaus|Tiger Woods");
  sport('🏃', "Carl Lewis|Usain Bolt"); sport('🏊', "Mark Spitz|Michael Phelps"); sport('🤸', "Nadia Comaneci|Simone Biles");
  const ACTORS = new Set("Jennifer Aniston|Charlize Theron|Viola Davis|Emma Stone|Florence Pugh|Dwayne Johnson|Keanu Reeves|Nicolas Cage|Kim Kardashian v|Zendaya|Sydney Sweeney|Anya Taylor-Joy|Margot Robbie|Scarlett Johansson|Gal Gadot|Meryl Streep|Jennifer Lawrence|Sandra Bullock|Angelina Jolie|Denzel Washington|Samuel L. Jackson|Will Smith|Brad Pitt|Tom Cruise|Johnny Depp".split('|').map(nk));
  const MUSIC_CONCEPTS = new Set("Concerts|Music Festivals|Main stage at a huge festival|Lollapalooza|Disco|Eras Tour|Karaoke|Air Guitar|Vinyl|Streaming|Headphones|Speakers|Old Music|New Music".split('|').map(nk));
  const AUTHORS = new Set("Dean Koontz|Emily Henry|Stephen King|Colleen Hoover|Agatha Christie".split('|').map(nk));
  const CELEB_MUSIC = new Set(['cher']);
  // the emoji for a person / team side, or null when the side is neither (or the rule has nothing to say)
  function personGlyph(cat, name){
    const k = nk(name);
    if (SPORT[k]) return SPORT[k];
    if (cat === 'actors' || cat === 'actresses' || ACTORS.has(k)) return '🎬';
    if (cat === 'music' && !MUSIC_CONCEPTS.has(k)) return '🎤';
    if (CELEB_MUSIC.has(k)) return '🎤';
    if (cat === 'books' && AUTHORS.has(k)) return '📚';
    return null;
  }
  // a decorative emoji on a person or team becomes theirs; anything else is kept
  const betterGlyph = (cat, name, g)=> decorative(g) ? (personGlyph(cat, name) || g) : g;
  // when two sides of one sport / job end up with the same emoji, the right one takes this look-alike
  const ALT = { '🏀':['⛹️'], '🥊':['🥋'], '🏈':['🏉'], '⚾':['🧢'], '🏒':['🥅'], '⚽':['🥅'], '🎾':['🏸'], '⛳':['🏌️'], '🏃':['👟'], '🤸':['🤾'], '🏊':['🤽'], '🎤':['🎸','🎧','🎹','🎵','🥁'], '🎬':['🎭','🎥','🍿'] };
  const norm = s=> String(s || '').replace(/️/g, '').trim();
  const missing = g=> !norm(g) || norm(g) === norm(PLACEHOLDER);
  const hash = s=>{ let h = 0; for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h; };
  const fb = cat=> fallback[cat] || '🎲';
  function fix(cat, ga, gb, seed, nameA, nameB){
    if (nameA != null){ ga = betterGlyph(cat, nameA, ga); gb = betterGlyph(cat, nameB, gb); }
    let a = ga, b = gb, filledA = false, filledB = false;
    if (missing(a)){ a = fb(cat); filledA = true; }
    if (missing(b)){ b = fb(cat); filledB = true; }
    if (norm(a) === norm(b)){
      const personal = nameA != null && (personGlyph(cat, nameA) || personGlyph(cat, nameB)), own = personal ? (ALT[a] || ALT[b] || []).filter(g=> norm(g) !== norm(a)) : [];
      const alts = own.length ? own : (family[cat] || family._).filter(g=> norm(g) !== norm(a) && norm(g) !== norm(b) && !(personal && decorative(g)));
      const pool = alts.length ? alts : (family[cat] || family._).filter(g=> norm(g) !== norm(a));   // (never empty)
      const pick = pool[hash(seed) % pool.length];
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
      [[c.a, c.glyphA, 'left'], [c.b, c.glyphB, 'right']].forEach(([n, g, side])=>{ if (decorative(g) && personGlyph(c.category, n)) out.push(nm + ': a decorative emoji (' + g + ') on a person or team, ' + n + ' - it should be ' + personGlyph(c.category, n)); });
    });
    return out;
  }
  root.FLIPSTAX_VS_EMOJI = { fallback, family, fix, problems, missing, PLACEHOLDER, decorative, personGlyph, betterGlyph };
})(typeof window !== 'undefined' ? window : globalThis);
