import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { HeicConverterTool } from "@/components/tools/HeicConverterTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("heic-to-jpg")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Convert iPhone HEIC photos to JPG in your browser. Batch convert multiple files, no upload required.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "What is a HEIC file?", a: "HEIC is the photo format iPhones use by default since iOS 11. It compresses better than JPG, but many apps, older devices and Windows PCs can't open it directly, which is why converting to JPG is often needed." },
  { q: "Will converting reduce photo quality?", a: "JPG compression is lossy, so a lower quality setting trades a little detail for a smaller file. The default is set high enough that the difference is hard to notice." },
  { q: "Why does this take a bit longer than other conversions?", a: "Decoding HEIC requires a full decoder to run in your browser, which is heavier than the format conversions this site's other tools do with the browser's built-in canvas. It still never leaves your device — it just takes a moment more." },
  { q: "Can I convert several HEIC photos at once?", a: "Yes — drop in multiple files and each converts on its own. Download them individually or use Download all." },
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
          <HeicConverterTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Drop in a HEIC photo and it decodes and converts to JPG automatically. Adjust the quality slider to balance file size against detail, then download the result.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Sharing an iPhone photo with someone whose app can't open HEIC</li>
            <li>Uploading a photo to a site that only accepts JPG</li>
            <li>Converting a batch of photos after transferring them from an iPhone</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Convert multiple HEIC files in one batch</li>
            <li>Adjustable JPG quality</li>
            <li>Original and converted file size shown for each image</li>
            <li>Download individually or all at once</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">Upload: HEIC. Output: JPG.</p>
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
