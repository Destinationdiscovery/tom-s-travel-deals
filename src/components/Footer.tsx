import { Compass, Heart, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-evenly gap-12 mb-12 text-center md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-display text-3xl font-bold"><span className="text-sky-300">Review</span><span className="text-amber-400">Then</span><span className="text-emerald-400">Go</span></h3>
                <p className="text-sm text-muted-foreground">Real Traveller Reviews and Insights</p>
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-sm mb-4">
              Honest destination reviews, tested travel gear, and real-world insights to help you travel with confidence.
            </p>
            <a 
              href="https://tom.travelonly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-base"
            >
              Visit my Travelonly profile <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold text-background mb-4">Explore</h4>
            <nav className="flex flex-col items-center md:items-start gap-2">
              <Link to="/destinations" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                My Reviews
              </Link>
              <Link to="/compass" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                Travel Blog
              </Link>
              <Link to="/gear" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                Gear Reviews
              </Link>
              <Link to="/travel-intel" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                Travel Intel
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                About
              </Link>
            </nav>
          </div>

        </div>

        <div className="border-t border-muted-foreground/20 pt-8 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-1 text-base text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>for travelers everywhere</span>
          </div>

          <p className="text-base text-muted-foreground">
            © {currentYear} ReviewThenGo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
