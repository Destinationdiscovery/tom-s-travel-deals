import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import { Star, MapPin, ArrowRight } from "lucide-react";
import type { CachedReview } from "@/hooks/useGenerateReview";

const RecentlyReviewedSection = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["recently-reviewed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cached_reviews")
        .select("id, property_name, slug, location, property_type, review_data, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return (data ?? []) as unknown as CachedReview[];
    },
  });

  if (isLoading || !reviews || reviews.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Recently Reviewed
            </h2>
            <p className="text-muted-foreground mt-1">
              The latest AI-curated reviews from real traveler feedback
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((review) => {
            const rating = (review.review_data as any)?.overallRating ?? 0;
            return (
              <Link
                key={review.id}
                to={`/review/${review.slug}`}
                className="group bg-card rounded-xl border border-border p-5 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(rating)
                          ? "text-accent fill-accent"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="text-sm font-semibold text-foreground ml-1">
                    {rating}
                  </span>
                </div>

                <h3 className="font-display font-bold text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {review.property_name}
                </h3>

                {review.location && (
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mb-3">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">{review.location}</span>
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-border">
                  <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Review <ArrowRight className="h-3.5 w-3.5" />
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

export default RecentlyReviewedSection;
