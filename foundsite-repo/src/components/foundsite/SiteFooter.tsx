import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="text-white" style={{ background: "var(--brand-black)" }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="text-2xl"><Logo /></div>
          <p className="mt-3 text-sm text-white/60">Get found. Get customers.</p>
          <p className="mt-2 text-xs text-white/50">Based in Brantford, Ontario.</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Product</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="/#how" className="text-white/80 hover:text-white">How it works</a></li>
            <li><Link to="/work" className="text-white/80 hover:text-white">Our Work</Link></li>
            <li><Link to="/demo" className="text-white/80 hover:text-white">Book a Demo</Link></li>
            <li><a href="/#pricing" className="text-white/80 hover:text-white">Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Company</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="mailto:foundsite@outlook.com" className="text-white/80 hover:text-white">Contact</a></li>
            <li><Link to="/admin/login" className="text-white/50 hover:text-white">Team login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-white/70 md:flex-row">
          <span>© 2026 Foundsite. All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <a href="mailto:foundsite@outlook.com" className="hover:text-white">foundsite@outlook.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
