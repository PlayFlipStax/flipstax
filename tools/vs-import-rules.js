// FlipStax - the data for tools/vs-import.js (Oct 23): the rules the importer reads. Edit here, run the importer again.
// Eras: 80s, 90s, 2000s, 2010s, now, timeless. A card takes the era of its NEWER side; a side with no era counts as timeless.
window.VS_IMPORT_RULES = {
  // The source files (served by the dev server) and how each is read.
  sources: [
    { file: 'incoming-assets/vs-cards/vs_batch_claude_1.txt', optional: true },
    { file: 'incoming-assets/vs-cards/vs_batch_claude_2.txt' },
    { file: 'incoming-assets/vs-cards/vs_batch_claude_3.txt' },
    { file: 'incoming-assets/vs-cards/vs_gemini_v2_cleaned_mixed.txt', gemini: true },
  ],
  // Pairs held back for the owner to decide (listed in the report).
  skip: [ ['Michael Jackson', 'Prince'] ],

  // Category labels and badges for the categories the sources add (flipstax.html CAT_META is written to match).
  categories: {
    tv:       { label:'TV Shows',  badge:'🛋️ Couch Critic' },
    cars:     { label:'Cars',      badge:'🏎️ Gearhead' },
    albums:   { label:'Albums',    badge:'💿 Record Collector' },
    actors:   { label:'Actors',    badge:'🎭 Screen Fan' },
    internet: { label:'Internet',  badge:'🌐 Extremely Online' },
    toys:     { label:'Toys',      badge:'🧸 Toy Box Kid' },
    cartoons: { label:'Cartoons',  badge:'🖍️ Cartoon Fan' },
  },

  // Gemini rows have no emoji: obvious ones by category, otherwise a rotating generic one per side.
  emoji: {
    tv: ['📺'], albums: ['💿'],
    movies: ['🎬', '🍿', '🎥'],
    music: ['🎤', '⭐', '🎸', '🎧'],
    actors: ['🎬', '🎤', '⭐', '🎭'],
    _default: ['🎬', '🎤', '⭐', '🎭'],
  },
  // Gemini eras: for each category, the row numbers (in file order within the category) that belong to each era.
  // The importer checks every row of the category is listed exactly once.
  geminiEras: {
    tv: {
      "2010s": [1,14,15,20,21,23,26,28,30,32,33,37,40,41], now: [2,3,4,5,6,7,8,9,10,11,31,34],
      "2000s": [12,13,16,17,18,22,24,25,27,35,36,38,39,42], "90s": [19,29],
    },
    movies: {
      "90s": [1,20,22,29,58], "2010s": [2,4,5,6,7,8,9,10,11,17,18,19,31,32,33,42,43,47,48,54,56,60,63,64], now: [3,12,13,14,15,41,44,46,49,50,55],
      "2000s": [16,23,24,25,26,27,28,34,35,36,37,38,39,40,45,51,52,53,59,61,62,65], timeless: [21], "80s": [30,57],
    },
    music: {
      "2000s": [1,2,5,8,9,12,13,17,31,33,34,35,36,47], "90s": [3,6,7,10,18,19,20,29,30,48], "2010s": [4,14,16,21,22,24,26,49],
      "80s": [11,28,32,45,46], now: [15,23,25], timeless: [27,37,38,39,40,41,42,43,44],
    },
    albums: {
      "2010s": [1,2,6,13,18], "90s": [3,10,11,14,21], timeless: [4,5,17,20,22,23], now: [7,8,12,24,25,26,27], "2000s": [9,15,19], "80s": [16],
    },
    actors: {
      "2000s": [1,5,7,9,23,24,27,30,33,37], "90s": [2,8,17,28,29,32], "2010s": [3,4,6,10,11,15,22,25,26,34,35,36,38],
      now: [12,13,14,39], "80s": [16,31], timeless: [18,19,20,21],
    },
  },

  // ---- eras for the cards already in the pool ----
  // The old hand tags (tools/vs-inventory.py: C classic, M modern, N now) become the new scale:
  //   C -> 80s, unless the name is a pre-80s icon (timeless) or a 90s title (90s);
  //   M -> 2000s, unless the name is a 90s act or title (90s) or a 2010s one (2010s);
  //   N -> 2010s, unless the name broke out in 2020 or later (now).
  timelessNames: 'babe ruth|hank aaron|muhammad ali|pelé|elvis presley|johnny cash|jack nicklaus|the beatles|rolling stones|the rolling stones|the beach boys|led zeppelin|pink floyd|bob dylan|neil young|eric clapton|jimi hendrix|fleetwood mac|the eagles|mick jagger|robert plant|willie nelson|1984|brave new world|of mice and men|the catcher in the rye|to kill a mockingbird|the great gatsby|pride and prejudice|jane eyre|agatha christie|arthur conan doyle|edgar allan poe|king kong|old hollywood glamour|classic movies|old music|saturday morning cartoons|old cartoons|the godfather|airplane|star wars|star trek|jaws|superman|batman|george carlin|richard pryor|freddie mercury|queen|david bowie|dolly parton|reba mcentire|dune|foundation|the shining|it|stephen king|dean koontz|steven spielberg|george lucas|morgan freeman|meryl streep|godzilla|zelda|the legend of zelda|super mario|yankees|mets|red sox|cubs|cardinals|lakers|celtics|packers|bears|cowboys|eagles|steelers|bruins|canadiens|knicks|real madrid|barcelona|manchester united|liverpool|alabama|auburn|duke|unc|michigan|ohio state|coca-cola|pepsi|coke|walmart|jordan peele|nikki glaser|mark normand|the legend of zelda|harry potter|lord of the rings|disney',
  eras80: "magic johnson|larry bird|jerry rice|joe montana|lawrence taylor|wayne gretzky|mario lemieux|mark spitz|carl lewis|nadia comaneci|mike tyson|whitney houston|michael jackson|prince|madonna|metallica|iron maiden|guns n' roses|ac/dc|80s music|80s|mixtapes|ferris bueller's day off|top gun|airplane|the naked gun|the shining|the simpsons|arcades|flip phones",
  eras90: 'friends|seinfeld|the simpsons|family guy|pulp fiction|goodfellas|reservoir dogs|fight club|se7en|jurassic park|ace ventura|billy madison|dumb and dumber|happy gilmore|home alone|top gun|toy story|the lion king|aladdin|the matrix|titanic|nirvana|pearl jam|90s music|90s|90s grunge, flannel and feedback|jim carrey|keanu reeves|tom hanks|denzel washington|samuel l. jackson|wolverine|spider-man|when harry met sally|pretty woman|10 things i hate about you|13 going on 30|derek jeter|michael jordan|mike tyson|shaquille o\'neal|hakeem olajuwon|wayne gretzky|mario lemieux|magic johnson|larry bird|jerry rice|joe montana|lawrence taylor|mark spitz|carl lewis|nadia comaneci|whitney houston|michael jackson|prince|madonna|metallica|iron maiden|guns n\' roses|ac/dc|digimon|pokémon|pikachu|charizard|blastoise|squirtle|bulbasaur|mewtwo|mew|gengar|snorlax|eevee|ash ketchum|90s|mixtapes|flip phones|arcades|disposable cameras|80s music|80s|zoolander',
  eras2010: 'drake|j. cole|kendrick lamar|cardi b|taylor swift|ed sheeran|bruno mars|ariana grande|selena gomez|post malone|travis scott|the weeknd|doja cat|lady gaga|katy perry|nicki minaj|maroon 5|imagine dragons|kevin hart|dave chappelle|nikki glaser|bill burr|jim jefferies|stephen curry|steph curry|patrick mahomes|josh allen|aaron judge|mike trout|giannis antetokounmpo|jayson tatum|joel embiid|connor mcdavid|naomi osaka|simone biles|conor mcgregor|khabib nurmagomedov|ronda rousey|amanda nunes|jon jones|daniel cormier|islam makhachev|charles oliveira|israel adesanya|alex pereira|valentina shevchenko|game of thrones|stranger things|the boys|bridgerton|outlander|breaking bad|the hunger games|divergent|colleen hoover|emily henry|taylor jenkins reid|avengers|the avengers|avengers: infinity war|avengers: endgame|thanos|black panther|captain marvel|wonder woman|deadpool|iron man|thor|captain america|justice league|marvel|dc|joker|inception|interstellar|the martian|gone girl|the girl on the train|jordan peele|greta gerwig|jennifer lawrence|emma stone|margot robbie|scarlett johansson|gal gadot|ryan gosling|chris evans|chris pratt|chris hemsworth|tom holland|timothée chalamet|zendaya|florence pugh|anya taylor-joy|brandon sanderson|fortnite|minecraft|among us|overwatch|league of legends|dota 2|the last of us|mrbeast|pewdiepie|logan paul|jake paul|charli d\'amelio|khaby lame|addison rae|bella poarch|tiktok|instagram|netflix|spotify|airbnb|doordash|uber eats|venmo|twitch|zoom|microsoft teams|tesla|iphone|android|smartwatch|voice assistants|wireless earbuds|podcasts|video podcasts|livestreams|gaming streamers|just chatting streamers|reaction content|short-form videos|creator drama|collab videos|uber|lyft|shark tank|dragons\' den|the masked singer|love is blind|love island|selling sunset|vanderpump rules|the kardashians|90 day fiancé|below deck|married at first sight|queer eye|squid game|money heist|the voice|call her daddy|smartless|crime junkie|morbid|mrballen podcast|rotten mango|the joe rogan experience|joe rogan experience|wtf with marc maron|the daily|hasan minhaj|trevor noah|john mulaney|nate bargatze|shane gillis|tom segura|theo von|ali wong|taylor tomlinson|kai cenat|ishowspeed|karaoke|modern influencer fame|the met gala|fantasy football',
  erasNow: 'caitlin clark|angel reese|victor wembanyama|cooper flagg|luka dončić|erling haaland|kylian mbappé|shohei ohtani|ronald acuña jr.|sabrina carpenter|olivia rodrigo|billie eilish|dua lipa|chappell roan|bad bunny|j balvin|ice spice|latto|sza|summer walker|morgan wallen|zach bryan|luke combs|playboi carti|sydney sweeney|glen powell|austin butler|barbie|oppenheimer|everything everywhere all at once|parasite|squid game|fourth wing|a court of thorns and roses|kai cenat|ishowspeed|valorant|elden ring|playstation 5|xbox series x|love is blind|taylor swift v travis kelce|travis kelce|good hang with amy poehler|pod save america|the megyn kelly show|the ben shapiro show|hbo max|apple music|fall guys|stardew valley|animal crossing|roblox|cheer',
  // Untagged old cards: timeless unless a word below appears in either side (checked in this order; first match wins).
  keywordEras: [
    ['now',   'voice assistants|video calls|dark mode|touchscreens|smartwatch'],
    ['2010s', 'streaming|algorithm|lyric videos|wireless earbuds|livestreams|gaming streamers|creator|reaction content|short-form|video podcasts|uber|lyft|binge|e-books|podcasts at|1.5x'],
    ['2000s', 'reality tv|mac|pc gaming|texting|music videos|mp3|ipod|console'],
    ['90s',   'pokémon|arcade|mixtape|disposable camera|flip phone|board game nights'],
  ],
};
