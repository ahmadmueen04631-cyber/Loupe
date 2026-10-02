"use client";
import type { OutputFormat } from "@/lib/image/formats";

const OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
];

export function FormatSelector({ value, onChange }: { value: OutputFormat; onChange: (v: OutputFormat) => void }) {
  return (
    <div>
      <p className="text-sm font-medium">Output format</p>
      <div className="mt-2 flex gap-2" role="group" aria-label="Output format">
        {OPTIONS.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
            className={`h-10 flex-1 rounded-xl border text-sm font-medium transition-colors ${value === o.value ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-ink hover:border-ink"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
