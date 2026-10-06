# Fine beat timing: local tempo from straight-line fits over 16-beat windows, plus beat-to-beat jitter.
import sys, numpy as np, librosa
path = sys.argv[1]; sr = 22050; hop = 64
y, _ = librosa.load(path, sr=sr, mono=True); dur = len(y) / sr
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
bpm0 = float(sys.argv[2]) if len(sys.argv) > 2 else None
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, tightness=800, start_bpm=bpm0 or 120)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
print(path.split('/')[-1], 'tracked %.2f BPM, %d beats over %.1fs (a steady %.2f BPM would give %d)' % (float(np.atleast_1d(tempo)[0]), len(bt), dur, float(np.atleast_1d(tempo)[0]), int((bt[-1] - bt[0]) * float(np.atleast_1d(tempo)[0]) / 60) + 1))
print('  from   to    BPM (16-beat fit)  jitter ms')
for i in range(0, len(bt) - 16, 16):
    seg = bt[i:i + 17]; k = np.arange(len(seg)); P, c = np.polyfit(k, seg, 1); r = seg - (k * P + c)
    print('  %5.1f %5.1f   %7.2f          %5.1f' % (seg[0], seg[-1], 60 / P, 1000 * r.std()))
