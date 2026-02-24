import { Heart, ExternalLink, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import expediaLogo from "@/assets/expedia-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl font-bold mb-2">
              <span className="text-sky-300">Review</span>
              <span className="text-amber-400">Then</span>
              <span className="text-emerald-400">Go</span>
            </h3>
            <p className="text-primary-foreground/70 text-base mb-4">
              Honest destination reviews, tested travel gear, and real-world insights to help you travel with confidence.
            </p>
            <a
              href="https://tom.travelonly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors text-sm"
            >
              Visit my Travelonly profile <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Explore</h4>
            <nav className="flex flex-col gap-2">
              {[
                { to: "/", label: "Home" },
                { to: "/destinations", label: "Destinations" },
                { to: "/gear", label: "Gear" },
                { to: "/travel-intel", label: "Intel" },
                { to: "/compass", label: "Blog" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-base"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Legal</h4>
            <nav className="flex flex-col gap-2 mb-6">
              <Link to="/privacy-policy" className="text-primary-foreground/70 hover:text-secondary transition-colors text-base">
                Privacy Policy
              </Link>
              <Link to="/affiliate-disclosure" className="text-primary-foreground/70 hover:text-secondary transition-colors text-base">
                Affiliate Disclosure
              </Link>
            </nav>

            {/* Social */}
            <div className="flex items-center gap-4 mb-6">
              <a href="#" aria-label="Twitter" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            {/* Expedia badge */}
            <a
              href="https://www.expedia.ca/?affcid=CA.DIRECT.PHG.0000.HOTEL.kwrd%3D.0000&ref_id=1101l5c5bMbAX&my_ad=ABA-14217255"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2 hover:bg-primary-foreground/20 transition-colors"
            >
              <img src={expediaLogo} alt="Expedia" className="h-5 object-contain" />
              <span className="text-xs text-primary-foreground/70">Powered by Expedia</span>
            </a>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-1 text-sm text-primary-foreground/60">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-secondary fill-secondary" />
            <span>for travelers everywhere</span>
          </div>
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} Review Then Go. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
