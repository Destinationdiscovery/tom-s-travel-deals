/**
 * Lightweight search intent classifier.
 *
 * Two classifiers:
 *  - classifyToolIntent: routes free-text queries to one of the 8 travel tools
 *    (gear, safety, visa/intel, best-time, currency, flights, itinerary, intel).
 *  - classifySearchIntent: legacy listicle vs single-property decision used when
 *    no tool intent matches.
 *
 * Pure heuristics: no network, no AI, no latency.
 */

export type SearchIntent = "listicle" | "property";

export type ToolIntent =
  | "gear"
  | "safety"
  | "visa"
  | "best-time"
  | "currency"
  | "flights"
  | "itinerary"
  | "intel"
  | null;

const LISTICLE_KEYWORDS = [
  "best", "top", "cheapest", "luxury", "family", "adults only",
  "all-inclusive", "all inclusive", "boutique", "resorts", "hotels",
  "villas", "hostels", "cruises", "worth", "vs", "compare",
  "things to do", "where to stay", "near", "around", "list of",
];

const QUESTION_STARTERS = ["what", "where", "how", "is", "are", "which", "why", "when", "should"];
const PLURAL_PROPERTY_KEYWORDS = ["resorts", "hotels", "villas", "hostels", "cruises", "lodges", "inns"];

// Keyword sets per tool. Order in classifyToolIntent matters: more specific first.
const VISA_KEYWORDS = ["visa", "entry requirement", "entry requirements", "passport", "do i need a visa", "customs requirement", "evisa", "esta", "eta required"];
const SAFETY_KEYWORDS = ["safe", "safety", "dangerous", "danger", "crime", "advisory", "advisories", "is it safe", "how safe"];
const GEAR_KEYWORDS = ["pack", "packing", "what to bring", "what to pack", "suitcase", "luggage", "gear", "what should i bring"];
const BEST_TIME_KEYWORDS = ["best time", "when to visit", "when to go", "best month", "best season", "weather in", "monsoon", "rainy season", "dry season", "peak season"];
const CURRENCY_KEYWORDS = ["currency", "exchange rate", "exchange rates", "how much is", "tipping", "convert ", "to usd", "to eur", "to gbp", "cost of"];
const FLIGHT_KEYWORDS = ["flight", "flights", "fly to", "fly from", "cheap flights", "airline", "airfare", "airport"];
const ITINERARY_KEYWORDS = ["itinerary", "days in", "day trip", "plan a trip", "plan my trip", "week in", "weekend in"];
const INTEL_KEYWORDS = ["know before you go", "travel intel", "customs etiquette", "etiquette", "language tips", "cultural tips", "tipping culture", "what to know"];

function hasAny(q: string, keywords: string[]): boolean {
  return keywords.some((kw) => q.includes(kw));
}

// Day-count itinerary pattern: "3 days in italy", "5-day japan trip"
const ITINERARY_PATTERN = /\b\d+\s*[- ]?(day|days)\b/;

export function classifyToolIntent(rawQuery: string): ToolIntent {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return null;

  // Most specific first: visa beats safety beats generic question starters
  if (hasAny(q, VISA_KEYWORDS)) return "visa";
  if (hasAny(q, SAFETY_KEYWORDS)) return "safety";
  if (hasAny(q, GEAR_KEYWORDS)) return "gear";
  if (hasAny(q, BEST_TIME_KEYWORDS)) return "best-time";
  if (hasAny(q, CURRENCY_KEYWORDS)) return "currency";
  if (hasAny(q, FLIGHT_KEYWORDS)) return "flights";
  if (hasAny(q, ITINERARY_KEYWORDS) || ITINERARY_PATTERN.test(q)) return "itinerary";
  if (hasAny(q, INTEL_KEYWORDS)) return "intel";

  return null;
}

/**
 * Resolve a ToolIntent to the URL the hero should navigate to. Visa folds into
 * /travel-intel?type=requirements until a dedicated page exists.
 */
export function toolIntentToPath(intent: Exclude<ToolIntent, null>, query: string): string {
  const q = encodeURIComponent(query);
  switch (intent) {
    case "gear": return `/gear?q=${q}`;
    case "safety": return `/safety?q=${q}`;
    case "visa": return `/travel-intel?type=requirements&q=${q}`;
    case "best-time": return `/best-time?q=${q}`;
    case "currency": return `/currency?q=${q}`;
    case "flights": return `/flights?q=${q}`;
    case "itinerary": return `/itinerary?q=${q}`;
    case "intel": return `/travel-intel?type=advisories&q=${q}`;
  }
}

export function classifySearchIntent(rawQuery: string): SearchIntent {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return "property";

  const words = q.split(/\s+/);

  if (words.length > 5) return "listicle";
  if (QUESTION_STARTERS.includes(words[0])) return "listicle";
  if (PLURAL_PROPERTY_KEYWORDS.some((kw) => words.includes(kw))) return "listicle";
  if (LISTICLE_KEYWORDS.some((kw) => q.includes(kw))) return "listicle";

  return "property";
}

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
