"use client";
import { useCallback, useEffect, useId, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { QualitySlider } from "@/components/ui/QualitySlider";
import { useToast } from "@/components/ui/Toast";
import { buildImagePdf, type Margin, type Orientation, type PageSizeOption } from "@/lib/pdf/imageToPdf";

type Item = { id: string; file: File; url: string };
let idCounter = 0;

function SelectField<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}
        className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3 text-[15px] outline-none focus:border-accent">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function ImageToPdfTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState<Margin>("small");
  const [quality, setQuality] = useState(0.85);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handleFiles = useCallback((files: File[]) => {
    setItems((prev) => [...prev, ...files.map((file) => ({ id: `pg-${idCounter++}`, file, url: URL.createObjectURL(file) }))]);
  }, []);

  const move = (index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const reset = () => setItems([]);

  useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      const blob = await buildImagePdf(items.map((i) => i.file), { pageSize, orientation, margin, quality });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = items.length === 1 ? `${items[0].file.name.replace(/\.[^.]+$/, "")}.pdf` : "images.pdf"; a.click();
      URL.revokeObjectURL(url);
      toast("PDF downloaded");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not build the PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <UploadDropzone onFiles={handleFiles} multiple />
        {items.length > 0 && (
          <ol className="mt-6 space-y-3">
            {items.map((item, i) => (
              <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bg text-xs font-medium text-muted">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.file.name} className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover" />
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.file.name}</p>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-bg hover:text-ink disabled:opacity-30">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-bg hover:text-ink disabled:opacity-30">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => remove(item.id)} aria-label={`Remove ${item.file.name}`} className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-bg hover:text-ink">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
        {items.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">{items.length} page{items.length > 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
              <button onClick={generate} disabled={busy} className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:brightness-110 disabled:opacity-50">
                {busy ? "Building…" : "Generate PDF"}
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="h-fit space-y-5 rounded-2xl border border-line bg-surface p-5">
        <SelectField label="Page size" value={pageSize} onChange={setPageSize} options={[{ value: "a4", label: "A4" }, { value: "letter", label: "Letter" }, { value: "fit", label: "Fit to image" }]} />
        {pageSize !== "fit" && (
          <SelectField label="Orientation" value={orientation} onChange={setOrientation} options={[{ value: "auto", label: "Auto (match image)" }, { value: "portrait", label: "Portrait" }, { value: "landscape", label: "Landscape" }]} />
        )}
        {pageSize !== "fit" && (
          <SelectField label="Margins" value={margin} onChange={setMargin} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "large", label: "Large" }]} />
        )}
        <QualitySlider value={quality} onChange={setQuality} />
      </aside>
    </div>
  );
}
