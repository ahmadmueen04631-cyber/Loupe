import Link from "next/link";
import type { ComponentProps } from "react";

const base = "inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-medium transition-colors";
const variants = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  secondary: "border border-line bg-surface text-ink hover:border-ink",
};

export function ButtonLink({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
