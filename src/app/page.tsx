import { ButtonLink } from "@/components/ui/Button";
import { ToolCard } from "@/components/tools/ToolCard";
import { CATEGORIES, TOOLS, toolsByCategory } from "@/data/tools";
import Link from "next/link";

const benefits = [
  ["Private by design", "Your images are processed locally in your browser whenever possible."],
  ["Instant", "No upload queue. Results appear as soon as your device finishes the work."],
  ["No signup", "Open a tool and use it. No account, no email, no limits on trying."],
  ["Free to use", "Every tool is free."],
  ["Works on your phone", "Layouts and file pickers are built for small screens first."],
  ["Every common format", "JPG, PNG, WEBP, HEIC, ICO and PDF."],
];
const steps = [
  ["Upload", "Drop an image or choose one from your device."],
  ["Customize", "Pick a format, size or quality and watch the preview update."],
  ["Download", "Save the result, or grab a batch in one go."],
];
const faqs = [
  ["Are my images uploaded to a server?", "Tools on this site are built to run in your browser, so images stay on your device and are not uploaded to our servers."],
  ["Do I need an account?", "No. There is nothing to sign up for."],
  ["Which formats can I use?", "JPG, PNG, WEBP, HEIC, ICO and PDF, depending on the tool. Each tool page lists what it accepts."],
  ["Will compressing reduce quality?", "JPG and WEBP compression is lossy, so a lower quality setting means a smaller file with some detail lost. You choose the balance and see the size change before downloading."],
];

export default function Home() {
  const popular = TOOLS.filter((t) => t.popular).slice(0, 6);
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
          <div>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">Powerful image tools. Right in your browser.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">Compress, resize, convert, crop, and optimize your images instantly. Fast, free, and designed with privacy in mind.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/tools">Explore image tools</ButtonLink>
              <ButtonLink href="/tools?category=Compress" variant="secondary">Compress an image</ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto h-[380px] w-full max-w-md" aria-hidden="true">
            {[
              { label: "photo.jpg", meta: "Original · 4.2 MB", bg: "linear-gradient(135deg,#f6b26b,#c0392b 55%,#3b1f4a)", pos: "left-0 top-2", r: "-6deg", fx: "-40px", fy: "20px", d: "0ms" },
              { label: "photo.webp", meta: "Compressed · 1.1 MB", bg: "linear-gradient(135deg,#7ad0c8,#2b6cb0 60%,#1a1f4b)", pos: "left-14 top-24", r: "2deg", fx: "-30px", fy: "20px", d: "200ms" },
            ].map((f) => (
              <div key={f.label} className={`frame absolute ${f.pos} w-[78%] rounded-2xl border border-line bg-surface p-3 shadow-xl shadow-black/5`} style={{ "--r": f.r, "--fx": f.fx, "--fy": f.fy, "--d": f.d } as React.CSSProperties}>
                <div className="h-36 rounded-xl" style={{ background: f.bg }} />
                <div className="mt-3 flex items-center justify-between px-1 text-sm"><span className="font-medium">{f.label}</span><span className="text-muted">{f.meta}</span></div>
              </div>
            ))}
            <div className="frame absolute bottom-4 right-0 w-[68%] rounded-2xl bg-accent p-5 text-accent-ink shadow-xl" style={{ "--r": "-1deg", "--fx": "0px", "--fy": "30px", "--d": "400ms" } as React.CSSProperties}>
              <p className="text-sm opacity-80">Your image is ready</p>
              <p className="mt-1 font-display text-3xl font-semibold">Saved 73.8%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Popular tools</h2>
          <Link href="/tools" className="text-sm text-muted hover:text-ink">See all tools</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{popular.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Find the right tool by job</h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.name} href={`/tools?category=${c.name}`} className="bg-surface p-6 transition-colors hover:bg-bg">
              <h3 className="font-display text-xl font-semibold">{c.name}</h3>
              <p className="mt-1 text-sm text-muted">{c.blurb} · {toolsByCategory(c.name).length} {toolsByCategory(c.name).length === 1 ? "tool" : "tools"}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Why people use Loupe</h2>
          <dl className="mt-8 space-y-6">
            {benefits.map(([t, d]) => (<div key={t}><dt className="font-medium">{t}</dt><dd className="mt-1 text-muted">{d}</dd></div>))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-8 space-y-4">
            {steps.map(([t, d], i) => (
              <li key={t} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent font-display font-semibold text-accent-ink">{i + 1}</span>
                <div><p className="font-display text-lg font-semibold">{t}</p><p className="mt-1 text-muted">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Questions</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">{q}<span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
              <p className="mt-3 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-3xl bg-ink p-10 text-bg sm:p-16">
          <h2 className="max-w-xl font-display text-4xl font-semibold tracking-tight">Got an image that needs fixing?</h2>
          <div className="mt-8"><ButtonLink href="/tools">Explore image tools</ButtonLink></div>
        </div>
      </section>
    </>
  );
}
