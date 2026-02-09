import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useSavedReviews, type SavedReview } from "@/hooks/useSavedReviews";
import type { CachedReview } from "@/hooks/useGenerateReview";

interface SaveReviewButtonProps {
  review: CachedReview;
}

const SaveReviewButton = ({ review }: SaveReviewButtonProps) => {
  const { addReview, removeReview, isSaved, canAddMore, count } = useSavedReviews();
  const { toast } = useToast();

  const saved = isSaved(review.slug);
  const atLimit = !canAddMore && !saved;

  const handleClick = () => {
    if (saved) {
      removeReview(review.slug);
      toast({ title: "Removed from comparison", description: `${review.review_data.propertyName} removed.` });
      return;
    }

    const payload: SavedReview = {
      slug: review.slug,
      propertyName: review.review_data.propertyName,
      location: review.review_data.location ?? null,
      overallRating: review.review_data.overallRating,
      ratings: review.review_data.ratings,
      summary: review.review_data.summary,
      bestFor: review.review_data.bestFor ?? [],
      savedAt: new Date().toISOString(),
    };

    const added = addReview(payload);
    if (added) {
      toast({
        title: "Saved for comparison!",
        description: `${count + 1}/5 — Compare when you're ready.`,
      });
    } else {
      toast({
        title: "Limit reached",
        description: "Remove a saved review before adding another.",
        variant: "destructive",
      });
    }
  };

  const button = (
    <Button
      variant={saved ? "default" : "outline"}
      size="lg"
      onClick={handleClick}
      disabled={atLimit}
      className="gap-2 w-full"
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save to Compare"}
    </Button>
  );

  if (atLimit) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>You've saved 5 reviews. Remove one to add another.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export default SaveReviewButton;
