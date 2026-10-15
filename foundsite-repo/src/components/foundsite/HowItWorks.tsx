const steps = [
  { n: "01", title: "Fill out the form", desc: "Tell us about your business: your name, services, colors, and what you want customers to know. Takes under 5 minutes." },
  { n: "02", title: "See your free preview", desc: "We build your SEO-optimized, mobile-ready site and show you a preview. You see it before you pay anything." },
  { n: "03", title: "Approve and go live", desc: "Happy with it? We connect your domain and launch. Live within 48 hours, and ready for Google to find." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-medium text-[var(--brand-black)]/70">
            Simple process
          </span>
          <h2 className="fs-section-title mt-4 text-4xl md:text-5xl">See it first. Pay only when you are happy.</h2>
          <p className="mt-4 text-lg text-[var(--brand-muted)]">
            No technical knowledge needed. No back and forth. Just fill out a form and we handle everything.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-7">
              <div className="pointer-events-none absolute -top-4 right-2 text-[110px] font-bold leading-none text-black/[0.04]" style={{ fontFamily: "var(--font-display)" }}>
                {s.n}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: "var(--brand-accent)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="relative mt-5 text-xl font-bold">{s.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
