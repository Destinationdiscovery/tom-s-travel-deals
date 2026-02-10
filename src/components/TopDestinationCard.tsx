import { Star, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { buildDeepLinks, detectCountry } from "@/components/AffiliateLinks";
import type { ReviewData } from "@/hooks/useGenerateReview";

interface TopDestinationCardProps {
  propertyName: string;
  slug: string;
  reviewData: ReviewData;
}

const TopDestinationCard = ({ propertyName, slug, reviewData }: TopDestinationCardProps) => {
  const links = useMemo(() => buildDeepLinks(detectCountry(), propertyName), [propertyName]);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link to={`/review/${slug}`} className="hover:underline">
            <h3 className="font-display text-lg font-bold text-foreground">
              {propertyName}
            </h3>
          </Link>
          {reviewData.location && (
            <p className="text-sm text-muted-foreground">{reviewData.location}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="h-4 w-4 text-accent fill-accent" />
          <span className="font-bold text-foreground">{reviewData.overallRating}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {reviewData.summary}
      </p>

      {reviewData.bestFor && reviewData.bestFor.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {reviewData.bestFor.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-border text-xs">
        <Link to={`/review/${slug}`} className="text-primary hover:underline font-medium">
          Read full review
        </Link>
        <span className="text-border">|</span>
        <a href={links.expedia} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          Check rates <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default TopDestinationCard;
