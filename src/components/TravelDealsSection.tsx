import React, { useState, useEffect } from "react";
import { Star, ArrowRight } from "lucide-react";
import { trackAffiliateClick } from "@/lib/analytics";
import { detectCountry, EXPEDIA_LINKS } from "@/components/AffiliateLinks";
import dealBanner from "@/assets/deal-expedia-vacation-sale-banner.png";
import hotelsBanner from "@/assets/deal-hotels-spring-sale-banner.png";
import dealTemptation from "@/assets/deal-temptation-cancun.png";
import dealRiu from "@/assets/deal-riu-plaza-toronto.png";
import dealOutrigger from "@/assets/deal-outrigger-honua-kai.png";
import dealFlights from "@/assets/deal-flights-clean.jpg";
import dealGarza from "@/assets/deal-garza-blanca-clean.jpg";
import dealPhuket from "@/assets/deal-phuket-clean.jpg";
import { supabase } from "@/integrations/supabase/client";
interface FeaturedDeal {
  image: string;
  name: string;
  location: string;
  affiliateUrl: string;
  originalPrice: number;
  salePrice: number;
  originalLabel: string;
  saleLabel: string;
  originalLabelWeekly?: string;
  saleLabelWeekly?: string;
  rating: number;
  imagePosition?: string;
  expiresAt?: string;
}

const featuredDeals: FeaturedDeal[] = [
  { image: dealTemptation, name: "Temptation Cancun Resort All Inclusive — Adults Only", location: "Cancun, Mexico", affiliateUrl: "https://expedia.com/affiliate/sCSkKSm", originalPrice: 389, salePrice: 249, originalLabel: "$389/night", saleLabel: "$249/night", rating: 4.3, expiresAt: "2026-04-30T23:59:59Z" },
  { image: dealRiu, name: "Hotel Riu Plaza Toronto", location: "Toronto, Canada", affiliateUrl: "https://expedia.com/affiliate/4XUFIIR", originalPrice: 279, salePrice: 179, originalLabel: "$279/night", saleLabel: "$179/night", rating: 4.1, expiresAt: "2026-03-31T23:59:59Z" },
  { image: dealOutrigger, name: "OUTRIGGER Honua Kai Resort & Spa", location: "Lahaina, Hawaii", affiliateUrl: "https://expedia.com/affiliate/N2Bmgth", originalPrice: 499, salePrice: 329, originalLabel: "$499/night", saleLabel: "$329/night", rating: 4.6, expiresAt: "2026-05-15T23:59:59Z" },
  { image: dealFlights, name: "Save on Eligible Flights to Top Destinations", location: "Multiple Destinations", affiliateUrl: "https://expedia.com/affiliate/bPJ1N3S", originalPrice: 650, salePrice: 399, originalLabel: "$650", saleLabel: "$399", rating: 4.0, expiresAt: "2026-04-15T23:59:59Z" },
  { image: dealGarza, name: "Garza Blanca Resort & Spa Cancun", location: "Punta Sam, Mexico", affiliateUrl: "https://www.hotels.com/affiliate/gUxIS8k", originalPrice: 459, salePrice: 299, originalLabel: "$459/night", saleLabel: "$299/night", rating: 4.5, expiresAt: "2026-05-01T23:59:59Z" },
  { image: dealPhuket, name: "Phuket Moonlit Bay Seaview Resort & Spa", location: "Ratsada, Thailand", affiliateUrl: "https://expedia.com/affiliate/av1oUFB", originalPrice: 199, salePrice: 119, originalLabel: "$199/night", saleLabel: "$119/night", rating: 4.2, expiresAt: "2026-04-20T23:59:59Z" },
];

function useCountdown(expiresAt?: string) {
  const [label, setLabel] = React.useState("");
  const [expired, setExpired] = React.useState(false);
  React.useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); setLabel("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setLabel(d > 0 ? `Ends in ${d}d ${h}h` : `Ends in ${h}h`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  return { label, expired };
}


const DiscountBadge = ({ original, sale, expiresAt }: { original: number; sale: number; expiresAt?: string }) => {
  const pct = Math.round((1 - sale / original) * 100);
  const { label, expired } = useCountdown(expiresAt);
  if (expired) return null;
  return (
    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
      <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
        {pct}% OFF
      </span>
      {label && (
        <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          {label}
        </span>
      )}
    </div>
  );
};

const MiniStars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < full ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{rating}</span>
    </div>
  );
};

const TravelDealsSection = () => {
  const [mergedDeals, setMergedDeals] = useState<FeaturedDeal[]>(featuredDeals);

  useEffect(() => {
    const fetchDbDeals = async () => {
      const { data } = await supabase.from("featured_deals").select("*").order("slot_number") as any;
      if (data && data.length > 0) {
        const merged = [...featuredDeals];
        data.forEach((dbDeal: any) => {
          const idx = dbDeal.slot_number - 1;
          if (idx >= 0 && idx < 6) {
            merged[idx] = {
              image: dbDeal.image_url,
              name: dbDeal.name,
              location: dbDeal.location,
              affiliateUrl: dbDeal.affiliate_url,
              originalPrice: Number(dbDeal.original_price),
              salePrice: Number(dbDeal.sale_price),
              originalLabel: dbDeal.original_label,
              saleLabel: dbDeal.sale_label,
              originalLabelWeekly: dbDeal.original_label_weekly || undefined,
              saleLabelWeekly: dbDeal.sale_label_weekly || undefined,
              rating: Number(dbDeal.rating),
              imagePosition: dbDeal.image_position || "center",
              expiresAt: dbDeal.expires_at || undefined,
            };
          }
        });
        setMergedDeals(merged);
      }
    };
    fetchDbDeals();
  }, []);

  return (
    <section id="travel-deals" className="py-12 bg-muted/20">
      <div className="container mx-auto px-4 space-y-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          <span className="text-sky-400">Review</span>
          <span className="text-amber-400">Then</span>
          <span className="text-emerald-400">Go</span>
          <span className="text-foreground"> Deals</span>
        </h2>

        {/* Banners — compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="https://expedia.com/affiliate/7ymxnWK" target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden group">
            <img src={dealBanner} alt="Expedia's Annual Vacation Sale" className="w-full h-[100px] md:h-[130px] object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          </a>
          <a href="https://www.hotels.com/affiliate/FvZz7Rm" target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden group">
            <img src={hotelsBanner} alt="Hotels.com Big Spring Sale" className="w-full h-[100px] md:h-[130px] object-cover object-right transition-transform duration-500 group-hover:scale-[1.02]" />
          </a>
        </div>

        {/* Featured Deals Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">
              Featured Deals
            </h3>
            <a
              href={EXPEDIA_LINKS[detectCountry()]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              Search More Deals <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mergedDeals.map((deal, i) => (
              <a
                key={i}
                href={deal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAffiliateClick("Expedia", "homepage", `deals_grid_${deal.name}`)}
                className="group block rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border border-border/50 min-w-[280px] md:min-w-0 snap-start"
              >
                <div className="relative">
                  <DiscountBadge original={deal.originalPrice} sale={deal.salePrice} expiresAt={deal.expiresAt} />
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ objectPosition: deal.imagePosition || "center" }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-display font-bold text-foreground leading-tight line-clamp-2">
                    {deal.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{deal.location}</p>
                  <MiniStars rating={deal.rating} />
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">{deal.originalLabel}</span>
                        <span className="font-bold text-emerald-400 text-lg">{deal.saleLabel}</span>
                      </div>
                      {deal.originalLabelWeekly && deal.saleLabelWeekly && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground line-through">{deal.originalLabelWeekly}</span>
                          <span className="font-semibold text-emerald-400 text-sm">{deal.saleLabelWeekly}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full group-hover:bg-secondary/90 transition-colors">
                      Grab This Deal →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelDealsSection;
