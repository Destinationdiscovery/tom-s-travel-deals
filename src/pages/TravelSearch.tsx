import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTravelSearch, SearchResult } from "@/hooks/useTravelSearch";
import { useGenerateReview } from "@/hooks/useGenerateReview";

const exampleChips = [
  "Adults only resorts in Punta Cana",
  "Beach resorts in Cancun",
  "Boutique hotels in Paris",
  "Family resorts in Jamaica",
  "Luxury villas in Bali",
  "All-inclusive resorts in Riviera Maya",
];

const TravelSearch = () => {
  const [query, setQuery] = useState("");
  const { results, citations, isLoading, error, search } = useTravelSearch();
  const { generateReview, isLoading: isGenerating } = useGenerateReview();
  const [reviewingName, setReviewingName] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length >= 3) search(trimmed);
  };

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    search(chip);
  };

  const handleReviewIt = async (result: SearchResult) => {
    setReviewingName(result.name);
    try {
      const { data, error: fnError } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke("generate-review", {
        body: { propertyName: result.name },
      });

      if (fnError || data?.error) throw new Error(fnError?.message || data?.error);

      if (data?.review?.slug) {
        navigate(`/review/${data.review.slug}`, { replace: true });
      }
    } catch {
      // Fall back to navigating home with the search
      navigate(`/?search=${encodeURIComponent(result.name)}`);
    } finally {
      setReviewingName(null);
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < full ? "fill-amber-400 text-amber-400" : i === full && half ? "fill-amber-400/50 text-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-muted-foreground">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero Search */}
        <section className="container mx-auto px-4 max-w-3xl text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-primary">Destination</span>{" "}
            <span className="text-foreground">Search</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Tell us what you're looking for and we'll find the best matches
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Try: adults only resorts in Punta Cana"
                className="w-full h-12 pl-12 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={isLoading || query.trim().length < 3}
              className="h-12 px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Example Chips */}
          {results.length === 0 && !isLoading && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {exampleChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-4 py-2 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="container mx-auto px-4 max-w-3xl text-center mb-8">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <section className="container mx-auto px-4 max-w-6xl">
            <p className="text-sm text-muted-foreground mb-6">
              {results.length} properties found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, i) => {
                const isReviewing = reviewingName === result.name;
                return (
                  <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg leading-tight truncate">{result.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{result.location}</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary whitespace-nowrap">{result.priceRange}</span>
                      </div>

                      {renderStars(result.rating)}

                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {result.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {result.bestFor.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleReviewIt(result)}
                        disabled={isReviewing}
                        className="w-full mt-auto"
                        variant="default"
                      >
                        {isReviewing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating Review...
                          </>
                        ) : (
                          "Review It"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Citations */}
            {citations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {citations.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline truncate max-w-[250px]"
                    >
                      [{i + 1}] {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TravelSearch;
