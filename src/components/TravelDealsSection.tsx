import dealBanner from "@/assets/deal-expedia-vacation-sale-banner.png";
import hotelsBanner from "@/assets/deal-hotels-spring-sale-banner.png";
import dealTemptation from "@/assets/deal-temptation-cancun.png";
import dealRiu from "@/assets/deal-riu-plaza-toronto.png";
import dealOutrigger from "@/assets/deal-outrigger-honua-kai.png";
import dealFlights from "@/assets/deal-flights.png";
import dealGarza from "@/assets/deal-garza-blanca-cancun.png";
import dealPhuket from "@/assets/deal-phuket-moonlit-bay.png";

interface FeaturedDeal {
  image: string;
  name: string;
  location: string;
  affiliateUrl: string;
}

const featuredDeals: FeaturedDeal[] = [
  { image: dealTemptation, name: "Temptation Cancun Resort All Inclusive — Adults Only", location: "Cancun, Mexico", affiliateUrl: "https://expedia.com/affiliate/sCSkKSm" },
  { image: dealRiu, name: "Hotel Riu Plaza Toronto", location: "Toronto, Canada", affiliateUrl: "https://expedia.com/affiliate/4XUFIIR" },
  { image: dealOutrigger, name: "OUTRIGGER Honua Kai Resort & Spa", location: "Lahaina, Hawaii", affiliateUrl: "https://expedia.com/affiliate/N2Bmgth" },
  { image: dealFlights, name: "Save on Eligible Flights to Top Destinations", location: "Multiple Destinations", affiliateUrl: "https://expedia.com/affiliate/bPJ1N3S" },
  { image: dealGarza, name: "Garza Blanca Resort & Spa Cancun", location: "Punta Sam, Mexico", affiliateUrl: "https://www.hotels.com/affiliate/gUxIS8k" },
  { image: dealPhuket, name: "Phuket Moonlit Bay Seaview Resort & Spa", location: "Ratsada, Thailand", affiliateUrl: "https://expedia.com/affiliate/av1oUFB" },
];

const TravelDealsSection = () => {
  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4 space-y-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          <span className="text-sky-600">Review</span>
          <span className="text-amber-500">Then</span>
          <span className="text-emerald-600">Go</span>
          <span className="text-foreground"> Deals</span>
        </h2>

        {/* Expedia Banner */}
        <div>
          <h3 className="font-display text-base md:text-lg font-semibold text-muted-foreground mb-2">
            Expedia's Annual Vacation Sale: Members save up to 40%*
          </h3>
          <a
            href="https://expedia.com/affiliate/7ymxnWK"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden group"
          >
            <img
              src={dealBanner}
              alt="Expedia's Annual Vacation Sale — Members save up to 40% on selected hotels and vacation rentals"
              className="w-full h-[120px] md:h-[180px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </a>
        </div>

        {/* Hotels.com Banner */}
        <div>
          <h3 className="font-display text-base md:text-lg font-semibold text-muted-foreground mb-2">
            Hotels.com Big Spring Sale: Members save up to 40%*
          </h3>
          <a
            href="https://www.hotels.com/affiliate/FvZz7Rm"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden group"
          >
            <img
              src={hotelsBanner}
              alt="Hotels.com Big Spring Sale — Members save up to 40%"
              className="w-full h-[120px] md:h-[180px] object-cover object-right transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </a>
        </div>

        {/* Featured Deals Grid */}
        {featuredDeals.length > 0 && (
          <div className="pt-4">
            <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-4">
              Featured Deals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDeals.map((deal, i) => (
                <a
                  key={i}
                  href={deal.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="p-4">
                    <h4 className="font-display font-bold text-foreground leading-tight line-clamp-2">
                      {deal.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{deal.location}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TravelDealsSection;
