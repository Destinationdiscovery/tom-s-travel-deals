import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
import EmailCapturePopup from "@/components/EmailCapturePopup";
import AIReviewResult from "@/components/AIReviewResult";
import SEOHead from "@/components/SEOHead";
import { useGenerateReview } from "@/hooks/useGenerateReview";

const SectionConnector = ({ text, linkText, to }: { text: string; linkText: string; to: string }) => (
  <div className="container mx-auto px-4 py-4 text-center">
    <p className="text-sm text-muted-foreground">
      {text}{" "}
      <Link to={to} className="text-secondary hover:text-secondary/80 font-medium inline-flex items-center gap-1 transition-colors">
        {linkText} <ArrowRight className="h-3 w-3" />
      </Link>
    </p>
  </div>
);

const Index = () => {
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const navigate = useNavigate();
  const location = useLocation();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle hash scroll on load
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location.hash]);

  const handleHeroSearch = (query: string) => {
    clearReview();
    generateReview(query);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Real Travel Reviews, Deals & Insights for Canadians"
        description="Real destination reviews, tested travel gear, and expert insights from an Ontario travel consultant. Plan your perfect trip."
        url="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ReviewThenGo",
            url: "https://reviewthengo.lovable.app",
            logo: "https://reviewthengo.lovable.app/favicon.png",
            sameAs: ["https://x.com/TomLaracyTravel", "https://www.instagram.com/reviewthengo"]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ReviewThenGo",
            url: "https://reviewthengo.lovable.app",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://reviewthengo.lovable.app/destinations?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <main id="main-content">
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
        <SectionConnector text="Need gear for your trip?" linkText="Check our Travel Gear picks" to="/gear" />
        <TravelDealsSection />
        <SectionConnector text="Read real reviews before you book →" linkText="Browse Destinations" to="/destinations" />
        <GearPreviewSection />
        <IntelPreviewSection />
        <BlogPreviewSection />
      </main>
      <ComparisonFloatingBadge />
      <EmailCapturePopup />
      <Footer />
    </div>
  );
};

export default Index;
