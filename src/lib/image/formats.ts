export type OutputFormat = "jpeg" | "png" | "webp";

export const MIME: Record<OutputFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const EXT: Record<OutputFormat, string> = { jpeg: "jpg", png: "png", webp: "webp" };

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
}

export function swapExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
}

/** Returns a browser-usable check: can this browser encode this output format? */
export async function canEncode(format: OutputFormat): Promise<boolean> {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, MIME[format]));
  if (!blob) return false;
  // Browsers that don't support a format silently re-encode as PNG.
  return format === "png" || blob.type === MIME[format];
}
