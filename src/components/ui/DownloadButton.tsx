"use client";
import { useEffect, useState } from "react";

const cls = "inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors";

export function DownloadButton({ href, filename, onDownload, primary }: { href: string; filename: string; onDownload?: () => void; primary?: boolean }) {
  const [done, setDone] = useState(false);
  useEffect(() => { if (!done) return; const t = setTimeout(() => setDone(false), 2000); return () => clearTimeout(t); }, [done]);
  return (
    <a href={href} download={filename} onClick={() => { setDone(true); onDownload?.(); }} className={`${cls} ${primary ? "bg-accent text-accent-ink hover:brightness-110" : "border border-line hover:border-ink"}`}>
      <span aria-live="polite">{done ? "Downloaded ✓" : "Download"}</span>
    </a>
  );
}

export function DownloadAllButton({ build, onDownload, disabled }: { build: () => Promise<Blob>; onDownload?: () => void; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      const url = URL.createObjectURL(await build());
      const a = document.createElement("a"); a.href = url; a.download = "loupe-images.zip"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onDownload?.();
    } finally { setBusy(false); }
  }
  return <button onClick={run} disabled={disabled || busy} className={`${cls} bg-accent text-accent-ink hover:brightness-110 disabled:opacity-50`}>{busy ? "Preparing…" : "Download all"}</button>;
}
