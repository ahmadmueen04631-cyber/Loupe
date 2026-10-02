"use client";
import { useId, useState } from "react";
import { formatBytes } from "@/lib/utils/format";

type Props = {
  accept: string[]; // MIME types
  extensions: string[]; // e.g. ["jpg","png"], used when the browser gives no MIME type
  formatsLabel: string;
  maxSizeMB?: number;
  multiple?: boolean;
  compact?: boolean;
  onFiles: (files: File[]) => void;
  onReject: (messages: string[]) => void;
};

export function UploadDropzone({ accept, extensions, formatsLabel, maxSizeMB = 50, multiple = true, compact, onFiles, onReject }: Props) {
  const [over, setOver] = useState(false);
  const id = useId();

  function handle(list: FileList | null) {
    if (!list?.length) return;
    const ok: File[] = [], bad: string[] = [];
    for (const f of Array.from(list)) {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (!accept.includes(f.type) && !extensions.includes(ext)) bad.push(`${f.name} isn't a supported format. Use ${formatsLabel}.`);
      else if (f.size > maxSizeMB * 1024 * 1024) bad.push(`${f.name} is ${formatBytes(f.size)}. The limit is ${maxSizeMB} MB per file.`);
      else if (f.size === 0) bad.push(`${f.name} is empty.`);
      else ok.push(f);
    }
    if (bad.length) onReject(bad);
    if (ok.length) onFiles(multiple ? ok : ok.slice(0, 1));
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${compact ? "gap-1 p-6" : "gap-3 p-10 sm:p-16"} ${over ? "scale-[1.01] border-accent bg-accent/10" : "border-line bg-surface hover:border-accent"}`}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={over ? "text-accent" : "text-muted"} aria-hidden="true">
        <path d="M12 16V4m0 0l-4 4m4-4l4 4" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
      </svg>
      <span className="font-display text-xl font-semibold">{over ? "Release to add" : multiple ? "Drop your images here" : "Drop your image here"}</span>
      <span className="text-sm text-muted">or <span className="font-medium text-accent underline underline-offset-4">choose {multiple ? "files" : "a file"}</span></span>
      {!compact && <span className="text-xs text-muted">{formatsLabel} · up to {maxSizeMB} MB each</span>}
      <input id={id} type="file" className="sr-only" multiple={multiple} accept={[...accept, ...extensions.map((e) => `.${e}`)].join(",")}
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
    </label>
  );
}
