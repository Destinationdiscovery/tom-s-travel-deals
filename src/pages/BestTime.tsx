import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Sun, Cloud, Snowflake, Leaf, Calendar, TrendingDown, TrendingUp, Minus, ArrowLeft, Users, Plane, Lightbulb, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Season {
  name: string;
  months: string;
  tempC: string;
  tempF: string;
  rainfall: string;
  crowds: string;
  flightPrices: string;
  verdict: string;
}

interface BestTimeEvent {
  name: string;
  month: string;
  description: string;
}

interface BestTimeData {
  destination: string;
  verdict: string;
  bestMonths: string[];
  seasons: Season[];
  events: BestTimeEvent[];
  tips: string[];
  avoidMonths: string[];
  avoidReason: string;
  citations: string[];
}

const seasonIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("summer")) return <Sun className="h-5 w-5 text-amber-500" />;
  if (n.includes("winter")) return <Snowflake className="h-5 w-5 text-sky-400" />;
  if (n.includes("fall") || n.includes("autumn")) return <Leaf className="h-5 w-5 text-orange-500" />;
  return <Cloud className="h-5 w-5 text-emerald-500" />;
};

const priceIcon = (level: string) => {
  const l = level.toLowerCase();
  if (l.includes("low") || l.includes("cheap")) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
  if (l.includes("high") || l.includes("expensive")) return <TrendingUp className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const BestTime = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BestTimeData | null>(null);
  const [error, setError] = useState("");

  const doSearch = useCallback(async (dest: string) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("best-time-intel", {
        body: { destination: dest },
      });
      if (fnError) throw fnError;
      if (fnData?.error) throw new Error(fnData.error);
      setData(fnData as BestTimeData);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    doSearch(trimmed);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim().length >= 2) {
      setQuery(q);
      doSearch(q.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Best Time to Visit Any Destination | ReviewThenGo"
        description="Find the best time to visit any destination, weather, crowds, flight prices, and local events all in one place."
        url="/best-time"
      />
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary via-primary to-primary/80 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Best Time to Visit <span className="text-secondary">Anywhere</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
              Weather, crowds, flight prices, local events, get the complete picture before you book.
            </p>
            <div className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. Japan, Bali, Paris, Cancun..."
                    className="pl-10 h-12 bg-white text-gray-900 border-0"
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading || query.trim().length < 2} className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
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
              <p className="text-muted-foreground">Analyzing travel data for {query}...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm max-w-2xl mx-auto">{error}</div>
          )}

          {data && !loading && (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
              {/* Verdict */}
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">{data.destination}</h2>
                <p className="text-lg text-muted-foreground">{data.verdict}</p>
                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                  {data.bestMonths?.map((m) => (
                    <span key={m} className="bg-secondary/20 text-secondary-foreground text-sm font-medium px-3 py-1 rounded-full border border-secondary/30">
                      ✅ {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Season Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.seasons?.map((s) => (
                  <div key={s.name} className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      {seasonIcon(s.name)}
                      <h3 className="font-display font-bold text-lg text-foreground">{s.name}</h3>
                      <span className="text-xs text-muted-foreground ml-auto">{s.months}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">🌡️ Temp:</span>
                        <span className="ml-1 text-foreground font-medium">{s.tempC}°C / {s.tempF}°F</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">🌧️ Rain:</span>
                        <span className="ml-1 text-foreground font-medium">{s.rainfall}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Crowds:</span>
                        <span className="ml-1 text-foreground font-medium">{s.crowds}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Flights:</span>
                        {priceIcon(s.flightPrices)}
                        <span className="text-foreground font-medium">{s.flightPrices}</span>
                      </div>
                    </div>
                    <p className="text-sm text-primary font-medium">{s.verdict}</p>
                  </div>
                ))}
              </div>

              {/* Events */}
              {data.events && data.events.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Local Events & Festivals
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.events.map((ev, i) => (
                      <div key={i} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground text-sm">{ev.name}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{ev.month}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {data.tips && data.tips.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-secondary" /> Travel Tips
                  </h3>
                  <ul className="space-y-2">
                    {data.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-secondary font-bold">{i + 1}.</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avoid */}
              {data.avoidMonths && data.avoidMonths.length > 0 && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <h3 className="font-display font-bold text-foreground mb-1 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" /> Months to Avoid
                  </h3>
                  <p className="text-sm text-foreground">
                    <strong>{data.avoidMonths.join(", ")}</strong>, {data.avoidReason}
                  </p>
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
              <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Find the Perfect Time to Travel</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter any destination above and we'll tell you the best months to visit based on weather, crowds, prices, and local events.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BestTime;
