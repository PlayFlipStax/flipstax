# Passages of the Daily theme with a steady click on the song's own 144 BPM grid, as a video with captions.
import os, subprocess, numpy as np, imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont
import sys; sys.path.insert(0, os.path.dirname(__file__))
from straighten_theme import decode, beats_of, steady_stretches, SRC, SR, P
F = imageio_ffmpeg.get_ffmpeg_exe(); OUT = '/Users/rickymartin/FlipStax/screenshots/qa/theme-fix'
x = decode(SRC); bt = beats_of(x.mean(0)); runs = steady_stretches(bt, min_len=18)
a0, a1 = bt[runs[0][0]], bt[runs[-1][1]]; n = round((a1 - a0) / P); Pg = (a1 - a0) / n
print('song grid: %.3f BPM, anchored %.2fs..%.2fs (%d beats)' % (60 / Pg, a0, a1, n))
grid = a0 + Pg * np.arange(-int(a0 / Pg) - 1, int((x.shape[1] / SR - a0) / Pg) + 2)
tk = np.zeros(int(0.03 * SR), np.float32); tt = np.arange(len(tk)) / SR; tk[:] = np.sin(2 * np.pi * 1760 * tt) * np.exp(-tt * 160) * 0.5
mix = x.copy()
for g in grid:
    i = int(round(g * SR))
    if 0 <= i < mix.shape[1] - len(tk): mix[:, i:i + len(tk)] += tk
PARTS = [(16, 34, '0:16-0:34  busy -> half-time -> blur at 0:24'), (46, 60, '0:46-1:00  transition at 0:52'), (74, 92, '1:14-1:32  busy section, then the 1:20 change')]
try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 34); small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 26)
except Exception: font = small = ImageFont.load_default()
segs = []
for k, (s, e, label) in enumerate(PARTS):
    img = Image.new('RGB', (960, 540), (13, 43, 94)); d = ImageDraw.Draw(img)
    d.text((480, 200), 'Daily theme + steady 144 BPM click', font=font, fill='white', anchor='mm')
    d.text((480, 270), label, font=small, fill=(255, 217, 61), anchor='mm')
    d.text((480, 340), 'The click never drifts from the music:', font=small, fill='white', anchor='mm')
    d.text((480, 380), 'the "speed-ups" are drum-pattern changes', font=small, fill='white', anchor='mm')
    png = os.path.join(OUT, 'card%d.png' % k); img.save(png)
    a = mix[:, int(s * SR):int(e * SR)].copy(); fade = int(0.3 * SR); r = np.linspace(0, 1, fade, dtype=np.float32)
    a[:, :fade] *= r; a[:, -fade:] *= r[::-1]
    a = np.concatenate([a, np.zeros((2, int(0.8 * SR)), np.float32)], 1)
    wav = os.path.join(OUT, 'part%d.wav' % k)
    subprocess.run([F, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', wav], input=np.clip(a, -1, 1).T.tobytes(), check=True)
    mp4 = os.path.join(OUT, 'part%d.mp4' % k)
    subprocess.run([F, '-v', 'error', '-y', '-loop', '1', '-i', png, '-i', wav, '-c:v', 'libx264', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', '10', '-c:a', 'aac', '-b:a', '192k', '-shortest', mp4], check=True)
    segs.append(mp4)
lst = os.path.join(OUT, 'parts.txt'); open(lst, 'w').write(''.join("file '%s'\n" % p for p in segs))
final = '/Users/rickymartin/FlipStax/screenshots/qa/daily-theme-click-check.mp4'
subprocess.run([F, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', final], check=True)
print('wrote', final, os.path.getsize(final) // 1024, 'KB')
