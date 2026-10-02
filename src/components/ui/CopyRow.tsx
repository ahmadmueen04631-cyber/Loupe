"use client";
import { useToast } from "./Toast";

export function CopyRow({ label, value }: { label: string; value: string }) {
  const toast = useToast();
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); toast(`Copied ${label.toLowerCase()}`); }
    catch { toast("Couldn't copy — try selecting the text instead."); }
  };
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
      <button onClick={copy} aria-label={`Copy ${label.toLowerCase()}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-bg hover:text-ink">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" />
        </svg>
      </button>
    </div>
  );
}
