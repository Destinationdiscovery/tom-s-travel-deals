import { Shield, MapPin, Award, Users } from "lucide-react";

const badges = [
  { icon: Shield, label: "100% Real Reviews" },
  { icon: MapPin, label: "Canadian Traveler Focused" },
  { icon: Award, label: "Expedia Partner" },
  { icon: Users, label: "10,000+ Travelers Helped" },
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
