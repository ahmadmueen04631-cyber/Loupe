export type OutputMime = "image/jpeg" | "image/webp" | "image/png";

/** Works on the main thread and inside a Web Worker (OffscreenCanvas). */
export async function encodeBitmap(bitmap: ImageBitmap, mime: OutputMime, quality: number): Promise<Blob> {
  const { width, height } = bitmap;
  let blob: Blob | null;
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't start image processing.");
    if (mime === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height); }
    ctx.drawImage(bitmap, 0, 0);
    blob = await canvas.convertToBlob({ type: mime, quality });
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't start image processing.");
    if (mime === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height); }
    ctx.drawImage(bitmap, 0, 0);
    blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, mime, quality));
  }
  // Browsers silently fall back to PNG when they can't encode the requested type.
  if (!blob || blob.type !== mime) throw new Error(`Your browser can't save ${mime.replace("image/", "").toUpperCase()} files. Try JPG or PNG instead.`);
  return blob;
}
