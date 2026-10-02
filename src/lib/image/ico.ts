/**
 * Builds a Windows .ico file from one or more PNG images. Modern ICO readers
 * (Windows Vista+, every current browser and OS) accept PNG-compressed frames
 * directly inside the ICO container, so no bitmap re-encoding is needed —
 * this is just the ICONDIR header and a directory entry per image.
 */
export async function buildIco(images: { size: number; blob: Blob }[]): Promise<Blob> {
  const buffers = await Promise.all(images.map((i) => i.blob.arrayBuffer()));
  const headerSize = 6 + 16 * images.length;
  const totalSize = headerSize + buffers.reduce((s, b) => s + b.byteLength, 0);
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, images.length, true);

  let dataOffset = headerSize;
  images.forEach((img, i) => {
    const entry = 6 + i * 16;
    const dim = img.size >= 256 ? 0 : img.size; // 0 means 256 in the ICO format
    view.setUint8(entry, dim); // width
    view.setUint8(entry + 1, dim); // height
    view.setUint8(entry + 2, 0); // color palette count
    view.setUint8(entry + 3, 0); // reserved
    view.setUint16(entry + 4, 1, true); // color planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, buffers[i].byteLength, true);
    view.setUint32(entry + 12, dataOffset, true);
    out.set(new Uint8Array(buffers[i]), dataOffset);
    dataOffset += buffers[i].byteLength;
  });

  return new Blob([out], { type: "image/x-icon" });
}
