import { Button } from "@/components/ui/button";
import { Compass, Menu, X, User, LogOut, Bookmark, FolderOpen } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navLinks = [
    { to: "/destinations", label: "My Reviews" },
    { to: "/gear", label: "Gear Reviews" },
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

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/my-reviews" className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4" /> My Reviews
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-trips" className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" /> My Trips
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setAuthOpen(true)} variant="default" size="sm">
                Sign In
              </Button>
            )}
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

              {user ? (
                <>
                  <Link to="/my-reviews" className="text-left text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    My Reviews
                  </Link>
                  <Link to="/my-trips" className="text-left text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    My Trips
                  </Link>
                  <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="text-left text-lg font-medium text-destructive py-2">
                    Sign Out
                  </button>
                </>
              ) : (
                <Button onClick={() => { setAuthOpen(true); setIsMenuOpen(false); }} variant="default" className="w-full mt-2">
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default Header;
