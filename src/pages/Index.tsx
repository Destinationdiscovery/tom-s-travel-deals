import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection, { type SearchType } from "@/components/HeroSection";
import AIReviewResult from "@/components/AIReviewResult";
import RecentlyReviewedSection from "@/components/RecentlyReviewedSection";
import ComparisonFloatingBadge from "@/components/ComparisonFloatingBadge";
import Footer from "@/components/Footer";
import PromoSlideshow from "@/components/PromoSlideshow";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import { useTravelIntel, type IntelType } from "@/hooks/useTravelIntel";
import { useGearIntel } from "@/hooks/useGearIntel";
import { IntelLoading, RequirementsResult, AdvisoriesResult, NewsResult } from "@/components/intel/IntelResults";
import { GearLoading, PackingResultCard, ProductReviewPanel, GearCitations } from "@/components/gear/GearResults";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const navigate = useNavigate();
  const intel = useTravelIntel();
  const gear = useGearIntel();

  const [activeSearchType, setActiveSearchType] = useState<SearchType>("destination");
  const [showPromo, setShowPromo] = useState(() => !sessionStorage.getItem("promo-seen"));

  // Requirements special case: citizenship prompt
  const [requiresCitizenship, setRequiresCitizenship] = useState(false);
  const [citizenshipInput, setCitizenshipInput] = useState("");
  const [pendingDestination, setPendingDestination] = useState("");

  const handleSearch = async (propertyName: string) => {
    await generateReview(propertyName);
  };

  const clearAllResults = () => {
    clearReview();
    // Reset intel/gear state by clearing references (hooks manage their own state)
  };

  const handleInlineSearch = (type: SearchType, query: string) => {
    setActiveSearchType(type);
    setRequiresCitizenship(false);

    if (type === "gear") {
      gear.clearReview();
      gear.fetchPackingList(query);
    } else if (type === "advisories") {
      intel.fetchIntel("advisories", query);
    } else if (type === "news") {
      intel.fetchIntel("news", query);
    } else if (type === "requirements") {
      // Parse "X to Y" pattern
      const match = query.match(/^(.+?)\s+to\s+(.+)$/i);
      if (match) {
        intel.fetchIntel("requirements", match[2].trim(), match[1].trim());
      } else {
        // Need citizenship - show prompt
        setPendingDestination(query);
        setRequiresCitizenship(true);
      }
    }
  };

  const handleCitizenshipSubmit = () => {
    if (citizenshipInput.trim().length >= 2) {
      setRequiresCitizenship(false);
      intel.fetchIntel("requirements", pendingDestination, citizenshipInput.trim());
    }
  };

  const handleSearchTypeChange = () => {
    clearAllResults();
    setRequiresCitizenship(false);
    setCitizenshipInput("");
    setActiveSearchType("destination");
  };

  const handleGearReview = (productName: string) => {
    gear.fetchProductReview(productName);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handlePromoComplete = () => {
    sessionStorage.setItem("promo-seen", "true");
    setShowPromo(false);
  };

  const isAnyLoading = isLoading || intel.loading || gear.loading;
  const hasIntelResults = intel.requirementsData || intel.advisoriesData || intel.newsData;
  const hasGearResults = gear.packingData || gear.reviewData;
  const hasAnyResults = review || error || hasIntelResults || hasGearResults || requiresCitizenship;

  return (
    <div className="min-h-screen bg-background">
      {showPromo && <PromoSlideshow onComplete={handlePromoComplete} />}
      <Header />
      <main>
        <HeroSection
          onSearch={handleSearch}
          isSearching={isLoading}
          onInlineSearch={handleInlineSearch}
          onSearchTypeChange={handleSearchTypeChange}
        />

        {/* Destination Review Results */}
        <AIReviewResult
          review={review}
          isLoading={isLoading}
          error={error}
          onNewReview={clearReview}
          onReviewReady={(slug) => navigate(`/review/${slug}`, { replace: true })}
        />

        {/* Citizenship prompt for requirements */}
        {requiresCitizenship && (
          <div className="container mx-auto px-4 py-10 max-w-xl">
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold mb-3">What's your citizenship?</h3>
              <p className="text-sm text-muted-foreground mb-4">We need your citizenship to check entry requirements for {pendingDestination}.</p>
              <div className="flex gap-3">
                <Input
                  placeholder="e.g. Canada, USA, UK..."
                  value={citizenshipInput}
                  onChange={(e) => setCitizenshipInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCitizenshipSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleCitizenshipSubmit} disabled={citizenshipInput.trim().length < 2}>
                  Check
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Intel Results (advisories, requirements, news) */}
        {intel.loading && (
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <IntelLoading type={activeSearchType as IntelType} />
          </div>
        )}
        {!intel.loading && intel.requirementsData && (
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <RequirementsResult data={intel.requirementsData} />
          </div>
        )}
        {!intel.loading && intel.advisoriesData && (
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <AdvisoriesResult data={intel.advisoriesData} />
          </div>
        )}
        {!intel.loading && intel.newsData && (
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <NewsResult data={intel.newsData} />
          </div>
        )}

        {/* Intel Error */}
        {intel.error && (
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{intel.error}</div>
          </div>
        )}

        {/* Gear Results */}
        {gear.loading && !gear.packingData && (
          <div className="container mx-auto px-4 py-10">
            <GearLoading label="Building your packing list..." />
          </div>
        )}
        {gear.reviewLoading && (
          <div className="container mx-auto px-4 py-10">
            <GearLoading label="Researching product reviews..." />
          </div>
        )}
        {gear.reviewData && !gear.reviewLoading && (
          <div className="container mx-auto px-4 py-10">
            <ProductReviewPanel review={gear.reviewData} onBack={gear.clearReview} />
          </div>
        )}
        {gear.packingData && !gear.reviewData && !gear.reviewLoading && (
          <div className="container mx-auto px-4 py-10">
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your Packing List</h2>
                <p className="text-muted-foreground">Click "Review This" on any item for a full product review based on real Amazon reviews.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {gear.packingData.items.map((item, i) => (
                  <PackingResultCard key={i} item={item} onReview={handleGearReview} />
                ))}
              </div>
              <GearCitations citations={gear.packingData.citations} />
              <p className="text-xs text-muted-foreground text-center mt-4">Amazon links may earn us a commission at no extra cost to you.</p>
            </div>
          </div>
        )}
        {gear.error && (
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{gear.error}</div>
          </div>
        )}

        {!hasAnyResults && !isAnyLoading && !gear.reviewLoading && <RecentlyReviewedSection />}
      </main>
      <ComparisonFloatingBadge />
      <Footer />
    </div>
  );
};

export default Index;
