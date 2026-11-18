# FlipStax - writes the STAGE LIFE block at the end of lib/stage.css (between STAGE LIFE:BEGIN / STAGE LIFE:END).
# The show's set as an open deck in orbit: deep layered space (nebula, a planet rising behind the deck, a moon, small planets,
# a drifting starfield, the turning galaxy and the gliding ringed planet), two pairs of neon pylons, searchlights, and a glass
# dance floor whose tiles light up in colour sequences with a light wave rolling under them. It sits over the STUDIO block
# (tools/build-studio-css.py), which it overrides; the elements it needs (.stg-floor, .sf-*, .stg-pulse) are made by lib/stage.js.
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-stage-life.ps1
$ErrorActionPreference = 'Stop'
$IC = [Globalization.CultureInfo]::InvariantCulture
function F([double]$x) { return $x.ToString('0.##', $IC) }
function Enc([string]$svg) { return ($svg -replace "`r?`n", '' -replace '%', '%25' -replace '#', '%23' -replace '<', '%3C' -replace '>', '%3E' -replace '"', "'") }
function Url([string]$svg) { return 'url("data:image/svg+xml,' + (Enc $svg) + '")' }
$rng = New-Object System.Random 20261116
function Rnd([double]$a, [double]$b) { return $a + $rng.NextDouble() * ($b - $a) }

# ---------------------------------------------------------------- the sky (shot background, 390 x 844 plate, static)
$sky = New-Object Text.StringBuilder
[void]$sky.Append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 844' preserveAspectRatio='none'><defs>")
[void]$sky.Append("<linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#04021c'/><stop offset='.36' stop-color='#0b0532'/><stop offset='.6' stop-color='#1a0a4e'/><stop offset='.73' stop-color='#33106e'/></linearGradient>")
foreach ($g in @(@('m','#ff4fd8'), @('v','#9a5cff'), @('t','#2ad8d0'), @('i','#5a3aff'), @('o','#ff8a5c'))) {
  [void]$sky.Append("<radialGradient id='$($g[0])'><stop offset='0' stop-color='$($g[1])' stop-opacity='1'/><stop offset='.45' stop-color='$($g[1])' stop-opacity='.45'/><stop offset='1' stop-color='$($g[1])' stop-opacity='0'/></radialGradient>") }
# the planet rising behind the deck: mostly its night side, lit on the upper right edge, banded, a teal atmosphere
[void]$sky.Append("<radialGradient id='P' cx='.8' cy='.04' r='1'><stop offset='0' stop-color='#8ff0ff'/><stop offset='.07' stop-color='#4a6aef'/><stop offset='.2' stop-color='#4a26a0'/><stop offset='.45' stop-color='#200c56'/><stop offset='1' stop-color='#0a0428'/></radialGradient>")
[void]$sky.Append("<radialGradient id='A'><stop offset='.88' stop-color='#5ff4ff' stop-opacity='0'/><stop offset='.94' stop-color='#7ad8ff' stop-opacity='.5'/><stop offset='1' stop-color='#ff4fd8' stop-opacity='0'/></radialGradient>")
[void]$sky.Append("<radialGradient id='M' cx='.35' cy='.3' r='.8'><stop offset='0' stop-color='#fff6e0'/><stop offset='.5' stop-color='#ffb86b'/><stop offset='1' stop-color='#a0306a'/></radialGradient>")
[void]$sky.Append("<radialGradient id='T' cx='.35' cy='.3' r='.8'><stop offset='0' stop-color='#e0fdff'/><stop offset='.5' stop-color='#3ad8d0'/><stop offset='1' stop-color='#0a3a7a'/></radialGradient>")
[void]$sky.Append("<radialGradient id='K' cx='.35' cy='.3' r='.8'><stop offset='0' stop-color='#ffe0f6'/><stop offset='.55' stop-color='#ff62cc'/><stop offset='1' stop-color='#5a1a9a'/></radialGradient>")
[void]$sky.Append("<clipPath id='c'><circle cx='30' cy='820' r='310'/></clipPath></defs>")
[void]$sky.Append("<rect width='390' height='844' fill='url(#s)'/>")
# nebula: a magenta and violet ribbon from the upper left across to the right, a teal cloud, a dark dust lane, bright wisps
[void]$sky.Append("<ellipse cx='60' cy='190' rx='210' ry='120' fill='url(#m)' opacity='.5' transform='rotate(-24 60 190)'/>")
[void]$sky.Append("<ellipse cx='200' cy='250' rx='260' ry='70' fill='url(#v)' opacity='.45' transform='rotate(-24 200 250)'/>")
[void]$sky.Append("<ellipse cx='320' cy='110' rx='180' ry='96' fill='url(#v)' opacity='.5'/>")
[void]$sky.Append("<ellipse cx='345' cy='420' rx='160' ry='140' fill='url(#t)' opacity='.34'/>")
[void]$sky.Append("<ellipse cx='300' cy='300' rx='120' ry='60' fill='url(#m)' opacity='.25' transform='rotate(-30 300 300)'/>")
[void]$sky.Append("<ellipse cx='230' cy='570' rx='280' ry='70' fill='url(#m)' opacity='.3'/>")
[void]$sky.Append("<ellipse cx='60' cy='60' rx='120' ry='70' fill='url(#i)' opacity='.4'/>")
[void]$sky.Append("<ellipse cx='150' cy='300' rx='190' ry='14' fill='#04021c' opacity='.4' transform='rotate(-24 150 300)'/>")
[void]$sky.Append("<ellipse cx='40' cy='175' rx='130' ry='9' fill='#ffc8f4' opacity='.14' transform='rotate(-24 40 175)'/>")
[void]$sky.Append("<ellipse cx='190' cy='230' rx='170' ry='6' fill='#e0c8ff' opacity='.12' transform='rotate(-24 190 230)'/>")
[void]$sky.Append("<ellipse cx='350' cy='380' rx='80' ry='6' fill='#bff8ff' opacity='.12' transform='rotate(-40 350 380)'/>")
# static faint dust of stars, thicker along the ribbon
for ($i = 0; $i -lt 150; $i++) { $x = Rnd 0 390; $y = Rnd 0 600; $r = Rnd 0.35 0.8; $o = Rnd 0.25 0.7
  [void]$sky.Append("<circle cx='$(F $x)' cy='$(F $y)' r='$(F $r)' fill='#fff' opacity='$(F $o)'/>") }
for ($i = 0; $i -lt 70; $i++) { $t = Rnd -40 420; $x = $t; $y = 250 - ($t - 200) * 0.45 + (Rnd -40 40); $r = Rnd 0.3 0.7; $o = Rnd 0.3 0.8
  [void]$sky.Append("<circle cx='$(F $x)' cy='$(F $y)' r='$(F $r)' fill='#ffe8ff' opacity='$(F $o)'/>") }
# the planet rising behind the deck (left)
[void]$sky.Append("<circle cx='30' cy='820' r='334' fill='url(#A)'/>")
[void]$sky.Append("<circle cx='30' cy='820' r='310' fill='url(#P)'/>")
[void]$sky.Append("<g clip-path='url(#c)' fill='none'><path d='M-300 560Q30 490 360 548' stroke='#9a7aff' stroke-width='16' opacity='.22'/><path d='M-300 590Q30 528 360 590' stroke='#2ad8d0' stroke-width='5' opacity='.25'/><path d='M-300 535Q30 466 360 520' stroke='#ff7ae0' stroke-width='4' opacity='.22'/><path d='M-300 610Q30 560 360 615' stroke='#0a0428' stroke-width='12' opacity='.3'/></g>")
[void]$sky.Append("<path d='M-160 577A310 310 0 0 1 318 712' fill='none' stroke='#dffcff' stroke-width='2' opacity='.85'/>")
# a moon (right, low), a small ringed gold planet under the sign, two small dots
[void]$sky.Append("<circle cx='328' cy='405' r='40' fill='url(#t)' opacity='.3'/><circle cx='328' cy='405' r='17' fill='url(#T)'/><circle cx='323' cy='400' r='3' fill='#0a3a7a' opacity='.35'/><circle cx='333' cy='411' r='2.2' fill='#0a3a7a' opacity='.3'/><circle cx='334' cy='398' r='1.5' fill='#0a3a7a' opacity='.3'/>")
[void]$sky.Append("<circle cx='318' cy='196' r='9' fill='url(#M)'/><ellipse cx='318' cy='196' rx='17' ry='3.8' fill='none' stroke='#ffd23f' stroke-width='1.5' opacity='.9' transform='rotate(-16 318 196)'/>")
[void]$sky.Append("<circle cx='122' cy='420' r='12' fill='url(#m)' opacity='.35'/><circle cx='122' cy='420' r='4.5' fill='url(#K)'/>")
[void]$sky.Append("<circle cx='60' cy='112' r='3.5' fill='url(#T)'/>")
# a few bright near stars with cross glints
foreach ($s in @(@(54,250), @(250,40), @(150,206), @(340,470), @(372,98), @(120,560))) {
  $x = $s[0]; $y = $s[1]
  [void]$sky.Append("<circle cx='$x' cy='$y' r='5' fill='#fff' opacity='.14'/><path d='M$x $(F ($y-7))L$(F ($x+.9)) $y L$x $(F ($y+7))L$(F ($x-.9)) $y Z M$(F ($x-7)) $y L$x $(F ($y-.9))L$(F ($x+7)) $y L$x $(F ($y+.9))Z' fill='#fff' opacity='.9'/>") }

[void]$sky.Append("</svg>")

# ---------------------------------------------------------------- drifting stars (plate::before, a 2-tile strip that loops)
$st = New-Object Text.StringBuilder
[void]$st.Append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 612' preserveAspectRatio='none'>")
$cols = @('#fff', '#fff', '#bff4ff', '#ffd0f4', '#ffe9a0')
for ($i = 0; $i -lt 70; $i++) { $x = Rnd 0 390; $y = Rnd 0 606; $r = Rnd 0.6 1.5; $o = Rnd 0.5 1; $c = $cols[$rng.Next($cols.Count)]
  [void]$st.Append("<circle cx='$(F $x)' cy='$(F $y)' r='$(F $r)' fill='$c' opacity='$(F $o)'/>")
  if ($x -lt 4) { [void]$st.Append("<circle cx='$(F ($x+390))' cy='$(F $y)' r='$(F $r)' fill='$c' opacity='$(F $o)'/>") } }
[void]$st.Append("</svg>")

# ---------------------------------------------------------------- searchlights (.stg-sweep, the whole plate; they open and close)
$bm = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 660' preserveAspectRatio='none'><defs>" +
  "<linearGradient id='a' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ffd0f4' stop-opacity='.0'/><stop offset='.25' stop-color='#ff8ae6' stop-opacity='.2'/><stop offset='1' stop-color='#ff4fd8' stop-opacity='.05'/></linearGradient>" +
  "<linearGradient id='b' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#d0fbff' stop-opacity='.0'/><stop offset='.25' stop-color='#8af4ff' stop-opacity='.2'/><stop offset='1' stop-color='#5ff4ff' stop-opacity='.05'/></linearGradient>" +
  "<radialGradient id='p'><stop offset='0' stop-color='#fff' stop-opacity='.5'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></radialGradient></defs>" +
  "<path d='M168 0L180 0L118 660L-10 660Z' fill='url(#a)'/><path d='M210 0L222 0L400 660L272 660Z' fill='url(#b)'/>" +
  "<ellipse cx='55' cy='652' rx='70' ry='12' fill='url(#p)' opacity='.55'/><ellipse cx='335' cy='652' rx='70' ry='12' fill='url(#p)' opacity='.55'/></svg>"

# ---------------------------------------------------------------- the dance floor (in its own box: plate y 612..844)
$H = 500; $A = 112; $B = 28; $Y0 = 612
$zs = @(1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.42, 0.35, 0.29, 0.24)
function P([double]$X, [double]$z) { return (F (195 + $X * $B / $z)) + ' ' + (F ($H + $A / $z - $Y0)) }
function Quad([int]$r, [int]$c, [double]$ins) {
  $z1 = $zs[$r]; $z2 = $zs[$r + 1]; $x1 = $c - 0.5 + $ins; $x2 = $c + 0.5 - $ins
  $za = $z1 - ($z1 - $z2) * $ins * 1.2; $zb = $z2 + ($z1 - $z2) * $ins * 1.2
  return 'M' + (P $x1 $za) + 'L' + (P $x2 $za) + 'L' + (P $x2 $zb) + 'L' + (P $x1 $zb) + 'Z' }
$rows = $zs.Count - 1
$lit = @{ a = New-Object Text.StringBuilder; b = New-Object Text.StringBuilder }
$glass = New-Object Text.StringBuilder
[void]$glass.Append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 232' preserveAspectRatio='none'><defs><linearGradient id='h' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fff' stop-opacity='.16'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></linearGradient></defs>")
$tint = @('#2a1680', '#3a1a90', '#1c2c86', '#46209a')
$litCol = @{ a = @('#ff4fd8', '#5ff4ff'); b = @('#a46bff', '#ffd23f') }
$tintL = @{ '#ff4fd8' = '#ffc8f4'; '#5ff4ff' = '#e0feff'; '#a46bff' = '#e2d2ff'; '#ffd23f' = '#fff4c0' }
for ($r = 0; $r -lt $rows; $r++) { for ($c = -9; $c -le 9; $c++) {
  $xa = 195 + ($c - 0.5) * $B / $zs[$r + 1]; $xb = 195 + ($c + 0.5) * $B / $zs[$r + 1]
  if ($xb -lt -4 -or $xa -gt 394) { continue }
  $k = (($c % 4) + 4 + $r) % 4; $col = $tint[$k]; if (((($c - $r) % 5) + 5) % 5 -eq 0) { $col = '#0f4a7a' }
  [void]$glass.Append("<path d='$(Quad $r $c 0.03)' fill='$col' opacity='.7'/>")
  $hh = ((($c * 7 + $r * 13 + $c * $r * 3) % 9) + 9) % 9
  foreach ($set in @(@('a', 0, 4), @('b', 2, 7))) { if ($hh -eq $set[1] -or $hh -eq $set[2]) {
    $lc = $litCol[$set[0]][($r + [math]::Abs($c)) % 2]
    [void]$lit[$set[0]].Append("<path d='$(Quad $r $c -0.22)' fill='$lc' opacity='.16'/><path d='$(Quad $r $c -0.08)' fill='$lc' opacity='.3'/><path d='$(Quad $r $c 0.04)' fill='$lc'/><path d='$(Quad $r $c 0.24)' fill='$($tintL[$lc])' opacity='.5'/>") } } } }
# the grout: neon hairlines along the joints
[void]$glass.Append("<g fill='none' stroke='#5ff4ff' stroke-width='.9' opacity='.42'>")
for ($r = 0; $r -le $rows; $r++) { $y = $H + $A / $zs[$r] - $Y0; [void]$glass.Append("<path d='M0 $(F $y)H390'/>") }
for ($c = -9; $c -le 10; $c++) { $X = $c - 0.5; [void]$glass.Append("<path d='M$(P $X $zs[0])L$(P $X $zs[$rows])'/>") }
[void]$glass.Append("</g></svg>")
$simA = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 232' preserveAspectRatio='none'>" + $lit.a.ToString() + "</svg>"
$simB = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 232' preserveAspectRatio='none'>" + $lit.b.ToString() + "</svg>"

# ---------------------------------------------------------------- the set (plate::after, static): pylons, deck rim, horizon haze, reflections
$set = New-Object Text.StringBuilder
[void]$set.Append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 844' preserveAspectRatio='none'><defs>")
[void]$set.Append("<linearGradient id='m' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#0a0628'/><stop offset='.35' stop-color='#3a2a8a'/><stop offset='.55' stop-color='#1c1060'/><stop offset='1' stop-color='#07031c'/></linearGradient>")
[void]$set.Append("<linearGradient id='z' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#3a1290' stop-opacity='.9'/><stop offset='.35' stop-color='#ff4fd8' stop-opacity='.16'/><stop offset='1' stop-color='#5ff4ff' stop-opacity='0'/></linearGradient>")
[void]$set.Append("<linearGradient id='rm' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ff4fd8' stop-opacity='.4'/><stop offset='1' stop-color='#ff4fd8' stop-opacity='0'/></linearGradient>")
[void]$set.Append("<linearGradient id='rc' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#5ff4ff' stop-opacity='.4'/><stop offset='1' stop-color='#5ff4ff' stop-opacity='0'/></linearGradient>")
[void]$set.Append("<radialGradient id='o' cx='.35' cy='.3'><stop offset='0' stop-color='#fff'/><stop offset='.4' stop-color='#ffe27a'/><stop offset='1' stop-color='#ff9a3d'/></radialGradient></defs>")
# horizon haze over the back of the floor, then the deck's neon rim
[void]$set.Append("<rect x='0' y='612' width='390' height='46' fill='url(#z)'/>")
[void]$set.Append("<rect x='0' y='606' width='390' height='12' fill='#5ff4ff' opacity='.22'/><rect x='0' y='610' width='390' height='3' fill='#eaffff'/>")
function Pylon([double]$cx, [double]$base, [double]$top, [double]$w, [double]$scale, [double]$fade) {
  $sb = New-Object Text.StringBuilder
  $hw = $w / 2
  [void]$sb.Append("<g opacity='$(F $fade)'>")
  # reflection in the floor glass
  [void]$sb.Append("<rect x='$(F ($cx-$hw*1.6))' y='$(F $base)' width='$(F ($w*1.6))' height='$(F (140*$scale))' fill='url(#rm)' opacity='.8'/>")
  [void]$sb.Append("<ellipse cx='$(F $cx)' cy='$(F $base)' rx='$(F (24*$scale))' ry='$(F (6*$scale))' fill='#07031c'/><ellipse cx='$(F $cx)' cy='$(F $base)' rx='$(F (24*$scale))' ry='$(F (6*$scale))' fill='none' stroke='#5ff4ff' stroke-width='$(F (1.6*$scale))'/>")
  [void]$sb.Append("<rect x='$(F ($cx-$hw))' y='$(F $top)' width='$(F $w)' height='$(F ($base-$top))' rx='$(F ($hw*.6))' fill='url(#m)'/>")
  [void]$sb.Append("<rect x='$(F ($cx-$hw*.25))' y='$(F ($top+6))' width='$(F ($w*.12))' height='$(F ($base-$top-12))' fill='#b9a4ff' opacity='.35'/>")
  $n = 0
  for ($y = $base - 22 * $scale; $y -gt $top + 16 * $scale; $y -= 38 * $scale) {
    $col = $(if ($n % 2) { '#5ff4ff' } else { '#ff4fd8' }); $n++
    [void]$sb.Append("<ellipse cx='$(F $cx)' cy='$(F $y)' rx='$(F ($hw+5*$scale))' ry='$(F (3.6*$scale))' fill='none' stroke='$col' stroke-width='$(F (5.5*$scale))' opacity='.28'/>")
    [void]$sb.Append("<ellipse cx='$(F $cx)' cy='$(F $y)' rx='$(F ($hw+5*$scale))' ry='$(F (3.6*$scale))' fill='none' stroke='$col' stroke-width='$(F (2*$scale))'/>")
    [void]$sb.Append("<path d='M$(F ($cx-$hw-5*$scale)) $(F $y)A$(F ($hw+5*$scale)) $(F (3.6*$scale)) 0 0 0 $(F ($cx+$hw+5*$scale)) $(F $y)' fill='none' stroke='#fff' stroke-width='$(F (0.7*$scale))' opacity='.85'/>") }
  [void]$sb.Append("<path d='M$(F $cx) $(F $top)V$(F ($top-30*$scale))' stroke='#b9a4ff' stroke-width='$(F (1.4*$scale))'/>")
  [void]$sb.Append("<circle cx='$(F $cx)' cy='$(F ($top-2))' r='$(F (8*$scale))' fill='url(#o)'/><circle cx='$(F $cx)' cy='$(F ($top-31*$scale))' r='$(F (2.2*$scale))' fill='#ff4fd8'/>")
  [void]$sb.Append("</g>")
  return $sb.ToString() }
# the back pair first (smaller, dimmer: depth), then the front pair at the edges
[void]$set.Append((Pylon 80 622 468 7 0.55 0.75)); [void]$set.Append((Pylon 310 622 468 7 0.55 0.75))
[void]$set.Append((Pylon 24 650 300 13 1 1)); [void]$set.Append((Pylon 366 650 300 13 1 1))
[void]$set.Append("</svg>")

# ---------------------------------------------------------------- the neon glow that breathes (.stg-pulse): halos on the pylons and the deck rim
$pl = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 270 390 370' preserveAspectRatio='none'><defs>" +
  "<radialGradient id='g'><stop offset='0' stop-color='#ff4fd8' stop-opacity='.5'/><stop offset='.5' stop-color='#b04fff' stop-opacity='.18'/><stop offset='1' stop-color='#b04fff' stop-opacity='0'/></radialGradient>" +
  "<radialGradient id='h'><stop offset='0' stop-color='#5ff4ff' stop-opacity='.55'/><stop offset='1' stop-color='#5ff4ff' stop-opacity='0'/></radialGradient>" +
  "<linearGradient id='r' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#5ff4ff' stop-opacity='0'/><stop offset='.5' stop-color='#5ff4ff' stop-opacity='.55'/><stop offset='1' stop-color='#5ff4ff' stop-opacity='0'/></linearGradient></defs>" +
  "<ellipse cx='24' cy='475' rx='40' ry='205' fill='url(#g)'/><ellipse cx='366' cy='475' rx='40' ry='205' fill='url(#g)'/>" +
  "<ellipse cx='80' cy='546' rx='22' ry='90' fill='url(#g)' opacity='.7'/><ellipse cx='310' cy='546' rx='22' ry='90' fill='url(#g)' opacity='.7'/>" +
  "<circle cx='24' cy='298' r='26' fill='url(#h)'/><circle cx='366' cy='298' r='26' fill='url(#h)'/>" +
  "<rect x='0' y='596' width='390' height='34' fill='url(#r)'/></svg>"

# ---------------------------------------------------------------- CSS
$S = ':root.stage-on #stage :is(.stg-close, .stg-wide)'
$css = New-Object Text.StringBuilder
function L([string]$s) { [void]$css.Append($s + "`r`n") }
L '/* ==== STAGE LIFE:BEGIN (written by tools/build-stage-life.ps1 - edit the script, not this block) ===='
L '   THE DECK IN ORBIT. Over the STUDIO block above: no wall and no window any more - the show stands on an open glass dance deck floating in'
L '   space. Back to front: the sky (nebula clouds, a dust lane, a banded planet rising behind the deck, a moon, a small ringed planet), the'
L '   drifting starfield, the turning galaxy, the gliding ringed planet, two searchlights, the dance floor (its glass tiles, a light wave rolling'
L '   under them, two sets of lit tiles taking turns), the pylons and the deck rim, a breathing neon glow, the sign. Moving layers: 8, transform'
L '   and opacity only; tiles change at most twice a second. Lite mode and reduced motion: all still, the floor shown part-lit. */'
L "$S{ background:$(Url $sky.ToString()) 50% 50% / var(--pw) calc(var(--pw) * 2.16411) no-repeat, #04021c !important; }"
# stars: the whole sky above the deck, a 2-tile strip drifting left
L "$S .stg-plate::before{ left:0 !important; top:0 !important; width:200% !important; height:72.6% !important; background:$(Url $st.ToString()) 0 0 / 50% 100% repeat-x !important; animation:stgStars 200s linear infinite; }"
# galaxy: upper left, a little bigger
L "$S::before{ left:calc(50% - var(--pw) * 0.4505) !important; top:calc(50% + var(--pw) * 2.16411 * -0.2046) !important; width:calc(var(--pw) * 0.26) !important; opacity:.95; }"
# the ringed planet: upper right, smaller, a gentle glide
L "$S .stg-glow{ left:60% !important; top:27.4% !important; width:31% !important; height:8.9% !important; animation:slPlanet 70s ease-in-out infinite alternate !important; }"
L '@keyframes slPlanet{ from{ transform:translate3d(-10%, 10%, 0) rotate(-4deg); } to{ transform:translate3d(9%, -14%, 0) rotate(5deg); } }'
# searchlights: the old near-star layer, now the two beams that slowly open and close
L "$S .stg-sweep{ z-index:3 !important; left:0 !important; top:0 !important; width:100% !important; height:78.2% !important; background:$(Url $bm) 0 0 / 100% 100% no-repeat !important; transform-origin:50% 0; animation:slBeams 9s ease-in-out infinite alternate !important; }"
L '@keyframes slBeams{ from{ transform:scaleX(.8); } to{ transform:scaleX(1.12); } }'
# the floor
L "$S .stg-floor{ position:absolute; z-index:4; left:0; top:72.512%; width:100%; height:27.488%; overflow:hidden; pointer-events:none; background:linear-gradient(180deg, #1c0a52, #0a0428 60%, #07031c); }"
L "$S .stg-floor > i{ position:absolute; inset:0; }"
L "$S .sf-wave{ right:auto !important; width:46%; background:linear-gradient(90deg, rgba(255,79,216,0), rgba(255,79,216,0.75) 30%, rgba(255,255,255,0.85) 50%, rgba(95,244,255,0.75) 70%, rgba(95,244,255,0)); transform:translate3d(-120%, 0, 0) skewX(-30deg); animation:slWave 7s linear infinite; }"
L '@keyframes slWave{ 0%{ transform:translate3d(-120%, 0, 0) skewX(-30deg); } 70%, 100%{ transform:translate3d(320%, 0, 0) skewX(-30deg); } }'
L "$S .sf-glass{ background:$(Url $glass.ToString()) 0 0 / 100% 100% no-repeat; }"
L "$S .sf-sim.a{ background:$(Url $simA) 0 0 / 100% 100% no-repeat; opacity:0; animation:slSimA 4.8s linear infinite; }"
L "$S .sf-sim.b{ background:$(Url $simB) 0 0 / 100% 100% no-repeat; opacity:0; animation:slSimB 4.8s linear infinite; }"
# 8 beats of 0.6 s: A on 1 3 5 6, B on 2 4 6 8 (they share beat 6) - a chase, a pair, then a breath
L '@keyframes slSimA{ 0%, 9.5%{ opacity:.95; } 12.5%, 22%{ opacity:0; } 25%, 34.5%{ opacity:.95; } 37.5%, 47%{ opacity:0; } 50%, 72%{ opacity:.95; } 75%, 100%{ opacity:0; } }'
L '@keyframes slSimB{ 0%, 9.5%{ opacity:0; } 12.5%, 22%{ opacity:.95; } 25%, 34.5%{ opacity:0; } 37.5%, 47%{ opacity:.95; } 50%, 59.5%{ opacity:0; } 62.5%, 72%{ opacity:.95; } 75%, 84.5%{ opacity:0; } 87.5%, 97%{ opacity:.95; } 100%{ opacity:0; } }'
# the set and the breathing glow
L "$S .stg-plate::after{ z-index:5 !important; background:$(Url $set.ToString()) 0 0 / 100% 100% no-repeat !important; }"
L "$S .stg-pulse{ position:absolute; z-index:6; left:0; top:31.99%; width:100%; height:43.84%; pointer-events:none; background:$(Url $pl) 0 0 / 100% 100% no-repeat; opacity:.5; animation:slPulse 3.2s ease-in-out infinite alternate; }"
L '@keyframes slPulse{ from{ opacity:.4; } to{ opacity:1; } }'
L "$S .stg-sign{ z-index:7 !important; }"
# a shot that is not on screen holds still (the !important animations above would otherwise outrank the base pause rule)
L ":root.stage-on #stage .stg-shot:not(.on)::before, :root.stage-on #stage .stg-shot:not(.on) .stg-plate::before, :root.stage-on #stage .stg-shot:not(.on) :is(.stg-glow, .stg-sweep, .sf-wave, .sf-sim, .stg-pulse){ animation-play-state:paused !important; }"# ROUND DONE brings its own turning rays: the searchlights rest under them
L ":root.stage-on:has(.rw-party) #stage :is(.stg-close, .stg-wide) .stg-sweep{ animation:none !important; transform:scaleX(1); }"
# the still version: nothing moves, the floor shows both tile sets part-lit
$still = "$S .stg-plate::before, $S::before, $S .stg-glow, $S .stg-sweep, $S .sf-wave, $S .sf-sim, $S .stg-pulse"
$lite = ($still -split ', ' | ForEach-Object { $_ -replace '^:root\.stage-on', ':root.lite.stage-on' }) -join ', '
$rm = ($still -split ', ' | ForEach-Object { $_ -replace '^:root\.stage-on', ':root.rm.stage-on' }) -join ', '
L "$lite, $rm{ animation:none !important; }"
L "@media (prefers-reduced-motion: reduce){ $still{ animation:none !important; } }"
$sl = @(':root.lite.stage-on', ':root.rm.stage-on')
foreach ($p in $sl) {
  L "$p #stage :is(.stg-close, .stg-wide) .sf-wave{ opacity:.55; transform:translate3d(60%, 0, 0) skewX(-30deg); }"
  L "$p #stage :is(.stg-close, .stg-wide) .sf-sim.a{ opacity:.8; } $p #stage :is(.stg-close, .stg-wide) .sf-sim.b{ opacity:.45; } $p #stage :is(.stg-close, .stg-wide) .stg-pulse{ opacity:.8; }" }
L "@media (prefers-reduced-motion: reduce){ $S .sf-wave{ opacity:.55; transform:translate3d(60%, 0, 0) skewX(-30deg); } $S .sf-sim.a{ opacity:.8; } $S .sf-sim.b{ opacity:.45; } $S .stg-pulse{ opacity:.8; } }"
L '/* ==== STAGE LIFE:END ==== */'

# ---------------------------------------------------------------- write it into lib/stage.css
$path = Join-Path (Split-Path $PSScriptRoot -Parent) 'lib\stage.css'
$text = [IO.File]::ReadAllText($path)
$block = $css.ToString().TrimEnd("`r", "`n")
$re = [regex]'(?s)/\* ==== STAGE LIFE:BEGIN.*?/\* ==== STAGE LIFE:END ==== \*/'
if ($re.IsMatch($text)) { $text = $re.Replace($text, [Text.RegularExpressions.MatchEvaluator]{ param($m) $block }, 1) }
else { $text = $text.TrimEnd("`r", "`n") + "`r`n" + $block + "`r`n" }
[IO.File]::WriteAllText($path, $text, (New-Object Text.UTF8Encoding $false))
Write-Host ("STAGE LIFE block: {0:N0} characters" -f $block.Length)