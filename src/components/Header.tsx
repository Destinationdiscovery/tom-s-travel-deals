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
            <h1 className="font-display text-xl font-bold text-foreground">Tom Laracy</h1>
            <p className="text-xs text-muted-foreground">Travel Consultant Est. 2011</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/destinations"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Destinations
          </Link>
          <button 
            onClick={() => scrollToSection("compass")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            The Compass
          </button>
          <Link 
            to="/about"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            About Tom
          </Link>
          <Link 
            to="/contact"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
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
              className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Destinations
            </Link>
            <button 
              onClick={() => scrollToSection("compass")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            >
              The Compass
            </button>
            <Link 
              to="/about"
              className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About Tom
            </Link>
            <Link 
              to="/contact"
              className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;