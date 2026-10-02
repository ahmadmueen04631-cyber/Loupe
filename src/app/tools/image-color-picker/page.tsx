import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { ImageColorPickerTool } from "@/components/tools/ImageColorPickerTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-color-picker")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Pick any pixel color from an image and copy it as HEX, RGB, HSL or HSV, right in your browser.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "How precise is the color picker?", a: "It reads the exact pixel value at your cursor from the original image data, not from a scaled-down screen render, so the color is accurate down to the source pixel. The magnifier makes it easier to land on the right one." },
  { q: "What's the difference between HSL and HSV?", a: "Both describe a color by hue, but HSL's lightness runs from black through the pure color to white, while HSV's value runs from black up to the pure color only. Designers often prefer HSL for that reason; HSV maps more directly to how color pickers in image editors work." },
  { q: "Does the history save between visits?", a: "No — picked colors are kept only for the current session and clear when you refresh or upload a new image." },
  { q: "Is my image uploaded anywhere?", a: "No. The image is read and sampled directly in your browser." },
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
          <ImageColorPickerTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Upload an image and move your cursor over it — a magnified preview shows exactly which pixel you're about to pick. Click or tap to select it, then copy the color in whichever format you need.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Matching a brand color from a logo or screenshot</li>
            <li>Pulling a palette of colors from a photo for a design</li>
            <li>Checking the exact HEX value behind a UI screenshot</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Magnified pixel-level preview while you move the cursor</li>
            <li>HEX, RGB, HSL and HSV values, each with one-tap copy</li>
            <li>Color history for the current session</li>
            <li>Works with touch as well as mouse</li>
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
