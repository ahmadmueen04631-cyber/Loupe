import type { Metadata } from "next";
import { ConverterPageBody } from "@/components/tools/ConverterPageBody";
import { getTool } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("webp-to-png")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Convert WEBP images to PNG in your browser. Batch convert multiple files, no upload required.",
  alternates: { canonical: `/tools/webp-to-png` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

export default function Page() {
  return (
    <ConverterPageBody
      tool={tool}
      targetFormat="png"
      acceptedTypes={["image/webp"]}
      acceptHint="WEBP only, up to 40 MB"
      fromLabel="WEBP"
      toLabel="PNG"
    />
  );
}
