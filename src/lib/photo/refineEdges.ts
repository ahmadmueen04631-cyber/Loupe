/**
 * Softens the segmentation mask's alpha channel with a small box blur, applied to alpha only
 * (RGB untouched). Hard-edged ML masks often leave a thin halo of the original background color
 * baked into the subject's edge pixels — this takes the harshest edge off that fringe. Cheap: runs
 * once on the cutout right after background removal, not on every redraw.
 */
export function featherAlpha(canvas: HTMLCanvasElement, radius = 1): void {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const src = ctx.getImageData(0, 0, w, h);
  const out = new Uint8ClampedArray(src.data);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = src.data[i + 3];
      // Only touch edge pixels (partial alpha) — fully opaque/transparent regions are left as-is.
      if (a === 0 || a === 255) continue;
      let sum = 0, count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
          sum += src.data[(ny * w + nx) * 4 + 3];
          count++;
        }
      }
      out[i + 3] = Math.round(sum / count);
    }
  }
  ctx.putImageData(new ImageData(out, w, h), 0, 0);
}
