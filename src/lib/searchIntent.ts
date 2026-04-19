/**
 * Lightweight search intent classifier.
 *
 * Decides whether a query should be sent to the single-property AI review flow
 * (`generate-review`) or routed to the list-view (`/reviews/:query`) which
 * uses `travel-search` to return a ranked list.
 *
 * Pure heuristic: no network, no AI, no latency.
 */

export type SearchIntent = "listicle" | "property";

const LISTICLE_KEYWORDS = [
  "best",
  "top",
  "cheapest",
  "luxury",
  "family",
  "adults only",
  "all-inclusive",
  "all inclusive",
  "boutique",
  "resorts",
  "hotels",
  "villas",
  "hostels",
  "cruises",
  "worth",
  "vs",
  "compare",
  "things to do",
  "where to stay",
  "near",
  "around",
  "list of",
];

const QUESTION_STARTERS = ["what", "where", "how", "is", "are", "which", "why", "when", "should"];

const PLURAL_PROPERTY_KEYWORDS = ["resorts", "hotels", "villas", "hostels", "cruises", "lodges", "inns"];

export function classifySearchIntent(rawQuery: string): SearchIntent {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return "property";

  const words = q.split(/\s+/);

  // Long queries are almost always discovery / listicle
  if (words.length > 5) return "listicle";

  // Question-form queries
  if (QUESTION_STARTERS.includes(words[0])) return "listicle";

  // Plural property keywords (resorts, hotels, etc.)
  if (PLURAL_PROPERTY_KEYWORDS.some((kw) => words.includes(kw))) return "listicle";

  // Listicle phrase / keyword match (whole word or phrase)
  if (LISTICLE_KEYWORDS.some((kw) => q.includes(kw))) return "listicle";

  return "property";
}

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
