import { Link } from "react-router-dom";
import { ArrowRight, Map, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const chips = [
  { label: "Tokyo 5 days", query: "Tokyo 5 days budget" },
  { label: "Paris weekend", query: "Paris weekend trip" },
  { label: "Bali 7 days", query: "Bali 7 day adventure" },
];

const ItineraryPreviewSection = () => (
  <section className="py-12 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          Itinerary Builder
        </h2>
        <Link to="/itinerary" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          Build your itinerary <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-muted-foreground mb-6 max-w-xl">Day-by-day plans with activities, restaurants, and costs, powered by AI.</p>
      <div className="flex flex-wrap gap-3">
        {chips.map((chip) => (
          <Link key={chip.query} to={`/itinerary?q=${encodeURIComponent(chip.query)}`}>
            <Badge variant="outline" className="px-4 py-2 text-sm gap-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              <MapPin className="h-4 w-4" />
              {chip.label}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default ItineraryPreviewSection;
