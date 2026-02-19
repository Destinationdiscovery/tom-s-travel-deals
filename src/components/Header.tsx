import { Shield, Search } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/auth/AuthProvider";
import AdminLoginDialog from "@/components/auth/AdminLoginDialog";

const navLinks = [
  { to: "/destinations", label: "Reviews" },
  { to: "/gear", label: "Gear" },
  { to: "/compass", label: "Blog" },
  { to: "/about", label: "About" },
];

const Header = () => {
  const { isAdmin } = useAuth();

  const scrollToSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AdminLoginDialog />
          <Link to="/">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                <span className="text-sky-300">Review</span>
                <span className="text-amber-400">Then</span>
                <span className="text-emerald-400">Go</span>
              </h1>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={scrollToSearch}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Scroll to search"
          >
            <Search className="h-4 w-4" />
          </button>
          {isAdmin && (
            <Link
              to="/gear-admin"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Shield className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
