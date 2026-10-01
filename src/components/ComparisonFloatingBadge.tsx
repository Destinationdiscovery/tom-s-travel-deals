import { Link } from "@/lib/router-compat";
import { Heart } from "lucide-react";
import { useSavedReviews } from "@/hooks/useSavedReviews";

const ComparisonFloatingBadge = () => {
  const { count } = useSavedReviews();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-fade-up">
      <Link
        to="/my-saves"
        className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-105 font-medium text-sm"
      >
        <Heart className="h-4 w-4 fill-current" />
        <span>{count}/5 saved</span>
        {count >= 2 && (
          <span className="ml-1 border-l border-primary-foreground/30 pl-2">
            Compare Now
          </span>
        )}
      </Link>
    </div>
  );
};

export default ComparisonFloatingBadge;
