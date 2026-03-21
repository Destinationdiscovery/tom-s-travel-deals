import { Link } from "react-router-dom";
import { ArrowRight, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const chips = [
  { label: "🇲🇽 Mexico Peso", query: "Mexico" },
  { label: "🇪🇺 Euro", query: "Europe" },
  { label: "🇯🇵 Japanese Yen", query: "Japan" },
];

const CurrencyPreviewSection = () => (
  <section className="py-12 bg-background">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Currency Tracker
        </h2>
        <Link to="/currency" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          Check exchange rates <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-muted-foreground mb-6 max-w-xl">Live exchange rates, conversion tables, and travel money tips for any destination.</p>
      <div className="flex flex-wrap gap-3">
        {chips.map((chip) => (
          <Link key={chip.query} to={`/currency?q=${encodeURIComponent(chip.query)}`}>
            <Badge variant="outline" className="px-4 py-2 text-sm gap-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {chip.label}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CurrencyPreviewSection;
