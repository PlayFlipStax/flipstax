// FlipStax - Peak or Plunge (higher or lower) items.
//
// Each round shows one thing with its number; the next thing's number is hidden and the player taps HIGHER or LOWER.
// Items are only ever compared within their own `cat` (heights with heights, years with years, counts with counts).
// Every number is a well-documented figure; the source is in the comment on each line (Wikipedia unless noted).
// No real brand names (DIRECTION.md). `text` reads after the name: "Eiffel Tower: 330 m tall".
window.FLIPSTAX_PEAK_OR_PLUNGE = [
  // ---- heights, in metres ----
  { cat:'height', glyph:'🗼', name:'Eiffel Tower', value:330, text:'m tall' },                       // "Eiffel Tower": 330 m to the tip (antenna added 2022)
  { cat:'height', glyph:'🗽', name:'Statue of Liberty (ground to torch)', value:93, text:'m tall' }, // "Statue of Liberty": 93 m / 305 ft, ground to torch (also US National Park Service)
  { cat:'height', glyph:'🏙️', name:'Burj Khalifa', value:828, text:'m tall' },                       // "Burj Khalifa": 828 m
  { cat:'height', glyph:'🏢', name:'Empire State Building (roof)', value:381, text:'m tall' },       // "Empire State Building": roof 381 m (443 m to the antenna tip)
  { cat:'height', glyph:'🕰️', name:'Big Ben’s tower', value:96, text:'m tall' },               // "Elizabeth Tower": 96 m / 316 ft
  { cat:'height', glyph:'🏛️', name:'Leaning Tower of Pisa', value:56, text:'m tall' },               // "Leaning Tower of Pisa": 55.86 m (low side) to 56.67 m (high side)
  { cat:'height', glyph:'🔺', name:'Great Pyramid of Giza (today)', value:139, text:'m tall' },      // "Great Pyramid of Giza": 138.5 m today (146.6 m originally)
  { cat:'height', glyph:'🏙️', name:'Taipei 101', value:508, text:'m tall' },                         // "Taipei 101": 508 m
  { cat:'height', glyph:'📡', name:'CN Tower in Toronto', value:553, text:'m tall' },                // "CN Tower": 553.3 m
  { cat:'height', glyph:'🛸', name:'Seattle’s Space Needle', value:184, text:'m tall' },        // "Space Needle": 184 m / 605 ft
  { cat:'height', glyph:'🎭', name:'Sydney Opera House (top shell)', value:65, text:'m tall' },      // "Sydney Opera House": 65 m high
  { cat:'height', glyph:'🙌', name:'Christ the Redeemer statue (without its pedestal)', value:30, text:'m tall' }, // "Christ the Redeemer (statue)": 30 m statue, 8 m pedestal
  { cat:'height', glyph:'🌉', name:'Golden Gate Bridge towers (above the water)', value:227, text:'m tall' },     // "Golden Gate Bridge": towers 227 m / 746 ft above the water
  { cat:'height', glyph:'🏙️', name:'Shanghai Tower', value:632, text:'m tall' },                     // "Shanghai Tower": 632 m
  { cat:'height', glyph:'🏢', name:'Petronas Towers', value:452, text:'m tall' },                    // "Petronas Towers": 451.9 m
  { cat:'height', glyph:'🌈', name:'Gateway Arch in St. Louis', value:192, text:'m tall' },          // "Gateway Arch": 192 m / 630 ft
  { cat:'height', glyph:'🏔️', name:'Mount Everest', value:8849, text:'m high' },                    // "Mount Everest": 8,848.86 m (2020 China-Nepal survey)
  { cat:'height', glyph:'⛰️', name:'K2', value:8611, text:'m high' },                               // "K2": 8,611 m
  { cat:'height', glyph:'🌋', name:'Mount Kilimanjaro', value:5895, text:'m high' },                // "Mount Kilimanjaro": 5,895 m
  { cat:'height', glyph:'🗻', name:'Mount Fuji', value:3776, text:'m high' },                       // "Mount Fuji": 3,776.24 m
  { cat:'height', glyph:'🏔️', name:'Denali in Alaska', value:6190, text:'m high' },                 // "Denali": 6,190 m (2015 survey, 20,310 ft)
  { cat:'height', glyph:'⛰️', name:'The Matterhorn', value:4478, text:'m high' },                   // "Matterhorn": 4,478 m
  { cat:'height', glyph:'🏔️', name:'Aconcagua', value:6961, text:'m high' },                        // "Aconcagua": 6,961 m
  { cat:'height', glyph:'⛰️', name:'Mount Kosciuszko, Australia’s highest', value:2228, text:'m high' }, // "Mount Kosciuszko": 2,228 m
  { cat:'height', glyph:'💧', name:'Angel Falls (total drop)', value:979, text:'m tall' },           // "Angel Falls": 979 m total height

  // ---- years ----
  { cat:'year', glyph:'🌕', name:'First people walk on the Moon', value:1969, text:'' },             // "Apollo 11": landed 20 July 1969
  { cat:'year', glyph:'🚢', name:'The Titanic sinks', value:1912, text:'' },                         // "Titanic": sank 15 April 1912
  { cat:'year', glyph:'🗼', name:'The Eiffel Tower is finished', value:1889, text:'' },              // "Eiffel Tower": completed 1889
  { cat:'year', glyph:'🧱', name:'The Berlin Wall falls', value:1989, text:'' },                     // "Fall of the Berlin Wall": 9 November 1989
  { cat:'year', glyph:'✈️', name:'The first powered airplane flight', value:1903, text:'' },         // "Wright Flyer": 17 December 1903
  { cat:'year', glyph:'🌐', name:'The first website goes live', value:1991, text:'' },               // "History of the World Wide Web": first website online August 1991
  { cat:'year', glyph:'📧', name:'The first email between computers', value:1971, text:'' },         // "Email" / "Ray Tomlinson": first networked email 1971
  { cat:'year', glyph:'☎️', name:'The telephone is patented', value:1876, text:'' },                // "Invention of the telephone": Bell's US patent, March 1876
  { cat:'year', glyph:'🏅', name:'The first modern Olympic Games', value:1896, text:'' },            // "1896 Summer Olympics": Athens 1896
  { cat:'year', glyph:'🚢', name:'The Panama Canal opens', value:1914, text:'' },                    // "Panama Canal": opened 15 August 1914
  { cat:'year', glyph:'🌉', name:'The Golden Gate Bridge opens', value:1937, text:'' },              // "Golden Gate Bridge": opened 27 May 1937
  { cat:'year', glyph:'🏔️', name:'Mount Everest is first climbed', value:1953, text:'' },           // "Mount Everest": first ascent 29 May 1953
  { cat:'year', glyph:'🚀', name:'The first person goes to space', value:1961, text:'' },            // "Yuri Gagarin": Vostok 1, 12 April 1961
  { cat:'year', glyph:'🔭', name:'The Hubble telescope is launched', value:1990, text:'' },          // "Hubble Space Telescope": launched 24 April 1990
  { cat:'year', glyph:'🔥', name:'The Great Fire of London', value:1666, text:'' },                 // "Great Fire of London": September 1666
  { cat:'year', glyph:'🗽', name:'The Statue of Liberty is dedicated', value:1886, text:'' },        // "Statue of Liberty": dedicated 28 October 1886
  { cat:'year', glyph:'⚽', name:'The first football World Cup', value:1930, text:'' },              // "1930 FIFA World Cup": Uruguay 1930
  { cat:'year', glyph:'🎭', name:'The Sydney Opera House opens', value:1973, text:'' },              // "Sydney Opera House": opened 20 October 1973
  { cat:'year', glyph:'🚄', name:'The tunnel under the English Channel opens', value:1994, text:'' },// "Channel Tunnel": opened 6 May 1994
  { cat:'year', glyph:'🖼️', name:'The Mona Lisa is stolen from the Louvre', value:1911, text:'' },   // "Mona Lisa": stolen 21 August 1911 (found 1913)
  { cat:'year', glyph:'💡', name:'Edison’s long-lasting light bulb test', value:1879, text:'' },// "Incandescent light bulb": Edison's successful test, October 1879

  // ---- counts ----
  { cat:'count', glyph:'🦴', name:'Bones in an adult human', value:206, text:'' },                   // "Human skeleton": 206 bones in a typical adult
  { cat:'count', glyph:'🎹', name:'Keys on a standard piano', value:88, text:'' },                   // "Piano": 88 keys
  { cat:'count', glyph:'♟️', name:'Squares on a chessboard', value:64, text:'' },                    // "Chessboard": 8 x 8 = 64
  { cat:'count', glyph:'🌍', name:'Member countries of the United Nations', value:193, text:'' },    // "Member states of the United Nations": 193
  { cat:'count', glyph:'🦷', name:'Teeth in a full adult set', value:32, text:'' },                  // "Human tooth": 32 permanent teeth
  { cat:'count', glyph:'🐙', name:'Hearts in an octopus', value:3, text:'' },                        // "Octopus": three hearts
  { cat:'count', glyph:'🎸', name:'Strings on a standard guitar', value:6, text:'' },               // "Guitar": six strings (standard)
  { cat:'count', glyph:'🎲', name:'Dots on one six-sided die, added up', value:21, text:'' },        // 1+2+3+4+5+6 = 21
  { cat:'count', glyph:'⭕', name:'Rings on the Olympic flag', value:5, text:'' },                    // "Olympic symbols": five rings
  { cat:'count', glyph:'⚽', name:'Players per side on a football pitch', value:11, text:'' },       // "Association football": 11 players per team on the field
  { cat:'count', glyph:'🔴', name:'Days in one year on Mars', value:687, text:'' },                  // "Mars": orbital period 687 Earth days
  { cat:'count', glyph:'🃏', name:'Cards in a standard deck (no jokers)', value:52, text:'' },       // "Standard 52-card deck"
  { cat:'count', glyph:'🕷️', name:'Legs on a spider', value:8, text:'' },                           // "Spider": eight legs
  { cat:'count', glyph:'🦞', name:'Legs on a lobster (claws included)', value:10, text:'' },         // "Lobster": ten legs, the front pair being the claws (decapods)
  { cat:'count', glyph:'🐝', name:'Eyes on a honeybee', value:5, text:'' },                          // "Western honey bee": two compound eyes and three ocelli
  { cat:'count', glyph:'🎼', name:'Symphonies Beethoven finished', value:9, text:'' },               // "Ludwig van Beethoven": nine symphonies
  { cat:'count', glyph:'🪐', name:'Planets in our solar system', value:8, text:'' },                 // "Solar System": eight planets (IAU 2006)
  { cat:'count', glyph:'🕛', name:'Time zones across Russia', value:11, text:'' },                   // "Time in Russia": 11 time zones
  { cat:'count', glyph:'🁫', name:'Tiles in a double-six domino set', value:28, text:'' },            // "Dominoes": a double-six set has 28 tiles
  { cat:'count', glyph:'⏰', name:'Minutes in one day', value:1440, text:'' },                       // 24 x 60 = 1,440
  { cat:'count', glyph:'⛳', name:'Holes on a full golf course', value:18, text:'' },                // "Golf course": 18 holes
  { cat:'count', glyph:'🛑', name:'Sides on a stop sign', value:8, text:'' },                        // "Stop sign": octagon (Vienna Convention / US MUTCD)
  { cat:'count', glyph:'🦈', name:'Bones in a shark', value:0, text:'' },                            // "Shark": skeleton made of cartilage, no bones
  { cat:'count', glyph:'🎻', name:'Strings on a violin', value:4, text:'' },                         // "Violin": four strings
  { cat:'count', glyph:'📅', name:'Days in a leap year', value:366, text:'' },                       // "Leap year": 366 days
  { cat:'count', glyph:'🗓️', name:'Hours in one week', value:168, text:'' },                        // 7 x 24 = 168
];
