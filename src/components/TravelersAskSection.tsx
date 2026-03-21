import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const queries = [
  { label: "Best hotels in Paris real reviews", query: "best hotels in Paris" },
  { label: "Is Bali worth it 2026?", query: "Is Bali worth visiting" },
  { label: "Golf resorts honest feedback", query: "best golf resorts" },
  { label: "Caribbean all-inclusive reviews", query: "Caribbean all-inclusive resorts" },
  { label: "Tokyo hotels budget vs luxury", query: "Tokyo hotels budget vs luxury" },
  { label: "Best Airbnbs in NYC real reviews", query: "best Airbnbs in New York City" },
];

const TravelersAskSection = () => {
  const navigate = useNavigate();

  const handleClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
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
          {queries.map((q) => (
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
