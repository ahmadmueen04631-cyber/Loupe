"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { CropOverlay } from "./CropOverlay";
import { useToast } from "@/components/ui/Toast";
import { inscribe, type Rect } from "@/lib/image/crop";
import { buildFaviconPackage } from "@/lib/image/favicon";

const MAX_VIEWPORT_HEIGHT = 420;

export function FaviconGeneratorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [zoom, setZoom] = useState(100);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const bitmap = await createImageBitmap(f);
    setFile(f);
    setZoom(100);
    setPreviewUrl(null);
    requestAnimationFrame(() => {
      const canvas = sourceCanvasRef.current;
      if (!canvas) return;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
      bitmap.close();
      setSelection(inscribe(bitmap.width, bitmap.height, 1));
    });
  }, []);

  const reset = () => { setFile(null); setSelection(null); setZoom(100); setPreviewUrl(null); };

  const generate = async () => {
    if (!sourceCanvasRef.current || !selection) return;
    setBusy(true);
    try {
      const zip = await buildFaviconPackage(sourceCanvasRef.current, selection);
      const url = URL.createObjectURL(zip);
      const a = document.createElement("a");
      a.href = url; a.download = "favicon-package.zip"; a.click();
      URL.revokeObjectURL(url);

      // Small preview so people can see what they're about to install.
      const previewCanvas = document.createElement("canvas");
      previewCanvas.width = 64; previewCanvas.height = 64;
      const ctx = previewCanvas.getContext("2d");
      ctx?.drawImage(sourceCanvasRef.current, selection.x, selection.y, selection.w, selection.h, 0, 0, 64, 64);
      setPreviewUrl(previewCanvas.toDataURL("image/png"));

      toast("Downloaded favicon-package.zip");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't generate the favicon package.");
    } finally {
      setBusy(false);
    }
  };

  if (!file) return <UploadDropzone onFiles={handleFiles} multiple={false} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div ref={viewportRef} className="overflow-auto rounded-3xl border border-line bg-bg" style={{ maxHeight: MAX_VIEWPORT_HEIGHT + 32 }}>
          <div className="relative m-4 inline-block" style={{ width: natW * displayScale, height: natH * displayScale }}>
            <canvas ref={sourceCanvasRef} className="block h-full w-full rounded-lg" />
            {selection && natW > 0 && (
              <CropOverlay natW={natW} natH={natH} displayScale={displayScale} selection={selection} ratio={1}
                minSize={Math.min(natW, natH) * 0.2} onChange={setSelection} />
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">Drag to reposition the square. Icons look best with your subject centered and some margin around it.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
          <button onClick={generate} disabled={busy} className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:brightness-110 disabled:opacity-50">
            {busy ? "Generating…" : "Generate & download"}
          </button>
        </div>
      </div>

      <aside className="h-fit space-y-6 rounded-2xl border border-line bg-surface p-5">
        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="fzoom" className="font-medium">Zoom</label>
            <span className="text-muted">{zoom}%</span>
          </div>
          <input id="fzoom" type="range" min={100} max={300} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
        </div>
        <div>
          <p className="text-sm font-medium">Preview</p>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2">
            <div className="grid h-4 w-4 place-items-center overflow-hidden rounded-sm bg-surface">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <span className="text-xs text-muted">yoursite.com</span>
          </div>
          <p className="mt-2 text-xs text-muted">Generate the package to see a preview here.</p>
        </div>
        <div className="text-xs text-muted">
          <p className="font-medium text-ink">What&apos;s in the package</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>favicon.ico (16, 32, 48px)</li>
            <li>favicon-16x16.png, favicon-32x32.png</li>
            <li>apple-touch-icon.png (180px)</li>
            <li>android-chrome-192x192.png, 512x512.png</li>
            <li>site.webmanifest</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
