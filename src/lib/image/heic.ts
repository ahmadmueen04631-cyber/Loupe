/**
 * Decodes a HEIC/HEIF file to JPEG using heic2any (a WASM build of libheif).
 * Loaded lazily so the ~1.5MB decoder never ships to pages that don't need it.
 */
export async function convertHeicToJpeg(file: File, quality: number): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality });
  return Array.isArray(result) ? result[0] : result;
}
