import { Database, Users, Sparkles, CalendarCheck } from "lucide-react";

const badges = [
  { icon: Users, label: "10+ Review Sources Aggregated" },
  { icon: Database, label: "10M+ Reviews Indexed" },
  { icon: Sparkles, label: "100% Free, No Account Required" },
  { icon: CalendarCheck, label: "Updated Monthly" },
];

const TrustBadges = () => (
  <section className="py-4 bg-card border-b border-border/50">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default TrustBadges;
