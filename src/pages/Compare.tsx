import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star, Trash2, Sparkles, Trophy, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import { Button } from "@/components/ui/button";
import AffiliateLinks from "@/components/AffiliateLinks";
import { useSavedReviews, type SavedReview } from "@/hooks/useSavedReviews";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ComparisonVerdict {
  categoryWinners: { category: string; winner: string; reason: string }[];
  overallWinner: string;
  recommendation: string;
  verdict: string;
}

const RatingBar = ({ label, value, isHighest }: { label: string; value: number; isHighest: boolean }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${isHighest ? "text-primary" : "text-foreground"}`}>
        {value}/5
      </span>
    </div>
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${isHighest ? "bg-primary" : "bg-muted-foreground/40"}`}
        style={{ width: `${(value / 5) * 100}%` }}
      />
    </div>
  </div>
);

const PropertyCard = ({
  review,
  onRemove,
  allReviews,
}: {
  review: SavedReview;
  onRemove: (slug: string) => void;
  allReviews: SavedReview[];
}) => {
  const allCategories = Object.keys(review.ratings);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft min-w-[280px] flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-foreground truncate">
            {review.propertyName}
          </h3>
          {review.location && (
            <p className="text-sm text-muted-foreground truncate">{review.location}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(review.slug)}
          className="flex-shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Overall rating */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(review.overallRating)
                ? "text-accent fill-accent"
                : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="text-sm font-bold text-foreground ml-1">{review.overallRating}</span>
      </div>

      {/* Rating breakdown */}
      <div className="space-y-3 mb-4 flex-1">
        {allCategories.map((cat) => {
          const val = review.ratings[cat] ?? 0;
          const highest =
            allReviews.length > 1 &&
            val === Math.max(...allReviews.map((r) => r.ratings[cat] ?? 0)) &&
            val > 0;
          return <RatingBar key={cat} label={cat} value={val} isHighest={highest} />;
        })}
      </div>

      {/* Best for */}
      {review.bestFor.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {review.bestFor.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      <p className="text-sm text-muted-foreground line-clamp-3">{review.summary}</p>
    </div>
  );
};

const Compare = () => {
  const { savedReviews, removeReview, clearAll } = useSavedReviews();
  const [verdict, setVerdict] = useState<ComparisonVerdict | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCompare = async () => {
    if (savedReviews.length < 2) {
      toast({ title: "Need at least 2 reviews", description: "Save more reviews to compare.", variant: "destructive" });
      return;
    }

    setIsComparing(true);
    setCompareError(null);
    setVerdict(null);

    try {
      const { data, error } = await supabase.functions.invoke("compare-reviews", {
        body: { reviews: savedReviews },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (data?.verdict) {
        setVerdict(data.verdict);
      } else {
        throw new Error("No verdict received");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Comparison failed";
      setCompareError(msg);
      toast({ title: "Comparison failed", description: msg, variant: "destructive" });
    } finally {
      setIsComparing(false);
    }
  };

  const handleRemove = (slug: string) => {
    removeReview(slug);
    setVerdict(null);
    toast({ title: "Removed", description: "Review removed from comparison." });
  };

  const itemListJsonLd = savedReviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "My Saved Hotels and Resorts",
    numberOfItems: savedReviews.length,
    itemListElement: savedReviews.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Hotel",
        name: r.propertyName,
        ...(r.location ? { address: r.location } : {}),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: r.overallRating,
          bestRating: 5,
        },
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-background">
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <Header />
      <AffiliateDisclosureBanner />
      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            My Saved Properties ({savedReviews.length})
          </h1>
          <p className="text-muted-foreground mt-1">
            {savedReviews.length === 0
              ? "No reviews saved yet. Browse hotels and tap the heart to save."
              : `${savedReviews.length} ${savedReviews.length === 1 ? "property" : "properties"} saved for comparison`}
          </p>
        </div>

        {savedReviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              Search for properties and save them to compare side-by-side.
            </p>
            <Button asChild>
              <Link to="/">Start Searching</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Side-by-side cards */}
            <div className="flex gap-6 overflow-x-auto pb-4 mb-8 snap-x">
              {savedReviews.map((r) => (
                <div key={r.slug} className="snap-start flex-shrink-0 w-[320px]">
                  <PropertyCard review={r} onRemove={handleRemove} allReviews={savedReviews} />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Button
                onClick={handleCompare}
                disabled={savedReviews.length < 2 || isComparing}
                size="lg"
                className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {isComparing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isComparing ? "Comparing..." : "Generate Verdict"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => { clearAll(); setVerdict(null); }}>
                Clear All
              </Button>
            </div>

            {/* Error */}
            {compareError && (
              <div className="bg-destructive/10 rounded-2xl p-6 mb-8">
                <p className="text-foreground font-medium">Comparison Failed</p>
                <p className="text-muted-foreground text-sm mt-1">{compareError}</p>
              </div>
            )}

            {/* AI Verdict */}
            {verdict && (
              <div className="animate-fade-up space-y-8">
                {/* Overall winner */}
                <div className="bg-card rounded-2xl p-8 shadow-soft">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                    <h2 className="font-display text-2xl font-bold text-foreground">ReviewThenGo Verdict</h2>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Overall Winner</p>
                    <p className="text-xl font-display font-bold text-primary">{verdict.overallWinner}</p>
                  </div>

                  <p className="text-foreground leading-relaxed whitespace-pre-line">{verdict.verdict}</p>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
                    <p className="text-foreground font-medium">{verdict.recommendation}</p>
                  </div>
                </div>

                {/* Category winners */}
                {verdict.categoryWinners.length > 0 && (
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-6">
                      Category Breakdown
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {verdict.categoryWinners.map((cw) => (
                        <div key={cw.category} className="bg-card rounded-2xl p-6 shadow-soft">
                          <h4 className="font-display font-bold text-foreground mb-2">{cw.category}</h4>
                          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary mb-3">
                            {cw.winner}
                          </span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{cw.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affiliate Links */}
                <AffiliateLinks />
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Compare;
