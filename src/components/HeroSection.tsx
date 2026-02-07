import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-beach.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Image */}
      <img
        src={heroBackground}
        alt="Tropical resort with crystal clear water"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Site Name */}
        <p className="text-white/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium">
          TripReviews.ca
        </p>

        {/* Main Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="text-sky-300">REVIEW.</span>{" "}
          <span className="text-white/90">THEN</span>{" "}
          <span className="text-white font-black">GO.</span>
        </h1>

        {/* Tagline */}
        <p className="text-white/80 text-lg md:text-xl mb-10 font-light">
          Know what to expect before you go.
        </p>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search destinations, hotels, or experiences"
              className="w-full h-12 pl-12 pr-4 rounded-lg bg-white/95 backdrop-blur-sm text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg"
              readOnly
            />
          </div>
          <Button
            size="lg"
            className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg whitespace-nowrap"
          >
            Explore reviews
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center">
          <div className="w-1 h-3 bg-white/30 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
