const points = [
  {
    t: "They check you before they call",
    d: "Before someone phones a restaurant, a salon or a contractor, most people look it up on their phone first. If what they find is thin, old or missing, they move on to the next name.",
  },
  {
    t: "Hours, prices and a phone number, fast",
    d: "Customers want the basics in seconds: what you do, where you are, when you are open and how to reach you. Social pages bury those details or leave them out.",
  },
  {
    t: "A site makes a small business look established",
    d: "A clean, current website tells a stranger you are real and reachable. That first impression happens before they ever speak to you.",
  },
];

export function WebsiteStats() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--brand-off)] py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-medium text-[var(--brand-black)]/70">What customers do</span>
          <h2 className="fs-section-title mt-4 text-4xl md:text-5xl">Someone searched for a business like yours today</h2>
          <p className="mt-4 text-lg text-[var(--brand-muted)]">
            Here is what happens next, and why the first thing they find matters.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {points.map((p, i) => (
            <div key={p.t} className="rounded-2xl border border-[var(--border)] bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="text-5xl font-extrabold tracking-tight" style={{ color: "var(--brand-accent)" }}>{i + 1}</div>
              <div className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--brand-black)]">{p.t}</div>
              <p className="mt-3 text-sm text-[var(--brand-muted)]">{p.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "var(--brand-accent)" }}
          >
            See what yours could look like <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
