import { useEffect, useRef } from "react";
import { Star, MapPin, Sparkles, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import AffiliateLinks from "@/components/AffiliateLinks";
import type { CachedReview } from "@/hooks/useGenerateReview";

interface AIReviewResultProps {
  review: CachedReview | null;
  isLoading: boolean;
  error: string | null;
  onNewReview?: () => void;
}

const RatingBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}/5</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-700"
        style={{ width: `${(value / 5) * 100}%` }}
      />
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-12 animate-fade-in">
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">Generating your AI review...</span>
      </div>
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-5 w-1/3" />
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

const AIReviewResult = ({ review, isLoading, error, onNewReview }: AIReviewResultProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((review || isLoading) && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [review, isLoading]);

  if (!review && !isLoading && !error) return null;

  if (error) {
    return (
      <div ref={containerRef} className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-destructive/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Couldn't Generate Review
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div ref={containerRef} className="bg-background">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!review) return null;

  const data = review.review_data;

  return (
    <div ref={containerRef} className="bg-background animate-fade-up">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
              <Sparkles className="h-4 w-4" />
              AI-Generated Review
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              {data.propertyName}
            </h2>
            {data.location && (
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {data.location}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Summary Card */}
              <div className="bg-card rounded-2xl p-8 shadow-soft">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(data.overallRating)
                            ? "text-accent fill-accent"
                            : i < data.overallRating
                            ? "text-accent fill-accent opacity-50"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="text-lg font-bold text-foreground ml-2">
                      {data.overallRating}
                    </span>
                  </div>
                </div>
                <p className="text-lg text-foreground leading-relaxed">{data.summary}</p>
              </div>

              {/* Detailed Review */}
              <div className="space-y-6">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  What Travelers Say
                </h3>
                {data.reviewParagraphs?.map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tips */}
              {data.tips && data.tips.length > 0 && (
                <div className="bg-secondary/10 rounded-2xl p-8">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                    Travel Tips
                  </h3>
                  <ul className="space-y-4">
                    {data.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Affiliate Links */}
              <AffiliateLinks propertyName={data.propertyName || review.property_name} />

              {/* New Review Button */}
              {onNewReview && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      onNewReview();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Search Another Property
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Ratings Breakdown */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h3 className="font-display text-xl font-bold text-foreground mb-6">
                  Rating Breakdown
                </h3>
                <div className="space-y-4">
                  {data.ratings &&
                    Object.entries(data.ratings).map(([category, rating]) => (
                      <RatingBar key={category} label={category} value={Number(rating)} />
                    ))}
                </div>

                {data.bestFor && data.bestFor.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-3">Best For</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.bestFor.map((item) => (
                        <span
                          key={item}
                          className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Map */}
              {(data.propertyName || data.location) && (
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Location
                  </h3>
                  <div className="rounded-xl overflow-hidden border border-border">
                    <iframe
                      title="Destination map"
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        [data.propertyName, data.location].filter(Boolean).join(" ")
                      )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReviewResult;
