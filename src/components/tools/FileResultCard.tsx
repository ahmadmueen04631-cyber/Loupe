"use client";
import { useEffect, useState } from "react";
import { formatBytes } from "@/lib/image/formats";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";

export type FileJob = {
  id: string;
  file: File;
  status: "pending" | "processing" | "done" | "error";
  outputBlob?: Blob;
  outputName?: string;
  outputSize?: number;
  error?: string;
};

function savedPercent(job: FileJob) {
  if (!job.outputSize) return null;
  const pct = ((job.file.size - job.outputSize) / job.file.size) * 100;
  return Math.round(pct);
}

export function FileResultCard({
  job, onRemove, onDownload, showCompare = false,
}: {
  job: FileJob;
  onRemove: (id: string) => void;
  onDownload: (job: FileJob) => void;
  /** Shows a "Compare" toggle revealing a before/after slider (original vs. processed). */
  showCompare?: boolean;
}) {
  const saved = savedPercent(job);
  const [comparing, setComparing] = useState(false);
  const [urls, setUrls] = useState<{ before: string; after: string } | null>(null);

  useEffect(() => {
    if (!comparing || !job.outputBlob) return;
    const before = URL.createObjectURL(job.file);
    const after = URL.createObjectURL(job.outputBlob);
    setUrls({ before, after });
    return () => { URL.revokeObjectURL(before); URL.revokeObjectURL(after); };
  }, [comparing, job.file, job.outputBlob]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-bg text-xs font-medium uppercase text-muted">
          {job.file.type.split("/")[1] ?? "img"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{job.file.name}</p>
          <p className="text-sm text-muted">
            {job.status === "pending" && "Waiting"}
            {job.status === "processing" && "Processing…"}
            {job.status === "error" && (job.error ?? "Something went wrong")}
            {job.status === "done" && job.outputSize !== undefined && (
              <>Original {formatBytes(job.file.size)} → {formatBytes(job.outputSize)}{saved !== null && saved > 0 ? ` · Saved ${saved}%` : ""}</>
            )}
          </p>
        </div>
        {job.status === "processing" && (
          <svg className="h-5 w-5 shrink-0 animate-spin text-muted" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {job.status === "done" && showCompare && (
          <button onClick={() => setComparing((v) => !v)} aria-pressed={comparing} className="hidden h-10 shrink-0 rounded-full border border-line px-4 text-sm font-medium transition-colors hover:border-ink sm:inline-flex sm:items-center">
            {comparing ? "Hide compare" : "Compare"}
          </button>
        )}
        {job.status === "done" && (
          <button onClick={() => onDownload(job)} className="h-10 shrink-0 rounded-full bg-accent px-4 text-sm font-medium text-accent-ink transition-colors hover:brightness-110">
            Download
          </button>
        )}
        <button onClick={() => onRemove(job.id)} aria-label={`Remove ${job.file.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-bg hover:text-ink">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
        </button>
      </div>
      {comparing && urls && (
        <div className="mt-4">
          <BeforeAfterSlider before={urls.before} after={urls.after} beforeLabel="Original" afterLabel="Compressed" />
        </div>
      )}
    </div>
  );
}
