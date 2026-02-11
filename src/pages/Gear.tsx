import { useState, useEffect } from "react";
import { Star, Loader2, ExternalLink, Search, ArrowLeft, Sparkles, ThumbsUp, ThumbsDown, CheckCircle, Package, Luggage, Plug, Heart, Shield, Shirt, Umbrella } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useGearIntel, type GearItem, type GearReviewData } from "@/hooks/useGearIntel";
import heroImg from "@/assets/gear-water-hammock-main.jpg";

/* ─── Loading Component ─── */
const GearLoading = ({ label }: { label: string }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + (90 - p) * 0.04));
    }, 200);
    return () => clearInterval(interval);
  }, []);

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

/* ─── Category Colors & Icons ─── */
const categoryColors: Record<string, string> = {
  Packing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Tech: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Comfort: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Safety: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Health: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Clothing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const categoryIcons: Record<string, React.ElementType> = {
  Packing: Luggage,
  Tech: Plug,
  Comfort: Heart,
  Safety: Shield,
  Health: Heart,
  Clothing: Shirt,
  Beach: Umbrella,
};

const getCategoryFallback = (category: string) => {
  const Icon = categoryIcons[category] || Package;
  const colorClass = categoryColors[category] || "bg-primary/10 text-primary";
  return { Icon, colorClass };
};

/* ─── Packing Result Card ─── */
const PackingResultCard = ({ item, onReview }: { item: GearItem; onReview: (name: string) => void }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 bg-card">
      {/* Product Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          (() => {
            const { Icon, colorClass } = getCategoryFallback(item.category);
            return (
              <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${colorClass}`}>
                <Icon className="h-12 w-12 opacity-60" />
                <span className="text-xs font-medium opacity-50">{item.category}</span>
              </div>
            );
          })()
        )}
        <Badge className={`absolute top-3 left-3 border-0 ${categoryColors[item.category] || "bg-primary/10 text-primary"}`}>
          {item.category}
        </Badge>
      </div>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground mb-1">{item.brand}</p>
        <h3 className="font-semibold text-foreground mb-2 text-base line-clamp-2">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.reason}</p>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-sm font-medium text-foreground">{item.priceRange}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <a href={item.amazonUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              Get it on Amazon <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
          <Button size="sm" onClick={() => onReview(item.name)} className="flex-1 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Review This
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─── Rating Bar ─── */
const RatingBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}/5</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-700"
        style={{ width: `${(value / 5) * 100}%` }}
      />
    </div>
  </div>
);

/* ─── Product Review Panel ─── */
const ProductReviewPanel = ({
  review,
  onBack,
}: {
  review: GearReviewData;
  onBack: () => void;
}) => (
  <div className="animate-fade-in">
    <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
      <ArrowLeft className="h-4 w-4" /> Back to Results
    </Button>

    <div className="max-w-5xl mx-auto">
      {/* Product hero image */}
      {review.imageUrl && (
        <div className="mb-8 rounded-2xl overflow-hidden max-h-80 bg-muted">
          <img
            src={review.imageUrl}
            alt={review.productName}
            className="w-full h-full object-contain max-h-80"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{review.brand}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {review.productName}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(review.overallRating)
                        ? "text-accent fill-accent"
                        : i < review.overallRating
                        ? "text-accent fill-accent opacity-50"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="text-lg font-bold text-foreground ml-2">
                  {review.overallRating}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Compiled from Real Product Reviews
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              AI-curated summary drawn from verified buyer reviews and expert sources
            </p>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-2xl p-8 shadow-soft">
            <p className="text-lg text-foreground leading-relaxed">{review.summary}</p>
            <Badge variant="outline" className="mt-4">{review.priceRange}</Badge>
          </div>

          {/* What Buyers Say */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-foreground">What Buyers Say</h3>
            {review.reviewParagraphs?.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed">{paragraph}</p>
            ))}
          </div>

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl p-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-600" /> Pros
              </h4>
              <ul className="space-y-2">
                {review.pros?.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-6">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-500" /> Cons
              </h4>
              <ul className="space-y-2">
                {review.cons?.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0">✕</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Amazon CTA */}
          <Card className="border-primary bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6 text-center">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Ready to buy?
              </h3>
              <p className="text-muted-foreground mb-4">
                Check current prices and read more reviews on Amazon.
              </p>
              <a href={review.amazonUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2">
                  Get it on Amazon <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Affiliate link – we may earn a small commission at no extra cost to you.
              </p>
            </CardContent>
          </Card>

          {/* Citations */}
          {review.citations && review.citations.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Sources</p>
              <div className="flex flex-wrap gap-2">
                {review.citations.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    {(() => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } })()}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="sticky top-24 space-y-6">
            {/* Rating Breakdown */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h3 className="font-display text-xl font-bold text-foreground mb-6">Rating Breakdown</h3>
              <div className="space-y-4">
                {review.ratings && Object.entries(review.ratings).map(([cat, val]) => (
                  <RatingBar key={cat} label={cat} value={Number(val)} />
                ))}
              </div>

              {review.bestFor && review.bestFor.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Best For</h4>
                  <div className="flex flex-wrap gap-2">
                    {review.bestFor.map((item) => (
                      <span key={item} className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Amazon CTA */}
            <a href={review.amazonUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full gap-2">
                Get it on Amazon <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Mobile: Rating Breakdown */}
        <div className="lg:hidden">
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="font-display text-xl font-bold text-foreground mb-6">Rating Breakdown</h3>
            <div className="space-y-4">
              {review.ratings && Object.entries(review.ratings).map(([cat, val]) => (
                <RatingBar key={cat} label={cat} value={Number(val)} />
              ))}
            </div>
            {review.bestFor && review.bestFor.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Best For</h4>
                <div className="flex flex-wrap gap-2">
                  {review.bestFor.map((item) => (
                    <span key={item} className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">{item}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Citations ─── */
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

/* ─── Main Page ─── */
const Gear = () => {
  const { loading, error, packingData, reviewData, reviewLoading, fetchPackingList, fetchProductReview, clearReview } = useGearIntel();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Travel Gear - ReviewThenGo";
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      clearReview();
      fetchPackingList(searchQuery.trim());
    }
  };

  const handleReviewProduct = (productName: string) => {
    fetchProductReview(productName);
    window.scrollTo({ top: 400, behavior: "smooth" });
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
            <p className="text-white/80 max-w-2xl mx-auto text-lg mb-8">
              Tell us where you're going, we'll tell you what to pack.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g. 7 day all inclusive in Mexico, backpacking Japan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 pr-4 bg-white/95 dark:bg-card/95 border-0 h-14 text-foreground text-base rounded-xl"
                  />
                  {loading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
                  )}
                </div>
                <Button onClick={handleSearch} size="lg" className="h-14 px-6 rounded-xl" disabled={loading || searchQuery.trim().length < 2}>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-10">
              {loading && !packingData && <GearLoading label="Building your packing list..." />}
              {reviewLoading && <GearLoading label="Researching product reviews..." />}
              {reviewData && !reviewLoading && (
                <ProductReviewPanel review={reviewData} onBack={clearReview} />
              )}
              {packingData && !reviewData && !reviewLoading && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your Packing List</h2>
                    <p className="text-muted-foreground">Click "Review This" on any item for a full product review based on real Amazon reviews.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {packingData.items.map((item, i) => (
                      <PackingResultCard key={i} item={item} onReview={handleReviewProduct} />
                    ))}
                  </div>
                  <Citations citations={packingData.citations} />
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Amazon links may earn us a commission at no extra cost to you.
                  </p>
                </div>
              )}
              {!loading && !packingData && !reviewData && !reviewLoading && (
                <div className="text-center py-16 max-w-lg mx-auto">
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">Where are you headed?</h3>
                  <p className="text-muted-foreground">
                    Describe your trip above and we'll recommend the best gear with full reviews on demand.
                  </p>
                </div>
              )}
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
