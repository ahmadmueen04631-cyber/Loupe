"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { CropOverlay } from "./CropOverlay";
import { FormatSelector } from "@/components/ui/FormatSelector";
import { useToast } from "@/components/ui/Toast";
import { rotateBitmap } from "@/lib/image/rotate";
import { exportCrop, inscribe, type Rect } from "@/lib/image/crop";
import { swapExtension, EXT, type OutputFormat } from "@/lib/image/formats";

type AspectOption = { label: string; ratio: number | null };
const ASPECTS: AspectOption[] = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "3:2", ratio: 3 / 2 },
];

const MAX_VIEWPORT_HEIGHT = 460;

export function ImageCropperTool() {
  const [file, setFile] = useState<File | null>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [aspectLabel, setAspectLabel] = useState("Free");
  const [zoom, setZoom] = useState(100);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const viewportRef = useRef<HTMLDivElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const [viewportWidth, setViewportWidth] = useState(560);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const natW = sourceCanvasRef.current?.width ?? 0;
  const natH = sourceCanvasRef.current?.height ?? 0;
  const fitScale = natW && natH ? Math.min(viewportWidth / natW, MAX_VIEWPORT_HEIGHT / natH) : 1;
  const displayScale = fitScale * (zoom / 100);

  const ratio = ASPECTS.find((a) => a.label === aspectLabel)?.ratio ?? null;

  const drawRotated = useCallback((bmp: ImageBitmap, degrees: 0 | 90 | 180 | 270) => {
    const rotated = rotateBitmap(bmp, degrees);
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    canvas.width = rotated.width;
    canvas.height = rotated.height;
    canvas.getContext("2d")?.drawImage(rotated, 0, 0);
    setSelection(inscribe(rotated.width, rotated.height, ratio));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const bmp = await createImageBitmap(f);
    setFile(f);
    setBitmap(bmp);
    setRotation(0);
    setZoom(100);
    setAspectLabel("Free");
    setFormat(f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpeg");
    requestAnimationFrame(() => drawRotated(bmp, 0));
  }, [drawRotated]);

  const rotate = (dir: 1 | -1) => {
    if (!bitmap) return;
    const next = (((rotation + dir * 90) % 360) + 360) % 360 as 0 | 90 | 180 | 270;
    setRotation(next);
    drawRotated(bitmap, next);
  };

  const applyAspect = (label: string) => {
    setAspectLabel(label);
    if (natW && natH) setSelection(inscribe(natW, natH, ASPECTS.find((a) => a.label === label)?.ratio ?? null));
  };

  const reset = () => {
    setFile(null); setBitmap(null); setSelection(null); setRotation(0); setZoom(100); setAspectLabel("Free");
  };

  const download = async () => {
    if (!sourceCanvasRef.current || !selection || !file) return;
    setBusy(true);
    try {
      const blob = await exportCrop(sourceCanvasRef.current, selection, format, 0.92);
      const name = swapExtension(file.name, EXT[format]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
      toast(`Downloaded ${name}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Crop failed.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => () => { bitmap?.close(); }, [bitmap]);

  if (!file) return <UploadDropzone onFiles={handleFiles} multiple={false} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div ref={viewportRef} className="overflow-auto rounded-3xl border border-line bg-bg" style={{ maxHeight: MAX_VIEWPORT_HEIGHT + 32 }}>
          <div className="relative m-4 inline-block" style={{ width: natW * displayScale, height: natH * displayScale }}>
            <canvas ref={sourceCanvasRef} className="block h-full w-full rounded-lg" />
            {selection && natW > 0 && (
              <CropOverlay natW={natW} natH={natH} displayScale={displayScale} selection={selection} ratio={ratio}
                minSize={Math.min(natW, natH) * 0.05} onChange={setSelection} />
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
          <button onClick={() => rotate(-1)} aria-label="Rotate left" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface transition-colors hover:border-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9h10a7 7 0 010 14h-1" strokeLinecap="round" /></svg>
          </button>
          <button onClick={() => rotate(1)} aria-label="Rotate right" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface transition-colors hover:border-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 14l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 9H10a7 7 0 000 14h1" strokeLinecap="round" /></svg>
          </button>
          <button onClick={download} disabled={busy} className="ml-auto h-11 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:brightness-110 disabled:opacity-50">
            {busy ? "Cropping…" : "Download"}
          </button>
        </div>
      </div>

      <aside className="h-fit space-y-6 rounded-2xl border border-line bg-surface p-5">
        <div>
          <p className="text-sm font-medium">Aspect ratio</p>
          <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Aspect ratio">
            {ASPECTS.map((a) => (
              <button key={a.label} type="button" onClick={() => applyAspect(a.label)} aria-pressed={aspectLabel === a.label}
                className={`h-10 rounded-xl border text-xs font-medium transition-colors ${aspectLabel === a.label ? "border-accent bg-accent text-accent-ink" : "border-line bg-bg text-muted hover:text-ink"}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="zoom" className="font-medium">Zoom</label>
            <span className="text-muted">{zoom}%</span>
          </div>
          <input id="zoom" type="range" min={100} max={300} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
        </div>
        <FormatSelector value={format} onChange={setFormat} />
      </aside>
    </div>
  );
}
