# Records the Super Secret Riddle win as a video, with the game's own audio
# files laid in at the moments the game plays them.
#   Scene 1: the riddle screen -> answer typed -> win celebration -> Tap to continue
#   Scene 2: the results screen after the run
import os, sys, json, time, shutil, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin, REPO
import imageio_ffmpeg
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__))
FR = os.path.join(HERE, 'frames'); shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR)
OUT = os.path.join(REPO, 'screenshots', 'qa', 'secret-riddle-win.mp4')
AUD = os.path.join(REPO, 'audio')
VOL = 0.55   # the game's MUSIC_VOLUME
ANS = {'FOOTSTEPS':'footsteps','ECHO':'echo','DARKNESS':'darkness','PIANO':'piano','ARE YOU ASLEEP':'are you asleep?','FIRE':'fire','BREATH':'your breath','COFFIN':'casket','HOLE':'a hole','PROMISE':'a promise'}
# A visible tap marker (a white ring where the finger lands).
TAPDOT = r"""(function(){ window.__tap = (el)=>{ const r = el.getBoundingClientRect(), d = document.createElement('div');
  d.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:3px solid #fff;background:rgba(255,255,255,0.35);box-shadow:0 0 12px rgba(255,255,255,0.8);transition:transform .35s ease, opacity .35s ease;left:' + (r.left + r.width/2) + 'px;top:' + (r.top + r.height/2) + 'px';
  document.body.appendChild(d); requestAnimationFrame(()=>{ d.style.transform = 'scale(1.5)'; d.style.opacity = '0'; }); setTimeout(()=> d.remove(), 450); }; })();"""
# Slow motion while recording: every clock, timer, animation frame and CSS
# animation runs at 1/SLOW speed, so the screenshots keep up; the frames are
# then played back at normal speed (game time = real time / SLOW).
SLOW = 4
DILATE = r"""(function(){ const S = %d; const rN = performance.now.bind(performance), rD = Date.now; const p0 = rN(), d0 = rD();
  performance.now = ()=> p0 + (rN() - p0) / S;
  const RD = Date; class FD extends RD { constructor(...a){ if (a.length) super(...a); else super(d0 + (rD() - d0) / S); } static now(){ return d0 + (rD() - d0) / S; } } window.Date = FD;
  const rST = window.setTimeout.bind(window), rSI = window.setInterval.bind(window);
  window.setTimeout = (f, ms, ...a)=> rST(f, (ms || 0) * S, ...a);
  window.setInterval = (f, ms, ...a)=> rSI(f, (ms || 0) * S, ...a);
  const rRAF = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb)=>{ let n = 0; const go = (t)=>{ if (++n < S){ rRAF(go); return; } cb(p0 + (t - p0) / S); }; return rRAF(go); };
  rSI(()=>{ try{ document.getAnimations().forEach(a=>{ if (a.playbackRate !== 1 / S) a.playbackRate = 1 / S; }); }catch(e){} }, 25);
})();""" % SLOW
SOUND_ON = "try{ localStorage.setItem('flipstax_sound','on'); localStorage.setItem('flipstax_seen_run_intro','1'); }catch(e){}"
v = View(390, 844, DILATE + SOUND_ON + TAPDOT, allow_media=True)
def load():
    v.load(debug=True); spin(1.5 * SLOW)
load(); v.js("localStorage.setItem('flipstax_sound','on'); 'x'"); load()
v.js("document.getElementById('homeEnterBtn').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6 * SLOW)
t_daily = time.time()
v.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.4 * SLOW)

frames = []   # (path, time)
import WebKit, AppKit
JPG = { AppKit.NSImageCompressionFactor: 0.92 }
def grab():   # JPEG frames: about twice as fast as PNG, so the motion stays smooth
    b = {}; tt = time.time()
    v.wv.takeSnapshotWithConfiguration_completionHandler_(WebKit.WKSnapshotConfiguration.alloc().init(), lambda img, e: b.update(img=img))
    while 'img' not in b: spin(0.002)
    p = os.path.join(FR, '%05d.jpg' % len(frames))
    AppKit.NSBitmapImageRep.imageRepWithData_(b['img'].TIFFRepresentation()).representationUsingType_properties_(AppKit.NSBitmapImageFileTypeJPEG, JPG).writeToFile_atomically_(p, False)
    frames.append((p, tt))
def run_for(sec, actions=()):
    """Capture frames for `sec` game-seconds, firing (at, fn) actions (game-seconds)."""
    t0 = time.time(); todo = sorted(actions, key=lambda a: a[0])
    while (time.time() - t0) / SLOW < sec:
        while todo and (time.time() - t0) / SLOW >= todo[0][0]: todo.pop(0)[1]()
        grab()
    return t0

# ---------- Scene 1 ----------
marks = {}
v.js("window.__debug.startDailyRiddle(); window.__debug.setRiddleRemainingMs(30000); 'x'")
marks['riddle'] = time.time(); theme_pos = (marks['riddle'] - t_daily) / SLOW   # the theme pauses here, at this position
answer = ANS[v.js("window.__debug.currentRiddle().a")]
def typer(i):
    return lambda: v.js("document.getElementById('riddleInput').value = %s; 'x'" % json.dumps(answer[:i]))
acts = [(2.2 + i * 0.13, typer(i)) for i in range(1, len(answer) + 1)]
t_type_end = 2.2 + len(answer) * 0.13
def submit():
    v.js("window.__tap(document.getElementById('riddleSubmit')); document.getElementById('riddleSubmit').click(); 'x'"); marks['solve'] = time.time()
def cont():
    v.js("window.__tap(document.getElementById('riddleContinue')); document.getElementById('riddleContinue').click(); 'x'"); marks['continue'] = time.time()
acts += [(t_type_end + 0.5, submit), (t_type_end + 0.5 + 7.2, cont)]
s1 = run_for(t_type_end + 0.5 + 7.2 + 1.6, acts)
s1_end = time.time()
fps1 = len(frames) / (s1_end - s1)
# ---------- off camera: finish the run (solve the word) ----------
v.js("window.__debug.setRunClockMs(0); 'x'"); v.until("window.__debug.getSolveState().solveOpen", 30 * SLOW); spin(0.4 * SLOW)
v.js("""(()=>{ const w = window.__debug.getRunWord().word; const keys = [...document.querySelectorAll('.solve-kb-key')];
  [...document.querySelectorAll('#solveSlots .solve-slot')].forEach((s,i)=>{ if (s.classList.contains('locked')) return; const k = keys.find(k=> k.textContent.trim() === w[i]); if (k) k.click(); });
  document.getElementById('solveSubmit').click(); })(); 'x'""")
v.until("window.__debug.getSolveState().readoutOpen", 20 * SLOW)
# ---------- Scene 2: the results screen (the results music starts as it opens) ----------
n1 = len(frames)
s2 = run_for(7.0)
s2_end = time.time()
print('frames', len(frames), 'scene 1 fps (video) %.1f' % (fps1 * SLOW), 'errors', v.qa()['errors'])

# ---------- video: frames at their real times, 30fps ----------
lst = os.path.join(HERE, 'frames.txt')
with open(lst, 'w') as f:
    def write(rng, end_t):
        for k in rng:
            p, t = frames[k]; nxt = frames[k + 1][1] if k + 1 < rng.stop else end_t
            f.write("file '%s'\nduration %.4f\n" % (p, max(0.001, (nxt - t) / SLOW)))
    write(range(0, n1), s1_end)
    write(range(n1, len(frames)), s2_end)
    f.write("file '%s'\n" % frames[-1][0])
silent = os.path.join(HERE, 'video_silent.mp4')
subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'scale=780:1688:flags=lanczos,format=yuv420p', '-r', '30', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', silent], check=True)
# ---------- audio: the game's files at the game's times ----------
d1 = (s1_end - s1) / SLOW             # scene 1 length, game seconds
at = lambda t: max(0.0, (t - s1) / SLOW)
cues = [   # (file, start in video s, offset into file s, play for s)
    ('velvet-curtain-call-trimmed.mp3', at(marks['riddle']), 0.0, (marks['solve'] - marks['riddle']) / SLOW),
    ('victory-lap-win-fanfare.mp3',     at(marks['solve']),  0.0, 4.65),
    ('top-score-carousel-trimmed.mp3',  at(marks['continue']), theme_pos, d1 - at(marks['continue'])),
    ('victory-lap-results-trimmed.mp3', d1, 0.0, (s2_end - s2) / SLOW),
]
args = [FFMPEG, '-y', '-loglevel', 'error', '-i', silent]
filt = []
for i, (fn, start, off, dur) in enumerate(cues):
    args += ['-i', os.path.join(AUD, fn)]
    filt.append('[%d:a]atrim=start=%.3f:duration=%.3f,asetpts=PTS-STARTPTS,afade=t=out:st=%.3f:d=0.08,volume=%.2f,adelay=%d|%d[a%d]' % (i + 1, off, dur, max(0, dur - 0.08), VOL, int(start * 1000), int(start * 1000), i))
filt.append(''.join('[a%d]' % i for i in range(len(cues))) + 'amix=inputs=%d:normalize=0:duration=longest[aout]' % len(cues))
total = d1 + (s2_end - s2) / SLOW
args += ['-filter_complex', ';'.join(filt), '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', '%.3f' % total, '-movflags', '+faststart', OUT]
subprocess.run(args, check=True)
print(json.dumps({ 'video': OUT, 'length_s': round(total, 1), 'riddle_to_solve_s': round((marks['solve'] - marks['riddle']) / SLOW, 2),
  'solve_to_continue_s': round((marks['continue'] - marks['solve']) / SLOW, 2), 'answer': answer }))
