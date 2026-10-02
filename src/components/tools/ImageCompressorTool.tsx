"use client";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { FileResultCard, type FileJob } from "./FileResultCard";
import { QualitySlider } from "@/components/ui/QualitySlider";
import { FormatSelector } from "@/components/ui/FormatSelector";
import { useToast } from "@/components/ui/Toast";
import { compressImage } from "@/lib/image/compress";
import { formatBytes, swapExtension, EXT, type OutputFormat } from "@/lib/image/formats";

let idCounter = 0;
const newId = () => `job-${idCounter++}`;

export function ImageCompressorTool() {
  const [jobs, setJobs] = useState<FileJob[]>([]);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState(0.8);
  const toast = useToast();

  const runJob = useCallback(async (job: FileJob, fmt: OutputFormat, q: number) => {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "processing" } : j)));
    try {
      const result = await compressImage(job.file, fmt, q);
      const outputName = swapExtension(job.file.name, EXT[fmt]);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "done", outputBlob: result.blob, outputName, outputSize: result.blob.size } : j)));
    } catch (e) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "error", error: e instanceof Error ? e.message : "Compression failed." } : j)));
    }
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const newJobs: FileJob[] = files.map((file) => ({ id: newId(), file, status: "pending" }));
    setJobs((prev) => [...prev, ...newJobs]);
    newJobs.forEach((j) => runJob(j, format, quality));
  }, [format, quality, runJob]);

  const reprocessAll = useCallback((fmt: OutputFormat, q: number) => {
    setJobs((prev) => {
      prev.forEach((j) => runJob(j, fmt, q));
      return prev;
    });
  }, [runJob]);

  const onFormatChange = (fmt: OutputFormat) => { setFormat(fmt); if (jobs.length) reprocessAll(fmt, quality); };
  const onQualityChange = (q: number) => { setQuality(q); if (jobs.length) reprocessAll(format, q); };

  const remove = (id: string) => setJobs((prev) => prev.filter((j) => j.id !== id));

  const download = (job: FileJob) => {
    if (!job.outputBlob || !job.outputName) return;
    const url = URL.createObjectURL(job.outputBlob);
    const a = document.createElement("a");
    a.href = url; a.download = job.outputName; a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${job.outputName}`);
  };

  const downloadAll = () => { jobs.filter((j) => j.status === "done").forEach(download); };
  const reset = () => setJobs([]);

  const doneJobs = jobs.filter((j) => j.status === "done");
  const totalOriginal = jobs.reduce((s, j) => s + j.file.size, 0);
  const totalOutput = doneJobs.reduce((s, j) => s + (j.outputSize ?? 0), 0);
  const totalSavedPct = totalOriginal && totalOutput ? Math.round(((totalOriginal - totalOutput) / totalOriginal) * 100) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <UploadDropzone onFiles={handleFiles} />
        {jobs.length > 0 && (
          <div className="mt-6 space-y-3">
            {jobs.map((job) => <FileResultCard key={job.id} job={job} onRemove={remove} onDownload={download} showCompare />)}
          </div>
        )}
        {jobs.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              {totalSavedPct !== null ? `Original ${formatBytes(totalOriginal)} → Compressed ${formatBytes(totalOutput)} · Saved ${totalSavedPct}%` : `${jobs.length} file${jobs.length > 1 ? "s" : ""}`}
            </p>
            <div className="flex gap-2">
              <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
              {doneJobs.length > 1 && <button onClick={downloadAll} className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:brightness-110">Download all</button>}
            </div>
          </div>
        )}
      </div>
      <aside className="h-fit space-y-6 rounded-2xl border border-line bg-surface p-5">
        <FormatSelector value={format} onChange={onFormatChange} />
        <QualitySlider value={quality} onChange={onQualityChange} disabled={format === "png"} />
        {format === "png" && <p className="text-xs text-muted">PNG is lossless, so quality doesn't apply. File size depends on image content.</p>}
      </aside>
    </div>
  );
}
