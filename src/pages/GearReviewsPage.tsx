import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Luggage, Star } from "lucide-react";

interface Review {
  id: string; slug: string; product_name: string; brand: string | null;
  category: string | null; hero_image_url: string | null; rating: number | null;
  notes: string | null;
}

const GearReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("featured_gear_reviews")
        .select("id, slug, product_name, brand, category, hero_image_url, rating, notes")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      setReviews((data as Review[]) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Travel gear reviews | ReviewThenGo"
        description="Honest, single-product travel gear reviews with pros, cons, ratings, and where I used them."
        url="/gear-reviews"
        jsonLd={[{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: reviews.map((r, i) => ({
            "@type": "ListItem", position: i + 1, name: r.product_name,
            url: `https://www.reviewthengo.com/gear-reviews/${r.slug}`,
          })),
        }]}
      />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-6xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Travel gear reviews</h1>
        <p className="text-muted-foreground mb-8">Honest reviews of the gear I actually use on the road.</p>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No gear reviews yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <Link key={r.id} to={`/gear-reviews/${r.slug}`}
                className="group bg-card rounded-2xl border border-border shadow-soft overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  {r.hero_image_url ? (
                    <img src={r.hero_image_url} alt={r.product_name} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Luggage className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {r.brand && <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{r.brand}</p>}
                  <h2 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{r.product_name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {r.rating != null && (
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
                        <Star className="h-4 w-4 fill-primary text-primary" /> {r.rating.toFixed(1)}
                      </span>
                    )}
                    {r.category && <span className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{r.category}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GearReviewsPage;
