import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Trip { id: string; slug: string; trip_name: string; }

interface AddToTripButtonProps {
  hotel: {
    slug: string;
    propertyName: string;
    location?: string | null;
    overallRating?: number | null;
    ratings?: any;
    summary?: string | null;
    bestFor?: string[];
    pros?: string[];
    cons?: string[];
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || `trip-${Date.now()}`;

const AddToTripButton = ({ hotel, variant = "outline", size = "lg", fullWidth = true }: AddToTripButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [added, setAdded] = useState(false);

  const loadTrips = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("trips").select("id, slug, trip_name")
      .eq("user_id", user.id).order("updated_at", { ascending: false });
    setTrips((data ?? []) as Trip[]);
    setLoading(false);
  };

  useEffect(() => { if (open) void loadTrips(); /* eslint-disable-next-line */ }, [open]);

  const handleClick = () => {
    if (!user) {
      toast({ title: "Sign in to save to a trip", description: "Use the Save button to create an account first." });
      return;
    }
    setOpen(true);
  };

  const insertHotel = async (tripId: string) => {
    const { error } = await (supabase as any).from("trip_hotels").insert({
      trip_id: tripId,
      slug: hotel.slug,
      property_name: hotel.propertyName,
      location: hotel.location ?? null,
      overall_rating: hotel.overallRating ?? null,
      ratings: hotel.ratings ?? {},
      best_for: hotel.bestFor ?? [],
      pros: hotel.pros ?? [],
      cons: hotel.cons ?? [],
      summary: hotel.summary ?? null,
    });
    if (error) {
      toast({ title: "Could not add", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleAddToExisting = async (trip: Trip) => {
    const ok = await insertHotel(trip.id);
    if (ok) {
      setAdded(true);
      toast({ title: `Added to "${trip.trip_name}"`, description: "Open the trip to organise it." });
      setTimeout(() => { setOpen(false); setAdded(false); }, 900);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!user || !newName.trim()) return;
    const slug = slugify(newName) + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error } = await (supabase as any)
      .from("trips")
      .insert({ user_id: user.id, trip_name: newName.trim(), slug, destination: hotel.location ?? null })
      .select("id, slug, trip_name").single();
    if (error || !data) {
      toast({ title: "Could not create trip", description: error?.message, variant: "destructive" });
      return;
    }
    const ok = await insertHotel(data.id);
    if (ok) {
      toast({ title: `Trip "${data.trip_name}" created` });
      setOpen(false);
      navigate(`/my-trips/${data.slug}`);
    }
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={handleClick} className={`gap-2 ${fullWidth ? "w-full" : ""}`}>
        <Plus className="h-4 w-4" /> Add to Trip
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add to a trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : trips.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Your trips</p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {trips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleAddToExisting(t)}
                      className="w-full text-left px-3 py-2 rounded-lg border bg-background hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium truncate">{t.trip_name}</span>
                      {added && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You don't have any trips yet. Create one below.</p>
            )}

            <form onSubmit={(e) => { e.preventDefault(); void handleCreateAndAdd(); }} className="border-t pt-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Or start a new trip</p>
              <div className="flex gap-2">
                <Input placeholder="Trip name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={60} />
                <Button type="submit" disabled={!newName.trim()}>Create</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToTripButton;
