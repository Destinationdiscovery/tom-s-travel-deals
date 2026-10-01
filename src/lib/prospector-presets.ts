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

export const OTHER_CITY = "__other__";

/**
 * City choices, grouped like the Foundsite prospector. Ontario cities are plain names.
 * Everywhere else ends with its province or state code so the lookup finds the right one.
 */
export const CITY_GROUPS: { label: string; cities: string[] }[] = [
  {
    label: "Canada: Ontario",
    cities: [
      "Brantford", "Paris", "Hamilton", "Burlington", "Oakville", "Mississauga", "Brampton", "Toronto",
      "Kitchener", "Waterloo", "Cambridge", "Guelph", "London", "Woodstock", "Simcoe", "St. Catharines",
      "Niagara Falls", "Welland", "Barrie", "Orillia", "Oshawa", "Whitby", "Ajax", "Pickering", "Markham",
      "Vaughan", "Richmond Hill", "Newmarket", "Aurora", "Milton", "Orangeville", "Stratford", "Windsor",
      "Sarnia", "Kingston", "Belleville", "Peterborough", "Ottawa", "Cornwall", "North Bay", "Sudbury",
      "Sault Ste. Marie", "Thunder Bay",
    ],
  },
  {
    label: "Canada: Quebec and Atlantic",
    cities: [
      "Montreal QC", "Quebec City QC", "Laval QC", "Gatineau QC", "Sherbrooke QC",
      "Halifax NS", "Moncton NB", "Saint John NB", "Fredericton NB", "Charlottetown PE", "St. John's NL",
    ],
  },
  {
    label: "Canada: Prairies and West",
    cities: [
      "Winnipeg MB", "Regina SK", "Saskatoon SK", "Calgary AB", "Edmonton AB", "Red Deer AB", "Lethbridge AB",
      "Vancouver BC", "Burnaby BC", "Surrey BC", "Abbotsford BC", "Kelowna BC", "Victoria BC",
    ],
  },
  {
    label: "United States: Northeast",
    cities: [
      "New York NY", "Boston MA", "Philadelphia PA", "Pittsburgh PA", "Buffalo NY", "Rochester NY", "Syracuse NY",
      "Albany NY", "Hartford CT", "Providence RI", "Newark NJ", "Baltimore MD", "Washington DC",
    ],
  },
  {
    label: "United States: Southeast",
    cities: [
      "Miami FL", "Orlando FL", "Tampa FL", "Jacksonville FL", "Atlanta GA", "Charlotte NC", "Raleigh NC",
      "Nashville TN", "Memphis TN", "Louisville KY", "Richmond VA", "Virginia Beach VA", "New Orleans LA",
    ],
  },
  {
    label: "United States: Midwest",
    cities: [
      "Chicago IL", "Detroit MI", "Cleveland OH", "Columbus OH", "Cincinnati OH", "Indianapolis IN",
      "Milwaukee WI", "Minneapolis MN", "St. Louis MO", "Kansas City MO", "Omaha NE", "Des Moines IA",
    ],
  },
  {
    label: "United States: Southwest",
    cities: [
      "Houston TX", "Dallas TX", "San Antonio TX", "Austin TX", "Fort Worth TX", "El Paso TX", "Phoenix AZ",
      "Tucson AZ", "Las Vegas NV", "Albuquerque NM", "Oklahoma City OK", "Tulsa OK",
    ],
  },
  {
    label: "United States: West",
    cities: [
      "Los Angeles CA", "San Francisco CA", "San Diego CA", "San Jose CA", "Sacramento CA", "Fresno CA",
      "Seattle WA", "Portland OR", "Denver CO", "Salt Lake City UT", "Boise ID",
    ],
  },
  {
    label: "United States: South",
    cities: ["Birmingham AL", "Montgomery AL", "Little Rock AR", "Jackson MS", "Columbia SC", "Charleston SC"],
  },
  {
    label: "Mexico",
    cities: [
      "Mexico City, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico", "Puebla, Mexico", "Tijuana, Mexico",
    ],
  },
];

export const ALL_CITIES: string[] = CITY_GROUPS.flatMap((g) => g.cities);

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

const CA_PROVINCES = new Set(["ON", "QC", "BC", "AB", "MB", "SK", "NS", "NB", "NL", "PE", "YT", "NT", "NU"]);
const US_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
  "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
  "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]);

/**
 * Turns what was picked or typed into something the map lookup understands.
 * "Denver CO" becomes USA, "Vancouver BC" becomes Canada, and a plain name is taken as Ontario.
 */
export function geocodeTarget(location: string): string {
  const v = location.trim();
  if (v.includes(",")) return v;
  const code = v.match(/\s([A-Z]{2})$/)?.[1];
  if (code && CA_PROVINCES.has(code)) return `${v}, Canada`;
  if (code && US_STATES.has(code)) return `${v}, USA`;
  return `${v}, Ontario, Canada`;
}

/** The people a lead can be assigned to, so two people do not chase the same club. */
export const ASSIGNEES = ["Tommy", "Christian", "Owen"] as const;

export const DO_NOT_CONTACT_REASONS = [
  "Asked not to be contacted",
  "Not a fit",
  "Already has a photographer",
  "Other",
] as const;
