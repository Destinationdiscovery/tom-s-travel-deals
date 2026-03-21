import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ALL_QUERIES = [
  { label: "Best hotels in Paris real reviews", query: "best-hotels-paris" },
  { label: "Is Bali worth it 2026?", query: "is-bali-worth-it-2026" },
  { label: "Golf resorts honest feedback", query: "best-golf-resorts" },
  { label: "Caribbean all-inclusive reviews", query: "caribbean-all-inclusive-resorts" },
  { label: "Tokyo hotels budget vs luxury", query: "tokyo-hotels-budget-vs-luxury" },
  { label: "Best Airbnbs in NYC real reviews", query: "best-airbnbs-new-york-city" },
  { label: "Adults-only Punta Cana resorts", query: "adults-only-punta-cana-resorts" },
  { label: "Beach resorts Cancun reviews", query: "beach-resorts-cancun" },
  { label: "Boutique hotels Barcelona", query: "boutique-hotels-barcelona" },
  { label: "Family resorts Jamaica reviews", query: "family-resorts-jamaica" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TravelersAskSection = () => {
  const navigate = useNavigate();
  const visible = useMemo(() => shuffle(ALL_QUERIES).slice(0, 6), []);

  const handleClick = (slug: string) => {
    navigate(`/reviews/${slug}`);
  };

  return (
    <section className="py-16 md:py-20 bg-card/50" aria-labelledby="travelers-ask-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 id="travelers-ask-heading" className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
            What Travelers Ask Us
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            These are the most popular questions travelers search before booking. Tap any to get instant insights.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {visible.map((q) => (
            <button
              key={q.label}
              onClick={() => handleClick(q.query)}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                "{q.label}"
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelersAskSection;
