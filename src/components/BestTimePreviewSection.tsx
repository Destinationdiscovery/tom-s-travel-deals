import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Sun, Cloud, Snowflake } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const chips = [
  { label: "Japan", query: "Japan", icon: Snowflake },
  { label: "Bali", query: "Bali", icon: Sun },
  { label: "Paris", query: "Paris", icon: Cloud },
];

const BestTimePreviewSection = () => (
  <section className="py-12 bg-background">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Best Time to Visit
        </h2>
        <Link to="/best-time" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          Find your perfect window <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-muted-foreground mb-6 max-w-xl">Weather, crowds, and flight prices — find the cheapest and best months for any destination.</p>
      <div className="flex flex-wrap gap-3">
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <Link key={chip.query} to={`/best-time?q=${encodeURIComponent(chip.query)}`}>
              <Badge variant="outline" className="px-4 py-2 text-sm gap-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                <Icon className="h-4 w-4" />
                {chip.label}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default BestTimePreviewSection;
