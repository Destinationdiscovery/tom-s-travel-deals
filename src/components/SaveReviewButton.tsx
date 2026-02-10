import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useSavedReviews, type SavedReview } from "@/hooks/useSavedReviews";
import type { CachedReview } from "@/hooks/useGenerateReview";
import AuthModal from "@/components/auth/AuthModal";

interface SaveReviewButtonProps {
  review: CachedReview;
}

const SaveReviewButton = ({ review }: SaveReviewButtonProps) => {
  const { addReview, removeReview, isSaved, canAddMore, count, isAuthenticated } = useSavedReviews();
  const { toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);

  const saved = isSaved(review.slug);
  const atLimit = !canAddMore && !saved;

  const handleClick = async () => {
    if (saved) {
      await removeReview(review.slug);
      toast({ title: "Removed from comparison", description: `${review.review_data.propertyName} removed.` });
      return;
    }

    // If anonymous and at limit, prompt sign-in
    if (atLimit && !isAuthenticated) {
      setAuthOpen(true);
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

    const added = await addReview(payload);
    if (added) {
      toast({
        title: "Saved for comparison!",
        description: isAuthenticated
          ? `${count + 1} saved — Compare when you're ready.`
          : `${count + 1}/5 — Sign in for unlimited saves.`,
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
      disabled={false}
      className="gap-2 w-full"
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : atLimit && !isAuthenticated ? "Sign in to Save More" : "Save to Compare"}
    </Button>
  );

  return (
    <>
      {atLimit && isAuthenticated ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>You've saved 5 reviews. Remove one to add another.</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        promptMessage="Sign in to save unlimited reviews, track your history, and organize trip lists."
      />
    </>
  );
};

export default SaveReviewButton;
