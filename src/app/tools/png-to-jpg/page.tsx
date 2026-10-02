import type { Metadata } from "next";
import { ConverterPageBody } from "@/components/tools/ConverterPageBody";
import { getTool } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("png-to-jpg")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Convert PNG images to JPG in your browser. Batch convert multiple files, no upload required.",
  alternates: { canonical: `/tools/png-to-jpg` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

export default function Page() {
  return (
    <ConverterPageBody
      tool={tool}
      targetFormat="jpeg"
      acceptedTypes={["image/png"]}
      acceptHint="PNG only, up to 40 MB"
      fromLabel="PNG"
      toLabel="JPG"
    />
  );
}
