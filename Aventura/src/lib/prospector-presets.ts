/** Search phrases sent to Google Places. The label is what shows in the dropdown. */
export const SPORT_PRESETS: { label: string; query: string; group: string }[] = [
  { group: "Hockey", label: "Minor hockey associations", query: "minor hockey association" },
  { group: "Hockey", label: "Minor hockey leagues", query: "minor hockey league" },
  { group: "Hockey", label: "Men's hockey leagues", query: "men's hockey league" },
  { group: "Hockey", label: "Adult recreational hockey leagues", query: "adult recreational hockey league" },
  { group: "Hockey", label: "Women's hockey leagues", query: "women's hockey league" },
  { group: "Hockey", label: "Hockey clubs", query: "hockey club" },
  { group: "Soccer", label: "Minor soccer associations", query: "minor soccer association" },
  { group: "Soccer", label: "Youth soccer clubs", query: "youth soccer club" },
  { group: "Soccer", label: "Men's soccer leagues", query: "men's soccer league" },
  { group: "Soccer", label: "Adult soccer leagues", query: "adult soccer league" },
  { group: "Soccer", label: "Women's soccer leagues", query: "women's soccer league" },
  { group: "Soccer", label: "Soccer clubs", query: "soccer club" },
];

export const CUSTOM_QUERY = "__custom__";

/** Suggestions only. Any city can be typed. "Ontario, Canada" is added when no province is given. */
export const CITY_SUGGESTIONS = [
  "Brantford",
  "Paris",
  "Hamilton",
  "Burlington",
  "Oakville",
  "Mississauga",
  "Brampton",
  "Toronto",
  "Kitchener",
  "Waterloo",
  "Cambridge",
  "Guelph",
  "London",
  "Woodstock",
  "Simcoe",
  "St. Catharines",
  "Niagara Falls",
  "Welland",
  "Barrie",
  "Oshawa",
  "Whitby",
  "Markham",
  "Vaughan",
  "Milton",
  "Windsor",
  "Sarnia",
  "Kingston",
  "Ottawa",
];

export const PROSPECT_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "won", label: "Won" },
  { value: "not_interested", label: "Not interested" },
] as const;

export type ProspectStatus = (typeof PROSPECT_STATUSES)[number]["value"];

export function statusLabel(value: string): string {
  return PROSPECT_STATUSES.find((s) => s.value === value)?.label ?? value;
}

/** Adds the province when none was typed, so "London" means London, Ontario. */
export function geocodeTarget(location: string): string {
  const v = location.trim();
  return v.includes(",") ? v : `${v}, Ontario, Canada`;
}
