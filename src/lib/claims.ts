// Data and logic for the flight claim guide.
//
// This tool shows which published rules may apply to a disrupted flight, the published
// amounts and deadlines, where to file, and sample wording the visitor edits and sends.
// It does not decide whether anyone is owed money, and it never files anything.
// Every rule below carries a source, a status and the date we checked it.

export type Issue = "delay" | "cancel" | "bumped";
export type Place = "ca" | "us" | "eu" | "uk" | "other";
export type RegimeId = "ca" | "eu" | "uk" | "us";
export type DelayBand = "under3" | "3to6" | "6to9" | "9plus";
export type Distance = "short" | "medium" | "long";
export type Size = "large" | "small" | "unsure";

export type Finder = {
  issue: Issue;
  from: Place;
  to: Place;
  airline: Place;
  delay: DelayBand;
  distance: Distance;
  size: Size;
};

export type Source = { label: string; href: string };
export type Status = "ok" | "unc" | "sched";
export type Line = { label: string; value: string };

export const CHECKED = "02 Oct 2026";

export const PLACE_LABEL: Record<Place, string> = {
  ca: "Canada",
  us: "United States",
  eu: "European Union",
  uk: "United Kingdom",
  other: "Somewhere else",
};

export const ISSUE_LABEL: Record<Issue, string> = {
  delay: "Delayed, I arrived late",
  cancel: "Cancelled",
  bumped: "Denied boarding (bumped from an oversold flight)",
};

export const DELAY_LABEL: Record<DelayBand, string> = {
  under3: "Under 3 hours late",
  "3to6": "3 to under 6 hours late",
  "6to9": "6 to under 9 hours late",
  "9plus": "9 hours or more late",
};

export const DISTANCE_LABEL: Record<Distance, string> = {
  short: "Up to 1,500 km",
  medium: "1,500 to 3,500 km",
  long: "Over 3,500 km",
};

export const DEFAULT_FINDER: Finder = {
  issue: "delay",
  from: "ca",
  to: "eu",
  airline: "ca",
  delay: "3to6",
  distance: "long",
  size: "unsure",
};

export function validateFinder(f: Finder): string | null {
  if (f.from === "other" && f.to === "other") {
    return "None of the places we cover is on this route. Rules exist in other countries. Check the aviation regulator of the airline's country or the country you left from.";
  }
  return null;
}

// Which rule sets may apply, based only on the published scope of each.
export function regimesFor(f: Finder): RegimeId[] {
  const out: RegimeId[] = [];
  if (f.from === "ca" || f.to === "ca") out.push("ca");
  if (f.from === "eu" || (f.to === "eu" && f.airline === "eu")) out.push("eu");
  // UK law covers flights leaving the UK on any airline, flights arriving in the UK on an EU or UK airline,
  // and flights arriving in the EU on a UK airline (UK Civil Aviation Authority).
  if (
    f.from === "uk" ||
    (f.to === "uk" && (f.airline === "uk" || f.airline === "eu")) ||
    (f.to === "eu" && f.airline === "uk")
  ) {
    out.push("uk");
  }
  // US denied boarding compensation covers flights leaving the US. Refund rules cover flights to or from the US.
  if (f.issue === "bumped" ? f.from === "us" : f.from === "us" || f.to === "us") out.push("us");
  return out;
}

export type RegimeInfo = {
  id: RegimeId;
  name: string;
  scope: string;
  official: Source;
  deadline: string;
  escalation: { text: string; href: string; label: string };
  checked: string;
};

export const REGIMES: Record<RegimeId, RegimeInfo> = {
  ca: {
    id: "ca",
    name: "Canada, Air Passenger Protection Regulations",
    scope: "According to the Canadian Transportation Agency, these rules cover flights to, from and within Canada.",
    official: {
      label: "Canadian Transportation Agency",
      href: "https://protection-passager-passenger.otc-cta.gc.ca/en/refunds-and-compensation/flight-delays-cancellations-rebooking-refunds-compensation",
    },
    deadline:
      "According to the Canadian Transportation Agency, a claim goes to the airline in writing within one year. The airline should answer within 30 days. If it does not, or you disagree, you can complain to the Agency or go to small claims court. Court action for damages under the Montreal Convention has a two-year limit.",
    escalation: {
      text: "Complain to the Canadian Transportation Agency after you have written to the airline.",
      href: "https://protection-passager-passenger.otc-cta.gc.ca/en",
      label: "Canadian Transportation Agency",
    },
    checked: "01 Oct 2026",
  },
  eu: {
    id: "eu",
    name: "European Union, Regulation 261/2004",
    scope:
      "According to Your Europe, EU rules apply to flights within the EU on any airline, flights from the EU to a non-EU country on any airline, and flights into the EU from outside it on an EU airline. They do not apply if you already received benefits for the same journey under a non-EU country's law.",
    official: {
      label: "Your Europe, air passenger rights",
      href: "https://europa.eu/youreurope/citizens/travel/passenger-rights/air",
    },
    deadline:
      "According to Your Europe, you should contact the airline first. Time limits to claim depend on the country where a claim would be brought, so check yours early.",
    escalation: {
      text: "Complain to the national enforcement body of the country where the disruption happened. The official page explains how to find it.",
      href: "https://europa.eu/youreurope/citizens/travel/passenger-rights/air",
      label: "Your Europe, air passenger rights",
    },
    checked: "02 Oct 2026",
  },
  uk: {
    id: "uk",
    name: "United Kingdom, UK261",
    scope:
      "According to the UK Civil Aviation Authority, UK law covers flights leaving a UK airport on any airline, flights arriving at a UK airport on an EU or UK airline, and flights arriving at an EU airport on a UK airline.",
    official: {
      label: "UK Civil Aviation Authority, delays",
      href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/",
    },
    deadline:
      "According to the UK Civil Aviation Authority, compensation is not paid automatically, so you claim from the airline first. If the airline takes more than eight weeks to respond, or you are not satisfied with its final response, you can escalate. The CAA pages we read do not state a time limit for claims, so check the limit that applies where you would bring one.",
    escalation: {
      text: "Escalate to an approved alternative dispute resolution body if the airline is signed up to one. If it is not, the CAA's Passenger Advice and Complaints Team can help.",
      href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/travel-complaints/making-a-claim/claiming-for-costs-and-compensation/",
      label: "UK Civil Aviation Authority, claiming for costs and compensation",
    },
    checked: "02 Oct 2026",
  },
  us: {
    id: "us",
    name: "United States, Department of Transportation rules",
    scope:
      "According to the US Department of Transportation, denied boarding compensation covers domestic flights and international flights leaving the US. Refund rules cover flights to, within and from the US.",
    official: {
      label: "US Department of Transportation, bumping and oversales",
      href: "https://www.transportation.gov/individuals/aviation-consumer-protection/bumping-oversales",
    },
    deadline: "Ask the airline in writing as soon as you can, and keep every reply.",
    escalation: {
      text: "If the airline does not resolve it, you can file a complaint with the Department of Transportation's aviation consumer protection office.",
      href: "https://www.transportation.gov/airconsumer/fly-rights",
      label: "US Department of Transportation, Fly Rights",
    },
    checked: "01 Oct 2026",
  },
};

const EU_AMOUNT: Record<Distance, string> = { short: "€250", medium: "€400", long: "€600" };

// UK tiers from the Civil Aviation Authority's delay, cancellation and denied boarding pages.
const UK_TIER: Record<Distance, { full: string; half: string; hours: string }> = {
  short: { full: "£220", half: "£110", hours: "2" },
  medium: { full: "£350", half: "£175", hours: "3" },
  long: { full: "£520", half: "£260", hours: "4" },
};

// The published amounts that line up with the visitor's answers. These are published figures,
// not a finding that the visitor is owed them.
export function amountLines(regime: RegimeId, f: Finder): Line[] {
  const lines: Line[] = [];

  if (regime === "ca") {
    if (f.issue === "bumped") {
      lines.push({
        label: "Denied boarding",
        value:
          "Compensation depends on how late you reach your destination. See the Canadian Transportation Agency page for the current amounts.",
      });
    } else if (f.delay === "under3") {
      lines.push({
        label: "Arriving under 3 hours late",
        value: "No compensation under this rule. The published threshold is 3 hours.",
      });
    } else {
      const amounts: Record<Exclude<DelayBand, "under3">, [string, string]> = {
        "3to6": ["C$400", "C$125"],
        "6to9": ["C$700", "C$250"],
        "9plus": ["C$1,000", "C$500"],
      };
      const [large, small] = amounts[f.delay];
      const value =
        f.size === "large"
          ? `${large} (large airline)`
          : f.size === "small"
            ? `${small} (small airline)`
            : `${large} for a large airline, ${small} for a small airline`;
      lines.push({ label: DELAY_LABEL[f.delay], value });
      lines.push({
        label: "If you take a refund instead of travelling",
        value: "C$400 (large airline) or C$125 (small airline), in addition to the refund.",
      });
    }
    if (f.issue !== "bumped") {
      lines.push({
        label: "Conditions in the published rule",
        value:
          "The cause is fully within the airline's control and not required for safety, you were told 14 days or less before departure, and you arrived 3 or more hours late. You cannot receive it if you already received compensation for the same disruption under another country's rules.",
      });
    }
    lines.push({
      label: "Care while you wait",
      value:
        "The standard of treatment (food, drink, communication, accommodation) depends on the delay and its cause. See the Canadian Transportation Agency page.",
    });
  }

  if (regime === "eu") {
    if (f.issue === "delay" && f.delay === "under3") {
      lines.push({
        label: "Arriving under 3 hours late",
        value: "No fixed compensation under this rule. The published threshold is 3 hours at your final destination.",
      });
    } else {
      lines.push({
        label: `Flight distance, ${DISTANCE_LABEL[f.distance].toLowerCase()}`,
        value: `${EU_AMOUNT[f.distance]} per passenger`,
      });
      lines.push({
        label: "Published amounts by distance",
        value: "€250 up to 1,500 km, €400 up to 3,500 km, €600 beyond.",
      });
    }
    if (f.issue === "cancel") {
      lines.push({
        label: "For cancellations",
        value:
          "Whether compensation applies depends on how early you were told and what re-route was offered. Read the official page.",
      });
    }
    lines.push({
      label: "Exception in the published rule",
      value: "No compensation if the airline shows the cause was an extraordinary circumstance it could not avoid.",
    });
    lines.push({
      label: "Care while you wait",
      value: "Meals and drinks, hotel accommodation with transfers if needed, and communication facilities, depending on the wait and the distance.",
    });
  }

  if (regime === "uk") {
    const t = UK_TIER[f.distance];
    if (f.issue === "delay") {
      if (f.delay === "under3") {
        lines.push({
          label: "Arriving under 3 hours late",
          value: "No fixed compensation under this rule. The published threshold is more than three hours at your destination airport.",
        });
      } else if (f.distance === "long") {
        lines.push({
          label: `Flight distance, ${DISTANCE_LABEL.long.toLowerCase()}`,
          value: "£260 per person if you arrive 3 to 4 hours late, £520 per person if you arrive more than 4 hours late.",
        });
      } else {
        lines.push({
          label: `Flight distance, ${DISTANCE_LABEL[f.distance].toLowerCase()}`,
          value: `${t.full} per person`,
        });
      }
      lines.push({
        label: "Published amounts by distance",
        value: "£220 under 1,500 km, £350 from 1,500 to 3,500 km, £520 over 3,500 km (£260 if you arrive 3 to 4 hours late).",
      });
      lines.push({
        label: "If your delay is long",
        value:
          "A delay of at least five hours lets you choose not to travel and get a refund for the flights you have not yet taken.",
      });
    }
    if (f.issue === "cancel") {
      lines.push({
        label: "Notice of 14 days or more",
        value: "The CAA says compensation may apply if you received less than 14 days' notice of the cancellation.",
      });
      lines.push({
        label: `Notice of 7 to 14 days, ${DISTANCE_LABEL[f.distance].toLowerCase()}`,
        value: `${t.full} if you arrive ${t.hours} or more hours late, ${t.half} if you arrive less late. Some replacement-flight timings pay nothing, so read the CAA table.`,
      });
      lines.push({
        label: `Notice of under 7 days, ${DISTANCE_LABEL[f.distance].toLowerCase()}`,
        value:
          f.distance === "long"
            ? "£520 if you arrive 4 or more hours late, £260 if less late. No compensation if the new flight leaves no more than one hour earlier and arrives less than two hours later."
            : `${t.full} if you arrive ${t.hours} or more hours late. No compensation if the new flight leaves no more than one hour earlier and arrives less than two hours later.`,
      });
    }
    if (f.issue === "bumped") {
      lines.push({
        label: `Denied boarding against your will, ${DISTANCE_LABEL[f.distance].toLowerCase()}`,
        value: `${t.full} if you arrive ${t.hours} or more hours later than planned, ${t.half} if you arrive less late. You must have checked in on time.`,
      });
    }
    lines.push({
      label: "Exception in the published rule",
      value:
        "No compensation if the airline shows the cause was an extraordinary circumstance. The CAA lists weather, unrelated strikes, terrorism or sabotage, security risks, civil unrest and hidden manufacturing defects as likely examples.",
    });
    lines.push({
      label: "Care while you wait",
      value:
        "Food and drink, two calls or emails, and a hotel with transport if you are delayed overnight, whatever the cause, once your delay passes 2 hours (under 1,500 km), 3 hours (1,500 to 3,500 km) or 4 hours (over 3,500 km).",
    });
  }

  if (regime === "us") {
    if (f.issue === "bumped") {
      lines.push({
        label: "Involuntary denied boarding on an oversold flight",
        value:
          "200% of the one-way fare (airlines may cap it at $1,075), or 400% (capped at $2,150), depending on how late you reach your destination.",
      });
      lines.push({
        label: "Also required",
        value: "The airline must give you a written statement of your rights.",
      });
    } else {
      lines.push({
        label: "Delay compensation",
        value:
          "There is no federal fixed payment for a late flight. We found reports that the Department of Transportation withdrew a proposal for one in November 2025. Confirm on the official site.",
      });
      lines.push({
        label: "If the airline cancels or significantly changes your flight",
        value:
          "You can ask for a cash refund if you choose not to travel. Reported thresholds are 3 or more hours domestic and 6 or more hours international.",
      });
    }
  }

  return lines;
}

export type Rule = {
  title: string;
  body: string;
  status: Status;
  checked: string;
  sources: Source[];
};

const CAA_DELAYS_SRC: Source = {
  label: "UK Civil Aviation Authority, delays",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/",
};
const CAA_CANCEL_SRC: Source = {
  label: "UK Civil Aviation Authority, cancellations",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/cancellations/",
};
const CAA_BUMP_SRC: Source = {
  label: "UK Civil Aviation Authority, denied boarding",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/denied-boarding/",
};
const CAA_CLAIM_SRC: Source = {
  label: "UK Civil Aviation Authority, claiming for costs and compensation",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/travel-complaints/making-a-claim/claiming-for-costs-and-compensation/",
};
const CAA_EXTRA_SRC: Source = {
  label: "UK Civil Aviation Authority, am I entitled to compensation",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/travel-complaints/making-a-claim/am-i-entitled-to-compensation/",
};

export const RULES: Rule[] = [
  {
    title: "Canada, APPR",
    body: "According to the Canadian Transportation Agency, these rules cover flights to, from and within Canada. Compensation for delays and cancellations applies when the cause is fully within the airline's control and not required for safety, you were told 14 days or less before departure, and you arrive 3 or more hours late. Large airlines: C$400, C$700 and C$1,000 at 3, 6 and 9 hours. Small airlines: C$125, C$250 and C$500. A claim goes to the airline in writing within one year. It is not available if you already received compensation for the same disruption under another country's rules.",
    status: "ok",
    checked: "01 Oct 2026",
    sources: [REGIMES.ca.official],
  },
  {
    title: "United States, denied boarding",
    body: "According to the US Department of Transportation, involuntary denied boarding on an oversold flight pays 200% of the one-way fare (airlines may cap it at $1,075) or 400% (capped at $2,150), depending on how late you arrive. It applies to domestic flights and international flights leaving the US.",
    status: "ok",
    checked: "01 Oct 2026",
    sources: [REGIMES.us.official],
  },
  {
    title: "United States, refunds and delays",
    body: "According to secondary sources, there is no federal fixed payment for a delayed flight, and a cash refund is available if the airline cancels or significantly changes your flight and you choose not to travel. The 3 hour domestic and 6 hour international thresholds come from those sources, so confirm them on the official site.",
    status: "unc",
    checked: "01 Oct 2026",
    sources: [{ label: "US Department of Transportation, Fly Rights", href: "https://www.transportation.gov/airconsumer/fly-rights" }],
  },
  {
    title: "European Union, Regulation 261/2004",
    body: "According to Your Europe, EU rules apply to flights within the EU on any airline, flights from the EU to a non-EU country on any airline, and flights into the EU from outside it on an EU airline. You are entitled to compensation if you arrive 3 or more hours late, unless the delay was due to extraordinary circumstances. According to FIA Region I, the amounts are €250 up to 1,500 km, €400 up to 3,500 km and €600 beyond. Time limits to claim depend on the country.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [
      REGIMES.eu.official,
      {
        label: "FIA Region I, 16 Jun 2026",
        href: "https://www.fiaregion1.com/eu-agreement-on-air-passenger-rights-preserves-core-consumer-protections/",
      },
    ],
  },
  {
    title: "European Union, reform of Regulation 261",
    body: "According to the Centre for Aviation, the European Parliament approved a reform on 7 July 2026 by 646 votes to 12. It keeps the 3 hour threshold. Reported changes include nine months to file a request and 30 days for airlines to pay or explain. New rules are expected to apply from the second half of 2027, and today's rules apply until then. Reports differ on whether the lowest amount stays at €250 or moves to €300.",
    status: "sched",
    checked: "01 Oct 2026",
    sources: [
      {
        label: "Centre for Aviation, 7 Jul 2026",
        href: "https://centreforaviation.com/news/eu-parliament-approves-upgraded-air-passenger-rights-1365276",
      },
      { label: "SkyRefund", href: "https://skyrefund.com/en/blog/eu261-reform-2026" },
      {
        label: "FIA Region I, 16 Jun 2026",
        href: "https://www.fiaregion1.com/eu-agreement-on-air-passenger-rights-preserves-core-consumer-protections/",
      },
    ],
  },
  {
    title: "United Kingdom, UK261 scope and amounts",
    body: "According to the UK Civil Aviation Authority, UK law covers flights leaving a UK airport on any airline, flights arriving at a UK airport on an EU or UK airline, and flights arriving at an EU airport on a UK airline. For delays of more than three hours at your destination airport, the amounts are £220 under 1,500 km, £350 from 1,500 to 3,500 km, and over 3,500 km £260 for 3 to 4 hours late or £520 for more than 4 hours. Cancellations and denied boarding have lower tiers (£110, £175, £260) when you arrive less late, and cancellations depend on how much notice you had.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [CAA_DELAYS_SRC, CAA_CANCEL_SRC, CAA_BUMP_SRC],
  },
  {
    title: "United Kingdom, how to claim and escalate",
    body: "According to the UK Civil Aviation Authority, compensation is not paid automatically and you claim from the airline first, often using its claim form. Some airlines will not deal with claims made through claims companies and want them submitted directly. If you are not satisfied with the final response, or the airline takes more than eight weeks, you can escalate to an approved alternative dispute resolution body, or to the CAA's Passenger Advice and Complaints Team if the airline is not signed up to one. The pages we read do not state a time limit for claims.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [CAA_DELAYS_SRC, CAA_CLAIM_SRC],
  },
  {
    title: "United Kingdom, extraordinary circumstances",
    body: "According to the UK Civil Aviation Authority, no compensation is due where the cause was an extraordinary circumstance. The main categories likely to qualify are weather incompatible with safe flying, strikes unrelated to the airline, terrorism or sabotage, security risks, political or civil unrest, and hidden manufacturing defects. It says court rulings have generally not treated ordinary technical faults as extraordinary. If you are unsure, you can claim and the airline should explain the reason it relies on.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [CAA_EXTRA_SRC],
  },
  {
    title: "United Kingdom, care and expenses",
    body: "According to the UK Civil Aviation Authority, airlines must provide care whatever the cause once a delay passes 2 hours (flights under 1,500 km), 3 hours (1,500 to 3,500 km) or 4 hours (over 3,500 km): food and drink, two phone calls or emails, and a hotel with transport if overnight. If the airline does not, you may make reasonable arrangements and claim the cost back. Keep itemised receipts, because airlines are unlikely to accept alcohol or luxury hotels. A delay of at least five hours lets you choose a refund instead of travelling.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [CAA_DELAYS_SRC, CAA_CANCEL_SRC],
  },
  {
    title: "United Kingdom, separate bookings",
    body: "According to the UK Civil Aviation Authority, if your journey is made of separate bookings, sometimes called self-transfer, you do not have a statutory right to care, compensation or transport to your last destination if a delay makes you miss a flight. The entitlements for each individual flight still apply. On a single booking, your rights are based on the distance between the first and last airport.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [CAA_DELAYS_SRC],
  },
];

export type Stat = { n: string; text: string; sources: Source[] };

export const PAIN: Stat[] = [
  {
    n: "60%",
    text: "of passengers in Europe who may be entitled to compensation do not make a claim, according to AirHelp, a claims company.",
    sources: [
      {
        label: "IT Brief, 24 Aug 2026",
        href: "https://itbrief.co.uk/story/airhelp-launches-ai-flight-compensation-checker-on-chatgpt",
      },
    ],
  },
  {
    n: "58%",
    text: "of claims AirHelp judged eligible were first rejected by airlines in its latest data, up from 52% in 2024. In 2024 more than a quarter of rejections were no reply at all.",
    sources: [
      {
        label: "ITIJ, 6 Sep 2026",
        href: "https://www.itij.com/latest/news/airlines-reject-58-valid-passenger-compensation-claims-airhelp-says",
      },
      { label: "AirHelp blog", href: "https://www.airhelp.com/en/blog/wrongful-claim-rejections/" },
    ],
  },
  {
    n: "25%",
    text: "of airlines tell passengers about their rights during a disruption, according to AirHelp.",
    sources: [
      {
        label: "IT Brief, 24 Aug 2026",
        href: "https://itbrief.co.uk/story/airhelp-launches-ai-flight-compensation-checker-on-chatgpt",
      },
    ],
  },
  {
    n: "35%",
    text: "is the service fee AirHelp lists, plus 15% more if legal action is needed. Claims companies take a share of the payout so the passenger does not have to chase it.",
    sources: [{ label: "AirHelp fees", href: "https://www.airhelp.com/en/our-fees/" }],
  },
];

// ---------------------------------------------------------------------------
// Sample wording. The visitor edits it and sends it. We never send it for them.

export type Details = {
  name: string;
  airline: string;
  flight: string;
  date: string;
  from: string;
  to: string;
  booking: string;
  arrival: string;
  reason: string;
  costs: string;
};

export const EMPTY_DETAILS: Details = {
  name: "",
  airline: "",
  flight: "",
  date: "",
  from: "",
  to: "",
  booking: "",
  arrival: "",
  reason: "",
  costs: "",
};

export type Script = { id: string; title: string; when: string; subject: string; body: string };

function v(value: string, placeholder: string): string {
  const t = value.trim();
  return t === "" ? `[${placeholder}]` : t;
}

// Make sure typed text ends like a sentence before more text follows it.
function sentence(value: string): string {
  const t = value.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function happened(f: Finder, d: Details): string {
  const what =
    f.issue === "delay"
      ? "was delayed"
      : f.issue === "cancel"
        ? "was cancelled"
        : "left without me because I was denied boarding";
  const arrival =
    f.issue === "bumped"
      ? ""
      : ` I arrived ${v(d.arrival, "how late you arrived, for example 4 hours 10 minutes after the scheduled time")}.`;
  return `I was a passenger on ${v(d.airline, "airline")} flight ${v(d.flight, "flight number")} from ${v(d.from, "origin")} to ${v(d.to, "destination")} on ${v(d.date, "date")}. The flight ${what}.${arrival} My booking reference is ${v(d.booking, "booking reference")}.`;
}

const REQUEST: Record<RegimeId, (f: Finder) => string> = {
  ca: () =>
    "I am requesting the compensation provided under the Air Passenger Protection Regulations for this disruption.",
  eu: () => "I am requesting the compensation provided under Regulation (EC) No 261/2004 for this disruption.",
  uk: () => "I am requesting the compensation provided under UK Regulation 261/2004 (UK261) for this disruption.",
  us: (f) =>
    f.issue === "bumped"
      ? "I was involuntarily denied boarding on an oversold flight. I am requesting the denied boarding compensation, and the written statement of my rights, provided under 14 CFR Part 250."
      : "I chose not to travel after this disruption. I am requesting a refund of the unused ticket as provided in US Department of Transportation rules.",
};

const REGIME_SHORT: Record<RegimeId, string> = {
  ca: "Canada APPR",
  eu: "EU261",
  uk: "UK261",
  us: "US DOT",
};

// Reply windows come from the published process of each regulator. Where none is published, we ask for a reasonable time.
const WINDOW: Record<RegimeId, string> = {
  ca: "within 30 days",
  uk: "within eight weeks",
  eu: "within a reasonable time",
  us: "within a reasonable time",
};

const CARE_RULE: Partial<Record<RegimeId, string>> = {
  ca: "the Air Passenger Protection Regulations",
  eu: "Regulation (EC) No 261/2004",
  uk: "UK Regulation 261/2004 (UK261)",
};

export function buildScripts(f: Finder, regimes: RegimeId[], d: Details): Script[] {
  const name = v(d.name, "your name");
  const ref = `${v(d.flight, "flight number")}, ${v(d.date, "date")}`;
  const out: Script[] = [];

  out.push({
    id: "reason",
    title: "Ask the airline to state the reason in writing",
    when: "Send this first, or ask at the airport. The cause matters to most of these rules.",
    subject: `Written reason for disruption, flight ${ref}`,
    body: `To ${v(d.airline, "airline")} customer relations,

${happened(f, d)}

Please confirm in writing the reason you have recorded for this disruption, and whether the airline considers it to have been within its control.

Thank you,
${name}`,
  });

  for (const r of regimes) {
    out.push({
      id: `claim-${r}`,
      title: `Written claim to the airline (${REGIME_SHORT[r]})${r === "us" && f.issue !== "bumped" ? ", use only if you chose not to travel" : ""}`,
      when: "Send this to the airline's claims form or email. Keep a copy and the date you sent it.",
      subject: `Claim for flight ${ref}, booking ${v(d.booking, "booking reference")}`,
      body: `To ${v(d.airline, "airline")} customer relations,

${happened(f, d)}${d.reason.trim() ? `\n\nThe reason I was given was: ${sentence(d.reason)}` : ""}

${REQUEST[r](f)} Please reply in writing ${WINDOW[r]}, and tell me the reason you rely on if you decide not to pay.

Thank you,
${name}`,
    });
  }

  const careRules = regimes.map((r) => CARE_RULE[r]).filter((x): x is string => Boolean(x));
  if (careRules.length > 0) {
    const window = WINDOW[regimes.find((r) => CARE_RULE[r]) as RegimeId];
    out.push({
      id: "expenses",
      title: "Claim the costs you paid while waiting (food, hotel, transport)",
      when: "Keep itemised receipts. Airlines often have a separate form for expenses, so send this alongside or apart from your compensation claim.",
      subject: `Reimbursement of costs while waiting, flight ${ref}, booking ${v(d.booking, "booking reference")}`,
      body: `To ${v(d.airline, "airline")} customer relations,

${happened(f, d)}

The airline did not provide for my care while I waited, so I paid for it myself. My costs were:

${d.costs.trim() === "" ? "[List each cost with its amount and date, for example: Hotel, one night, 180 EUR]" : d.costs.trim()}

I attach itemised receipts. I am requesting reimbursement of these reasonable costs under the care and assistance provisions of ${careRules.join(" or ")}. Please reply in writing ${window}.

Thank you,
${name}`,
    });
  }

  out.push({
    id: "follow-up",
    title: "Follow up if there is no answer",
    when: "Send this after the response period has passed.",
    subject: `Follow-up: claim for flight ${ref}, booking ${v(d.booking, "booking reference")}`,
    body: `To ${v(d.airline, "airline")} customer relations,

On ${v(d.date, "date sent")} I wrote to you about flight ${ref}, booking ${v(d.booking, "booking reference")}. I have not received a reply.

Please reply in writing. If this remains unresolved, I may take it to the regulator or the dispute body that applies.

Thank you,
${name}`,
  });

  out.push({
    id: "escalate",
    title: "Summary for the regulator or dispute body",
    when: "Use this as the facts section when you complain to the regulator or dispute body. Attach your earlier messages.",
    subject: `Complaint: flight ${ref}`,
    body: `Summary of my complaint

Airline: ${v(d.airline, "airline")}
Flight: ${v(d.flight, "flight number")}, ${v(d.date, "date")}
Route: ${v(d.from, "origin")} to ${v(d.to, "destination")}
Booking reference: ${v(d.booking, "booking reference")}
What happened: ${f.issue === "delay" ? "delay" : f.issue === "cancel" ? "cancellation" : "denied boarding"}${f.issue === "bumped" ? "" : `, arrived ${v(d.arrival, "how late")}`}
Reason the airline gave: ${v(d.reason, "reason, or none given")}

I wrote to the airline on [date]. It [did not reply / replied on date and said what]. I attach copies of my messages, my booking confirmation and my boarding pass.

I ask you to review this complaint.

${name}`,
  });

  return out;
}

export function scriptToText(s: Script): string {
  return `Subject: ${s.subject}\n\n${s.body}`;
}
