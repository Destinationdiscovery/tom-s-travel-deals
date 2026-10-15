import { Link } from "@tanstack/react-router";
import { BrowserMock } from "./BrowserMock";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(0,194,122,0.18), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(0,194,122,0.12), transparent 70%)" }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-medium text-[var(--brand-black)]/80">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-accent)" }} />
            Websites for local businesses
          </span>
          <h1 className="fs-hero mt-6">
            See your website
            <br />
            <span style={{ color: "var(--brand-accent)" }}>before you pay.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--brand-muted)]">
            Customers look you up before they call. Tell us about your business in under 5 minutes and we build a free preview of your site. You see it before you pay anything. Live in 48 hours, from C$299, plus C$20 a month for hosting. Already have a site you are not happy with? We rebuild it at the same price.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,194,122,0.6)] transition-transform hover:scale-[1.02]"
              style={{ background: "var(--brand-accent)" }}
            >
              Get my free preview <span aria-hidden>→</span>
            </a>
            <a href="#how" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-black)] hover:underline">
              See how it works <span aria-hidden>→</span>
            </a>
          </div>
          <Link
            to="/demo"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--brand-accent-dark)" }}
          >
            📅 Book a 15 minute demo call <span aria-hidden>→</span>
          </Link>

          <p className="mt-10 text-sm text-[var(--brand-muted)]">
            Based in Brantford, Ontario.{" "}
            <a href="#examples" className="font-semibold underline" style={{ color: "var(--brand-accent-dark)" }}>
              See sites we have built
            </a>
          </p>
        </div>

        <div className="relative">
          <BrowserMock url="johnnys-kitchen.com">
            <div style={{ background: "var(--brand-dark)" }} className="flex items-center justify-between px-5 py-3 text-white">
              <span className="font-display text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Johnny's Kitchen</span>
              <div className="flex gap-4 text-xs text-white/80">
                <span>Menu</span>
                <span>Hours</span>
                <span>Contact</span>
              </div>
            </div>
            <div className="relative h-[200px] w-full">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                alt="Restaurant interior"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                <span className="w-fit rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "var(--brand-accent)" }}>
                  44 King St W, Hamilton, ON
                </span>
                <h3 className="text-2xl font-bold leading-tight">Comfort food done right.</h3>
                <button
                  className="mt-1 w-fit rounded-full px-4 py-1.5 text-xs font-semibold text-white"
                  style={{ background: "var(--brand-accent)" }}
                >
                  Reserve a Table
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 text-center text-white" style={{ background: "var(--brand-dark)" }}>
              <div className="border-r border-white/10 py-3">
                <div className="text-base font-bold">Call</div>
                <div className="text-[10px] text-white/60">One tap</div>
              </div>
              <div className="border-r border-white/10 py-3">
                <div className="text-base font-bold">Map</div>
                <div className="text-[10px] text-white/60">Embedded</div>
              </div>
              <div className="py-3">
                <div className="text-base font-bold">Hours</div>
                <div className="text-[10px] text-white/60">Listed</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="rounded-lg border border-[var(--border)] p-3">
                <div className="text-sm font-semibold">Dine In</div>
                <div className="text-xs text-[var(--brand-muted)]">Open daily 5pm</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-3">
                <div className="text-sm font-semibold">Takeout</div>
                <div className="text-xs text-[var(--brand-muted)]">Order online</div>
              </div>
            </div>
          </BrowserMock>

          <div className="absolute -top-4 -right-3 flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium shadow-md">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--brand-accent)" }} />
            Sample design
          </div>
          <div className="absolute -bottom-4 -left-3 flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium shadow-md">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            SEO optimized · Live in 48hrs
          </div>
        </div>
      </div>
    </section>
  );
}
