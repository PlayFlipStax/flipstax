# Where the eighth-note pulse sits, second by second, against a steady grid
# (phase of the onset envelope at 2x the beat rate; syncopation on/off the
# beat doesn't move it, real timing drift does). Prints ms offset per window.
import sys, numpy as np, librosa
path = sys.argv[1]; bpm = float(sys.argv[2]); sr = 22050; hop = 64
y, _ = librosa.load(path, sr=sr, mono=True)
o = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop); t = np.arange(len(o)) * hop / sr
f = 2 * bpm / 60; z = o * np.exp(-2j * np.pi * f * t)
W = int(3.0 * sr / hop); step = int(1.0 * sr / hop)
out = []
for s in range(0, len(o) - W, step):
    v = z[s:s + W].sum(); strength = abs(v) / (o[s:s + W].sum() + 1e-9)
    out.append((t[s] + 1.5, np.angle(v), strength))
ph = np.unwrap([p for _, p, _ in out]); ms = -ph / (2 * np.pi) * (1000 / f)
ms -= np.median(ms)
for (tt, _, st), m in zip(out, ms):
    if int(tt) % 2 == 0: print('%5.0fs  %+6.0f ms  %s  (pulse clarity %.2f)' % (tt, m, ('#' * int(min(40, abs(m) / 5))).rjust(40) if m < 0 else ' ' * 40 + '|' + '#' * int(min(40, m / 5)), st))
