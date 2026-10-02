import { ToolCard } from "./ToolCard";
import type { ToolDefinition } from "@/types/tool";

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (!tools.length) return null;
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">Related tools</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tools.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
    </div>
  );
}
