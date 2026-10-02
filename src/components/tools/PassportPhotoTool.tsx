"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { UploadDropzone } from "./UploadDropzone";
import { CropOverlay } from "./CropOverlay";
import { StepIndicator } from "./passport/StepIndicator";
import { BackgroundSwatches } from "./passport/BackgroundSwatches";
import { useToast } from "@/components/ui/Toast";
import { removeBackground } from "@/lib/photo/removeBackground";
import { featherAlpha } from "@/lib/photo/refineEdges";
import { PHOTO_PRESETS, getPreset, BACKGROUND_SWATCHES } from "@/lib/photo/presets";
import { toPixels, type Unit } from "@/lib/photo/units";
import { compositePhoto, canvasToBlob, findSubjectBounds, centerCropOnSubject } from "@/lib/photo/composite";
import { encodeToTargetSize } from "@/lib/photo/targetSize";
import { formatBytes } from "@/lib/image/formats";
import type { Rect } from "@/lib/image/crop";

const PrintSheetPanel = dynamic(() => import("./passport/PrintSheetPanel"), { ssr: false, loading: () => <p className="text-sm text-muted">Loading…</p> });

type Mode = "background" | "passport";
type ExportFormat = "jpeg" | "png" | "webp";
const EXPORT_MIME: Record<ExportFormat, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

const MAX_VIEWPORT_HEIGHT = 440;
const TARGET_SIZE_OPTIONS = [
  { label: "No target", kb: null },
  { label: "100 KB", kb: 100 },
  { label: "200 KB", kb: 200 },
  { label: "500 KB", kb: 500 },
  { label: "1 MB", kb: 1024 },
];

export function PassportPhotoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"upload" | "removing" | "editing">("upload");
  const [removeProgress, setRemoveProgress] = useState(0);
  const [mode, setMode] = useState<Mode>("passport");

  const [bgChoice, setBgChoice] = useState("white");
  const [customColor, setCustomColor] = useState("#ffffff");

  const [presetId, setPresetId] = useState("passport-35x45mm");
  const [customW, setCustomW] = useState(35);
  const [customH, setCustomH] = useState(45);
  const [customUnit, setCustomUnit] = useState<Unit>("mm");
  const [dpi, setDpi] = useState(300);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selection, setSelection] = useState<Rect | null>(null);
  const [zoom, setZoom] = useState(100);

  const [format, setFormat] = useState<ExportFormat>("jpeg");
  const [quality, setQuality] = useState(0.9);
  const [targetKb, setTargetKb] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; jpegBytes: Uint8Array; w: number; h: number } | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const toast = useToast();
  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null); // offscreen: the background-removed cutout at natural size
  const displayCanvasRef = useRef<HTMLCanvasElement>(null); // visible: cutout composited over the chosen color
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(560);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const natW = rawCanvasRef.current?.width ?? 0;
  const natH = rawCanvasRef.current?.height ?? 0;
  const fitScale = natW && natH ? Math.min(viewportWidth / natW, MAX_VIEWPORT_HEIGHT / natH) : 1;
  const displayScale = fitScale * (zoom / 100);

  const preset = getPreset(presetId);
  const isCustomPreset = presetId === "custom";
  const effW = isCustomPreset ? customW : preset.width;
  const effH = isCustomPreset ? customH : preset.height;
  const effUnit = isCustomPreset ? customUnit : preset.unit;
  const targetWpx = toPixels(effW, effUnit, dpi);
  const targetHpx = toPixels(effH, effUnit, dpi);
  const ratio = targetWpx / targetHpx;

  const upscaleFactor = selection ? Math.max(targetWpx / selection.w, targetHpx / selection.h) : 1;
  const showUpscaleWarning = mode === "passport" && upscaleFactor > 1.8;

  const bgSwatch = BACKGROUND_SWATCHES.find((s) => s.id === bgChoice);
  const bgColorValue = bgChoice === "transparent" ? null : bgChoice === "custom" ? customColor : bgSwatch?.color ?? "#FFFFFF";

  const redrawDisplay = useCallback((color: string | null) => {
    const raw = rawCanvasRef.current;
    const disp = displayCanvasRef.current;
    if (!raw || !disp) return;
    disp.width = raw.width;
    disp.height = raw.height;
    const ctx = disp.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, disp.width, disp.height);
    if (color) { ctx.fillStyle = color; ctx.fillRect(0, 0, disp.width, disp.height); }
    ctx.drawImage(raw, 0, 0);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setStage("removing");
    setRemoveProgress(0);
    setResult(null);
    try {
      const cutoutBlob = await removeBackground(f, setRemoveProgress);
      const bitmap = await createImageBitmap(cutoutBlob);
      const raw = document.createElement("canvas");
      raw.width = bitmap.width; raw.height = bitmap.height;
      raw.getContext("2d")?.drawImage(bitmap, 0, 0);
      bitmap.close();
      featherAlpha(raw);
      rawCanvasRef.current = raw;
      requestAnimationFrame(() => {
        redrawDisplay(bgColorValue);
        const bbox = findSubjectBounds(raw);
        setSelection(centerCropOnSubject(raw.width, raw.height, ratio, bbox));
        setStage("editing");
      });
    } catch {
      toast("Couldn't process that photo. Try a different image.");
      setStage("upload");
      setFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redrawDisplay]);

  // Recomposite the visible canvas whenever the background choice changes.
  useLayoutEffect(() => {
    if (stage === "editing") redrawDisplay(mode === "background" && bgChoice === "transparent" ? null : bgColorValue);
  }, [bgColorValue, bgChoice, mode, stage, redrawDisplay]);

  // Re-center the crop when the target aspect ratio changes (preset, custom dims, or DPI).
  const lastRatio = useRef(ratio);
  useLayoutEffect(() => {
    if (stage !== "editing" || mode !== "passport" || !rawCanvasRef.current) return;
    if (Math.abs(lastRatio.current - ratio) < 0.001) return;
    lastRatio.current = ratio;
    const bbox = findSubjectBounds(rawCanvasRef.current);
    setSelection(centerCropOnSubject(natW, natH, ratio, bbox));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio, mode, stage]);

  const centerOnSubject = () => {
    if (!rawCanvasRef.current) return;
    const bbox = findSubjectBounds(rawCanvasRef.current);
    setSelection(centerCropOnSubject(natW, natH, ratio, bbox));
  };

  const reset = () => {
    setFile(null); setStage("upload"); setResult(null); setSelection(null); setZoom(100);
    rawCanvasRef.current = null;
    setResultUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
  };

  const generate = async () => {
    const raw = rawCanvasRef.current;
    if (!raw) return;
    setBusy(true);
    try {
      let outCanvas: HTMLCanvasElement;
      let outColor: string | null;
      let outW: number;
      let outH: number;
      let cropRect: Rect;

      if (mode === "background") {
        outColor = bgChoice === "transparent" ? null : bgColorValue;
        outW = raw.width; outH = raw.height;
        cropRect = { x: 0, y: 0, w: raw.width, h: raw.height };
      } else {
        if (!selection) return;
        outColor = bgColorValue;
        outW = targetWpx; outH = targetHpx;
        cropRect = selection;
      }
      outCanvas = compositePhoto(raw, cropRect, outColor, outW, outH);

      const mime = EXPORT_MIME[outColor === null && mode === "background" ? "png" : format];
      const blob = targetKb
        ? await encodeToTargetSize(outCanvas, mime, targetKb * 1024)
        : await canvasToBlob(outCanvas, mime, format === "png" ? undefined : quality);

      const jpegBlob = await canvasToBlob(compositePhoto(raw, cropRect, outColor ?? "#FFFFFF", outW, outH), "image/jpeg", 0.92);
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

      setResultUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
      setResult({ blob, jpegBytes, w: outW, h: outH });

      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url; a.download = `photo.${format === "jpeg" ? "jpg" : format}`; a.click();
      URL.revokeObjectURL(url);
      toast("Photo downloaded");
    } catch {
      toast("Couldn't generate the photo. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (stage === "upload") {
    return (
      <div>
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="mt-0.5 shrink-0 text-accent" aria-hidden="true">
            <path d="M12 3a6 6 0 00-4 10.5c.6.6 1 1.3 1 2.1V17h6v-1.4c0-.8.4-1.5 1-2.1A6 6 0 0012 3z" strokeLinejoin="round" />
            <path d="M10 21h4M11 17h2" strokeLinecap="round" />
          </svg>
          <p className="text-sm"><span className="font-medium">Pro tip:</span> take the photo in a well-lit room facing a plain wall. Even lighting and a flat, uncluttered background give the automatic cutout a clean edge to work with — busy backgrounds, shadows, or objects behind you (lamps, chairs, cables) are the most common cause of a rough or incomplete result.</p>
        </div>
        <UploadDropzone onFiles={handleFiles} multiple={false} />
        <p className="mt-3 text-sm text-muted">Backgrounds are removed automatically using on-device processing — your photo is never uploaded to a server.</p>
      </div>
    );
  }

  if (stage === "removing") {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-line bg-surface p-10 text-center">
        <svg className="h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="mt-4 font-medium">Removing background…</p>
        <p className="mt-1 text-sm text-muted">{removeProgress > 0 ? `${Math.round(removeProgress * 100)}%` : "The first run downloads a small on-device model — this can take a moment."}</p>
      </div>
    );
  }

  const activeStep = mode === "background" ? (result ? 6 : 3) : (result ? 6 : selection ? 5 : 4);

  return (
    <div>
      <StepIndicator active={activeStep} />

      <div className="mt-5 flex gap-2" role="group" aria-label="Tool mode">
        {([["background", "Change Background"], ["passport", "Passport Photo"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={mode === id}
            className={`h-11 flex-1 rounded-full border text-sm font-medium transition-colors sm:flex-none sm:px-6 ${mode === id ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div ref={viewportRef} className="overflow-auto rounded-3xl border border-line bg-[conic-gradient(#e5e7eb_90deg,#fff_90deg_180deg,#e5e7eb_180deg_270deg,#fff_270deg)] bg-[length:16px_16px]" style={{ maxHeight: MAX_VIEWPORT_HEIGHT + 32 }}>
            <div className="relative m-4 inline-block" style={{ width: natW * displayScale, height: natH * displayScale }}>
              <canvas ref={displayCanvasRef} className="block h-full w-full rounded-lg" />
              {mode === "passport" && selection && natW > 0 && (
                <CropOverlay natW={natW} natH={natH} displayScale={displayScale} selection={selection} ratio={ratio}
                  minSize={Math.min(natW, natH) * 0.1} onChange={setSelection} />
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
            {mode === "passport" && (
              <>
                <button onClick={centerOnSubject} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Center on subject</button>
                <div className="flex items-center gap-2">
                  <label htmlFor="pzoom" className="text-sm text-muted">Zoom</label>
                  <input id="pzoom" type="range" min={100} max={300} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-28 accent-[var(--accent)]" />
                </div>
              </>
            )}
            <button onClick={generate} disabled={busy || (mode === "passport" && !selection)} className="ml-auto h-11 rounded-full bg-accent px-6 text-sm font-medium text-accent-ink transition-colors hover:brightness-110 disabled:opacity-50">
              {busy ? "Generating…" : "Generate & download"}
            </button>
          </div>

          {showUpscaleWarning && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
              This crop is being enlarged about {upscaleFactor.toFixed(1)}× to fill the frame, which can look soft. Zoom out or widen the crop selection for a sharper result — or retake the photo a bit closer to the camera.
            </p>
          )}

          {result && (
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
              <p className="text-sm font-medium">Final photo</p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {resultUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="Final generated photo" className="h-24 w-24 rounded-lg border border-line object-cover" />
                )}
                <dl className="text-sm text-muted">
                  <div>{result.w} × {result.h} px</div>
                  <div>{format.toUpperCase()}</div>
                  <div>{formatBytes(result.blob.size)}</div>
                </dl>
              </div>
            </div>
          )}

          {mode === "passport" && (
            <div className="mt-6">
              <button onClick={() => setShowAdvanced((v) => !v)} className="text-sm font-medium text-accent">
                {showAdvanced ? "Hide" : "Show"} print sheet (multiple copies on one page)
              </button>
              {showAdvanced && (
                <div className="mt-3">
                  <PrintSheetPanel photoBlob={result ? new Blob([new Uint8Array(result.jpegBytes)], { type: "image/jpeg" }) : null} photoWpx={targetWpx} photoHpx={targetHpx} dpi={dpi} />
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="h-fit space-y-6 rounded-2xl border border-line bg-surface p-5">
          <BackgroundSwatches value={bgChoice} customColor={customColor} onChange={setBgChoice} onCustomColorChange={setCustomColor} allowTransparent={mode === "background"} />

          {mode === "passport" && (
            <>
              <div>
                <label htmlFor="preset" className="text-sm font-medium">Photo size</label>
                <select id="preset" value={presetId} onChange={(e) => setPresetId(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3 text-[15px] outline-none focus:border-accent">
                  {PHOTO_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <p className="mt-1 text-xs text-muted">{preset.description}</p>
              </div>

              {isCustomPreset && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="cw" className="text-xs font-medium">Width</label>
                    <input id="cw" type="number" min={1} value={customW} onChange={(e) => setCustomW(Math.max(1, Number(e.target.value) || 1))}
                      className="mt-1 h-10 w-full rounded-lg border border-line bg-bg px-2 text-sm outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label htmlFor="ch" className="text-xs font-medium">Height</label>
                    <input id="ch" type="number" min={1} value={customH} onChange={(e) => setCustomH(Math.max(1, Number(e.target.value) || 1))}
                      className="mt-1 h-10 w-full rounded-lg border border-line bg-bg px-2 text-sm outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label htmlFor="cu" className="text-xs font-medium">Unit</label>
                    <select id="cu" value={customUnit} onChange={(e) => setCustomUnit(e.target.value as Unit)}
                      className="mt-1 h-10 w-full rounded-lg border border-line bg-bg px-1 text-sm outline-none focus:border-accent">
                      <option value="px">px</option>
                      <option value="mm">mm</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted">Exports at {targetWpx} × {targetHpx} px</p>

              <details className="rounded-xl border border-line bg-bg p-3" open={showAdvanced}>
                <summary className="cursor-pointer text-sm font-medium">Advanced options</summary>
                <div className="mt-3 space-y-4">
                  <div>
                    <label htmlFor="dpi" className="text-sm font-medium">DPI</label>
                    <select id="dpi" value={dpi} onChange={(e) => setDpi(Number(e.target.value))}
                      className="mt-1 h-10 w-full rounded-lg border border-line bg-surface px-2 text-sm outline-none focus:border-accent">
                      <option value={72}>72 DPI</option>
                      <option value={150}>150 DPI</option>
                      <option value={300}>300 DPI</option>
                    </select>
                    <p className="mt-1 text-xs text-muted">DPI affects the pixel dimensions of a printed photo. Check your application's requirements if a specific DPI is requested.</p>
                  </div>
                  <div>
                    <label htmlFor="target" className="text-sm font-medium">Target file size</label>
                    <select id="target" value={targetKb ?? ""} onChange={(e) => setTargetKb(e.target.value ? Number(e.target.value) : null)}
                      className="mt-1 h-10 w-full rounded-lg border border-line bg-surface px-2 text-sm outline-none focus:border-accent">
                      {TARGET_SIZE_OPTIONS.map((o) => <option key={o.label} value={o.kb ?? ""}>{o.label}</option>)}
                    </select>
                    <p className="mt-1 text-xs text-muted">Final file size may vary slightly depending on image content and encoding.</p>
                  </div>
                </div>
              </details>
            </>
          )}

          <div>
            <p className="text-sm font-medium">Export format</p>
            <div className="mt-2 flex gap-2" role="group" aria-label="Export format">
              {(["jpeg", "png", "webp"] as ExportFormat[]).map((f) => (
                <button key={f} type="button" onClick={() => setFormat(f)} aria-pressed={format === f}
                  className={`h-10 flex-1 rounded-xl border text-sm font-medium transition-colors ${format === f ? "border-accent bg-accent text-accent-ink" : "border-line bg-bg text-ink hover:border-ink"}`}>
                  {f === "jpeg" ? "JPG" : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {format !== "png" && !targetKb && (
            <div>
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="pquality" className="font-medium">Quality</label>
                <span className="text-muted">{Math.round(quality * 100)}%</span>
              </div>
              <input id="pquality" type="range" min={0.5} max={1} step={0.01} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
