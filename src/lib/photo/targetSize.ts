import { canvasToBlob } from "./composite";

/** Binary-searches JPEG/WEBP quality to land close to a target byte size. PNG has no quality knob, so it's returned as-is. */
export async function encodeToTargetSize(canvas: HTMLCanvasElement, mime: string, targetBytes: number): Promise<Blob> {
  if (mime === "image/png") return canvasToBlob(canvas, mime);

  let lo = 0.3, hi = 0.95;
  let best = await canvasToBlob(canvas, mime, hi);
  for (let i = 0; i < 6; i++) {
    const mid = (lo + hi) / 2;
    const blob = await canvasToBlob(canvas, mime, mid);
    if (blob.size > targetBytes) hi = mid; else { best = blob; lo = mid; }
  }
  return best;
}
