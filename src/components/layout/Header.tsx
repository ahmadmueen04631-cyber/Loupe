import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SITE } from "@/lib/seo/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <LogoMark /> {SITE.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2 sm:gap-5">
          <Link href="/tools" className="rounded-full px-3 py-2 text-[15px] text-muted transition-colors hover:text-ink">All tools</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
