import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Nav({ hideDemoCta = false }: { hideDemoCta?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "How it works", href: "/#how" },
    { label: "Examples", href: "/#examples" },
    { label: "Pricing", href: "/#pricing" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-transparent bg-white/85 backdrop-blur transition-shadow ${
        scrolled ? "shadow-[0_8px_24px_-12px_rgba(10,10,10,0.12)] border-[var(--border)]" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="text-xl" aria-label="Foundsite home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--brand-black)]/70 transition-colors hover:text-[var(--brand-black)]">
              {l.label}
            </a>
          ))}
          <Link to="/work" className="text-sm text-[var(--brand-black)]/70 transition-colors hover:text-[var(--brand-black)]">
            Our Work
          </Link>
          {!hideDemoCta && (
            <Link
              to="/demo"
              className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: "var(--brand-accent)", color: "var(--brand-accent-dark)" }}
            >
              Book a Demo
            </Link>
          )}
          <a
            href="/#pricing"
            className="inline-flex items-center rounded-full bg-[var(--brand-black)] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
          >
            Free preview
          </a>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          {!hideDemoCta && (
            <Link
              to="/demo"
              className="inline-flex items-center rounded-full border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: "var(--brand-accent)", color: "var(--brand-accent-dark)" }}
            >
              Demo
            </Link>
          )}
          <a
            href="/#pricing"
            className="inline-flex items-center rounded-full bg-[var(--brand-black)] px-4 py-2 text-sm font-medium text-white"
          >
            Free preview
          </a>
        </div>
      </div>
    </header>
  );
}
