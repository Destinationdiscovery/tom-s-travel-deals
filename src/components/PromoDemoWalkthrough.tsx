import { useState, useEffect, useCallback } from "react";
import { Search, Star, Check, Loader2, MapPin, Camera, Sparkles } from "lucide-react";
import heroBackground from "@/assets/hero-beach.jpg";

type Stage =
  | "HERO_REVEAL"
  | "TYPING"
  | "SUGGESTIONS"
  | "SELECT"
  | "LOADING"
  | "REVIEW"
  | "BRANDING";

const SEARCH_QUERY = "Sandals Royal Barbados";

const SUGGESTIONS = [
  { name: "Sandals Royal Barbados", type: "All-Inclusive Resort" },
  { name: "Sandals Montego Bay", type: "All-Inclusive Resort" },
  { name: "Sandals Grenada", type: "Luxury Resort" },
];

const LOADING_STAGES = [
  { label: "Searching traveler reviews...", icon: Search, duration: 800 },
  { label: "Analyzing ratings and feedback...", icon: Star, duration: 900 },
  { label: "Finding things to do nearby...", icon: MapPin, duration: 800 },
  { label: "Loading destination photos...", icon: Camera, duration: 700 },
  { label: "Compiling your review...", icon: Sparkles, duration: 0 },
];

const RATING_BARS = [
  { label: "Location", value: 4.8 },
  { label: "Service", value: 4.6 },
  { label: "Amenities", value: 4.4 },
  { label: "Value", value: 4.2 },
];

const BEST_FOR = ["Couples", "Honeymoon", "Beach Lovers", "Luxury"];

interface PromoDemoWalkthroughProps {
  onComplete: () => void;
  loop?: boolean;
}

const PromoDemoWalkthrough = ({ onComplete, loop = false }: PromoDemoWalkthroughProps) => {
  const [stage, setStage] = useState<Stage>("HERO_REVEAL");
  const [typedText, setTypedText] = useState("");
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [fadingOut, setFadingOut] = useState(false);

  const reset = useCallback(() => {
    setStage("HERO_REVEAL");
    setTypedText("");
    setLoadingStage(0);
    setLoadingProgress(0);
    setSelectedSuggestion(-1);
    setFadingOut(false);
  }, []);

  // Stage machine
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    switch (stage) {
      case "HERO_REVEAL":
        timer = setTimeout(() => setStage("TYPING"), 2000);
        break;
      case "TYPING":
        // handled by typing effect below
        break;
      case "SUGGESTIONS":
        timer = setTimeout(() => {
          setSelectedSuggestion(0);
          setStage("SELECT");
        }, 1500);
        break;
      case "SELECT":
        timer = setTimeout(() => setStage("LOADING"), 1000);
        break;
      case "LOADING":
        // handled by loading effect below
        break;
      case "REVIEW":
        timer = setTimeout(() => setStage("BRANDING"), 4000);
        break;
      case "BRANDING":
        timer = setTimeout(() => {
          if (loop) {
            reset();
          } else {
            setFadingOut(true);
            setTimeout(onComplete, 600);
          }
        }, 3500);
        break;
    }

    return () => clearTimeout(timer);
  }, [stage, loop, onComplete, reset]);

  // Typing effect
  useEffect(() => {
    if (stage !== "TYPING") return;

    const interval = setInterval(() => {
      setTypedText((prev) => {
        const next = SEARCH_QUERY.slice(0, prev.length + 1);
        if (next.length === SEARCH_QUERY.length) {
          clearInterval(interval);
          setTimeout(() => setStage("SUGGESTIONS"), 400);
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [stage]);

  // Loading stages
  useEffect(() => {
    if (stage !== "LOADING") return;

    const progressInterval = setInterval(() => {
      setLoadingProgress((p) => Math.min(p + 2, 100));
    }, 60);

    if (loadingStage < LOADING_STAGES.length - 1) {
      const timer = setTimeout(() => {
        setLoadingStage((s) => s + 1);
      }, LOADING_STAGES[loadingStage].duration);
      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    } else {
      const timer = setTimeout(() => setStage("REVIEW"), 800);
      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [stage, loadingStage]);

  const heroVisible = stage !== "BRANDING";
  const showTyping = stage === "TYPING" || stage === "SUGGESTIONS" || stage === "SELECT";
  const showSuggestions = stage === "SUGGESTIONS" || stage === "SELECT";
  const showLoading = stage === "LOADING";
  const showReview = stage === "REVIEW";
  const showBranding = stage === "BRANDING";

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* HERO SCENE */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: heroVisible && !showLoading && !showReview ? 1 : 0 }}
      >
        <img
          src={heroBackground}
          alt="Beach destination"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          {/* Brand */}
          <h1
            className={`font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight transition-all duration-700 ${
              stage === "HERO_REVEAL"
                ? "opacity-0 translate-y-6"
                : "opacity-100 translate-y-0"
            }`}
          >
            <span className="text-sky-300">REVIEW</span>{" "}
            <span className="text-amber-400">THEN</span>{" "}
            <span className="text-emerald-400 font-black">GO</span>
          </h1>

          <p
            className={`text-white/80 text-xl md:text-2xl mb-10 font-light transition-all duration-700 delay-200 ${
              stage === "HERO_REVEAL"
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0"
            }`}
          >
            Know what to expect before you go.
          </p>

          {/* Search bar mock */}
          <div
            className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl w-full relative transition-all duration-500 delay-300 ${
              stage === "HERO_REVEAL" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <div className="w-full h-12 pl-12 pr-4 rounded-lg bg-white/95 backdrop-blur-sm text-foreground text-base flex items-center shadow-lg">
                <span>{showTyping || showLoading || showReview ? typedText : ""}</span>
                {stage === "TYPING" && (
                  <span className="animate-pulse ml-0.5 text-primary">|</span>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-border overflow-hidden z-20 animate-fade-in">
                  {SUGGESTIONS.map((s, i) => (
                    <div
                      key={i}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                        selectedSuggestion === i
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">{s.name}</span>
                        <span className="text-muted-foreground text-xs">{s.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`h-12 px-8 rounded-lg font-semibold shadow-lg flex items-center justify-center whitespace-nowrap text-base ${
                stage === "SELECT"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              {stage === "SELECT" ? "Searching..." : "Explore reviews"}
            </div>
          </div>
        </div>
      </div>

      {/* LOADING SCENE */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-background transition-opacity duration-500"
        style={{ opacity: showLoading ? 1 : 0, pointerEvents: showLoading ? "auto" : "none" }}
      >
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-card rounded-2xl p-8 shadow-lg">
            {/* Progress bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-8">
              <div
                className="h-full bg-primary transition-all duration-200 rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <div className="space-y-4">
              {LOADING_STAGES.map((s, index) => {
                const Icon = s.icon;
                const isComplete = index < loadingStage;
                const isActive = index === loadingStage;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                      isActive ? "bg-primary/5" : isComplete ? "opacity-70" : "opacity-30"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isComplete
                          ? "bg-green-500/15 text-green-600"
                          : isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* REVIEW SCENE */}
      <div
        className="absolute inset-0 flex items-start justify-center bg-background overflow-y-auto transition-opacity duration-700 pt-12 pb-12"
        style={{ opacity: showReview ? 1 : 0, pointerEvents: showReview ? "auto" : "none" }}
      >
        <div
          className={`max-w-3xl w-full mx-4 transition-all duration-700 ${
            showReview ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
            {/* Header */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Sandals Royal Barbados
              </h2>
              <p className="text-muted-foreground text-sm mt-1">All-Inclusive Resort · St. Lawrence Gap, Barbados</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
                <Star className="h-5 w-5 fill-amber-400/50 text-amber-400" />
              </div>
              <span className="text-lg font-bold text-foreground">4.5</span>
              <span className="text-sm text-muted-foreground">RTG Score</span>
            </div>

            {/* Summary */}
            <p className="text-muted-foreground leading-relaxed">
              Sandals Royal Barbados consistently impresses guests with its stunning beachfront
              location, exceptional service, and world-class dining options. The swim-up suites
              and rooftop pool are standout features that elevate this property above typical
              all-inclusive resorts.
            </p>

            {/* Rating bars */}
            <div className="grid grid-cols-2 gap-4">
              {RATING_BARS.map((r) => (
                <div key={r.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium text-foreground">{r.value}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(r.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Best For */}
            <div className="flex flex-wrap gap-2">
              {BEST_FOR.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BRANDING FINALE */}
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
    </div>
  );
};

export default PromoDemoWalkthrough;
