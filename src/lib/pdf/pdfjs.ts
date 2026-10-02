// Loaded lazily and only in the browser — pdfjs-dist needs DOM/Worker APIs unavailable during SSR.
type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;

export function getPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      return mod;
    });
  }
  return pdfjsPromise;
}

export async function loadPdf(file: File) {
  const pdfjs = await getPdfjs();
  const buf = await file.arrayBuffer();
  return pdfjs.getDocument({ data: buf }).promise;
}

/** Renders one page of an already-loaded PDF document to a JPEG blob. */
export async function renderPdfPageToJpeg(
  doc: Awaited<ReturnType<typeof loadPdf>>,
  pageNumber: number,
  quality: number,
  scale = 2
): Promise<Blob> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("This page could not be rendered.");
  return blob;
}
