import { createFileRoute } from "@tanstack/react-router";
import { Related } from "@/components/site/PageParts";
import { CONTACT_EMAIL } from "@/lib/site";
import { pageHead } from "@/lib/seo";

const TITLE = "Corrections | reviewthengo";
const DESCRIPTION =
  "Every correction to a reviewthengo rule or figure, with the date we fixed it. How to report a mistake.";

// Add a line here whenever something is corrected. Newest first.
// Example: { date: "05 Nov 2026", page: "Flight claim guide", was: "what it said", now: "what it says now", why: "source" }
type Correction = { date: string; page: string; was: string; now: string; why: string };
const CORRECTIONS: Correction[] = [
  {
    date: "14 Oct 2026",
    page: "Rules ledger, ETIAS article and FAQ",
    was: "ETIAS was described as scheduled for the fourth quarter of 2026, with no confirmed date.",
    now: "ETIAS has no confirmed launch date. The Government of Canada says it is not yet live, and press reports say the official ETIAS website dropped its 2026 target in July.",
    why: "Government of Canada travel advice for Europe, last modified 2 September 2026, and press reports on the change to the official ETIAS website.",
  },
];

export const Route = createFileRoute("/corrections")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/corrections",
      modified: "2026-10-14",
      crumbs: [
        { name: "Home", path: "/" },
        { name: "Corrections", path: "/corrections" },
      ],
    }),
  component: Corrections,
});

function Corrections() {
  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">Trust</p>
        <h1>Corrections</h1>
        <p className="lede">
          When we get something wrong, the fix and the date are listed here. We would rather show a correction than
          hide it.
        </p>
        {CORRECTIONS.length === 0 ? (
          <p className="corr-empty">No corrections have been published yet.</p>
        ) : (
          <div className="card">
            <table>
              <caption>Corrections</caption>
              <thead>
                <tr>
                  <th scope="col">What changed</th>
                  <th scope="col" className="date">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {CORRECTIONS.map((c) => (
                  <tr key={c.date + c.page + c.was}>
                    <td>
                      <strong>{c.page}</strong>
                      Was: {c.was} Now: {c.now}
                      <span className="src">Why: {c.why}</span>
                    </td>
                    <td className="date">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <h2 className="s" style={{ marginTop: 48 }}>
          Report a mistake.
        </h2>
        <p className="sub">
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the page, what is wrong, and a source if
          you have one. An official source helps most.
        </p>
      </div>
      <Related current="/corrections" />
    </main>
  );
}
