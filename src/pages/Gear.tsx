import { useState, useEffect } from "react";
import { Search, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGearIntel } from "@/hooks/useGearIntel";
import { GearLoading, PackingResultCard, ProductReviewPanel, GearCitations } from "@/components/gear/GearResults";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/gear-water-hammock-main.jpg";

import gearWaterHammock from "@/assets/gear-water-hammock-main.jpg";
import gearPhoneHolder from "@/assets/gear-phone-holder-main.jpg";
import gearPackingCubes from "@/assets/gear-packing-cubes-main.jpg";
import gearThermacell from "@/assets/gear-thermacell-main.jpg";

interface GearCard {
  title: string;
  description: string;
  price: string;
  affiliateUrl: string;
  image: string;
}

const DEFAULT_CARDS: GearCard[] = [
  { title: "Beach Essentials", description: "Sunscreen, beach towels, waterproof gear", price: "$15 - $40", affiliateUrl: "", image: gearWaterHammock },
  { title: "Tech & Gadgets", description: "Adapters, chargers, travel tech", price: "$10 - $35", affiliateUrl: "", image: gearPhoneHolder },
  { title: "Packing & Organization", description: "Cubes, bags, and compression sacks", price: "$20 - $45", affiliateUrl: "", image: gearPackingCubes },
  { title: "Outdoor & Adventure", description: "Bug protection, hiking, and comfort gear", price: "$15 - $50", affiliateUrl: "", image: gearThermacell },
];

const Gear = () => {
  const { loading, error, packingData, reviewData, reviewLoading, fetchPackingList, fetchProductReview, clearReview, clearAll } = useGearIntel();
  const [searchQuery, setSearchQuery] = useState("");
  const [cards, setCards] = useState<GearCard[]>(DEFAULT_CARDS);

  useEffect(() => {
    const fetchCards = async () => {
      const { data } = await supabase.from("featured_gear_cards").select("*").order("slot_number") as any;
      if (data && data.length > 0) {
        const merged = [...DEFAULT_CARDS];
        data.forEach((row: any) => {
          const idx = row.slot_number - 1;
          if (idx >= 0 && idx < 4) {
            merged[idx] = {
              title: row.title || DEFAULT_CARDS[idx].title,
              description: row.description || DEFAULT_CARDS[idx].description,
              price: row.price || DEFAULT_CARDS[idx].price,
              affiliateUrl: row.affiliate_url || "",
              image: row.image_url || DEFAULT_CARDS[idx].image,
            };
          }
        });
        setCards(merged);
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim().length >= 2) {
      setSearchQuery(q);
      fetchPackingList(q.trim());
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleBackToCards = () => {
    clearAll();
    setSearchQuery("");
  };

  const hasResults = packingData || reviewData || loading || reviewLoading;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Trip Planner Toolkit"
        description="Enter your trip and get a personalized packing list, weather tips, and gear recommendations — all powered by AI."
        url="/gear"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Trip Planner Toolkit - ReviewThenGo",
          description: "AI-powered packing lists, weather tips, and gear recommendations for travelers.",
          url: "https://reviewthengo.lovable.app/gear"
        }}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <main className="pt-20">
        <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center pt-20">
          <img src={heroImg} alt="Travel gear essentials" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Trip Planner <span className="text-secondary">Toolkit</span>
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg mb-8">Enter your trip → Get a personalized packing list, weather tips, and gear recommendations.</p>
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
                  {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />}
                </div>
                <Button onClick={handleSearch} size="lg" className="h-14 px-6 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={loading || searchQuery.trim().length < 2}>Search</Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
          {/* Back button when results showing */}
          {hasResults && (
            <div className="mb-6">
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={handleBackToCards}>
                <ArrowLeft className="h-4 w-4" /> Back to Featured Gear
              </Button>
            </div>
          )}

          {loading && !packingData && <GearLoading label="Building your packing list..." />}
          {reviewLoading && <GearLoading label="Researching product reviews..." />}
          {reviewData && !reviewLoading && <ProductReviewPanel review={reviewData} onBack={clearReview} />}
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
              <GearCitations citations={packingData.citations} />
              <p className="text-xs text-muted-foreground text-center mt-4">Amazon links may earn us a commission at no extra cost to you.</p>
            </div>
          )}

          {/* Featured Gear Cards - show when no results */}
          {!hasResults && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Featured Gear</h2>
                <p className="text-muted-foreground">Curated travel essentials — click to shop or search above for custom packing lists.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                {cards.map((card) => {
                  const Wrapper = card.affiliateUrl
                    ? (props: any) => <a href={card.affiliateUrl} target="_blank" rel="noopener noreferrer" {...props} />
                    : (props: any) => <div {...props} />;
                  return (
                    <Wrapper
                      key={card.title}
                      className="group rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 text-left block cursor-pointer"
                    >
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {card.price && (
                          <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{card.price}</span>
                        )}
                        {card.affiliateUrl && (
                          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> Shop
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm max-w-2xl mx-auto">{error}</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gear;
