import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { Star, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import AIReviewResult from "@/components/AIReviewResult";

interface FeaturedReview {
  id: string;
  property_name: string;
  slug: string;
  location: string | null;
  rating: number;
  summary: string | null;
  image_url: string | null;
  affiliate_url: string | null;
  sale_label: string | null;
}

interface CachedReview {
  id: string;
  property_name: string;
  slug: string;
  location: string | null;
  review_data: any;
}

const RecentReviewsHomepage = () => {
  const [featured, setFeatured] = useState<FeaturedReview[]>([]);
  const [fallbackReviews, setFallbackReviews] = useState<CachedReview[]>([]);
  const navigate = useNavigate();

  // Search bar state
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useSearchSuggestions(query);
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("featured_reviews").select("*").order("slot_number") as any;
      if (data && data.length > 0) {
        setFeatured(data);
      } else {
        // Fallback to cached_reviews
        const { data: cached } = await supabase
          .from("cached_reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4);
        if (cached) setFallbackReviews(cached);
      }
    };
    fetch();
  }, []);

  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setShowSuggestions(false);
    clearReview();
    generateReview(trimmed);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }, [query, clearReview, generateReview]);

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    clearReview();
    generateReview(name);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  // Build cards from either featured or fallback
  const cards = featured.length > 0
    ? featured.map((f) => ({
        id: f.id,
        name: f.property_name,
        slug: f.slug,
        location: f.location,
        rating: Number(f.rating) || 4.0,
        summary: f.summary || "A popular destination worth exploring.",
        imageUrl: f.image_url,
        affiliateUrl: f.affiliate_url,
        saleLabel: f.sale_label,
      }))
    : fallbackReviews.map((r) => {
        const rd = r.review_data as any;
        return {
          id: r.id,
          name: r.property_name,
          slug: r.slug,
          location: r.location,
          rating: rd?.overall_rating || rd?.overallRating || 4.0,
          summary: rd?.summary || rd?.description || "A popular destination worth exploring.",
          imageUrl: null as string | null,
          affiliateUrl: null as string | null,
          saleLabel: null as string | null,
        };
      });

  if (cards.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Compare Hotel Reviews from Real Travelers
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">Aggregated hotel and resort reviews from 10+ trusted sources including Google, TripAdvisor, and Booking.com — all in one place.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 flex flex-col"
            >
              {/* Resort image */}
              {card.imageUrl && (
                <div className="relative">
                  <img src={card.imageUrl} alt={card.name} className="w-full h-40 object-cover" loading="lazy" />
                  {card.saleLabel && (
                    <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                      {card.saleLabel}
                    </span>
                  )}
                </div>
              )}

              <Link
                to={`/review/${card.slug}`}
                className="group p-5 flex flex-col gap-3 flex-1"
              >
                <h3 className="font-display font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {card.name}
                </h3>
                {card.location && (
                  <p className="text-xs text-muted-foreground">{card.location}</p>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(card.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-muted-foreground">
                    {card.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                  {card.summary}
                </p>
                <span className="text-xs font-semibold text-primary group-hover:underline mt-auto">
                  Read Review →
                </span>
              </Link>
              <div className="px-5 pb-4">
                <Link to={`/review/${card.slug}`}>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
                  >
                    Read Review
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Review search bar below cards */}
        <div className="mt-8 max-w-2xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-3">
            Looking for a specific property? Search for reviews below.
          </p>
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search a hotel, resort, or destination..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-20 max-h-60 overflow-y-auto">
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
              disabled={isLoading || query.trim().length < 2}
              className="h-11 px-5 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Inline search results */}
        <div ref={resultsRef} className="mt-4">
          <AIReviewResult
            review={review}
            isLoading={isLoading}
            error={error}
            onNewReview={clearReview}
            onReviewReady={(slug) => navigate(`/review/${slug}`, { replace: true })}
          />
        </div>
      </div>
    </section>
  );
};

export default RecentReviewsHomepage;
