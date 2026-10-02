import Link from "next/link";
import type { ToolDefinition } from "@/types/tool";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const live = tool.status === "live";
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md border border-line bg-bg px-2 py-1 font-mono text-xs text-muted">{tool.glyph}</span>
        <span className="text-xs text-muted">{live ? tool.category : "In progress"}</span>
      </div>
      {tool.badge && live && (
        <span className="mt-4 inline-block rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">{tool.badge}</span>
      )}
      <h3 className={`font-display text-xl font-semibold tracking-tight ${tool.badge && live ? "mt-3" : "mt-6"}`}>{tool.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{tool.description}</p>
    </>
  );
  const cls = "block rounded-2xl border border-line bg-surface p-5 transition-colors";
  return live ? (
    <Link href={`/tools/${tool.slug}`} className={`${cls} hover:border-accent`}>{body}</Link>
  ) : (
    <div className={`${cls} opacity-75`}>{body}</div>
  );
}
