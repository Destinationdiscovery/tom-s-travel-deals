import { Star } from "lucide-react";
import packingCubesMain from "@/assets/gear-packing-cubes-main.jpg";

interface PromoGearSceneProps {
  visible: boolean;
}

const PromoGearScene = ({ visible }: PromoGearSceneProps) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-background transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div
        className={`max-w-lg w-full mx-4 transition-all duration-400 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-card rounded-2xl overflow-hidden shadow-lg">
          {/* Product image */}
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={packingCubesMain}
              alt="Packing Cubes"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              Gear Review
            </p>
            <h3 className="font-display text-xl font-bold text-foreground">
              Peak Design Packing Cubes
            </h3>
            <p className="text-muted-foreground text-sm mt-1">Travel Organization · Set of 4</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <Star className="h-4 w-4 fill-amber-400/50 text-amber-400" />
              </div>
              <span className="font-bold text-foreground">4.7</span>
              <span className="text-xs text-muted-foreground">RTG Score</span>
            </div>

            {/* Verdict */}
            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Verdict:</span> Best-in-class compression and durability.
                The magnetic closures and expandable design make these a must-have for organized packers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoGearScene;
