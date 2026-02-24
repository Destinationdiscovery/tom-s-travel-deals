import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { buildDeepLinks, detectCountry } from "@/components/AffiliateLinks";
import { trackAffiliateClick } from "@/lib/analytics";

interface InlineAffiliateCTAProps {
  propertyName?: string;
  variant?: "compact" | "banner";
}

const InlineAffiliateCTA = ({ propertyName, variant = "compact" }: InlineAffiliateCTAProps) => {
  const link = useMemo(() => {
    const country = detectCountry();
    return buildDeepLinks(country, propertyName).expedia;
  }, [propertyName]);

  if (variant === "banner") {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-foreground text-lg">Planning a trip?</p>
          <p className="text-sm text-muted-foreground">Compare rates and find the best deals on Expedia.</p>
        </div>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAffiliateClick("Expedia", window.location.pathname, "inline_banner")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Search Deals on Expedia
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackAffiliateClick("Expedia", window.location.pathname, "inline_compact")}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      Book on Expedia
      <ExternalLink className="h-3 w-3" />
    </a>
  );
};

export default InlineAffiliateCTA;
