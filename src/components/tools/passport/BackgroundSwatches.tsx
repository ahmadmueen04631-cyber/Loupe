"use client";
import { BACKGROUND_SWATCHES } from "@/lib/photo/presets";

export function BackgroundSwatches({
  value, customColor, onChange, onCustomColorChange, allowTransparent,
}: {
  value: string;
  customColor: string;
  onChange: (id: string) => void;
  onCustomColorChange: (hex: string) => void;
  allowTransparent?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium">Background color</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Background color">
        {BACKGROUND_SWATCHES.map((s) => (
          <button
            key={s.id} type="button" onClick={() => onChange(s.id)} aria-pressed={value === s.id} aria-label={s.label}
            title={s.label}
            className={`flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors ${value === s.id ? "border-accent" : "border-line hover:border-ink"}`}
          >
            <span
              className="h-5 w-5 rounded-full border border-line"
              style={{ background: s.color ?? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%)", backgroundSize: s.color ? undefined : "8px 8px", backgroundPosition: s.color ? undefined : "0 0, 4px 4px" }}
              aria-hidden="true"
            />
            {s.label}
          </button>
        ))}
        {allowTransparent && (
          <button type="button" onClick={() => onChange("transparent")} aria-pressed={value === "transparent"}
            className={`flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors ${value === "transparent" ? "border-accent" : "border-line hover:border-ink"}`}>
            <span className="h-5 w-5 rounded-full border border-line" style={{ backgroundImage: "linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%)", backgroundSize: "8px 8px", backgroundPosition: "0 0, 4px 4px" }} aria-hidden="true" />
            Transparent
          </button>
        )}
      </div>
      {value === "custom" && (
        <div className="mt-3 flex items-center gap-3">
          <input type="color" value={customColor} onChange={(e) => onCustomColorChange(e.target.value)} aria-label="Custom background color" className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-transparent" />
          <span className="text-sm text-muted">{customColor.toUpperCase()}</span>
        </div>
      )}
      <p className="mt-2 text-xs text-muted">Choose the background color specified by your application.</p>
    </div>
  );
}
