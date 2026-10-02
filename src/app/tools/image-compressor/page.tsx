import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { ImageCompressorTool } from "@/components/tools/ImageCompressorTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-compressor")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Compress JPG, PNG and WEBP images in your browser. Adjust quality, compare before and after file size, and download instantly.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "Will this reduce image quality?", a: "JPG and WEBP compression is lossy, so a lower quality setting trades some detail for a smaller file. PNG stays lossless regardless of the quality slider. Try a few settings and compare the preview before downloading." },
  { q: "What's the best format for smaller files?", a: "WEBP usually produces the smallest file at a given quality, JPG is the most widely supported, and PNG is best when you need transparency or perfectly sharp edges, like a logo." },
  { q: "Is there a file size limit?", a: "Files up to 40 MB are supported. Very large images may take a moment to process since everything happens on your device." },
  { q: "Are my images uploaded anywhere?", a: "No. This tool reads the file into your browser, compresses it there, and the download happens locally. Nothing is sent to a server." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: tool.name,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: tool.name }]} />
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{tool.name}</h1>
      <p className="mt-3 max-w-2xl text-muted">{tool.description}</p>

      <div className="mt-8">
        <ToastProvider>
          <ImageCompressorTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Drop in a JPG, PNG or WEBP image. Pick an output format and drag the quality slider — the file size updates as soon as processing finishes. Everything runs on your device, so nothing uploads while you experiment.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Shrinking photos before adding them to a website or email</li>
            <li>Getting a screenshot under a file-size limit for an upload form</li>
            <li>Preparing product images that load faster on mobile</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Compress multiple images at once</li>
            <li>Switch between JPG, PNG and WEBP output</li>
            <li>See original size, compressed size and percent saved</li>
            <li>Download files individually or all at once</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">Upload: {tool.supportedFormats.join(", ")}. Output: JPG, PNG, WEBP.</p>
        </section>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="mt-6"><FAQ items={faqs} /></div>
      </div>

      <div className="mt-16"><RelatedTools tools={getRelated(tool)} /></div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
