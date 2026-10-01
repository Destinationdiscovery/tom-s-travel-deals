import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RelatedReviewsProps {
  currentSlug: string;
  currentLocation?: string | null;
}

interface RelatedItem {
  slug: string;
  property_name: string;
  location: string | null;
  review_data: any;
}

const RelatedReviews = ({ currentSlug, currentLocation }: RelatedReviewsProps) => {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      let results: RelatedItem[] = [];

      // 1. Try same-location matches first
      if (currentLocation) {
        const firstWord = (currentLocation.split(",")[0] ?? currentLocation).trim();
        const { data } = await supabase
          .from("cached_reviews")
          .select("slug, property_name, location, review_data")
          .ilike("location", `%${firstWord}%`)
          .neq("slug", currentSlug)
          .limit(6);
        if (data) results = data as RelatedItem[];
      }

      // 2. Fallback: most recent
      if (results.length < 4) {
        const { data } = await supabase
          .from("cached_reviews")
          .select("slug, property_name, location, review_data")
          .neq("slug", currentSlug)
          .order("created_at", { ascending: false })
          .limit(6);
        if (data) {
          const existing = new Set(results.map((r) => r.slug));
          for (const r of data as RelatedItem[]) {
            if (!existing.has(r.slug)) {
              results.push(r);
              if (results.length >= 6) break;
            }
          }
        }
      }

      if (!cancelled) {
        setItems(results.slice(0, 6));
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [currentSlug, currentLocation]);

  if (loading || items.length === 0) return null;

  return (
    <section
      id="related"
      aria-labelledby="related-heading"
      className="container mx-auto px-4 py-12 max-w-6xl"
    >
      <h2
        id="related-heading"
        className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6"
      >
        More reviews like this
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const rating = item.review_data?.overallRating;
          const summary = item.review_data?.summary;
          return (
            <Link
              key={item.slug}
              to={`/review/${item.slug}`}
              className="block rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-elegant transition-all"
            >
              <h3 className="font-display font-bold text-foreground line-clamp-2">
                {item.property_name}
              </h3>
              {item.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </p>
              )}
              {typeof rating === "number" && rating > 0 && (
                <p className="flex items-center gap-1 text-sm text-foreground mt-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">/ 5</span>
                </p>
              )}
              {summary && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {summary}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedReviews;
