type Source = { label: string; href: string };
type Stat = { n: string; text: string; sources: Source[] };

export default function StatStrip({ title, intro, stats, note }: { title: string; intro?: string; stats: Stat[]; note?: string }) {
  return (
    <section className="band" aria-labelledby="why-title">
      <div className="wrap">
        <h2 className="s" id="why-title">
          {title}
        </h2>
        {intro ? <p className="sub">{intro}</p> : null}
        <div className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.n + s.text.slice(0, 12)}>
              <b>{s.n}</b>
              <p>{s.text}</p>
              <span className="src">
                Source:{" "}
                {s.sources.map((x, i) => (
                  <span key={x.href}>
                    {i > 0 ? ", " : ""}
                    <a href={x.href} rel="noopener noreferrer" target="_blank">
                      {x.label}
                    </a>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
        {note ? <p className="stat-note">{note}</p> : null}
      </div>
    </section>
  );
}
