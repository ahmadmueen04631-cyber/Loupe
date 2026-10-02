"use client";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { CopyRow } from "@/components/ui/CopyRow";
import { inspectImage, type BasicInfo } from "@/lib/image/inspect";
import { formatBytes } from "@/lib/image/formats";

export function ImageDimensionsTool() {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<BasicInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(f); });
    try {
      setInfo(await inspectImage(f));
    } catch {
      setError("This image couldn't be read. Try a different file.");
      setInfo(null);
    }
  }, []);

  const reset = () => {
    setFile(null); setInfo(null); setError(null);
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
  };

  if (!file) return <UploadDropzone onFiles={handleFiles} multiple={false} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-line bg-bg p-4">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={file.name} className="max-h-96 max-w-full rounded-xl object-contain" />
        )}
      </div>
      <aside className="h-fit rounded-2xl border border-line bg-surface p-5">
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {info && (
          <div>
            <CopyRow label="Dimensions" value={`${info.width} × ${info.height} px`} />
            <CopyRow label="Aspect ratio" value={info.aspectRatio} />
            <CopyRow label="Megapixels" value={`${info.megapixels} MP`} />
            <CopyRow label="File size" value={formatBytes(info.sizeBytes)} />
            <CopyRow label="Format" value={info.format} />
            <CopyRow label="Orientation" value={info.orientation} />
            {info.colorType && <CopyRow label="Color type" value={info.colorType} />}
          </div>
        )}
        <button onClick={reset} className="mt-5 h-11 w-full rounded-full border border-line bg-bg text-sm font-medium transition-colors hover:border-ink">Try another image</button>
      </aside>
    </div>
  );
}
