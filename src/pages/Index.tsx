import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TravelStoriesSection from "@/components/TravelStoriesSection";
import CompassSection from "@/components/CompassSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TravelStoriesSection />
        <CompassSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;