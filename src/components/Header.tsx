import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Shield, Search, Menu, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import AdminLoginDialog from "@/components/auth/AdminLoginDialog";
import ExpediaSearchWidget from "@/components/ExpediaSearchWidget";
import ThemeToggle from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/gear", label: "Gear" },
  { to: "/travel-intel", label: "Intel" },
  { to: "/compass", label: "Blog" },
  { to: "/guides", label: "Guides" },
  { to: "/#travel-deals", label: "Deals" },
];

const Header = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDealsClick = useCallback((e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      document.getElementById("travel-deals")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-secondary focus:text-secondary-foreground focus:rounded-lg focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-md border-b border-primary/20"
        style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
      >
        <div className="container mx-auto px-3 md:px-4 py-3 flex items-center justify-between min-w-0">
          {/* Left: logo */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <AdminLoginDialog />
            <Link to="/">
              <h1 className="font-display text-xl md:text-3xl font-bold whitespace-nowrap">
                <span className="text-sky-300">Review</span>
                <span className="text-amber-400">Then</span>
                <span className="text-emerald-400">Go</span>
              </h1>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={link.label === "Deals" ? handleDealsClick : undefined}
                className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions — compact on mobile */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setWidgetOpen((v) => !v)}
              className="p-2 rounded-lg text-primary-foreground/70 hover:text-secondary hover:bg-primary-foreground/10 transition-colors"
              aria-label="Toggle Expedia search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Install icon — always visible on mobile */}
            <Link
              to="/install"
              className="md:hidden p-2 rounded-lg text-secondary hover:text-secondary/80 hover:bg-primary-foreground/10 transition-colors"
              aria-label="Install app"
            >
              <Download className="h-4 w-4" />
            </Link>

            {/* Admin link — desktop only */}
            {isAdmin && (
              <Link
                to="/gear-admin"
                className="hidden md:flex text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                Dashboard
              </Link>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 rounded-lg text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-primary border-primary/20 p-6">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={(e) => {
                        if (link.label === "Deals") handleDealsClick(e);
                        setMobileOpen(false);
                      }}
                      className="text-lg font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/install"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-secondary hover:text-secondary/80 transition-colors flex items-center gap-2 py-2"
                  >
                    <Download className="h-4 w-4" />
                    Install App
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/gear-admin"
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center gap-2 py-2"
                    >
                      <Shield className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <ExpediaSearchWidget isOpen={widgetOpen} onClose={() => setWidgetOpen(false)} />
    </>
  );
};

export default Header;
