import { MIME, type OutputFormat } from "./formats";

export type Rect = { x: number; y: number; w: number; h: number };

/** Crops a rect (in the source canvas's own pixel coordinates) and re-encodes it. Runs entirely in the browser. */
export async function exportCrop(source: HTMLCanvasElement, rect: Rect, format: OutputFormat, quality: number): Promise<Blob> {
  const width = Math.max(1, Math.round(rect.w));
  const height = Math.max(1, Math.round(rect.h));
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, MIME[format], quality));
  if (!blob) throw new Error("This crop could not be exported. Try a different format.");
  return blob;
}

export function inscribe(natW: number, natH: number, ratio: number | null): Rect {
  if (!ratio) return { x: natW * 0.1, y: natH * 0.1, w: natW * 0.8, h: natH * 0.8 };
  let w = natW * 0.8;
  let h = w / ratio;
  if (h > natH * 0.8) { h = natH * 0.8; w = h * ratio; }
  return { x: (natW - w) / 2, y: (natH - h) / 2, w, h };
}
