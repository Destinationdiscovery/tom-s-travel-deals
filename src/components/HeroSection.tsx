import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-beach.jpg";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";

interface HeroSectionProps {
  onSearch: (propertyName: string) => void;
  isSearching?: boolean;
}

const HeroSection = ({ onSearch, isSearching }: HeroSectionProps) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useSearchSuggestions(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      setShowSuggestions(false);
      onSearch(trimmed);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    onSearch(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Image */}
      <img
        src={heroBackground}
        alt="Overwater villa at sunset"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Main Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="text-sky-300">REVIEW</span>{" "}
          <span className="text-amber-400">THEN</span>{" "}
          <span className="text-emerald-400 font-black">GO</span>
        </h1>

        {/* Tagline */}
        <p className="text-white/80 text-xl md:text-2xl mb-10 font-light">
          Know what to expect before you go.
        </p>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl mx-auto relative">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search destinations, hotels, or experiences"
              className="w-full h-12 pl-12 pr-4 rounded-lg bg-white/95 backdrop-blur-sm text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-elevated border border-border overflow-hidden z-20">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onMouseDown={() => handleSuggestionClick(s.name)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3 text-sm"
                  >
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">{s.name}</span>
                      {s.secondaryText ? (
                        <span className="text-muted-foreground text-xs">
                          {s.secondaryText}
                        </span>
                      ) : s.property_type ? (
                        <span className="text-muted-foreground text-xs capitalize">
                          {s.property_type}
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleSearch}
            disabled={isSearching || query.trim().length < 2}
            className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg whitespace-nowrap disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Explore reviews"}
          </Button>
        </div>
      </div>


      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center">
          <div className="w-1 h-3 bg-white/30 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
