import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGearIntel } from "@/hooks/useGearIntel";
import { GearLoading, PackingResultCard, ProductReviewPanel, GearCitations } from "@/components/gear/GearResults";
import heroImg from "@/assets/gear-water-hammock-main.jpg";

const Gear = () => {
  const { loading, error, packingData, reviewData, reviewLoading, fetchPackingList, fetchProductReview, clearReview } = useGearIntel();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Travel Gear - ReviewThenGo";
    return () => { document.title = "ReviewThenGo.com | Honest Reviews, Tested Gear & Travel Insights"; };
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center pt-20">
          <img src={heroImg} alt="Travel gear essentials" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-sky-300">Travel</span> Gear
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto text-lg mb-8">Tell us where you're going, we'll tell you what to pack.</p>
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
                <Button onClick={handleSearch} size="lg" className="h-14 px-6 rounded-xl" disabled={loading || searchQuery.trim().length < 2}>Search</Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10">
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
          {!loading && !packingData && !reviewData && !reviewLoading && (
            <div className="text-center py-16 max-w-lg mx-auto">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Where are you headed?</h3>
              <p className="text-muted-foreground">Describe your trip above and we'll recommend the best gear with full reviews on demand.</p>
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
