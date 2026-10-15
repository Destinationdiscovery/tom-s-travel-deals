export function CtaBanner() {
  return (
    <section className="py-20 text-white" style={{ background: "var(--brand-accent)" }}>
      <div className="mx-auto max-w-4xl px-5 text-center">
        <h2 className="fs-section-title text-4xl md:text-5xl">Your customers are searching right now.</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">See your new website before you pay anything.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold shadow-lg transition-transform hover:scale-[1.02]" style={{ color: "var(--brand-accent-dark)" }}>
            Get my free preview <span aria-hidden>→</span>
          </a>
          <a href="mailto:foundsite@outlook.com" className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-transparent px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-white hover:text-[var(--brand-accent-dark)]">
            Have questions? Email us
          </a>
        </div>
      </div>
    </section>
  );
}
