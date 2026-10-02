import { encodeBitmap, type OutputMime } from "./encode";

self.onmessage = async (e: MessageEvent<{ id: number; file: File; mime: OutputMime; quality: number }>) => {
  const { id, file, mime, quality } = e.data;
  try {
    const bitmap = await createImageBitmap(file);
    try { self.postMessage({ id, blob: await encodeBitmap(bitmap, mime, quality) }); }
    finally { bitmap.close(); }
  } catch (err) {
    const known = err instanceof Error && err.message.startsWith("Your browser");
    self.postMessage({ id, error: known ? (err as Error).message : "This file couldn't be read as an image. It may be corrupted." });
  }
};
