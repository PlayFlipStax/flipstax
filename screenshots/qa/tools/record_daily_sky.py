# Silent clip of the Daily Stax sky: (1) a UFO beams up a cow at normal speed,
# (2) a timelapse of the sun crossing over a whole run (clock driven forward).
import os, sys, time, shutil, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from wkh import View, spin, REPO
import imageio_ffmpeg, WebKit, AppKit
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__))
FR = os.path.join(HERE, 'frames'); shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR)
OUT = os.path.join(REPO, 'screenshots', 'qa', 'daily-sky.mp4')
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
CAPTION = r"""window.__cap = (t)=>{ let c = document.getElementById('__cap'); if (!c){ c = document.createElement('div'); c.id = '__cap'; c.style.cssText = 'position:fixed;left:50%;bottom:6px;transform:translateX(-50%);z-index:99999;pointer-events:none;font:700 13px system-ui;color:#fff;background:rgba(13,43,94,0.88);padding:6px 12px;border-radius:99px;white-space:nowrap'; document.body.appendChild(c); } c.textContent = t; c.style.display = t ? '' : 'none'; };"""
def open_daily(clock_ms):
    w = View(390, 844, DILATE + "try{ localStorage.setItem('flipstax_seen_run_intro','1'); }catch(e){}" + CAPTION)
    w.load(debug=True); spin(1.5 * SLOW)
    w.js("document.getElementById('homeEnterBtn').click(); 'x'"); spin(0.6 * SLOW)
    w.js("document.getElementById('modeDailyBtn').click(); 'x'"); spin(1.5 * SLOW)
    if clock_ms: w.js("window.__debug.setRunClockMs(%d); 'x'" % clock_ms)
    spin(1.2 * SLOW); return w
v = open_daily(100000)
frames = []
JPG = { AppKit.NSImageCompressionFactor: 0.9 }
def grab():
    for attempt in range(8):   # a snapshot now and then comes back empty - take another
        b = {}
        v.wv.takeSnapshotWithConfiguration_completionHandler_(WebKit.WKSnapshotConfiguration.alloc().init(), lambda img, e: b.update(img=img))
        while 'img' not in b: spin(0.002)
        if b['img'] is not None: break
        spin(0.02)
    if b['img'] is None: return
    p = os.path.join(FR, '%05d.jpg' % len(frames))
    AppKit.NSBitmapImageRep.imageRepWithData_(b['img'].TIFFRepresentation()).representationUsingType_properties_(AppKit.NSBitmapImageFileTypeJPEG, JPG).writeToFile_atomically_(p, False)
    frames.append(p)
def run_for(sec, actions=(), every=0):
    t0 = time.time(); todo = sorted(actions, key=lambda a: a[0]); n0 = len(frames); last = -1
    while (time.time() - t0) / SLOW < sec:
        while todo and (time.time() - t0) / SLOW >= todo[0][0]: todo.pop(0)[1]()
        g = (time.time() - t0) / SLOW
        if every and g - last < every: spin(0.005); continue
        last = g; grab()
    return len(frames) - n0, (time.time() - t0) / SLOW
vote = lambda: v.js("(()=>{ const a = document.getElementById('halfA'); if (!a.classList.contains('revealed')) a.click(); })(); 'x'")
# Scene 1: an abduction, normal speed
v.js("window.__cap('A UFO beams up a cow'); 'x'")
n1, d1 = run_for(8.6, [(0.4, lambda: v.js("window.__debug.dailyUfo(true, 'cow'); 'x'")), (3.0, vote)])
# Scene 2: the sun over a whole run, sped up (clock pushed forward each game-second)
err1 = v.qa()['errors']
v = open_daily(0)   # a fresh run, so the sun starts at sunrise
v.js("window.__cap('Timelapse: the sun across a whole run'); 'x'")
steps = [(0.2 + k * 1.0, (lambda ms: (lambda: v.js("window.__debug.setRunClockMs(%d); 'x'" % ms)))(int(180000 - (k + 1) * 0.045 * 180000))) for k in range(21)]
steps += [(1.5 + k * 2.5, vote) for k in range(8)]
n2, d2 = run_for(22.0, steps, every=0.1)
print('scene 1: %d frames over %.1fs, scene 2: %d frames over %.1fs' % (n1, d1, n2, d2), 'errors', err1, v.qa()['errors'])
# Scene 1 at real speed; scene 2 at 3x
fps1 = n1 / d1
lst = os.path.join(FR, 'list.txt')
with open(lst, 'w') as f:
    for p in frames[:n1]: f.write("file '%s'\nduration %.5f\n" % (p, 1 / fps1))
    for p in frames[n1::1]: f.write("file '%s'\nduration %.5f\n" % (p, d2 / n2 / 3))
    f.write("file '%s'\n" % frames[-1])
subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'scale=780:-2,format=yuv420p', '-r', '30', '-c:v', 'libx264', '-crf', '20', '-movflags', '+faststart', OUT], check=True)
print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')
