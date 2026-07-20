import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Calendar, Plus, Trash2, Hotel, Route, Loader2, ArrowDown, Clock, Star, ExternalLink,
} from "lucide-react";

export interface Leg {
  id: string;
  trip_id: string;
  leg_number: number;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface LegHotel {
  id: string; slug: string | null; property_name: string;
  location: string | null; overall_rating: number | null; leg_id: string | null;
}
interface Logistics {
  id: string; leg_id: string | null; trip_id: string;
  best_time: any | null; safety: any | null; visa: any | null; currency: any | null; flights: any | null;
}
interface Transit {
  id: string; from_leg_id: string; to_leg_id: string;
  distance_meters: number | null; duration_seconds: number | null; mode: string;
  from_address: string | null; to_address: string | null;
}

const km = (m: number | null) => (m ? `${(m / 1000).toFixed(0)} km` : "—");
const hrs = (s: number | null) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
};

interface Props {
  tripId: string;
  legs: Leg[];
  setLegs: (l: Leg[]) => void;
  hotels: LegHotel[];
  logistics: Logistics[];
  transit: Transit[];
  onChanged: () => void;
  reviewedHotelIds?: Set<string>;
  onReviewHotel?: (hotelId: string) => void;
}

const TripLegsSection = ({ tripId, legs, setLegs, hotels, logistics, transit, onChanged, reviewedHotelIds, onReviewHotel }: Props) => {

  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newDest, setNewDest] = useState("");
  const [calcLoading, setCalcLoading] = useState<string | null>(null);

  const addLeg = async () => {
    const name = newName.trim() || newDest.trim() || `Stop ${legs.length + 1}`;
    const { data, error } = await (supabase as any).from("trip_legs").insert({
      trip_id: tripId,
      leg_number: legs.length + 1,
      name,
      destination: newDest.trim() || null,
    }).select("*").single();
    if (error) {
      toast({ title: "Could not add stop", description: error.message, variant: "destructive" });
      return;
    }
    setLegs([...legs, data as Leg]);
    setNewName("");
    setNewDest("");
  };

  const updateLeg = async (leg: Leg, patch: Partial<Leg>) => {
    const next = { ...leg, ...patch };
    setLegs(legs.map((l) => l.id === leg.id ? next : l));
    await (supabase as any).from("trip_legs").update(patch).eq("id", leg.id);
  };

  const removeLeg = async (leg: Leg) => {
    if (!confirm(`Remove "${leg.name}" and everything saved to it?`)) return;
    await (supabase as any).from("trip_legs").delete().eq("id", leg.id);
    setLegs(legs.filter((l) => l.id !== leg.id));
    onChanged();
  };

  const calculateTransit = async (from: Leg, to: Leg) => {
    const fromAddr = from.destination || from.name;
    const toAddr = to.destination || to.name;
    if (!fromAddr || !toAddr) {
      toast({ title: "Add destinations first", description: "Both stops need a destination to calculate a route." });
      return;
    }
    setCalcLoading(`${from.id}-${to.id}`);
    try {
      const { data, error } = await (supabase as any).functions.invoke("trip-transit", {
        body: {
          from: fromAddr,
          to: toAddr,
          mode: "DRIVE",
          trip_id: tripId,
          from_leg_id: from.id,
          to_leg_id: to.id,
        },
      });
      if (error) throw error;
      toast({ title: `${km(data.distance_meters)} • ${hrs(data.duration_seconds)}` });
      onChanged();
    } catch (e: any) {
      toast({ title: "Could not calculate route", description: e?.message, variant: "destructive" });
    } finally {
      setCalcLoading(null);
    }
  };

  const hotelsFor = (legId: string) => hotels.filter((h) => h.leg_id === legId);
  const logisticsFor = (legId: string) => logistics.find((l) => l.leg_id === legId);
  const transitBetween = (a: string, b: string) =>
    transit.find((t) => t.from_leg_id === a && t.to_leg_id === b);

  return (
    <section className="bg-card rounded-2xl p-5 md:p-6 shadow-soft mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" /> Stops on this trip
        </h2>
        <span className="text-xs text-muted-foreground">{legs.length} stop{legs.length === 1 ? "" : "s"}</span>
      </div>

      {legs.length === 0 ? (
        <p className="text-sm text-muted-foreground italic mb-4">
          No stops yet. Add your first destination below.
        </p>
      ) : (
        <div className="space-y-3 mb-4">
          {legs.map((leg, i) => {
            const next = legs[i + 1];
            const tr = next ? transitBetween(leg.id, next.id) : null;
            const log = logisticsFor(leg.id);
            const lh = hotelsFor(leg.id);
            return (
              <div key={leg.id}>
                <div className="bg-background border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {i + 1}
                        </span>
                        <Input
                          value={leg.name}
                          onChange={(e) => setLegs(legs.map((l) => l.id === leg.id ? { ...l, name: e.target.value } : l))}
                          onBlur={(e) => updateLeg(leg, { name: e.target.value.trim() || leg.name })}
                          className="font-medium border-0 px-0 h-auto focus-visible:ring-0 bg-transparent"
                        />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2 mt-2">
                        <label className="text-xs text-muted-foreground flex flex-col gap-1">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Destination</span>
                          <Input
                            value={leg.destination ?? ""}
                            placeholder="City, region..."
                            onChange={(e) => setLegs(legs.map((l) => l.id === leg.id ? { ...l, destination: e.target.value } : l))}
                            onBlur={(e) => updateLeg(leg, { destination: e.target.value.trim() || null })}
                          />
                        </label>
                        <label className="text-xs text-muted-foreground flex flex-col gap-1">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Arrive</span>
                          <Input type="date" value={leg.start_date ?? ""}
                            onChange={(e) => updateLeg(leg, { start_date: e.target.value || null })} />
                        </label>
                        <label className="text-xs text-muted-foreground flex flex-col gap-1">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Depart</span>
                          <Input type="date" value={leg.end_date ?? ""}
                            onChange={(e) => updateLeg(leg, { end_date: e.target.value || null })} />
                        </label>
                      </div>
                    </div>
                    <button onClick={() => removeLeg(leg)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label="Remove stop">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Hotels for this leg */}
                  <div className="mt-3 border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <Hotel className="h-3 w-3" /> Hotels
                      </p>
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                        <Link to="/"><Plus className="h-3 w-3" /> Find hotel</Link>
                      </Button>
                    </div>
                    {lh.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">None yet. Use "Find hotel" above, then choose "Add to Trip" on a review and pick this stop.</p>
                    ) : (
                      <ul className="space-y-1">
                        {lh.map((h) => (
                          <li key={h.id} className="text-sm flex items-center justify-between gap-2 group">
                            {h.slug ? (
                              <Link to={`/review/${h.slug}`} className="truncate hover:text-primary">{h.property_name}</Link>
                            ) : (
                              <span className="truncate">{h.property_name}</span>
                            )}
                            <div className="flex items-center gap-2 shrink-0">
                              {h.overall_rating && (
                                <span className="text-xs">{h.overall_rating}<Star className="h-3 w-3 inline ml-0.5 text-accent fill-accent" /></span>
                              )}
                              <button
                                onClick={async () => {
                                  await (supabase as any).from("trip_hotels").delete().eq("id", h.id);
                                  onChanged();
                                }}
                                className="text-muted-foreground hover:text-destructive"
                                aria-label="Remove hotel"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Logistics summaries for this leg */}
                  {log && (log.best_time || log.safety || log.visa || log.currency) && (
                    <div className="mt-3 border-t pt-3 grid sm:grid-cols-2 gap-2">
                      {log.best_time && <MiniIntel label="Best time" value={log.best_time?.verdict || log.best_time?.destination} href="/best-time" />}
                      {log.safety && <MiniIntel label="Safety" value={log.safety?.verdict || log.safety?.overall} href="/safety" />}
                      {log.visa && <MiniIntel label="Visa & intel" value={log.visa?.verdict || log.visa?.destination} href="/travel-intel" />}
                      {log.currency && <MiniIntel label="Currency" value={log.currency?.verdict || log.currency?.currency} href="/currency" />}
                    </div>
                  )}
                </div>

                {/* Transit to next leg */}
                {next && (
                  <div className="flex justify-center my-2">
                    <div className="bg-muted/50 border border-dashed rounded-xl px-3 py-2 flex items-center gap-3 flex-wrap">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                      {tr ? (
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Route className="h-3.5 w-3.5" /> {km(tr.distance_meters)}
                          <Clock className="h-3.5 w-3.5 ml-1" /> {hrs(tr.duration_seconds)}
                          <span className="text-xs text-muted-foreground">by {tr.mode.toLowerCase()}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No route calculated</span>
                      )}
                      <Button
                        size="sm" variant="outline"
                        disabled={calcLoading === `${leg.id}-${next.id}`}
                        onClick={() => calculateTransit(leg, next)}
                        className="h-7 text-xs"
                      >
                        {calcLoading === `${leg.id}-${next.id}`
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : (tr ? "Recalculate" : "Calculate route")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add new leg */}
      <form
        onSubmit={(e) => { e.preventDefault(); void addLeg(); }}
        className="border-t pt-3 grid sm:grid-cols-[1fr_1fr_auto] gap-2"
      >
        <Input placeholder="Stop name (e.g. Rome week)" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Input placeholder="Destination" value={newDest} onChange={(e) => setNewDest(e.target.value)} />
        <Button type="submit" className="gap-1"><Plus className="h-4 w-4" /> Add stop</Button>
      </form>
    </section>
  );
};

const MiniIntel = ({ label, value, href }: { label: string; value?: string; href: string }) => (
  <div className="text-xs bg-muted/40 rounded-md px-2 py-1.5">
    <div className="uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-foreground font-medium line-clamp-2">{value || "Saved"}</div>
    <Link to={href} className="text-primary hover:underline inline-flex items-center gap-1 mt-0.5">
      View <ExternalLink className="h-3 w-3" />
    </Link>
  </div>
);

export default TripLegsSection;
