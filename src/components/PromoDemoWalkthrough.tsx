import { useState, useEffect, useCallback } from "react";
import heroBackground from "@/assets/hero-beach.jpg";
import PromoReviewScene from "@/components/promo/PromoReviewScene";
import PromoIntelScene from "@/components/promo/PromoIntelScene";
import PromoGearScene from "@/components/promo/PromoGearScene";
import PromoCompareScene from "@/components/promo/PromoCompareScene";

type Stage =
  | "HERO_REVEAL"
  | "REVIEW_FLASH"
  | "INTEL_FLASH"
  | "GEAR_FLASH"
  | "COMPARE_FLASH"
  | "BRANDING";

interface PromoDemoWalkthroughProps {
  onComplete: () => void;
  loop?: boolean;
}

const PromoDemoWalkthrough = ({ onComplete, loop = false }: PromoDemoWalkthroughProps) => {
  const [stage, setStage] = useState<Stage>("HERO_REVEAL");
  const [fadingOut, setFadingOut] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const reset = useCallback(() => {
    setStage("HERO_REVEAL");
    setFadingOut(false);
    setScrollProgress(0);
  }, []);

  // Stage machine, fast transitions
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    switch (stage) {
      case "HERO_REVEAL":
        timer = setTimeout(() => setStage("REVIEW_FLASH"), 2000);
        break;
      case "REVIEW_FLASH":
        timer = setTimeout(() => setStage("INTEL_FLASH"), 2500);
        break;
      case "INTEL_FLASH":
        timer = setTimeout(() => setStage("GEAR_FLASH"), 2500);
        break;
      case "GEAR_FLASH":
        timer = setTimeout(() => setStage("COMPARE_FLASH"), 1500);
        break;
      case "COMPARE_FLASH":
        timer = setTimeout(() => setStage("BRANDING"), 1500);
        break;
      case "BRANDING":
        timer = setTimeout(() => {
          if (loop) {
            reset();
          } else {
            setFadingOut(true);
            setTimeout(onComplete, 600);
          }
        }, 2000);
        break;
    }

    return () => clearTimeout(timer);
  }, [stage, loop, onComplete, reset]);

  // Fast auto-scroll during REVIEW_FLASH
  useEffect(() => {
    if (stage !== "REVIEW_FLASH") return;
    setScrollProgress(0);
    const interval = setInterval(() => {
      setScrollProgress((p) => Math.min(p + 4, 300));
    }, 40);
    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* HERO SCENE */}
      <div
        className="absolute inset-0 transition-opacity duration-400"
        style={{ opacity: stage === "HERO_REVEAL" ? 1 : 0 }}
      >
        <img
          src={heroBackground}
          alt="Beach destination"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h1
            className={`font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight transition-all duration-700 ${
              stage === "HERO_REVEAL"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <span className="text-sky-300">REVIEW</span>{" "}
            <span className="text-amber-400">THEN</span>{" "}
            <span className="text-emerald-400 font-black">GO</span>
          </h1>

          <p
            className={`text-white/80 text-xl md:text-2xl font-light transition-all duration-700 delay-200 ${
              stage === "HERO_REVEAL"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Know what to expect before you go.
          </p>
        </div>
      </div>

      {/* REVIEW FLASH */}
      <PromoReviewScene
        visible={stage === "REVIEW_FLASH"}
        scrollProgress={scrollProgress}
      />

      {/* INTEL FLASH */}
      <PromoIntelScene visible={stage === "INTEL_FLASH"} />

      {/* GEAR FLASH */}
      <PromoGearScene visible={stage === "GEAR_FLASH"} />

      {/* COMPARE FLASH */}
      <PromoCompareScene visible={stage === "COMPARE_FLASH"} />

      {/* BRANDING FINALE */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-black transition-opacity duration-700"
        style={{ opacity: stage === "BRANDING" ? 1 : 0 }}
      >
        <h1
          className={`font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight transition-all duration-700 delay-200 ${
            stage === "BRANDING" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-sky-300">REVIEW</span>{" "}
          <span className="text-amber-400">THEN</span>{" "}
          <span className="text-emerald-400">GO</span>
        </h1>
        <p
          className={`text-white/70 text-xl md:text-2xl mt-6 font-light transition-all duration-700 delay-500 ${
            stage === "BRANDING" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Know what to expect before you go.
        </p>
      </div>
    </div>
  );
};

export default PromoDemoWalkthrough;
