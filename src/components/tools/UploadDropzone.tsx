"use client";
import { useCallback, useRef, useState } from "react";
import { ALL_IMAGE_TYPES, validateFile } from "@/lib/image/errors";

export function UploadDropzone({
  onFiles, multiple = true, acceptedTypes = ALL_IMAGE_TYPES, acceptedExtensions, hint,
}: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  /** Restrict which image mime types are accepted; defaults to JPG/PNG/WEBP. */
  acceptedTypes?: string[];
  /** Extensions (e.g. [".heic", ".heif"]) accepted even when the browser reports an empty or unrecognized mime type. */
  acceptedExtensions?: string[];
  /** Overrides the "or choose a file" helper line, e.g. "PNG only, up to 40 MB". */
  hint?: string;
}) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = useCallback((list: FileList | File[]) => {
    const files = Array.from(list);
    const bad = files.map((f) => validateFile(f, acceptedTypes, acceptedExtensions)).find(Boolean);
    if (bad) { setError(bad); return; }
    setError(null);
    onFiles(files);
  }, [onFiles, acceptedTypes, acceptedExtensions]);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an image"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files.length) accept(e.dataTransfer.files); }}
        className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${over ? "border-accent bg-accent/5 scale-[1.01]" : "border-line bg-surface hover:border-ink"}`}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted" aria-hidden="true">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-4 text-lg font-medium">Drop your image here</p>
        <p className="mt-1 text-sm text-muted">or choose a file — {hint ?? "JPG, PNG or WEBP, up to 40 MB"}</p>
        <input ref={inputRef} type="file" accept={[...acceptedTypes, ...(acceptedExtensions ?? [])].join(",")} multiple={multiple} className="sr-only"
          onChange={(e) => e.target.files && accept(e.target.files)} />
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
