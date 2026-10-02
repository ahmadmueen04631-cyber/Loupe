import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { ImageToPdfTool } from "@/components/tools/ImageToPdfTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-to-pdf")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Combine JPG, PNG and WEBP images into one PDF in your browser. Reorder pages, pick a page size and margins, and download.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "Can I change the order of the pages?", a: "Yes — use the up and down arrows next to each image to reorder them before generating the PDF. Pages appear in the PDF in the order shown in the list." },
  { q: "What does \"Fit to image\" do?", a: "Instead of a fixed page size like A4, each page is sized to exactly match its image, with no margin. It's useful when you want the PDF to preserve each image's own proportions rather than fitting it onto a standard page." },
  { q: "Will this reduce image quality?", a: "Images are re-encoded as JPEG at the quality you choose before being placed on the page. A higher setting keeps more detail at the cost of a larger file." },
  { q: "Is there a limit to how many images I can combine?", a: "No hard limit, but very large batches take longer to process since everything happens in your browser rather than on a server." },
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
          <ImageToPdfTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Drop in your images, reorder them if needed, then choose a page size, orientation, margin and quality. Generating builds a single PDF with one image per page and downloads it right away.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Combining scanned pages or photos of documents into one file</li>
            <li>Putting together a simple photo booklet or portfolio</li>
            <li>Preparing images for a submission that requires a PDF</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Reorder pages before generating</li>
            <li>A4, Letter or fit-to-image page sizing</li>
            <li>Portrait, landscape or automatic orientation</li>
            <li>Adjustable margins and image quality</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">Upload: {tool.supportedFormats.filter((f) => f !== "PDF").join(", ")}. Output: PDF.</p>
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
