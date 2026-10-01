import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Bookmark, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface SavedReview {
  id: string;
  slug: string;
  property_name: string;
  location: string | null;
  overall_rating: number;
  summary: string;
  best_for: string[];
  trip_name: string | null;
  created_at: string;
}

interface HistoryItem {
  id: string;
  slug: string;
  property_name: string;
  location: string | null;
  viewed_at: string;
}

const MyReviews = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saved, setSaved] = useState<SavedReview[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchSaved = async () => {
      const { data } = await supabase
        .from("user_saved_reviews")
        .select("id, slug, property_name, location, overall_rating, summary, best_for, trip_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSaved((data as SavedReview[]) ?? []);
      setLoadingSaved(false);
    };
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("user_review_history")
        .select("id, slug, property_name, location, viewed_at")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false });
      setHistory((data as HistoryItem[]) ?? []);
      setLoadingHistory(false);
    };
    fetchSaved();
    fetchHistory();
  }, [user]);

  const removeSaved = async (id: string) => {
    await supabase.from("user_saved_reviews").delete().eq("id", id);
    setSaved((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Removed from saved reviews" });
  };

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
      <SEOHead title="My Reviews" description="Your saved hotel reviews and view history." noindex />
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">My Reviews</h1>

        <Tabs defaultValue="saved">
          <TabsList className="mb-6">
            <TabsTrigger value="saved">
              <Bookmark className="h-4 w-4 mr-1.5" />
              Saved ({saved.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-1.5" />
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            {loadingSaved ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
              </div>
            ) : saved.length === 0 ? (
              <div className="text-center py-16">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No saved reviews yet. Generate a review and save it!</p>
                <Button asChild className="mt-4"><Link to="/">Find a destination</Link></Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {saved.map((r) => (
                  <div key={r.id} className="bg-card rounded-2xl p-6 shadow-soft group relative">
                    <button
                      onClick={() => removeSaved(r.id)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link to={`/review/${r.slug}`} className="block mb-3">
                      <h3 className="font-display text-lg font-bold text-foreground hover:text-primary transition-colors">
                        {r.property_name}
                      </h3>
                      {r.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {r.location}
                        </p>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 text-accent fill-accent" />
                      <span className="font-medium text-foreground">{r.overall_rating}</span>
                      {r.trip_name && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary ml-auto">
                          {r.trip_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{r.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {loadingHistory ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No viewing history yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <Link
                    key={h.id}
                    to={`/review/${h.slug}`}
                    className="flex items-center justify-between bg-card rounded-xl p-4 shadow-soft hover:shadow-elevated transition-shadow"
                  >
                    <div>
                      <p className="font-display font-bold text-foreground">{h.property_name}</p>
                      {h.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {h.location}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.viewed_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MyReviews;
