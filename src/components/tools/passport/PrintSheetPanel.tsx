"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { buildPrintSheet, type PrintSheetOptions } from "@/lib/photo/printSheet";

export default function PrintSheetPanel({ photoBlob, photoWpx, photoHpx, dpi }: { photoBlob: Blob | null; photoWpx: number; photoHpx: number; dpi: number }) {
  const [copies, setCopies] = useState(6);
  const [pageSize, setPageSize] = useState<PrintSheetOptions["pageSize"]>("a4");
  const [orientation, setOrientation] = useState<PrintSheetOptions["orientation"]>("portrait");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const download = async () => {
    if (!photoBlob) { toast("Generate a photo first."); return; }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await photoBlob.arrayBuffer());
      const pdf = await buildPrintSheet(bytes, photoWpx, photoHpx, dpi, { copies, pageSize, orientation, marginPt: 24, spacingPt: 10 });
      const url = URL.createObjectURL(pdf);
      const a = document.createElement("a");
      a.href = url; a.download = "photo-print-sheet.pdf"; a.click();
      URL.revokeObjectURL(url);
      toast("Downloaded photo-print-sheet.pdf");
    } catch {
      toast("Couldn't build the print sheet.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-bg p-4">
      <p className="text-sm text-muted">Place multiple copies of your finished photo onto one printable page, sized to print at their true physical dimensions.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="copies" className="text-sm font-medium">Copies</label>
          <input id="copies" type="number" min={1} max={40} value={copies} onChange={(e) => setCopies(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
            className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3 text-[15px] outline-none focus:border-accent" />
        </div>
        <div>
          <label htmlFor="pagesize" className="text-sm font-medium">Page size</label>
          <select id="pagesize" value={pageSize} onChange={(e) => setPageSize(e.target.value as PrintSheetOptions["pageSize"])}
            className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3 text-[15px] outline-none focus:border-accent">
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
          </select>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium">Orientation</p>
          <div className="mt-1 flex gap-2" role="group" aria-label="Page orientation">
            {(["portrait", "landscape"] as const).map((o) => (
              <button key={o} type="button" onClick={() => setOrientation(o)} aria-pressed={orientation === o}
                className={`h-10 flex-1 rounded-xl border text-sm font-medium capitalize transition-colors ${orientation === o ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-muted hover:text-ink"}`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={download} disabled={busy} className="h-11 w-full rounded-full bg-accent text-sm font-medium text-accent-ink transition-colors hover:brightness-110 disabled:opacity-50">
        {busy ? "Building…" : "Download as PDF"}
      </button>
    </div>
  );
}
