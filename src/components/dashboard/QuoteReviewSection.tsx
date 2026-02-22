import { useMemo } from "react";
import { Star, Sparkles, Lightbulb, MapPin, Camera } from "lucide-react";
import PhotoGallery from "@/components/review/PhotoGallery";

interface QuoteReviewSectionProps {
  reviewData: any;
  hideHeader?: boolean;
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

const QuoteReviewSection = ({ reviewData, hideHeader = false }: QuoteReviewSectionProps) => {
  const functionUrl = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return supabaseUrl ? `${supabaseUrl}/functions/v1/place-photos` : "";
  }, []);

  if (!reviewData) return null;

  const overallRating = reviewData.overall_rating || reviewData.overallRating || 0;
  const summary = reviewData.summary || "";
  const ratings = reviewData.ratings || {};
  const reviewParagraphs = reviewData.reviewParagraphs || reviewData.traveler_paragraphs || reviewData.travelerParagraphs || [];
  const tips = reviewData.tips || reviewData.travel_tips || [];
  const bestFor = reviewData.best_for || reviewData.bestFor || [];
  const propertyName = reviewData.propertyName || reviewData.property_name || "";
  const location = reviewData.location || "";
  const photoReferences = reviewData.photoReferences || [];
  const thingsToDo = reviewData.thingsToDo || [];

  const ratingEntries = Object.entries(ratings).filter(([_, v]) => typeof v === "number") as [string, number][];
  const hasPhotos = photoReferences.length > 0;
  const hasThingsToDo = thingsToDo.length > 0;

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header */}
      {!hideHeader && (
        <div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            {propertyName}
          </h2>
          {location && (
            <p className="text-muted-foreground text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
          )}
        </div>
      )}

      {/* Two-Column Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          {/* Summary Card */}
          <div className="bg-card rounded-2xl p-8 shadow-soft">
            <div className="mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(overallRating)
                          ? "text-accent fill-accent"
                          : i < overallRating
                          ? "text-accent fill-accent opacity-50"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-lg font-bold text-foreground ml-2">
                    {overallRating}
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
            {summary && <p className="text-lg text-foreground leading-relaxed">{summary}</p>}
          </div>

          {/* Photo Gallery */}
          {hasPhotos && (
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Photos
              </h3>
              <PhotoGallery photoReferences={photoReferences} functionUrl={functionUrl} />
            </div>
          )}

          {/* Rating Breakdown (mobile) */}
          <div className="lg:hidden">
            <RatingsCard ratingEntries={ratingEntries} bestFor={bestFor} />
          </div>

          {/* What Travelers Say */}
          {reviewParagraphs.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-bold text-foreground">
                What Travelers Say
              </h3>
              {reviewParagraphs.map((p: any, i: number) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {typeof p === "string" ? p : p.text || p.content || ""}
                </p>
              ))}
            </div>
          )}

          {/* Things to Do (no affiliate links) */}
          {hasThingsToDo && (
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                Things to Do Nearby
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {thingsToDo.slice(0, 3).map((activity: any, index: number) => {
                  const photoUrl = activity.photoReference && functionUrl
                    ? `${functionUrl}?name=${encodeURIComponent(activity.photoReference)}`
                    : null;
                  return (
                    <div key={index} className="bg-card rounded-2xl overflow-hidden shadow-soft flex flex-col">
                      {photoUrl && (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={photoUrl} alt={activity.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          {activity.category}
                        </span>
                        <h4 className="font-display text-lg font-bold text-foreground mb-1">{activity.name}</h4>
                        {activity.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < Math.floor(activity.rating)
                                    ? "text-accent fill-accent"
                                    : i < activity.rating
                                    ? "text-accent fill-accent opacity-50"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                            <span className="text-sm font-medium text-foreground ml-1">{activity.rating}</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Travel Tips */}
          {tips.length > 0 && (
            <div className="bg-secondary/10 rounded-2xl p-8">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                Travel Tips
              </h3>
              <ul className="space-y-4">
                {tips.map((tip: any, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="text-foreground">
                      {typeof tip === "string" ? tip : tip.text || tip.tip || ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Location Map (mobile) */}
          <div className="lg:hidden">
            <LocationMap propertyName={propertyName} location={location} />
          </div>
        </div>

        {/* RIGHT COLUMN (desktop) */}
        <div className="hidden lg:flex flex-col gap-8">
          <RatingsCard ratingEntries={ratingEntries} bestFor={bestFor} />
          <LocationMap propertyName={propertyName} location={location} />
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

function RatingsCard({ ratingEntries, bestFor }: { ratingEntries: [string, number][]; bestFor: string[] }) {
  if (ratingEntries.length === 0 && bestFor.length === 0) return null;
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      {ratingEntries.length > 0 && (
        <>
          <h3 className="font-display text-2xl font-bold text-foreground mb-6">Rating Breakdown</h3>
          <div className="space-y-4">
            {ratingEntries.map(([category, rating]) => (
              <RatingBar key={category} label={category} value={rating} />
            ))}
          </div>
        </>
      )}
      {bestFor.length > 0 && (
        <div className={ratingEntries.length > 0 ? "mt-8 pt-6 border-t border-border" : ""}>
          <h4 className="font-semibold text-foreground mb-3">Best For</h4>
          <div className="flex flex-wrap gap-2">
            {bestFor.map((item: string) => (
              <span key={item} className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LocationMap({ propertyName, location }: { propertyName: string; location: string }) {
  if (!propertyName && !location) return null;
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
            [propertyName, location].filter(Boolean).join(" ")
          )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
        />
      </div>
    </div>
  );
}

export default QuoteReviewSection;
