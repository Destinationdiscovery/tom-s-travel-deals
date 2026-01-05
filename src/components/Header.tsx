import { Button } from "@/components/ui/button";
import { Plane, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Tom Laracy</h1>
            <p className="text-xs text-muted-foreground">Travelonly Agent</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection("deals")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Travel Deals
          </button>
          <button 
            onClick={() => scrollToSection("about")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection("newsletter")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Newsletter
          </button>
          <Button 
            variant="default"
            onClick={() => scrollToSection("contact")}
          >
            Get in Touch
          </Button>
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
            <button 
              onClick={() => scrollToSection("deals")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Travel Deals
            </button>
            <button 
              onClick={() => scrollToSection("about")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection("newsletter")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Newsletter
            </button>
            <Button 
              variant="default"
              onClick={() => scrollToSection("contact")}
              className="w-full"
            >
              Get in Touch
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
