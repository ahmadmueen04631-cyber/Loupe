import type { Metadata } from "next";
import { ToolDirectory } from "@/components/tools/ToolDirectory";
import { TOOLS, CATEGORIES } from "@/data/tools";
import type { ToolCategory } from "@/types/tool";

export const metadata: Metadata = {
  title: "All image tools",
  description: "Browse free browser-based image tools: compress, resize, crop, convert between JPG, PNG, WEBP and HEIC, make favicons and more.",
  alternates: { canonical: "/tools" },
};

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const initial = CATEGORIES.find((c) => c.name === category)?.name as ToolCategory | undefined;
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">All image tools</h1>
      <p className="mt-3 max-w-xl text-muted">Pick a tool, drop in an image, download the result.</p>
      <div className="mt-10"><ToolDirectory tools={TOOLS} initialCategory={initial} /></div>
    </div>
  );
}
