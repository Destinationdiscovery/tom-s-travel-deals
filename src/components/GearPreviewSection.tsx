import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Search, Luggage, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGearIntel } from "@/hooks/useGearIntel";
import { GearLoading, PackingResultCard, ProductReviewPanel, GearCitations } from "@/components/gear/GearResults";
import { supabase } from "@/integrations/supabase/client";

import gearPackingCubes from "@/assets/gear-packing-cubes-main.jpg";
import gearPhoneHolder from "@/assets/gear-phone-holder-main.jpg";
import gearWaterHammock from "@/assets/gear-water-hammock-main.jpg";
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

const GearPreviewSection = () => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<GearCard[]>(DEFAULT_CARDS);
  const gear = useGearIntel();
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    gear.clearAll();
    gear.fetchPackingList(trimmed);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const handleGearReview = (productName: string) => {
    gear.fetchProductReview(productName);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const handleBackToCards = () => {
    gear.clearAll();
    setQuery("");
  };

  const hasResults = gear.packingData || gear.reviewData || gear.loading || gear.reviewLoading;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Luggage className="h-6 w-6 text-primary" />
            Trip Planner Toolkit
          </h2>
          <Link to="/gear" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Plan Your Trip <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Inline Search */}
        <div className="max-w-2xl mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder='e.g. "Cancun packing list" or "best travel pillow"'
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button onClick={handleSearch} disabled={gear.loading || query.trim().length < 2} className="h-11 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
              {gear.loading && !gear.packingData ? "Searching..." : "Find Gear"}
            </Button>
          </div>
        </div>

        {/* Inline results */}
        <div ref={resultsRef}>
          {hasResults && (
            <div className="mb-4">
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary" onClick={handleBackToCards}>
                <ArrowLeft className="h-4 w-4" /> Back to Featured Gear
              </Button>
            </div>
          )}
          {gear.loading && !gear.packingData && (
            <div className="mb-8"><GearLoading label="Building your packing list..." /></div>
          )}
          {gear.reviewLoading && (
            <div className="mb-8"><GearLoading label="Researching product reviews..." /></div>
          )}
          {gear.reviewData && !gear.reviewLoading && (
            <div className="mb-8"><ProductReviewPanel review={gear.reviewData} onBack={gear.clearReview} /></div>
          )}
          {gear.packingData && !gear.reviewData && !gear.reviewLoading && (
            <div className="mb-8 space-y-6 animate-fade-in">
              <div className="text-center mb-4">
                <h3 className="font-display text-xl font-bold text-foreground mb-1">Your Packing List</h3>
                <p className="text-sm text-muted-foreground">Click "Review This" on any item for a full product review.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {gear.packingData.items.map((item, i) => (
                  <PackingResultCard key={i} item={item} onReview={handleGearReview} />
                ))}
              </div>
              <GearCitations citations={gear.packingData.citations} />
              <p className="text-xs text-muted-foreground text-center">Amazon links may earn us a commission at no extra cost to you.</p>
            </div>
          )}
          {gear.error && (
            <div className="mb-8 p-4 rounded-xl bg-destructive/10 text-destructive text-sm max-w-2xl">{gear.error}</div>
          )}
        </div>

        {/* Featured gear cards */}
        {!hasResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card) => (
              <div
                key={card.title}
                className="group rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 text-left block"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {card.price && (
                    <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{card.price}</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                  <Button
                    size="sm"
                    onClick={() => handleGearReview(card.title)}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-xs"
                  >
                    Review It →
                  </Button>
                  {card.affiliateUrl && (
                    <a
                      href={card.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Shop on Amazon <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GearPreviewSection;
