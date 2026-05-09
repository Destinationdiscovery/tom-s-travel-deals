export type CountryCode = "CA" | "US" | "GB";

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
