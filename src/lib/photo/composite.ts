import type { Rect } from "@/lib/image/crop";

/** Crops the subject (a canvas with transparency) to `rect` and composites it over a solid background at the target pixel size. */
export function compositePhoto(source: HTMLCanvasElement, rect: Rect, bgColor: string | null, targetW: number, targetH: number): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(targetW));
  out.height = Math.max(1, Math.round(targetH));
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, out.width, out.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, out.width, out.height);
  return out;
}

export async function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error("This image could not be exported.");
  return blob;
}

/**
 * Finds the bounding box of non-transparent pixels, so the crop can be centered on the actual
 * subject rather than the full canvas. Scans a downsized copy for speed on large photos.
 */
export function findSubjectBounds(source: HTMLCanvasElement): Rect {
  const maxDim = 300;
  const scale = Math.min(1, maxDim / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));
  const small = document.createElement("canvas");
  small.width = w; small.height = h;
  const ctx = small.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { x: 0, y: 0, w: source.width, h: source.height };
  ctx.drawImage(source, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
  const ALPHA_THRESHOLD = 20;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > ALPHA_THRESHOLD) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return { x: 0, y: 0, w: source.width, h: source.height };
  return { x: minX / scale, y: minY / scale, w: (maxX - minX) / scale, h: (maxY - minY) / scale };
}

/** Centers a crop of the given aspect ratio on the detected subject, with headroom, clamped to the image bounds. */
export function centerCropOnSubject(natW: number, natH: number, ratio: number, bbox: Rect): Rect {
  const PADDING = 1.4;
  let h = bbox.h * PADDING;
  let w = h * ratio;
  if (w < bbox.w * PADDING) { w = bbox.w * PADDING; h = w / ratio; }
  w = Math.min(w, natW);
  h = Math.min(h, natH);
  if (w / h > ratio) w = h * ratio; else h = w / ratio;
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  const x = Math.max(0, Math.min(natW - w, cx - w / 2));
  const y = Math.max(0, Math.min(natH - h, cy - h / 2));
  return { x, y, w, h };
}
