import type { Rect } from "./crop";
import { buildIco } from "./ico";
import { buildZip } from "./zip";

async function renderIconPng(source: HTMLCanvasElement, rect: Rect, size: number): Promise<Blob> {
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, size, size);
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("This icon could not be rendered.");
  return blob;
}

const ICO_SIZES = [16, 32, 48];
const STANDALONE_SIZES = [16, 32, 180, 192, 512];

/** Renders the cropped square region at every favicon size and packages everything into a downloadable ZIP. */
export async function buildFaviconPackage(source: HTMLCanvasElement, rect: Rect): Promise<Blob> {
  const uniqueSizes = Array.from(new Set([...ICO_SIZES, ...STANDALONE_SIZES]));
  const bySize = new Map<number, Blob>();
  for (const size of uniqueSizes) bySize.set(size, await renderIconPng(source, rect, size));

  const icoBlob = await buildIco(ICO_SIZES.map((size) => ({ size, blob: bySize.get(size)! })));

  const manifest = {
    name: "",
    icons: [
      { src: "android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };

  const toBytes = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

  const entries = [
    { name: "favicon.ico", data: await toBytes(icoBlob) },
    { name: "favicon-16x16.png", data: await toBytes(bySize.get(16)!) },
    { name: "favicon-32x32.png", data: await toBytes(bySize.get(32)!) },
    { name: "apple-touch-icon.png", data: await toBytes(bySize.get(180)!) },
    { name: "android-chrome-192x192.png", data: await toBytes(bySize.get(192)!) },
    { name: "android-chrome-512x512.png", data: await toBytes(bySize.get(512)!) },
    { name: "site.webmanifest", data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) },
  ];

  return buildZip(entries);
}
