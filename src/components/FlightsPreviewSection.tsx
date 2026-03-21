import { Link } from "react-router-dom";
import { ArrowRight, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const chips = [
  { label: "NYC → Paris", query: "NYC to Paris" },
  { label: "LA → Tokyo", query: "LA to Tokyo" },
  { label: "Toronto → Cancun", query: "Toronto to Cancun" },
];

const FlightsPreviewSection = () => (
  <section className="py-12 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          Flight Deals Finder
        </h2>
        <Link to="/flights" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          Find flight deals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-muted-foreground mb-6 max-w-xl">Best upcoming flight deals for any route, with links to book on Expedia and Google Flights.</p>
      <div className="flex flex-wrap gap-3">
        {chips.map((chip) => (
          <Link key={chip.query} to={`/flights?q=${encodeURIComponent(chip.query)}`}>
            <Badge variant="outline" className="px-4 py-2 text-sm gap-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              <Plane className="h-4 w-4" />
              {chip.label}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default FlightsPreviewSection;
