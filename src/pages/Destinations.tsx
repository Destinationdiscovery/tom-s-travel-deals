import { useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AffiliateDisclosureBanner from "@/components/AffiliateDisclosureBanner";
import { Star, ArrowRight, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useGenerateReview } from "@/hooks/useGenerateReview";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import AIReviewResult from "@/components/AIReviewResult";
import SEOHead from "@/components/SEOHead";
import heroImg from "@/assets/snowbird-caribbean-aerial.jpg";
import cubaImg from "@/assets/deal-cuba.jpg";
import curacaoImg from "@/assets/curacao-hero.avif";
import mexicoImg from "@/assets/mexico-hero.webp";
import vegasImg from "@/assets/vegas-gallery-1.jpg";
import cruiseImg from "@/assets/cruise-hero.jpg";
import banffImg from "@/assets/canada-boom-banff-street.jpg";
import santoriniImg from "@/assets/deal-santorini.jpg";
import maldivesImg from "@/assets/deal-maldives.jpg";
import phuketImg from "@/assets/deal-phuket-clean.jpg";
import DestinationCard from "@/components/destinations/DestinationCard";

export interface Destination {
  slug: string;
  image: string;
  destination: string;
  country: string;
  region: string;
  teaser: string;
  rating: number;
  dateVisited: string;
  hasVideo: boolean;
  tags: string[];
}

const destinations: Destination[] = [
  {
    slug: "barcelo-maya-riviera",
    image: mexicoImg,
    destination: "Barceló Maya Riviera Adults Only",
    country: "Riviera Maya, Mexico",
    region: "Caribbean",
    teaser: "A grand, modern adults-only resort that delivers a luxury feel, incredible pools, excellent dining, and outstanding value for the Riviera Maya.",
    rating: 4.9,
    dateVisited: "September 2025",
    hasVideo: false,
    tags: ["Adults-Only", "Luxury", "All-Inclusive", "Pool"],
  },
  {
    slug: "vila-gale-paredon",
    image: cubaImg,
    destination: "Vila Galé Paredón",
    country: "Cayo Coco, Cuba",
    region: "Caribbean",
    teaser: "Better than expected for Cuba, delivering strong value at a fraction of typical Caribbean prices.",
    rating: 4,
    dateVisited: "December 2024",
    hasVideo: false,
    tags: ["Budget", "Beach", "All-Inclusive"],
  },
  {
    slug: "villa-blue-bay-curacao",
    image: curacaoImg,
    destination: "Villa in Blue Bay Resort",
    country: "Curaçao",
    region: "Caribbean",
    teaser: "A luxury private villa with an infinity pool that offered space, privacy, and easy access to some of Curaçao's best beaches.",
    rating: 5,
    dateVisited: "November 2024",
    hasVideo: false,
    tags: ["Villa", "Luxury", "Beach", "Privacy"],
  },
  {
    slug: "bellagio-las-vegas",
    image: vegasImg,
    destination: "Bellagio",
    country: "Las Vegas, USA",
    region: "North America",
    teaser: "After more than 30 trips to Vegas, Bellagio is still the resort I come back to the most. Upscale without feeling stuffy, perfectly located, and consistently delivers.",
    rating: 4.5,
    dateVisited: "February 2025",
    hasVideo: false,
    tags: ["Casino", "Luxury", "City", "Iconic"],
  },
  {
    slug: "cruising-experience",
    image: cruiseImg,
    destination: "Cruising as a Travel Experience",
    country: "Caribbean & Alaska",
    region: "Multiple",
    teaser: "After 15+ years of cruising, it still stands out as one of the easiest ways to travel if you plan it properly and know what to expect.",
    rating: 4.0,
    dateVisited: "15+ years experience",
    hasVideo: false,
    tags: ["Cruise", "Caribbean", "Alaska", "Multi-destination"],
  },
  {
    slug: "banff-lake-louise",
    image: banffImg,
    destination: "Banff & Lake Louise",
    country: "Alberta, Canada",
    region: "North America",
    teaser: "Stunning mountain scenery, world-class skiing, turquoise lakes, and charming alpine towns make Banff one of Canada's most iconic destinations.",
    rating: 4.8,
    dateVisited: "Winter 2025",
    hasVideo: false,
    tags: ["Mountains", "Skiing", "Nature", "Adventure"],
  },
  {
    slug: "santorini-greece",
    image: santoriniImg,
    destination: "Santorini",
    country: "Greece",
    region: "Europe",
    teaser: "White-washed cliffs, dramatic sunsets over the caldera, and incredible Mediterranean cuisine make Santorini a bucket-list destination that lives up to the hype.",
    rating: 4.7,
    dateVisited: "Summer 2025",
    hasVideo: false,
    tags: ["Romantic", "Beach", "Views", "Culture"],
  },
  {
    slug: "maldives-beach-resort",
    image: maldivesImg,
    destination: "Maldives Beach Resort",
    country: "Maldives",
    region: "Indian Ocean",
    teaser: "Overwater bungalows, crystal-clear lagoons, and some of the best snorkeling on earth. The Maldives is the ultimate luxury beach escape.",
    rating: 4.9,
    dateVisited: "Spring 2025",
    hasVideo: false,
    tags: ["Luxury", "Beach", "Overwater", "Snorkeling"],
  },
  {
    slug: "phuket-thailand",
    image: phuketImg,
    destination: "Phuket",
    country: "Thailand",
    region: "Southeast Asia",
    teaser: "Vibrant nightlife, stunning beaches, incredible street food, and temples perched on hillsides. Phuket offers something for every type of traveler.",
    rating: 4.5,
    dateVisited: "Fall 2025",
    hasVideo: false,
    tags: ["Beach", "Culture", "Budget", "Nightlife"],
  },
];

const regions = ["All", "Caribbean", "North America", "Europe", "Southeast Asia", "Indian Ocean", "Multiple"];

const Destinations = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState("All");
  const { suggestions } = useSearchSuggestions(query);
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredDestinations = destinations.filter((d) => {
    const regionMatch = selectedRegion === "All" || d.region === selectedRegion;
    const letterMatch = selectedLetter === "All" || d.destination.charAt(0).toUpperCase() === selectedLetter;
    return regionMatch && letterMatch;
  });

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setShowSuggestions(false);
    generateReview(trimmed);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    generateReview(name);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Hotel & Resort Reviews | Compare 10+ Sources"
        description="Explore curated reviews from real traveler experiences. Search any hotel, resort, or destination for honest, aggregated insights before you book."
        url="/destinations"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Destination Reviews",
            numberOfItems: destinations.length,
            itemListElement: destinations.map((d, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: d.destination,
              url: `https://reviewthengo.lovable.app/review/${d.slug}`,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://reviewthengo.lovable.app/destinations",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://reviewthengo.lovable.app/destinations?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          },
        ]}
        faq={[
          { question: "How does ReviewThenGo aggregate destination reviews?", answer: "We pull real traveler reviews from Google, TripAdvisor, Booking.com and more, then summarize pros, cons, and verdicts using AI." },
          { question: "Are ReviewThenGo destination reviews free?", answer: "Yes, all destination reviews on ReviewThenGo are completely free and ad-supported." },
        ]}
      />
      <Header />
      <AffiliateDisclosureBanner />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center pt-20">
          <img src={heroImg} alt="Aerial view of a Caribbean beach" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="text-primary">Real</span> Destination Reviews
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Explore curated reviews from real traveler experiences. Search any hotel, resort, or destination to generate a fresh AI-powered review.
            </p>
          </div>
        </section>

        {/* Search + Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex gap-2 relative">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search a hotel, resort, or destination..."
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-20">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          onMouseDown={() => handleSuggestionClick(s.name)}
                          className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground font-medium">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleSearch} disabled={isLoading || query.trim().length < 2} className="h-11 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Inline AI results */}
            <div ref={resultsRef}>
              <AIReviewResult
                review={review}
                isLoading={isLoading}
                error={error}
                onNewReview={() => { clearReview(); setQuery(""); }}
                onReviewReady={(slug) => navigate(`/review/${slug}`, { replace: true })}
              />
            </div>

            {/* Destinations Grid */}
            {!review && !isLoading && !error && (
              <>
                {/* Region Filter Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedRegion === region
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>

                {/* A-Z Letter Filter */}
                <div className="flex flex-wrap gap-1 mb-8">
                  {["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")].map((letter) => (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(letter)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                        selectedLetter === letter
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-8">
                  <p className="text-muted-foreground">
                    {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDestinations.map((dest, index) => (
                    <DestinationCard key={dest.slug} destination={dest} index={index} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
