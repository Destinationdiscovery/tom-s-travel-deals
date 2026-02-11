import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-beach.jpg";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";

export type SearchType = "destination" | "gear" | "requirements" | "advisories" | "news";

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
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const { suggestions } = useSearchSuggestions(searchType === "destination" ? query : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const config = searchTypeConfigs[searchType];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTypeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    setQuery("");
    setShowTypeDropdown(false);
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
        <div className="max-w-3xl mx-auto">
          {/* Search Type Selector + Input + Button Row */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Type Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="h-12 px-4 rounded-lg bg-white/95 backdrop-blur-sm text-foreground text-sm font-medium flex items-center gap-2 whitespace-nowrap shadow-lg hover:bg-white transition-colors w-full sm:w-auto justify-between sm:justify-start"
              >
                {config.label}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showTypeDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Type Dropdown */}
              {showTypeDropdown && (
                <div className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[220px] mt-1 bg-white rounded-lg shadow-lg border border-border overflow-hidden z-30">
                  {(Object.keys(searchTypeConfigs) as SearchType[]).map((type) => (
                    <button
                      key={type}
                      onMouseDown={() => handleSearchTypeChange(type)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        type === searchType
                          ? "bg-muted font-medium text-foreground"
                          : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {searchTypeConfigs[type].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
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
                className="w-full h-12 pl-12 pr-4 rounded-lg bg-white/95 backdrop-blur-sm text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg"
              />

              {/* Suggestions Dropdown (destination only) */}
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

            {/* Search Button */}
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={isSearching || query.trim().length < 2}
              className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg whitespace-nowrap disabled:opacity-50 w-full sm:w-auto shrink-0"
            >
              {isSearching && searchType === "destination" ? "Searching..." : config.buttonLabel}
            </Button>
          </div>
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
