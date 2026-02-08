import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const affiliates = [
  {
    name: "Expedia",
    url: `https://www.anrdoezrs.net/click-101645364-15575474?url=${encodeURIComponent("https://www.expedia.ca/Hotels")}`,
    color: "bg-[hsl(45,100%,51%)] hover:bg-[hsl(45,100%,45%)] text-[hsl(215,25%,15%)]",
  },
  {
    name: "VRBO",
    url: `https://www.jdoqocy.com/click-101645364-10697641?url=${encodeURIComponent("https://www.vrbo.com")}`,
    color: "bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,38%)] text-white",
  },
];

const AffiliateLinks = () => {
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
              href={affiliate.url}
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
