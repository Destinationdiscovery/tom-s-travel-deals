import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Hotel, Calendar, Eye } from "lucide-react";

interface Card {
  id: string;
  public_slug: string;
  trip_name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  trip_type: string | null;
  cover_image_url: string | null;
  author_display_name: string | null;
  published_at: string | null;
  view_count: number;
  hotel_count: number;
}

const PublicTripsGallery = () => {
  const [trips, setTrips] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async (dest?: string) => {
    setLoading(true);
    const { data } = await (supabase as any).rpc("list_public_trips", {
      _limit: 48, _offset: 0, _destination: dest || null,
    });
    setTrips((data ?? []) as Card[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => { void load(q.trim() || undefined); }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Explore trips shared by real travelers | ReviewThenGo"
        description="Browse real, published trip plans with hotels, itineraries, and honest first-hand reviews from travelers."
      />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">Explore real trips</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Actual itineraries, real hotels, honest stay reviews from travelers who lived them.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
          <Input placeholder="Filter by destination..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : trips.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No published trips yet. Be the first to share one!</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((t) => (
              <Link key={t.id} to={`/trips/${t.public_slug}`} className="group bg-card rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow border border-border">
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  {t.cover_image_url ? (
                    <img src={t.cover_image_url} alt={t.trip_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{t.trip_name}</h3>
                  {t.destination && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" /> {t.destination}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                    {t.hotel_count > 0 && <span className="flex items-center gap-1"><Hotel className="h-3 w-3" /> {t.hotel_count} hotel{t.hotel_count > 1 ? "s" : ""}</span>}
                    {t.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {t.start_date}</span>}
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {t.view_count}</span>
                  </div>
                  {t.author_display_name && (
                    <p className="text-xs text-muted-foreground mt-2">by {t.author_display_name}</p>
                  )}
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

export default PublicTripsGallery;
