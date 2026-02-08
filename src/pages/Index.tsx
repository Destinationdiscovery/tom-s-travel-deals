import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AIReviewResult from "@/components/AIReviewResult";
import Footer from "@/components/Footer";
import { useGenerateReview } from "@/hooks/useGenerateReview";

const Index = () => {
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection onSearch={generateReview} isSearching={isLoading} />
        <AIReviewResult review={review} isLoading={isLoading} error={error} onNewReview={clearReview} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
