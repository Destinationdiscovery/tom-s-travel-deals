import { useEffect, useState } from "react";
import { Database, Building2, Wrench, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StatCard {
  icon: typeof Database;
  number: string;
  label: string;
  context: string;
}

const AggregateStatsSection = () => {
  const [propertyCount, setPropertyCount] = useState<string>("2,450+");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { count } = await supabase
          .from("cached_reviews")
          .select("*", { count: "exact", head: true });
        if (!cancelled && typeof count === "number" && count > 0) {
          // Round down to nearest 50 and format
          const rounded = Math.max(50, Math.floor(count / 50) * 50);
          setPropertyCount(`${rounded.toLocaleString()}+`);
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats: StatCard[] = [
    {
      icon: Database,
      number: "10M+",
      label: "Reviews Indexed",
      context: "Across 10+ trusted sources",
    },
    {
      icon: Building2,
      number: propertyCount,
      label: "Properties Analyzed",
      context: "Hotels, resorts, and rentals worldwide",
    },
    {
      icon: Wrench,
      number: "8",
      label: "Free Planning Tools",
      context: "No signup, no paywall",
    },
    {
      icon: ShieldCheck,
      number: "100%",
      label: "Independent",
      context: "No pay-for-placement, ever",
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Trusted by Travelers
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Real numbers from a real travel planning platform. No fluff, no fake reviews.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-card rounded-2xl border border-border p-6 shadow-soft text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {s.number}
                </div>
                <p className="font-semibold text-foreground text-sm mb-1">{s.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.context}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AggregateStatsSection;
