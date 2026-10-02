import { PAGE_PT } from "@/lib/pdf/imageToPdf";

export type PrintSheetOptions = {
  copies: number;
  pageSize: "a4" | "letter";
  orientation: "portrait" | "landscape";
  marginPt: number;
  spacingPt: number;
};

/** Tiles copies of one photo across one or more PDF pages at true physical size. Lazy-loads pdf-lib. */
export async function buildPrintSheet(photoJpegBytes: Uint8Array, photoWpx: number, photoHpx: number, dpi: number, opts: PrintSheetOptions): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const jpgImage = await pdfDoc.embedJpg(photoJpegBytes);

  const ptPerPx = 72 / dpi;
  const photoW = photoWpx * ptPerPx;
  const photoH = photoHpx * ptPerPx;

  let [pageW, pageH] = PAGE_PT[opts.pageSize];
  if (opts.orientation === "landscape" && pageW < pageH) [pageW, pageH] = [pageH, pageW];
  if (opts.orientation === "portrait" && pageW > pageH) [pageW, pageH] = [pageH, pageW];

  const cols = Math.max(1, Math.floor((pageW - 2 * opts.marginPt + opts.spacingPt) / (photoW + opts.spacingPt)));
  const rows = Math.max(1, Math.floor((pageH - 2 * opts.marginPt + opts.spacingPt) / (photoH + opts.spacingPt)));
  const perPage = cols * rows;
  const pageCount = Math.max(1, Math.ceil(opts.copies / perPage));

  let remaining = opts.copies;
  for (let p = 0; p < pageCount; p++) {
    const page = pdfDoc.addPage([pageW, pageH]);
    for (let r = 0; r < rows && remaining > 0; r++) {
      for (let c = 0; c < cols && remaining > 0; c++) {
        const x = opts.marginPt + c * (photoW + opts.spacingPt);
        const yFromTop = opts.marginPt + r * (photoH + opts.spacingPt);
        const y = pageH - yFromTop - photoH;
        page.drawImage(jpgImage, { x, y, width: photoW, height: photoH });
        remaining--;
      }
    }
  }

  const bytes = await pdfDoc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}
