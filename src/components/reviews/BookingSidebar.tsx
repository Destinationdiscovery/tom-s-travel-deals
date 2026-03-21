import { useMemo } from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { detectCountry, buildDeepLinks } from "@/components/AffiliateLinks";
import { trackAffiliateClick } from "@/lib/analytics";

interface BookingSidebarProps {
  propertyName?: string;
}

const BookingSidebar = ({ propertyName }: BookingSidebarProps) => {
  const links = useMemo(() => {
    const country = detectCountry();
    return buildDeepLinks(country, propertyName);
  }, [propertyName]);

  const platforms = [
    { name: "Expedia", url: links.expedia, tagline: "Bundle hotel + flight" },
    { name: "Hotels.com", url: links.hotels, tagline: "Earn free nights" },
    { name: "VRBO", url: links.vrbo, tagline: "Great for groups" },
  ];

  const handleClick = (name: string) => {
    trackAffiliateClick(name, window.location.pathname, "reviews_sidebar");
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft border border-border sticky top-20">
      <h3 className="font-display text-base font-bold text-foreground mb-1">🔥 Ready to Book?</h3>
      <p className="text-xs text-muted-foreground mb-4">Best deals found for this search</p>

      <div className="flex flex-col gap-3">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(p.name)}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5 transition-all hover:border-primary/40 hover:shadow-sm group"
          >
            <div>
              <span className="font-semibold text-sm text-foreground">{p.name}</span>
              <p className="text-xs text-muted-foreground">{p.tagline}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
          </a>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground mt-4">
        Affiliate links help keep ReviewThenGo free.
      </p>

      <div className="mt-5 pt-4 border-t border-border">
        <Link
          to="/gear"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          💼 Need travel gear? Browse essentials →
        </Link>
      </div>
    </div>
  );
};

export default BookingSidebar;
