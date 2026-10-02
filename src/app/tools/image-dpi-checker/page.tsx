import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { ImageDpiCheckerTool } from "@/components/tools/ImageDpiCheckerTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-dpi-checker")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Check an image's DPI and the physical size it will print at, read locally in your browser.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "What is DPI?", a: "DPI stands for dots per inch — it's a count of how many pixels a printer will pack into each inch of paper. It has nothing to do with an image's pixel dimensions on their own; the same 3000×2000 image can print small and sharp at 300 DPI or large and soft at 72 DPI." },
  { q: "Why doesn't my image have a DPI value?", a: "DPI is only meaningful for print, so many images — especially screenshots, web graphics and photos straight off a phone — don't store one at all. Screens display pixels directly and ignore DPI entirely." },
  { q: "What DPI should I use for printing?", a: "300 DPI is the standard for sharp photo prints. 150 DPI is usually fine for large posters viewed from a distance, and 72–96 DPI is typical for on-screen use only." },
  { q: "How is print size calculated?", a: "Print size is the image's pixel dimensions divided by its DPI — a 3000-pixel-wide image at 300 DPI prints 10 inches wide." },
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
          <ImageDpiCheckerTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Upload an image and this tool reads any DPI value stored in its file header — a PNG's pHYs chunk, or a JPEG's JFIF or EXIF resolution tags. When one is found, it also works out the physical size the image would print at.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Checking whether a photo is high enough resolution for a print order</li>
            <li>Working out how large an image can print before it looks soft</li>
            <li>Confirming a design file meets a print shop's DPI requirement</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Reads DPI from PNG, JFIF and EXIF metadata</li>
            <li>Calculates physical print size in inches and centimeters</li>
            <li>Shows pixel dimensions, megapixels and file size alongside it</li>
            <li>Clear message when no DPI metadata exists</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">{tool.supportedFormats.join(", ")}</p>
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
