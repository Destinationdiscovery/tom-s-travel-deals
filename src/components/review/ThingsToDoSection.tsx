import { ExternalLink, Star } from "lucide-react";
import type { ThingToDo } from "@/hooks/useGenerateReview";
import { useMemo } from "react";
import { buildDeepLinks, detectCountry } from "@/components/AffiliateLinks";

interface ThingsToDoSectionProps {
  thingsToDo: ThingToDo[];
  functionUrl?: string;
  propertyName?: string;
}

const ThingsToDoSection = ({ thingsToDo, functionUrl, propertyName }: ThingsToDoSectionProps) => {
  const expediaLink = useMemo(() => {
    const country = detectCountry();
    return buildDeepLinks(country, propertyName).expedia;
  }, [propertyName]);

  if (!thingsToDo || thingsToDo.length === 0) return null;

  return (
    <div>
      <h3 className="font-display text-2xl font-bold text-foreground mb-6">
        Things to Do Nearby
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {thingsToDo.slice(0, 3).map((activity, index) => {
          const photoUrl = activity.photoReference && functionUrl
            ? `${functionUrl}?name=${encodeURIComponent(activity.photoReference)}`
            : null;

          return (
            <div
              key={index}
              className="bg-card rounded-2xl overflow-hidden shadow-soft flex flex-col"
            >
              {/* Photo */}
              {photoUrl && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  {activity.category}
                </span>
                <h4 className="font-display text-lg font-bold text-foreground mb-1">
                  {activity.name}
                </h4>

                {/* Star rating */}
                {activity.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.floor(activity.rating!)
                            ? "text-accent fill-accent"
                            : i < activity.rating!
                            ? "text-accent fill-accent opacity-50"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="text-sm font-medium text-foreground ml-1">
                      {activity.rating}
                    </span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {activity.description}
                </p>
                <a
                  href={expediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Book this
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <a
          href={expediaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          Explore more things to do
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default ThingsToDoSection;
