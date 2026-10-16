/* FlipStax - the host's pose system (Run 2, I4).

   Every host on screen is a "rig": Host.html(opts) returns its markup, Host.pose(el, poseName, options) changes what
   he's doing. A pose shows data/host/<pose>.png when that picture exists (listed in data/host/manifest.js, which the
   art drop updates - so a missing file never costs a failed request), and otherwise the current SVG host
   (lib/host-alien.js) acting the pose out with CSS - so nothing breaks while the art is missing.

   - Poses: idle, idleClosed, blink, wave, point, cheer, think, shrug, wink, oops, gasp, presenting, laugh,
     and the disco poses discoPoint, swayL, swayR, spin.
   - Pictures share one canvas and one baseline (the feet on the bottom edge), so changing pose never jumps;
     two <img> layers crossfade. A quick pop marks every change. Idle bob, sway and blink run in CSS
     (lib/host.css), transform and opacity only, still in lite mode / reduced motion.
   - Host.pose(el, name, { hold }) returns to idle after `hold` ms (default: one-shot poses 1600 ms, held poses
     never). Host.poseAll(name, opts) poses every visible rig (there is only ever one - one host per screen,
     the disco is the exception). Host.preload() warms every available picture. */
(function(root){
  const POSES = ['idle', 'idleClosed', 'blink', 'wave', 'point', 'cheer', 'think', 'shrug', 'wink', 'oops', 'gasp', 'presenting', 'laugh',
    'discoPoint', 'swayL', 'swayR', 'spin'];
  // Poses that play once and go back to idle by themselves; the rest hold until the next pose.
  const ONE_SHOT = { blink:900, wave:1800, cheer:1600, shrug:1500, wink:1000, oops:1500, gasp:1200, laugh:1800 };
  const DIR = 'data/host/';
  const art = {};            // pose -> loaded <img> (only poses listed in the manifest)
  const listed = ()=> (root.FLIPSTAX_HOST_POSES || []).filter(p=> POSES.indexOf(p) >= 0);
  function preload(){
    listed().forEach(p=>{
      if (art[p]) return;
      const img = new Image(); img.decoding = 'async';
      img.onload = ()=>{ art[p] = img; };
      img.src = DIR + p + '.png';
    });
  }
  function svgFor(kind){
    const H = root.HostAlien;
    if (!H) return '';
    return kind === 'head' ? H.svg('alien-svg') : H.full();
  }
  function html(opts){
    opts = opts || {};
    const kind = opts.kind || 'full', pose = POSES.indexOf(opts.pose) >= 0 ? opts.pose : 'idle';
    return '<div class="host-rig hr-' + kind + (opts.cls ? ' ' + opts.cls : '') + '" data-pose="' + pose + '" data-kind="' + kind + '">' +
      '<div class="hr-svg">' + svgFor(kind) + '</div><img class="hr-img a" alt="" aria-hidden="true"><img class="hr-img b" alt="" aria-hidden="true"></div>';
  }
  function rigOf(el){
    if (!el) return null;
    if (el.classList && el.classList.contains('host-rig')) return el;
    return el.querySelector ? el.querySelector('.host-rig') : null;
  }
  function pose(el, name, opts){
    const rig = rigOf(el); if (!rig) return;
    opts = opts || {};
    if (POSES.indexOf(name) < 0) name = 'idle';
    clearTimeout(rig._hold);
    const changed = rig.dataset.pose !== name;
    rig.dataset.pose = name;
    // The picture: crossfade to this pose's art when it exists, else show the drawn host.
    const pic = rig.dataset.kind === 'full' && art[name];
    if (pic){
      const a = rig.querySelector('.hr-img.a'), b = rig.querySelector('.hr-img.b'), on = rig.querySelector('.hr-img.on');
      const next = on === a ? b : a;
      if (next.getAttribute('src') !== pic.src) next.src = pic.src;
      next.classList.add('on'); if (on && on !== next) on.classList.remove('on');
      rig.classList.add('has-img');
    } else if (rig.classList.contains('has-img')){
      rig.querySelectorAll('.hr-img').forEach(i=> i.classList.remove('on')); rig.classList.remove('has-img');
    }
    // A quick pop on every change (restarted with a class toggle, transform only).
    if (changed && !opts.quiet){ rig.classList.remove('hr-pop'); void rig.offsetWidth; rig.classList.add('hr-pop'); }
    const hold = opts.hold != null ? opts.hold : ONE_SHOT[name];
    if (hold) rig._hold = setTimeout(()=> pose(rig, opts.then || 'idle', { quiet: true }), hold);
  }
  function poseAll(name, opts){
    document.querySelectorAll('.host-rig').forEach(r=>{ if (r.offsetParent !== null || getComputedStyle(r).position === 'fixed') pose(r, name, opts); });
  }
  root.Host = { POSES, html, pose, poseAll, preload, art };
  if (typeof document !== 'undefined'){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', preload); else preload(); }
})(typeof window !== 'undefined' ? window : globalThis);
