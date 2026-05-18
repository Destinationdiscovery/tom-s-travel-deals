import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Shield, Menu, Download, ChevronDown, Luggage, Calendar, Map, DollarSign, Plane, Brain, ShieldCheck, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import AdminLoginDialog from "@/components/auth/AdminLoginDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/compass", label: "Blog" },
  { to: "/guides", label: "Guides" },
  { to: "/#travel-deals", label: "Deals" },
];

const mobileExtraLinks = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const toolLinks = [
  { to: "/gear", label: "Trip Packing", icon: Luggage },
  { to: "/best-time", label: "Best Time", icon: Calendar },
  { to: "/itinerary", label: "Itinerary", icon: Map },
  { to: "/currency", label: "Currency", icon: DollarSign },
  { to: "/flights", label: "Flights", icon: Plane },
  { to: "/travel-intel", label: "Intel", icon: Brain },
  { to: "/safety", label: "Safety Scores", icon: ShieldCheck },
];

const Header = () => {
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);

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
              <span className="font-display text-xl md:text-3xl font-bold whitespace-nowrap">
                <span className="text-sky-300">Review</span>
                <span className="text-amber-400">Then</span>
                <span className="text-emerald-400">Go</span>
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
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

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-1 outline-none">
                Tools <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {toolLinks.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <DropdownMenuItem key={tool.to} asChild>
                      <Link to={tool.to} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {tool.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <ThemeToggle />

            <Link
              to="/install"
              className="md:hidden p-2 rounded-lg text-secondary hover:text-secondary/80 hover:bg-primary-foreground/10 transition-colors"
              aria-label="Install app"
            >
              <Download className="h-4 w-4" />
            </Link>

            {isAdmin && (
              <Link
                to="/gear-admin"
                className="hidden md:flex text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                Dashboard
              </Link>
            )}

            {/* My Trips primary CTA */}
            <Link
              to="/my-trips"
              className="hidden md:inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-sm font-semibold px-3.5 py-1.5 rounded-lg shadow-sm"
            >
              <Briefcase className="h-4 w-4" />
              My Trips
            </Link>

            {user && (
              <div
                aria-hidden
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground text-sm font-semibold border border-primary-foreground/20"
                title={user.email ?? "Account"}
              >
                {(user.email ?? "U").charAt(0).toUpperCase()}
              </div>
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
                <nav className="flex flex-col gap-3 mt-8" aria-label="Mobile navigation">
                  {/* Home */}
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors py-2"
                  >
                    Home
                  </Link>

                  {/* Mobile tools sub-group */}
                  <button
                    onClick={() => setToolsExpanded(!toolsExpanded)}
                    className="text-lg font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors py-2 flex items-center justify-between"
                  >
                    Tools
                    <ChevronDown className={`h-4 w-4 transition-transform ${toolsExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {toolsExpanded && (
                    <div className="flex flex-col gap-2 pl-4 -mt-1 mb-1">
                      {toolLinks.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.to}
                            to={tool.to}
                            onClick={() => setMobileOpen(false)}
                            className="text-base font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors flex items-center gap-2 py-1.5"
                          >
                            <Icon className="h-4 w-4" />
                            {tool.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Blog, Guides */}
                  <Link
                    to="/compass"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors py-2"
                  >
                    Blog
                  </Link>
                  <Link
                    to="/guides"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors py-2"
                  >
                    Guides
                  </Link>

                  {/* About + Contact */}
                  {mobileExtraLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Deals */}
                  <Link
                    to="/#travel-deals"
                    onClick={(e) => { handleDealsClick(e); setMobileOpen(false); }}
                    className="text-lg font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors py-2"
                  >
                    Deals
                  </Link>

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
    </>
  );
};

export default Header;
