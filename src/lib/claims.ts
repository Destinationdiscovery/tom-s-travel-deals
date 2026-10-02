// Data and logic for the flight claim guide.
//
// This tool shows which published rules may apply to a disrupted flight, the published
// amounts and deadlines, where to file, and sample wording the visitor edits and sends.
// It does not decide whether anyone is owed money, and it never files anything.
// Every rule below carries a source and a status. To change a rule, edit it here.

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

export const CHECKED = "01 Oct 2026";

export const PLACE_LABEL: Record<Place, string> = {
  ca: "Canada",
  us: "United States",
  eu: "EU, Iceland, Norway or Switzerland",
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
  if (f.from === "uk" || (f.to === "uk" && (f.airline === "uk" || f.airline === "eu"))) {
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
};

export const REGIMES: Record<RegimeId, RegimeInfo> = {
  ca: {
    id: "ca",
    name: "Canada, Air Passenger Protection Regulations",
    scope: "Flights to, from and within Canada.",
    official: {
      label: "Canadian Transportation Agency",
      href: "https://protection-passager-passenger.otc-cta.gc.ca/en/refunds-and-compensation/flight-delays-cancellations-rebooking-refunds-compensation",
    },
    deadline:
      "Claim to the airline in writing within one year. The airline should answer within 30 days. If it does not, or you disagree, you can complain to the Canadian Transportation Agency or go to small claims court. Court action for damages under the Montreal Convention has a two-year limit.",
    escalation: {
      text: "Complain to the Canadian Transportation Agency after you have written to the airline.",
      href: "https://protection-passager-passenger.otc-cta.gc.ca/en",
      label: "Canadian Transportation Agency",
    },
  },
  eu: {
    id: "eu",
    name: "European Union, Regulation 261/2004",
    scope:
      "Flights leaving an airport in the EU, Iceland, Norway or Switzerland on any airline, and flights into the EU from outside it on an EU airline.",
    official: {
      label: "Your Europe, air passenger rights",
      href: "https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm",
    },
    deadline:
      "Time limits to claim depend on the country where a claim would be brought. Check yours early, and do not wait.",
    escalation: {
      text: "Complain to the national enforcement body of the country where the disruption happened. The official page explains how to find it.",
      href: "https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm",
      label: "Your Europe, air passenger rights",
    },
  },
  uk: {
    id: "uk",
    name: "United Kingdom, UK261",
    scope:
      "Flights leaving a UK airport on any airline, and flights arriving in the UK from outside the UK on a UK or EU airline.",
    official: { label: "UK Civil Aviation Authority", href: "https://www.caa.co.uk" },
    deadline:
      "Reported time limits are six years in England and Wales and five in Scotland. Confirm with the Civil Aviation Authority.",
    escalation: {
      text: "Many UK airlines belong to an approved alternative dispute resolution scheme. The Civil Aviation Authority publishes guidance on both.",
      href: "https://www.caa.co.uk",
      label: "UK Civil Aviation Authority",
    },
  },
  us: {
    id: "us",
    name: "United States, Department of Transportation rules",
    scope:
      "Refund rules cover flights to, within and from the US. Denied boarding compensation covers domestic flights and international flights leaving the US.",
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
  },
};

const EU_AMOUNT: Record<Distance, string> = { short: "€250", medium: "€400", long: "€600" };
const UK_AMOUNT: Record<Distance, string> = { short: "£220", medium: "£350", long: "£520" };

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
  }

  if (regime === "eu") {
    if (f.issue === "delay" && f.delay === "under3") {
      lines.push({
        label: "Arriving under 3 hours late",
        value: "No fixed compensation under this rule. The published threshold is 3 hours at arrival.",
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
  }

  if (regime === "uk") {
    if (f.issue === "delay" && f.delay === "under3") {
      lines.push({
        label: "Arriving under 3 hours late",
        value: "No fixed compensation under this rule. The published threshold is 3 hours at arrival.",
      });
    } else {
      lines.push({
        label: `Flight distance, ${DISTANCE_LABEL[f.distance].toLowerCase()}`,
        value: `${UK_AMOUNT[f.distance]} per passenger`,
      });
      lines.push({
        label: "Published amounts by distance",
        value: "£220 up to 1,500 km, £350 up to 3,500 km, £520 beyond. Reported: £260 for 3 to 4 hours late on flights over 3,500 km.",
      });
    }
    lines.push({
      label: "Exception in the published rule",
      value: "No compensation if the airline shows the cause was an extraordinary circumstance it could not avoid.",
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
  sources: Source[];
};

export const RULES: Rule[] = [
  {
    title: "Canada, APPR",
    body: "Flights to, from and within Canada. Compensation for delays and cancellations when the cause is fully within the airline's control and not required for safety, you were told 14 days or less before departure, and you arrive 3 or more hours late. Large airlines: C$400, C$700 and C$1,000 at 3, 6 and 9 hours. Small airlines: C$125, C$250 and C$500. Claim in writing to the airline within one year. Not available if you already received compensation for the same disruption under another country's rules.",
    status: "ok",
    sources: [REGIMES.ca.official],
  },
  {
    title: "United States, denied boarding",
    body: "Involuntary denied boarding on an oversold flight: 200% of the one-way fare (airlines may cap at $1,075) or 400% (capped at $2,150), depending on how late you arrive. Applies to domestic flights and international flights leaving the US.",
    status: "ok",
    sources: [REGIMES.us.official],
  },
  {
    title: "United States, refunds and delays",
    body: "No federal fixed payment for delays. A cash refund is available if the airline cancels or significantly changes your flight and you choose not to travel. The 3 hour domestic and 6 hour international thresholds come from secondary sources, so confirm them on the official site.",
    status: "unc",
    sources: [{ label: "US Department of Transportation, Fly Rights", href: "https://www.transportation.gov/airconsumer/fly-rights" }],
  },
  {
    title: "European Union, Regulation 261/2004",
    body: "Flights leaving an EU airport on any airline, and flights into the EU on an EU airline from outside it. Compensation when you arrive 3 or more hours late, unless the airline shows extraordinary circumstances: €250 up to 1,500 km, €400 up to 3,500 km, €600 beyond. Time limits to claim depend on the country.",
    status: "ok",
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
    body: "The European Parliament approved a reform on 7 July 2026 by 646 votes to 12. It keeps the 3 hour threshold. Reported changes include nine months to file a request and 30 days for airlines to pay or explain. New rules are expected to apply from the second half of 2027, and today's rules apply until then. Reports differ on whether the lowest amount stays at €250 or moves to €300.",
    status: "sched",
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
    title: "United Kingdom, UK261",
    body: "Flights leaving a UK airport on any airline, and flights arriving in the UK from outside it on a UK or EU airline. Compensation when you arrive 3 or more hours late, unless the airline shows extraordinary circumstances: £220 up to 1,500 km, £350 up to 3,500 km, £520 beyond (reported £260 for 3 to 4 hours late on flights over 3,500 km). Reported time limits: six years in England and Wales, five in Scotland. We could not confirm these figures on the official site, so check the Civil Aviation Authority.",
    status: "unc",
    sources: [
      { label: "Wego, UK261 explainer", href: "https://blog.wego.com/uk261/" },
      REGIMES.uk.official,
    ],
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

${REQUEST[r](f)} Please reply in writing within 30 days, and tell me the reason you rely on if you decide not to pay.

Thank you,
${name}`,
    });
  }

  out.push({
    id: "follow-up",
    title: "Follow up if there is no answer",
    when: "Send this after the response period has passed, for example 30 days.",
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
