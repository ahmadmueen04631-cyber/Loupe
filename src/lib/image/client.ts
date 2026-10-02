import { encodeBitmap, type OutputMime } from "./encode";

type Pending = { resolve: (b: Blob) => void; reject: (e: Error) => void };
let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, Pending>();

function getWorker(): Worker | null {
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return null;
  if (!worker) {
    worker = new Worker(new URL("./compress.worker.ts", import.meta.url));
    worker.onmessage = (e: MessageEvent<{ id: number; blob?: Blob; error?: string }>) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      if (e.data.blob) p.resolve(e.data.blob); else p.reject(new Error(e.data.error ?? "Processing failed."));
    };
    worker.onerror = () => {
      pending.forEach((p) => p.reject(new Error("Processing failed. Please try again.")));
      pending.clear(); worker = null;
    };
  }
  return worker;
}

/** Re-encodes an image off the main thread when the browser supports it. */
export async function reencode(file: File, mime: OutputMime, quality: number): Promise<Blob> {
  const w = getWorker();
  if (w) return new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); w.postMessage({ id, file, mime, quality }); });
  try {
    const bitmap = await createImageBitmap(file);
    try { return await encodeBitmap(bitmap, mime, quality); } finally { bitmap.close(); }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Your browser")) throw err;
    throw new Error("This file couldn't be read as an image. It may be corrupted.");
  }
}
