import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import RecentReviewsHomepage from "@/components/RecentReviewsHomepage";
import TravelDealsSection from "@/components/TravelDealsSection";
import GearPreviewSection from "@/components/GearPreviewSection";
import IntelPreviewSection from "@/components/IntelPreviewSection";
import BlogPreviewSection from "@/components/BlogPreviewSection";
import ComparisonFloatingBadge from "@/components/ComparisonFloatingBadge";
import Footer from "@/components/Footer";
import AIReviewResult from "@/components/AIReviewResult";
import { useGenerateReview } from "@/hooks/useGenerateReview";

const Index = () => {
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleHeroSearch = (query: string) => {
    clearReview();
    generateReview(query);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AffiliateDisclosureBanner />
      <main>
        <HeroSection onSearch={handleHeroSearch} isSearching={isLoading} />
        <TrustBadges />

        {/* Inline search results from hero */}
        <div ref={resultsRef} className="container mx-auto px-4">
          <AIReviewResult
            review={review}
            isLoading={isLoading}
            error={error}
            onNewReview={clearReview}
            onReviewReady={(slug) => navigate(`/review/${slug}`, { replace: true })}
          />
        </div>

        <RecentReviewsHomepage />
        <TravelDealsSection />
        <GearPreviewSection />
        <IntelPreviewSection />
        <BlogPreviewSection />
      </main>
      <ComparisonFloatingBadge />
      <Footer />
    </div>
  );
};

export default Index;
