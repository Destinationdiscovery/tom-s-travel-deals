import { useEffect, useRef, useMemo } from "react";
import { Star, MapPin, Sparkles, Search, Camera, Compass } from "lucide-react";
import ReviewLoadingStages from "@/components/ReviewLoadingStages";
import { Button } from "@/components/ui/button";
import AffiliateLinks, { EXPEDIA_LINKS, HOTELS_LINKS, VRBO_LINK, detectCountry } from "@/components/AffiliateLinks";
import SaveReviewButton from "@/components/SaveReviewButton";
import PhotoGallery from "@/components/review/PhotoGallery";
import ThingsToDoSection from "@/components/review/ThingsToDoSection";
import type { CachedReview } from "@/hooks/useGenerateReview";

interface AIReviewResultProps {
  review: CachedReview | null;
  isLoading: boolean;
  error: string | null;
  onNewReview?: () => void;
  onReviewReady?: (slug: string) => void;
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


const AIReviewResult = ({ review, isLoading, error, onNewReview, onReviewReady }: AIReviewResultProps) => {
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
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
              <Sparkles className="h-4 w-4" />
              Compiled from Real Traveler Reviews
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              AI-curated summary drawn from hundreds of verified reviews across top travel platforms
            </p>
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
                <div className="flex items-center gap-4 mb-6">
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
                  <ThingsToDoSection thingsToDo={data.thingsToDo!} />
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

              {/* 6b. Plan Your Trip CTA */}
              <div className="order-[6.5]">
                <PlanYourTripCTA />
              </div>

              {/* 7. Location Map (mobile only) */}
              <div className="lg:hidden order-7">
                <LocationMap data={data} />
              </div>

              {/* 8. Affiliate Links (mobile only) */}
              <div className="lg:hidden order-8">
                <AffiliateLinks />
              </div>

              {/* 9. Save & New Review Buttons (mobile only) */}
              <div className="lg:hidden flex flex-col gap-3 order-9">
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

              {/* Affiliate Links */}
              <AffiliateLinks />

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

function PlanYourTripCTA() {
  const country = useMemo(() => detectCountry(), []);
  const links = [
    { name: "Expedia", url: EXPEDIA_LINKS[country] },
    { name: "Hotels.com", url: HOTELS_LINKS[country] },
    { name: "VRBO", url: VRBO_LINK },
  ];

  return (
    <div className="rounded-2xl border-l-4 border-primary bg-primary/5 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">Plan Your Trip</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Found what you're looking for? Compare rates and book with confidence.
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {links.map((link, i) => (
          <span key={link.name} className="flex items-center gap-x-4">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              {link.name}
            </a>
            {i < links.length - 1 && (
              <span className="text-border">|</span>
            )}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Links may earn us a commission at no extra cost to you.
      </p>
    </div>
  );
}

export default AIReviewResult;
