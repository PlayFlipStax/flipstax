# Preview only: puts the Daily theme onto a steady 144 BPM grid.
# Reliable beats come from the stretches where the beat tracker is tight
# (16-beat fits with little jitter near 144 BPM); each gap between those
# stretches is mapped to the nearest whole number of 144 BPM beats, and the
# audio is time-stretched to that map (harmonic part phase vocoder,
# percussive part OLA - pytsmod.hptsm). Writes to screenshots/qa/theme-fix/,
# never to audio/.
import os, sys, json, subprocess, numpy as np, librosa, pytsmod, imageio_ffmpeg
REPO = '/Users/rickymartin/FlipStax'
SRC = os.path.join(REPO, 'audio', 'top-score-carousel-trimmed.mp3')
OUT = os.path.join(REPO, 'screenshots', 'qa', 'theme-fix'); os.makedirs(OUT, exist_ok=True)
F = imageio_ffmpeg.get_ffmpeg_exe(); SR = 44100; BPM = 144.0; P = 60 / BPM
def decode(path, ch=2):
    raw = subprocess.run([F, '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).T.copy()
def beats_of(mono):
    y = librosa.resample(mono, orig_sr=SR, target_sr=22050)
    oenv = librosa.onset.onset_strength(y=y, sr=22050, hop_length=64)
    _, b = librosa.beat.beat_track(onset_envelope=oenv, sr=22050, hop_length=64, tightness=800, start_bpm=BPM)
    return librosa.frames_to_time(b, sr=22050, hop_length=64)
def steady_stretches(bt, win=8, max_jit=0.006, lo=143.0, hi=145.3, min_len=10):
    ok = np.zeros(len(bt), bool)
    for i in range(len(bt)):
        a, b = max(0, i - win), min(len(bt), i + win + 1)
        if b - a < 2 * win: continue
        k = np.arange(b - a); p, c = np.polyfit(k, bt[a:b], 1); r = bt[a:b] - (k * p + c)
        ok[i] = r.std() < max_jit and lo < 60 / p < hi
    runs, i = [], 0
    while i < len(bt):
        if ok[i]:
            j = i
            while j + 1 < len(bt) and ok[j + 1] and abs((bt[j + 1] - bt[j]) - P) < 0.03: j += 1
            if j - i + 1 >= min_len: runs.append((i, j))
            i = j + 1
        else: i += 1
    return runs
if __name__ == '__main__':
    x = decode(SRC); mono = x.mean(0); n = x.shape[1]; dur = n / SR
    bt = beats_of(mono); runs = steady_stretches(bt)
    # anchors: within a steady stretch, its own straight-line fit every 8 beats
    # (smooth, not the tracker's per-beat jitter); between stretches, whole beats
    src, dst, gaps = [0.0], [0.0], []
    first = True
    for (i, j) in runs:
        k = np.arange(j - i + 1); p, c = np.polyfit(k, bt[i:j + 1], 1)
        pts = [c + kk * p for kk in list(range(0, j - i + 1, 8)) + ([j - i] if (j - i) % 8 else [])]
        for m, t in enumerate(pts):
            if first: src.append(t); dst.append(t); first = False; prev_t = t; continue
            span = t - src[-1]; nb = max(1, round(span / P))
            if m == 0: gaps.append({ 'from': round(src[-1], 2), 'to': round(t, 2), 'beats_in_file': round(span / P, 2), 'mapped_to': nb, 'stretch_pct': round(100 * (nb * P / span - 1), 2) })
            src.append(t); dst.append(dst[-1] + nb * P)
    tail = dur - src[-1]; src.append(dur); dst.append(dst[-1] + tail)
    S = np.array([src, dst]) * SR
    print('steady stretches:', [(round(bt[i], 1), round(bt[j], 1), j - i + 1) for i, j in runs])
    print('gaps between them:', json.dumps(gaps))
    worst = max(abs(g['stretch_pct']) for g in gaps) if gaps else 0
    # stretch within steady stretches (their own tempo -> 144.0)
    loc = np.diff(np.array(dst)) / np.maximum(np.diff(np.array(src)), 1e-9) - 1
    print('largest local speed change: %.2f%% (gaps) / %.2f%% (anywhere)' % (worst, 100 * np.abs(loc).max()))
    y = pytsmod.hptsm(x, S.astype(np.float64))
    y = np.clip(y, -1, 1).astype(np.float32)
    np.save(os.path.join(OUT, 'map.npy'), np.array([src, dst]))
    wav = os.path.join(OUT, 'straightened.wav')
    subprocess.run([F, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', wav], input=y.T.tobytes(), check=True)
    subprocess.run([F, '-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '192k', os.path.join(OUT, 'daily-theme-straightened-PREVIEW.mp3')], check=True)
    print('wrote', round(y.shape[1] / SR, 3), 's (source', round(dur, 3), 's)')
