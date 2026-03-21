import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, ArrowLeft, MapPin, Clock, DollarSign, Utensils, Lightbulb, AlertTriangle, Bus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Activity {
  time: string;
  activity: string;
  description: string;
  cost: string;
  tip: string;
}

interface Meal {
  type: string;
  restaurant: string;
  cuisine: string;
  priceRange: string;
}

interface Day {
  day: number;
  title: string;
  activities: Activity[];
  meals: Meal[];
}

interface ItineraryData {
  destination: string;
  duration: string;
  budget: string;
  summary: string;
  totalEstimatedCost: string;
  days: Day[];
  packingTips: string[];
  transportTips: string[];
  warnings: string[];
  citations: string[];
}

const Itinerary = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ItineraryData | null>(null);
  const [error, setError] = useState("");

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("generate-itinerary", {
        body: { query: q },
      });
      if (fnError) throw fnError;
      if (fnData?.error) throw new Error(fnData.error);
      setData(fnData as ItineraryData);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    doSearch(trimmed);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim().length >= 3) {
      setQuery(q);
      doSearch(q.trim());
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Itinerary Builder. Plan Your Trip | ReviewThenGo"
        description="Get a personalized day-by-day travel itinerary with costs, activities, restaurants, and insider tips, powered by AI."
        url="/itinerary"
      />
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary via-primary to-primary/80 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              AI Itinerary <span className="text-secondary">Builder</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
              Tell us your destination and trip style, get a complete day-by-day plan with costs and restaurant picks.
            </p>
            <div className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. Tokyo 5 days budget, Paris romantic weekend..."
                    className="pl-10 h-12 bg-card text-foreground border-0"
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading || query.trim().length < 3} className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Plan"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Building your itinerary for "{query}"...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm max-w-2xl mx-auto">{error}</div>
          )}

          {data && !loading && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              {/* Summary */}
              <div className="text-center space-y-3">
                <h2 className="font-display text-3xl font-bold text-foreground">{data.destination}</h2>
                <p className="text-lg text-muted-foreground">{data.summary}</p>
                <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" /> {data.duration}
                  </span>
                  <span className="flex items-center gap-1 bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full">
                    <DollarSign className="h-3.5 w-3.5" /> {data.budget}
                  </span>
                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                    <MapPin className="h-3.5 w-3.5" /> {data.totalEstimatedCost}
                  </span>
                </div>
              </div>

              {/* Day Cards */}
              {data.days?.map((day) => (
                <div key={day.day} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="bg-primary/5 px-5 py-3 border-b border-border">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Day {day.day}: {day.title}
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Activities */}
                    {day.activities?.map((act, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="shrink-0 w-20 text-xs font-medium text-muted-foreground uppercase pt-0.5">{act.time}</span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-foreground text-sm">{act.activity}</span>
                            {act.cost && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">{act.cost}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                          {act.tip && (
                            <p className="text-xs text-primary mt-1 italic">💡 {act.tip}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Meals */}
                    {day.meals && day.meals.length > 0 && (
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Utensils className="h-3.5 w-3.5 text-secondary" />
                          <span className="text-xs font-semibold text-foreground uppercase">Where to Eat</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {day.meals.map((meal, i) => (
                            <div key={i} className="bg-muted/50 rounded-lg p-2.5 text-xs">
                              <span className="font-semibold text-foreground">{meal.type}:</span>{" "}
                              <span className="text-foreground">{meal.restaurant}</span>
                              <span className="text-muted-foreground"> · {meal.cuisine} · {meal.priceRange}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Transport Tips */}
              {data.transportTips && data.transportTips.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" /> Getting Around
                  </h3>
                  <ul className="space-y-2">
                    {data.transportTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary font-bold">{i + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Packing Tips */}
              {data.packingTips && data.packingTips.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-secondary" /> Packing Tips
                  </h3>
                  <ul className="space-y-2">
                    {data.packingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-secondary font-bold">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {data.warnings && data.warnings.length > 0 && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <h3 className="font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" /> Watch Out For
                  </h3>
                  <ul className="space-y-1">
                    {data.warnings.map((w, i) => (
                      <li key={i} className="text-sm text-foreground">⚠️ {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Citations */}
              {data.citations && data.citations.length > 0 && (
                <div className="text-xs text-muted-foreground pt-4 border-t border-border">
                  <span className="font-medium">Sources: </span>
                  {data.citations.slice(0, 5).map((c, i) => (
                    <a key={i} href={c} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline mr-2">
                      [{i + 1}]
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!data && !loading && !error && (
            <div className="text-center py-20">
              <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Plan Your Perfect Trip</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Type your destination and trip style above, we'll create a day-by-day itinerary with costs, restaurants, and insider tips.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {["Tokyo 5 days budget", "Paris romantic weekend", "Bali 7 days adventure", "Italy 10 days family"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); doSearch(ex); }}
                    className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-full transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Itinerary;
