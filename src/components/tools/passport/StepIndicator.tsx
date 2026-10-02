"use client";
const STEPS = ["Upload", "Remove background", "Choose background", "Choose size", "Adjust", "Download"];

export function StepIndicator({ active }: { active: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-xs sm:text-sm" aria-label="Progress">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const state = step < active ? "done" : step === active ? "current" : "upcoming";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={state === "current" ? "step" : undefined}
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                state === "done" ? "bg-accent text-accent-ink" : state === "current" ? "border-2 border-accent text-ink" : "border border-line text-muted"
              }`}
            >
              {state === "done" ? "✓" : step}
            </span>
            <span className={state === "upcoming" ? "text-muted" : "text-ink"}>{label}</span>
            {step < STEPS.length && <span className="mx-1 text-line" aria-hidden="true">→</span>}
          </li>
        );
      })}
    </ol>
  );
}
