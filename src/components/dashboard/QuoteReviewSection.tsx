import { Star, Sparkles, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface QuoteReviewSectionProps {
  reviewData: any;
}

const QuoteReviewSection = ({ reviewData }: QuoteReviewSectionProps) => {
  if (!reviewData) return null;

  const overallRating = reviewData.overall_rating || reviewData.overallRating || 0;
  const summary = reviewData.summary || "";
  const ratings = reviewData.ratings || {};
  const travelerParagraphs = reviewData.traveler_paragraphs || reviewData.travelerParagraphs || [];
  const tips = reviewData.tips || reviewData.travel_tips || [];
  const bestFor = reviewData.best_for || reviewData.bestFor || [];

  const ratingEntries = Object.entries(ratings).filter(([_, v]) => typeof v === "number") as [string, number][];

  return (
    <div className="space-y-4 border-b border-border pb-6">
      {/* Rating header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < Math.round(overallRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
          ))}
        </div>
        <span className="text-sm font-semibold text-foreground">{overallRating.toFixed(1)}</span>
        <Badge variant="secondary" className="gap-1 text-xs">
          <Sparkles className="h-3 w-3" /> Compiled from Real Traveler Reviews
        </Badge>
      </div>

      {/* Summary */}
      {summary && <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>}

      {/* Rating breakdown */}
      {ratingEntries.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Rating Breakdown</h4>
          <div className="space-y-2">
            {ratingEntries.map(([category, score]) => (
              <div key={category} className="flex items-center gap-3 text-sm">
                <span className="w-28 text-muted-foreground capitalize">{category}</span>
                <Progress value={(score / 5) * 100} className="flex-1 h-2" />
                <span className="w-8 text-right font-medium text-foreground">{score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traveler paragraphs */}
      {travelerParagraphs.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">What Travelers Say</h4>
          <div className="space-y-2">
            {travelerParagraphs.map((p: any, i: number) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {typeof p === "string" ? p : p.text || p.content || ""}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="h-4 w-4" /> Travel Tips
          </h4>
          <ol className="list-decimal list-inside space-y-1">
            {tips.map((tip: any, i: number) => (
              <li key={i} className="text-sm text-muted-foreground">
                {typeof tip === "string" ? tip : tip.text || tip.tip || ""}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Best for */}
      {bestFor.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-sm font-semibold text-foreground mr-1">Best For:</span>
          {bestFor.map((tag: string, i: number) => (
            <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteReviewSection;
