import { Button } from "@/components/ui/button";
import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const scrollToSection = (id: string) => {
    if (!isHomePage) {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-3xl font-bold"><span className="text-sky-300">Review</span><span className="text-amber-400">Then</span><span className="text-emerald-400">Go</span></h1>
            <p className="text-sm text-muted-foreground">Honest Reviews & Travel Insights</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/destinations"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            My Reviews
          </Link>
          <Link 
            to="/gear"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Gear Reviews
          </Link>
          <Link 
            to="/compass"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Travel Blog
          </Link>
          <Link 
            to="/about"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link 
              to="/destinations"
              className="text-left text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              My Reviews
            </Link>
            <Link 
              to="/gear"
              className="text-left text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Gear Reviews
            </Link>
            <Link 
              to="/compass"
              className="text-left text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Travel Blog
            </Link>
            <Link 
              to="/about"
              className="text-left text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;