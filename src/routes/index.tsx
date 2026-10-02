import { createFileRoute } from "@tanstack/react-router";
import AlertForm from "@/components/site/AlertForm";
import { SITE_URL } from "@/lib/site";
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
const ENTRIES: Entry[] = [
  {
    title: "EES, Entry/Exit System",
    body: "Registers non-EU travellers at Schengen external borders. Phased in from 12 Oct 2025 and fully operational at all external borders from 10 Apr 2026.",
    status: "ok",
    checked: "01 Oct 2026",
    sources: [
      {
        label: "TTG Media",
        href: "https://www.ttgmedia.com/news/eu-confirms-october-start-date-for-new-biometric-border-rules-and-etias-visa-waiver-price-hike-52893",
      },
      {
        label: "VisasNews",
        href: "https://visasnews.com/en/despite-a-rocky-ees-rollout-etias-is-still-expected-by-late-2026/",
      },
    ],
  },
  {
    title: "ETIAS",
    body: "Travel authorisation for visa-exempt visitors to Europe. Scheduled for Q4 2026, with a fee of €20 (up from €7). No confirmed launch date in the sources we checked.",
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

const TITLE = "reviewthengo: travel rules, dated and sourced";
const DESCRIPTION =
  "Border systems, passenger rights and entry rules change with little warning. Every answer names its source and the day we last checked it.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "stylesheet", href: toolsCss },
    ],
  }),
  component: Home,
});

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
            When we are not sure, we say so.
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

        <div className="card" id="ledger">
          <div className="stamp" aria-hidden="true">
            Checked
            <br />
            01 Oct 2026
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
              <p>When we get something wrong, the fix and the date are listed openly.</p>
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
            <li>
              <span className="d">Q4 2026</span>
              <span className="t">ETIAS launch scheduled, date not yet confirmed</span>
              <span className="chip unc">Unconfirmed</span>
            </li>
            <li>
              <span className="d">10 Apr 2026</span>
              <span className="t">EES fully operational at all Schengen external borders</span>
              <span className="chip ok">In force</span>
            </li>
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
    </main>
  );
}
