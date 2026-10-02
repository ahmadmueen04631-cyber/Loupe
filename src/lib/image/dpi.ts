export type DpiInfo = { dpiX: number; dpiY: number; source: "EXIF" | "JFIF" | "PNG" } | null;

function readPngDpi(view: DataView): DpiInfo {
  let offset = 8; // past the 8-byte PNG signature
  while (offset + 8 <= view.byteLength) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7));
    if (type === "pHYs" && offset + 8 + 9 <= view.byteLength) {
      const ppuX = view.getUint32(offset + 8);
      const ppuY = view.getUint32(offset + 12);
      const unit = view.getUint8(offset + 16); // 1 = meter, 0 = unknown (aspect ratio only)
      if (unit === 1 && ppuX > 0 && ppuY > 0) {
        return { dpiX: Math.round(ppuX * 0.0254), dpiY: Math.round(ppuY * 0.0254), source: "PNG" };
      }
      return null;
    }
    if (type === "IDAT" || type === "IEND") break;
    offset += 8 + length + 4; // data + CRC
  }
  return null;
}

function readJfifDpi(view: DataView): DpiInfo {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) { offset++; continue; }
    const marker = view.getUint8(offset + 1);
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }
    if (marker === 0xd9 || marker === 0xda) break;
    const length = view.getUint16(offset + 2);
    if (marker === 0xe0 && offset + 18 <= view.byteLength) {
      const sig = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7));
      if (sig === "JFIF") {
        const units = view.getUint8(offset + 11); // 0 = aspect only, 1 = dpi, 2 = dots/cm
        const x = view.getUint16(offset + 12);
        const y = view.getUint16(offset + 14);
        if (units === 1 && x > 0) return { dpiX: x, dpiY: y, source: "JFIF" };
        if (units === 2 && x > 0) return { dpiX: Math.round(x * 2.54), dpiY: Math.round(y * 2.54), source: "JFIF" };
      }
      return null;
    }
    offset += 2 + length;
  }
  return null;
}

/** Reads DPI from a PNG pHYs chunk, a JPEG JFIF density header, or falls back to EXIF resolution tags. */
export async function readDpi(file: File, exifDpi?: { dpiX: number; dpiY: number } | null): Promise<DpiInfo> {
  if (file.type === "image/png") {
    const buf = await file.arrayBuffer();
    return readPngDpi(new DataView(buf));
  }
  if (file.type === "image/jpeg") {
    if (exifDpi && exifDpi.dpiX > 0) return { ...exifDpi, source: "EXIF" };
    const buf = await file.arrayBuffer();
    return readJfifDpi(new DataView(buf));
  }
  return null;
}
