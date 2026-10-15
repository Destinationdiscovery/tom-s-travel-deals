import { createFileRoute } from "@tanstack/react-router";
import AlertForm from "@/components/site/AlertForm";
import { Faq } from "@/components/site/PageParts";
import type { FaqItem } from "@/lib/faq";
import { pageHead } from "@/lib/seo";
import toolsCss from "../tools.css?url";

const TITLE = "Before You Fly from Canada: UK ETA, ETIAS, EES | reviewthengo";
const DESCRIPTION =
  "Canadians flying to the UK or Europe: UK ETA, ETIAS, EES, connection times and separate tickets, each with its source and the day we checked it.";
const CHECKED = "14 Oct 2026";

type Status = "ok" | "unc";
const STATUS_LABEL: Record<Status, string> = { ok: "In force", unc: "Unconfirmed" };

type Card = {
  chip: string;
  status: Status;
  title: string;
  body: string;
  href: string;
  cta: string;
};

// Every card repeats a fact already on the ledger or in an article, with its source named in the text.
const CARDS: Card[] = [
  {
    chip: STATUS_LABEL.ok,
    status: "ok",
    title: "1. UK ETA",
    body: "According to GOV.UK, you usually need an electronic travel authorisation rather than a visa if you are from Canada. It costs £20, covers up to 6 months, and babies and children need their own. GOV.UK warns that other websites may charge more.",
    href: "/articles/uk-eta-for-canadians",
    cta: "Read the UK ETA guide",
  },
  {
    chip: STATUS_LABEL.unc,
    status: "unc",
    title: "2. ETIAS",
    body: "According to the Government of Canada, ETIAS is not yet live, so there is nothing to apply for today. It also warns about fraudulent websites that claim to sell ETIAS authorisations. No launch date is confirmed.",
    href: "/articles/do-canadians-need-etias",
    cta: "Do Canadians need ETIAS?",
  },
  {
    chip: STATUS_LABEL.ok,
    status: "ok",
    title: "3. EES at the border",
    body: "According to the European Commission, EES has been fully operational across all Schengen countries since 10 April 2026. The Government of Canada says Canadians have fingerprints and a facial image taken at the border, and your passport must be valid for at least three months after your planned departure.",
    href: "/articles/ees-at-the-border-what-changed-in-2026",
    cta: "How EES works",
  },
  {
    chip: "Reported figures",
    status: "unc",
    title: "4. Your connection time",
    body: "According to an analysis by the Financial Times and Qsensor reported by Euronews, the average border wait at Frankfurt reached about 120 minutes in July 2026, against about 60 a year earlier. A short connection at your first Schengen airport can disappear in that queue.",
    href: "/connection-check",
    cta: "Run the connection check",
  },
  {
    chip: STATUS_LABEL.ok,
    status: "ok",
    title: "5. Separate tickets",
    body: "According to the UK Civil Aviation Authority, if your trip is made of separate bookings you have no statutory right under UK rules to care, compensation or onward transport when a delay makes you miss the next flight.",
    href: "/articles/separate-tickets-vs-one-booking",
    cta: "Separate tickets explained",
  },
  {
    chip: "If it goes wrong",
    status: "ok",
    title: "Flight late or claim denied?",
    body: "According to the Canadian Transportation Agency, you claim from the airline first, in writing, within one year. If your travel insurer says no, the appeal pack builds your letter from your own policy wording.",
    href: "/flight-claims",
    cta: "Open the flight claim guide",
  },
];

const FAQ_HUB: FaqItem[] = [
  {
    q: "Do Canadians need a UK ETA?",
    a: "According to GOV.UK, you usually need an electronic travel authorisation rather than a visa if you are from Canada, the USA, Australia, Europe or certain other countries. It costs £20 and lets you travel to the UK for up to 6 months. It does not guarantee entry.",
    sources: [{ label: "GOV.UK, electronic travel authorisation", href: "https://www.gov.uk/eta" }],
  },
  {
    q: "Do Canadians need ETIAS to visit Europe?",
    a: "Not today. According to the Government of Canada, ETIAS is not yet live. Once it is in place, Canadians will need it for short stays in Schengen countries and Cyprus, and the EU will announce the date several months before launch.",
    sources: [{ label: "Government of Canada, travel advice for Europe", href: "https://travel.gc.ca/travelling/travelling-europe" }],
  },
  {
    q: "Does EES apply if I only change planes in Schengen?",
    a: "According to the Austrian Interior Ministry, EES applies at your first Schengen entry and your last Schengen exit. If you stay in the transit area and no border check is carried out, your data is not recorded in EES. Whether you can stay airside depends on your route and passport, so ask your airline.",
    sources: [
      {
        label: "Austrian Interior Ministry, EES",
        href: "https://www.bmi.gv.at/202/Fremdenpolizei_und_Grenzkontrolle/Entry_Exit_System/start_en.aspx",
      },
    ],
  },
];

export const Route = createFileRoute("/before-you-fly")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/before-you-fly",
      modified: "2026-10-14",
      css: toolsCss,
      crumbs: [
        { name: "Home", path: "/" },
        { name: "Before you fly from Canada", path: "/before-you-fly" },
      ],
      faq: FAQ_HUB.map((f) => ({ q: f.q, a: f.a })),
    }),
  component: BeforeYouFly,
});

function BeforeYouFly() {
  return (
    <main>
      <div className="wrap toolhead">
        <nav className="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> / </span>
          <span>Before you fly from Canada</span>
        </nav>
        <p className="eyebrow">Checklist for Canadians</p>
        <h1>Before you fly from Canada, check these five rules.</h1>
        <p className="lede">
          Entry rules for the UK and Europe have changed over the past year. One is live and costs money, one is not
          live yet, and one can quietly eat your connection. Every item below names its source and the day we last
          checked it. We label what we cannot confirm.
        </p>
      </div>

      <section className="band">
        <div className="wrap">
          <div className="tools">
            {CARDS.map((c) => (
              <div className="tool" key={c.title}>
                <span className={`chip ${c.status}`}>{c.chip}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <a className="btn solid" href={c.href}>
                  {c.cta}
                </a>
                <p className="fine">Checked {CHECKED}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="alerts">
        <div className="wrap">
          <h2 className="s">Flying soon? Get told when a rule changes.</h2>
          <p className="sub">
            Leave your email and we will write when one of these rules changes or an official source confirms something
            we have marked Unconfirmed. Information, not legal advice.
          </p>
          <div className="tools pair">
            <div className="tool dark">
              <span className="chip">Rule changes</span>
              <h3>Rules for Canadians flying to the UK and Europe</h3>
              <AlertForm
                source="hub-before-you-fly"
                interests={["canada-trip-rules"]}
                buttonText="Email me when rules change"
                inputId="hub-alert-email"
                doneText="Thanks. We will email you when one of these rules changes. If it does not arrive, check your spam or junk folder."
              />
              <p className="fine">
                By signing up you agree to get these emails. Every email has an unsubscribe link. If it does not arrive,
                check your spam or junk folder.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Faq
        title="Quick answers for Canadians."
        intro="Short answers, each tied to its source. Legal information, not legal advice."
        items={FAQ_HUB}
      />
    </main>
  );
}
