// Data and letter builder for the insurance appeal pack.
//
// The visitor types their own facts and pastes the exact policy wording they rely on.
// The tool arranges them into a letter and shows the published complaint route for their country.
// It does not read the policy, judge the claim, or send anything.

export type Country = "ca" | "uk" | "us" | "au" | "other";
export type ReasonId = "short" | "excluded" | "recoverable" | "documents" | "unreasonable" | "late" | "unclear";
export type ClaimType = "delay" | "cancellation" | "interruption" | "connection";

export type Source = { label: string; href: string };
export type Status = "ok" | "unc" | "sched";

export const CHECKED = "02 Oct 2026";

export const COUNTRY_LABEL: Record<Country, string> = {
  ca: "Canada",
  uk: "United Kingdom",
  us: "United States",
  au: "Australia",
  other: "Somewhere else",
};

export const CLAIM_LABEL: Record<ClaimType, string> = {
  delay: "Trip delay expenses",
  cancellation: "Trip cancellation",
  interruption: "Trip interruption",
  connection: "Missed connection",
};

export type Reason = {
  id: ReasonId;
  label: string;
  lookFor: string[];
  evidence: string[];
};

export const REASONS: Reason[] = [
  {
    id: "short",
    label: "The delay was shorter than the policy requires",
    lookFor: ["minimum delay", "waiting period", "hours of delay", "definition of delay", "departure delay or arrival delay"],
    evidence: [
      "Airline record or message showing the real departure and arrival times",
      "The airline's written confirmation of the delay length",
      "Your boarding pass and booking confirmation",
    ],
  },
  {
    id: "excluded",
    label: "The cause is excluded or not covered",
    lookFor: ["exclusions", "strike", "weather", "known or foreseeable event", "unforeseen", "covered reasons"],
    evidence: [
      "The airline's written reason for the disruption",
      "The date you bought the policy and the date the event was announced",
      "Any airline notice or news report showing when the cause became known",
    ],
  },
  {
    id: "recoverable",
    label: "The expenses can be recovered from another source",
    lookFor: ["other insurance", "recoverable", "reimbursed by the carrier", "primary and excess cover", "payment from another source"],
    evidence: [
      "Your request to the airline for reimbursement, with the date",
      "The airline's reply, or a note that it did not reply",
      "A statement of what the airline has paid, so you claim only the shortfall",
    ],
  },
  {
    id: "documents",
    label: "Documents or receipts are missing",
    lookFor: ["proof of loss", "documents required", "receipts", "claim form requirements", "original or copies"],
    evidence: [
      "Itemised receipts for each expense",
      "Boarding passes, booking confirmation and airline delay confirmation",
      "A list of what you are attaching, so nothing is disputed later",
    ],
  },
  {
    id: "unreasonable",
    label: "The expenses were not reasonable or necessary",
    lookFor: ["reasonable", "necessary", "daily limit", "meals", "accommodation limit", "maximum benefit"],
    evidence: [
      "Why you chose each expense, for example no cheaper option nearby or open",
      "The time of day and the airline's instructions at the time",
      "Comparison prices if you have them",
    ],
  },
  {
    id: "late",
    label: "The claim was made too late",
    lookFor: ["notify us", "within days", "time limit", "notice of claim", "deadline to claim"],
    evidence: [
      "The dates you first told the insurer or its assistance line",
      "Any reference number from that first contact",
      "Why you could not claim earlier, if that applies",
    ],
  },
  {
    id: "unclear",
    label: "Another reason, or the reason is unclear",
    lookFor: ["the exact clause the insurer names", "definitions section", "claims conditions"],
    evidence: [
      "The insurer's denial letter",
      "Any earlier messages in which the insurer explained its decision",
    ],
  },
];

export const REASON_BY_ID: Record<ReasonId, Reason> = Object.fromEntries(
  REASONS.map((r) => [r.id, r]),
) as Record<ReasonId, Reason>;

export type Input = {
  country: Country;
  claimType: ClaimType;
  name: string;
  insurer: string;
  policy: string;
  claim: string;
  denialDate: string;
  reason: ReasonId;
  denialText: string;
  wording: string;
  summary: string;
  expenses: string;
  total: string;
  airlineAsked: boolean;
  airlineDate: string;
  airlineReply: string;
  enclosures: string[];
};

export const EMPTY_INPUT: Input = {
  country: "ca",
  claimType: "delay",
  name: "",
  insurer: "",
  policy: "",
  claim: "",
  denialDate: "",
  reason: "unclear",
  denialText: "",
  wording: "",
  summary: "",
  expenses: "",
  total: "",
  airlineAsked: false,
  airlineDate: "",
  airlineReply: "",
  enclosures: [],
};

export const ENCLOSURE_OPTIONS = [
  "Denial letter",
  "Policy wording (the relevant pages)",
  "Itemised receipts",
  "Boarding passes and booking confirmation",
  "Airline confirmation of the delay or cancellation",
  "My messages with the airline",
];

function v(value: string, placeholder: string): string {
  const t = value.trim();
  return t === "" ? `[${placeholder}]` : t;
}

// Make sure typed text ends like a sentence before more text follows it.
function sentence(value: string): string {
  const t = value.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function reasonParagraph(i: Input): string {
  switch (i.reason) {
    case "recoverable": {
      const asked = i.airlineAsked
        ? `I asked the airline for reimbursement${i.airlineDate.trim() ? ` on ${i.airlineDate.trim()}` : ""}. ${
            i.airlineReply.trim() ? `Its reply was: ${sentence(i.airlineReply)}` : "I have not received a full reimbursement."
          } I am claiming only the amount the airline has not paid.`
        : "[Say what you asked the airline to reimburse, when, and what it replied. Claim only the amount the airline has not paid.]";
      return asked;
    }
    case "short":
      return "I attach the airline's record of the actual departure and arrival times. I ask you to apply the policy's definition of delay to those times.";
    case "excluded":
      return "I attach the airline's written reason for the disruption. I ask you to show which exclusion you rely on and how it applies to that reason.";
    case "documents":
      return "I attach itemised receipts and the supporting documents listed below. If you need anything further, please tell me exactly what, so I can send it.";
    case "unreasonable":
      return "[Explain why each expense was needed at the time, for example that no cheaper option was available nearby or open.]";
    case "late":
      return `I first told ${v(i.insurer, "the insurer")} about this on [date of first contact], reference [reference number]. [Say why you could not claim earlier, if that applies.]`;
    default:
      return "I ask you to tell me which clause of the policy you rely on, and how it applies to my claim.";
  }
}

export function buildLetter(i: Input): string {
  const lines: string[] = [];
  lines.push(`Subject: Request to review your decision on claim ${v(i.claim, "claim number")}, policy ${v(i.policy, "policy number")}`);
  lines.push("");
  lines.push(`To ${v(i.insurer, "insurer")}, claims and complaints,`);
  lines.push("");
  lines.push(
    `I am writing to ask you to review your decision${i.denialDate.trim() ? ` of ${i.denialDate.trim()}` : ""} on claim ${v(i.claim, "claim number")} under policy ${v(i.policy, "policy number")}. The claim is for ${CLAIM_LABEL[i.claimType].toLowerCase()}.`,
  );
  lines.push("");
  lines.push("What happened");
  lines.push(v(i.summary, "Describe in a few sentences what happened, with dates and flight numbers."));
  lines.push("");
  lines.push("My expenses");
  lines.push(v(i.expenses, "List each expense with its amount, one per line."));
  lines.push(`Total claimed: ${v(i.total, "total")}`);
  lines.push("");
  lines.push("Your stated reason");
  lines.push(v(i.denialText, "Paste the reason from your denial letter."));
  lines.push("");
  lines.push("The policy wording I rely on");
  lines.push(i.wording.trim() === "" ? "[Paste the exact words from your policy, with the section name or page.]" : `"${i.wording.trim()}"`);
  lines.push("");
  lines.push(reasonParagraph(i));
  lines.push("");
  lines.push("What I ask");
  lines.push("1. That you review this decision in light of the policy wording and the documents I enclose.");
  lines.push(
    `2. That, if you uphold the decision, you give me your final response in writing, name the policy clause you rely on, and tell me how to refer the matter to ${ombudsmanName(i.country)}.`,
  );
  lines.push("");
  lines.push("Enclosures");
  if (i.enclosures.length === 0) {
    lines.push("[List what you are attaching.]");
  } else {
    for (const e of i.enclosures) lines.push(`- ${e}`);
  }
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push(v(i.name, "your name"));
  return lines.join("\n");
}

export function ombudsmanName(c: Country): string {
  switch (c) {
    case "ca":
      return "the OmbudService for Life and Health Insurance or the General Insurance OmbudService, whichever applies";
    case "uk":
      return "the Financial Ombudsman Service";
    case "us":
      return "my state insurance department";
    case "au":
      return "the Australian Financial Complaints Authority";
    default:
      return "the insurance ombudsman or regulator that applies";
  }
}

export type Route = {
  country: Country;
  title: string;
  status: Status;
  steps: string[];
  links: Source[];
  caveat?: string;
};

export const ROUTES: Record<Country, Route> = {
  ca: {
    country: "ca",
    title: "Canada",
    status: "ok",
    steps: [
      "Make a written complaint to your insurer and ask for its final position letter.",
      "With that letter, you can go to an independent ombudservice. Alberta's regulator says travel, life, accident and sickness insurance goes to the OmbudService for Life and Health Insurance. Saskatchewan's says health claims go there and property claims go to the General Insurance OmbudService.",
      "In Ontario, the regulator FSRA also needs the insurer's final position letter, or proof that you tried to get one.",
      "Ask the ombudservice about time limits before you wait.",
    ],
    links: [
      { label: "OmbudService for Life and Health Insurance", href: "https://www.olhi.ca" },
      { label: "General Insurance OmbudService", href: "https://www.giocanada.org" },
      { label: "Alberta, insurance consumer complaints", href: "https://www.alberta.ca/insurance-consumer-complaints" },
      {
        label: "FSRA, submit a complaint",
        href: "https://www.fsrao.ca/consumers/life-and-health-insurance/how-resolve-life-and-health-insurance-complaint",
      },
    ],
    caveat:
      "Which service handles a trip delay or cancellation claim can depend on the policy and the province. If unsure, ask your insurer's final letter, or contact both services.",
  },
  uk: {
    country: "uk",
    title: "United Kingdom",
    status: "ok",
    steps: [
      "Make a formal complaint to the insurer. It has up to eight weeks to send a final response.",
      "If you do not get a final response in eight weeks, or you disagree with it, you can bring the complaint to the Financial Ombudsman Service. It is free.",
      "You have six months from the date on the final response to refer it.",
    ],
    links: [
      {
        label: "Financial Ombudsman Service, travel insurance",
        href: "https://www.financial-ombudsman.org.uk/consumers/complaints-can-help/insurance/travel-insurance",
      },
      { label: "Financial Ombudsman Service, time limits", href: "https://www.financial-ombudsman.org.uk/consumers/expect/time-limits" },
    ],
  },
  us: {
    country: "us",
    title: "United States",
    status: "ok",
    steps: [
      "Try to resolve it with the insurer first, then file a complaint with your state department of insurance. It can investigate for free.",
      "Find your state from the National Association of Insurance Commissioners consumer page. The process varies by state.",
      "Ask the department about time limits that apply to your policy.",
    ],
    links: [
      { label: "NAIC, how to file a complaint", href: "https://content.naic.org/consumer.htm" },
      { label: "NAIC, how to file a complaint (guide)", href: "https://content.naic.org/index.php/consumer/how-to-file-complaint" },
    ],
  },
  au: {
    country: "au",
    title: "Australia",
    status: "unc",
    steps: [
      "Ask your insurer for its internal dispute resolution process and complain in writing.",
      "The Australian Financial Complaints Authority covers travel and ticket insurance complaints, including denied claims.",
    ],
    links: [{ label: "AFCA, insurance complaints", href: "https://www.afca.org.au/make-a-complaint/insurance" }],
    caveat: "The AFCA page we read was not recently updated. Confirm the steps and time limits on its site.",
  },
  other: {
    country: "other",
    title: "Somewhere else",
    status: "unc",
    steps: [
      "Ask the insurer for its complaints procedure and for its final response in writing.",
      "Then look for the insurance ombudsman or insurance regulator in the country where the policy was sold.",
    ],
    links: [],
    caveat: "We have not researched this country. Use official government pages to find the right body.",
  },
};

// Dates for the UK route. Calendar arithmetic only.
export function addDays(iso: string, days: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function addMonthsClamped(iso: string, months: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const target = new Date(Date.UTC(y, mo + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

export type Stat = { n: string; text: string; sources: Source[] };

export const PAIN: Stat[] = [
  {
    n: "4,451",
    text: "new travel insurance complaints reached the UK Financial Ombudsman Service in 2025/26. Declined claims were the most common issue, and complaints have risen every quarter since spring 2025.",
    sources: [
      {
        label: "Insurance Edge, 29 Sep 2026",
        href: "https://insurance-edge.net/2026/09/29/travel-insurance-complaints-are-on-the-rise/",
      },
    ],
  },
  {
    n: "34% to 37%",
    text: "of travel insurance complaints were upheld in favour of the customer in each quarter of 2025/26, with a three-year average of 38%. Complaints that reach an ombudsman are a selected group, so this is not a denial rate.",
    sources: [
      {
        label: "Insurance Edge, 29 Sep 2026",
        href: "https://insurance-edge.net/2026/09/29/travel-insurance-complaints-are-on-the-rise/",
      },
    ],
  },
  {
    n: "83% to 86%",
    text: "of travel claims were accepted across UK product categories in 2025, according to a summary of Financial Conduct Authority data. That implies roughly 14% to 17% were not accepted.",
    sources: [{ label: "Openkoda, travel insurance statistics", href: "https://openkoda.com/travel-insurance-statistics/" }],
  },
  {
    n: "Ask first",
    text: "is a common catch. Most travel policies do not cover claims if the loss can be recovered from another source, so the UK ombudsman advises asking the airline for a refund or compensation first.",
    sources: [
      {
        label: "Financial Ombudsman Service, travel insurance",
        href: "https://www.financial-ombudsman.org.uk/consumers/complaints-can-help/insurance/travel-insurance",
      },
    ],
  },
];

export type Rule = { title: string; body: string; status: Status; checked: string; sources: Source[] };

export const RULES: Rule[] = [
  {
    title: "UK, how to complain",
    body: "According to the UK Parliament library, insurers regulated by the FCA must handle complaints under set rules. According to the Financial Ombudsman Service, the insurer has up to eight weeks to send a final response. After that, or if you disagree, you can refer the complaint to the ombudsman within six months of the date on the final response.",
    status: "ok",
    checked: "01 Oct 2026",
    sources: [
      { label: "Financial Ombudsman Service, time limits", href: "https://www.financial-ombudsman.org.uk/consumers/expect/time-limits" },
      { label: "UK Parliament library, insurance FAQs", href: "https://commonslibrary.parliament.uk/research-briefings/cbp-8742/" },
    ],
  },
  {
    title: "UK, claim from the airline first",
    body: "According to the Financial Ombudsman Service, most travel insurance policies do not cover claims if the losses can be recovered from another source, so it advises asking the airline or travel provider for a refund or compensation before contacting your insurer. The UK Civil Aviation Authority says airlines must provide care while you wait and that you can claim reasonable costs back with itemised receipts.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [
      {
        label: "Financial Ombudsman Service, travel insurance",
        href: "https://www.financial-ombudsman.org.uk/consumers/complaints-can-help/insurance/travel-insurance",
      },
      {
        label: "UK Civil Aviation Authority, delays",
        href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/",
      },
    ],
  },
  {
    title: "Canada, how to complain",
    body: "According to Alberta's insurance regulator, complain to the insurer first, and independent ombudservices exist for life and health insurance (which includes travel in Alberta's guidance) and for general insurance. According to Ontario's regulator FSRA, the insurer's final position letter is needed to review a complaint.",
    status: "ok",
    checked: "01 Oct 2026",
    sources: [
      { label: "Alberta, insurance consumer complaints", href: "https://www.alberta.ca/insurance-consumer-complaints" },
      { label: "Saskatchewan, travel insurance", href: "https://fcaa.gov.sk.ca/consumers-investors-pension-plan-members/consumers/purchasing-insurance/travel-insurance" },
      {
        label: "FSRA, submit a complaint",
        href: "https://www.fsrao.ca/consumers/life-and-health-insurance/how-resolve-life-and-health-insurance-complaint",
      },
    ],
  },
  {
    title: "United States, how to complain",
    body: "According to the National Association of Insurance Commissioners, you can file a complaint against your insurer with your state department of insurance. It is free, and the process varies by state. The NAIC consumer page is the place to start.",
    status: "ok",
    checked: "01 Oct 2026",
    sources: [{ label: "NAIC", href: "https://content.naic.org/consumer.htm" }],
  },
  {
    title: "Australia, how to complain",
    body: "According to the Australian Financial Complaints Authority, it can consider complaints about travel and ticket insurance, including denied claims. The page we read was not recently updated, so confirm the steps on its site.",
    status: "unc",
    checked: "01 Oct 2026",
    sources: [{ label: "AFCA", href: "https://www.afca.org.au/make-a-complaint/insurance" }],
  },
];
