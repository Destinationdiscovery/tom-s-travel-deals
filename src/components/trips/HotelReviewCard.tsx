import { Star } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

interface Review {
  overall_rating?: number | null;
  verdict?: string | null;
  pros?: string[] | null;
  cons?: string[] | null;
  notes?: string | null;
  stayed_from?: string | null;
  stayed_to?: string | null;
}

const safeDate = (s?: string | null) => {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? format(d, "MMM d, yyyy") : null;
};

const HotelReviewCard = ({ review, authorName }: { review: Review; authorName?: string | null }) => {
  const rating = review.overall_rating ?? 0;
  const from = safeDate(review.stayed_from);
  const to = safeDate(review.stayed_to);
  const stay = from && to ? `${from} to ${to}` : from ?? to ?? null;

  return (
    <div className="mt-3 border-l-2 border-primary/50 bg-primary/5 rounded-r-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {authorName ? `${authorName}'s stay review` : "Traveler's stay review"}
          </span>
          {rating > 0 && (
            <span className="flex items-center gap-0.5 text-sm font-medium">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`h-3.5 w-3.5 ${n <= rating ? "text-accent fill-accent" : "text-muted-foreground/40"}`} />
              ))}
              <span className="ml-1">{rating}</span>
            </span>
          )}
        </div>
        {stay && <span className="text-xs text-muted-foreground">Stayed {stay}</span>}
      </div>
      {review.verdict && <p className="text-sm font-medium text-foreground italic">"{review.verdict}"</p>}
      {((review.pros?.length ?? 0) > 0 || (review.cons?.length ?? 0) > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {(review.pros?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Loved</p>
              <ul className="text-sm text-foreground space-y-0.5">
                {review.pros!.map((p, i) => <li key={i}>+ {p}</li>)}
              </ul>
            </div>
          )}
          {(review.cons?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold text-destructive mb-1">Watch out</p>
              <ul className="text-sm text-foreground space-y-0.5">
                {review.cons!.map((c, i) => <li key={i}>- {c}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      {review.notes && <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{review.notes}</p>}
    </div>
  );
};

export default HotelReviewCard;
