"use client";
import { useState } from "react";

export function BeforeAfterSlider({ before, after, beforeLabel, afterLabel }: { before: string; after: string; beforeLabel: string; afterLabel: string }) {
  const [pos, setPos] = useState(50);
  const img = "block w-full max-h-[70vh] object-contain";
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line bg-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt={afterLabel} className={img} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={beforeLabel} className={`${img} absolute inset-0 h-full`} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} />
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">{beforeLabel}</span>
        <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">{afterLabel}</span>
      </div>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Drag to compare original and compressed" className="mt-3 w-full accent-[var(--accent)]" />
    </div>
  );
}
