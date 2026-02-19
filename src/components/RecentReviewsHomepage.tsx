import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  if (reviews.length === 0) return null;

  const getOverallRating = (review: CachedReview): number => {
    const rd = review.review_data as any;
    return rd?.overall_rating || rd?.overallRating || 4.0;
  };

  const getSummary = (review: CachedReview): string => {
    const rd = review.review_data as any;
    return rd?.summary || rd?.description || "A popular destination worth exploring.";
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Recent Reviews
          </h2>
          <Link
            to="/destinations"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((review) => {
            const rating = getOverallRating(review);
            const summary = getSummary(review);
            return (
              <Link
                key={review.id}
                to={`/review/${review.slug}`}
                className="group block rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50"
              >
                <div className="p-5 flex flex-col gap-3 h-full">
                  <h3 className="font-display font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {review.property_name}
                  </h3>
                  {review.location && (
                    <p className="text-xs text-muted-foreground">{review.location}</p>
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
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentReviewsHomepage;
