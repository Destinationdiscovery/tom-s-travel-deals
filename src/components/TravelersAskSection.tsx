import { useMemo } from "react";
import { useNavigate } from "@/lib/router-compat";
import { ArrowRight, Star, Luggage, Calendar, Heart } from "lucide-react";

type QueryType = "review" | "packing" | "besttime";

interface QueryItem {
  label: string;
  path: string;
  type: QueryType;
  saves: number;
}

const ALL_QUERIES: QueryItem[] = [
  // Reviews
  { label: "Best hotels in Paris real reviews", path: "/reviews/best-hotels-paris", type: "review", saves: 1247 },
  { label: "Is Bali worth it 2026?", path: "/reviews/is-bali-worth-it-2026", type: "review", saves: 983 },
  { label: "Golf resorts real reviews", path: "/reviews/best-golf-resorts", type: "review", saves: 612 },
  { label: "Caribbean all-inclusive reviews", path: "/reviews/caribbean-all-inclusive-resorts", type: "review", saves: 1534 },
  { label: "Tokyo hotels budget vs luxury", path: "/reviews/tokyo-hotels-budget-vs-luxury", type: "review", saves: 876 },
  { label: "Adults-only Punta Cana resorts", path: "/reviews/adults-only-punta-cana-resorts", type: "review", saves: 1102 },
  { label: "Beach resorts Cancun reviews", path: "/reviews/beach-resorts-cancun", type: "review", saves: 1389 },
  { label: "Family resorts Jamaica reviews", path: "/reviews/family-resorts-jamaica", type: "review", saves: 921 },
  // Trip Planner
  { label: "Cancun beach trip packing list", path: "/gear?q=Cancun+beach+trip+August", type: "packing", saves: 742 },
  { label: "Italy August wedding trip packing", path: "/gear?q=Italy+August+wedding+trip", type: "packing", saves: 534 },
  { label: "Japan ski week essentials", path: "/gear?q=Japan+ski+week+essentials", type: "packing", saves: 418 },
  { label: "Europe backpack trip must-haves", path: "/gear?q=Europe+backpack+trip", type: "packing", saves: 893 },
  // Best Time
  { label: "Best time to visit Japan", path: "/best-time?q=Japan", type: "besttime", saves: 1567 },
  { label: "Best time to visit Bali", path: "/best-time?q=Bali", type: "besttime", saves: 1203 },
  { label: "Best time to visit Paris", path: "/best-time?q=Paris", type: "besttime", saves: 1451 },
  { label: "Best time to visit Thailand", path: "/best-time?q=Thailand", type: "besttime", saves: 1089 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = temp;
  }
  return a;
}

const typeConfig: Record<QueryType, { icon: typeof Star; label: string; color: string }> = {
  review: { icon: Star, label: "Review", color: "text-secondary" },
  packing: { icon: Luggage, label: "Packing", color: "text-primary" },
  besttime: { icon: Calendar, label: "Best Time", color: "text-emerald-500" },
};

const TravelersAskSection = () => {
  const navigate = useNavigate();
  const visible = useMemo(() => shuffle(ALL_QUERIES).slice(0, 8), []);

  const handleClick = (path: string) => {
    navigate(path);
  };

  return (
    <section className="py-16 md:py-20 bg-card/50" aria-labelledby="travelers-ask-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 id="travelers-ask-heading" className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
            Common Travel Questions Answered
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Reviews, packing lists, best times to visit, tap any question for an instant AI-powered answer.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {visible.map((q) => {
            const cfg = typeConfig[q.type];
            const Icon = cfg.icon;
            return (
              <button
                key={q.label}
                onClick={() => handleClick(q.path)}
                className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {q.label}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                  <Heart className="h-3 w-3" />
                  <span>{q.saves.toLocaleString()} saved</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TravelersAskSection;
