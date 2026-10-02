"use client";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { CopyRow } from "@/components/ui/CopyRow";
import { inspectImage, type BasicInfo } from "@/lib/image/inspect";
import { readExif } from "@/lib/image/exif";
import { readDpi, type DpiInfo } from "@/lib/image/dpi";
import { formatBytes } from "@/lib/image/formats";

export function ImageDpiCheckerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<BasicInfo | null>(null);
  const [dpi, setDpi] = useState<DpiInfo | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setDpi(undefined);
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(f); });
    const basic = await inspectImage(f);
    setInfo(basic);
    const exif = await readExif(f);
    setDpi(await readDpi(f, exif?.dpi ?? null));
  }, []);

  const reset = () => {
    setFile(null); setInfo(null); setDpi(undefined);
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
  };

  if (!file) return <UploadDropzone onFiles={handleFiles} multiple={false} />;

  const printIn = dpi && info ? { w: (info.width / dpi.dpiX).toFixed(2), h: (info.height / dpi.dpiY).toFixed(2) } : null;
  const printCm = dpi && info ? { w: ((info.width / dpi.dpiX) * 2.54).toFixed(1), h: ((info.height / dpi.dpiY) * 2.54).toFixed(1) } : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-line bg-bg p-4">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={file.name} className="max-h-96 max-w-full rounded-xl object-contain" />
        )}
      </div>
      <aside className="h-fit rounded-2xl border border-line bg-surface p-5">
        {info && (
          <div>
            <CopyRow label="Dimensions" value={`${info.width} × ${info.height} px`} />
            <CopyRow label="Megapixels" value={`${info.megapixels} MP`} />
            <CopyRow label="File size" value={formatBytes(info.sizeBytes)} />
          </div>
        )}
        <div className="mt-4">
          {dpi === undefined && <p className="py-3 text-sm text-muted">Checking for DPI metadata…</p>}
          {dpi === null && (
            <p className="py-3 text-sm text-muted">No DPI metadata was found in this file. Most images — especially screenshots and web photos — don&apos;t carry a DPI value at all, since it only matters for print.</p>
          )}
          {dpi && (
            <div>
              <CopyRow label="DPI" value={dpi.dpiX === dpi.dpiY ? `${dpi.dpiX}` : `${dpi.dpiX} × ${dpi.dpiY}`} />
              {printIn && <CopyRow label="Print size (inches)" value={`${printIn.w}" × ${printIn.h}"`} />}
              {printCm && <CopyRow label="Print size (cm)" value={`${printCm.w} × ${printCm.h} cm`} />}
            </div>
          )}
        </div>
        <button onClick={reset} className="mt-5 h-11 w-full rounded-full border border-line bg-bg text-sm font-medium transition-colors hover:border-ink">Try another image</button>
      </aside>
    </div>
  );
}
