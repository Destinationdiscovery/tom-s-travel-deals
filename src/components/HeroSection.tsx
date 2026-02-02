import heroImage from "@/assets/hero-tripreviews.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] pt-20 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;