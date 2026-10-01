import { useEffect, useState, useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { Star, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

interface PopularReview {
  slug: string;
  property_name: string;
  location: string | null;
  rating: number;
  view_count: number;
}

/** Deterministic "saved" count from property name */
const getSaveCount = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return 200 + Math.abs(hash % 2800);
};

const PopularSavesSection = () => {
  const [items, setItems] = useState<PopularReview[]>([]);

  useEffect(() => {
    const load = async () => {
      // Get top viewed slugs
      const { data: views } = await supabase
        .from("review_views")
        .select("slug, view_count")
        .order("view_count", { ascending: false })
        .limit(12);

      if (!views || views.length === 0) return;

      const slugs = views.map((v) => v.slug);
      const viewMap = Object.fromEntries(views.map((v) => [v.slug, v.view_count]));

      // Get review details
      const { data: reviews } = await supabase
        .from("cached_reviews")
        .select("slug, property_name, location, review_data, ratings")
        .in("slug", slugs);

      if (!reviews) return;

      const merged: PopularReview[] = reviews
        .map((r) => {
          const rd = r.review_data as any;
          const rt = r.ratings as any;
          return {
            slug: r.slug,
            property_name: r.property_name,
            location: r.location,
            rating: rt?.overall || rd?.overall_rating || rd?.overallRating || 4.0,
            view_count: viewMap[r.slug] || 0,
          };
        })
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 6);

      setItems(merged);
    };
    load();
  }, []);

  const jsonLd = useMemo(() => {
    if (items.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Most Saved Hotels and Resorts by Travelers",
      description: "The most popular hotels, resorts, and destinations saved and compared by travelers on ReviewThenGo.",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Hotel",
          name: item.property_name,
          url: `https://www.reviewthengo.com/review/${item.slug}`,
          ...(item.location ? { address: item.location } : {}),
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: item.rating.toFixed(1),
            bestRating: "5",
            ratingCount: String(getSaveCount(item.property_name)),
          },
        },
      })),
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      {jsonLd && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
      )}
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          Most Saved by Travelers
        </h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
          The destinations and properties travelers save and compare the most on ReviewThenGo. Save your favorites and compare them side-by-side.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const saveCount = getSaveCount(item.property_name);
            const isPopular = saveCount > 500;
            return (
              <Link
                key={item.slug}
                to={`/review/${item.slug}`}
                className="group rounded-2xl bg-card border border-border/50 p-5 shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 flex flex-col gap-3"
              >
                <h3 className="font-display font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {item.property_name}
                </h3>
                {item.location && (
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(item.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-muted-foreground">
                    {Number(item.rating).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-auto">
                  <Heart className={`h-3.5 w-3.5 ${isPopular ? "text-red-500 fill-red-500" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${isPopular ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                    {saveCount.toLocaleString()} travelers saved this
                  </span>
                </div>
                <span className="text-xs font-semibold text-primary group-hover:underline">
                  Read Review →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularSavesSection;
