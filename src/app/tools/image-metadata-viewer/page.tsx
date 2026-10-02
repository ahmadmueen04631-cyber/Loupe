import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { ImageMetadataTool } from "@/components/tools/ImageMetadataTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-metadata-viewer")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "View the EXIF and file metadata stored inside a photo — camera model, date taken, and more — read locally in your browser.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "Why doesn't my image show any EXIF data?", a: "EXIF metadata is mainly embedded by cameras and phones in JPEG files. PNG and WEBP images typically don't carry it, and many apps strip it out automatically when saving or sharing a photo." },
  { q: "Do you show my photo's exact location?", a: "No. If a photo contains location data, this tool only tells you that it's present — it doesn't display the coordinates." },
  { q: "Is my image uploaded to check its metadata?", a: "No. The file is read directly in your browser and nothing is sent to a server." },
  { q: "Can I remove metadata from an image?", a: "Re-saving an image through the Image Compressor or Image Resizer strips EXIF data, since both tools re-encode the image from scratch." },
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
          <ImageMetadataTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Upload an image and its file details appear right away, along with any camera and EXIF data found inside — make, model, date taken, exposure settings and orientation, when present.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Checking when and on what camera a photo was taken</li>
            <li>Confirming whether a photo still carries location metadata before sharing it</li>
            <li>Verifying that a re-saved image no longer contains EXIF data</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>File name, type, size and dimensions</li>
            <li>Camera make, model and shooting settings when available</li>
            <li>Date taken and EXIF orientation</li>
            <li>A clear notice when no metadata is found — no exact GPS shown</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">{tool.supportedFormats.join(", ")}. EXIF data is only read from JPEG files.</p>
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
