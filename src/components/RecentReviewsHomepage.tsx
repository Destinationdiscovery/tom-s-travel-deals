import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ArrowRight, ExternalLink, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildDeepLinks, detectCountry } from "@/components/AffiliateLinks";
import { Button } from "@/components/ui/button";
import AIReviewResult from "@/components/AIReviewResult";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";

interface CachedReview {
  id: string;
  property_name: string;
  slug: string;
  location: string | null;
  property_type: string | null;
  review_data: any;
  created_at: string;
}

const RecentReviewsHomepage = () => {
  const [reviews, setReviews] = useState<CachedReview[]>([]);
  const country = useMemo(() => detectCountry(), []);
  const navigate = useNavigate();

  // Inline search state
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions } = useSearchSuggestions(query);
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("cached_reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      if (data) setReviews(data);
    };
    fetchReviews();
  }, []);

  const getOverallRating = (r: CachedReview): number => {
    const rd = r.review_data as any;
    return rd?.overall_rating || rd?.overallRating || 4.0;
  };

  const getSummary = (r: CachedReview): string => {
    const rd = r.review_data as any;
    return rd?.summary || rd?.description || "A popular destination worth exploring.";
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setShowSuggestions(false);
    generateReview(trimmed);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    generateReview(name);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Real Destination Reviews
          </h2>
          <Link
            to="/destinations"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Inline Search */}
        <div className="max-w-2xl mb-8">
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder='Search a hotel, resort, or destination...'
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSearch} disabled={isLoading || query.trim().length < 2} className="h-11 px-6">
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Inline results */}
        <div ref={resultsRef}>
          <AIReviewResult
            review={review}
            isLoading={isLoading}
            error={error}
            onNewReview={() => { clearReview(); setQuery(""); }}
            onReviewReady={(slug) => navigate(`/review/${slug}`, { replace: true })}
          />
        </div>

        {/* Recent review cards */}
        {!review && !isLoading && !error && reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map((rev) => {
              const rating = getOverallRating(rev);
              const summary = getSummary(rev);
              const expediaLink = buildDeepLinks(country, rev.property_name).expedia;
              return (
                <div
                  key={rev.id}
                  className="rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 flex flex-col"
                >
                  <Link
                    to={`/review/${rev.slug}`}
                    className="group p-5 flex flex-col gap-3 flex-1"
                  >
                    <h3 className="font-display font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {rev.property_name}
                    </h3>
                    {rev.location && (
                      <p className="text-xs text-muted-foreground">{rev.location}</p>
                    )}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.floor(rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {summary}
                    </p>
                    <span className="text-xs font-semibold text-primary group-hover:underline mt-auto">
                      Read Review →
                    </span>
                  </Link>
                  <div className="px-5 pb-4">
                    <a
                      href={expediaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Book on Expedia
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentReviewsHomepage;
