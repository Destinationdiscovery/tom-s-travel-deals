import { useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import HowItWorks from "@/components/HowItWorks";
import TravelersAskSection from "@/components/TravelersAskSection";
import RecentReviewsHomepage from "@/components/RecentReviewsHomepage";
import TravelDealsSection from "@/components/TravelDealsSection";
import GearPreviewSection from "@/components/GearPreviewSection";
import BestTimePreviewSection from "@/components/BestTimePreviewSection";
import ItineraryPreviewSection from "@/components/ItineraryPreviewSection";
import CurrencyPreviewSection from "@/components/CurrencyPreviewSection";
import FlightsPreviewSection from "@/components/FlightsPreviewSection";
import IntelPreviewSection from "@/components/IntelPreviewSection";
import BlogPreviewSection from "@/components/BlogPreviewSection";
import TrendingQueriesSection from "@/components/TrendingQueriesSection";
import HomepageFAQ from "@/components/HomepageFAQ";
import { homepageFaqData } from "@/components/HomepageFAQ";
import ComparisonFloatingBadge from "@/components/ComparisonFloatingBadge";
import Footer from "@/components/Footer";
import EmailCapturePopup from "@/components/EmailCapturePopup";
import AIReviewResult from "@/components/AIReviewResult";
import SEOHead from "@/components/SEOHead";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import PopularSavesSection from "@/components/PopularSavesSection";
import ToolsDirectorySection from "@/components/ToolsDirectorySection";
import AboutPreviewSection from "@/components/AboutPreviewSection";


const Index = () => {
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const navigate = useNavigate();
  const location = useLocation();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.functions.invoke("track-review-view", { body: { slug: "homepage" } }).catch(() => {});
  }, []);

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
        title="All-in-One Travel Planner | Itineraries, Hotel Reviews, Best Time to Visit"
        description="Plan your perfect trip with ReviewThenGo — build day-by-day itineraries, compare hotel reviews from 10+ sources, find the best time to visit any destination, and book flights. Free all-in-one travel planning tool."
        url="/"
        keywords={["travel planning tool", "travel aggregator", "hotel reviews", "resort reviews", "best time to visit", "travel itinerary builder", "flight deals", "packing list", "currency exchange rates", "travel safety scores", "travel advisories", "visa requirements", "all-in-one travel planner"]}
        faq={homepageFaqData}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ReviewThenGo",
            "@type": ["Organization", "TravelAgency"],
            url: "https://www.reviewthengo.com",
            logo: "https://www.reviewthengo.com/favicon.png",
            description: "ReviewThenGo is an all-in-one travel planning tool that aggregates unbiased hotel and resort reviews from 10+ sources and offers 8 free tools covering every stage of trip planning.",
            founder: { "@type": "Person", name: "Tom" },
            address: { "@type": "PostalAddress", addressRegion: "Ontario", addressCountry: "CA" },
            contactPoint: { "@type": "ContactPoint", url: "https://www.reviewthengo.com/contact", contactType: "customer support" },
            areaServed: "Worldwide",
            sameAs: ["https://x.com/TomLaracyTravel", "https://www.instagram.com/reviewthengo"]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ReviewThenGo",
            url: "https://reviewthengo.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://reviewthengo.com/destinations?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "ReviewThenGo",
            url: "https://reviewthengo.com",
            applicationCategory: "TravelApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "Aggregated hotel and resort reviews from 10+ sources",
              "Best time to visit any destination with weather, crowds, and prices",
              "Day-by-day travel itinerary builder",
              "Flight deals finder with booking links",
              "Personalized trip packing list generator",
              "Live currency exchange rate tracker and converter",
              "Destination safety scores, scam alerts, and emergency contacts",
              "Travel entry requirements, visa policies, and advisories"
            ]
          }
        ]}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <main id="main-content">
        <HeroSection onSearch={handleHeroSearch} isSearching={isLoading} />
        <TrustBadges />

        <div ref={resultsRef} className="container mx-auto px-4">
          <AIReviewResult
            review={review}
            isLoading={isLoading}
            error={error}
            onNewReview={clearReview}
            onReviewReady={(slug) => navigate(`/review/${slug}`, { replace: true })}
          />
        </div>

        <HowItWorks />
        <TravelersAskSection />

        <TrendingQueriesSection />
        <BestTimePreviewSection />
        <ItineraryPreviewSection />
        <CurrencyPreviewSection />
        <FlightsPreviewSection />
        <IntelPreviewSection />
        <GearPreviewSection />

        <RecentReviewsHomepage />
        <PopularSavesSection />

        {/* Saves CTA */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-8 shadow-soft">
              <Heart className="h-8 w-8 text-primary mx-auto mb-3 fill-primary/20" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Start Your Saves List</h2>
              <p className="text-muted-foreground text-sm mb-4">Save hotels and resorts as you browse, then compare them side-by-side to find your perfect match.</p>
              <a href="/my-saves" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                View My Saves <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <ToolsDirectorySection />
        <TravelDealsSection />
        <BlogPreviewSection />
        <AboutPreviewSection />
        <HomepageFAQ />
      </main>
      <ComparisonFloatingBadge />
      <EmailCapturePopup />
      <Footer />
    </div>
  );
};

export default Index;
