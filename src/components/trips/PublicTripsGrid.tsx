import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Hotel, Calendar, Eye, ArrowRight, Share2 } from "lucide-react";

interface TripCard {
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
  share_count: number;
  hotel_count: number;
}

interface PublicTripsGridProps {
  showHeader?: boolean;
  showViewAll?: boolean;
  limit?: number;
  enableSearch?: boolean;
}

const PublicTripsGrid = ({
  showHeader = true,
  showViewAll = true,
  limit = 6,
  enableSearch = false,
}: PublicTripsGridProps) => {
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async (dest?: string) => {
    setLoading(true);
    const { data } = await (supabase as any).rpc("list_public_trips", {
      _limit: limit,
      _offset: 0,
      _destination: dest || null,
    });
    setTrips((data ?? []) as TripCard[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load(q.trim() || undefined);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4 max-w-6xl">
        {showHeader && (
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-3">
              Explore real trips
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Actual itineraries, real hotels, honest stay reviews from travelers who lived them.
            </p>
          </div>
        )}

        {enableSearch && (
          <div className="max-w-md mx-auto mb-8">
            <Input
              placeholder="Filter by destination..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(limit)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No published trips yet. Be the first to share one!
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((t) => (
              <Link
                key={t.id}
                to={`/trips/${t.public_slug}`}
                className="group bg-card rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow border border-border"
              >
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  {t.cover_image_url ? (
                    <img
                      src={t.cover_image_url}
                      alt={t.trip_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {t.trip_name}
                  </h3>
                  {t.destination && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" /> {t.destination}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                    {t.hotel_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Hotel className="h-3 w-3" /> {t.hotel_count} hotel
                        {t.hotel_count > 1 ? "s" : ""}
                      </span>
                    )}
                    {t.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {t.start_date}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {t.view_count}
                    </span>
                  </div>
                  {t.author_display_name && (
                    <p className="text-xs text-muted-foreground mt-2">
                      by {t.author_display_name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {showViewAll && (
          <div className="mt-8 text-center">
            <Link
              to="/trips"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all trips <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicTripsGrid;
