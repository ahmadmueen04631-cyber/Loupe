"use client";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { FileResultCard, type FileJob } from "./FileResultCard";
import { useToast } from "@/components/ui/Toast";
import { convertToIco } from "@/lib/image/icoConvert";
import { swapExtension } from "@/lib/image/formats";

let idCounter = 0;
const newId = () => `ico-${idCounter++}`;

export function IcoConverterTool() {
  const [jobs, setJobs] = useState<FileJob[]>([]);
  const toast = useToast();

  const runJob = useCallback(async (job: FileJob) => {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "processing" } : j)));
    try {
      const blob = await convertToIco(job.file);
      const outputName = swapExtension(job.file.name, "ico");
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "done", outputBlob: blob, outputName, outputSize: blob.size } : j)));
    } catch (e) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "error", error: e instanceof Error ? e.message : "Conversion failed." } : j)));
    }
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    const newJobs: FileJob[] = files.map((file) => ({ id: newId(), file, status: "pending" }));
    setJobs((prev) => [...prev, ...newJobs]);
    newJobs.forEach(runJob);
  }, [runJob]);

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

  return (
    <div>
      <UploadDropzone onFiles={handleFiles} hint="JPG, PNG or WEBP, up to 40 MB — square images work best" />
      <p className="mt-3 text-sm text-muted">Non-square images are automatically center-cropped to a square before conversion.</p>
      {jobs.length > 0 && (
        <div className="mt-6 space-y-3">
          {jobs.map((job) => <FileResultCard key={job.id} job={job} onRemove={remove} onDownload={download} />)}
        </div>
      )}
      {jobs.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{jobs.length} file{jobs.length > 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <button onClick={reset} className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors hover:border-ink">Start over</button>
            {doneJobs.length > 1 && <button onClick={downloadAll} className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition-colors hover:brightness-110">Download all</button>}
          </div>
        </div>
      )}
    </div>
  );
}
