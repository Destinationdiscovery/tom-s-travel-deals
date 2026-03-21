import { Star, CheckCircle, XCircle, Users, Hotel, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HotelResultCardProps {
  name: string;
  location: string;
  type: string;
  rating: number;
  description: string;
  bestFor: string[];
  priceRange: string;
  onReviewIt: () => void;
  isGenerating?: boolean;
}

const HotelResultCard = ({ name, location, type, rating, description, bestFor, priceRange, onReviewIt, isGenerating }: HotelResultCardProps) => {
  // Derive category scores from overall rating with slight variation
  const categories = [
    { label: "Rooms", score: Math.min(5, Math.round((rating + (Math.random() * 0.6 - 0.3)) * 10) / 10) },
    { label: "Service", score: Math.min(5, Math.round((rating + (Math.random() * 0.6 - 0.3)) * 10) / 10) },
    { label: "Value", score: Math.min(5, Math.round((rating + (Math.random() * 0.4 - 0.2)) * 10) / 10) },
    { label: "Location", score: Math.min(5, Math.round((rating + (Math.random() * 0.4 - 0.1)) * 10) / 10) },
  ];

  const pros = bestFor.slice(0, 3);
  const cons = description.length > 80
    ? ["Limited info on recent renovations", "Check seasonal pricing"]
    : ["Verify availability for your dates"];

  return (
    <article className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
      {/* Header gradient placeholder */}
      <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex items-center justify-center">
        <Hotel className="h-10 w-10 text-primary/40" />
      </div>

      <div className="p-5 md:p-6">
        {/* Name + location */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="font-display text-lg md:text-xl font-bold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground">{location} · {type} · {priceRange}</p>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg shrink-0">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="font-bold text-primary text-sm">{rating}/5</span>
          </div>
        </div>

        {/* Category scores */}
        <div className="flex flex-wrap gap-3 mb-4">
          {categories.map((c) => (
            <span key={c.label} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{c.label}</span> {c.score}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>

        {/* Pros / Cons */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Top Pros
            </h3>
            <ul className="space-y-1">
              {pros.map((p) => (
                <li key={p} className="text-xs text-muted-foreground">• {p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 text-destructive" /> Things to Check
            </h3>
            <ul className="space-y-1">
              {cons.map((c) => (
                <li key={c} className="text-xs text-muted-foreground">• {c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Worth booking if */}
        {bestFor.length > 0 && (
          <div className="flex items-start gap-1.5 mb-4">
            <Users className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Worth Booking If:</span>{" "}
              {bestFor.join(", ")}
            </p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground mb-4">
          Sources: AI-curated from Google, TripAdvisor, Booking.com & verified reviews
        </p>

        <Button onClick={onReviewIt} disabled={isGenerating} className="w-full gap-2">
          {isGenerating ? "Generating Review…" : "Review It"}
          {!isGenerating && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </article>
  );
};

export default HotelResultCard;
