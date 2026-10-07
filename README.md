# PicFix — Browser-Based Image Tools

Fast, free image tools that run entirely in your browser. No accounts, no server-side uploads for processing — images are read, edited, and exported on the user's own device wherever the format allows it.

Live tools: compress, resize, crop, convert between JPG/PNG/WEBP/HEIC, image↔PDF, favicon/ICO generation, dimensions/DPI/color/metadata inspectors, and a Passport Photo Maker with AI background removal.

---

## 1. Technologies used

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Fonts | Bricolage Grotesque (display), Instrument Sans (body) — self-hosted via `@fontsource-variable` |
| PDF creation | `pdf-lib` |
| PDF rendering | `pdfjs-dist` |
| HEIC decoding | `heic2any` |
| Background removal | `@imgly/background-removal` (WASM/ONNX, runs on-device) |
| Hosting | Vercel (or any Next.js-compatible host) |
| Database | None |
| Analytics | Google Analytics 4 (optional, off unless configured) |

No other dependencies. Features that could be hand-rolled without a library were — `.ico` file writing, `.zip` archive writing, EXIF/PNG-header parsing, and image resize/crop/compress all use the Canvas API directly with zero extra packages.

Every dependency above loads lazily, only on the one tool page that needs it, via dynamic `import()`. The homepage and every other tool never download pdf-lib, pdfjs-dist, heic2any, or the background-removal model.

---

## 2. Project structure

```
src/
  app/
    page.tsx                  Homepage
    layout.tsx                Root layout, theme script, analytics
    opengraph-image.tsx        Generated OG/Twitter share image
    robots.ts / sitemap.ts     SEO routes
    tools/
      page.tsx                 /tools directory (search + filter)
      <tool-slug>/page.tsx      One route per tool (20 total)

  components/
    layout/                    Header, Footer
    ui/                        Button, Logo, ThemeToggle, Toast, sliders, inputs
    tools/                     Shared tool UI: UploadDropzone, FileResultCard,
                                CropOverlay, Breadcrumbs, FAQ, RelatedTools,
                                PrivacyNotice, ConverterTool + its page template,
                                and one component per tool (e.g. ImageCropperTool)
    tools/passport/            Passport Photo Maker's sub-components

  lib/
    image/                     Core image engine: load, compress, resize, crop,
                                rotate, EXIF/DPI parsing, color conversion,
                                ICO writer, ZIP writer, HEIC decoding
    pdf/                       pdf-lib / pdfjs-dist wrappers
    photo/                     Passport Photo pipeline: background removal,
                                unit conversion, presets, compositing,
                                target-file-size search, print sheet
    seo/                       Site constants (name, URL, GA ID)

  data/
    tools.ts                   Single source of truth for every tool: slug,
                                name, category, related tools, status

  types/
    tool.ts                    ToolDefinition type
```

Adding a new tool means: add an entry to `data/tools.ts`, build its component in `components/tools/`, add `app/tools/<slug>/page.tsx` using the existing page template pattern, flip `status` to `"live"`. Nothing else needs to change — cards, the sitemap, and related-tools links all derive from `data/tools.ts` automatically.

---

## 3. Installation

```bash
git clone <your-repo-url>
cd picfix
npm install
```

## 4. Development

```bash
npm run dev
```

Opens at `http://localhost:3000`. To test on a phone over the same Wi-Fi network, add your computer's LAN IPv4 address to `allowedDevOrigins` in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.23"], // your machine's IPv4 from ipconfig/ifconfig
};
```

Restart the dev server after editing it. Without this, the page loads on a phone but buttons won't respond — Next.js blocks cross-origin dev requests by default.

## 5. Production build

```bash
npm run build
npm run start
```

---

## 6. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Your production domain, no trailing slash. Used for canonical URLs, the sitemap, and Open Graph metadata. Falls back to `https://example.com` if unset — fine for local dev, **must** be set before deploying. |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 Measurement ID. Leave empty to ship with no analytics script at all. |

---

## 7. Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel, "Add New Project" → import the repo. Framework preset auto-detects as Next.js; no build command changes needed.
3. Under Project Settings → Environment Variables, add `NEXT_PUBLIC_SITE_URL` (your real domain) and, if using analytics, `NEXT_PUBLIC_GA_ID`.
4. Deploy. Vercel builds with `next build` and serves it automatically.
5. Once you have a custom domain attached, update `NEXT_PUBLIC_SITE_URL` to match and redeploy — the sitemap and canonical URLs read directly from it.

---

## 8. Google Analytics setup

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com) if you don't have one.
2. Find its Measurement ID under Admin → Data Streams → (your web stream) — format `G-XXXXXXXXXX`.
3. Set `NEXT_PUBLIC_GA_ID` to that value in Vercel's environment variables (or `.env.local` for local testing) and redeploy.
4. The script only loads when this variable is set (see `src/app/layout.tsx`) — nothing ships to users until you configure it.

Tracked automatically: pageviews. Tool-specific events (upload, conversion started/completed, download, error) described in the original brief are **not yet wired up** — see Known Limitations below.

## 9. Google Search Console setup

1. Go to [search.google.com/search-console](https://search.google.com/search-console) and add your domain as a property.
2. Verify ownership (DNS TXT record is usually simplest, or the HTML-file method if your host supports it).
3. Once verified, submit the sitemap: `https://your-domain.com/sitemap.xml`.
4. The sitemap is generated automatically from every tool marked `status: "live"` in `data/tools.ts` — no manual maintenance needed as tools are added.

---

## 10. Implemented tools (19)

**Compress** — Image Compressor
**Resize** — Image Resizer
**Edit** — Image Cropper, Passport Photo Maker & Background Changer
**Convert** — JPG↔PNG, WEBP↔JPG, JPG↔WEBP, PNG↔WEBP, HEIC→JPG, Image→PDF, PDF→JPG
**Generate** — Favicon Generator, ICO Converter
**Analyze** — Image Dimensions, Image DPI Checker, Image Color Picker, Image Metadata Viewer

All 19 are fully functional — no placeholder buttons or fake converters.

---

## 11. SEO implementation summary

- Every tool page: unique title, meta description, canonical URL, H1, FAQ section, `SoftwareApplication` JSON-LD structured data, breadcrumbs, related-tools internal links
- Auto-generated `sitemap.xml` (live tools only) and `robots.txt`
- Generated Open Graph + Twitter share image (`next/og`, no external asset)
- Clean URLs throughout (`/tools/image-compressor`, no query params)
- Written, specific page content per tool (use cases, features, FAQ) — not templated filler, though the 6 format-converter pages do share one content template with per-pair wording substituted in

**Not done:** real keyword-rank tracking, backlink strategy, or Search Console data review — those require the site to actually be live and crawled first.

## 12. Performance summary

- Heavy dependencies (pdf-lib, pdfjs-dist, heic2any, background-removal) are dynamically imported and confirmed (via build output) to never leak into the shared bundle or homepage
- Static generation for every page except `/tools` (dynamic, for the `?category=` query param)
- Minimal JS on content-only sections; interactivity is scoped to the specific tool component that needs it
- Self-hosted fonts, no external font requests

**Not done:** an actual Lighthouse run or Core Web Vitals measurement. No browser access exists in the environment this was built in — this needs a real run, ideally against the deployed Vercel URL rather than localhost.

## 13. Accessibility summary

- Skip-to-content link, visible focus rings, `prefers-reduced-motion` support
- All interactive icon-only buttons carry `aria-label`; decorative icons are `aria-hidden`
- Form inputs use `htmlFor`/`id` pairing or are nested inside their `<label>`
- Color is never the only signal (text accompanies every state change)
- A code-level audit was run and fixed what it could find (see Known Limitations)

**Not done:** a real screen-reader pass or full keyboard-only walkthrough, especially of the drag-to-crop interactions (Cropper, Favicon Generator, Passport Photo). These use pointer events and should be checked for a reasonable keyboard-accessible fallback or equivalent.

## 14. Known limitations

- **No real browser QA has been performed.** Every page builds and type-checks, but nothing has been visually inspected. This is the single most important gap before calling the site launch-ready.
- **No Lighthouse/Core Web Vitals numbers exist.**
- **Background removal quality varies** with lighting and background complexity — this is a genuine ML model limitation, not a bug. The tool surfaces guidance (a pro-tip banner, an upscale-quality warning) rather than claiming uniform results.
- **The `@imgly/background-removal` model downloads from imgly's CDN** on first use (a few MB, then browser-cached). The user's photo itself is never uploaded, but this is worth knowing if a fully air-gapped deployment is ever needed — self-hosting the model files is possible but wasn't set up here.
- **Analytics event tracking** (upload, conversion started/completed, download, error) is not wired up — only pageviews fire automatically via GA4.
- **No automated tests exist** — everything was verified via `npm run build` (TypeScript + build-time checks) rather than unit or integration tests.
- **HEIC decoding is client-side and can be slow** on large files or older devices, since it runs a full image decoder in-browser rather than using native OS support.

## 15. Recommended next tools / improvements

- Real event tracking for the analytics hooks already planned for (upload, convert, download, error)
- A proper screen-reader and keyboard-only accessibility pass
- Lighthouse-driven performance tuning once deployed
- Self-hosting the background-removal model if a stricter "nothing ever leaves this origin" privacy claim is wanted
- Additional tools: image watermarking, EXIF stripping as a standalone tool (currently only a side-effect of re-encoding), GIF support
