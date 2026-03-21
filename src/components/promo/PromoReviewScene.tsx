import { Star } from "lucide-react";
import cubaGallery1 from "@/assets/cuba-gallery-1.jpg";
import cubaGallery2 from "@/assets/cuba-gallery-2.jpg";
import cubaGallery3 from "@/assets/cuba-gallery-3.jpg";
import cubaGallery4 from "@/assets/cuba-gallery-4.jpg";
import cubaGallery5 from "@/assets/cuba-gallery-5.jpg";
import cubaGallery6 from "@/assets/cuba-gallery-6.jpg";

const GALLERY_PHOTOS = [cubaGallery1, cubaGallery2, cubaGallery3, cubaGallery4, cubaGallery5, cubaGallery6];

const RATING_BARS = [
  { label: "Location", value: 4.8 },
  { label: "Service", value: 4.6 },
  { label: "Amenities", value: 4.4 },
  { label: "Value", value: 4.2 },
];

const BEST_FOR = ["Couples", "Honeymoon", "Beach Lovers", "Luxury"];

interface PromoReviewSceneProps {
  visible: boolean;
  scrollProgress: number;
}

const PromoReviewScene = ({ visible, scrollProgress }: PromoReviewSceneProps) => {
  return (
    <div
      className="absolute inset-0 flex items-start justify-center bg-background overflow-hidden transition-opacity duration-400 pt-6 pb-6"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div
        className={`max-w-5xl w-full mx-4 transition-all duration-400 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        style={{ transform: visible ? `translateY(-${scrollProgress}px)` : "translateY(32px)" }}
      >
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg">
          {/* Header */}
          <div className="mb-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Sandals Royal Barbados
            </h2>
            <p className="text-muted-foreground text-sm mt-1">All-Inclusive Resort · St. Lawrence Gap, Barbados</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
              <Star className="h-5 w-5 fill-amber-400/50 text-amber-400" />
            </div>
            <span className="text-lg font-bold text-foreground">4.5</span>
            <span className="text-sm text-muted-foreground">RTG Score</span>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main column */}
            <div className="flex-1 space-y-5">
              <p className="text-muted-foreground leading-relaxed">
                Sandals Royal Barbados consistently impresses guests with its stunning beachfront
                location, exceptional service, and world-class dining options. The swim-up suites
                and rooftop pool are standout features that elevate this property above typical
                all-inclusive resorts.
              </p>

              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {GALLERY_PHOTOS.map((photo, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                      <img src={photo} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">What Travelers Say</h3>
                <div className="space-y-3">
                  <blockquote className="border-l-2 border-primary/30 pl-4 text-sm text-muted-foreground italic">
                    "The rooftop pool is absolutely breathtaking, the views of the Caribbean at sunset
                    are worth the trip alone. Staff remembered our names by day two."
                  </blockquote>
                  <blockquote className="border-l-2 border-primary/30 pl-4 text-sm text-muted-foreground italic">
                    "Best food we've had at any all-inclusive. The Japanese restaurant was a standout.
                    Only downside was the beach could get crowded mid-afternoon."
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-72 space-y-5">
              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="font-display text-lg font-bold text-foreground mb-3">Rating Breakdown</h3>
                <div className="space-y-3">
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
              </div>

              <div>
                <h3 className="font-display text-sm font-bold text-foreground mb-2">Best For</h3>
                <div className="flex flex-wrap gap-2">
                  {BEST_FOR.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoReviewScene;
