"use client";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { CopyRow } from "@/components/ui/CopyRow";
import { inspectImage, type BasicInfo } from "@/lib/image/inspect";
import { readExif, type ExifData } from "@/lib/image/exif";
import { formatBytes } from "@/lib/image/formats";

export function ImageMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<BasicInfo | null>(null);
  const [exif, setExif] = useState<ExifData | null | undefined>(undefined);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setInfo(await inspectImage(f));
    setExif(await readExif(f));
  }, []);

  const reset = () => { setFile(null); setInfo(null); setExif(undefined); };

  if (!file) return <UploadDropzone onFiles={handleFiles} multiple={false} />;

  const cameraRows: [string, string][] = exif
    ? ([
        exif.make && ["Camera make", exif.make],
        exif.model && ["Camera model", exif.model],
        exif.dateTaken && ["Date taken", exif.dateTaken],
        exif.exposureTime && ["Shutter speed", exif.exposureTime],
        exif.fNumber && ["Aperture", exif.fNumber],
        exif.iso && ["ISO", exif.iso],
        exif.focalLength && ["Focal length", exif.focalLength],
        exif.orientation && ["EXIF orientation", exif.orientation],
      ].filter(Boolean) as [string, string][])
    : [];

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div>
        <p className="text-sm font-medium">File</p>
        <div className="mt-2">
          <CopyRow label="File name" value={file.name} />
          <CopyRow label="File type" value={info?.format ?? file.type} />
          <CopyRow label="File size" value={formatBytes(file.size)} />
          {info && <CopyRow label="Dimensions" value={`${info.width} × ${info.height} px`} />}
          {info && <CopyRow label="Orientation" value={info.orientation} />}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium">Camera &amp; EXIF</p>
        <div className="mt-2">
          {exif === undefined && <p className="py-3 text-sm text-muted">Reading metadata…</p>}
          {exif === null && <p className="py-3 text-sm text-muted">No EXIF metadata was found in this image. Metadata is only embedded in some JPEG files — PNG and WEBP files, and JPEGs edited or re-saved by some apps, often have none.</p>}
          {exif && cameraRows.length > 0 && cameraRows.map(([label, value]) => <CopyRow key={label} label={label} value={value} />)}
          {exif && cameraRows.length === 0 && <p className="py-3 text-sm text-muted">No camera details were found in this image's EXIF data.</p>}
          {exif?.hasGps && (
            <p className="mt-3 rounded-xl bg-bg p-3 text-sm text-muted">This image contains location data. We don&apos;t display exact coordinates here — remove the file&apos;s metadata before sharing it if you&apos;d rather not include location info.</p>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">Metadata is read locally in your browser.</p>
      <button onClick={reset} className="mt-5 h-11 w-full rounded-full border border-line bg-bg text-sm font-medium transition-colors hover:border-ink">Try another image</button>
    </div>
  );
}
