import { Button } from "@/components/ui/button";
import { ArrowRight, Compass } from "lucide-react";
import heroImage from "@/assets/hero-beach.jpg";

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary-foreground">Travel Stories & Inspiration</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
            Let's Discover the World
            <span className="block text-gradient">Together</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto font-body">
            Real travel experiences, honest reviews, and destination insights from someone who's been there. 
            Your journey to unforgettable adventures starts here.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => scrollToSection("destinations")}
              className="gap-2"
            >
              Explore Destinations <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl" 
              onClick={() => scrollToSection("deals")}
              className="gap-2"
            >
              View Featured Trips
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/60">
            Join our community of travel enthusiasts discovering the world
          </p>
        </div>
      </div>

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