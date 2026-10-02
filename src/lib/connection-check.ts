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

export const CHECKED = "02 Oct 2026";
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
const EUR_LEX: Source = {
  label: "Regulation (EU) 2025/1534, EUR-Lex",
  href: "https://eur-lex.europa.eu/eli/reg/2025/1534/oj",
};
const COMMISSION: Source = {
  label: "European Commission, EES fully operational",
  href: "https://home-affairs.ec.europa.eu/news/entryexit-system-ees-fully-operational-2026-04-10_en",
};
const EES_SITE: Source = { label: "Official EES site", href: "https://travel-europe.europa.eu/en/ees" };
const EURONEWS: Source = {
  label: "Euronews, 12 Aug 2026",
  href: "https://www.euronews.com/travel/2026/08/12/europes-new-border-system-is-causing-huge-airport-queues-as-ees-wait-times-double",
};
const CAA_DELAYS: Source = {
  label: "UK Civil Aviation Authority, delays",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/",
};

export const FACTS: Fact[] = [
  {
    title: "Where the border check happens",
    body: "According to the Austrian Interior Ministry, EES applies at the first Schengen entry and the last Schengen exit. If you stay in the transit area during a flight within Schengen and no border check is carried out, your data is not recorded in EES. Whether you can stay airside depends on your route and passport, so ask your airline.",
    status: "ok",
    sources: [BMI],
  },
  {
    title: "Who is registered",
    body: "According to the Austrian Interior Ministry, non-EU travellers on short stays are registered, and some groups are exempt. The official list of exemptions is on the EU's EES site and on the ministry page.",
    status: "ok",
    sources: [BMI, EES_SITE],
  },
  {
    title: "EES is fully operational",
    body: "According to the European Commission, EES became fully operational across all Schengen countries on 10 April 2026, after a progressive start that began in October 2025. The Commission says it remains in close contact with member states on implementation.",
    status: "ok",
    sources: [COMMISSION, EES_SITE],
  },
  {
    title: "The congestion pause ended",
    body: "According to Regulation (EU) 2025/1534, for a limited time after the rollout countries could pause biometric registration at a named crossing for up to six hours when waits were excessive. That power ceased to apply 330 days after EES began, which by our count means the last day was 6 September 2026 and it ceased from 7 September. The regulation has no mechanism to extend it.",
    status: "ok",
    sources: [EUR_LEX, COMMISSION],
  },
  {
    title: "Reports of continued limits",
    body: "According to press reports that trace to a single Times report, France, Belgium, the Netherlands, Germany, Greece, Malta, Portugal, Italy and Switzerland were allowed to keep limiting biometric checks after the deadline, with no new date. We found no official statement or legal instrument confirming it, and the Commission has not commented. This estimate assumes full biometric registration.",
    status: "unc",
    sources: [
      { label: "Connexion France, 13 Sep 2026", href: "https://www.connexionfrance.com/news/france-listed-among-countries-to-delay-full-ees-border-check-rollout/814138" },
      { label: "Your Mileage May Vary, 15 Sep 2026", href: "https://yourmileagemayvary.com/2026/09/15/europe-ees-border-checks-inconsistent/" },
      { label: "Remote Work Europe, 13 Sep 2026", href: "https://remoteworkeurope.eu/news/2026/ees-biometric-derogation-expired-commission-silent/" },
    ],
  },
  {
    title: "How long registration takes",
    body: "According to an analysis by the Financial Times and Qsensor reported by Euronews, registration averages about 70 seconds. An unofficial airport guide says 3 to 7 minutes per person. According to an airport guide, a registration lasts three years or until the passport expires, and later trips are quicker, with a passport scan plus a fingerprint or photo.",
    status: "unc",
    sources: [
      EURONEWS,
      { label: "FlightQueue guide", href: "https://flightqueue.com/ees-registration" },
      {
        label: "London Southend Airport guide",
        href: "https://londonsouthendairport.com/travel-guides/96-hour-rule-guide-to-eus-new-entry-exit-system/",
      },
    ],
  },
  {
    title: "Reported waits, summer 2026",
    body: "According to an analysis by the Financial Times and Qsensor, reported by Euronews, the average wait at Frankfurt reached about 120 minutes in July, against about 60 a year earlier. Munich reached up to about 60 minutes, from 31. The maximum at Amsterdam reached about 120, from 80. Press reports soon after the pause ended mention waits of up to about 150 minutes at Prague and about 41 minutes at Paris CDG.",
    status: "unc",
    sources: [EURONEWS, { label: "Travel Extra, queues", href: "https://www.travelextra.ie/?p=146639" }],
  },
  {
    title: "Advice on connection buffers",
    body: "According to press reports, airlines and airports are advising travellers not to rely on the shortest published connection time through hard-hit hubs, and one report says to consider four hours at the most affected airports in peak periods. This is commentary, not a rule.",
    status: "unc",
    sources: [
      {
        label: "VisaVerge",
        href: "https://www.visaverge.com/travel/end-of-ees-flexibility-cuts-schengen-airport-connection-buffers-with-biometric-checks/",
      },
    ],
  },
  {
    title: "Separate bookings",
    body: "According to the UK Civil Aviation Authority, under UK rules a journey made of separate bookings, sometimes called self-transfer, carries no statutory right to care, compensation or onward transport if a delay makes you miss a flight. On a single booking, rights are based on the distance between the first and last airport. The CAA also says that if you miss a flight because of long queues at security, an airline is unlikely to pay compensation or provide a free alternative. That statement is about security queues, not border queues.",
    status: "ok",
    sources: [CAA_DELAYS, { label: "UK Civil Aviation Authority, missed flights", href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/missed-flights/" }],
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
    sources: [EURONEWS],
  },
  {
    n: "70 sec",
    text: "is the average registration time in the same analysis. The queue before the desk, not the registration itself, is what eats a connection.",
    sources: [EURONEWS],
  },
  {
    n: "7 Sep 2026",
    text: "is when the legal power to pause biometric checks for congestion ceased to apply, after a last day of 6 September. Press reports say some countries may still limit checks, which we could not confirm.",
    sources: [EUR_LEX],
  },
  {
    n: "150 min",
    text: "is the longest wait reported at Prague soon after the pause ended, with about 41 minutes reported at Paris CDG. Waits swing widely by airport and hour.",
    sources: [{ label: "Travel Extra, queues", href: "https://www.travelextra.ie/?p=146639" }],
  },
];
