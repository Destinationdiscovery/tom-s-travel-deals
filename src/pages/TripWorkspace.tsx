import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, MapPin, Calendar, Share2, Printer, Plus, Trash2,
  Hotel, ListChecks, Backpack, ShoppingBag, ShieldCheck, ExternalLink, Star,
} from "lucide-react";

import TripLegsSection, { type Leg } from "@/components/trips/TripLegsSection";
import TripPackingGenerator from "@/components/trips/TripPackingGenerator";

interface Trip {
  id: string;
  user_id: string;
  slug: string;
  trip_name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  trip_type: string | null;
  notes: string | null;
  share_token: string;
  is_multi_destination: boolean;
}

interface HotelRow {
  id: string; slug: string | null; property_name: string;
  location: string | null; overall_rating: number | null; top_pick: boolean; leg_id: string | null;
}
interface DayRow { id: string; day_number: number; content: any; }
interface PackingRow { id: string; label: string; checked: boolean; }
interface GearRow { id: string; product: any; purchased: boolean; }
interface LogisticsRow {
  id: string;
  leg_id: string | null;
  trip_id: string;
  best_time: any | null;
  safety: any | null;
  visa: any | null;
  currency: any | null;
  flights: any | null;
}
interface TransitRow {
  id: string; from_leg_id: string; to_leg_id: string;
  distance_meters: number | null; duration_seconds: number | null; mode: string;
  from_address: string | null; to_address: string | null;
}

const TripWorkspace = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [days, setDays] = useState<DayRow[]>([]);
  const [packing, setPacking] = useState<PackingRow[]>([]);
  const [gear, setGear] = useState<GearRow[]>([]);
  const [logisticsAll, setLogisticsAll] = useState<LogisticsRow[]>([]);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [transit, setTransit] = useState<TransitRow[]>([]);
  const [newPacking, setNewPacking] = useState("");
  const [newDayTitle, setNewDayTitle] = useState("");

  const logistics = logisticsAll.find((l) => l.leg_id === null) ?? null;

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  const load = async () => {
    if (!user || !slug) return;
    setLoading(true);
    const { data: t } = await (supabase as any)
      .from("trips").select("*").eq("user_id", user.id).eq("slug", slug).maybeSingle();
    if (!t) { setLoading(false); return; }
    setTrip(t as Trip);
    const [h, d, p, g, l, lg, tr] = await Promise.all([
      (supabase as any).from("trip_hotels").select("*").eq("trip_id", t.id).order("sort_order"),
      (supabase as any).from("trip_itinerary_days").select("*").eq("trip_id", t.id).order("day_number"),
      (supabase as any).from("trip_packing_items").select("*").eq("trip_id", t.id).order("sort_order"),
      (supabase as any).from("trip_gear_items").select("*").eq("trip_id", t.id).order("created_at"),
      (supabase as any).from("trip_logistics").select("*").eq("trip_id", t.id),
      (supabase as any).from("trip_legs").select("*").eq("trip_id", t.id).order("leg_number"),
      (supabase as any).from("trip_transit").select("*").eq("trip_id", t.id),
    ]);
    setHotels((h.data ?? []) as HotelRow[]);
    setDays((d.data ?? []) as DayRow[]);
    setPacking((p.data ?? []) as PackingRow[]);
    setGear((g.data ?? []) as GearRow[]);
    setLogisticsAll((l.data ?? []) as LogisticsRow[]);
    setLegs((lg.data ?? []) as Leg[]);
    setTransit((tr.data ?? []) as TransitRow[]);
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [user, slug]);

  const updateTrip = async (patch: Partial<Trip>) => {
    if (!trip) return;
    setTrip({ ...trip, ...patch });
    await (supabase as any).from("trips").update(patch).eq("id", trip.id);
  };

  const removeHotel = async (id: string) => {
    await (supabase as any).from("trip_hotels").delete().eq("id", id);
    setHotels(hotels.filter((h) => h.id !== id));
  };

  const togglePacking = async (item: PackingRow) => {
    const next = !item.checked;
    setPacking(packing.map((p) => p.id === item.id ? { ...p, checked: next } : p));
    await (supabase as any).from("trip_packing_items").update({ checked: next }).eq("id", item.id);
  };
  const addPacking = async () => {
    if (!trip || !newPacking.trim()) return;
    const { data } = await (supabase as any)
      .from("trip_packing_items")
      .insert({ trip_id: trip.id, label: newPacking.trim(), sort_order: packing.length })
      .select("*").single();
    if (data) setPacking([...packing, data as PackingRow]);
    setNewPacking("");
  };
  const removePacking = async (id: string) => {
    await (supabase as any).from("trip_packing_items").delete().eq("id", id);
    setPacking(packing.filter((p) => p.id !== id));
  };

  const addDay = async () => {
    if (!trip) return;
    const dn = days.length + 1;
    const { data } = await (supabase as any)
      .from("trip_itinerary_days")
      .insert({ trip_id: trip.id, day_number: dn, content: { title: newDayTitle.trim() || `Day ${dn}`, notes: "" } })
      .select("*").single();
    if (data) setDays([...days, data as DayRow]);
    setNewDayTitle("");
  };
  const updateDay = async (id: string, content: any) => {
    setDays(days.map((d) => d.id === id ? { ...d, content } : d));
    await (supabase as any).from("trip_itinerary_days").update({ content }).eq("id", id);
  };
  const removeDay = async (id: string) => {
    await (supabase as any).from("trip_itinerary_days").delete().eq("id", id);
    setDays(days.filter((d) => d.id !== id));
  };

  const shareLink = trip ? `${window.location.origin}/trip/${trip.share_token}` : "";
  const handleShare = async () => {
    if (!shareLink) return;
    try {
      if (navigator.share) await navigator.share({ title: trip!.trip_name, url: shareLink });
      else { await navigator.clipboard.writeText(shareLink); toast({ title: "Link copied", description: shareLink }); }
    } catch {}
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 max-w-5xl">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4 text-center">
          <h1 className="font-display text-2xl font-bold">Trip not found</h1>
          <Button asChild className="mt-4"><Link to="/my-trips">Back to My Trips</Link></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={trip.trip_name} description={`Trip plan for ${trip.destination ?? trip.trip_name}`} noindex />
      <Header />
      <main className="pt-24 pb-32 md:pb-16 container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <Link to="/my-trips" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground min-h-[44px]">
            <ArrowLeft className="h-4 w-4" /> All trips
          </Link>
          <div className="hidden md:flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5"><Share2 className="h-4 w-4" /> Share</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5"><Printer className="h-4 w-4" /> Print / PDF</Button>
          </div>
        </div>

        {/* Header card */}
        <div className="bg-card rounded-2xl p-6 shadow-soft mb-8">
          <Input
            value={trip.trip_name}
            onChange={(e) => setTrip({ ...trip, trip_name: e.target.value })}
            onBlur={(e) => updateTrip({ trip_name: e.target.value.trim() || trip.trip_name })}
            className="font-display text-2xl md:text-3xl font-bold border-0 px-0 h-auto focus-visible:ring-0 bg-transparent"
          />
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <label className="text-xs uppercase tracking-wide text-muted-foreground flex flex-col gap-1">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Destination</span>
              <Input value={trip.destination ?? ""} placeholder="Add a destination"
                onChange={(e) => setTrip({ ...trip, destination: e.target.value })}
                onBlur={(e) => updateTrip({ destination: e.target.value.trim() || null })} />
            </label>
            <label className="text-xs uppercase tracking-wide text-muted-foreground flex flex-col gap-1">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Start</span>
              <Input type="date" value={trip.start_date ?? ""}
                onChange={(e) => updateTrip({ start_date: e.target.value || null })} />
            </label>
            <label className="text-xs uppercase tracking-wide text-muted-foreground flex flex-col gap-1">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> End</span>
              <Input type="date" value={trip.end_date ?? ""}
                onChange={(e) => updateTrip({ end_date: e.target.value || null })} />
            </label>
          </div>
          <Textarea
            value={trip.notes ?? ""}
            placeholder="Private notes about this trip..."
            onChange={(e) => setTrip({ ...trip, notes: e.target.value })}
            onBlur={(e) => updateTrip({ notes: e.target.value })}
            className="mt-4 min-h-[80px]"
          />
        </div>

        {/* Hotels */}
        <Section title="Hotels" icon={Hotel} cta={<Button asChild variant="outline" size="sm"><Link to="/">Find more</Link></Button>}>
          {hotels.length === 0 ? (
            <Empty msg="No hotels saved yet. Use the Add to Trip button on any review." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {hotels.map((h) => (
                <div key={h.id} className="bg-background border rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    {h.slug ? (
                      <Link to={`/review/${h.slug}`} className="font-medium text-foreground truncate hover:text-primary block">
                        {h.property_name}
                      </Link>
                    ) : (
                      <p className="font-medium text-foreground truncate">{h.property_name}</p>
                    )}
                    {h.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.location}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {h.overall_rating && (
                      <span className="text-sm font-medium">{h.overall_rating}<Star className="h-3 w-3 inline ml-0.5 text-accent fill-accent" /></span>
                    )}
                    <button onClick={() => removeHotel(h.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Itinerary */}
        <Section title="Itinerary" icon={ListChecks}>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Day title (e.g. Arrival in Lisbon)" value={newDayTitle} onChange={(e) => setNewDayTitle(e.target.value)} />
            <Button onClick={addDay} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add day</Button>
          </div>
          {days.length === 0 ? <Empty msg="No days yet." /> : (
            <div className="space-y-3">
              {days.map((d) => (
                <div key={d.id} className="bg-background border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <Input
                      value={d.content?.title ?? `Day ${d.day_number}`}
                      onChange={(e) => updateDay(d.id, { ...(d.content ?? {}), title: e.target.value })}
                      className="font-medium border-0 px-0 h-auto focus-visible:ring-0 bg-transparent"
                    />
                    <button onClick={() => removeDay(d.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Textarea
                    value={d.content?.notes ?? ""}
                    placeholder="Plans, restaurants, notes..."
                    onChange={(e) => updateDay(d.id, { ...(d.content ?? {}), notes: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Packing */}
        <Section title="Packing list" icon={Backpack}>
          <TripPackingGenerator tripId={trip.id} destination={trip.destination} onDone={load} />
          <form onSubmit={(e) => { e.preventDefault(); void addPacking(); }} className="flex gap-2 mb-3">
            <Input placeholder="Add item..." value={newPacking} onChange={(e) => setNewPacking(e.target.value)} />
            <Button type="submit" size="sm" className="gap-1" disabled={!newPacking.trim()}><Plus className="h-4 w-4" /> Add</Button>
          </form>
          {packing.length === 0 ? <Empty msg="Nothing on your list yet." /> : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {packing.map((p) => (
                <li key={p.id} className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                  <input type="checkbox" checked={p.checked} onChange={() => togglePacking(p)} className="h-4 w-4" />
                  <span className={`flex-1 ${p.checked ? "line-through text-muted-foreground" : ""}`}>{p.label}</span>
                  <button onClick={() => removePacking(p.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Gear */}
        <Section title="Gear picks" icon={ShoppingBag} cta={<Button asChild variant="outline" size="sm"><Link to="/gear">Browse gear</Link></Button>}>
          {gear.length === 0 ? <Empty msg="No gear saved yet." /> : (
            <div className="grid gap-3 md:grid-cols-2">
              {gear.map((g) => (
                <a key={g.id} href={g.product?.affiliate_url || "#"} target="_blank" rel="noopener noreferrer"
                  className="bg-background border rounded-xl p-3 hover:shadow-soft transition-shadow flex items-center gap-3">
                  {g.product?.image_url && <img src={g.product.image_url} alt="" className="h-12 w-12 object-cover rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{g.product?.title ?? "Gear item"}</p>
                    {g.product?.price && <p className="text-xs text-muted-foreground">{g.product.price}</p>}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}
        </Section>

        {/* Multi-destination legs */}
        {trip.is_multi_destination && (
          <TripLegsSection
            tripId={trip.id}
            legs={legs}
            setLegs={setLegs}
            hotels={hotels}
            logistics={logisticsAll}
            transit={transit}
            onChanged={() => void load()}
          />
        )}

        {/* Logistics (trip-wide) */}
        <Section title={trip.is_multi_destination ? "Trip-wide logistics" : "Logistics"} icon={ShieldCheck}>
          {logistics && (logistics.best_time || logistics.safety || logistics.visa || logistics.currency || logistics.flights) ? (
            <div className="grid gap-3 md:grid-cols-2 mb-4">
              {logistics.best_time && (
                <LogisticsCard
                  title="Best time to visit"
                  summary={logistics.best_time.verdict || logistics.best_time.destination}
                  detail={Array.isArray(logistics.best_time.bestMonths) ? `Ideal: ${logistics.best_time.bestMonths.join(", ")}` : undefined}
                  href="/best-time"
                  onClear={async () => {
                    await (supabase as any).from("trip_logistics").update({ best_time: null, best_time_confirmed: false }).eq("id", logistics.id);
                    setLogisticsAll(logisticsAll.map((r) => r.id === logistics.id ? { ...r, best_time: null } : r));
                  }}
                />
              )}
              {logistics.safety && (
                <LogisticsCard
                  title="Safety"
                  summary={logistics.safety.verdict || logistics.safety.overall || logistics.safety.destination}
                  detail={logistics.safety.overallScore ? `Overall score: ${logistics.safety.overallScore}/5` : undefined}
                  href="/safety"
                  onClear={async () => {
                    await (supabase as any).from("trip_logistics").update({ safety: null, safety_checked: false }).eq("id", logistics.id);
                    setLogisticsAll(logisticsAll.map((r) => r.id === logistics.id ? { ...r, safety: null } : r));
                  }}
                />
              )}
              {logistics.visa && (
                <LogisticsCard
                  title="Travel intel & visa"
                  summary={logistics.visa.verdict || logistics.visa.visa || logistics.visa.destination}
                  href="/travel-intel"
                  onClear={async () => {
                    await (supabase as any).from("trip_logistics").update({ visa: null, visa_checked: false }).eq("id", logistics.id);
                    setLogisticsAll(logisticsAll.map((r) => r.id === logistics.id ? { ...r, visa: null } : r));
                  }}
                />
              )}
              {logistics.currency && (
                <LogisticsCard
                  title="Currency"
                  summary={logistics.currency.verdict || logistics.currency.currency || logistics.currency.destination}
                  detail={logistics.currency.rate ? `Rate: ${logistics.currency.rate}` : undefined}
                  href="/currency"
                  onClear={async () => {
                    await (supabase as any).from("trip_logistics").update({ currency: null, currency_checked: false }).eq("id", logistics.id);
                    setLogisticsAll(logisticsAll.map((r) => r.id === logistics.id ? { ...r, currency: null } : r));
                  }}
                />
              )}
              {logistics.flights && (
                <LogisticsCard
                  title="Flights"
                  summary={logistics.flights.verdict || logistics.flights.route || "Flight notes saved"}
                  href="/flights"
                  onClear={async () => {
                    await (supabase as any).from("trip_logistics").update({ flights: null }).eq("id", logistics.id);
                    setLogisticsAll(logisticsAll.map((r) => r.id === logistics.id ? { ...r, flights: null } : r));
                  }}
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {trip.is_multi_destination
                ? "Save travel intel for the whole trip here, or per-stop from the tools using the stop picker."
                : "Check visa requirements, currency, best time to visit, and safety from the tools menu and save outputs to this trip."}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button asChild variant="outline" size="sm"><Link to="/safety">Safety</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/currency">Currency</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/best-time">Best time</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/travel-intel">Travel intel</Link></Button>
          </div>
        </Section>
      </main>
      {/* Mobile sticky action bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border px-4 py-3 flex gap-2 print:hidden" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <Button variant="outline" onClick={handleShare} className="flex-1 gap-1.5 h-12"><Share2 className="h-4 w-4" /> Share</Button>
        <Button variant="outline" onClick={() => window.print()} className="flex-1 gap-1.5 h-12"><Printer className="h-4 w-4" /> PDF</Button>
      </div>
      <Footer />
    </div>
  );
};

const Section = ({ title, icon: Icon, children, cta }: { title: string; icon: any; children: React.ReactNode; cta?: React.ReactNode }) => (
  <section className="bg-card rounded-2xl p-5 md:p-6 shadow-soft mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</h2>
      {cta}
    </div>
    {children}
  </section>
);

const Empty = ({ msg }: { msg: string }) => (
  <p className="text-sm text-muted-foreground italic">{msg}</p>
);

const LogisticsCard = ({
  title, summary, detail, href, onClear,
}: { title: string; summary?: string; detail?: string; href: string; onClear: () => void | Promise<void> }) => (
  <div className="bg-background border rounded-xl p-3">
    <div className="flex items-start justify-between gap-2 mb-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <button onClick={() => void onClear()} className="text-muted-foreground hover:text-destructive shrink-0" aria-label={`Remove ${title}`}>
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
    {summary && <p className="text-sm text-foreground font-medium">{summary}</p>}
    {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
    <Link to={href} className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2">
      View full details <ExternalLink className="h-3 w-3" />
    </Link>
  </div>
);

export default TripWorkspace;
