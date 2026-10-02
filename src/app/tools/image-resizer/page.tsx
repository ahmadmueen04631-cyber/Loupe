import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { ImageResizerTool } from "@/components/tools/ImageResizerTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-resizer")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Resize JPG, PNG and WEBP images in your browser. Set exact pixel dimensions, scale by percentage, or use a social media preset.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "Will resizing distort my image?", a: "Not if aspect ratio is locked — width and height change together so proportions stay correct. Unlock it, or pick a preset with a different ratio, and the image will stretch to fit." },
  { q: "What's the difference between pixels and percent?", a: "Pixels sets an exact width and height. Percent scales the whole image up or down from its original size — 50% makes it half as wide and half as tall." },
  { q: "Which preset should I use?", a: "1920×1080 and 1280×720 suit video thumbnails and desktop wallpapers, 1080×1080 fits Instagram posts, 1080×1350 and 1080×1920 fit portrait and story formats, and 1200×630 is the standard size for link previews on social media." },
  { q: "Does resizing reduce file size?", a: "Usually, yes — fewer pixels means a smaller file. For finer control over file size at a given resolution, pair this with the Image Compressor's quality slider." },
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
          <ImageResizerTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Upload an image, then set a target size — type exact pixels, drag a percentage slider, or tap a preset for a common size like 1080×1080. The preview updates as you adjust, so you can see the result before downloading.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Fitting a photo to a specific social media size before posting</li>
            <li>Shrinking a large camera photo down to web-friendly dimensions</li>
            <li>Preparing a thumbnail or banner image at an exact pixel size</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Exact pixel width and height, with aspect ratio lock</li>
            <li>Resize by percentage</li>
            <li>Six common presets for social and video formats</li>
            <li>Live preview and choice of output format</li>
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
