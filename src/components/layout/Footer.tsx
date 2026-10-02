import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { SITE } from "@/lib/seo/site";

export function Footer() {
  const popular = TOOLS.filter((t) => t.popular).slice(0, 5);
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-semibold"><LogoMark /> {SITE.name}</div>
          <p className="mt-3 max-w-xs text-sm text-muted">{SITE.tagline}</p>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Tools</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {popular.map((t) => <li key={t.slug}>{t.status === "live" ? <Link className="hover:text-ink" href={`/tools/${t.slug}`}>{t.name}</Link> : t.name}</li>)}
            <li><Link className="hover:text-ink" href="/tools">All tools</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Categories</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {CATEGORIES.map((c) => <li key={c.name}><Link className="hover:text-ink" href={`/tools?category=${c.name}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold">Site</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/sitemap.xml">Sitemap</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-6 text-center text-xs text-muted">Images processed by our tools stay in your browser and are not uploaded to our servers.</p>
    </footer>
  );
}
