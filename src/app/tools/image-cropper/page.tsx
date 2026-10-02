import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { ImageCropperTool } from "@/components/tools/ImageCropperTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-cropper")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Crop JPG, PNG and WEBP images in your browser. Drag to select an area, snap to a ratio like 1:1 or 16:9, rotate, and zoom in for precision.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "How do I crop freehand instead of a fixed ratio?", a: "Choose \"Free\" and drag any corner handle — width and height can change independently instead of staying locked to a ratio." },
  { q: "What do the aspect ratio presets do?", a: "Picking a ratio like 1:1 or 16:9 locks the selection to that shape, so every corner drag keeps it proportional. Rotating the image resets the selection to fit the new orientation." },
  { q: "What does zoom do?", a: "Zoom enlarges the image in the editor so you can position the crop more precisely, especially on a small screen. It doesn't change the exported resolution — the crop is always taken from the full original image." },
  { q: "Can I rotate the image before cropping?", a: "Yes — the rotate buttons turn the image 90° at a time, and the crop selection resets to fit the new orientation." },
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
          <ImageCropperTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Upload an image, then drag the selection box or its corner handles to choose the area you want. Snap to a ratio, rotate the image if needed, and zoom in for finer control before downloading your crop.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Cutting a profile photo to a perfect square</li>
            <li>Trimming a screenshot down to just the relevant part</li>
            <li>Reframing a photo to 16:9 for a video thumbnail</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Drag-to-crop with resizable corner handles</li>
            <li>Free crop or snap to 1:1, 4:3, 16:9, 9:16, 3:2</li>
            <li>Rotate 90° at a time</li>
            <li>Zoom in for precise selection</li>
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
