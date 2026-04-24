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
import { Star, MapPin, Plus, FolderOpen, Pencil, Trash2, ExternalLink } from "lucide-react";
import { buildDeepLinks, detectCountry } from "@/components/AffiliateLinks";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface SavedReview {
  id: string;
  slug: string;
  property_name: string;
  location: string | null;
  overall_rating: number;
  trip_name: string | null;
}

interface TripGroup {
  name: string;
  reviews: SavedReview[];
  avgRating: number;
}

const MyTrips = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<SavedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTripOpen, setNewTripOpen] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [renameTrip, setRenameTrip] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  const fetchReviews = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_saved_reviews")
      .select("id, slug, property_name, location, overall_rating, trip_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setReviews((data as SavedReview[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [user]);

  const trips: TripGroup[] = (() => {
    const groups: Record<string, SavedReview[]> = {};
    reviews.forEach((r) => {
      const key = r.trip_name ?? "__unsorted__";
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return Object.entries(groups)
      .filter(([key]) => key !== "__unsorted__")
      .map(([name, items]) => ({
        name,
        reviews: items,
        avgRating: Math.round((items.reduce((s, r) => s + r.overall_rating, 0) / items.length) * 10) / 10,
      }));
  })();

  const unsorted = reviews.filter((r) => !r.trip_name);

  const handleCreateTrip = async () => {
    const name = newTripName.trim();
    if (!name) return;
    // Just create the trip name, user will assign reviews later
    setNewTripOpen(false);
    setNewTripName("");
    toast({ title: `Trip "${name}" created`, description: "Assign reviews to it from your saved reviews." });
  };

  const handleRenameTrip = async () => {
    if (!renameTrip || !renameTo.trim()) return;
    await supabase
      .from("user_saved_reviews")
      .update({ trip_name: renameTo.trim() })
      .eq("user_id", user!.id)
      .eq("trip_name", renameTrip);
    setRenameTrip(null);
    setRenameTo("");
    fetchReviews();
    toast({ title: "Trip renamed" });
  };

  const handleDeleteTrip = async (tripName: string) => {
    await supabase
      .from("user_saved_reviews")
      .update({ trip_name: null })
      .eq("user_id", user!.id)
      .eq("trip_name", tripName);
    fetchReviews();
    toast({ title: "Trip removed", description: "Reviews moved to unsorted." });
  };

  const country = detectCountry();

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
      <SEOHead title="My Trips" description="Your saved trips and saved properties." noindex />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">My Trips</h1>
          <Button onClick={() => setNewTripOpen(true)} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Trip
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : trips.length === 0 && unsorted.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Save some reviews and organize them into trips!</p>
            <Button asChild className="mt-4"><Link to="/">Find a destination</Link></Button>
          </div>
        ) : (
          <div className="space-y-8">
            {trips.map((trip) => (
              <div key={trip.name} className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-xl font-bold text-foreground">{trip.name}</h2>
                    <span className="text-sm text-muted-foreground">
                      {trip.reviews.length} review{trip.reviews.length !== 1 ? "s" : ""} · Avg {trip.avgRating}
                      <Star className="h-3 w-3 inline ml-0.5 text-accent fill-accent" />
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setRenameTrip(trip.name); setRenameTo(trip.name); }} className="text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteTrip(trip.name)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {trip.reviews.map((r) => {
                    const links = buildDeepLinks(country, r.property_name);
                    return (
                      <div key={r.id} className="flex items-center justify-between bg-background rounded-xl p-3">
                        <Link to={`/review/${r.slug}`} className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate hover:text-primary transition-colors">{r.property_name}</p>
                          {r.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}</p>}
                        </Link>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-sm font-medium">{r.overall_rating}<Star className="h-3 w-3 inline ml-0.5 text-accent fill-accent" /></span>
                          <a href={links.expedia} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="h-3.5 w-3.5" /></a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {unsorted.length > 0 && (
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Unsorted Reviews</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {unsorted.map((r) => (
                    <Link key={r.id} to={`/review/${r.slug}`} className="flex items-center justify-between bg-background rounded-xl p-3 hover:shadow-soft transition-shadow">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{r.property_name}</p>
                        {r.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.location}</p>}
                      </div>
                      <span className="text-sm font-medium ml-3">{r.overall_rating}<Star className="h-3 w-3 inline ml-0.5 text-accent fill-accent" /></span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Trip Dialog */}
        <Dialog open={newTripOpen} onOpenChange={setNewTripOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Create a Trip</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateTrip(); }} className="flex flex-col gap-4 pt-2">
              <Input
                placeholder="e.g. Mexico 2026"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                maxLength={50}
                autoFocus
              />
              <Button type="submit" disabled={!newTripName.trim()}>Create Trip</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Rename Trip Dialog */}
        <Dialog open={!!renameTrip} onOpenChange={(o) => !o && setRenameTrip(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Rename Trip</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleRenameTrip(); }} className="flex flex-col gap-4 pt-2">
              <Input
                value={renameTo}
                onChange={(e) => setRenameTo(e.target.value)}
                maxLength={50}
                autoFocus
              />
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
