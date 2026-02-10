import { ExternalLink, Star } from "lucide-react";
import type { ThingToDo } from "@/hooks/useGenerateReview";
import { useMemo } from "react";

type CountryCode = "CA" | "US" | "GB";

const CANADIAN_TIMEZONES = [
  "America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg",
  "America/Halifax", "America/St_Johns", "America/Regina", "America/Moncton",
  "America/Iqaluit", "America/Whitehorse", "America/Yellowknife", "America/Dawson",
  "America/Dawson_Creek", "America/Fort_Nelson", "America/Creston", "America/Goose_Bay",
  "America/Glace_Bay", "America/Rankin_Inlet", "America/Resolute", "America/Swift_Current",
  "America/Cambridge_Bay", "America/Inuvik", "America/Pangnirtung", "America/Atikokan",
  "America/Thunder_Bay", "America/Nipigon", "America/Rainy_River",
];

function detectCountry(): CountryCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (CANADIAN_TIMEZONES.includes(tz)) return "CA";
    if (tz === "Europe/London") return "GB";
  } catch { /* fallback */ }
  return "US";
}

const EXPEDIA_LINKS: Record<CountryCode, string> = {
  CA: "https://expedia.com/affiliates/expedia-home.2FNlhXx",
  US: "https://expedia.com/affiliates/expedia-home.Ee1VYBn",
  GB: "https://expedia.com/affiliates/expedia-home.Ut28wxn",
};

interface ThingsToDoSectionProps {
  thingsToDo: ThingToDo[];
  functionUrl?: string;
}

const ThingsToDoSection = ({ thingsToDo, functionUrl }: ThingsToDoSectionProps) => {
  const expediaLink = useMemo(() => EXPEDIA_LINKS[detectCountry()], []);

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

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activity.description}
                </p>
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
