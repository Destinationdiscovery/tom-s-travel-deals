import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TravelStoriesSection from "@/components/TravelStoriesSection";
import CompassSection from "@/components/CompassSection";
import AboutSection from "@/components/AboutSection";
import NewsletterSection from "@/components/NewsletterSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TravelStoriesSection />
        <CompassSection />
        <AboutSection />
        <NewsletterSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;