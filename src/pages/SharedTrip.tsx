import { useEffect, useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Hotel, ListChecks, Backpack, ShoppingBag, Star, Printer } from "lucide-react";

interface SharedData {
  trip: any;
  hotels: any[];
  itinerary: any[];
  packing: any[];
  gear: any[];
  logistics: any;
}

const SharedTrip = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const { data: res, error } = await (supabase as any).rpc("get_shared_trip", { _token: token });
      if (error || !res) { setError("This trip link isn't valid."); setLoading(false); return; }
      setData(res as SharedData);
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-64 w-full rounded-2xl" />
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
          <p className="text-muted-foreground mt-2">This link may have been removed.</p>
          <Button asChild className="mt-4"><Link to="/">Back to ReviewThenGo</Link></Button>
        </main>
      </div>
    );
  }

  const { trip, hotels, itinerary, packing, gear } = data;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${trip.trip_name} | Shared Trip`} description={`A shared trip plan${trip.destination ? ` to ${trip.destination}` : ""}.`} noindex />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Shared trip · read only</span>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5"><Printer className="h-4 w-4" /> Print / PDF</Button>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{trip.trip_name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            {trip.destination && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {trip.destination}</span>}
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {trip.start_date}{trip.end_date ? ` to ${trip.end_date}` : ""}
              </span>
            )}
          </div>
        </div>

        {hotels?.length > 0 && (
          <Block title="Hotels" icon={Hotel}>
            <div className="grid gap-3 md:grid-cols-2">
              {hotels.map((h: any) => (
                <div key={h.id} className="bg-background border rounded-xl p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    {h.slug ? (
                      <Link to={`/review/${h.slug}`} className="font-medium truncate hover:text-primary block">{h.property_name}</Link>
                    ) : (
                      <p className="font-medium truncate">{h.property_name}</p>
                    )}
                    {h.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.location}</p>}
                  </div>
                  {h.overall_rating && (
                    <span className="text-sm font-medium ml-3">{h.overall_rating}<Star className="h-3 w-3 inline ml-0.5 text-accent fill-accent" /></span>
                  )}
                </div>
              ))}
            </div>
          </Block>
        )}

        {itinerary?.length > 0 && (
          <Block title="Itinerary" icon={ListChecks}>
            <div className="space-y-3">
              {itinerary.map((d: any) => (
                <div key={d.id} className="bg-background border rounded-xl p-3">
                  <p className="font-medium">Day {d.day_number} · {d.content?.title}</p>
                  {d.content?.notes && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{d.content.notes}</p>}
                </div>
              ))}
            </div>
          </Block>
        )}

        {packing?.length > 0 && (
          <Block title="Packing list" icon={Backpack}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {packing.map((p: any) => (
                <li key={p.id} className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                  <input type="checkbox" checked={p.checked} disabled className="h-4 w-4" />
                  <span className={p.checked ? "line-through text-muted-foreground" : ""}>{p.label}</span>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {gear?.length > 0 && (
          <Block title="Gear picks" icon={ShoppingBag}>
            <div className="grid gap-3 md:grid-cols-2">
              {gear.map((g: any) => (
                <div key={g.id} className="bg-background border rounded-xl p-3 flex items-center gap-3">
                  {g.product?.image_url && <img src={g.product.image_url} alt="" className="h-12 w-12 object-cover rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{g.product?.title ?? "Gear item"}</p>
                    {g.product?.price && <p className="text-xs text-muted-foreground">{g.product.price}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Block>
        )}

        <div className="text-center mt-10 print:hidden">
          <p className="text-sm text-muted-foreground mb-2">Plan your own trip on ReviewThenGo</p>
          <Button asChild><Link to="/">Start planning</Link></Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Block = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <section className="bg-card rounded-2xl p-5 md:p-6 shadow-soft mb-6">
    <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</h2>
    {children}
  </section>
);

export default SharedTrip;
