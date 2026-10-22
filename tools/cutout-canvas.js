// FlipStax - cut a character out of a flat grey studio backdrop in Chrome's canvas (Run 4A; the Mac's tools/cutout.swift
// is not on Windows). Run it in a page on the dev server (same origin as the picture), e.g. with Runtime.evaluate over
// CDP: it reads window.__cutSrc (default incoming-assets/purple-presenting.jpeg), keys out every pixel that is grey and
// light (low saturation) and connected to the border - plus any enclosed grey patch over 2500 px (the gap inside a bent
// arm) - softens the edge, trims, scales to 900 px tall and leaves a WebP data URL in window.__cut.url.
// Known limit: silver details the colour of the backdrop (star tips) get keyed out too.
(async function(){
  const blob = await (await fetch(window.__cutSrc || '/incoming-assets/purple-presenting.jpeg')).blob();
  const img = await createImageBitmap(new Blob([blob], { type:'image/jpeg' }));
  const W = img.width, H = img.height;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
  const id = cx.getImageData(0, 0, W, H), p = id.data;
  // the backdrop per row: the mean of the outer 24 px each side
  const bg = new Float32Array(H * 3);
  for (let y = 0; y < H; y++){ let r = 0, g = 0, b = 0, n = 0;
    for (const x0 of [0, W - 24]) for (let x = x0; x < x0 + 24; x++){ const i = (y * W + x) * 4; r += p[i]; g += p[i + 1]; b += p[i + 2]; n++; }
    bg[y * 3] = r / n; bg[y * 3 + 1] = g / n; bg[y * 3 + 2] = b / n; }
  const dist = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const i = (y * W + x) * 4, k = y * 3;
    const dr = p[i] - bg[k], dg = p[i + 1] - bg[k + 1], db = p[i + 2] - bg[k + 2];
    const mx = Math.max(p[i], p[i + 1], p[i + 2]), mn = Math.min(p[i], p[i + 1], p[i + 2]);
    const sat = mx - mn, lum = 0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2];
    dist[y * W + x] = Math.max(0, (sat - 6) * 2.2, (110 - lum) * 1.2); }
  // flood fill from the border through backdrop-like pixels
  const T = 30, isBg = new Uint8Array(W * H), q = new Int32Array(W * H); let qh = 0, qt = 0;
  const push = (j)=>{ if (!isBg[j] && dist[j] < T){ isBg[j] = 1; q[qt++] = j; } };
  for (let x = 0; x < W; x++){ push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++){ push(y * W); push(y * W + W - 1); }
  while (qh < qt){ const j = q[qh++], x = j % W, y = (j / W) | 0;
    if (x > 0) push(j - 1); if (x < W - 1) push(j + 1); if (y > 0) push(j - W); if (y < H - 1) push(j + W); }
  // enclosed backdrop (the gap inside a bent arm): any other backdrop-like patch bigger than 2500 px
  const seen = new Uint8Array(W * H);
  for (let s = 0; s < W * H; s++){ if (isBg[s] || seen[s] || dist[s] >= T) continue;
    const comp = [s]; seen[s] = 1;
    for (let h = 0; h < comp.length; h++){ const j = comp[h], x = j % W, y = (j / W) | 0;
      for (const n of [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < H - 1 ? j + W : -1]) if (n >= 0 && !seen[n] && !isBg[n] && dist[n] < T){ seen[n] = 1; comp.push(n); } }
    if (comp.length > 2500) comp.forEach(j=> isBg[j] = 1); }
  // alpha: 0 on the backdrop; a soft ramp on pixels next to it; unmix the backdrop out of the edge colours
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const j = y * W + x, i = j * 4;
    if (isBg[j]){ p[i + 3] = 0; continue; }
    let edge = false;
    for (let dy = -2; dy <= 2 && !edge; dy++) for (let dx = -2; dx <= 2; dx++){ const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && isBg[yy * W + xx]){ edge = true; break; } }
    let a = 1;
    if (edge) a = Math.max(0, Math.min(1, (dist[j] - T * 0.9) / 40));
    if (a > 0 && a < 1){ const k = y * 3; for (let c = 0; c < 3; c++) p[i + c] = Math.max(0, Math.min(255, (p[i + c] - (1 - a) * bg[k + c]) / a)); }
    p[i + 3] = Math.round(a * 255);
    if (a > 0.1){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  cx.putImageData(id, 0, 0);
  // trim, 900 px tall
  const th = 900, tw = Math.round((x1 - x0 + 1) * th / (y1 - y0 + 1));
  const out = document.createElement('canvas'); out.width = tw; out.height = th;
  const ox = out.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(cv, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, tw, th);
  window.__cut = { w: tw, h: th, box: [x0, y0, x1, y1], url: out.toDataURL('image/webp', 0.88) };
})().catch(e=>{ window.__cut = { err: String(e) }; });
