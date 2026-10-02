// Plain-language questions and answers, written to be read by people and quoted by search engines.
// Every answer opens with its source ("According to ...") and is information, not legal advice.

export type Source = { label: string; href: string };
export type FaqItem = { q: string; a: string; sources?: Source[] };
export type Term = { term: string; meaning: string };

const CTA: Source = {
  label: "Canadian Transportation Agency",
  href: "https://protection-passager-passenger.otc-cta.gc.ca/en/refunds-and-compensation/flight-delays-cancellations-rebooking-refunds-compensation",
};
const YOUR_EUROPE: Source = {
  label: "Your Europe, air passenger rights",
  href: "https://europa.eu/youreurope/citizens/travel/passenger-rights/air",
};
const CAA_DELAYS: Source = {
  label: "UK Civil Aviation Authority, delays",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/",
};
const CAA_CLAIM: Source = {
  label: "UK Civil Aviation Authority, claiming for costs and compensation",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/travel-complaints/making-a-claim/claiming-for-costs-and-compensation/",
};
const CAA_EXTRA: Source = {
  label: "UK Civil Aviation Authority, am I entitled to compensation",
  href: "https://www.caa.co.uk/air-passengers/travel-problems-and-rights/travel-complaints/making-a-claim/am-i-entitled-to-compensation/",
};
const DOT: Source = {
  label: "US Department of Transportation, bumping and oversales",
  href: "https://www.transportation.gov/individuals/aviation-consumer-protection/bumping-oversales",
};
const EUR_LEX: Source = {
  label: "Regulation (EU) 2025/1534, EUR-Lex",
  href: "https://eur-lex.europa.eu/eli/reg/2025/1534/oj",
};
const COMMISSION_EES: Source = {
  label: "European Commission, EES fully operational",
  href: "https://home-affairs.ec.europa.eu/news/entryexit-system-ees-fully-operational-2026-04-10_en",
};
const BMI: Source = {
  label: "Austrian Interior Ministry, EES",
  href: "https://www.bmi.gv.at/202/Fremdenpolizei_und_Grenzkontrolle/Entry_Exit_System/start_en.aspx",
};
const FOS_TRAVEL: Source = {
  label: "Financial Ombudsman Service, travel insurance",
  href: "https://www.financial-ombudsman.org.uk/consumers/complaints-can-help/insurance/travel-insurance",
};
const FOS_LIMITS: Source = {
  label: "Financial Ombudsman Service, time limits",
  href: "https://www.financial-ombudsman.org.uk/consumers/expect/time-limits",
};
const EURO_NEWS: Source = {
  label: "Euronews, 12 Aug 2026",
  href: "https://www.euronews.com/travel/2026/08/12/europes-new-border-system-is-causing-huge-airport-queues-as-ees-wait-times-double",
};

// ---------------------------------------------------------------------------
// Quick answers: the short facts shown right under each page heading.

export const QUICK_CLAIMS: string[] = [
  "According to the published rules, compensation for a late flight is measured at your final destination, with a threshold of 3 hours in Canada, the EU and the UK.",
  "Published amounts: Canada C$400, C$700 or C$1,000 (large airlines) or C$125, C$250 or C$500 (small airlines); EU €250, €400 or €600; UK £220, £350, £520 or £260.",
  "The first step in every region is a written claim to the airline. Regulators and dispute bodies come after.",
  "Care while you wait (food, drink, hotel) is a separate right from compensation, and receipts matter.",
];

export const QUICK_APPEAL: string[] = [
  "According to the UK ombudsman, many travel policies do not pay losses you can recover from another source, so ask the airline first.",
  "In the UK the insurer has up to eight weeks to give a final response, and you have six months after it to go to the ombudsman.",
  "In Canada you need the insurer's final position letter before an ombudservice or regulator will look at it.",
  "Paste your policy's own words into the letter. The insurer, then an ombudsman, decides, not us.",
];

export const QUICK_CONNECTION: string[] = [
  "According to the Austrian Interior Ministry, EES applies at your first Schengen entry and your last Schengen exit, not at every airport in between.",
  "One 2026 analysis reports an average registration of about 70 seconds. The queue before the desk is what eats a connection.",
  "Average waits at Frankfurt reached about 120 minutes in July 2026, against about 60 a year earlier, in that analysis.",
  "The power to pause biometric checks for congestion ended in September 2026. Reports of continued limits are unconfirmed.",
];

// ---------------------------------------------------------------------------
// FAQs

export const FAQ_HOME: FaqItem[] = [
  {
    q: "Is reviewthengo legal advice?",
    a: "No. We are not lawyers, and this is legal information, not legal advice. We do not file or send anything for you, and we are not liable for how you use the information. Official sources and the decisions of regulators, ombudsmen and courts come first.",
  },
  {
    q: "How do you decide what goes on the rules ledger?",
    a: "We read the official source first, show the day we last checked each entry, label anything we cannot confirm as Unconfirmed, and list corrections openly. A news report is never rounded up into a fact.",
  },
  {
    q: "Is the EES biometric check still required?",
    a: "According to Regulation (EU) 2025/1534, the power to pause biometric registration because of congestion ceased to apply on 7 September 2026 (last day 6 September). Press reports say nine countries may still limit checks. We could not confirm that from an official source, so it is marked Unconfirmed.",
    sources: [EUR_LEX, COMMISSION_EES],
  },
  {
    q: "What is ETIAS and when does it start?",
    a: "According to press reports, ETIAS, the pre-travel authorisation for visa-exempt visitors to Europe, is scheduled for the fourth quarter of 2026 with a fee of €20. We found no confirmed launch date in the sources we checked.",
    sources: [{ label: "Official ETIAS portal", href: "https://travel-europe.europa.eu/etias" }],
  },
  {
    q: "Where can I find flight delay compensation rules?",
    a: "The flight claim guide covers Canada, the EU, the UK and the US: which published rules may apply, the amounts and deadlines, where to file, and wording you can edit and send yourself.",
  },
];

export const FAQ_CLAIMS: FaqItem[] = [
  {
    q: "How late must a flight be for compensation?",
    a: "According to the Canadian Transportation Agency, Canadian rules apply when you arrive 3 or more hours late and the cause is within the airline's control and not required for safety. According to Your Europe, EU rules apply at 3 hours or more at your final destination. According to the UK Civil Aviation Authority, UK rules apply when you arrive more than three hours late. The US has no fixed payment for a late flight.",
    sources: [CTA, YOUR_EUROPE, CAA_DELAYS],
  },
  {
    q: "How much flight delay compensation is published?",
    a: "According to the Canadian Transportation Agency: C$400, C$700 or C$1,000 at 3, 6 and 9 hours for large airlines, and C$125, C$250 or C$500 for small airlines. EU amounts are €250, €400 or €600 by distance. According to the UK Civil Aviation Authority: £220, £350 or £520 by distance, with £260 for a 3 to 4 hour delay on flights over 3,500 km.",
    sources: [CTA, YOUR_EUROPE, CAA_DELAYS],
  },
  {
    q: "Do I claim from the airline or from the regulator?",
    a: "According to the Canadian Transportation Agency and the UK Civil Aviation Authority, you claim from the airline first, in writing. In Canada you can go to the regulator if the airline does not answer within 30 days. In the UK you can escalate if the airline takes more than eight weeks or you disagree with its final answer.",
    sources: [CTA, CAA_CLAIM],
  },
  {
    q: "What counts as extraordinary circumstances?",
    a: "According to the UK Civil Aviation Authority, the main categories likely to qualify include weather incompatible with safe flying, strikes unrelated to the airline, terrorism or sabotage, security risks, political or civil unrest, and hidden manufacturing defects. It says UK and EU court rulings have generally not treated ordinary technical faults as extraordinary. The airline has to explain the reason it relies on.",
    sources: [CAA_EXTRA],
  },
  {
    q: "Can I get my food and hotel costs back while I wait?",
    a: "According to the UK Civil Aviation Authority, airlines must provide food and drink, two calls or emails, and a hotel with transport if you are delayed overnight, whatever the cause. If the airline does not, you can arrange reasonable care yourself and claim the cost back. Keep itemised receipts, because airlines are unlikely to accept alcohol or luxury hotels. Your Europe also lists meals, hotel accommodation and communication facilities as EU rights.",
    sources: [CAA_DELAYS, YOUR_EUROPE],
  },
  {
    q: "What if my connection was on a separate booking?",
    a: "According to the UK Civil Aviation Authority, if your journey is made of separate bookings, sometimes called self-transfer, you do not have a statutory right to care, compensation or onward transport under UK rules if a delay makes you miss a flight. The rights for each individual flight still apply.",
    sources: [CAA_DELAYS],
  },
  {
    q: "Is there a time limit to claim?",
    a: "According to the Canadian Transportation Agency, you have one year to claim from the airline in writing. According to Your Europe, time limits depend on the country where a claim would be brought. The UK Civil Aviation Authority pages we read do not state a time limit, so check the one that applies to you.",
    sources: [CTA, YOUR_EUROPE, CAA_CLAIM],
  },
  {
    q: "What about being bumped from an oversold flight in the US?",
    a: "According to the US Department of Transportation, involuntary denied boarding on an oversold flight pays 200% of the one-way fare (airlines may cap it at $1,075) or 400% (capped at $2,150), depending on how late you arrive. It applies to domestic flights and international flights leaving the US.",
    sources: [DOT],
  },
];

export const FAQ_APPEAL: FaqItem[] = [
  {
    q: "Why do travel insurers deny delay or cancellation claims?",
    a: "According to commentary on UK Financial Ombudsman Service data, common avoidable reasons include undeclared medical conditions, excluded activities, travelling outside policy limits, and too little evidence. According to the ombudsman itself, most travel policies do not pay if the loss can be recovered from another source.",
    sources: [
      {
        label: "Insurance Edge, 29 Sep 2026",
        href: "https://insurance-edge.net/2026/09/29/travel-insurance-complaints-are-on-the-rise/",
      },
      FOS_TRAVEL,
    ],
  },
  {
    q: "Should I claim from the airline before the insurer?",
    a: "According to the UK Financial Ombudsman Service, ask the airline or travel provider for a refund or compensation where you can before contacting your insurer, because policies often do not cover what you can recover elsewhere. Claim only the shortfall from the insurer.",
    sources: [FOS_TRAVEL],
  },
  {
    q: "How long does a UK insurer have to answer a complaint?",
    a: "According to the Financial Ombudsman Service, the insurer has eight weeks to send a final response. After that, or if you disagree, you can bring the complaint to the ombudsman, and you have six months from the date on the final response to do it.",
    sources: [FOS_LIMITS],
  },
  {
    q: "Who do I complain to in Canada?",
    a: "According to Alberta's insurance regulator, complain to the insurer first, then travel, life, accident and sickness insurance goes to the OmbudService for Life and Health Insurance, while general insurance goes to the General Insurance OmbudService. Saskatchewan's regulator splits health claims and property claims between them. Ontario's regulator FSRA also asks for the insurer's final position letter.",
    sources: [
      { label: "Alberta, insurance consumer complaints", href: "https://www.alberta.ca/insurance-consumer-complaints" },
      {
        label: "FSRA, submit a complaint",
        href: "https://www.fsrao.ca/consumers/life-and-health-insurance/how-resolve-life-and-health-insurance-complaint",
      },
    ],
  },
  {
    q: "What does the ombudsman do, and is the decision binding?",
    a: "According to Citizens Advice, the UK Financial Ombudsman Service is free to use, and its decision is binding on the insurer but you do not have to accept it. If you disagree you can still take the insurer to court.",
    sources: [
      {
        label: "Citizens Advice, travel insurance claims",
        href: "https://www.citizensadvice.org.uk/consumer/insurance/types-of-insurance/travel-insurance1/problems-with-your-travel-insurance-claim/",
      },
    ],
  },
];

export const FAQ_CONNECTION: FaqItem[] = [
  {
    q: "Does EES apply when I just change planes in Schengen?",
    a: "According to the Austrian Interior Ministry, EES applies at the first Schengen entry and the last Schengen exit. If you stay in the transit area during a flight within Schengen and no border check is carried out, your data is not recorded in EES. Whether you can stay airside depends on your route and passport, so ask your airline.",
    sources: [BMI],
  },
  {
    q: "How long does EES registration take?",
    a: "According to an analysis by the Financial Times and Qsensor reported by Euronews, registration averages about 70 seconds. An unofficial airport guide says 3 to 7 minutes per person. A registration lasts three years or until the passport expires, per an airport guide, and later trips are quicker.",
    sources: [EURO_NEWS, { label: "FlightQueue guide", href: "https://flightqueue.com/ees-registration" }],
  },
  {
    q: "How long are EES queues at Schengen airports?",
    a: "According to the Financial Times and Qsensor analysis reported by Euronews, the average wait at Frankfurt reached about 120 minutes in July 2026, against about 60 a year earlier. Munich reached up to about 60 minutes and Amsterdam's maximum about 120. Waits vary by airport and hour.",
    sources: [EURO_NEWS],
  },
  {
    q: "Can countries still pause biometric checks when queues are long?",
    a: "According to Regulation (EU) 2025/1534, the power to pause biometric registration for up to six hours at a congested crossing ceased to apply on 7 September 2026. Press reports say nine countries may still limit checks, but we could not confirm that officially.",
    sources: [EUR_LEX],
  },
  {
    q: "What if I am on separate tickets?",
    a: "According to the UK Civil Aviation Authority, under UK rules a journey made of separate bookings carries no statutory right to care, compensation or onward transport if you miss a flight because of a delay. Check each airline's rules before you rely on a tight connection.",
    sources: [CAA_DELAYS],
  },
];

// ---------------------------------------------------------------------------
// Glossary

export const GLOSSARY_CLAIMS: Term[] = [
  { term: "APPR", meaning: "Canada's Air Passenger Protection Regulations, which cover flights to, from and within Canada." },
  { term: "EU261", meaning: "Regulation (EC) No 261/2004, the EU rule on compensation and care for delayed, cancelled and overbooked flights." },
  { term: "UK261", meaning: "The UK's version of EU261, which applies to flights leaving the UK and some flights arriving in the UK or EU." },
  { term: "Denied boarding", meaning: "Being refused a seat on a flight you booked, usually because it is oversold. Also called being bumped." },
  { term: "Extraordinary circumstances", meaning: "Causes outside the airline's control, such as severe weather or unrelated strikes, which can excuse an airline from paying compensation." },
  { term: "Care and assistance", meaning: "Food and drink, communication, and a hotel with transport while you wait. It is separate from compensation." },
  { term: "ADR", meaning: "Alternative dispute resolution, an approved independent body that reviews a complaint the airline has not resolved." },
];

export const GLOSSARY_EES: Term[] = [
  { term: "EES", meaning: "The Entry/Exit System, which records non-EU travellers on short stays at Schengen external borders, including fingerprints and a facial image." },
  { term: "Schengen Area", meaning: "The 29 European countries without internal border checks. EES applies at its external borders." },
  { term: "Transit area", meaning: "The part of an airport you stay in when changing planes without a border check." },
  { term: "Minimum connection time", meaning: "The shortest time an airline will sell between two flights. It can be too short on a busy day." },
  { term: "ETIAS", meaning: "A separate pre-travel authorisation for visa-exempt visitors to Europe, scheduled for late 2026." },
];

export const GLOSSARY_APPEAL: Term[] = [
  { term: "Final position letter", meaning: "In Canada, the insurer's written final decision on your complaint, usually needed before an ombudservice will review it." },
  { term: "Final response", meaning: "In the UK, the insurer's written final answer to a complaint. The six-month limit to go to the ombudsman starts from its date." },
  { term: "Ombudsman", meaning: "An independent body that reviews complaints about financial firms, usually free to the consumer." },
  { term: "Excess", meaning: "The part of a claim you pay yourself before the insurer pays." },
  { term: "Recoverable from another source", meaning: "A cost someone else, such as the airline, may repay. Many policies do not cover it." },
];
