import { useMemo } from "react";
import { ExternalLink } from "lucide-react";

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

const UK_TIMEZONES = ["Europe/London"];

export function detectCountry(): CountryCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (CANADIAN_TIMEZONES.includes(tz)) return "CA";
    if (UK_TIMEZONES.includes(tz)) return "GB";
  } catch {
    // fallback to US
  }
  return "US";
}

export const EXPEDIA_LINKS: Record<CountryCode, string> = {
  CA: "https://expedia.com/affiliates/expedia-home.2FNlhXx",
  US: "https://expedia.com/affiliates/expedia-home.Ee1VYBn",
  GB: "https://expedia.com/affiliates/expedia-home.Ut28wxn",
};

export const HOTELS_LINKS: Record<CountryCode, string> = {
  CA: "https://www.hotels.com/affiliates/hotelscom-home.JXhkPRM",
  US: "https://www.hotels.com/affiliates/hotelscom-home.oSbwDt4",
  GB: "https://www.hotels.com/affiliates/hotelscom-home.3by33jZ",
};

const VRBO_CJ_BASE = "https://www.jdoqocy.com/click-101645364-10697641?url=";

export const VRBO_LINK = VRBO_CJ_BASE + encodeURIComponent("https://www.vrbo.com");

export function buildDeepLinks(country: CountryCode, propertyName?: string) {
  if (!propertyName) {
    return {
      expedia: EXPEDIA_LINKS[country],
      hotels: HOTELS_LINKS[country],
      vrbo: VRBO_LINK,
    };
  }
  const q = encodeURIComponent(propertyName);
  return {
    expedia: EXPEDIA_LINKS[country] + `?destination=${q}`,
    hotels: HOTELS_LINKS[country] + `?q-destination=${q}`,
    vrbo: VRBO_CJ_BASE + encodeURIComponent(`https://www.vrbo.com/search?query=${propertyName}`),
  };
}

interface AffiliateLinksProps {
  propertyName?: string;
}

const AffiliateLinks = ({ propertyName }: AffiliateLinksProps) => {
  const affiliates = useMemo(() => {
    const country = detectCountry();
    const links = buildDeepLinks(country, propertyName);
    return [
      {
        name: "Expedia",
        url: links.expedia,
        tagline: "Bundle hotel + flight for savings",
        color: "border-[hsl(45,100%,51%)]/30 hover:border-[hsl(45,100%,51%)]",
        accent: "text-[hsl(45,100%,45%)]",
      },
      {
        name: "Hotels.com",
        url: links.hotels,
        tagline: "Earn a free night every 10 stays",
        color: "border-[hsl(0,70%,40%)]/30 hover:border-[hsl(0,70%,40%)]",
        accent: "text-[hsl(0,70%,40%)]",
      },
      {
        name: "VRBO",
        url: links.vrbo,
        tagline: "Best for groups & longer stays",
        color: "border-[hsl(205,85%,45%)]/30 hover:border-[hsl(205,85%,45%)]",
        accent: "text-[hsl(205,85%,45%)]",
      },
    ];
  }, [propertyName]);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-foreground mb-1">
        Ready to Book?
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Compare rates across top platforms
      </p>
      <a
        href={affiliates[0].url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-secondary text-secondary-foreground font-bold text-sm py-3 mb-4 hover:opacity-90 transition-opacity"
      >
        Book on Expedia
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <div className="flex flex-col gap-3">
        {affiliates.map((affiliate) => (
          <a
            key={affiliate.name}
            href={affiliate.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between gap-3 rounded-xl border-2 ${affiliate.color} bg-background p-4 transition-all duration-200 hover:shadow-sm group`}
          >
            <div>
              <span className={`font-semibold text-sm ${affiliate.accent}`}>
                {affiliate.name}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {affiliate.tagline}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Links may earn us a commission at no extra cost to you.
      </p>
    </div>
  );
};

export default AffiliateLinks;
