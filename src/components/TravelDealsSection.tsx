import dealBanner from "@/assets/deal-expedia-vacation-sale-banner.png";
import hotelsBanner from "@/assets/deal-hotels-spring-sale-banner.png";

const TravelDealsSection = () => {
  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4 space-y-6">
        {/* Expedia Banner */}
        <div>
          <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-3">
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
          <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-3">
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
      </div>
    </section>
  );
};

export default TravelDealsSection;
