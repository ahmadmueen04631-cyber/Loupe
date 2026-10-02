/**
 * Removes a photo's background entirely in the browser, using @imgly/background-removal
 * (an ONNX segmentation model run via WASM, automatically offloaded to a Web Worker).
 *
 * Note on privacy: the photo itself is never uploaded anywhere — segmentation runs on-device.
 * The first time this tool is used, the browser does download the segmentation model itself
 * (a few MB) from imgly's CDN; the browser then caches it for next time. That one-time model
 * download is separate from, and does not include, the user's photo.
 */
export async function removeBackground(file: File, onProgress?: (fraction: number) => void): Promise<Blob> {
  const { removeBackground: removeBg } = await import("@imgly/background-removal");
  return removeBg(file, {
    output: { format: "image/png", quality: 1 },
    progress: (_key: string, current: number, total: number) => {
      if (total > 0) onProgress?.(Math.min(1, current / total));
    },
  });
}
