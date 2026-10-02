import { Breadcrumbs } from "./Breadcrumbs";
import { FAQ } from "./FAQ";
import { RelatedTools } from "./RelatedTools";
import { PrivacyNotice } from "./PrivacyNotice";
import { ConverterTool } from "./ConverterTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getRelated } from "@/data/tools";
import type { ToolDefinition } from "@/types/tool";
import type { OutputFormat } from "@/lib/image/formats";

export function ConverterPageBody({
  tool, targetFormat, acceptedTypes, acceptHint, fromLabel, toLabel,
}: {
  tool: ToolDefinition;
  targetFormat: OutputFormat;
  acceptedTypes: string[];
  acceptHint: string;
  fromLabel: string;
  toLabel: string;
}) {
  const lossy = targetFormat === "jpeg" || targetFormat === "webp";
  const faqs = [
    { q: `Will converting ${fromLabel} to ${toLabel} lose quality?`, a: lossy ? `${toLabel} compression is lossy, so a lower quality setting trades a little detail for a smaller file. The quality slider defaults to a high setting so the difference is usually hard to notice.` : `${toLabel} is lossless, so no image data is lost in the conversion — only the file format changes.` },
    { q: `Why convert to ${toLabel}?`, a: toLabel === "PNG" ? "PNG is lossless and supports transparency, which makes it a better fit for logos, screenshots and graphics with sharp edges or text." : toLabel === "WEBP" ? "WEBP typically produces smaller files than JPG or PNG at a similar quality, which helps pages load faster." : "JPG is the most widely supported photo format and works well for photographs where small file size matters more than perfect transparency." },
    { q: "Can I convert more than one image at once?", a: "Yes — drop in several files and each one converts on its own. Download them individually or use Download all once they're finished." },
    { q: "Are my images uploaded anywhere?", a: "No. The conversion happens in your browser using the canvas, and nothing is sent to a server." },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Breadcrumbs items={[{ label: "Tools", href: "/tools" }, { label: tool.name }]} />
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{tool.name}</h1>
      <p className="mt-3 max-w-2xl text-muted">{tool.description}</p>

      <div className="mt-8">
        <ToastProvider>
          <ConverterTool targetFormat={targetFormat} acceptedTypes={acceptedTypes} acceptHint={acceptHint} />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-4 text-muted">Drop in a {fromLabel} image and it converts to {toLabel} automatically. {lossy ? "Adjust the quality slider to balance file size against detail — every file re-converts as you move it." : "No quality setting is needed since the output is lossless."} Download each result, or grab them all at once.</p>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Common use cases</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Preparing images for a platform that only accepts {toLabel}</li>
            <li>Converting a batch of {fromLabel} files in one pass</li>
            <li>Switching format before compressing or resizing further</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Convert multiple images in one batch</li>
            {lossy && <li>Quality control for {toLabel} output</li>}
            <li>Original and converted file size shown for each image</li>
            <li>Download individually or all at once</li>
          </ul>
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted">Upload: {fromLabel}. Output: {toLabel}.</p>
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
