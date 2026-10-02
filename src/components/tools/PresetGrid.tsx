"use client";

export type Preset = { label: string; width: number; height: number };

export const RESIZE_PRESETS: Preset[] = [
  { label: "1920 × 1080", width: 1920, height: 1080 },
  { label: "1280 × 720", width: 1280, height: 720 },
  { label: "1080 × 1080", width: 1080, height: 1080 },
  { label: "1080 × 1350", width: 1080, height: 1350 },
  { label: "1080 × 1920", width: 1080, height: 1920 },
  { label: "1200 × 630", width: 1200, height: 630 },
];

export function PresetGrid({ onSelect }: { onSelect: (p: Preset) => void }) {
  return (
    <div>
      <p className="text-sm font-medium">Presets</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {RESIZE_PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => onSelect(p)}
            className="h-10 rounded-xl border border-line bg-bg text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink">
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
