import { buildIco } from "./ico";
import { inscribe } from "./crop";

const SIZES = [16, 32, 48, 64, 128, 256];

async function renderSquarePng(bitmap: ImageBitmap, size: number): Promise<Blob> {
  const rect = inscribe(bitmap.width, bitmap.height, 1); // largest centered square
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, rect.x, rect.y, rect.w, rect.h, 0, 0, size, size);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("This image could not be converted.");
  return blob;
}

/** Center-crops the image to a square and packs it into a multi-size .ico file. */
export async function convertToIco(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const images = await Promise.all(SIZES.map(async (size) => ({ size, blob: await renderSquarePng(bitmap, size) })));
    return buildIco(images);
  } finally {
    bitmap.close();
  }
}
