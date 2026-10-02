// Planning model for the Schengen connection check.
//
// Every number carries a basis:
//   "reported"  a published figure we link to on the page
//   "assumed"   our own planning assumption (shown to the visitor as such)
//   "yours"     typed in by the visitor
//
// To change a number, edit it here. The page rebuilds its tables from these values.

export type Direction = "arriving" | "leaving";
export type PassportGroup = "noneu" | "eu" | "exempt";
export type EesStatus = "first" | "returning";
export type ScenarioId = "offpeak" | "typical" | "peak" | "worst";
export type Basis = "reported" | "assumed" | "yours";
export type Verdict = "ok" | "tight" | "short";

export type Inputs = {
  direction: Direction;
  passport: PassportGroup;
  ees: EesStatus;
  party: number;
  connectionMinutes: number;
  gateCloseMinutes: number;
  bags: boolean;
  terminalChange: boolean;
  securityAgain: boolean;
  needsHelp: boolean;
};

export type Line = {
  label: string;
  minutes: number;
  basis: Basis;
  note?: string;
};

export type ScenarioResult = {
  id: ScenarioId;
  label: string;
  queue: number;
  lines: Line[];
  needed: number;
  margin: number;
  verdict: Verdict;
};

export const CHECKED = "01 Oct 2026";
export const DEFAULT_GATE_MINUTES = 30;
export const OK_MARGIN_MINUTES = 20;

export const SCENARIOS: { id: ScenarioId; label: string; hint: string }[] = [
  { id: "offpeak", label: "Quiet", hint: "Midday, late evening or off-season" },
  { id: "typical", label: "Typical", hint: "An ordinary day" },
  {
    id: "peak",
    label: "Busy",
    hint: "Early-morning long-haul arrivals, summer or holiday weekends, major hubs",
  },
  { id: "worst", label: "Stress test", hint: "The longest waits reported in 2026" },
];

type QueueCell = { minutes: number; basis: Basis; note: string };

// Border queue, in minutes, before reaching the desk.
export const QUEUE: Record<"ees" | "noees", Record<ScenarioId, QueueCell>> = {
  // Lane used by travellers who are checked against EES (non-EU passports).
  ees: {
    offpeak: {
      minutes: 20,
      basis: "reported",
      note: "Off-peak waits of 20 to 40 minutes are reported at Paris CDG in an unofficial airport guide. We use the low end.",
    },
    typical: {
      minutes: 45,
      basis: "assumed",
      note: "Our figure between reported quiet waits (20 to 40) and busy waits (60 to 120). A 41-minute queue was reported at Paris CDG in September 2026.",
    },
    peak: {
      minutes: 90,
      basis: "reported",
      note: "Peak waits of 60 to 120 minutes are reported at major hubs in summer 2026. We use the middle.",
    },
    worst: {
      minutes: 150,
      basis: "reported",
      note: "Waits of up to about 150 minutes were reported at Prague in September 2026. Some hubs reported up to 300 minutes before the summer pause ended.",
    },
  },
  // Lane used by EU, EEA and Swiss passports.
  noees: {
    offpeak: {
      minutes: 10,
      basis: "assumed",
      note: "EU, EEA and Swiss passports are not registered in EES. We found no reliable queue data for these lanes, so this is our assumption.",
    },
    typical: {
      minutes: 20,
      basis: "assumed",
      note: "Our assumption. No reliable queue data found for these lanes.",
    },
    peak: {
      minutes: 40,
      basis: "assumed",
      note: "Our assumption. No reliable queue data found for these lanes.",
    },
    worst: {
      minutes: 60,
      basis: "assumed",
      note: "Our assumption. No reliable queue data found for these lanes.",
    },
  },
};

// Desk time per person, in minutes.
// Reported figures range from about 70 seconds on average to 3 to 7 minutes per person.
export const REG_FIRST: Record<ScenarioId, number> = {
  offpeak: 1.5,
  typical: 3,
  peak: 5,
  worst: 7,
};
export const CHECK_REPEAT = 1;

export const STEPS = {
  walk: { minutes: 15, label: "Walk to the next gate" },
  bags: { minutes: 30, label: "Collect and re-check bags" },
  terminal: { minutes: 20, label: "Change terminals" },
  security: { minutes: 25, label: "Security screening again" },
  help: { minutes: 15, label: "Extra help (children, reduced mobility)" },
} as const;

export const DEFAULTS: Inputs = {
  direction: "arriving",
  passport: "noneu",
  ees: "first",
  party: 1,
  connectionMinutes: 120,
  gateCloseMinutes: DEFAULT_GATE_MINUTES,
  bags: false,
  terminalChange: false,
  securityAgain: false,
  needsHelp: false,
};

function ceilTo5(n: number): number {
  return Math.ceil(n / 5) * 5;
}

export function validate(i: Inputs): string | null {
  if (!Number.isFinite(i.connectionMinutes) || i.connectionMinutes < 1) {
    return "Enter the time between landing and your next departure.";
  }
  if (i.connectionMinutes > 2880) {
    return "That connection is longer than two days. This tool is for connections within a day or so.";
  }
  if (!Number.isFinite(i.party) || i.party < 1 || i.party > 9) {
    return "Choose how many people are travelling together, from 1 to 9.";
  }
  if (!Number.isFinite(i.gateCloseMinutes) || i.gateCloseMinutes < 0 || i.gateCloseMinutes > 180) {
    return "Enter how many minutes before departure the gate closes, from 0 to 180.";
  }
  return null;
}

export function estimate(i: Inputs): ScenarioResult[] {
  const queueKey = i.passport === "eu" ? "noees" : "ees";
  const firstTime = i.passport === "noneu" && i.direction === "arriving" && i.ees === "first";

  return SCENARIOS.map((s) => {
    const q = QUEUE[queueKey][s.id];
    const lines: Line[] = [];

    lines.push({
      label: "Border check queue",
      minutes: Math.round(q.minutes),
      basis: q.basis,
      note: q.note,
    });

    if (firstTime) {
      lines.push({
        label: `First-time registration at the desk (${i.party} ${i.party === 1 ? "person" : "people"})`,
        minutes: Math.round(REG_FIRST[s.id] * i.party),
        basis: "reported",
        note: "Reported desk times range from about 70 seconds to 7 minutes per person. We assume one desk at a time.",
      });
    } else {
      lines.push({
        label: `Passport check at the desk (${i.party} ${i.party === 1 ? "person" : "people"})`,
        minutes: Math.round(CHECK_REPEAT * i.party),
        basis: "assumed",
        note: "Our assumption of about one minute per person for a repeat or exit check.",
      });
    }

    lines.push({ label: STEPS.walk.label, minutes: STEPS.walk.minutes, basis: "assumed" });
    if (i.bags) lines.push({ label: STEPS.bags.label, minutes: STEPS.bags.minutes, basis: "assumed" });
    if (i.terminalChange) {
      lines.push({ label: STEPS.terminal.label, minutes: STEPS.terminal.minutes, basis: "assumed" });
    }
    if (i.securityAgain) {
      lines.push({ label: STEPS.security.label, minutes: STEPS.security.minutes, basis: "assumed" });
    }
    if (i.needsHelp) lines.push({ label: STEPS.help.label, minutes: STEPS.help.minutes, basis: "assumed" });

    lines.push({
      label: "Gate closes before departure",
      minutes: Math.round(i.gateCloseMinutes),
      basis: i.gateCloseMinutes === DEFAULT_GATE_MINUTES ? "assumed" : "yours",
      note:
        i.gateCloseMinutes === DEFAULT_GATE_MINUTES
          ? "We assume 30 minutes. Check your boarding pass or airline."
          : undefined,
    });

    const sum = lines.reduce((acc, l) => acc + l.minutes, 0);
    const needed = ceilTo5(sum);
    const margin = i.connectionMinutes - needed;
    const verdict: Verdict = margin >= OK_MARGIN_MINUTES ? "ok" : margin >= 0 ? "tight" : "short";

    return { id: s.id, label: s.label, queue: Math.round(q.minutes), lines, needed, margin, verdict };
  });
}

export function formatMinutes(total: number): string {
  const sign = total < 0 ? "-" : "";
  const abs = Math.abs(Math.round(total));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m} min`;
  if (m === 0) return `${sign}${h} h`;
  return `${sign}${h} h ${m} min`;
}

export type Source = { label: string; href: string };
export type Fact = {
  title: string;
  body: string;
  status: "ok" | "unc";
  sources: Source[];
};

const BMI: Source = {
  label: "Austrian Interior Ministry, EES",
  href: "https://www.bmi.gv.at/202/Fremdenpolizei_und_Grenzkontrolle/Entry_Exit_System/start_en.aspx",
};

export const FACTS: Fact[] = [
  {
    title: "Where the border check happens",
    body: "EES applies at the first Schengen entry and the last Schengen exit. If you stay in the transit area during a flight within Schengen and no border check is carried out, your data is not recorded in EES. Whether you can stay airside depends on your route and passport, so ask your airline.",
    status: "ok",
    sources: [BMI],
  },
  {
    title: "Who is registered",
    body: "Non-EU travellers on short stays are registered. Some groups are exempt. The official list of exemptions is on the EU Travel Europe site and on the Austrian ministry page.",
    status: "ok",
    sources: [BMI, { label: "EU Travel Europe", href: "https://travel-europe.europa.eu" }],
  },
  {
    title: "How long registration takes",
    body: "A first registration captures four fingerprints and a facial image. One analysis of 2026 data reports about 70 seconds on average. An unofficial airport guide says 3 to 7 minutes per person. Later trips are quicker, with a passport scan plus a fingerprint or photo. A registration lasts three years or until the passport expires.",
    status: "unc",
    sources: [
      {
        label: "Euronews, 12 Aug 2026",
        href: "https://www.euronews.com/travel/2026/08/12/europes-new-border-system-is-causing-huge-airport-queues-as-ees-wait-times-double",
      },
      { label: "FlightQueue guide", href: "https://flightqueue.com/ees-registration" },
      {
        label: "London Southend Airport guide",
        href: "https://londonsouthendairport.com/travel-guides/96-hour-rule-guide-to-eus-new-entry-exit-system/",
      },
    ],
  },
  {
    title: "Reported waits, summer 2026",
    body: "In an analysis by the Financial Times and Qsensor, reported by Euronews, the average wait at Frankfurt reached about 120 minutes in July, against about 60 a year earlier. Munich reached up to about 60 minutes, from 31. The maximum at Amsterdam reached about 120, from 80.",
    status: "unc",
    sources: [
      {
        label: "Euronews, 12 Aug 2026",
        href: "https://www.euronews.com/travel/2026/08/12/europes-new-border-system-is-causing-huge-airport-queues-as-ees-wait-times-double",
      },
    ],
  },
  {
    title: "Emergency flexibility ended",
    body: "A temporary rule that let countries pause biometric collection for up to six hours at congested crossings expired on 6 September 2026. Press reports say the European Commission did not extend it. Reports soon after mention waits of up to about 150 minutes at Prague and about 41 minutes at Paris CDG.",
    status: "unc",
    sources: [
      {
        label: "Travel Extra, 6 Sep 2026",
        href: "https://www.travelextra.ie/eu-border-checks-tighten-as-ees-emergency-flexibility-expires-today-what-we-need-to-know/",
      },
      { label: "Travel Extra, queues", href: "https://www.travelextra.ie/?p=146639" },
    ],
  },
  {
    title: "Advice on connection buffers",
    body: "Press reports quote airlines and airports advising travellers not to rely on the shortest published connection time through hard-hit hubs. One report says to consider four hours at the most affected airports in peak periods. This is commentary, not a rule.",
    status: "unc",
    sources: [
      {
        label: "VisaVerge",
        href: "https://www.visaverge.com/travel/end-of-ees-flexibility-cuts-schengen-airport-connection-buffers-with-biometric-checks/",
      },
    ],
  },
];

export const SCHENGEN_COUNTRIES = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Italy",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
];

export type Stat = { n: string; text: string; sources: Source[] };

export const PAIN: Stat[] = [
  {
    n: "120 min",
    text: "was the average border wait at Frankfurt in July 2026, against about 60 minutes a year earlier, in an analysis by the Financial Times and Qsensor.",
    sources: [
      {
        label: "Euronews, 12 Aug 2026",
        href: "https://www.euronews.com/travel/2026/08/12/europes-new-border-system-is-causing-huge-airport-queues-as-ees-wait-times-double",
      },
    ],
  },
  {
    n: "70 sec",
    text: "is the average registration time in the same analysis. The queue before the desk, not the registration itself, is what eats a connection.",
    sources: [
      {
        label: "Euronews, 12 Aug 2026",
        href: "https://www.euronews.com/travel/2026/08/12/europes-new-border-system-is-causing-huge-airport-queues-as-ees-wait-times-double",
      },
    ],
  },
  {
    n: "6 Sep 2026",
    text: "is when the temporary rule that let countries pause biometric checks for up to six hours expired. Press reports say the European Commission did not extend it.",
    sources: [
      {
        label: "Travel Extra, 6 Sep 2026",
        href: "https://www.travelextra.ie/eu-border-checks-tighten-as-ees-emergency-flexibility-expires-today-what-we-need-to-know/",
      },
    ],
  },
  {
    n: "150 min",
    text: "is the longest wait reported at Prague soon after the rule expired, with about 41 minutes reported at Paris CDG. Waits swing widely by airport and hour.",
    sources: [{ label: "Travel Extra, queues", href: "https://www.travelextra.ie/?p=146639" }],
  },
];
