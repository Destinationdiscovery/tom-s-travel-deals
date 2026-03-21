import { useEffect, useRef, useMemo } from "react";
import { Star, MapPin, Sparkles, Search, Camera, ExternalLink } from "lucide-react";
import ReviewLoadingStages from "@/components/ReviewLoadingStages";
import { Button } from "@/components/ui/button";
import AffiliateLinks from "@/components/AffiliateLinks";
import InlineAffiliateCTA from "@/components/InlineAffiliateCTA";
import SaveReviewButton from "@/components/SaveReviewButton";
import PhotoGallery from "@/components/review/PhotoGallery";
import ThingsToDoSection from "@/components/review/ThingsToDoSection";

import type { CachedReview } from "@/hooks/useGenerateReview";
import QuickVerdict from "@/components/QuickVerdict";

interface AIReviewResultProps {
  review: CachedReview | null;
  isLoading: boolean;
  error: string | null;
  onNewReview?: () => void;
  onReviewReady?: (slug: string) => void;
  affiliateUrl?: string;
}

const RatingBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}/5</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-700"
        style={{ width: `${(value / 5) * 100}%` }}
      />
    </div>
  </div>
);


const AIReviewResult = ({ review, isLoading, error, onNewReview, onReviewReady, affiliateUrl }: AIReviewResultProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const functionUrl = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return supabaseUrl ? `${supabaseUrl}/functions/v1/place-photos` : "";
  }, []);

  useEffect(() => {
    if ((review || isLoading) && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (review && !isLoading && onReviewReady) {
      onReviewReady(review.slug);
    }
  }, [review, isLoading]);

  if (!review && !isLoading && !error) return null;

  if (error) {
    return (
      <div ref={containerRef} className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-destructive/10 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Couldn't Generate Review
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div ref={containerRef} className="bg-background">
        <ReviewLoadingStages />
      </div>
    );
  }

  if (!review) return null;

  const data = review.review_data;
  const hasPhotos = data.photoReferences && data.photoReferences.length > 0;
  const hasThingsToDo = data.thingsToDo && data.thingsToDo.length > 0;

  return (
    <div ref={containerRef} className="bg-background animate-fade-up">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              {data.propertyName}
            </h2>
            {data.location && (
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {data.location}
              </p>
            )}
          </div>

          {/* Two-Column Grid */}
          <div className="grid lg:grid-cols-3 gap-10">
            {/* LEFT COLUMN – Main Content */}
            <div className="lg:col-span-2 flex flex-col gap-10">
              {/* 1. Summary Card */}
              <div className="bg-card rounded-2xl p-8 shadow-soft order-1">
                <div className="mb-6">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(data.overallRating)
                              ? "text-accent fill-accent"
                              : i < data.overallRating
                              ? "text-accent fill-accent opacity-50"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-lg font-bold text-foreground ml-2">
                        {data.overallRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
                      <Sparkles className="h-3.5 w-3.5" />
                      Compiled from Real Traveler Reviews
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    AI-curated summary drawn from hundreds of verified reviews across top travel platforms
                  </p>
                </div>
                <p className="text-lg text-foreground leading-relaxed">{data.summary}</p>
              </div>

              {/* 2. Photo Gallery */}
              {hasPhotos && (
                <div className="bg-card rounded-2xl p-6 shadow-soft order-2">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Photos
                  </h3>
                  <PhotoGallery
                    photoReferences={data.photoReferences!}
                    functionUrl={functionUrl}
                  />
                </div>
              )}

              {/* 3. Rating Breakdown (mobile only) */}
              <div className="lg:hidden order-3">
                <RatingsCard data={data} />
              </div>

              {/* 4. What Travelers Say */}
              <div className="space-y-6 order-4">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  What Travelers Say
                </h3>
                {data.reviewParagraphs?.map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* 5. Things to Do */}
              {hasThingsToDo && (
                <div className="order-5">
                  <ThingsToDoSection thingsToDo={data.thingsToDo!} functionUrl={functionUrl} propertyName={data.propertyName} />
                </div>
              )}

              {/* 6. Travel Tips */}
              {data.tips && data.tips.length > 0 && (
                <div className="bg-secondary/10 rounded-2xl p-8 order-6">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                    Travel Tips
                  </h3>
                  <ul className="space-y-4">
                    {data.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inline affiliate / custom CTA */}
              <div className="order-7">
                {affiliateUrl ? (
                  <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-display font-bold text-foreground text-lg">Ready to book?</p>
                      <p className="text-sm text-muted-foreground">Exclusive deal — book directly through our partner link.</p>
                    </div>
                    <a
                      href={affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      Book This Trip on Expedia
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <InlineAffiliateCTA propertyName={data.propertyName} variant="banner" />
                )}
              </div>



              {/* 8. Location Map (mobile only) */}
              <div className="lg:hidden order-8">
                <LocationMap data={data} />
              </div>

              {/* Affiliate Links (mobile only, hide for featured) */}
              {!affiliateUrl && (
                <div className="lg:hidden order-9">
                  <AffiliateLinks propertyName={data.propertyName} />
                </div>
              )}

              {/* 10. Save & New Review Buttons (mobile only) */}
              <div className="lg:hidden flex flex-col gap-3 order-10">
                <SaveReviewButton review={review} />
                {onNewReview && <NewSearchButton onNewReview={onNewReview} />}
              </div>
            </div>

            {/* RIGHT COLUMN – Sidebar (desktop only) */}
            <div className="hidden lg:flex flex-col gap-8">
              {/* Ratings Breakdown */}
              <RatingsCard data={data} />

              {/* Location Map */}
              <LocationMap data={data} />

              {/* Affiliate Links (hide for featured) */}
              {!affiliateUrl && <AffiliateLinks propertyName={data.propertyName} />}

              {/* Save to Compare */}
              <SaveReviewButton review={review} />

              {/* New Review Button */}
              {onNewReview && (
                <NewSearchButton onNewReview={onNewReview} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

function RatingsCard({ data }: { data: CachedReview["review_data"] }) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h3 className="font-display text-2xl font-bold text-foreground mb-6">
        Rating Breakdown
      </h3>
      <div className="space-y-4">
        {data.ratings &&
          Object.entries(data.ratings).map(([category, rating]) => (
            <RatingBar key={category} label={category} value={Number(rating)} />
          ))}
      </div>

      {data.bestFor && data.bestFor.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="font-semibold text-foreground mb-3">Best For</h4>
          <div className="flex flex-wrap gap-2">
            {data.bestFor.map((item) => (
              <span
                key={item}
                className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LocationMap({ data }: { data: CachedReview["review_data"] }) {
  if (!data.propertyName && !data.location) return null;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Location
      </h3>
      <div className="rounded-xl overflow-hidden border border-border">
        <iframe
          title="Destination map"
          width="100%"
          height="220"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(
            [data.propertyName, data.location].filter(Boolean).join(" ")
          )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
        />
      </div>
    </div>
  );
}

function NewSearchButton({ onNewReview }: { onNewReview: () => void }) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => {
        onNewReview();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="gap-2 w-full"
    >
      <Search className="h-4 w-4" />
      Search Another Property
    </Button>
  );
}

export default AIReviewResult;
