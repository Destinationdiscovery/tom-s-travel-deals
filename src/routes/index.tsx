import { createFileRoute } from "@tanstack/react-router";
import AlertForm from "@/components/site/AlertForm";
import { ArticleCards } from "@/components/site/Articles";
import { Faq } from "@/components/site/PageParts";
import { ARTICLES } from "@/lib/articles-data";
import { FAQ_HOME } from "@/lib/faq";
import { pageHead } from "@/lib/seo";
import toolsCss from "../tools.css?url";

type Status = "ok" | "unc" | "sched";
const STATUS_LABEL: Record<Status, string> = {
  ok: "In force",
  unc: "Unconfirmed",
  sched: "Scheduled",
};

type Source = { label: string; href: string };
type Entry = {
  title: string;
  body: string;
  status: Status;
  checked: string;
  sources: Source[];
};

// Add or edit ledger entries here. Every entry needs a status, a checked date, and sources.
// Newest or most important first. Write each body as "According to [source], ..." and label what you cannot confirm.
const ENTRIES: Entry[] = [
  {
    title: "EES, congestion pause ended",
    body: "According to Regulation (EU) 2025/1534, for a limited time after the rollout countries could pause biometric registration at a named crossing for up to six hours when waits were excessive. That power ran 90 days plus an automatic 60-day extension after the rollout ended on 9 April 2026. By our count the last day was 6 September 2026, and it ceased from 7 September. The regulation has no mechanism to extend it.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [
      { label: "Regulation (EU) 2025/1534, EUR-Lex", href: "https://eur-lex.europa.eu/eli/reg/2025/1534/oj" },
      {
        label: "European Commission, 10 Apr 2026",
        href: "https://home-affairs.ec.europa.eu/news/entryexit-system-ees-fully-operational-2026-04-10_en",
      },
    ],
  },
  {
    title: "EES, reports of continued limits in nine countries",
    body: "According to press reports that trace to a single Times report, France, Belgium, the Netherlands, Germany, Greece, Malta, Portugal, Italy and Switzerland were allowed to keep limiting biometric checks after the deadline, with no new date. We found no official statement or legal instrument confirming it, and the European Commission has not commented.",
    status: "unc",
    checked: "02 Oct 2026",
    sources: [
      {
        label: "Connexion France",
        href: "https://www.connexionfrance.com/news/france-listed-among-countries-to-delay-full-ees-border-check-rollout/814138",
      },
      { label: "Your Mileage May Vary", href: "https://yourmileagemayvary.com/2026/09/15/europe-ees-border-checks-inconsistent/" },
      {
        label: "Remote Work Europe",
        href: "https://remoteworkeurope.eu/news/2026/ees-biometric-derogation-expired-commission-silent/",
      },
    ],
  },
  {
    title: "EES, Entry/Exit System",
    body: "According to the European Commission, EES became fully operational across all Schengen countries on 10 April 2026, after a progressive start that began on 12 October 2025. It registers non-EU travellers on short stays, including fingerprints and a facial image, in place of passport stamps.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [
      {
        label: "European Commission, 10 Apr 2026",
        href: "https://home-affairs.ec.europa.eu/news/entryexit-system-ees-fully-operational-2026-04-10_en",
      },
      { label: "Official EES site", href: "https://travel-europe.europa.eu/en/ees" },
      {
        label: "TTG Media",
        href: "https://www.ttgmedia.com/news/eu-confirms-october-start-date-for-new-biometric-border-rules-and-etias-visa-waiver-price-hike-52893",
      },
    ],
  },
  {
    title: "UK, CAA guidance on the NATS disruption",
    body: "According to the UK Civil Aviation Authority (9 September 2026), a technical issue at NATS on 8 September led to delays and the cancellation of hundreds of UK flights. The CAA considers delays and cancellations directly caused by it likely to be extraordinary circumstances, so passengers are unlikely to be entitled to compensation for those. Airlines must still look after passengers, offer a refund or re-routing, and promptly reimburse reasonable costs when passengers arrange their own care. The CAA calls this guidance only, says each case turns on its facts, and says passengers can still claim, including in court. It also published a statement on a further disruption on 21 September, which we have not summarised.",
    status: "ok",
    checked: "02 Oct 2026",
    sources: [
      {
        label: "UK Civil Aviation Authority, 9 Sep 2026",
        href: "https://www.caa.co.uk/newsroom/news/caa-statement-on-passenger-compensation-following-nats-disruption-on-8-september/",
      },
    ],
  },
  {
    title: "ETIAS",
    body: "According to press reports, ETIAS, the travel authorisation for visa-exempt visitors to Europe, is scheduled for Q4 2026, with a fee of €20 (up from €7). We found no confirmed launch date in the sources we checked.",
    status: "unc",
    checked: "01 Oct 2026",
    sources: [
      {
        label: "Business Travel News Europe",
        href: "https://www.businesstravelnewseurope.com/Management/EU-names-date-for-launch-of-much-delayed-Entry-Exit-System",
      },
      {
        label: "VisasNews",
        href: "https://visasnews.com/en/despite-a-rocky-ees-rollout-etias-is-still-expected-by-late-2026/",
      },
      { label: "Official ETIAS portal", href: "https://travel-europe.europa.eu/etias" },
    ],
  },
];

const TITLE = "Flight Compensation, EES and Insurance Rules | reviewthengo";
const DESCRIPTION =
  "Dated, sourced travel rules: flight delay compensation (Canada, EU, UK, US), EES border queues and travel insurance appeals. We label what we cannot confirm.";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/",
      modified: "2026-10-02",
      css: toolsCss,
      faq: FAQ_HOME,
    }),
  component: Home,
});

type Change = { d: string; t: string; status: Status; upcoming?: boolean };

// Newest first. The hero shows the latest three that already happened; the Recent changes section shows all.
const CHANGES: Change[] = [
  { d: "Q4 2026", t: "ETIAS launch scheduled, date not yet confirmed", status: "unc", upcoming: true },
  { d: "13 Sep 2026", t: "Reports that nine countries may keep limiting EES biometric checks", status: "unc" },
  { d: "9 Sep 2026", t: "UK CAA guidance on compensation after the 8 September NATS disruption", status: "ok" },
  { d: "7 Sep 2026", t: "EES congestion pause ceased to apply, last day 6 September", status: "ok" },
  { d: "10 Apr 2026", t: "EES fully operational at all Schengen external borders", status: "ok" },
];

const FEATURED = [...ARTICLES.filter((a) => a.featured), ...ARTICLES.filter((a) => !a.featured)].slice(0, 3);

function Home() {
  return (
    <main>
      <div className="wrap hero">
        <div>
          <p className="eyebrow">Worldwide travel rules, dated and sourced</p>
          <h1>Review the rules, then go.</h1>
          <p className="lede">
            Border systems, passenger rights and entry rules change with little warning. Every answer
            here names its source and the day we last verified it, so you can review before you go.
            When we are not sure, we say so. Start with flight delay and cancellation compensation rules for Canada,
            the EU, the UK and the US, travel insurance claim appeals, or how much time EES border checks may need
            on a Schengen connection.
          </p>
          <div className="cta">
            <a className="btn solid" href="#ledger">
              Read the rules ledger
            </a>
            <a className="btn" href="#alerts">
              Get change alerts
            </a>
          </div>
        </div>

        <div className="card latest">
          <h2>Latest changes</h2>
          <ul className="latest-list">
            {CHANGES.filter((c) => !c.upcoming)
              .slice(0, 3)
              .map((c) => (
                <li key={c.d + c.t}>
                  <span className="d">{c.d}</span>
                  <span className="t">{c.t}</span>
                  <span className={`chip ${c.status}`}>{STATUS_LABEL[c.status]}</span>
                </li>
              ))}
          </ul>
          <p className="hint">
            <a href="#ledger">See the full rules ledger</a> and the <a href="#changes">whole change log</a>.
          </p>
        </div>
      </div>

      <section className="band" id="ledger">
        <div className="wrap">
          <h2 className="s">Rules ledger.</h2>
          <p className="sub">
            Every entry names its source, its status and the day we last checked it. Anything we cannot confirm is
            labelled Unconfirmed.
          </p>
          <div className="ledger-wide">
            <div className="card">
              <div className="stamp" aria-hidden="true">
                Checked
                <br />
                02 Oct 2026
              </div>
              <h2>Rules ledger</h2>
              <table>
                <caption>Rules ledger</caption>
                <thead>
                  <tr>
                    <th scope="col">Rule</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="date">
                      Checked
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ENTRIES.map((e) => (
                    <tr key={e.title}>
                      <td>
                        <strong>{e.title}</strong>
                        {e.body}
                        <span className="src">
                          Sources:{" "}
                          {e.sources.map((s, i) => (
                            <span key={s.href + s.label}>
                              {i > 0 ? ", " : ""}
                              <a href={s.href} rel="noopener noreferrer" target="_blank">
                                {s.label}
                              </a>
                            </span>
                          ))}
                        </span>
                      </td>
                      <td>
                        <span className={`chip ${e.status}`}>{STATUS_LABEL[e.status]}</span>
                      </td>
                      <td className="date">{e.checked}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="more" colSpan={3}>
                      More entries are added as each one is checked. Links to official government pages
                      are attached wherever we can find them.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="method">
        <div className="wrap">
          <h2 className="s">How an entry gets on the ledger.</h2>
          <p className="sub">
            Four rules we do not bend. They are what separates this site from a page that guessed.
          </p>
          <div className="method">
            <div>
              <b>01</b>
              <h3>Official source first</h3>
              <p>Government or regulator text before any news report or blog.</p>
            </div>
            <div>
              <b>02</b>
              <h3>Always dated</h3>
              <p>Each entry shows the day we last checked it, not the day we wrote it.</p>
            </div>
            <div>
              <b>03</b>
              <h3>Honest status</h3>
              <p>
                We label what we cannot confirm instead of rounding it into a fact.
              </p>
              <span className="legend">
                <span className="chip ok">In force</span>
                <span className="chip sched">Scheduled</span>
                <span className="chip unc">Unconfirmed</span>
              </span>
            </div>
            <div>
              <b>04</b>
              <h3>Public corrections</h3>
              <p>
                When we get something wrong, the fix and the date are listed on the{" "}
                <a href="/corrections">corrections page</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="tools">
        <div className="wrap">
          <h2 className="s">Tools, built on the rules.</h2>
          <p className="sub">
            Each tool says where its numbers come from and what we assumed. Nothing you type is sent or
            saved. They give legal information, not legal advice, and we never send anything for you.
          </p>
          <div className="tools">
            <div className="tool">
              <span className="chip ok">Open</span>
              <h3>Flight claim guide</h3>
              <p>
                Flight delayed or cancelled? See which rules may apply, the amounts and deadlines, where to
                file, and wording you can edit and send yourself.
              </p>
              <a className="btn solid" href="/flight-claims">
                Open the guide
              </a>
              <p className="fine">Canada, EU, UK and US rules.</p>
            </div>
            <div className="tool">
              <span className="chip ok">Open</span>
              <h3>Insurance appeal pack</h3>
              <p>
                Travel insurer denied delay or cancellation expenses? Build your appeal from your own policy
                wording.
              </p>
              <a className="btn solid" href="/insurance-appeal">
                Open the pack
              </a>
              <p className="fine">Complaint routes for Canada, UK, US and Australia.</p>
            </div>
            <div className="tool">
              <span className="chip ok">Open</span>
              <h3>Connection check</h3>
              <p>
                Changing planes into or out of Schengen? Estimate how much time border checks may need.
              </p>
              <a className="btn solid" href="/connection-check">
                Open the tool
              </a>
              <p className="fine">Runs in your browser. Nothing is saved.</p>
            </div>
          </div>
        </div>
      </section>

      {FEATURED.length > 0 ? (
        <section className="band" id="articles">
          <div className="wrap">
            <h2 className="s">Latest articles.</h2>
            <p className="sub">
              Guides and dated updates on flight compensation, EES, ETIAS and travel insurance appeals.{" "}
              <a href="/articles">See all articles</a>.
            </p>
            <ArticleCards items={FEATURED} />
          </div>
        </section>
      ) : null}

      <section className="band">
        <div className="wrap">
          <div className="tools one">
            <div className="tool dark" id="alerts">
              <span className="chip">Open</span>
              <h3>Rule change alerts</h3>
              <p>One email when a rule you follow changes. Nothing else.</p>
              <AlertForm source="home-alerts" interests={["rule-alerts"]} inputId="alerts-email" />
              <p className="fine">Unsubscribe in one click.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="changes">
        <div className="wrap">
          <h2 className="s">Recent changes.</h2>
          <p className="sub">The log of what moved, newest first.</p>
          <ul className="changes">
            {CHANGES.map((c) => (
              <li key={c.d + c.t}>
                <span className="d">{c.d}</span>
                <span className="t">{c.t}</span>
                <span className={`chip ${c.status}`}>{STATUS_LABEL[c.status]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band">
        <div className="wrap funded">
          <div>
            <h2 className="s">How this site is funded.</h2>
          </div>
          <div>
            <p>
              Ads and affiliate links, once the site is large enough to carry them. Both will be
              labelled, and both will sit below the sourced answer, never inside it.
            </p>
            <p>
              A partner can never change the wording of a rule or hide a correction. That is written
              down here so you can hold us to it.
            </p>
          </div>
        </div>
      </section>
      <Faq
        title="Common questions, answered."
        intro="Short answers, each tied to its source. Legal information, not legal advice."
        items={FAQ_HOME}
      />
    </main>
  );
}
