import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { FaviconGeneratorTool } from "@/components/tools/FaviconGeneratorTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("favicon-generator")!;

export const metadata: Metadata = {
  title: tool.name,
  description: "Generate a complete favicon package — ICO, PNG sizes, Apple touch icon and web manifest — from one image, in your browser.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `${tool.name} | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "How do I install the favicon on my website?", a: "Unzip the package into your site's root folder, then add this to your HTML <head>:" },
  { q: "Why does the package include so many sizes?", a: "Different places use different sizes — browser tabs use small ones, iOS home-screen shortcuts use apple-touch-icon.png, and Android and PWA install prompts use the larger android-chrome sizes listed in site.webmanifest." },
  { q: "Do I need to keep the square crop centered?", a: "It's worth it — browser tabs and home-screen icons render your image inside a small square, so keeping the subject centered with a little margin stops it from feeling cropped too tightly." },
  { q: "Is my image uploaded to generate the package?", a: "No. Every size is rendered and packaged directly in your browser." },
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
          <FaviconGeneratorTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Upload an image, drag the square selection to frame your logo or mark, and zoom in if you need finer positioning. Generating builds every common favicon size and downloads them together as a ZIP.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Installing your favicon</h2>
          <p className="mt-4 text-muted">Unzip the package into your site's root folder (next to index.html), then add this inside your page's &lt;head&gt;:</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-bg p-4 text-xs text-muted">{`<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`}</pre>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Drag-to-position square crop with zoom</li>
            <li>Multi-size .ico plus standalone PNGs</li>
            <li>Apple touch icon and Android Chrome sizes</li>
            <li>Ready-made site.webmanifest included</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">Upload: {tool.supportedFormats.filter((f) => f !== "ICO").join(", ")}. Output: a ZIP package.</p>
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
