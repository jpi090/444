/** A news-style crawl along the bottom of a broadcast. */
export function Crawl({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="crawl">
      <span className="crawl-label">{label}</span>
      <div className="crawl-track">
        <div className="crawl-run">
          {items.map((t) => (
            <span key={t}>{t}</span>
          ))}
          {items.map((t) => (
            <span key={`again-${t}`} aria-hidden="true">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
