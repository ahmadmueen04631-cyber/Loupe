"use client";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/data/tools";
import type { ToolCategory, ToolDefinition } from "@/types/tool";
import { ToolCard } from "./ToolCard";

export function ToolDirectory({ tools, initialCategory }: { tools: ToolDefinition[]; initialCategory?: ToolCategory }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ToolCategory | "All">(initialCategory ?? "All");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tools.filter((t) => (cat === "All" || t.category === cat) && (!s || `${t.name} ${t.description} ${t.supportedFormats.join(" ")}`.toLowerCase().includes(s)));
  }, [tools, q, cat]);
  const chip = (active: boolean) => `h-10 rounded-full border px-4 text-sm transition-colors ${active ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface text-muted hover:border-ink hover:text-ink"}`;
  return (
    <div>
      <label className="sr-only" htmlFor="tool-search">Search tools</label>
      <input id="tool-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools or formats, e.g. WEBP"
        className="h-12 w-full rounded-full border border-line bg-surface px-5 text-[15px] outline-none placeholder:text-muted focus:border-accent" />
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {(["All", ...CATEGORIES.map((c) => c.name)] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={chip(cat === c)}>{c}</button>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted" aria-live="polite">{shown.length} {shown.length === 1 ? "tool" : "tools"}</p>
      {shown.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          No tools match “{q}”. Try a format name like JPG or PDF.
        </div>
      )}
    </div>
  );
}
