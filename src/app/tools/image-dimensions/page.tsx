import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { ImageDimensionsTool } from "@/components/tools/ImageDimensionsTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-dimensions")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Check an image's width, height, aspect ratio, megapixels and file size instantly in your browser.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "How is aspect ratio calculated?", a: "Width and height are reduced to the smallest whole numbers with the same ratio — a 1920×1080 image shows as 16:9." },
  { q: "What counts as a megapixel?", a: "One megapixel is one million pixels. Multiplying width by height and dividing by one million gives the megapixel count, rounded to one decimal place." },
  { q: "Does this tool change my image?", a: "No — it only reads the file's dimensions and details. Nothing is modified, resized or uploaded." },
  { q: "Why is color type sometimes missing?", a: "Color type is read directly from the file's own header. It's available for most JPEG and PNG files; some formats or unusual encodings may not expose it." },
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
          <ImageDimensionsTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Upload any JPG, PNG or WEBP image and its width, height, aspect ratio, megapixel count, file size and format appear immediately. Tap the copy icon next to any value to copy it.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Checking whether an image meets a platform's minimum resolution</li>
            <li>Confirming an image's aspect ratio before resizing or cropping it</li>
            <li>Quickly comparing megapixel counts between photos</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Width, height, aspect ratio and megapixels</li>
            <li>File size, format and orientation</li>
            <li>Color type, when it can be read from the file</li>
            <li>One-tap copy for every value</li>
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
