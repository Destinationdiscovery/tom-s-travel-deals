import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import { Star } from "lucide-react";
import type { ReviewData } from "@/hooks/useGenerateReview";
import { MapPin } from "lucide-react";

const TopDestinations = () => {
  const { location } = useParams<{ location: string }>();
  const displayLocation = location ? location.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  useEffect(() => {
    document.title = `Top Resorts in ${displayLocation} | ReviewThenGo`;
  }, [displayLocation]);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["top-destinations", location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cached_reviews")
        .select("*")
        .ilike("location", `%${location}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!location,
  });

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    return [...reviews].sort((a, b) => {
      const rA = (a.review_data as unknown as ReviewData).overallRating || 0;
      const rB = (b.review_data as unknown as ReviewData).overallRating || 0;
      return rB - rA;
    });
  }, [reviews]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Top Resorts in ${displayLocation} | Travel Reviews`}
        description={`Compare the top-rated resorts and hotels in ${displayLocation}. AI-curated ratings from real traveler reviews across top booking platforms.`}
        url={`/top/${location}`}
        noindex
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: displayLocation,
          description: `Top-rated resorts and hotels in ${displayLocation} with aggregated traveler reviews`,
        }}
      />
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span>Top Destinations</span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3 flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              Top Resorts in {displayLocation}
            </h1>
            <p className="text-lg text-muted-foreground">
              AI-curated ratings compiled from real traveler reviews across top booking platforms.
            </p>
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6 animate-pulse h-40" />
              ))}
            </div>
          )}

          {!isLoading && sortedReviews.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No reviews found for "{displayLocation}" yet.
              </p>
              <Link to="/" className="text-primary hover:underline mt-2 inline-block">
                Search for a destination →
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {sortedReviews.map((review, index) => {
              const data = review.review_data as unknown as ReviewData;
              return (
                <div key={review.id} className="relative">
                  <span className="absolute -left-2 -top-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold z-10">
                    {index + 1}
                  </span>
                  <Link to={`/review/${review.slug}`} className="block bg-card rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {review.property_name}
                        </h3>
                        {data.location && (
                          <p className="text-sm text-muted-foreground">{data.location}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="h-4 w-4 text-accent fill-accent" />
                        <span className="font-bold text-foreground">{data.overallRating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{data.summary}</p>
                    {data.bestFor && data.bestFor.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {data.bestFor.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-primary font-medium mt-3 inline-block">Read full review →</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TopDestinations;
