import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TravelStoriesSection from "@/components/TravelStoriesSection";
import GearReviewsSection from "@/components/GearReviewsSection";
import CompassSection from "@/components/CompassSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TravelStoriesSection />
        <GearReviewsSection />
        <CompassSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;