import { useState } from "react";
import { Shield, Search, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import AdminLoginDialog from "@/components/auth/AdminLoginDialog";
import ExpediaSearchWidget from "@/components/ExpediaSearchWidget";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/gear", label: "Gear" },
  { to: "/travel-intel", label: "Intel" },
  { to: "/compass", label: "Blog" },
  { to: "/#deals", label: "Deals" },
];

const Header = () => {
  const { isAdmin } = useAuth();
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AdminLoginDialog />
            <Link to="/">
              <h1 className="font-display text-2xl md:text-3xl font-bold">
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
                className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setWidgetOpen((v) => !v)}
              className="p-2 rounded-lg text-primary-foreground/70 hover:text-secondary hover:bg-primary-foreground/10 transition-colors"
              aria-label="Toggle Expedia search"
            >
              <Search className="h-4 w-4" />
            </button>
            {isAdmin && (
              <Link
                to="/gear-admin"
                className="text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center gap-1"
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
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
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
