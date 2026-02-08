import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type CountryCode = "CA" | "US" | "GB";

const CANADIAN_TIMEZONES = [
  "America/Toronto",
  "America/Vancouver",
  "America/Edmonton",
  "America/Winnipeg",
  "America/Halifax",
  "America/St_Johns",
  "America/Regina",
  "America/Moncton",
  "America/Iqaluit",
  "America/Whitehorse",
  "America/Yellowknife",
  "America/Dawson",
  "America/Dawson_Creek",
  "America/Fort_Nelson",
  "America/Creston",
  "America/Goose_Bay",
  "America/Glace_Bay",
  "America/Rankin_Inlet",
  "America/Resolute",
  "America/Swift_Current",
  "America/Cambridge_Bay",
  "America/Inuvik",
  "America/Pangnirtung",
  "America/Atikokan",
  "America/Thunder_Bay",
  "America/Nipigon",
  "America/Rainy_River",
];

const UK_TIMEZONES = ["Europe/London"];

function detectCountry(): CountryCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (CANADIAN_TIMEZONES.includes(tz)) return "CA";
    if (UK_TIMEZONES.includes(tz)) return "GB";
  } catch {
    // fallback to US
  }
  return "US";
}

const EXPEDIA_LINKS: Record<CountryCode, string> = {
  CA: "https://expedia.com/affiliates/expedia-home.2FNlhXx",
  US: "https://expedia.com/affiliates/expedia-home.Ee1VYBn",
  GB: "https://expedia.com/affiliates/expedia-home.Ut28wxn",
};

const HOTELS_LINKS: Record<CountryCode, string> = {
  CA: "https://www.hotels.com/affiliates/hotelscom-home.JXhkPRM",
  US: "https://www.hotels.com/affiliates/hotelscom-home.oSbwDt4",
  GB: "https://www.hotels.com/affiliates/hotelscom-home.3by33jZ",
};

const VRBO_LINK = "https://www.jdoqocy.com/click-101645364-10697641?url=" + encodeURIComponent("https://www.vrbo.com");

function buildAffiliates(country: CountryCode) {
  return [
    {
      name: "Expedia",
      url: EXPEDIA_LINKS[country],
      color: "bg-[hsl(45,100%,51%)] hover:bg-[hsl(45,100%,45%)] text-[hsl(215,25%,15%)]",
    },
    {
      name: "Hotels.com",
      url: HOTELS_LINKS[country],
      color: "bg-[hsl(0,70%,40%)] hover:bg-[hsl(0,70%,33%)] text-white",
    },
    {
      name: "VRBO",
      url: VRBO_LINK,
      color: "bg-[hsl(205,85%,45%)] hover:bg-[hsl(205,85%,38%)] text-white",
    },
  ];
}

const AffiliateLinks = () => {
  const affiliates = useMemo(() => buildAffiliates(detectCountry()), []);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-foreground mb-4">
        Book or Compare Prices
      </h3>
      <div className="flex flex-wrap gap-3">
        {affiliates.map((affiliate) => (
          <Button
            key={affiliate.name}
            asChild
            className={`${affiliate.color} font-semibold gap-2`}
          >
            <a
              href={affiliate.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {affiliate.name}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Links may earn us a commission at no extra cost to you.
      </p>
    </div>
  );
};

export default AffiliateLinks;
