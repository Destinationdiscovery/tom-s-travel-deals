import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, DollarSign, ArrowRightLeft, Lightbulb, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface CurrencyResult {
  currencyCode: string;
  currencyName: string;
  rate: number;
  inverseRate: number;
  lastUpdated: string;
  tips: string[];
  conversions: { usd: number; local: number }[];
}

const Currency = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<CurrencyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("currency-tracker", {
        body: { query: searchQuery },
      });
      if (fnError) throw fnError;
      if (data?.error) { setError(data.error); return; }
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch exchange rate");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if query param present
  useState(() => { if (initialQuery) handleSearch(initialQuery); });

  return (
    <>
      <SEOHead
        title="Travel Currency Exchange Rates and Converter"
        description="Check live exchange rates, conversion tables, and money-saving tips for any travel destination."
        url="/currency"
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <DollarSign className="h-4 w-4" /> Currency Tracker
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              Travel Currency Converter
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Type a country or currency code → get live rates, conversion table, and travel money tips.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 max-w-xl mx-auto mb-10">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Mexico, Japan, EUR, THB..."
              className="text-base"
            />
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-1" /> {loading ? "Loading..." : "Convert"}
            </Button>
          </form>

          {error && (
            <div className="text-center text-destructive bg-destructive/10 rounded-lg p-4 mb-6">{error}</div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Main Rate Card */}
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                    USD → {result.currencyCode}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div>
                      <p className="text-4xl font-bold text-foreground">
                        1 USD = {result.rate} {result.currencyCode}
                      </p>
                      <p className="text-muted-foreground text-sm mt-1">
                        {result.currencyName} · Updated {new Date(result.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      1 {result.currencyCode} = {result.inverseRate} USD
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Conversion Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {result.conversions.map((c) => (
                      <div key={c.usd} className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">${c.usd} USD</p>
                        <p className="text-lg font-semibold text-foreground">
                          {c.local.toLocaleString()} {result.currencyCode}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Travel Money Tips */}
              {result.tips.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-4 w-4 text-secondary" /> Travel Money Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-foreground text-sm">{tip}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Currency;
