import { useState } from "react";
import { Heart, ExternalLink, Twitter, Instagram, Send } from "lucide-react";
import { Link } from "react-router-dom";
import expediaLogo from "@/assets/expedia-logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackAffiliateClick, trackEmailSignup } from "@/lib/analytics";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("subscribe", {
        body: { email: trimmed, source_slug: "footer", interests: ["deals"] },
      });
      if (error) throw error;
      trackEmailSignup("footer");
      toast({ title: "You're in! 🎉", description: "Check your inbox for weekly deals." });
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl font-bold mb-2">
              <span className="text-sky-300">Review</span>
              <span className="text-amber-400">Then</span>
              <span className="text-emerald-400">Go</span>
            </h3>
            <p className="text-primary-foreground/70 text-base mb-4">
              The all-in-one travel planning tool. Reviews, packing lists, itineraries, flights, safety, and more — all in one place.
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

          {/* Explore */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Explore</h4>
            <nav className="flex flex-col gap-2">
              {[
                { to: "/", label: "Home" },
                { to: "/destinations", label: "Destinations" },
                { to: "/compass", label: "Blog" },
                { to: "/guides", label: "Guides" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
                { to: "/install", label: "Install App" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-primary-foreground/70 hover:text-secondary transition-colors text-base">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Tools</h4>
            <nav className="flex flex-col gap-2">
              {[
                { to: "/gear", label: "Trip Packing Toolkit" },
                { to: "/best-time", label: "Best Time to Visit" },
                { to: "/itinerary", label: "Itinerary Builder" },
                { to: "/currency", label: "Currency Tracker" },
                { to: "/flights", label: "Flight Deals" },
                { to: "/travel-intel", label: "Travel Intel" },
                { to: "/safety", label: "Safety Scores" },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-primary-foreground/70 hover:text-secondary transition-colors text-base">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/privacy-policy" className="text-primary-foreground/70 hover:text-secondary transition-colors text-base">
                Privacy Policy
              </Link>
              <Link to="/affiliate-disclosure" className="text-primary-foreground/70 hover:text-secondary transition-colors text-base">
                Affiliate Disclosure
              </Link>
            </nav>
          </div>

          {/* Stay Connected */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Stay Connected</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-xs">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-9 text-sm"
              />
              <Button type="submit" disabled={submitting} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-9 px-3">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
            <p className="text-xs text-primary-foreground/40 mt-1 mb-4">Get weekly deals, no spam.</p>

            <div className="flex items-center gap-4 mb-4">
              <a href="https://x.com/TomLaracyTravel" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/reviewthengo/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/60 hover:text-secondary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            <a
              href="https://www.expedia.ca/?affcid=CA.DIRECT.PHG.0000.HOTEL.kwrd%3D.0000&ref_id=1101l5c5bMbAX&my_ad=ABA-14217255"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick("Expedia", "footer", "footer_badge")}
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
