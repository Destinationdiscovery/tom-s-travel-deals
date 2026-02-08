import { Compass, Heart, Mail, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-display text-xl font-bold text-background">TripReviews</h3>
                <p className="text-xs text-muted-foreground">Honest Reviews & Travel Insights</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              Honest destination reviews, tested travel gear, and real-world insights to help you travel with confidence.
            </p>
            <a 
              href="https://tom.travelonly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
            >
              Visit my Travelonly profile <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background mb-4">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/destinations" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Destinations
              </Link>
              <a href="/#compass" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                The Compass
              </a>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                About
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-background mb-4">Get in Touch</h4>
            <div className="flex flex-col gap-3">
              <a 
                href="https://form.jotform.com/260065315910247" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                Contact Form
              </a>
              <a 
                href="tel:519-771-2534" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                519-771-2534
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-muted-foreground/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>for travelers everywhere</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © {currentYear} TripReviews. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;