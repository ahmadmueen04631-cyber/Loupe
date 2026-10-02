import type { Metadata } from "next";
import { ConverterPageBody } from "@/components/tools/ConverterPageBody";
import { getTool } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("jpg-to-webp")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Convert JPG images to WEBP in your browser. Batch convert multiple files, no upload required.",
  alternates: { canonical: `/tools/jpg-to-webp` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

export default function Page() {
  return (
    <ConverterPageBody
      tool={tool}
      targetFormat="webp"
      acceptedTypes={["image/jpeg"]}
      acceptHint="JPG only, up to 40 MB"
      fromLabel="JPG"
      toLabel="WEBP"
    />
  );
}
