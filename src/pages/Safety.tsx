import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Heart, Phone, MapPin, Star, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ToolAEOContent from "@/components/tools/ToolAEOContent";
import { safetyAEO } from "@/components/tools/toolAEOContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface SafetyCategory {
  name: string;
  score: number;
  note: string;
}

interface ScamInfo {
  name: string;
  description: string;
}

interface SafetyData {
  destination: string;
  safetyScore: number;
  verdict: string;
  categories: SafetyCategory[];
  commonScams: ScamInfo[];
  healthTips: string[];
  emergencyNumbers: Record<string, string>;
  safestAreas: string[];
  areasToAvoid: string[];
  travelAdvisory: string;
}

const scoreColor = (score: number) => {
  if (score >= 4) return "text-accent";
  if (score >= 3) return "text-secondary";
  return "text-destructive";
};

const Safety = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SafetyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.functions.invoke("track-review-view", { body: { slug: "safety" } }).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim().length >= 2) {
      runSearch(q.trim());
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = async (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.length < 2) return;
    setQuery(trimmed);
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("safety-intel", {
        body: { destination: trimmed },
      });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to load safety data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => runSearch(query);

  const handleCardRun = (q: string) => {
    runSearch(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim().length >= 2) {
      runSearch(q.trim());
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={data?.destination ? `${data.destination} Safety Score, Scams & Travel Advisories` : "Travel Safety Scores | Scam Alerts & Destination Advisories"}
        description="Check destination safety scores, common scams, health tips, emergency numbers, and government travel advisories before you book any trip."
        url="/safety"
        keywords={["travel safety", "destination safety score", "travel scams", "travel advisory", "is it safe to visit"]}
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="max-w-3xl mx-auto text-center mb-10">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Destination Safety Scores
            </h1>
            <p className="text-muted-foreground text-lg">
              Safety ratings, common scams, health tips, and emergency contacts, before you travel.
            </p>
          </div>

          <div className="max-w-xl mx-auto flex gap-2 mb-12">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter a destination (e.g., Paris, Bali, Mexico City)"
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || query.trim().length < 2} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
            </Button>
          </div>

          {error && (
            <div className="max-w-xl mx-auto p-4 rounded-xl bg-destructive/10 text-destructive text-sm mb-8">{error}</div>
          )}

          {loading && (
            <div className="max-w-3xl mx-auto space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {data && !loading && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              {/* Overall Score */}
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="font-display text-2xl">{data.destination}</CardTitle>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`text-4xl font-bold ${scoreColor(data.safetyScore)}`}>
                      {data.safetyScore.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground text-lg">/5</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{data.verdict}</p>
                </CardHeader>
              </Card>

              {/* Category Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.categories.map((cat) => (
                  <Card key={cat.name}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`text-2xl font-bold ${scoreColor(cat.score)}`}>{cat.score.toFixed(1)}</div>
                      <div>
                        <h3 className="font-semibold text-foreground">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">{cat.note}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Travel Advisory */}
              {data.travelAdvisory && (
                <Card className="border-secondary/30">
                  <CardContent className="p-4 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Travel Advisory</h3>
                      <p className="text-sm text-muted-foreground">{data.travelAdvisory}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Scams */}
              {data.commonScams?.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Common Scams to Watch
                  </h2>
                  <div className="space-y-3">
                    {data.commonScams.map((scam, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground">{scam.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{scam.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Tips */}
              {data.healthTips?.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-accent" />
                    Health Tips
                  </h2>
                  <ul className="space-y-2">
                    {data.healthTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-accent mt-0.5">✓</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.safestAreas?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" /> Safest Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.safestAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-accent border-accent/30">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.areasToAvoid?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-destructive" /> Areas to Avoid
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.areasToAvoid.map((area) => (
                        <Badge key={area} variant="outline" className="text-destructive border-destructive/30">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Numbers */}
              {data.emergencyNumbers && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> Emergency Numbers
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(data.emergencyNumbers).map(([key, val]) => (
                        <div key={key} className="text-center p-2 rounded-lg bg-muted/50">
                          <div className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</div>
                          <div className="font-bold text-foreground">{val}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
        <ToolAEOContent
          hookQuestion={safetyAEO.hookQuestion}
          intro={safetyAEO.intro}
          examples={safetyAEO.examples}
          faqs={safetyAEO.faqs}
          toolPath="/safety"
          onCardClick={handleCardRun}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Safety;
