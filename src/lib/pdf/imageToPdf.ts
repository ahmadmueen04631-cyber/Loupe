export type PageSizeOption = "a4" | "letter" | "fit";
export type Orientation = "portrait" | "landscape" | "auto";
export type Margin = "none" | "small" | "large";

export const PAGE_PT: Record<"a4" | "letter", [number, number]> = { a4: [595.28, 841.89], letter: [612, 792] };
const MARGIN_PT: Record<Margin, number> = { none: 0, small: 36, large: 72 };

export type PdfOptions = { pageSize: PageSizeOption; orientation: Orientation; margin: Margin; quality: number };

/** Builds a multi-page PDF from images, one per page. Everything runs in the browser via pdf-lib. */
export async function buildImagePdf(files: File[], opts: PdfOptions): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const jpegBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", opts.quality));
    if (!jpegBlob) throw new Error(`Could not process ${file.name}.`);
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const jpgImage = await pdfDoc.embedJpg(jpegBytes);
    const imgAspect = jpgImage.width / jpgImage.height;

    let pageW: number;
    let pageH: number;
    if (opts.pageSize === "fit") {
      pageW = jpgImage.width;
      pageH = jpgImage.height;
    } else {
      let [w, h] = PAGE_PT[opts.pageSize];
      const wantLandscape = opts.orientation === "landscape" || (opts.orientation === "auto" && imgAspect > 1);
      if (wantLandscape && w < h) [w, h] = [h, w];
      if (!wantLandscape && w > h) [w, h] = [h, w];
      pageW = w;
      pageH = h;
    }

    const margin = MARGIN_PT[opts.margin];
    const page = pdfDoc.addPage([pageW, pageH]);
    const availW = Math.max(1, pageW - margin * 2);
    const availH = Math.max(1, pageH - margin * 2);
    let drawW = availW;
    let drawH = availW / imgAspect;
    if (drawH > availH) { drawH = availH; drawW = availH * imgAspect; }
    page.drawImage(jpgImage, { x: (pageW - drawW) / 2, y: (pageH - drawH) / 2, width: drawW, height: drawH });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
