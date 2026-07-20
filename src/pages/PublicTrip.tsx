import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import HotelReviewCard from "@/components/trips/HotelReviewCard";
import { MapPin, Calendar, Hotel, ListChecks, Backpack, Star, Eye, Route, ExternalLink, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublicData {
  trip: any;
  hotels: any[];
  itinerary: any[];
  legs: any[];
  transit: any[];
  packing: any[];
  gear: any[];
  logistics: any;
}

const PublicTrip = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: res, error } = await (supabase as any).rpc("get_public_trip", { _slug: slug });
      if (error || !res) { setError("This trip isn't available."); setLoading(false); return; }
      setData(res as PublicData);
      setLoading(false);
      // Fire-and-forget view increment.
      void (supabase as any).rpc("increment_trip_view", { _slug: slug });
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (error || !data?.trip) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-bold">Trip not found</h1>
          <p className="text-muted-foreground mt-2">This trip may be private or has been removed.</p>
          <Button asChild className="mt-4"><Link to="/trips">Explore other trips</Link></Button>
        </main>
      </div>
    );
  }

  const { trip, hotels, itinerary, legs, transit, packing } = data;
  const legHotels = (legId: string) => hotels.filter((h) => h.leg_id === legId);
  const legPacking = (legId: string) => packing.filter((p: any) => p.leg_id === legId);
  const globalHotels = hotels.filter((h) => !h.leg_id);
  const globalPacking = packing.filter((p: any) => !p.leg_id);

  const dateStr = trip.start_date
    ? `${trip.start_date}${trip.end_date ? ` to ${trip.end_date}` : ""}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${trip.trip_name}${trip.destination ? ` in ${trip.destination}` : ""} | ReviewThenGo`}
        description={`A traveler-shared trip plan${trip.destination ? ` to ${trip.destination}` : ""}, with hotels, itinerary, and honest stay reviews.`}
      />
      <Header />

      {/* Hero */}
      <div className="pt-24">
        {trip.cover_image_url && (
          <div className="w-full h-64 md:h-96 overflow-hidden bg-muted">
            <img src={trip.cover_image_url} alt={trip.trip_name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <main className="container mx-auto px-4 max-w-4xl pb-16 -mt-8">
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">Shared trip</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {trip.view_count ?? 0} views</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">{trip.trip_name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            {trip.destination && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.destination}</span>}
            {dateStr && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {dateStr}</span>}
            {trip.author_display_name && <span>by {trip.author_display_name}</span>}
          </div>
        </div>

        {/* Global hotels (single-destination trips) */}
        {globalHotels.length > 0 && (
          <Block title="Hotels" icon={Hotel}>
            <div className="space-y-4">
              {globalHotels.map((h: any) => (
                <HotelRow key={h.id} hotel={h} authorName={trip.author_display_name} />
              ))}
            </div>
          </Block>
        )}

        {/* Multi-destination legs */}
        {legs.length > 0 && (
          <Block title="Trip stops" icon={Route}>
            <div className="space-y-6">
              {legs.map((leg: any, idx: number) => {
                const nextLeg = legs[idx + 1];
                const trans = nextLeg && transit.find((t: any) => t.from_leg_id === leg.id && t.to_leg_id === nextLeg.id);
                return (
                  <div key={leg.id}>
                    <div className="bg-background border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <h3 className="font-display text-lg font-bold">{leg.leg_number}. {leg.name}</h3>
                        {(leg.start_date || leg.end_date) && (
                          <span className="text-xs text-muted-foreground">{leg.start_date}{leg.end_date ? ` to ${leg.end_date}` : ""}</span>
                        )}
                      </div>
                      {leg.destination && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="h-3.5 w-3.5" /> {leg.destination}</p>
                      )}
                      {leg.notes && <p className="text-sm mb-3 whitespace-pre-wrap">{leg.notes}</p>}
                      {legHotels(leg.id).length > 0 && (
                        <div className="mt-3 space-y-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Hotels</p>
                          {legHotels(leg.id).map((h: any) => (
                            <HotelRow key={h.id} hotel={h} authorName={trip.author_display_name} />
                          ))}
                        </div>
                      )}
                      {legPacking(leg.id).length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">Packing for this stop</p>
                          <p className="text-sm">{legPacking(leg.id).map((p: any) => p.label).join(" · ")}</p>
                        </div>
                      )}
                    </div>
                    {trans && (
                      <div className="text-center text-xs text-muted-foreground py-3 flex items-center justify-center gap-2">
                        <Route className="h-3.5 w-3.5" />
                        {trans.mode === "DRIVE" ? "Drive" : trans.mode === "WALK" ? "Walk" : "Transit"}
                        {trans.distance_meters && <span>· {Math.round(trans.distance_meters / 1000)} km</span>}
                        {trans.duration_seconds && <span>· {Math.round(trans.duration_seconds / 60)} min</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Block>
        )}

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <Block title="Day-by-day itinerary" icon={ListChecks}>
            <div className="space-y-3">
              {itinerary.map((d: any) => (
                <div key={d.id} className="bg-background border rounded-xl p-4">
                  <p className="font-medium">Day {d.day_number} · {d.content?.title}</p>
                  {d.content?.notes && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{d.content.notes}</p>}
                </div>
              ))}
            </div>
          </Block>
        )}

        {/* Global packing */}
        {globalPacking.length > 0 && (
          <Block title="Packing list" icon={Backpack}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {globalPacking.map((p: any) => (
                <li key={p.id} className="flex items-start gap-2 bg-background border rounded-lg px-3 py-2">
                  <span className={`inline-block h-4 w-4 rounded border mt-0.5 ${p.checked ? "bg-primary border-primary" : "border-muted-foreground/40"}`} />
                  <div>
                    <p className="text-sm">{p.label}</p>
                    {p.notes && <p className="text-xs text-muted-foreground mt-0.5">{p.notes}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* Soft CTA */}
        <div className="mt-10 text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h3 className="font-display text-2xl font-bold mb-2">Planning your own trip?</h3>
          <p className="text-muted-foreground mb-4">Build a plan like this, save real hotel reviews, and get inspired by other travelers.</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button asChild><Link to="/">Start planning</Link></Button>
            <Button asChild variant="outline"><Link to="/trips">Explore more trips</Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Block = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <section className="bg-card rounded-2xl p-5 md:p-6 shadow-soft mt-6">
    <h2 className="font-display text-xl md:text-2xl font-bold mb-4 flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</h2>
    {children}
  </section>
);

const HotelRow = ({ hotel, authorName }: { hotel: any; authorName?: string | null }) => (
  <div className="bg-background border rounded-xl p-4">
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        {hotel.slug ? (
          <Link to={`/review/${hotel.slug}`} className="font-medium text-foreground hover:text-primary inline-flex items-center gap-1">
            {hotel.property_name}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
        ) : (
          <p className="font-medium text-foreground">{hotel.property_name}</p>
        )}
        {hotel.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {hotel.location}</p>}
      </div>
      {hotel.overall_rating && (
        <span className="text-sm font-medium inline-flex items-center gap-0.5">
          {hotel.overall_rating}<Star className="h-3.5 w-3.5 text-accent fill-accent ml-0.5" />
          <span className="text-xs text-muted-foreground ml-1">aggregated</span>
        </span>
      )}
    </div>
    {hotel.personal_review && (
      <HotelReviewCard review={hotel.personal_review} authorName={authorName} />
    )}
  </div>
);

export default PublicTrip;
