import { Link } from "@/lib/router-compat";
import { ArrowRight, Map, Calendar, ShieldCheck, Plane, DollarSign, Brain, Luggage, Search } from "lucide-react";

interface CompassArticleToolsCTAProps {
  title: string;
  category?: string;
  tags?: string[];
}

const ALL_TOOLS = [
  { key: "itinerary", to: "/itinerary", label: "Itinerary Builder", icon: Map, description: "Build a day-by-day trip plan" },
  { key: "best-time", to: "/best-time", label: "Best Time to Visit", icon: Calendar, description: "Weather, crowds, prices" },
  { key: "safety", to: "/safety", label: "Safety Scores", icon: ShieldCheck, description: "Safety ratings & scam alerts" },
  { key: "flights", to: "/flights", label: "Flight Deals", icon: Plane, description: "Search current flight pricing" },
  { key: "currency", to: "/currency", label: "Currency Tracker", icon: DollarSign, description: "Live exchange rates" },
  { key: "intel", to: "/travel-intel", label: "Know Before You Go", icon: Brain, description: "Visa & entry requirements" },
  { key: "gear", to: "/gear", label: "Trip Packing Toolkit", icon: Luggage, description: "Weather-aware packing list" },
  { key: "reviews", to: "/", label: "AI Hotel Reviews", icon: Search, description: "Aggregated from 10+ sources" },
] as const;

const KEYWORD_MAP: Record<string, string[]> = {
  itinerary: ["itinerary", "day", "trip plan", "things to do", "guide", "explore"],
  "best-time": ["best time", "season", "weather", "month", "when to", "winter", "summer"],
  safety: ["safety", "safe", "scam", "crime", "danger", "advisory", "solo"],
  flights: ["flight", "airline", "airfare", "fly", "airport"],
  currency: ["currency", "exchange", "money", "cash", "atm"],
  intel: ["visa", "entry", "passport", "requirement", "border", "insurance"],
  gear: ["pack", "packing", "luggage", "bag", "carry-on", "gear", "what to bring"],
  reviews: ["resort", "hotel", "review", "all-inclusive", "stay", "accommodation"],
};

function pickRelevantTools(title: string, category?: string, tags?: string[]): typeof ALL_TOOLS[number][] {
  const haystack = [title, category || "", ...(tags || [])].join(" ").toLowerCase();
  const scored = ALL_TOOLS.map((tool) => {
    const keywords = KEYWORD_MAP[tool.key] || [];
    const score = keywords.reduce((acc, kw) => (haystack.includes(kw) ? acc + 1 : acc), 0);
    return { tool, score };
  }).sort((a, b) => b.score - a.score);

  const matches = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.tool);
  if (matches.length >= 2) return matches;

  // Fallback defaults: itinerary + best-time + reviews
  const fallback = [ALL_TOOLS[0], ALL_TOOLS[1], ALL_TOOLS[7]];
  return Array.from(new Set([...matches, ...fallback])).slice(0, 3);
}

const CompassArticleToolsCTA = ({ title, category, tags }: CompassArticleToolsCTAProps) => {
  const tools = pickRelevantTools(title, category, tags);
  if (tools.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl shadow-soft p-8 md:p-10 mt-8 border border-primary/10">
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">
        Plan This Trip With Our Free Tools
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Hand-picked tools to turn this article into an actual trip.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.key}
              to={tool.to}
              className="group block bg-background rounded-xl border border-border p-4 hover:border-primary/40 hover:shadow-soft transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm mb-0.5 flex items-center gap-1">
                    {tool.label}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CompassArticleToolsCTA;
