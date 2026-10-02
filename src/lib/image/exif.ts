export type ExifData = {
  make?: string;
  model?: string;
  dateTaken?: string;
  orientation?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  focalLength?: string;
  hasGps: boolean;
  dpi?: { dpiX: number; dpiY: number };
};

const ORIENTATION_LABEL: Record<number, string> = {
  1: "Normal", 2: "Flipped horizontally", 3: "Rotated 180°", 4: "Flipped vertically",
  5: "Rotated 90° CW, flipped", 6: "Rotated 90° CW", 7: "Rotated 90° CCW, flipped", 8: "Rotated 90° CCW",
};

// Tag IDs we care about, from the EXIF/TIFF spec.
const TAG = {
  Make: 0x010f, Model: 0x0110, Orientation: 0x0112, ExifIFDPointer: 0x8769, GPSIFDPointer: 0x8825,
  DateTimeOriginal: 0x9003, ExposureTime: 0x829a, FNumber: 0x829d, ISOSpeedRatings: 0x8827, FocalLength: 0x920a,
  XResolution: 0x011a, YResolution: 0x011b, ResolutionUnit: 0x0128,
};

type TiffEntry = { type: number; count: number; value: number | number[] | string };

function findJpegExifSegment(view: DataView): { base: number; length: number } | null {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) { offset++; continue; }
    const marker = view.getUint8(offset + 1);
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }
    if (marker === 0xd9 || marker === 0xda) break;
    const length = view.getUint16(offset + 2);
    if (marker === 0xe1 && offset + 10 <= view.byteLength) {
      const sig = String.fromCharCode(...Array.from({ length: 4 }, (_, i) => view.getUint8(offset + 4 + i)));
      if (sig === "Exif") return { base: offset + 10, length: length - 8 };
    }
    offset += 2 + length;
  }
  return null;
}

function readIFD(view: DataView, tiffStart: number, ifdOffset: number, little: boolean): { entries: Map<number, TiffEntry>; next: number } {
  const entries = new Map<number, TiffEntry>();
  const count = view.getUint16(tiffStart + ifdOffset, little);
  for (let i = 0; i < count; i++) {
    const entryOffset = tiffStart + ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, little);
    const type = view.getUint16(entryOffset + 2, little);
    const num = view.getUint32(entryOffset + 4, little);
    const typeSize = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 }[type] ?? 1;
    const totalSize = typeSize * num;
    const dataOffset = totalSize <= 4 ? entryOffset + 8 : tiffStart + view.getUint32(entryOffset + 8, little);
    let value: number | number[] | string;
    if (type === 2) {
      // ASCII string
      const bytes: number[] = [];
      for (let j = 0; j < num - 1 && dataOffset + j < view.byteLength; j++) bytes.push(view.getUint8(dataOffset + j));
      value = String.fromCharCode(...bytes).trim();
    } else if (type === 3) {
      value = num === 1 ? view.getUint16(dataOffset, little) : Array.from({ length: num }, (_, j) => view.getUint16(dataOffset + j * 2, little));
    } else if (type === 5 || type === 10) {
      const nAcc = view.getInt32(dataOffset, little) || view.getUint32(dataOffset, little);
      const dAcc = view.getUint32(dataOffset + 4, little);
      value = [nAcc, dAcc];
    } else {
      value = view.getUint32(dataOffset, little);
    }
    entries.set(tag, { type, count: num, value });
  }
  const next = view.getUint32(tiffStart + ifdOffset + 2 + count * 12, little) || 0;
  return { entries, next };
}

function formatRational(v: unknown, kind: "shutter" | "fnumber" | "focal"): string | undefined {
  if (!Array.isArray(v) || v.length !== 2 || v[1] === 0) return undefined;
  const val = v[0] / v[1];
  if (kind === "shutter") return val < 1 ? `1/${Math.round(1 / val)}s` : `${val.toFixed(1)}s`;
  if (kind === "fnumber") return `f/${val.toFixed(1)}`;
  return `${Math.round(val)}mm`;
}

/** Reads camera and orientation metadata from a JPEG's EXIF block. Returns null when the file has none. Runs entirely in the browser. */
export async function readExif(file: File): Promise<ExifData | null> {
  if (file.type !== "image/jpeg") return null;
  const buf = await file.arrayBuffer();
  const view = new DataView(buf);
  const segment = findJpegExifSegment(view);
  if (!segment) return null;

  const { base } = segment;
  const byteOrder = view.getUint16(base);
  if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) return null;
  const little = byteOrder === 0x4949;
  if (view.getUint16(base + 2, little) !== 42) return null;
  const ifd0Offset = view.getUint32(base + 4, little);

  const { entries: ifd0 } = readIFD(view, base, ifd0Offset, little);
  let exifEntries = new Map<number, TiffEntry>();
  const exifPointer = ifd0.get(TAG.ExifIFDPointer);
  if (exifPointer && typeof exifPointer.value === "number") {
    exifEntries = readIFD(view, base, exifPointer.value, little).entries;
  }

  const asString = (e?: TiffEntry) => (e && typeof e.value === "string" ? e.value : undefined);
  const orientationNum = ifd0.get(TAG.Orientation)?.value;

  const data: ExifData = {
    make: asString(ifd0.get(TAG.Make)),
    model: asString(ifd0.get(TAG.Model)),
    dateTaken: asString(exifEntries.get(TAG.DateTimeOriginal)),
    orientation: typeof orientationNum === "number" ? ORIENTATION_LABEL[orientationNum] : undefined,
    exposureTime: formatRational(exifEntries.get(TAG.ExposureTime)?.value, "shutter"),
    fNumber: formatRational(exifEntries.get(TAG.FNumber)?.value, "fnumber"),
    iso: typeof exifEntries.get(TAG.ISOSpeedRatings)?.value === "number" ? String(exifEntries.get(TAG.ISOSpeedRatings)!.value) : undefined,
    focalLength: formatRational(exifEntries.get(TAG.FocalLength)?.value, "focal"),
    hasGps: ifd0.has(TAG.GPSIFDPointer),
  };

  const xRes = ifd0.get(TAG.XResolution)?.value;
  const yRes = ifd0.get(TAG.YResolution)?.value;
  const unit = ifd0.get(TAG.ResolutionUnit)?.value; // 2 = inches, 3 = cm
  if (Array.isArray(xRes) && xRes[1] > 0) {
    let dpiX = xRes[0] / xRes[1];
    let dpiY = Array.isArray(yRes) && yRes[1] > 0 ? yRes[0] / yRes[1] : dpiX;
    if (unit === 3) { dpiX *= 2.54; dpiY *= 2.54; }
    if (dpiX > 0) data.dpi = { dpiX: Math.round(dpiX), dpiY: Math.round(dpiY) };
  }

  const hasAnyData = Object.entries(data).some(([k, v]) => k !== "hasGps" && v !== undefined);
  return hasAnyData || data.hasGps ? data : null;
}
