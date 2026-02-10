import { Star, Trophy } from "lucide-react";

const PROPERTIES = [
  {
    name: "Sandals Royal Barbados",
    location: "St. Lawrence Gap, Barbados",
    overall: 4.5,
    ratings: [
      { label: "Location", value: 4.8 },
      { label: "Service", value: 4.6 },
      { label: "Amenities", value: 4.4 },
      { label: "Value", value: 4.2 },
    ],
    bestFor: ["Couples", "Honeymoon", "Beach Lovers", "Luxury"],
    winner: true,
  },
  {
    name: "Hyatt Zilara Cap Cana",
    location: "Punta Cana, Dominican Republic",
    overall: 4.3,
    ratings: [
      { label: "Location", value: 4.7 },
      { label: "Service", value: 4.4 },
      { label: "Amenities", value: 4.2 },
      { label: "Value", value: 4.0 },
    ],
    bestFor: ["Adults Only", "Beach", "Relaxation"],
    winner: false,
  },
];

interface PromoCompareSceneProps {
  visible: boolean;
}

const PromoCompareScene = ({ visible }: PromoCompareSceneProps) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-background transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div
        className={`max-w-4xl w-full mx-4 space-y-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center">
          Side-by-Side Comparison
        </h2>

        {/* Two cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROPERTIES.map((prop) => (
            <div
              key={prop.name}
              className={`bg-card rounded-2xl p-5 shadow-lg border-2 transition-all ${
                prop.winner ? "border-primary" : "border-transparent"
              }`}
            >
              <h3 className="font-display text-lg font-bold text-foreground">{prop.name}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">{prop.location}</p>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(prop.overall)
                          ? "fill-amber-400 text-amber-400"
                          : i < prop.overall
                          ? "fill-amber-400/50 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-foreground">{prop.overall}</span>
              </div>

              <div className="space-y-2 mt-4">
                {prop.ratings.map((r) => (
                  <div key={r.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-medium text-foreground">{r.value}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${(r.value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {prop.bestFor.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Verdict banner */}
        <div className="bg-card rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-400/15 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              ReviewThenGo Verdict:{" "}
              <span className="text-primary">Sandals Royal Barbados</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Higher ratings across all categories with standout service and luxury amenities for couples.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCompareScene;
