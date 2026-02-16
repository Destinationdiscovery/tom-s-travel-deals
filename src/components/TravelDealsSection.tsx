import dealBanner from "@/assets/deal-expedia-vacation-sale-banner.png";

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
          className="block rounded-xl overflow-hidden group"
        >
          <img
            src={dealBanner}
            alt="Expedia's Annual Vacation Sale — Members save up to 40% on selected hotels and vacation rentals"
            className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </a>
      </div>
    </section>
  );
};

export default TravelDealsSection;
