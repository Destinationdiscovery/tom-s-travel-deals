import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AffiliateLinksProps {
  propertyName: string;
}

const affiliates = [
  {
    name: "Expedia.ca",
    baseUrl: "https://www.expedia.ca/Hotel-Search",
    buildUrl: (query: string) =>
      `https://www.expedia.ca/Hotel-Search?destination=${encodeURIComponent(query)}`,
    color: "bg-[hsl(45,100%,51%)] hover:bg-[hsl(45,100%,45%)] text-[hsl(215,25%,15%)]",
  },
  {
    name: "VRBO",
    baseUrl: "https://www.vrbo.com/search",
    buildUrl: (query: string) =>
      `https://www.vrbo.com/search?destination=${encodeURIComponent(query)}`,
    color: "bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,38%)] text-white",
  },
  {
    name: "Hotels.com",
    baseUrl: "https://www.hotels.com/search.do",
    buildUrl: (query: string) =>
      `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(query)}`,
    color: "bg-[hsl(0,72%,51%)] hover:bg-[hsl(0,72%,44%)] text-white",
  },
];

const AffiliateLinks = ({ propertyName }: AffiliateLinksProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-foreground mb-4">
        Book or Compare Prices
      </h3>
      <div className="flex flex-wrap gap-3">
        {affiliates.map((affiliate) => (
          <Button
            key={affiliate.name}
            asChild
            className={`${affiliate.color} font-semibold gap-2`}
          >
            <a
              href={affiliate.buildUrl(propertyName)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {affiliate.name}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Links may earn us a commission at no extra cost to you.
      </p>
    </div>
  );
};

export default AffiliateLinks;
