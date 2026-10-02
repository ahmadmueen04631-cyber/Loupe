import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/tools/Breadcrumbs";
import { FAQ } from "@/components/tools/FAQ";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { PrivacyNotice } from "@/components/tools/PrivacyNotice";
import { PassportPhotoTool } from "@/components/tools/PassportPhotoTool";
import { ToastProvider } from "@/components/ui/Toast";
import { getTool, getRelated } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

const tool = getTool("image-background-changer")!;

export const metadata: Metadata = {
  title: "Passport Photo Maker & Background Changer",
  description: "Remove your photo's background, choose white or blue, crop it to a passport-style format, and download your finished photo — all in your browser.",
  alternates: { canonical: `/tools/${tool.slug}` },
  openGraph: { title: `Passport Photo Maker & Background Changer Online | ${SITE.name}`, description: tool.description },
};

const faqs = [
  { q: "What size should my passport-style photo be?", a: "It depends entirely on who's asking for it — a country's passport office, a university, or a scholarship program can each specify something different. This tool offers a few common passport-style formats (2×2 in and 35×45 mm) plus square and portrait options, and you can always enter exact custom dimensions. Always check the official instructions for your specific application before submitting." },
  { q: "Is this the official passport photo size for my country?", a: "No single size is universal, so this tool doesn't claim to match any one country's official passport requirement. The presets are common passport-style formats; use the custom size option if your country or institution specifies different dimensions." },
  { q: "Should my background be white or blue?", a: "Both are common choices for passport-style and application photos, but the required color varies by application. White is used as the default here since it's the most broadly requested; switch to blue, light blue, gray or a custom color if that's what your application asks for." },
  { q: "How accurate is the automatic background removal?", a: "It runs a segmentation model directly in your browser and generally handles clear, well-lit photos well. Results can vary with busy backgrounds, loose hair, or low contrast between you and the background — review the preview before downloading, and retake the photo against a plain background if the edges look rough." },
  { q: "Can I use this for a university or scholarship application photo?", a: "Many students use it for exactly that — removing a background, picking the required color, and resizing to the dimensions an application asks for. Since requirements vary by institution, double-check the application's instructions on size, background, format and file size before you submit." },
  { q: "Will this guarantee my photo is accepted?", a: "No tool can guarantee that, since acceptance depends entirely on the rules of whoever you're submitting to. This tool helps you prepare a photo that matches common formats; the final check against your specific application's requirements is always worth doing yourself." },
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
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Passport Photo Maker &amp; Image Background Changer</h1>
      <p className="mt-3 max-w-2xl text-muted">Create a clean passport-style application photo by removing the background, choosing a new color, cropping to your required size, and downloading the finished image. No Photoshop, no account.</p>

      <div className="mt-8">
        <ToastProvider>
          <PassportPhotoTool />
        </ToastProvider>
      </div>

      <div className="mt-6"><PrivacyNotice /></div>
      <p className="mt-3 text-sm text-muted">Photo requirements vary by institution. Always check the official application instructions before submitting your photo.</p>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Create Your University Application Photo</h2>
          <p className="mt-4 text-muted">This can save students from opening Photoshop or visiting a photo-editing shop for simple background and sizing changes. The workflow:</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
            <li>Upload your photo.</li>
            <li>The background is removed automatically.</li>
            <li>Choose the required background color.</li>
            <li>Select the appropriate photo dimensions.</li>
            <li>Adjust the crop and positioning.</li>
            <li>Download your final image.</li>
          </ol>
          <p className="mt-4 text-muted">Not every university, college or scholarship program has identical specifications — this tool covers the common formats and lets you enter exact custom dimensions for anything else.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">What Should I Check Before Uploading My Photo?</h2>
          <p className="mt-4 text-muted">Before submitting a photo to any application, verify:</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            <li>Required dimensions and aspect ratio</li>
            <li>Background color</li>
            <li>File format (JPG, PNG, etc.)</li>
            <li>Maximum file size</li>
            <li>Required resolution or DPI</li>
            <li>Whether glasses or head coverings are permitted</li>
            <li>Whether the photo needs to be recent</li>
            <li>Whether multiple copies are required</li>
          </ul>
          <p className="mt-4 text-muted">Universities, colleges, scholarship programs and other applications may each have different photo requirements — check the official instructions for your specific application before uploading the final image.</p>
        </section>
      </div>

      <div className="mt-16 rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-semibold tracking-tight">Tips for the Cleanest Result</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
          <li><span className="font-medium text-ink">Use a well-lit room and face a plain wall.</span> Even lighting and an uncluttered background give the automatic background removal a clean edge to detect — this is the single biggest factor in result quality.</li>
          <li><span className="font-medium text-ink">Avoid objects directly behind you</span> — lamps, chairs, cables or furniture edges can occasionally get left in. If you see any of the original background still showing in the preview, retaking the photo against a plainer wall is more reliable than trying to crop it out.</li>
          <li><span className="font-medium text-ink">Fill more of the frame.</span> If your crop needs to zoom in a lot to reach the target size, the result can look soft — the tool will warn you when this happens. Standing a little closer to the camera avoids it.</li>
        </ul>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-3">
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">How to Make a Passport-Style Photo</h2>
          <p className="mt-3 text-muted">Upload a clear, front-facing photo with even lighting. The background removes automatically — pick a passport-style preset or enter custom dimensions, position the crop, and download.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">Changing a Photo Background to White or Blue</h2>
          <p className="mt-3 text-muted">Switch to Change Background mode, or stay in Passport Photo mode and pick White, Blue, Light Blue, Gray or a custom color from the swatches — the preview updates instantly.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">Resizing a Photo for an Application</h2>
          <p className="mt-3 text-muted">Pick a preset like 2×2 in or 35×45 mm, or switch to Custom and enter exact width, height and unit. The crop locks to that ratio so your proportions are never stretched.</p>
        </section>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">Reducing Your Photo's File Size</h2>
          <p className="mt-3 text-muted">Open Advanced options and set a target file size — 100 KB, 200 KB, 500 KB or 1 MB — and the export quality adjusts automatically to get close to it. For further compression on any image, the <Link href="/tools/image-compressor" className="text-accent hover:underline">Image Compressor</Link> gives finer manual control.</p>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">Converting to JPG</h2>
          <p className="mt-3 text-muted">JPG is the recommended format for most application photos and is selected by default. Need to convert an existing photo without the background tools? Try <Link href="/tools/jpg-to-png" className="text-accent hover:underline">JPG to PNG</Link> or the other format converters.</p>
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
