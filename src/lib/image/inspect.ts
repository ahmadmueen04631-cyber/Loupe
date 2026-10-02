export type BasicInfo = {
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: number;
  sizeBytes: number;
  format: string;
  orientation: "Landscape" | "Portrait" | "Square";
  colorType: string | null;
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

const FORMAT_LABEL: Record<string, string> = { "image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP" };

const PNG_COLOR_TYPES: Record<number, string> = {
  0: "Grayscale",
  2: "Truecolor (RGB)",
  3: "Indexed",
  4: "Grayscale + alpha",
  6: "Truecolor + alpha (RGBA)",
};

function readPngColorType(buf: ArrayBuffer): string | null {
  const view = new DataView(buf);
  // 8-byte PNG signature, then the IHDR chunk: length(4) "IHDR"(4) width(4) height(4) bitDepth(1) colorType(1) ...
  if (view.byteLength < 26) return null;
  const bitDepth = view.getUint8(24);
  const colorType = view.getUint8(25);
  const label = PNG_COLOR_TYPES[colorType];
  return label ? `${label}, ${bitDepth}-bit` : null;
}

function readJpegColorType(buf: ArrayBuffer): string | null {
  const view = new DataView(buf);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) { offset++; continue; }
    const marker = view.getUint8(offset + 1);
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }
    if (marker === 0xd9 || marker === 0xda) break;
    const length = view.getUint16(offset + 2);
    const isSOF = (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
    if (isSOF) {
      const precision = view.getUint8(offset + 4);
      const components = view.getUint8(offset + 9);
      const label = components === 1 ? "Grayscale" : components === 3 ? "Color (YCbCr)" : components === 4 ? "CMYK" : `${components} components`;
      return `${label}, ${precision}-bit`;
    }
    offset += 2 + length;
  }
  return null;
}

export async function inspectImage(file: File): Promise<BasicInfo> {
  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();

  const divisor = gcd(width, height) || 1;
  const aspectRatio = `${width / divisor}:${height / divisor}`;
  const megapixels = Math.round((width * height) / 100000) / 10;
  const orientation = width === height ? "Square" : width > height ? "Landscape" : "Portrait";

  let colorType: string | null = null;
  try {
    const buf = await file.arrayBuffer();
    if (file.type === "image/png") colorType = readPngColorType(buf);
    else if (file.type === "image/jpeg") colorType = readJpegColorType(buf);
  } catch {
    colorType = null;
  }

  return { width, height, aspectRatio, megapixels, sizeBytes: file.size, format: FORMAT_LABEL[file.type] ?? file.type, orientation, colorType };
}
