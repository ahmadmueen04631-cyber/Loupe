import { MIME, type OutputFormat } from "./formats";
import { loadImage } from "./loadImage";

export type ResizeResult = { blob: Blob; width: number; height: number };

/**
 * Draws the source image onto a canvas at the target pixel size and re-encodes it.
 * Runs entirely in the browser — nothing is uploaded.
 */
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  format: OutputFormat,
  quality: number
): Promise<ResizeResult> {
  const { bitmap } = await loadImage(file);
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, MIME[format], quality));
  if (!blob) throw new Error("This image could not be resized. Try a different format.");
  return { blob, width, height };
}
