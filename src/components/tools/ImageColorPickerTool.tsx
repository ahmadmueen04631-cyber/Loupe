"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { useToast } from "@/components/ui/Toast";
import { toHex, toRgbString, toHsl, toHsv, type RGB } from "@/lib/image/color";

const MAX_VIEWPORT_HEIGHT = 460;
const MAG_SIZE = 110; // px, the on-screen size of the magnifier
const MAG_SAMPLE = 13; // px of source captured into the magnifier, odd so the crosshair centers on a pixel

export function ImageColorPickerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [hover, setHover] = useState<{ color: RGB; x: number; y: number } | null>(null);
  const [picked, setPicked] = useState<RGB | null>(null);
  const [history, setHistory] = useState<RGB[]>([]);
  const toast = useToast();

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewportWidth, setViewportWidth] = useState(560);
  const [natSize, setNatSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const displayScale = natSize.w && natSize.h ? Math.min(viewportWidth / natSize.w, MAX_VIEWPORT_HEIGHT / natSize.h) : 1;

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const bitmap = await createImageBitmap(f);
    setFile(f);
    setHover(null); setPicked(null); setHistory([]);
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
      setNatSize({ w: bitmap.width, h: bitmap.height });
      bitmap.close();
    });
  }, []);

  const sampleAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(natSize.w - 1, Math.max(0, Math.round((e.clientX - rect.left) / displayScale)));
    const y = Math.min(natSize.h - 1, Math.max(0, Math.round((e.clientY - rect.top) / displayScale)));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const pixel = ctx?.getImageData(x, y, 1, 1).data;
    if (!pixel) return;
    setHover({ color: { r: pixel[0], g: pixel[1], b: pixel[2] }, x, y });
  };

  const finalizePick = () => {
    if (!hover) return;
    setPicked(hover.color);
    setHistory((prev) => {
      const hex = toHex(hover.color);
      if (prev.some((c) => toHex(c) === hex)) return prev;
      return [hover.color, ...prev].slice(0, 10);
    });
  };

  const copy = async (label: string, value: string) => {
    try { await navigator.clipboard.writeText(value); toast(`Copied ${label}`); }
    catch { toast("Couldn't copy — try selecting the text instead."); }
  };

  const reset = () => { setFile(null); setHover(null); setPicked(null); setHistory([]); };

  if (!file) return <UploadDropzone onFiles={handleFiles} multiple={false} />;

  const active = picked ?? hover?.color ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div ref={viewportRef} className="relative overflow-auto rounded-3xl border border-line bg-bg" style={{ maxHeight: MAX_VIEWPORT_HEIGHT + 32 }}>
          <div
            className="relative m-4 inline-block touch-none"
            style={{ width: natSize.w * displayScale, height: natSize.h * displayScale, cursor: "crosshair" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); sampleAt(e); }}
            onPointerMove={sampleAt}
            onPointerUp={finalizePick}
            onPointerCancel={finalizePick}
          >
            <canvas ref={canvasRef} className="block h-full w-full rounded-lg" />
            {hover && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute rounded-full border-2 border-white shadow-lg"
                style={{ left: hover.x * displayScale - 8, top: hover.y * displayScale - 8, width: 16, height: 16, background: toHex(hover.color) }}
              />
            )}
          </div>
        </div>

        {hover && (
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-line bg-surface p-3" aria-hidden="true">
            <canvas
              width={MAG_SIZE} height={MAG_SIZE}
              className="rounded-xl border border-line"
              ref={(el) => {
                if (!el || !canvasRef.current) return;
                const ctx = el.getContext("2d");
                if (!ctx) return;
                ctx.imageSmoothingEnabled = false;
                ctx.clearRect(0, 0, MAG_SIZE, MAG_SIZE);
                const half = Math.floor(MAG_SAMPLE / 2);
                const sx = Math.max(0, Math.min(natSize.w - MAG_SAMPLE, hover.x - half));
                const sy = Math.max(0, Math.min(natSize.h - MAG_SAMPLE, hover.y - half));
                ctx.drawImage(canvasRef.current, sx, sy, MAG_SAMPLE, MAG_SAMPLE, 0, 0, MAG_SIZE, MAG_SIZE);
                ctx.strokeStyle = "rgba(255,255,255,0.9)";
                ctx.lineWidth = 1;
                ctx.strokeRect(MAG_SIZE / 2 - MAG_SIZE / MAG_SAMPLE / 2, MAG_SIZE / 2 - MAG_SIZE / MAG_SAMPLE / 2, MAG_SIZE / MAG_SAMPLE, MAG_SIZE / MAG_SAMPLE);
              }}
            />
            <p className="text-sm text-muted">Move over the image to preview a pixel, magnified. Click or tap to pick it.</p>
          </div>
        )}

        <button onClick={reset} className="mt-4 h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
      </div>

      <aside className="h-fit space-y-5 rounded-2xl border border-line bg-surface p-5">
        {active ? (
          <>
            <div className="h-20 w-full rounded-xl border border-line" style={{ background: toHex(active) }} aria-hidden="true" />
            {([["HEX", toHex(active)], ["RGB", toRgbString(active)], ["HSL", toHsl(active)], ["HSV", toHsv(active)]] as const).map(([label, value]) => (
              <button key={label} onClick={() => copy(label, value)} className="flex w-full items-center justify-between rounded-xl border border-line bg-bg px-3 py-2 text-left text-sm transition-colors hover:border-ink">
                <span><span className="text-muted">{label}</span> <span className="ml-2 font-medium">{value}</span></span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-muted" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" /></svg>
              </button>
            ))}
          </>
        ) : (
          <p className="text-sm text-muted">Move over the image to preview a color.</p>
        )}

        {history.length > 0 && (
          <div>
            <p className="text-sm font-medium">History</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {history.map((c) => (
                <button key={toHex(c)} onClick={() => setPicked(c)} aria-label={`Pick ${toHex(c)}`} title={toHex(c)}
                  className="h-8 w-8 rounded-full border border-line" style={{ background: toHex(c) }} />
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
