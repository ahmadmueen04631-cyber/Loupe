"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { PresetGrid, type Preset } from "./PresetGrid";
import { FormatSelector } from "@/components/ui/FormatSelector";
import { NumberField } from "@/components/ui/NumberField";
import { useToast } from "@/components/ui/Toast";
import { loadImage } from "@/lib/image/loadImage";
import { resizeImage } from "@/lib/image/resize";
import { formatBytes, swapExtension, EXT, type OutputFormat } from "@/lib/image/formats";

type Mode = "pixels" | "percent";

export function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [mode, setMode] = useState<Mode>("pixels");
  const [percent, setPercent] = useState(100);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setOutputBlob(null);
    setOutputUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    const { width: w, height: h } = await loadImage(f);
    setOriginal({ width: w, height: h });
    setWidth(w);
    setHeight(h);
    setMode("pixels");
    setPercent(100);
    setFormat(f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpeg");
  }, []);

  const setWidthLocked = (w: number) => {
    setWidth(w);
    if (lock && original) setHeight(Math.round((w * original.height) / original.width));
  };
  const setHeightLocked = (h: number) => {
    setHeight(h);
    if (lock && original) setWidth(Math.round((h * original.width) / original.height));
  };
  const applyPercent = (p: number) => {
    setPercent(p);
    if (original) { setWidth(Math.round((original.width * p) / 100)); setHeight(Math.round((original.height * p) / 100)); }
  };
  const applyPreset = (p: Preset) => { setMode("pixels"); setLock(false); setWidth(p.width); setHeight(p.height); };

  // Re-run the resize whenever the target changes, debounced so typing doesn't thrash the canvas.
  useEffect(() => {
    if (!file || !width || !height) return;
    setStatus("processing");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await resizeImage(file, width, height, format, 0.92);
        setOutputBlob(result.blob);
        setOutputUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(result.blob); });
        setStatus("done");
        setError(null);
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Resize failed.");
      }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, width, height, format]);

  const download = () => {
    if (!outputBlob || !file) return;
    const name = swapExtension(file.name, EXT[format]);
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${name}`);
  };

  const reset = () => {
    setFile(null); setOriginal(null); setOutputBlob(null); setStatus("idle");
    setOutputUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
  };

  if (!file || !original) {
    return <UploadDropzone onFiles={handleFiles} multiple={false} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="flex min-h-64 items-center justify-center bg-bg p-4">
            {outputUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={outputUrl} alt={`Resized preview of ${file.name}`} className="max-h-96 max-w-full rounded-xl object-contain" />
            ) : (
              <p className="text-sm text-muted">Preparing preview…</p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
            <div className="text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-muted">
                {original.width} × {original.height} → {width} × {height}
                {outputBlob && ` · ${formatBytes(outputBlob.size)}`}
                {status === "processing" && " · Resizing…"}
              </p>
            </div>
            {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
          <button onClick={download} disabled={status !== "done"} className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:brightness-110 disabled:opacity-50">Download</button>
        </div>
      </div>

      <aside className="h-fit space-y-6 rounded-2xl border border-line bg-surface p-5">
        <div>
          <div className="flex gap-2" role="group" aria-label="Resize by">
            {(["pixels", "percent"] as Mode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}
                className={`h-9 flex-1 rounded-lg border text-sm font-medium transition-colors ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-bg text-muted hover:text-ink"}`}>
                {m === "pixels" ? "Pixels" : "Percent"}
              </button>
            ))}
          </div>
        </div>

        {mode === "pixels" ? (
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="width" label="Width" value={width} onChange={setWidthLocked} />
            <NumberField id="height" label="Height" value={height} onChange={setHeightLocked} />
            <label className="col-span-2 flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="accent-[var(--accent)]" />
              Lock aspect ratio
            </label>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="percent" className="font-medium">Scale</label>
              <span className="text-muted">{percent}%</span>
            </div>
            <input id="percent" type="range" min={1} max={200} value={percent} onChange={(e) => applyPercent(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
          </div>
        )}

        <PresetGrid onSelect={applyPreset} />
        <FormatSelector value={format} onChange={setFormat} />
      </aside>
    </div>
  );
}
