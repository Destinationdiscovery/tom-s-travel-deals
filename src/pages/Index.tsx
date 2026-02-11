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

const Index = () => {
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const navigate = useNavigate();

  const [showPromo, setShowPromo] = useState(() => {
    return !sessionStorage.getItem("promo-seen");
  });

  const handleSearch = async (propertyName: string) => {
    await generateReview(propertyName);
  };

  const handleNavigateSearch = (type: SearchType, query: string) => {
    if (type === "gear") {
      navigate(`/gear?q=${encodeURIComponent(query)}`);
    } else {
      navigate(`/travel-intel?q=${encodeURIComponent(query)}&type=${type}`);
    }
  };

  const handleSearchTypeChange = () => {
    clearReview();
  };

  const handlePromoComplete = () => {
    sessionStorage.setItem("promo-seen", "true");
    setShowPromo(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {showPromo && (
        <PromoSlideshow onComplete={handlePromoComplete} />
      )}
      <Header />
      <main>
        <HeroSection
          onSearch={handleSearch}
          isSearching={isLoading}
          onNavigateSearch={handleNavigateSearch}
          onSearchTypeChange={handleSearchTypeChange}
        />
        <AIReviewResult
          review={review}
          isLoading={isLoading}
          error={error}
          onNewReview={clearReview}
          onReviewReady={(slug) => navigate(`/review/${slug}`, { replace: true })}
        />
        {!review && !isLoading && !error && <RecentlyReviewedSection />}
      </main>
      <ComparisonFloatingBadge />
      <Footer />
    </div>
  );
};

export default Index;
