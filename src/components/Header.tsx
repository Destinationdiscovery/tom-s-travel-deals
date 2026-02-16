import { Compass, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/auth/AuthProvider";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navLinks = [
    { to: "/search", label: "Destination Search" },
    { to: "/gear", label: "Travel Gear Reviews" },
    { to: "/compass", label: "Travel Blog" },
    { to: "/about", label: "About" },
    { to: "/travel-intel", label: "Know Before You Go" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-3xl font-bold">
                <span className="text-sky-600">Review</span>
                <span className="text-amber-500">Then</span>
                <span className="text-emerald-600">Go</span>
              </h1>
              <p className="text-sm text-muted-foreground">Real Traveller Reviews and Insights</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/gear-admin"
                className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                Dashboard
              </Link>
            )}

            <ThemeToggle />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-t border-border animate-fade-in">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-left text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/gear-admin"
                  className="text-left text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2 flex items-center gap-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Dashboard
                </Link>
              )}

            </nav>
          </div>
        )}
      </header>

    </>
  );
};

export default Header;
