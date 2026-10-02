export function PrivacyNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0" aria-hidden="true">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
      </svg>
      <p>This tool runs in your browser. Your image is not uploaded to our servers.</p>
    </div>
  );
}
