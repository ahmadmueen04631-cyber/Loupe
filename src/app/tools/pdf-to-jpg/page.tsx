import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { PdfToJpgTool } from "@/components/tools/PdfToJpgTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("pdf-to-jpg")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Convert PDF pages to JPG images in your browser. Choose a page range, preview each page, and download individually or as a batch.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "Can I convert only some pages?", a: "Yes — set a from and to page after uploading, and only that range converts." },
  { q: "What resolution are the JPGs?", a: "Pages are rendered at twice the PDF's native point size, which gives a sharp result for most uses like sharing or quick edits. Very large or highly detailed pages may take a moment longer to render." },
  { q: "Can I download every page at once?", a: "Yes — once conversion finishes, Download all bundles every converted page into a ZIP." },
  { q: "Does this work with password-protected PDFs?", a: "No — encrypted PDFs can't be read in the browser and will show an error when opened." },
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
          <PdfToJpgTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Upload a PDF and its page count appears right away. Set a page range and quality, then convert — each page renders to a JPG you can preview, download individually, or grab all together as a ZIP.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Pulling a single page out of a PDF as an image</li>
            <li>Turning a scanned PDF into images for editing</li>
            <li>Creating thumbnails or previews from a document</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Choose a page range instead of converting the whole file</li>
            <li>Adjustable JPG quality</li>
            <li>Preview every converted page</li>
            <li>Download one page or all of them as a ZIP</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">Upload: PDF. Output: JPG.</p>
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
