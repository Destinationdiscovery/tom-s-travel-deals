import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Package } from "lucide-react";

interface List {
  id: string; slug: string; title: string; description: string | null;
  cover_image_url: string | null; season: string | null; trip_types: string[] | null;
}

const FeaturedPackingListsPage = () => {
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("featured_packing_lists")
        .select("id, slug, title, description, cover_image_url, season, trip_types")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      setLists((data as List[]) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Featured travel packing lists | ReviewThenGo"
        description="Curated packing lists for every kind of trip: beach, city, hiking, winter, and more. Every item links to Amazon."
        url="/packing-lists"
        jsonLd={[{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: lists.map((l, i) => ({
            "@type": "ListItem", position: i + 1, name: l.title,
            url: `https://www.reviewthengo.com/packing-lists/${l.slug}`,
          })),
        }]}
      />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-6xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Featured packing lists</h1>
        <p className="text-muted-foreground mb-8">Trip-tested packing lists you can copy into your own trip in one click.</p>
        {lists.length === 0 ? (
          <p className="text-muted-foreground">No packing lists published yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((l) => (
              <Link key={l.id} to={`/packing-lists/${l.slug}`}
                className="group bg-card rounded-2xl border border-border shadow-soft overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  {l.cover_image_url ? (
                    <img src={l.cover_image_url} alt={l.title} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Package className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{l.title}</h2>
                  {l.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{l.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {l.season && <span className="text-[10px] uppercase font-bold tracking-wider bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{l.season}</span>}
                    {l.trip_types?.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
                    ))}
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

export default FeaturedPackingListsPage;
