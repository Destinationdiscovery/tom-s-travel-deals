import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AIReviewResult from "@/components/AIReviewResult";
import RecentlyReviewedSection from "@/components/RecentlyReviewedSection";
import ComparisonFloatingBadge from "@/components/ComparisonFloatingBadge";
import Footer from "@/components/Footer";
import { useGenerateReview } from "@/hooks/useGenerateReview";

const Index = () => {
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const navigate = useNavigate();

  // When review finishes loading, navigate to its shareable URL
  const handleSearch = async (propertyName: string) => {
    await generateReview(propertyName);
  };

  // After review loads, navigate to /review/:slug
  const reviewSlug = review?.slug;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onSearch={handleSearch} isSearching={isLoading} />
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
