import { CheckCircle, XCircle, Users } from "lucide-react";

interface QuickVerdictProps {
  propertyName: string;
  overallRating: number;
  ratings: Record<string, number>;
  bestFor?: string[];
  location?: string;
}

const QuickVerdict = ({ propertyName, overallRating, ratings, bestFor, location }: QuickVerdictProps) => {
  const entries = Object.entries(ratings).sort((a, b) => b[1] - a[1]);
  const pros = entries.slice(0, 3);
  const cons = entries.slice(-3).reverse();

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-primary/20">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Quick Verdict</span>
      </div>
      <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-1">
        {propertyName}{location ? `, ${location}` : ""}
      </h3>
      <p className="text-2xl font-bold text-primary mb-4">{overallRating}/5 Overall</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Pros */}
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Top Pros
          </h4>
          <ul className="space-y-1">
            {pros.map(([label, val]) => (
              <li key={label} className="text-sm text-muted-foreground">
                • <span className="capitalize font-medium text-foreground">{label}</span>: {val}/5
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-destructive" />
            Areas to Watch
          </h4>
          <ul className="space-y-1">
            {cons.map(([label, val]) => (
              <li key={label} className="text-sm text-muted-foreground">
                • <span className="capitalize font-medium text-foreground">{label}</span>: {val}/5
              </li>
            ))}
          </ul>
        </div>
      </div>

      {bestFor && bestFor.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            Worth Booking If
          </h4>
          <ul className="space-y-1">
            {bestFor.slice(0, 3).map((item) => (
              <li key={item} className="text-sm text-muted-foreground">• {item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Sources: AI-curated from verified reviews across Google, TripAdvisor, Booking.com & more
      </p>
    </div>
  );
};

export default QuickVerdict;
