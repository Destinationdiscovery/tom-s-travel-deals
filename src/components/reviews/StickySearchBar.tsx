import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { classifySearchIntent, toSlug } from "@/lib/searchIntent";

interface StickySearchBarProps {
  placeholder?: string;
  className?: string;
}

const StickySearchBar = ({ placeholder = "Search hotels, resorts, cities… Paris, Bali, Cancun", className = "" }: StickySearchBarProps) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    // Always route to /reviews/:slug (list view). The list page will fall
    // through to a single-property review when the slug matches a property.
    navigate(`/reviews/${toSlug(trimmed)}`);
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 h-11 bg-background border-border"
        />
      </div>
      <Button type="submit" size="default" className="h-11 px-5 shrink-0">
        Search
      </Button>
    </form>
  );
};

export default StickySearchBar;
