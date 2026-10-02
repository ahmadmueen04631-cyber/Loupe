export function FAQ({ items }: { items: [string, string][] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map(([q, a]) => (
        <details key={q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">{q}<span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
          <p className="mt-3 text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
