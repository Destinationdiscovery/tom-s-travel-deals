import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FolderOpen, MapPin, Calendar, Pencil, Trash2, ArrowRight, Hotel, ListChecks, Backpack } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { readPendingSave, clearPendingSave, applyPayloadToTrip } from "@/lib/pendingToolSave";

interface TripRow {
  id: string;
  slug: string;
  trip_name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  trip_type: string | null;
  updated_at: string;
}

interface TripCounts {
  hotels: number;
  days: number;
  packing: number;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || `trip-${Date.now()}`;

const MyTrips = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trips, setTrips] = useState<TripRow[]>([]);
  const [counts, setCounts] = useState<Record<string, TripCounts>>({});
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDest, setNewDest] = useState("");
  const [renameTrip, setRenameTrip] = useState<TripRow | null>(null);
  const [renameTo, setRenameTo] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("trips")
      .select("id, slug, trip_name, destination, start_date, end_date, status, trip_type, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    const rows = (data ?? []) as TripRow[];
    setTrips(rows);
    // counts in parallel
    const ids = rows.map((r) => r.id);
    if (ids.length) {
      const [h, d, p] = await Promise.all([
        (supabase as any).from("trip_hotels").select("trip_id").in("trip_id", ids),
        (supabase as any).from("trip_itinerary_days").select("trip_id").in("trip_id", ids),
        (supabase as any).from("trip_packing_items").select("trip_id").in("trip_id", ids),
      ]);
      const acc: Record<string, TripCounts> = {};
      ids.forEach((id) => (acc[id] = { hotels: 0, days: 0, packing: 0 }));
      (h.data ?? []).forEach((r: any) => acc[r.trip_id] && acc[r.trip_id].hotels++);
      (d.data ?? []).forEach((r: any) => acc[r.trip_id] && acc[r.trip_id].days++);
      (p.data ?? []).forEach((r: any) => acc[r.trip_id] && acc[r.trip_id].packing++);
      setCounts(acc);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Flush any pending tool save that was stashed before sign-in
  useEffect(() => {
    if (!user) return;
    const pending = readPendingSave();
    if (!pending) return;
    (async () => {
      try {
        const { data: existing } = await (supabase as any)
          .from("trips")
          .select("id, slug, trip_name")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        let trip = existing as { id: string; slug: string; trip_name: string } | null;
        if (!trip) {
          const name = pending.destination ? `${pending.destination} trip` : "My trip";
          const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 6);
          const { data: created } = await (supabase as any)
            .from("trips")
            .insert({ user_id: user.id, trip_name: name, slug, destination: pending.destination ?? null })
            .select("id, slug, trip_name")
            .single();
          trip = created;
        }
        if (!trip) return;
        await applyPayloadToTrip(trip.id, pending.toolType, pending.payload);
        clearPendingSave();
        toast({ title: `Added to "${trip.trip_name}"`, description: pending.label });
        void load();
      } catch (e: any) {
        toast({ title: "Could not finish saving", description: e?.message, variant: "destructive" });
        clearPendingSave();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || !user) return;
    const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error } = await (supabase as any)
      .from("trips")
      .insert({ user_id: user.id, trip_name: name, slug, destination: newDest.trim() || null })
      .select("slug")
      .single();
    if (error) {
      toast({ title: "Could not create trip", description: error.message, variant: "destructive" });
      return;
    }
    setNewOpen(false);
    setNewName("");
    setNewDest("");
    toast({ title: `Trip "${name}" created` });
    navigate(`/my-trips/${data.slug}`);
  };

  const handleRename = async () => {
    if (!renameTrip || !renameTo.trim()) return;
    await (supabase as any)
      .from("trips")
      .update({ trip_name: renameTo.trim() })
      .eq("id", renameTrip.id);
    setRenameTrip(null);
    setRenameTo("");
    void load();
    toast({ title: "Trip renamed" });
  };

  const handleDelete = async (trip: TripRow) => {
    if (!confirm(`Delete "${trip.trip_name}"? This cannot be undone.`)) return;
    await (supabase as any).from("trips").delete().eq("id", trip.id);
    void load();
    toast({ title: "Trip deleted" });
  };

  const upcoming = trips.filter((t) => t.start_date && new Date(t.start_date) >= new Date()).length;
  const planning = trips.filter((t) => t.status === "planning").length;
  const totalHotels = Object.values(counts).reduce((s, c) => s + c.hotels, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="My Trips" description="Plan, organise, and share your trips." noindex />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">Your trips, all in one place.</p>
          </div>
          <Button onClick={() => setNewOpen(true)} size="lg" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Trip
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Trips", value: trips.length, icon: FolderOpen },
            { label: "Upcoming", value: upcoming, icon: Calendar },
            { label: "In Planning", value: planning, icon: ListChecks },
            { label: "Hotels Saved", value: totalHotels, icon: Hotel },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-4 shadow-soft">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide mb-1">
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">No trips yet</h2>
            <p className="text-muted-foreground mb-4">Start your first trip and build it up as you research.</p>
            <Button onClick={() => setNewOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Create your first trip
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trips.map((t) => {
              const c = counts[t.id] ?? { hotels: 0, days: 0, packing: 0 };
              return (
                <div key={t.id} className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <Link to={`/my-trips/${t.slug}`} className="flex-1 min-w-0 group">
                      <h2 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {t.trip_name}
                      </h2>
                      {t.destination && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {t.destination}
                        </p>
                      )}
                    </Link>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { setRenameTrip(t); setRenameTo(t.trip_name); }}
                        className="text-muted-foreground hover:text-foreground p-1"
                        aria-label="Rename"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                    <span className="flex items-center gap-1"><Hotel className="h-3 w-3" /> {c.hotels} hotels</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {c.days} days</span>
                    <span className="flex items-center gap-1"><Backpack className="h-3 w-3" /> {c.packing} items</span>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/my-trips/${t.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Open trip <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New Trip Dialog */}
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Create a Trip</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); void handleCreate(); }} className="flex flex-col gap-3 pt-2">
              <Input placeholder="Trip name (e.g. Mexico 2026)" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} autoFocus />
              <Input placeholder="Destination (optional)" value={newDest} onChange={(e) => setNewDest(e.target.value)} maxLength={80} />
              <Button type="submit" disabled={!newName.trim()}>Create Trip</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog open={!!renameTrip} onOpenChange={(o) => !o && setRenameTrip(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle className="font-display">Rename Trip</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); void handleRename(); }} className="flex flex-col gap-3 pt-2">
              <Input value={renameTo} onChange={(e) => setRenameTo(e.target.value)} maxLength={60} autoFocus />
              <Button type="submit" disabled={!renameTo.trim()}>Rename</Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default MyTrips;
