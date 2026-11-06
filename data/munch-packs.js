// FlipStax - GALACTIC CHOMPS rule packs (lib/munch-mix.js, registry id munchMix). Easy to extend: add a pack to FLIPSTAX_MUNCH_PACKS with the same shape,
// and list it in FLIPSTAX_MUNCH_ROUNDS.
//   pack: { label, rules:[ rule ] }
//   rule: { id, family, hard?, make(rng) -> { text, right:[tile], wrong:[tile] } }   (tile: the string shown on the floor tile, cream text, no emoji)
//     id      unique per rule; family groups variants (multiples of 3 / of 4 ... are one family) - a show never repeats a family
//     hard    may be picked for round 3 (the harder mix)
//     make    builds the round: the rule line for the banner ('Eat the multiples of 3') and every tile that is right and wrong for it.
//             A rule must have at least 5 right tiles (rules that cannot are left out - see the element rules below).
// FLIPSTAX_MUNCH_ROUNDS: which packs each of the three rounds draws from (round 3: a harder mix of both).
(function(){
  const range = (a, b)=>{ const o = []; for (let n = a; n <= b; n++) o.push(n); return o; };
  const pick = (rng, arr)=> arr[Math.floor(rng() * arr.length)];
  const isPrime = (n)=>{ if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  const split = (nums, ok)=> ({ right: nums.filter(ok).map(String), wrong: nums.filter(n=> !ok(n)).map(String) });

  // ---------------------------------------------------------------- MATH (tiles generated in code)
  const MATH = { label:'MATH', rules:[
    { id:'mult', family:'multiples', hard:true, make(rng){ const k = pick(rng, [3, 4, 5, 6, 7]); return Object.assign({ text:'Eat the multiples of ' + k }, split(range(2, 60), n=> n % k === 0)); } },
    { id:'prime', family:'primes', hard:true, make(){ return Object.assign({ text:'Eat the prime numbers' }, split(range(2, 50), isPrime)); } },
    { id:'even', family:'parity', make(){ return Object.assign({ text:'Eat the even numbers' }, split(range(1, 60), n=> n % 2 === 0)); } },
    { id:'odd', family:'parity', make(){ return Object.assign({ text:'Eat the odd numbers' }, split(range(1, 60), n=> n % 2 === 1)); } },
    { id:'square', family:'squares', hard:true, make(){ return Object.assign({ text:'Eat the square numbers' }, split(range(1, 100), n=> Number.isInteger(Math.sqrt(n)))); } },
    { id:'bigger', family:'bigger', make(rng){ const N = 20 + Math.floor(rng() * 41); return Object.assign({ text:'Eat the numbers bigger than ' + N }, split(range(1, 99), n=> n > N)); } },
    // 'Equals N': sums and products (a+b, axb); right if the value is N, wrong ones land close to N (N-6 .. N+6, never N)
    { id:'equals', family:'equals', hard:true, make(rng){
        const N = 10 + Math.floor(rng() * 15), right = [], wrong = [], seen = new Set();
        const add = (t, v)=>{ if (seen.has(t)) return; seen.add(t); (v === N ? right : wrong).push(t); };
        for (let a = 1; a <= 24; a++) for (let b = 1; b <= 24; b++){
          if (a + b >= N - 6 && a + b <= N + 6) add(a + '+' + b, a + b);
          if (a > 1 && b > 1 && a * b >= N - 6 && a * b <= N + 6) add(a + 'x' + b, a * b);
        }
        return { text:'Eat the ones that equal ' + N, right, wrong };
      } },
  ] };

  // ---------------------------------------------------------------- SCIENCE (tiles are element symbols)
  // The element table (checked row by row; state at room temperature, about 20-25 C):
  //   H hydrogen gas nonmetal; He helium gas noble; Li lithium solid metal; Be beryllium solid metal; B boron solid metalloid; C carbon solid nonmetal;
  //   N nitrogen gas nonmetal; O oxygen gas nonmetal; F fluorine gas nonmetal; Ne neon gas noble; Na sodium solid metal (Latin natrium);
  //   Mg magnesium solid metal; Al aluminum solid metal; Si silicon solid metalloid; P phosphorus solid nonmetal; S sulfur solid nonmetal;
  //   Cl chlorine gas nonmetal; Ar argon gas noble; K potassium solid metal (Latin kalium); Ca calcium solid metal; Ti titanium solid metal;
  //   Cr chromium solid metal; Mn manganese solid metal; Fe iron solid metal (Latin ferrum); Co cobalt solid metal; Ni nickel solid metal;
  //   Cu copper solid metal (Latin cuprum); Zn zinc solid metal; Br bromine liquid nonmetal; Kr krypton gas noble; Ag silver solid metal (Latin argentum);
  //   Sn tin solid metal (Latin stannum); I iodine solid nonmetal; Xe xenon gas noble; W tungsten solid metal (German wolfram); Pt platinum solid metal;
  //   Au gold solid metal (Latin aurum); Hg mercury liquid metal (Latin hydrargyrum); Pb lead solid metal (Latin plumbum); U uranium solid metal;
  //   Rn radon gas noble.
  // kind: 'metal', 'nonmetal', 'metalloid' or 'noble' (the noble gases are nonmetals too - they are kept off the board for the Nonmetals rule, and the two
  // metalloids are kept off it for Metals and Nonmetals, so no tile is arguable). old: the symbol comes from an old Latin or German name.
  const E = (sym, name, state, kind, old)=> ({ sym, name, state, kind, old: old || '' });
  const ELEMENTS = [
    E('H', 'hydrogen', 'gas', 'nonmetal'), E('He', 'helium', 'gas', 'noble'), E('Li', 'lithium', 'solid', 'metal'), E('Be', 'beryllium', 'solid', 'metal'),
    E('B', 'boron', 'solid', 'metalloid'), E('C', 'carbon', 'solid', 'nonmetal'), E('N', 'nitrogen', 'gas', 'nonmetal'), E('O', 'oxygen', 'gas', 'nonmetal'),
    E('F', 'fluorine', 'gas', 'nonmetal'), E('Ne', 'neon', 'gas', 'noble'), E('Na', 'sodium', 'solid', 'metal', 'Latin natrium'), E('Mg', 'magnesium', 'solid', 'metal'),
    E('Al', 'aluminum', 'solid', 'metal'), E('Si', 'silicon', 'solid', 'metalloid'), E('P', 'phosphorus', 'solid', 'nonmetal'), E('S', 'sulfur', 'solid', 'nonmetal'),
    E('Cl', 'chlorine', 'gas', 'nonmetal'), E('Ar', 'argon', 'gas', 'noble'), E('K', 'potassium', 'solid', 'metal', 'Latin kalium'), E('Ca', 'calcium', 'solid', 'metal'),
    E('Ti', 'titanium', 'solid', 'metal'), E('Cr', 'chromium', 'solid', 'metal'), E('Mn', 'manganese', 'solid', 'metal'), E('Fe', 'iron', 'solid', 'metal', 'Latin ferrum'),
    E('Co', 'cobalt', 'solid', 'metal'), E('Ni', 'nickel', 'solid', 'metal'), E('Cu', 'copper', 'solid', 'metal', 'Latin cuprum'), E('Zn', 'zinc', 'solid', 'metal'),
    E('Br', 'bromine', 'liquid', 'nonmetal'), E('Kr', 'krypton', 'gas', 'noble'), E('Ag', 'silver', 'solid', 'metal', 'Latin argentum'), E('Sn', 'tin', 'solid', 'metal', 'Latin stannum'),
    E('I', 'iodine', 'solid', 'nonmetal'), E('Xe', 'xenon', 'gas', 'noble'), E('W', 'tungsten', 'solid', 'metal', 'German wolfram'), E('Pt', 'platinum', 'solid', 'metal'),
    E('Au', 'gold', 'solid', 'metal', 'Latin aurum'), E('Hg', 'mercury', 'liquid', 'metal', 'Latin hydrargyrum'), E('Pb', 'lead', 'solid', 'metal', 'Latin plumbum'),
    E('U', 'uranium', 'solid', 'metal'), E('Rn', 'radon', 'gas', 'noble'),
  ];
  // an element rule: right / wrong by a test; `skip` leaves arguable symbols off the board for that rule
  const el = (id, family, text, ok, skip, hard)=> ({ id, family, hard: !!hard, make(){ const pool = ELEMENTS.filter(e=> !(skip && skip(e)));
    return { text, right: pool.filter(ok).map(e=> e.sym), wrong: pool.filter(e=> !ok(e)).map(e=> e.sym) }; } });
  // Counts in the table: gases 11 (H He N O F Ne Cl Ar Kr Xe Rn), solids 28, metals 23, nonmetals 10 (H C N O F P S Cl Br I), noble gases 6 (He Ne Ar Kr Xe Rn),
  // old Latin / German symbols 10 (Na K Fe Cu Ag Sn W Au Hg Pb). Liquids (Br, Hg: 2) and metalloids (B, Si: 2) have fewer than 5, so they are not rules.
  const SCIENCE = { label:'SCIENCE', rules:[
    el('gas', 'state-gas', 'Eat the gases at room temperature', e=> e.state === 'gas', null, false),
    el('solid', 'state-solid', 'Eat the solids at room temperature', e=> e.state === 'solid', null, false),
    el('metal', 'metals', 'Eat the metals', e=> e.kind === 'metal', e=> e.kind === 'metalloid', false),
    el('nonmetal', 'nonmetals', 'Eat the nonmetals', e=> e.kind === 'nonmetal', e=> e.kind === 'metalloid' || e.kind === 'noble', true),
    el('noble', 'noble', 'Eat the noble gases', e=> e.kind === 'noble', null, true),
    el('latin', 'latin', 'Eat the symbols from old Latin or German names', e=> !!e.old, null, true),
  ] };

  // ---------------------------------------------------------------- ENGLISH (tiles are words; checked by hand, every word is under 10 letters)
  // Parts of speech: only common words with ONE clear part of speech in everyday use - no words like run, light, play, jump, cold or kind that are
  // also another part of speech. Each list has more than 30 words; a word is in one list only.
  const NOUNS = ['apple', 'banana', 'kitten', 'puppy', 'mountain', 'river', 'teacher', 'planet', 'pizza', 'giraffe', 'elephant', 'library', 'kitchen', 'umbrella',
    'butterfly', 'camera', 'castle', 'guitar', 'island', 'forest', 'dragon', 'carrot', 'tomato', 'wizard', 'robot', 'volcano', 'octopus', 'penguin', 'cookie',
    'pumpkin', 'piano', 'zebra', 'tiger', 'onion', 'lemon', 'hospital', 'airport', 'museum'];
  const VERBS = ['think', 'bring', 'choose', 'forget', 'explain', 'arrive', 'believe', 'become', 'borrow', 'breathe', 'decide', 'describe', 'destroy', 'discover',
    'enjoy', 'imagine', 'invite', 'listen', 'pretend', 'remember', 'teach', 'agree', 'allow', 'appear', 'begin', 'behave', 'belong', 'deliver', 'explore',
    'forgive', 'ignore', 'invent', 'prepare', 'protect', 'receive', 'speak', 'write', 'sing'];
  const ADJECTIVES = ['happy', 'angry', 'brave', 'careful', 'gentle', 'hungry', 'lazy', 'noisy', 'polite', 'proud', 'shiny', 'sleepy', 'tiny', 'huge', 'loud',
    'bright', 'famous', 'curious', 'fluffy', 'friendly', 'gigantic', 'grumpy', 'honest', 'jealous', 'lucky', 'nervous', 'silly', 'sticky', 'strong', 'tall',
    'thirsty', 'wise', 'delicious', 'terrible', 'wonderful', 'enormous', 'fierce', 'cheerful', 'dizzy', 'greedy', 'helpful', 'clever'];
  // Plurals and singulars: no words that are the same in both (sheep, fish, deer) and no words that end in s but are singular only as a trick beyond 'bus'.
  const PLURALS = ['cats', 'dogs', 'boxes', 'mice', 'children', 'teeth', 'feet', 'geese', 'apples', 'buses', 'babies', 'wolves', 'knives', 'puppies', 'pianos',
    'tomatoes', 'heroes', 'women', 'people', 'cherries', 'ladies', 'foxes', 'dishes', 'berries', 'monkeys', 'stories', 'toys', 'shoes', 'trees', 'birds',
    'horses', 'ducks'];
  const SINGULARS = ['cat', 'dog', 'box', 'mouse', 'child', 'tooth', 'foot', 'goose', 'apple', 'bus', 'baby', 'wolf', 'knife', 'puppy', 'piano', 'tomato',
    'hero', 'woman', 'person', 'cherry', 'lady', 'fox', 'dish', 'berry', 'monkey', 'story', 'toy', 'shoe', 'tree', 'bird', 'horse', 'duck', 'glass'];
  // Rhymes (one syllable endings, said the everyday way). The wrong ones look close (same first letter or vowel) but do not rhyme.
  const RHYMES = {
    CAT: { right:['hat', 'bat', 'mat', 'rat', 'sat', 'flat', 'chat', 'splat', 'that', 'pat', 'fat'], wrong:['cut', 'cot', 'cap', 'kit', 'coat', 'bet', 'hit', 'hot', 'cute', 'cab', 'mad', 'can', 'what'] },
    DAY: { right:['say', 'may', 'way', 'ray', 'hay', 'tray', 'gray', 'stay', 'clay', 'spray', 'away', 'bay'], wrong:['dry', 'dot', 'deep', 'dad', 'toy', 'cow', 'sea', 'boy', 'dig', 'key', 'sky', 'two', 'die'] },
    LIGHT: { right:['night', 'kite', 'white', 'bite', 'fight', 'height', 'might', 'sight', 'tight', 'write', 'quite', 'flight'], wrong:['lit', 'late', 'left', 'list', 'lot', 'wait', 'weight', 'lift', 'loud', 'let', 'foot', 'gate', 'eight'] },
  };
  // Spelling: each pair is a common word and its usual misspelling (the board shows both of a pair); every right word is spelled as in US English.
  const SPELL = [['receive', 'recieve'], ['believe', 'beleive'], ['friend', 'freind'], ['because', 'becuase'], ['tomorrow', 'tommorow'], ['separate', 'seperate'],
    ['necessary', 'neccesary'], ['weird', 'wierd'], ['piece', 'peice'], ['calendar', 'calender'], ['address', 'adress'], ['library', 'libary'], ['February', 'Febuary'],
    ['Wednesday', 'Wensday'], ['surprise', 'suprise'], ['beginning', 'begining'], ['different', 'diffrent'], ['until', 'untill'], ['truly', 'truely'],
    ['argument', 'arguement'], ['grammar', 'grammer'], ['rhythm', 'rythm'], ['knowledge', 'knowlege'], ['chocolate', 'choclate'], ['writing', 'writting'],
    ['really', 'realy'], ['which', 'wich'], ['school', 'skool'], ['people', 'peeple'], ['island', 'iland']];
  const words = (id, family, text, right, wrong)=> ({ id, family, make(){ return { text, right: right.slice(), wrong: wrong.slice() }; } });
  const ENGLISH = { label:'ENGLISH', rules:[
    words('nouns', 'pos-noun', 'Eat the nouns', NOUNS, VERBS.concat(ADJECTIVES)),
    words('verbs', 'pos-verb', 'Eat the verbs', VERBS, NOUNS.concat(ADJECTIVES)),
    words('adjectives', 'pos-adj', 'Eat the adjectives', ADJECTIVES, NOUNS.concat(VERBS)),
    words('plurals', 'plural', 'Eat the plural words', PLURALS, SINGULARS),
    words('rhyme-cat', 'rhyme', 'Eat the words that rhyme with CAT', RHYMES.CAT.right, RHYMES.CAT.wrong),
    words('rhyme-day', 'rhyme', 'Eat the words that rhyme with DAY', RHYMES.DAY.right, RHYMES.DAY.wrong),
    words('rhyme-light', 'rhyme', 'Eat the words that rhyme with LIGHT', RHYMES.LIGHT.right, RHYMES.LIGHT.wrong),
    Object.assign(words('spelling', 'spelling', 'Eat the correctly spelled words', SPELL.map(p=> p[0]), SPELL.map(p=> p[1])), { pairs: SPELL }),
  ] };

  const MIN_RIGHT = 5;   // (a rule needs at least this many right tiles)
  const packs = { math: MATH, science: SCIENCE, english: ENGLISH };
  Object.keys(packs).forEach(k=>{ packs[k].rules = packs[k].rules.filter(r=>{ try{ return r.make(()=> 0.5).right.length >= MIN_RIGHT; }catch(e){ return false; } }); });
  window.FLIPSTAX_MUNCH_PACKS = packs;
  window.FLIPSTAX_MUNCH_ELEMENTS = ELEMENTS;
  // GALACTIC CHOMPS: round 1 MATH, round 2 SCIENCE, round 3 ENGLISH - each round draws one rule from its own subject
  window.FLIPSTAX_MUNCH_ROUNDS = [ { packs:['math'] }, { packs:['science'] }, { packs:['english'] } ];
})();
