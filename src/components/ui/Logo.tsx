export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="9.5" stroke="currentColor" strokeWidth="3" />
      <rect x="10.5" y="10.5" width="7" height="7" rx="1.5" fill="var(--accent)" />
      <path d="M21 21l7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
