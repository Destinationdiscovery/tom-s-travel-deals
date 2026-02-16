import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-beach.jpg";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";

export type SearchType = "destination" | "search" | "gear" | "requirements" | "advisories" | "news";

interface SearchTypeConfig {
  label: string;
  placeholder: string;
  buttonLabel: string;
}

const searchTypeConfigs: Record<SearchType, SearchTypeConfig> = {
  destination: {
    label: "Destination Review",
    placeholder: 'e.g. "Sandals Royal Barbados" or "Hotels in Cancun"',
    buttonLabel: "Explore Reviews",
  },
  search: {
    label: "Destination Search",
    placeholder: 'e.g. "Adults only in Punta Cana" or "Beach resorts in Cancun"',
    buttonLabel: "Search",
  },
  gear: {
    label: "Travel Gear Review",
    placeholder: 'e.g. "Cancun packing list" or "beach accessories"',
    buttonLabel: "Find Gear",
  },
  requirements: {
    label: "Travel Requirements",
    placeholder: 'e.g. "Canada to Mexico" or "USA to Japan"',
    buttonLabel: "Check Requirements",
  },
  advisories: {
    label: "Travel Advisories",
    placeholder: 'e.g. "Thailand" or "Colombia"',
    buttonLabel: "Check Advisories",
  },
  news: {
    label: "Travel News",
    placeholder: 'e.g. "Caribbean" or "Europe travel updates"',
    buttonLabel: "Find News",
  },
};

interface HeroSectionProps {
  onSearch: (propertyName: string) => void;
  isSearching?: boolean;
  onInlineSearch?: (type: SearchType, query: string) => void;
  onSearchTypeChange?: () => void;
}

const HeroSection = ({ onSearch, isSearching, onInlineSearch, onSearchTypeChange }: HeroSectionProps) => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("destination");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useSearchSuggestions(searchType === "destination" ? query : "");
  const inputRef = useRef<HTMLInputElement>(null);

  const config = searchTypeConfigs[searchType];

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    setQuery("");
    setShowSuggestions(false);
    onSearchTypeChange?.();
    inputRef.current?.focus();
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setShowSuggestions(false);

    if (searchType === "destination") {
      onSearch(trimmed);
    } else {
      onInlineSearch?.(searchType, trimmed);
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

  const handleDealsClick = () => {
    document.getElementById("travel-deals")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <img
        src={heroBackground}
        alt="Overwater villa at sunset"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="text-sky-300">REVIEW</span>{" "}
          <span className="text-amber-400">THEN</span>{" "}
          <span className="text-emerald-400 font-black">GO</span>
        </h1>

        <p className="text-white/80 text-xl md:text-2xl mb-10 font-light">
          Know what to expect before you go.
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          {/* Search Input + Button Row */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (searchType === "destination") {
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => searchType === "destination" && query.trim().length >= 2 && setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder={config.placeholder}
                className="w-full h-14 pl-12 pr-4 rounded-lg bg-white/95 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg"
              />

              {searchType === "destination" && showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-border overflow-hidden z-20">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onMouseDown={() => handleSuggestionClick(s.name)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3 text-sm"
                    >
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">{s.name}</span>
                        {s.secondaryText ? (
                          <span className="text-gray-500 text-xs">{s.secondaryText}</span>
                        ) : s.property_type ? (
                          <span className="text-gray-500 text-xs capitalize">{s.property_type}</span>
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
              className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg whitespace-nowrap disabled:opacity-50 w-full sm:w-auto shrink-0"
            >
              {isSearching && searchType === "destination" ? "Searching..." : config.buttonLabel}
            </Button>
          </div>

          {/* Category Buttons Row */}
          <div className="flex flex-wrap justify-center gap-2">
            {(Object.keys(searchTypeConfigs) as SearchType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleSearchTypeChange(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 ${
                  type === searchType
                    ? "bg-white/90 text-gray-900 font-semibold shadow-md"
                    : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                }`}
              >
                {searchTypeConfigs[type].label}
              </button>
            ))}
            <button
              onClick={handleDealsClick}
              className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              Travel Deals
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center">
          <div className="w-1 h-3 bg-white/30 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
