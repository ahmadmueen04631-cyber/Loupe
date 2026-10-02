/** Draws a bitmap rotated by 0/90/180/270 degrees onto a fresh canvas (always from the original, so repeated rotation never degrades quality). */
export function rotateBitmap(bitmap: ImageBitmap, degrees: 0 | 90 | 180 | 270): HTMLCanvasElement {
  const swapped = degrees === 90 || degrees === 270;
  const w = bitmap.width;
  const h = bitmap.height;
  const canvas = document.createElement("canvas");
  canvas.width = swapped ? h : w;
  canvas.height = swapped ? w : h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(bitmap, -w / 2, -h / 2);
  return canvas;
}
