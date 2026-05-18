import { useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import HowItWorks from "@/components/HowItWorks";
import TravelersAskSection from "@/components/TravelersAskSection";
import RecentReviewsHomepage from "@/components/RecentReviewsHomepage";

import BlogPreviewSection from "@/components/BlogPreviewSection";
import TrendingQueriesSection from "@/components/TrendingQueriesSection";
import HomepageFAQ from "@/components/HomepageFAQ";
import { homepageFaqData } from "@/components/HomepageFAQ";
import ComparisonFloatingBadge from "@/components/ComparisonFloatingBadge";
import Footer from "@/components/Footer";

import AIReviewResult from "@/components/AIReviewResult";
import SEOHead from "@/components/SEOHead";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import PopularSavesSection from "@/components/PopularSavesSection";
import ToolsDirectorySection from "@/components/ToolsDirectorySection";
import AboutPreviewSection from "@/components/AboutPreviewSection";
import AggregateStatsSection from "@/components/AggregateStatsSection";
import { classifySearchIntent, toSlug } from "@/lib/searchIntent";


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
    const intent = classifySearchIntent(query);
    if (intent === "listicle") {
      navigate(`/reviews/${toSlug(query)}`);
      return;
    }
    clearReview();
    generateReview(query);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="All-in-One Travel Planner & Travel Guides | Hotel Reviews, Itineraries, Best Time to Visit"
        description="Plan trips with ReviewThenGo: hotel reviews from 10+ sources, day-by-day itineraries, best time to visit, flight deals, plus expert travel guides and trends."
        url="/"
        keywords={["travel planning tool", "travel aggregator", "travel blog", "travel guides", "travel trends", "hotel reviews", "resort reviews", "best time to visit", "travel itinerary builder", "flight deals", "packing list", "currency exchange rates", "travel safety scores", "travel advisories", "visa requirements", "all-in-one travel planner"]}
        faq={homepageFaqData}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": ["Organization", "TravelAgency"],
            name: "ReviewThenGo",
            url: "https://www.reviewthengo.com",
            logo: "https://www.reviewthengo.com/favicon.png",
            description: "ReviewThenGo is an all-in-one travel planning tool and editorial travel source that aggregates unbiased hotel and resort reviews from 10+ sources, offers 8 free tools covering every stage of trip planning, and publishes the Compass blog with expert travel guides, destination journalism, and travel industry trend reporting.",
            founder: { "@type": "Person", name: "Tom" },
            contactPoint: { "@type": "ContactPoint", url: "https://www.reviewthengo.com/contact", contactType: "customer support" },
            serviceArea: [
              { "@type": "Country", name: "United States" },
              { "@type": "Country", name: "Canada" },
              { "@type": "Country", name: "United Kingdom" },
              { "@type": "Country", name: "Australia" }
            ],
            sameAs: ["https://x.com/TomLaracyTravel", "https://www.instagram.com/reviewthengo"]
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ReviewThenGo",
            url: "https://www.reviewthengo.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.reviewthengo.com/destinations?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "ReviewThenGo",
            url: "https://www.reviewthengo.com",
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
              "Travel entry requirements, visa policies, and advisories",
              "Expert travel guides, destination journalism, and travel industry trend reporting via the Compass blog"
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

        <RecentReviewsHomepage />
        <PopularSavesSection />

        {/* Trip plan CTA */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl border border-border p-8 shadow-soft">
              <Heart className="h-8 w-8 text-primary mx-auto mb-3 fill-primary/20" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Start building your trip plan</h2>
              <p className="text-muted-foreground text-sm mb-5 max-w-xl mx-auto">
                Save hotels as you browse, build your itinerary, add packing lists, check visa requirements, and track gear, all in one place. Everything you do on ReviewThenGo can be saved to a named trip plan you can come back to from any device.
              </p>
              <Link
                to="/my-trips"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm"
              >
                Start my free trip plan <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-3 text-xs text-muted-foreground">
                Already have a plan? <Link to="/my-trips" className="text-primary font-medium hover:underline">Sign in</Link>
              </div>
            </div>
          </div>
        </section>

        <ToolsDirectorySection />
        <BlogPreviewSection />
        <AggregateStatsSection />
        <AboutPreviewSection />
        <HomepageFAQ />
      </main>
      <ComparisonFloatingBadge />
      
      <Footer />
    </div>
  );
};

export default Index;
