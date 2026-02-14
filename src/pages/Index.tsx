import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, Loader2, X, Compass } from "lucide-react";
import Header from "@/components/Header";
import HeroSection, { type SearchType } from "@/components/HeroSection";
import AIReviewResult from "@/components/AIReviewResult";
import RecentlyReviewedSection from "@/components/RecentlyReviewedSection";
import ComparisonFloatingBadge from "@/components/ComparisonFloatingBadge";
import Footer from "@/components/Footer";
import SearchLoadingStages from "@/components/SearchLoadingStages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useGenerateReview } from "@/hooks/useGenerateReview";
import { useTravelIntel, type IntelType } from "@/hooks/useTravelIntel";
import { useGearIntel } from "@/hooks/useGearIntel";
import { useTravelSearch, type SearchResult } from "@/hooks/useTravelSearch";
import { IntelLoading, RequirementsResult, AdvisoriesResult, NewsResult } from "@/components/intel/IntelResults";
import { GearLoading, PackingResultCard, ProductReviewPanel, GearCitations } from "@/components/gear/GearResults";

const Index = () => {
  const { review, isLoading, error, generateReview, clearReview } = useGenerateReview();
  const navigate = useNavigate();
  const intel = useTravelIntel();
  const gear = useGearIntel();
  const travelSearch = useTravelSearch();
  const [reviewingName, setReviewingName] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const [activeSearchType, setActiveSearchType] = useState<SearchType>("destination");

  // Requirements special case: citizenship prompt
  const [requiresCitizenship, setRequiresCitizenship] = useState(false);
  const [citizenshipInput, setCitizenshipInput] = useState("");
  const [pendingDestination, setPendingDestination] = useState("");

  const scrollToResults = () => {
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  const handleSearch = async (propertyName: string) => {
    clearAllResults();
    scrollToResults();
    await generateReview(propertyName);
  };

  const clearAllResults = () => {
    clearReview();
    intel.clearAll();
    gear.clearAll();
    travelSearch.clearResults();
    setReviewingName(null);
  };

  const handleInlineSearch = (type: SearchType, query: string) => {
    setActiveSearchType(type);
    setRequiresCitizenship(false);
    clearAllResults();
    scrollToResults();

    if (type === "search") {
      travelSearch.search(query);
    } else if (type === "gear") {
      gear.clearReview();
      gear.fetchPackingList(query);
    } else if (type === "advisories") {
      intel.fetchIntel("advisories", query);
    } else if (type === "news") {
      intel.fetchIntel("news", query);
    } else if (type === "requirements") {
      // Parse "X to Y" pattern
      const match = query.match(/^(.+?)\s+to\s+(.+)$/i);
      if (match) {
        intel.fetchIntel("requirements", match[2].trim(), match[1].trim());
      } else {
        // Need citizenship - show prompt
        setPendingDestination(query);
        setRequiresCitizenship(true);
      }
    }
  };

  const handleCitizenshipSubmit = () => {
    if (citizenshipInput.trim().length >= 2) {
      setRequiresCitizenship(false);
      intel.fetchIntel("requirements", pendingDestination, citizenshipInput.trim());
    }
  };

  const handleSearchTypeChange = () => {
    clearAllResults();
    setRequiresCitizenship(false);
    setCitizenshipInput("");
    setActiveSearchType("destination");
  };

  const handleGearReview = (productName: string) => {
    gear.fetchProductReview(productName);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };


  const handleReviewFromSearch = async (result: SearchResult) => {
    setReviewingName(result.name);
    try {
      const { data, error: fnError } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke("generate-review", {
        body: { propertyName: result.name },
      });
      if (fnError || data?.error) throw new Error(fnError?.message || data?.error);
      if (data?.review?.slug) {
        navigate(`/review/${data.review.slug}`, { replace: true });
      }
    } catch {
      navigate(`/?search=${encodeURIComponent(result.name)}`);
    } finally {
      setReviewingName(null);
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < full ? "fill-amber-400 text-amber-400" : i === full && half ? "fill-amber-400/50 text-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-muted-foreground">{rating}</span>
      </div>
    );
  };

  const isAnyLoading = isLoading || intel.loading || gear.loading || travelSearch.isLoading;
  const hasIntelResults = intel.requirementsData || intel.advisoriesData || intel.newsData;
  const hasGearResults = gear.packingData || gear.reviewData;
  const hasSearchResults = travelSearch.results.length > 0 || travelSearch.activities.length > 0;
  const hasAnyResults = review || error || hasIntelResults || hasGearResults || hasSearchResults || requiresCitizenship;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection
          onSearch={handleSearch}
          isSearching={isLoading}
          onInlineSearch={handleInlineSearch}
          onSearchTypeChange={handleSearchTypeChange}
        />

        <div ref={resultsRef}>
        {/* Destination Review Results */}
        <AIReviewResult
          review={review}
          isLoading={isLoading}
          error={error}
          onNewReview={clearReview}
          onReviewReady={(slug) => navigate(`/review/${slug}`, { replace: true })}
        />

        {/* Citizenship prompt for requirements */}
        {requiresCitizenship && (
          <div className="container mx-auto px-4 py-10 max-w-xl">
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold mb-3">What's your citizenship?</h3>
              <p className="text-sm text-muted-foreground mb-4">We need your citizenship to check entry requirements for {pendingDestination}.</p>
              <div className="flex gap-3">
                <Input
                  placeholder="e.g. Canada, USA, UK..."
                  value={citizenshipInput}
                  onChange={(e) => setCitizenshipInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCitizenshipSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleCitizenshipSubmit} disabled={citizenshipInput.trim().length < 2}>
                  Check
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Intel Results (advisories, requirements, news) */}
        {intel.loading && (
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <IntelLoading type={activeSearchType as IntelType} />
          </div>
        )}
        {!intel.loading && intel.requirementsData && (
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <RequirementsResult data={intel.requirementsData} />
          </div>
        )}
        {!intel.loading && intel.advisoriesData && (
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <AdvisoriesResult data={intel.advisoriesData} />
          </div>
        )}
        {!intel.loading && intel.newsData && (
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <NewsResult data={intel.newsData} />
          </div>
        )}

        {/* Intel Error */}
        {intel.error && (
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{intel.error}</div>
          </div>
        )}

        {/* Gear Results */}
        {gear.loading && !gear.packingData && (
          <div className="container mx-auto px-4 py-10">
            <GearLoading label="Building your packing list..." />
          </div>
        )}
        {gear.reviewLoading && (
          <div className="container mx-auto px-4 py-10">
            <GearLoading label="Researching product reviews..." />
          </div>
        )}
        {gear.reviewData && !gear.reviewLoading && (
          <div className="container mx-auto px-4 py-10">
            <ProductReviewPanel review={gear.reviewData} onBack={gear.clearReview} />
          </div>
        )}
        {gear.packingData && !gear.reviewData && !gear.reviewLoading && (
          <div className="container mx-auto px-4 py-10">
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your Packing List</h2>
                <p className="text-muted-foreground">Click "Review This" on any item for a full product review based on real Amazon reviews.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {gear.packingData.items.map((item, i) => (
                  <PackingResultCard key={i} item={item} onReview={handleGearReview} />
                ))}
              </div>
              <GearCitations citations={gear.packingData.citations} />
              <p className="text-xs text-muted-foreground text-center mt-4">Amazon links may earn us a commission at no extra cost to you.</p>
            </div>
          </div>
        )}
        {gear.error && (
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{gear.error}</div>
          </div>
        )}

        {/* Destination Search Results */}
        {travelSearch.isLoading && <SearchLoadingStages />}
        {travelSearch.error && (
          <div className="container mx-auto px-4 py-6 max-w-2xl">
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{travelSearch.error}</div>
          </div>
        )}
        {!travelSearch.isLoading && hasSearchResults && (
          <section className="container mx-auto px-4 py-10 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {travelSearch.results.length} properties found
              </p>
              <Button variant="ghost" size="sm" onClick={travelSearch.clearResults} className="gap-1.5">
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {travelSearch.results.map((result, i) => {
                const isReviewing = reviewingName === result.name;
                return (
                  <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg leading-tight truncate">{result.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{result.location}</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-primary whitespace-nowrap">{result.priceRange}</span>
                      </div>
                      {renderStars(result.rating)}
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{result.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.bestFor.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleReviewFromSearch(result)}
                        disabled={isReviewing}
                        className="w-full mt-auto"
                      >
                        {isReviewing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating Review...
                          </>
                        ) : (
                          "Review It"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {/* Things to Do Section */}
            {travelSearch.activities.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-6">
                  <Compass className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl font-bold text-foreground">Things to Do</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {travelSearch.activities.map((activity, i) => (
                    <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-5 flex flex-col gap-3 h-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg leading-tight truncate">{activity.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">{activity.location}</span>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-primary whitespace-nowrap">{activity.priceRange}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                          {renderStars(activity.rating)}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{activity.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activity.bestFor.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {travelSearch.citations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {travelSearch.citations.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[250px]">
                      [{i + 1}] {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {!hasAnyResults && !isAnyLoading && !gear.reviewLoading && <RecentlyReviewedSection />}
        </div>
      </main>
      <ComparisonFloatingBadge />
      <Footer />
    </div>
  );
};

export default Index;
