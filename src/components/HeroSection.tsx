import heroImage from "@/assets/hero-tripreviews.jpg";

const HeroSection = () => {
  return (
    <section className="relative pt-20 bg-[#e8f4f8]">
      {/* Hero Image - Full Width */}
      <img 
        src={heroImage}
        alt="TripReviews.ca - Honest Reviews, Tested Gear & Travel Insights"
        className="w-full h-auto"
      />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-gray-400/50 flex justify-center">
          <div className="w-1 h-3 bg-gray-400/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;