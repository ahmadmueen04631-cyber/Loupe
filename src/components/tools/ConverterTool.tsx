"use client";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { FileResultCard, type FileJob } from "./FileResultCard";
import { QualitySlider } from "@/components/ui/QualitySlider";
import { useToast } from "@/components/ui/Toast";
import { compressImage } from "@/lib/image/compress";
import { formatBytes, swapExtension, EXT, type OutputFormat } from "@/lib/image/formats";

let idCounter = 0;
const newId = () => `conv-${idCounter++}`;

const isLossy = (f: OutputFormat) => f === "jpeg" || f === "webp";

export function ConverterTool({
  targetFormat, acceptedTypes, acceptHint,
}: {
  targetFormat: OutputFormat;
  acceptedTypes: string[];
  acceptHint: string;
}) {
  const [jobs, setJobs] = useState<FileJob[]>([]);
  const [quality, setQuality] = useState(0.9);
  const toast = useToast();

  const runJob = useCallback(async (job: FileJob, q: number) => {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "processing" } : j)));
    try {
      const result = await compressImage(job.file, targetFormat, q);
      const outputName = swapExtension(job.file.name, EXT[targetFormat]);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "done", outputBlob: result.blob, outputName, outputSize: result.blob.size } : j)));
    } catch (e) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "error", error: e instanceof Error ? e.message : "Conversion failed." } : j)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetFormat]);

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
    <div className={isLossy(targetFormat) ? "grid gap-6 lg:grid-cols-[1fr_300px]" : ""}>
      <div>
        <UploadDropzone onFiles={handleFiles} acceptedTypes={acceptedTypes} hint={acceptHint} />
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
      {isLossy(targetFormat) && (
        <aside className="h-fit rounded-2xl border border-line bg-surface p-5">
          <QualitySlider value={quality} onChange={onQualityChange} />
        </aside>
      )}
    </div>
  );
}
