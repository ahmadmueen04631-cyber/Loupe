"use client";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { FileResultCard, type FileJob } from "./FileResultCard";
import { QualitySlider } from "@/components/ui/QualitySlider";
import { useToast } from "@/components/ui/Toast";
import { convertHeicToJpeg } from "@/lib/image/heic";
import { formatBytes, swapExtension } from "@/lib/image/formats";

let idCounter = 0;
const newId = () => `heic-${idCounter++}`;

const HEIC_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];
const HEIC_EXTENSIONS = [".heic", ".heif"];

export function HeicConverterTool() {
  const [jobs, setJobs] = useState<FileJob[]>([]);
  const [quality, setQuality] = useState(0.85);
  const toast = useToast();

  const runJob = useCallback(async (job: FileJob, q: number) => {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "processing" } : j)));
    try {
      const blob = await convertHeicToJpeg(job.file, q);
      const outputName = swapExtension(job.file.name, "jpg");
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "done", outputBlob: blob, outputName, outputSize: blob.size } : j)));
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "error", error: "This file couldn't be converted. It may not be a valid HEIC image." } : j)));
    }
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const newJobs: FileJob[] = files.map((file) => ({ id: newId(), file, status: "pending" }));
    setJobs((prev) => [...prev, ...newJobs]);
    newJobs.forEach((j) => runJob(j, quality));
  }, [quality, runJob]);

  const onQualityChange = (q: number) => {
    setQuality(q);
    setJobs((prev) => { prev.forEach((j) => runJob(j, q)); return prev; });
  };

  const remove = (id: string) => setJobs((prev) => prev.filter((j) => j.id !== id));

  const download = (job: FileJob) => {
    if (!job.outputBlob || !job.outputName) return;
    const url = URL.createObjectURL(job.outputBlob);
    const a = document.createElement("a");
    a.href = url; a.download = job.outputName; a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${job.outputName}`);
  };

  const downloadAll = () => jobs.filter((j) => j.status === "done").forEach(download);
  const reset = () => setJobs([]);

  const doneJobs = jobs.filter((j) => j.status === "done");
  const totalOriginal = jobs.reduce((s, j) => s + j.file.size, 0);
  const totalOutput = doneJobs.reduce((s, j) => s + (j.outputSize ?? 0), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <UploadDropzone onFiles={handleFiles} acceptedTypes={HEIC_TYPES} acceptedExtensions={HEIC_EXTENSIONS} hint="HEIC only, up to 40 MB" />
        {jobs.length > 0 && (
          <div className="mt-6 space-y-3">
            {jobs.map((job) => <FileResultCard key={job.id} job={job} onRemove={remove} onDownload={download} />)}
          </div>
        )}
        {jobs.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              {doneJobs.length ? `Original ${formatBytes(totalOriginal)} → Converted ${formatBytes(totalOutput)}` : `${jobs.length} file${jobs.length > 1 ? "s" : ""}`}
            </p>
            <div className="flex gap-2">
              <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
              {doneJobs.length > 1 && <button onClick={downloadAll} className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:brightness-110">Download all</button>}
            </div>
          </div>
        )}
      </div>
      <aside className="h-fit rounded-2xl border border-line bg-surface p-5">
        <QualitySlider value={quality} onChange={onQualityChange} />
      </aside>
    </div>
  );
}
