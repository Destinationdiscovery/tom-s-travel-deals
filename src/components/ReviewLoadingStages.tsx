import { useEffect, useState, useMemo } from "react";
import { Search, Star, MapPin, Camera, Sparkles, Check, Loader2, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const STAGES = [
  { label: "Searching traveler reviews...", icon: Search, duration: 3000 },
  { label: "Analyzing ratings and feedback...", icon: Star, duration: 4000 },
  { label: "Finding things to do nearby...", icon: MapPin, duration: 5000 },
  { label: "Loading destination photos...", icon: Camera, duration: 6000 },
  { label: "Compiling your review...", icon: Sparkles, duration: 0 },
];

const TRAVEL_TIPS = [
  "Booking mid-week flights can save you up to 20% compared to weekend departures.",
  "Travel insurance typically costs 4 to 8% of your trip, worth it for international travel.",
  "Packing cubes can reduce luggage volume by up to 30% and keep you organized.",
  "Shoulder season (just before or after peak) offers better prices and fewer crowds.",
  "Always notify your bank before international travel to avoid card freezes.",
];

const ReviewLoadingStages = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const tip = useMemo(() => TRAVEL_TIPS[Math.floor(Math.random() * TRAVEL_TIPS.length)], []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const remaining = 95 - prev;
        return prev + remaining * 0.03;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (activeStage >= STAGES.length - 1) return;

    const currentStage = STAGES[activeStage];
    if (!currentStage) return;
    const timeout = setTimeout(() => {
      setActiveStage((prev) => prev + 1);
    }, currentStage.duration);

    return () => clearTimeout(timeout);
  }, [activeStage]);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl p-8 shadow-soft">
          <Progress value={progress} className="h-2 mb-8" />

          <div className="space-y-4">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isComplete = index < activeStage;
              const isActive = index === activeStage;
              const isPending = index > activeStage;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                    isActive
                      ? "bg-primary/5"
                      : isComplete
                      ? "opacity-70"
                      : "opacity-30"
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
                    className={`text-sm font-medium transition-colors duration-500 ${
                      isActive
                        ? "text-foreground"
                        : isComplete
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Did you know? tip */}
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted/50 p-4">
            <Lightbulb className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-foreground">Did you know?</span>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {tip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewLoadingStages;
