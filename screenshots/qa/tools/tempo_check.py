# Beat-tracks a music file: local tempo over time (from beat-to-beat gaps) and the loop seam.
import sys, numpy as np, librosa
path = sys.argv[1]
y, sr = librosa.load(path, sr=22050, mono=True)
dur = len(y) / sr
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=256)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=256, tightness=400)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=256)
ibi = np.diff(bt)
print(path.split('/')[-1], '| %.2fs | tracked tempo %.2f BPM | %d beats' % (dur, float(np.atleast_1d(tempo)[0]), len(bt)))
# local tempo in 8s windows from the median beat gap, and how uneven the gaps are
print('  t(s)  BPM     gap spread(ms)')
for s in range(0, int(dur), 8):
    m = (bt[1:] >= s) & (bt[1:] < s + 8)
    if m.sum() > 3: print('  %4d  %6.1f  %5.1f' % (s, 60 / np.median(ibi[m]), 1000 * np.std(ibi[m])))
# straight-line fit of beat times: how far does the song wander from one steady tempo?
k = np.arange(len(bt)); A = np.vstack([k, np.ones_like(k)]).T; (P, b0), *_ = np.linalg.lstsq(A, bt, rcond=None)
dev = bt - (k * P + b0)
print('  one steady tempo would be %.3f BPM; beats wander from it by up to %+.0f / %+.0f ms (RMS %.0f ms)' % (60 / P, 1000 * dev.min(), 1000 * dev.max(), 1000 * np.sqrt((dev ** 2).mean())))
beats_in_file = (dur - bt[0]) / P + 0  # from the first beat
print('  loop: last beat %.3fs, file ends %.3fs, first beat %.3fs -> gap across the seam %.0f ms vs a beat of %.0f ms (off by %+.0f ms)' % (bt[-1], dur, bt[0], 1000 * (dur - bt[-1] + bt[0]), 1000 * P, 1000 * ((dur - bt[-1] + bt[0]) - P * round((dur - bt[-1] + bt[0]) / P))))
