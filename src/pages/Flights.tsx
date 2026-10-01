import { useState, useEffect } from "react";
import { useSearchParams, Link } from "@/lib/router-compat";
import { ArrowLeft, Plane, Search, Lightbulb, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ToolAEOContent from "@/components/tools/ToolAEOContent";
import { flightsAEO } from "@/components/tools/toolAEOContent";
import ToolSaveBar from "@/components/tools/ToolSaveBar";

interface FlightDeal {
  airline: string;
  price: string;
  dates: string;
  class: string;
  stops: string;
  notes: string;
}

interface FlightResult {
  route: string;
  summary: string;
  deals: FlightDeal[];
  tips: string[];
  bestMonth: string;
  averagePrice: string;
}

const Flights = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<FlightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.functions.invoke("track-review-view", { body: { slug: "flights" } }).catch(() => {});
  }, []);

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("flight-deals", {
        body: { query: searchQuery },
      });
      if (fnError) throw fnError;
      if (data?.error) { setError(data.error); return; }
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch flight deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (initialQuery) handleSearch(initialQuery); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <>
      <SEOHead
        title="Flight Price Insights: Find the Best Time to Fly"
        description="See typical fares, best months, and route insights for any flight. Plan smarter with real pricing data and expert tips."
        url="/flights"
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Plane className="h-4 w-4" /> Flight Insights
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              Flight Price Insights
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Type a route like "NYC to Paris" → get typical fares, best months to fly, and booking tips.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 max-w-xl mx-auto mb-10">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. NYC to Paris, Toronto to Cancun..."
              className="text-base"
            />
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-1" /> {loading ? "Searching..." : "Get Insights"}
            </Button>
          </form>

          {error && (
            <div className="text-center text-destructive bg-destructive/10 rounded-lg p-4 mb-6">{error}</div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Analyzing route pricing...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-foreground mb-1">{result.route}</h2>
                  <p className="text-muted-foreground">{result.summary}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="text-foreground"><strong>Avg Price:</strong> {result.averagePrice}</span>
                    <span className="text-primary"><strong>Best Month:</strong> {result.bestMonth}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" /> Typical Fares
                </h3>
                {result.deals?.map((deal, i) => (
                  <Card key={i}>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{deal.airline}</span>
                            <Badge variant="outline" className="text-xs">{deal.class}</Badge>
                            <Badge variant="secondary" className="text-xs">{deal.stops}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{deal.dates}</p>
                          {deal.notes && <p className="text-xs text-muted-foreground mt-1">{deal.notes}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{deal.price}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {result.tips?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-4 w-4 text-secondary" /> Booking Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground">
                          <span className="text-primary font-bold">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
        <ToolAEOContent
          hookQuestion={flightsAEO.hookQuestion}
          intro={flightsAEO.intro}
          examples={flightsAEO.examples}
          faqs={flightsAEO.faqs}
          toolPath="/flights"
          onCardClick={(q) => { setQuery(q); handleSearch(q); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      </main>
      {result && (
        <>
          <div aria-hidden className="h-28 md:h-20" />
          <ToolSaveBar
            toolType="flights"
            label={`${result.route} flights · ${result.deals?.length ?? 0} fares`}
            destination={result.route}
            payload={result}
            onCopy={() => `${result.route}\nAvg ${result.averagePrice}, best month ${result.bestMonth}\n${(result.deals || []).map((d) => `- ${d.airline} ${d.price} (${d.dates})`).join("\n")}`}
          />
        </>
      )}
      <Footer />
    </>
  );
};

export default Flights;
