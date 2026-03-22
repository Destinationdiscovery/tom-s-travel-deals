import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectCountry, EXPEDIA_LINKS } from "@/components/AffiliateLinks";
import { trackAffiliateClick } from "@/lib/analytics";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import expediaLogo from "@/assets/expedia-logo.png";

import heroBeach from "@/assets/hero-beach.jpg";
import snowbirdBeach from "@/assets/snowbird-beach-sunset.jpg";
import snowbirdCaribbean from "@/assets/snowbird-caribbean-aerial.jpg";
import dealSantorini from "@/assets/deal-santorini.jpg";
import tokyoSkyline from "@/assets/japan-tokyo-skyline.jpg";

const slides = [
  { src: heroBeach, alt: "Beach destination for travel planning on ReviewThenGo" },
  { src: snowbirdBeach, alt: "Caribbean beach sunset resort view" },
  { src: snowbirdCaribbean, alt: "Caribbean aerial view of tropical resort" },
  { src: dealSantorini, alt: "Santorini hotel with ocean views travel deal" },
  { src: tokyoSkyline, alt: "Tokyo skyline travel destination Japan" },
];

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  isSearching?: boolean;
}

const HeroSection = ({ onSearch, isSearching }: HeroSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useSearchSuggestions(query);

  useEffect(() => {
    const len = slides.length;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % len);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || !onSearch) return;
    setShowSuggestions(false);
    onSearch(trimmed);
  }, [query, onSearch]);

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    onSearch?.(name);
  };

  return (
    <section className="relative h-[520px] md:h-[500px] flex items-center justify-center overflow-hidden" aria-label="Hero carousel">
      {/* Rotating backgrounds */}
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.src}
          alt={slide.alt}
          loading={i === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-white">
          Answers Every Travel Question Before You Book
        </h1>
        <p className="text-white/80 text-base md:text-lg font-light mb-2">
          Your travel aggregator for reviews, packing lists, best times to visit, and more, all in one place.
        </p>
        <p className="text-white/60 text-xs mb-6">
          By Travel Experts at ReviewThenGo | Aggregating 10M+ reviews from TripAdvisor, Booking.com, Google
        </p>

        {/* Integrated search bar */}
        <div className="max-w-xl mx-auto mb-4">
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask anything: hotel reviews, packing lists, best time to visit..."
                className="w-full h-12 pl-10 pr-4 rounded-lg border-0 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 shadow-lg"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-20">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onMouseDown={() => handleSuggestionClick(s.name)}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground font-medium">{s.name}</span>
                      {s.secondaryText && <span className="text-muted-foreground text-xs ml-1">{s.secondaryText}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || query.trim().length < 2}
              variant="default"
              className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          <p className="text-white/70 text-xs mt-2">
            Search any hotel, resort, or destination worldwide and get AI-powered reviews instantly.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-white/60 text-sm font-light">Powered by:</span>
            <a
              href={EXPEDIA_LINKS[detectCountry()]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={expediaLogo} alt="Expedia" className="h-8 md:h-10" />
            </a>
          </div>
          <a
            href="/install"
            className="md:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/25 transition-colors"
          >
            <Download className="h-4 w-4" />
            Install App
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
