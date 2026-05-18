import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";

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

  const examplePrompts = [
    "Do I need a visa for Japan as a Canadian?",
    "What to pack for Bali in October",
    "Is travel insurance worth it for Mexico?",
    "Best time to visit Italy, honest answer",
    "Is Barcelo Maya worth the price?",
  ];

  const sources = ["TripAdvisor", "Google Reviews", "Booking.com", "Reddit", "Expedia + 6 more"];

  const handlePillClick = (text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    onSearch?.(text);
  };

  return (
    <section className="relative min-h-[560px] md:min-h-[580px] flex items-center justify-center overflow-hidden py-12" aria-label="Hero carousel">
      {/* Rotating backgrounds */}
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.src}
          alt={slide.alt}
          width={1920}
          height={1080}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "auto"}
          decoding={i === 0 ? "sync" : "async"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="text-secondary text-[11px] md:text-xs tracking-[0.2em] uppercase font-semibold mb-3">
          Plan smarter. Travel better.
        </p>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight text-white">
          What do you need to know before your next trip?
        </h1>
        <p className="text-white/80 text-base md:text-lg font-light mb-6">
          Hotel reviews, itineraries, visa rules, packing lists, safety scores and more. Ask anything.
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
                placeholder="Ask a travel question or search any hotel, destination or topic..."
                className="w-full h-12 pl-10 pr-4 rounded-lg border-0 bg-white text-gray-900 placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 shadow-lg"
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
              {isSearching ? "..." : "Go"}
            </Button>
          </div>
        </div>

        {/* Example prompt pills */}
        <div className="max-w-2xl mx-auto mb-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-white/70 text-xs font-medium mr-1">For example:</span>
          {examplePrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePillClick(p)}
              className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-3 py-1.5 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Source attribution row */}
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2">
          <span className="text-secondary/90 text-xs font-medium mr-1">Pulls from:</span>
          {sources.map((s) => (
            <span
              key={s}
              className="rounded-full bg-white/10 border border-white/15 text-white/90 text-[11px] px-2.5 py-1 cursor-default"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 mt-5">
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
