import { useState, useEffect, useCallback } from "react";

import heroBeach from "@/assets/hero-beach.jpg";
import cubaGallery from "@/assets/cuba-gallery-1.jpg";
import mexicoHero from "@/assets/mexico-hero.webp";
import curacaoHero from "@/assets/curacao-hero.avif";
import japanFushimi from "@/assets/japan-fushimi-inari.jpg";
import canadaLouise from "@/assets/canada-boom-lake-louise.jpg";
import cruiseHero from "@/assets/cruise-hero.jpg";
import vegasHero from "@/assets/vegas-strip-hero.jpg";

const slides = [
  { image: heroBeach, label: "Discover Paradise" },
  { image: cubaGallery, label: "Cuba" },
  { image: mexicoHero, label: "Mexico" },
  { image: curacaoHero, label: "Curaçao" },
  { image: japanFushimi, label: "Japan" },
  { image: canadaLouise, label: "Canada" },
  { image: cruiseHero, label: "Cruises" },
  { image: vegasHero, label: "Las Vegas" },
];

const SLIDE_DURATION = 4000;
const FADE_DURATION = 800;

interface PromoSlideshowProps {
  onComplete: () => void;
  loop?: boolean;
  showSkip?: boolean;
}

const PromoSlideshow = ({ onComplete, loop = false, showSkip = true }: PromoSlideshowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBranding, setShowBranding] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const totalSlides = slides.length;

  const finish = useCallback(() => {
    if (loop) {
      setShowBranding(false);
      setCurrentSlide(0);
      setTextVisible(true);
    } else {
      setFadingOut(true);
      setTimeout(onComplete, 600);
    }
  }, [loop, onComplete]);

  useEffect(() => {
    if (showBranding) {
      const timer = setTimeout(finish, 3500);
      return () => clearTimeout(timer);
    }

    // Fade out text before slide change
    const textTimer = setTimeout(() => setTextVisible(false), SLIDE_DURATION - FADE_DURATION);

    const slideTimer = setTimeout(() => {
      if (currentSlide < totalSlides - 1) {
        setCurrentSlide((s) => s + 1);
        setTextVisible(true);
      } else {
        setShowBranding(true);
      }
    }, SLIDE_DURATION);

    return () => {
      clearTimeout(slideTimer);
      clearTimeout(textTimer);
    };
  }, [currentSlide, showBranding, totalSlides, finish]);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(onComplete, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Destination slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: currentSlide === index && !showBranding ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.label}
            className={`absolute inset-0 w-full h-full object-cover ${
              currentSlide === index ? "animate-ken-burns" : ""
            }`}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2
              className={`font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white transition-all duration-700 ${
                textVisible && currentSlide === index
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              {slide.label}
            </h2>
          </div>
        </div>
      ))}

      {/* Branding finale */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-black transition-opacity duration-700"
        style={{ opacity: showBranding ? 1 : 0 }}
      >
        <h1
          className={`font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight transition-all duration-700 delay-200 ${
            showBranding ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-sky-300">REVIEW</span>{" "}
          <span className="text-amber-400">THEN</span>{" "}
          <span className="text-emerald-400">GO</span>
        </h1>
        <p
          className={`text-white/70 text-xl md:text-2xl mt-6 font-light transition-all duration-700 delay-500 ${
            showBranding ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Know what to expect before you go.
        </p>
      </div>

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={handleSkip}
          className="fixed bottom-8 right-8 z-50 text-white/60 hover:text-white text-sm font-medium px-4 py-2 rounded-full border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all"
        >
          Skip →
        </button>
      )}

      {/* Progress dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentSlide && !showBranding
                ? "bg-white w-6"
                : i < currentSlide || showBranding
                ? "bg-white/50"
                : "bg-white/20"
            }`}
          />
        ))}
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            showBranding ? "bg-white w-6" : "bg-white/20"
          }`}
        />
      </div>
    </div>
  );
};

export default PromoSlideshow;
