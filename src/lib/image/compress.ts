import { MIME, type OutputFormat } from "./formats";
import { loadImage } from "./loadImage";

export type CompressResult = { blob: Blob; width: number; height: number };

/**
 * Re-encodes an image on a canvas at the given quality (0-1, ignored for PNG).
 * Runs entirely in the browser — the file never leaves the device.
 */
export async function compressImage(file: File, format: OutputFormat, quality: number): Promise<CompressResult> {
  const { bitmap, width, height } = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  if (format === "jpeg") {
    // JPEG has no alpha channel; flatten onto white so transparency doesn't turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, MIME[format], quality));
  if (!blob) throw new Error("This image could not be encoded. Try a different format.");
  return { blob, width, height };
}
