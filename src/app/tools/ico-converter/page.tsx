import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { IcoConverterTool } from "@/components/tools/IcoConverterTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("ico-converter")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Convert PNG, JPG or WEBP images to a multi-size .ico file in your browser.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "What sizes does the ICO file include?", a: "Each .ico packs six sizes — 16, 32, 48, 64, 128 and 256 pixels — so the right one is available wherever the icon is used, from a browser tab to a desktop shortcut." },
  { q: "What happens if my image isn't square?", a: "It's automatically center-cropped to the largest square that fits, then scaled to each icon size. For control over exactly what gets cropped, use the Favicon Generator instead." },
  { q: "Can I convert several images at once?", a: "Yes — drop in multiple files and each converts independently. Download them one at a time or all together." },
  { q: "Is my image uploaded anywhere?", a: "No. The conversion happens entirely in your browser." },
];

const jsonLd = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: tool.name, applicationCategory: "MultimediaApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: tool.name }]} />
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{tool.name}</h1>
      <p className="mt-3 max-w-2xl text-muted">{tool.description}</p>

      <div className="mt-8">
        <ToastProvider>
          <IcoConverterTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Drop in one or more PNG, JPG or WEBP images. Each one is center-cropped to a square if needed, scaled to the standard icon sizes, and packed into a single .ico file ready to download.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Turning a logo into a Windows application icon</li>
            <li>Preparing a favicon for a site that just needs a plain .ico</li>
            <li>Converting a batch of images for an icon set</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Convert PNG, JPG or WEBP to .ico</li>
            <li>Six sizes bundled into one file automatically</li>
            <li>Automatic center-crop for non-square images</li>
            <li>Batch conversion with download all</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">Upload: {tool.supportedFormats.filter((f) => f !== "ICO").join(", ")}. Output: ICO.</p>
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
