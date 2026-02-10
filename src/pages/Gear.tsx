import { useState, useEffect } from "react";
import { Star, Loader2, ExternalLink, Search, TrendingUp, CheckSquare, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { gearReviews, gearCategories } from "@/data/gearReviews";
import { useGearIntel, type GearItem, type GearIntelType } from "@/hooks/useGearIntel";
import heroImg from "@/assets/gear-water-hammock-main.jpg";

const GearLoading = ({ type }: { type: GearIntelType }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + (90 - p) * 0.04));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const label = type === "trending" ? "Finding trending gear..." : "Building your packing list...";

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="bg-card rounded-2xl p-8 shadow-soft">
        <Progress value={progress} className="h-2 mb-6" />
        <div className="flex items-center gap-3 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
};

const GearResultCard = ({ item }: { item: GearItem }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 bg-card">
    <CardContent className="p-5">
      <Badge className="mb-3 bg-primary/10 text-primary border-0">{item.category}</Badge>
      <p className="text-xs text-muted-foreground mb-1">{item.brand}</p>
      <h3 className="font-semibold text-foreground mb-2 text-base">{item.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{item.reason}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{item.priceRange}</span>
        <a
          href={item.amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View on Amazon <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </CardContent>
  </Card>
);

const Citations = ({ citations }: { citations?: string[] }) => {
  if (!citations?.length) return null;
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Sources</p>
      <div className="flex flex-wrap gap-2">
        {citations.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />
            {(() => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } })()}
          </a>
        ))}
      </div>
    </div>
  );
};

const Gear = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { loading, error, trendingData, mustHavesData, fetchGearIntel } = useGearIntel();
  const [trendingQuery, setTrendingQuery] = useState("");
  const [mustHavesQuery, setMustHavesQuery] = useState("");

  useEffect(() => {
    document.title = "Travel Gear - ReviewThenGo";
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
  }, []);

  const filteredGear = activeCategory === "All"
    ? gearReviews
    : gearReviews.filter(gear => gear.category === activeCategory);

  const handleSearch = (type: GearIntelType) => {
    const q = type === "trending" ? trendingQuery : mustHavesQuery;
    if (q.trim().length >= 2) fetchGearIntel(type, q.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center pt-20">
          <img src={heroImg} alt="Travel gear essentials" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-sky-300">Travel</span> Gear
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg">
              Tested gear reviews, trending products, and must-have packing lists — powered by real data.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div className="container mx-auto px-4 py-10">
          <Tabs defaultValue="reviews">
            <TabsList className="w-full grid grid-cols-3 mb-8 max-w-lg mx-auto">
              <TabsTrigger value="reviews" className="gap-2"><Star className="h-4 w-4 hidden sm:block" />My Reviews</TabsTrigger>
              <TabsTrigger value="trending" className="gap-2"><TrendingUp className="h-4 w-4 hidden sm:block" />Trending</TabsTrigger>
              <TabsTrigger value="must-haves" className="gap-2"><CheckSquare className="h-4 w-4 hidden sm:block" />Must-Haves</TabsTrigger>
            </TabsList>

            {/* My Reviews Tab */}
            <TabsContent value="reviews">
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {gearCategories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGear.map((gear) => (
                  <Link key={gear.id} to={`/gear/${gear.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/50 bg-card">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img src={gear.image} alt={gear.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{gear.category}</Badge>
                        <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">{gear.price}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => {
                            const filled = i < Math.floor(gear.rating);
                            const half = i === Math.floor(gear.rating) && gear.rating % 1 !== 0;
                            return (
                              <Star key={i} className={`h-4 w-4 ${filled ? "fill-primary text-primary" : half ? "fill-primary/50 text-primary" : "text-muted-foreground/30"}`} />
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{gear.brand}</p>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{gear.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{gear.excerpt}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="bg-muted px-2 py-1 rounded">Tested: {gear.testedOn}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filteredGear.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No gear reviews in this category yet.</p>
                </div>
              )}
            </TabsContent>

            {/* Trending Tab */}
            <TabsContent value="trending">
              <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. beach vacation, backpacking Europe, winter travel..."
                      value={trendingQuery}
                      onChange={(e) => setTrendingQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch("trending")}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => handleSearch("trending")} disabled={loading || trendingQuery.trim().length < 2} className="whitespace-nowrap">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Find Gear
                  </Button>
                </div>

                {loading && !trendingData && <GearLoading type="trending" />}

                {trendingData && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trendingData.items.map((item, i) => (
                        <GearResultCard key={i} item={item} />
                      ))}
                    </div>
                    <Citations citations={trendingData.citations} />
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Amazon links may earn us a commission at no extra cost to you.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Must-Haves Tab */}
            <TabsContent value="must-haves">
              <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Caribbean cruise, camping trip, family road trip..."
                      value={mustHavesQuery}
                      onChange={(e) => setMustHavesQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch("must-haves")}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => handleSearch("must-haves")} disabled={loading || mustHavesQuery.trim().length < 2} className="whitespace-nowrap">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Get List
                  </Button>
                </div>

                {loading && !mustHavesData && <GearLoading type="must-haves" />}

                {mustHavesData && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mustHavesData.items.map((item, i) => (
                        <GearResultCard key={i} item={item} />
                      ))}
                    </div>
                    <Citations citations={mustHavesData.citations} />
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Amazon links may earn us a commission at no extra cost to you.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm max-w-2xl mx-auto">
              {error}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gear;
