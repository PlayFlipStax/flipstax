# Master content batch (flipstax_full_content_master.md): dedupe against what's
# in flipstax.html, then add the rest to DAILY_PAIRS_RAW / INFINITY_PAIRS_RAW
# (alternating per section), with emoji for new names and CAT_META for new
# categories. Run with --plan to only print the plan.
import re, sys, json, unicodedata
p = '/Users/rickymartin/FlipStax/flipstax.html'; s = open(p).read()
def norm(x):
    x = unicodedata.normalize('NFKD', x).encode('ascii', 'ignore').decode().lower()
    x = re.sub(r"[^a-z0-9 ]", '', x).strip(); x = re.sub(r'^the ', '', x)
    return re.sub(r's\b', '', x).replace(' ', '')
def key(a, b): return '|'.join(sorted([norm(a), norm(b)]))
def unq(x): return x.encode().decode('unicode_escape').encode('utf-16', 'surrogatepass').decode('utf-16') if '\\u' in x else x.replace("\\'", "'")
existing = {}
for m in re.finditer(r"\[\s*'([a-z]+)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'", s):
    a, b = unq(m.group(2)), unq(m.group(3)); existing[key(a, b)] = (m.group(1), a, b)
W, P = 'who', 'pick'
# Close cousins of cards already in the game (different wording, same question) - skipped, reported
NEAR = {
    key('Fantasy', 'Sci-Fi'): 'Fantasy Novels vs Science Fiction Novels (books)',
    key('E-Readers', 'Paperbacks'): 'Physical Books vs E-Books (books)',
    key('Standalone Novels', 'Book Series'): 'Series vs Standalone Books (books)',
    key('Plot Twist Endings', 'Happy Endings'): 'Plot Twists vs Happy Endings (movies)',
    key('Libraries', 'Bookstores'): 'Bookstores vs Libraries (books)',
    key('Horror Movies', 'Comedy Movies'): 'Comedies vs Horror Movies (movies)',
    key('Joe Rogan', 'Marc Maron'): 'The Joe Rogan Experience vs WTF with Marc Maron (in Podcasts, this batch)',
    key('TikTok', 'Instagram Reels'): 'Instagram vs TikTok (brands)',
    key('Fries', 'Onion Rings'): 'French Fries vs Onion Rings (food)',
    key('Morning Workouts', 'Evening Workouts'): 'Morning Gym Session vs Night Gym Session (fitness)',
    key('CrossFit Games', 'Powerlifting Meets'): 'CrossFit vs Powerlifting (fitness)',
    key('Watching Live at the Stadium', 'Watching on TV'): 'Cheering from the Stands vs Watching on TV (sports)',
    key('Overtime Thrillers', 'Blowout Wins'): 'Overtime vs A Clean Finish (sports)',
    key('Underdog Stories', 'Dynasty Teams'): 'Underdogs vs Favorites (sports)',
}
B = [  # (category, a, b, kind, glyphA, glyphB, section)
  # BOOKS & AUTHORS -> books
  ('books','Stephen King','J.K. Rowling',W,'📚','⚡','Books & Authors'), ('books','The Shining','It',P,'🪓','🎈','Books & Authors'),
  ('books','Harry Potter','Lord of the Rings',P,'⚡','💍','Books & Authors'), ('books','Game of Thrones','The Wheel of Time',P,'🐉','🛞','Books & Authors'),
  ('books','Fantasy','Sci-Fi',P,'🧙','🚀','Books & Authors'), ('books','Agatha Christie','Gillian Flynn',W,'🕵️','🔪','Books & Authors'),
  ('books','Gone Girl','The Girl on the Train',P,'💔','🚆','Books & Authors'), ('books','Dune','Foundation',P,'🏜️','🌌','Books & Authors'),
  ('books','The Hunger Games','Divergent',P,'🏹','🔥','Books & Authors'), ('books','1984','Brave New World',P,'👁️','💊','Books & Authors'),
  ('books','To Kill a Mockingbird','The Catcher in the Rye',P,'🐦','🌾','Books & Authors'), ('books','Colleen Hoover','Taylor Jenkins Reid',W,'✍️','✍️','Books & Authors'),
  ('books','Brandon Sanderson','George R.R. Martin',W,'⚔️','🐺','Books & Authors'), ('books','Stephen King','Dean Koontz',W,'📚','🐕','Books & Authors'),
  ('books','Fourth Wing','A Court of Thorns and Roses',P,'🐲','🌹','Books & Authors'), ('books','Pride and Prejudice','Jane Eyre',P,'🎩','🕯️','Books & Authors'),
  ('books','The Great Gatsby','Of Mice and Men',P,'🥂','🐭','Books & Authors'), ('books','Agatha Christie','Arthur Conan Doyle',W,'🕵️','🔍','Books & Authors'),
  ('books','Audiobooks','Physical Books',P,'🎧','📖','Books & Authors'), ('books','E-Readers','Paperbacks',P,'📱','📖','Books & Authors'),
  ('books','Reading Before Bed','Reading at the Beach',P,'🛏️','🏖️','Books & Authors'), ('books','Standalone Novels','Book Series',P,'📕','📚','Books & Authors'),
  ('books','Plot Twist Endings','Happy Endings',P,'😱','😊','Books & Authors'), ('books','Rereading a Favorite','Always Something New',P,'🔁','🆕','Books & Authors'),
  ('books','Libraries','Bookstores',P,'🏛️','🛍️','Books & Authors'), ('books','Colleen Hoover','Emily Henry',W,'✍️','✍️','Books & Authors'),
  ('books','The Notebook','Titanic',P,'💌','🚢','Books & Authors'), ('books','When Harry Met Sally','Pretty Woman',P,'☕','👠','Books & Authors'),
  ('books','Bridgerton','Outlander',P,'👑','⏳','Books & Authors'), ('books','10 Things I Hate About You','13 Going on 30',P,'📝','🎂','Books & Authors'),
  # MOVIES, ACTORS & DIRECTORS -> movies
  ('movies','Brad Pitt','Tom Cruise',W,'🥊','✈️','Movies'), ('movies','Johnny Depp','Leonardo DiCaprio',W,'🏴‍☠️','🚢','Movies'),
  ('movies','Fight Club','Se7en',P,'🧼','📦','Movies'), ('movies','Inception','Shutter Island',P,'🌀','🏝️','Movies'),
  ('movies','Bridesmaids','Mean Girls',P,'💐','💅','Movies'), ('movies','Quentin Tarantino','Christopher Nolan',W,'🎞️','⏳','Movies'),
  ('movies','Steven Spielberg','George Lucas',W,'🦖','🌌','Movies'), ('movies','The Godfather','Goodfellas',P,'🤵','🍝','Movies'),
  ('movies','Pulp Fiction','Reservoir Dogs',P,'💼','🕶️','Movies'), ('movies','The Dark Knight','Joker',P,'🦇','🃏','Movies'),
  ('movies','Marvel','DC',P,'🦸','🦸','Movies'), ('movies','Denzel Washington','Samuel L. Jackson',W,'🎬','🐍','Movies'),
  ('movies','Meryl Streep','Viola Davis',W,'👠','🏆','Movies'), ('movies','Jennifer Lawrence','Emma Stone',W,'🏹','🎭','Movies'),
  ('movies','Will Smith','Dwayne Johnson',W,'👽','💪','Movies'), ('movies','Ryan Reynolds','Ryan Gosling',W,'🗡️','🚗','Movies'),
  ('movies','Margot Robbie','Scarlett Johansson',W,'💖','🕷️','Movies'), ('movies','Greta Gerwig','Sofia Coppola',W,'🎀','🗾','Movies'),
  ('movies','Jordan Peele','M. Night Shyamalan',W,'🫖','👻','Movies'), ('movies','Barbie','Oppenheimer',P,'🎀','💣','Movies'),
  ('movies','La La Land','Whiplash',P,'🎹','🥁','Movies'), ('movies','Avengers: Endgame','Avengers: Infinity War',P,'🛡️','💎','Movies'),
  ('movies','Interstellar','The Martian',P,'🪐','🥔','Movies'), ('movies','Parasite','Everything Everywhere All at Once',P,'🪨','🥯','Movies'),
  ('movies','Horror Movies','Comedy Movies',P,'👻','😂','Movies'),
  # COMEDIANS -> comedy (new: there was no comedy category to add to)
  ('comedy','Dave Chappelle','Shane Gillis',W,'🎤','🎤','Comedy'), ('comedy','Mark Normand','Joe List',W,'🎤','🎤','Comedy'),
  ('comedy','Joe Rogan','Marc Maron',W,'🎙️','🎸','Comedy'), ('comedy','George Carlin','Richard Pryor',W,'🎤','🎤','Comedy'),
  ('comedy','Bill Burr','Jim Gaffigan',W,'🎤','🎤','Comedy'), ('comedy','Kevin Hart','Chris Rock',W,'🎤','🎤','Comedy'),
  ('comedy','Nikki Glaser','Taylor Tomlinson',W,'🎤','🎤','Comedy'), ('comedy','Sebastian Maniscalco','Jim Jefferies',W,'🎤','🎤','Comedy'),
  ('comedy','Tom Segura','Theo Von',W,'🎤','🎤','Comedy'), ('comedy','Hasan Minhaj','Trevor Noah',W,'🎤','🎤','Comedy'),
  ('comedy','John Mulaney','Nate Bargatze',W,'🎤','🎤','Comedy'), ('comedy','Amy Schumer','Ali Wong',W,'🎤','🎤','Comedy'),
  ('comedy','Eddie Murphy','Robin Williams',W,'🎤','🎤','Comedy'), ('comedy','Stand-Up Specials','Comedy Movies',P,'🎤','🍿','Comedy'),
  ('comedy','Dark Humor','Clean Comedy',P,'🖤','😇','Comedy'),
  # PODCASTS (new)
  ('podcasts','The Joe Rogan Experience','WTF with Marc Maron',P,'🎙️','🎸','Podcasts'), ('podcasts','Crime Junkie','Morbid',P,'🔍','💀','Podcasts'),
  ('podcasts','Call Her Daddy','SmartLess',P,'💋','🤓','Podcasts'), ('podcasts','The Daily','Pod Save America',P,'📰','🗳️','Podcasts'),
  ('podcasts','Dateline NBC','MrBallen Podcast',P,'🕵️','🔦','Podcasts'), ('podcasts','Rotten Mango','Crime Junkie',P,'🥭','🔍','Podcasts'),
  ('podcasts','Good Hang with Amy Poehler','SmartLess',P,'🛋️','🤓','Podcasts'), ('podcasts','The Herd with Colin Cowherd','Sports Talk Radio',P,'🐄','📻','Podcasts'),
  ('podcasts','The Megyn Kelly Show','The Ben Shapiro Show',P,'🎙️','🎙️','Podcasts'), ('podcasts','True Crime Podcasts','Comedy Podcasts',P,'🔍','😂','Podcasts'),
  ('podcasts','Video Podcasts','Audio-Only Podcasts',P,'📹','🎧','Podcasts'), ('podcasts','Solo Hosts','Co-Host Duos',P,'🙋','👯','Podcasts'),
  ('podcasts','Listening at 1x Speed','Listening at 1.5x or 2x',P,'🐢','⏩','Podcasts'), ('podcasts','Podcasts While Driving','Podcasts While Working Out',P,'🚗','🏋️','Podcasts'),
  ('podcasts','New Episode Day','Binging the Back Catalog',P,'📅','📚','Podcasts'),
  # YOUTUBE / STREAMING / TIKTOK (new)
  ('creators','MrBeast','Kai Cenat',W,'💰','📺','YouTube & TikTok'), ('creators','Kai Cenat','IShowSpeed',W,'📺','⚡','YouTube & TikTok'),
  ('creators','Logan Paul','Jake Paul',W,'🥤','🥊','YouTube & TikTok'), ('creators','PewDiePie','MrBeast',W,'👊','💰','YouTube & TikTok'),
  ('creators','Khaby Lame','Charli D’Amelio',W,'🤷','💃','YouTube & TikTok'), ('creators','Addison Rae','Bella Poarch',W,'💄','🎶','YouTube & TikTok'),
  ('creators','Twitch','YouTube',P,'🎮','▶️','YouTube & TikTok'), ('creators','Livestreams','Edited Videos',P,'🔴','✂️','YouTube & TikTok'),
  ('creators','Reaction Content','Original Content',P,'😮','💡','YouTube & TikTok'), ('creators','Gaming Streamers','Just Chatting Streamers',P,'🎮','💬','YouTube & TikTok'),
  ('creators','TikTok','Instagram Reels',P,'🎵','🎞️','YouTube & TikTok'), ('creators','Long-Form YouTube','Short-Form Videos',P,'🎬','📱','YouTube & TikTok'),
  ('creators','Collab Videos','Solo Videos',P,'🤝','🙋','YouTube & TikTok'), ('creators','Subscribing','Just Watching',P,'🔔','👀','YouTube & TikTok'),
  ('creators','Creator Drama','Creator Philanthropy',P,'🍿','💝','YouTube & TikTok'),
  # REAL FOOD DISHES -> food
  ('food','Lasagna','Chicken Parm',P,'🍝','🍗','Food'), ('food','Boneless Wings','Bone-In Wings',P,'🍗','🍖','Food'),
  ('food','Reuben','Turkey Club',P,'🥪','🦃','Food'), ('food','Cookie Dough Ice Cream','Chocolate Ice Cream',P,'🍪','🍫','Food'),
  ('food','Deep Dish Pizza','Thin Crust Pizza',P,'🥧','🍕','Food'), ('food','Mac and Cheese','Grilled Cheese',P,'🧀','🥪','Food'),
  ('food','Buffalo Wings','BBQ Wings',P,'🌶️','🍖','Food'), ('food','Tacos','Burritos',P,'🌮','🌯','Food'),
  ('food','Pancakes','Waffles',P,'🥞','🧇','Food'), ('food','Burgers','Hot Dogs',P,'🍔','🌭','Food'),
  ('food','Fries','Onion Rings',P,'🍟','🧅','Food'), ('food','Caesar Salad','Greek Salad',P,'🥗','🫒','Food'),
  ('food','Pad Thai','Lo Mein',P,'🍜','🥡','Food'), ('food','Sushi','Poke Bowls',P,'🍣','🐟','Food'),
  ('food','Chili','Chowder',P,'🌶️','🥣','Food'), ('food','Apple Pie','Pumpkin Pie',P,'🍎','🎃','Food'),
  ('food','Cheesecake','Tiramisu',P,'🍰','☕','Food'), ('food','Garlic Bread','Breadsticks',P,'🧄','🥖','Food'),
  ('food','Spaghetti and Meatballs','Fettuccine Alfredo',P,'🍝','🧈','Food'), ('food','Nachos','Loaded Fries',P,'🌶️','🍟','Food'),
  ('food','Egg Rolls','Dumplings',P,'🌯','🥟','Food'), ('food','Ranch','Blue Cheese',P,'🥗','🧀','Food'),
  ('food','Milkshakes','Smoothies',P,'🥤','🥤','Food'), ('food','Iced Coffee','Hot Coffee',P,'🧊','☕','Food'),
  ('food','Bacon','Sausage',P,'🥓','🌭','Food'),
  # EXERCISE & FITNESS -> fitness
  ('fitness','Overhead Press','Romanian Deadlifts',P,'🙌','🏋️','Exercise & Fitness'), ('fitness','CrossFit','Strength Training',P,'🔥','💪','Exercise & Fitness'),
  ('fitness','Swimming Laps','Cycling',P,'🏊','🚴','Exercise & Fitness'), ('fitness','Squats','Lunges',P,'🦵','🚶','Exercise & Fitness'),
  ('fitness','Running Outside','The Treadmill',P,'🌳','🏃','Exercise & Fitness'), ('fitness','Morning Workouts','Evening Workouts',P,'🌅','🌙','Exercise & Fitness'),
  ('fitness','Free Weights','Machines',P,'🏋️','⚙️','Exercise & Fitness'), ('fitness','Yoga','Pilates',P,'🧘','🤸','Exercise & Fitness'),
  ('fitness','HIIT','Steady-State Cardio',P,'⏱️','❤️','Exercise & Fitness'), ('fitness','Deadlifts','Squats',P,'🏋️','🦵','Exercise & Fitness'),
  ('fitness','Bench Press','Push-Ups',P,'🏋️','💪','Exercise & Fitness'), ('fitness','Pull-Ups','Lat Pulldowns',P,'💪','⬇️','Exercise & Fitness'),
  ('fitness','Gym Workouts','Home Workouts',P,'🏋️','🏠','Exercise & Fitness'), ('fitness','Rest Day','Active Recovery',P,'😴','🚶','Exercise & Fitness'),
  ('fitness','Protein Shakes','Whole Food Meals',P,'🥤','🍽️','Exercise & Fitness'), ('fitness','Working Out Alone','Working Out with a Partner',P,'🎧','👯','Exercise & Fitness'),
  ('fitness','Marathon Training','Sprint Training',P,'🏃','⚡','Exercise & Fitness'), ('fitness','Rock Climbing','Hiking',P,'🧗','🥾','Exercise & Fitness'),
  ('fitness','Boxing','Martial Arts',P,'🥊','🥋','Exercise & Fitness'), ('fitness','CrossFit Games','Powerlifting Meets',P,'🏆','🏋️','Exercise & Fitness'),
  # SPORTS - TEAMS
  ('sports','Lakers','Celtics',W,'💜','☘️','Sports Teams'), ('sports','Warriors','Celtics',W,'🌉','☘️','Sports Teams'),
  ('sports','Lakers','Warriors',W,'💜','🌉','Sports Teams'), ('sports','Knicks','Nets',W,'🗽','🏀','Sports Teams'),
  ('sports','Patriots','Chiefs',W,'🏈','🏹','Sports Teams'), ('sports','Cowboys','Eagles',W,'🤠','🦅','Sports Teams'),
  ('sports','Packers','Bears',W,'🧀','🐻','Sports Teams'), ('sports','Chiefs','Bills',W,'🏹','🦬','Sports Teams'),
  ('sports','Steelers','Ravens',W,'🏈','🏈','Sports Teams'),
  ('sports','Red Sox','Yankees',W,'🧦','⚾','Sports Teams'), ('sports','Dodgers','Giants',W,'⚾','⚾','Sports Teams'),
  ('sports','Yankees','Mets',W,'⚾','🍎','Sports Teams'), ('sports','Cubs','Cardinals',W,'🧸','🐦','Sports Teams'),
  ('sports','Bruins','Canadiens',W,'🏒','🍁','Sports Teams'), ('sports','Penguins','Capitals',W,'🐧','🏛️','Sports Teams'),
  ('sports','Rangers','Islanders',W,'🏒','🏝️','Sports Teams'),
  ('sports','Real Madrid','Barcelona',W,'👑','⚽','Sports Teams'), ('sports','Manchester United','Liverpool',W,'😈','🔴','Sports Teams'),
  ('sports','Arsenal','Tottenham',W,'💥','🐓','Sports Teams'),
  ('sports','Duke','UNC',W,'🔵','🐏','Sports Teams'), ('sports','Michigan','Ohio State',W,'〽️','🌰','Sports Teams'),
  ('sports','Alabama','Auburn',W,'🐘','🐯','Sports Teams'),
  # SPORTS - PLAYERS (cross-era welcome)
  ('sports','LeBron James','Michael Jordan',W,'🏀','🏀','Sports Players'), ('sports','Kevin Durant','Giannis Antetokounmpo',W,'🏀','🏀','Sports Players'),
  ('sports','Luka Dončić','Jayson Tatum',W,'🏀','☘️','Sports Players'), ('sports','Magic Johnson','Larry Bird',W,'🏀','☘️','Sports Players'),
  ('sports','Patrick Mahomes','Josh Allen',W,'🏈','🏈','Sports Players'), ('sports','Aaron Rodgers','Peyton Manning',W,'🏈','🏈','Sports Players'),
  ('sports','Jerry Rice','Randy Moss',W,'🏈','🏈','Sports Players'), ('sports','Lawrence Taylor','J.J. Watt',W,'🏈','🏈','Sports Players'),
  ('sports','Aaron Judge','Shohei Ohtani',W,'⚾','⚾','Sports Players'), ('sports','Derek Jeter','Alex Rodriguez',W,'⚾','⚾','Sports Players'),
  ('sports','Babe Ruth','Hank Aaron',W,'⚾','⚾','Sports Players'), ('sports','Mike Trout','Ronald Acuña Jr.',W,'⚾','⚾','Sports Players'),
  ('sports','Connor McDavid','Sidney Crosby',W,'🏒','🏒','Sports Players'), ('sports','Wayne Gretzky','Mario Lemieux',W,'🏒','🏒','Sports Players'),
  ('sports','Alexander Ovechkin','Sidney Crosby',W,'🏒','🏒','Sports Players'),
  ('sports','Tiger Woods','Jack Nicklaus',W,'⛳','⛳','Sports Players'), ('sports','Tiger Woods','Rory McIlroy',W,'⛳','⛳','Sports Players'),
  ('sports','Serena Williams','Venus Williams',W,'🎾','🎾','Sports Players'), ('sports','Roger Federer','Rafael Nadal',W,'🎾','🎾','Sports Players'),
  ('sports','Novak Djokovic','Roger Federer',W,'🎾','🎾','Sports Players'),
  ('sports','Kylian Mbappé','Erling Haaland',W,'⚽','⚽','Sports Players'), ('sports','Pelé','Diego Maradona',W,'⚽','⚽','Sports Players'),
  ('sports','Muhammad Ali','Mike Tyson',W,'🥊','🥊','Sports Players'),
  # MMA (all came in with the earlier small batch)
  ('sports','Jon Jones','Daniel Cormier',W,'🥊','🥊','MMA'), ('sports','Israel Adesanya','Alex Pereira',W,'🥊','🥊','MMA'),
  ('sports','Khabib Nurmagomedov','Georges St-Pierre',W,'🥊','🥊','MMA'), ('sports','Conor McGregor','Nate Diaz',W,'🥊','🥊','MMA'),
  ('sports','Anderson Silva','Georges St-Pierre',W,'🥊','🥊','MMA'), ('sports','Islam Makhachev','Charles Oliveira',W,'🥊','🥊','MMA'),
  ('sports','Ronda Rousey','Amanda Nunes',W,'🥊','🥊','MMA'), ('sports','Amanda Nunes','Valentina Shevchenko',W,'🥊','🥊','MMA'),
  ('sports','UFC','Boxing',P,'🤼','🥊','MMA'), ('sports','Submission Win','Knockout Win',P,'🔒','💥','MMA'),
  ('sports','The Cage','The Ring',P,'🏟️','⭕','MMA'), ('sports','Strikers','Grapplers',P,'👊','🤼','MMA'),
  # GENERAL SPORTS PREFERENCES
  ('sports','Football Sundays','March Madness',P,'🏈','🏀','Sports Preferences'), ('sports','Fantasy Football','Fantasy Baseball',P,'📋','⚾','Sports Preferences'),
  ('sports','Watching Live at the Stadium','Watching on TV',P,'🏟️','📺','Sports Preferences'), ('sports','Overtime Thrillers','Blowout Wins',P,'⏱️','💥','Sports Preferences'),
  ('sports','Home Jerseys','Away Jerseys',P,'🏠','✈️','Sports Preferences'), ('sports','Playing Sports','Watching Sports',P,'⚽','📺','Sports Preferences'),
  ('sports','Underdog Stories','Dynasty Teams',P,'🐶','👑','Sports Preferences'),
]
# Music / Reality TV / Celebrity sections of the master file: every one is already in (small batch + earlier content)
MASTER_ONLY_CHECK = [('music','Taylor Swift','Beyoncé'),('music','Ariana Grande','Billie Eilish'),('music','Katy Perry','Rihanna'),('music','Lady Gaga','Madonna'),
  ('music','Olivia Rodrigo','Sabrina Carpenter'),('music','Dua Lipa','Doja Cat'),('music','Foo Fighters','Red Hot Chili Peppers'),('music','Led Zeppelin','Pink Floyd'),
  ('music','Nirvana','Pearl Jam'),('music',"Guns N' Roses",'Metallica'),('music','Queen','The Rolling Stones'),('music','Drake','Kendrick Lamar'),('music','Jay-Z','Nas'),
  ('music','Eminem','50 Cent'),('music','Kanye West','Travis Scott'),('music','Cardi B','Nicki Minaj'),('music','Morgan Wallen','Luke Combs'),
  ('music','Carrie Underwood','Miranda Lambert'),('music','Johnny Cash','Willie Nelson'),('music','Dolly Parton','Reba McEntire'),('music','Chris Stapleton','Zach Bryan'),
  ('music','Concert','Music Festival'),('music','Vinyl','Streaming'),('music','Old favorite on repeat','Finding something new'),('music','Sing-along song','Headphones-only song'),
  ('realitytv','The Bachelor','Love Island'),('realitytv','Real Housewives','Below Deck'),('realitytv','Big Brother','Survivor'),('realitytv',"RuPaul's Drag Race",'Project Runway'),
  ('realitytv','The Kardashians','Vanderpump Rules'),('realitytv','Love Is Blind','Married at First Sight'),('realitytv','Jersey Shore','Teen Mom'),('realitytv','90 Day Fiancé','Love Is Blind'),
  ('realitytv','The Amazing Race','Survivor'),('realitytv','Dance Moms','Cheer'),('realitytv','Shark Tank',"Dragon's Den"),('realitytv','Catfish','Say Yes to the Dress'),
  ('realitytv','The Masked Singer','American Idol'),('realitytv','The Voice','American Idol'),('realitytv','Dancing with the Stars','So You Think You Can Dance'),
  ('realitytv','Top Chef','MasterChef'),('realitytv','Queer Eye','Fixer Upper'),('realitytv','Below Deck','The Bachelor'),('realitytv',"Hell's Kitchen",'Top Chef'),
  ('realitytv','Naked and Afraid','Survivor'),('realitytv','Vanderpump Rules','Selling Sunset'),
  ('celebrity','Kim Kardashian','Paris Hilton'),('celebrity','Celebrity gossip podcast','True crime podcast'),('celebrity','Red carpet fashion','Street style')]
skipped, near, add, seen = [], [], [], set()
for row in B:
    c, a, b, k, ga, gb, sec = row; kk = key(a, b)
    if kk in existing: skipped.append((sec, a, b, existing[kk])); continue
    if kk in NEAR: near.append((sec, a, b, NEAR[kk])); continue
    if kk in seen: print('DUP IN BATCH', a, b); continue
    seen.add(kk); add.append(row)
missing = [r for r in MASTER_ONLY_CHECK if key(r[1], r[2]) not in existing]
print('rows:', len(B), '| already in:', len(skipped), '| close cousins skipped:', len(near), '| adding:', len(add), '| music/reality/celebrity not yet in:', missing)
for x in near: print('  NEAR', x[0], '-', x[1], 'vs', x[2], ' ~', x[3])
for x in skipped: print('  HAS ', x[0], '-', x[1], 'vs', x[2], ' =', x[3][0], ':', x[3][1], 'vs', x[3][2])
from collections import Counter
print('adding by category:', dict(Counter(r[0] for r in add)))
if '--plan' in sys.argv: sys.exit()
q = lambda x: "'" + x.replace("\\", "\\\\").replace("'", "\\'") + "'"
daily, inf = [], []; by_sec = {}
for row in add: by_sec.setdefault(row[6], []).append(row)
for sec, rows in by_sec.items():
    for i, (c, a, b, k, ga, gb, _) in enumerate(rows):
        (daily if i % 2 == 0 else inf).append((sec, "    [%s, %s, %s, %s]," % (q(c), q(a), q(b), q(k))))
def block_lines(rows):
    out, last = [], None
    for sec, line in rows:
        if sec != last: out.append('    // %s (Oct 2026 master batch)' % sec); last = sec
        out.append(line)
    return '\n'.join(out)
for name, rows in (('DAILY_PAIRS_RAW', daily), ('INFINITY_PAIRS_RAW', inf)):
    i = s.index('const %s = [' % name); j = s.index('\n  ];', i)
    s = s[:j] + '\n' + block_lines(rows) + s[j:]
i = s.index('const ITEM_GLYPHS = {'); j = s.index('\n  };', i)
known = { unq(k) for k in re.findall(r"'((?:[^'\\]|\\.)*)'\s*:", s[i:j]) }
new = {}
for c, a, b, k, ga, gb, _ in add:
    for n, g in ((a, ga), (b, gb)):
        if n not in known and n not in new: new[n] = g
body = s[i:j].rstrip(); sep = '' if body.endswith(',') else ','
items = ', '.join('%s:%s' % (q(n), q(g)) for n, g in new.items())
s = s[:i] + body + sep + '\n    // Oct 2026 master batch\n    ' + items + s[j:]
old = "    celebrity: { label:'Celebrity', badge:'\\uD83D\\uDCF8 Pop Culture Pro' },\n  };"
assert s.count(old) == 1
s = s.replace(old, "    celebrity: { label:'Celebrity', badge:'\\uD83D\\uDCF8 Pop Culture Pro' },\n"
  "    comedy: { label:'Comedy', badge:'\\uD83D\\uDE02 Class Clown' },\n"
  "    podcasts: { label:'Podcasts', badge:'\\uD83C\\uDF99\\uFE0F Pod Squad' },\n"
  "    creators: { label:'YouTube & TikTok', badge:'\\uD83D\\uDCF1 Chronically Online' },\n  };")
for a, b in (("books: { label:'Books',", "books: { label:'Books & Authors',"), ("fitness:{ label:'Fitness',", "fitness:{ label:'Exercise & Fitness',")):
    assert s.count(a) == 1; s = s.replace(a, b)
open(p, 'w').write(s)
print('daily +', len(daily), '| infinity +', len(inf), '| new emoji names', len(new))
