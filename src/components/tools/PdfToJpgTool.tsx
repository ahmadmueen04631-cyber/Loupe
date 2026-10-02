"use client";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { NumberField } from "@/components/ui/NumberField";
import { QualitySlider } from "@/components/ui/QualitySlider";
import { useToast } from "@/components/ui/Toast";
import { loadPdf, renderPdfPageToJpeg } from "@/lib/pdf/pdfjs";
import { buildZip } from "@/lib/image/zip";

type PageResult = { pageNumber: number; blob: Blob; url: string };

export function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [quality, setQuality] = useState(0.85);
  const [results, setResults] = useState<PageResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResults([]);
    setError(null);
    try {
      const doc = await loadPdf(f);
      setPageCount(doc.numPages);
      setFrom(1);
      setTo(doc.numPages);
    } catch {
      setError("This PDF could not be read. It may be encrypted or corrupted.");
      setPageCount(null);
    }
  }, []);

  const reset = () => { setFile(null); setPageCount(null); setResults([]); setError(null); };

  const convert = async () => {
    if (!file || !pageCount) return;
    const start = Math.max(1, Math.min(from, to));
    const end = Math.min(pageCount, Math.max(from, to));
    setBusy(true);
    setResults([]);
    try {
      const doc = await loadPdf(file);
      const out: PageResult[] = [];
      for (let p = start; p <= end; p++) {
        const blob = await renderPdfPageToJpeg(doc, p, quality);
        out.push({ pageNumber: p, blob, url: URL.createObjectURL(blob) });
      }
      setResults(out);
    } catch {
      setError("Some pages could not be converted. Try a smaller page range.");
    } finally {
      setBusy(false);
    }
  };

  const download = (r: PageResult) => {
    const a = document.createElement("a");
    a.href = r.url; a.download = `${file?.name.replace(/\.pdf$/i, "") ?? "page"}-p${r.pageNumber}.jpg`; a.click();
    toast(`Downloaded page ${r.pageNumber}`);
  };

  const downloadAll = async () => {
    const base = file?.name.replace(/\.pdf$/i, "") ?? "pages";
    const entries = await Promise.all(results.map(async (r) => ({ name: `${base}-p${r.pageNumber}.jpg`, data: new Uint8Array(await r.blob.arrayBuffer()) })));
    const zip = buildZip(entries);
    const url = URL.createObjectURL(zip);
    const a = document.createElement("a");
    a.href = url; a.download = `${base}-pages.zip`; a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${entries.length} pages`);
  };

  if (!file) return <UploadDropzone onFiles={handleFiles} multiple={false} acceptedTypes={["application/pdf"]} hint="PDF only, up to 40 MB" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted">{pageCount ? `${pageCount} page${pageCount > 1 ? "s" : ""}` : "Reading…"}</p>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {results.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {results.map((r) => (
              <div key={r.pageNumber} className="overflow-hidden rounded-xl border border-line bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={`Page ${r.pageNumber}`} className="aspect-[3/4] w-full object-cover" />
                <div className="flex items-center justify-between p-2 text-xs">
                  <span className="text-muted">Page {r.pageNumber}</span>
                  <button onClick={() => download(r)} className="rounded-full bg-accent px-2 py-1 font-medium text-accent-ink">Download</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
          <button onClick={convert} disabled={!pageCount || busy} className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:brightness-110 disabled:opacity-50">
            {busy ? "Converting…" : "Convert pages"}
          </button>
          {results.length > 1 && <button onClick={downloadAll} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Download all</button>}
        </div>
      </div>

      <aside className="h-fit space-y-5 rounded-2xl border border-line bg-surface p-5">
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="from" label="From page" value={from} onChange={setFrom} disabled={!pageCount} />
          <NumberField id="to" label="To page" value={to} onChange={setTo} disabled={!pageCount} />
        </div>
        <QualitySlider value={quality} onChange={setQuality} />
      </aside>
    </div>
  );
}
