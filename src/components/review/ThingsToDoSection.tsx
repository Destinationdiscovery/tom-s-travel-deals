import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const CATEGORY_COLORS: Record<string, string> = {
  Adventure: "bg-primary/15 text-primary",
  Dining: "bg-accent/15 text-accent-foreground",
  Culture: "bg-secondary/15 text-secondary-foreground",
  Nature: "bg-primary/15 text-primary",
  Shopping: "bg-accent/15 text-accent-foreground",
  Nightlife: "bg-secondary/15 text-secondary-foreground",
  Relaxation: "bg-primary/15 text-primary",
  Sightseeing: "bg-accent/15 text-accent-foreground",
};

interface ThingsToDoSectionProps {
  thingsToDo: ThingToDo[];
}

const ThingsToDoSection = ({ thingsToDo }: ThingsToDoSectionProps) => {
  const expediaLink = useMemo(() => EXPEDIA_LINKS[detectCountry()], []);

  if (!thingsToDo || thingsToDo.length === 0) return null;

  return (
    <div>
      <h3 className="font-display text-2xl font-bold text-foreground mb-6">
        Things to Do Nearby
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {thingsToDo.slice(0, 3).map((activity, index) => (
          <div
            key={index}
            className="bg-card rounded-2xl p-5 shadow-soft flex flex-col justify-between"
          >
            <div>
              <Badge
                className={`mb-3 text-xs font-medium ${
                  CATEGORY_COLORS[activity.category] || "bg-muted text-muted-foreground"
                }`}
              >
                {activity.category}
              </Badge>
              <h4 className="font-display text-lg font-bold text-foreground mb-2">
                {activity.name}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {activity.description}
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="gap-1.5 w-full">
              <a href={expediaLink} target="_blank" rel="noopener noreferrer">
                Book on Expedia
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <a
          href={expediaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          See More Activities
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default ThingsToDoSection;
