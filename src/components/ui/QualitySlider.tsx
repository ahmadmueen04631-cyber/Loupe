"use client";
export function QualitySlider({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor="quality" className="font-medium">Quality</label>
        <span className="text-muted" aria-hidden="true">{Math.round(value * 100)}%</span>
      </div>
      <input id="quality" type="range" min={0.1} max={1} step={0.01} value={value} disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${Math.round(value * 100)} percent`}
        className="mt-2 w-full accent-[var(--accent)] disabled:opacity-50" />
      <div className="mt-1 flex justify-between text-xs text-muted"><span>Smaller file</span><span>Higher quality</span></div>
    </div>
  );
}
