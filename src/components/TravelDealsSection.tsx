import dealBanner from "@/assets/deal-expedia-vacation-sale.png";

const TravelDealsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Travel Deals
          </h2>
          <p className="text-muted-foreground mt-1">
            Exclusive deals and savings from our partners
          </p>
        </div>

        <a
          href="https://expedia.com/affiliate/7ymxnWK"
          target="_blank"
          rel="noopener noreferrer"
          className="block relative rounded-xl overflow-hidden group"
        >
          <img
            src={dealBanner}
            alt="Expedia's Annual Vacation Sale"
            className="w-full h-[250px] md:h-[350px] object-cover object-[center_80%] transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-card/95 backdrop-blur-sm rounded-xl p-4 md:p-6 max-w-sm shadow-lg">
            <h3 className="font-display font-bold text-foreground text-lg md:text-xl mb-1">
              Expedia's Annual Vacation Sale
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Members save up to 40% on selected hotels and vacation rentals. Plan this year's big trip and save.
            </p>
          </div>
        </a>
      </div>
    </section>
  );
};

export default TravelDealsSection;
