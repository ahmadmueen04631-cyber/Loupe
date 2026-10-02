"use client";
export function NumberField({ id, label, value, onChange, disabled }: { id: string; label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} type="number" min={1} max={10000} value={value} disabled={disabled}
        onChange={(e) => onChange(Math.max(1, Math.round(Number(e.target.value) || 1)))}
        className="mt-1 h-11 w-full rounded-xl border border-line bg-bg px-3 text-[15px] outline-none focus:border-accent disabled:opacity-50" />
    </div>
  );
}
