import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL } from "@/lib/site";
import { pageHead } from "@/lib/seo";

// NOTE: This page states how the site works. It is not a substitute for a lawyer's review.
// Have a licensed professional in your jurisdiction read it before you rely on it.

const TITLE = "Disclaimer: legal information, not legal advice | reviewthengo";
const DESCRIPTION =
  "reviewthengo is not a law firm and gives legal information, not legal advice. We file nothing for you, promise no outcome, and are not liable for how you use it.";

export const Route = createFileRoute("/disclaimer")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/disclaimer",
      modified: "2026-10-02",
      crumbs: [
        { name: "Home", path: "/" },
        { name: "Disclaimer", path: "/disclaimer" },
      ],
    }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <main className="plain">
      <h1>Disclaimer</h1>
      <p className="when">Last updated: October 2026</p>

      <h2>1. We are not lawyers</h2>
      <p>
        reviewthengo and its owner are not lawyers, and reviewthengo is not a law firm. Nothing on this site is
        legal advice, and nothing here creates a lawyer and client relationship. It is legal information about
        travel rules and consumer rights, and tools that help you organise your own facts.
      </p>

      <h2>2. We do not act for you</h2>
      <p>
        We do not file, send or negotiate any claim, complaint or appeal for you. Sample wording is a starting
        point. You check it, edit it, and send it yourself. We never ask for or hold your claim documents.
      </p>

      <h2>3. Official rules come first</h2>
      <p>
        Regulations and the decisions of regulators, ombudsmen and courts override anything on this site. Where we
        describe a rule we say according to whom, and each rule shows its sources and the date we last checked it.
        Rules change, and some figures come from press reports, which we label. Check the official source before
        you rely on anything.
      </p>

      <h2>4. No guarantee</h2>
      <p>
        We cannot promise that an airline, insurer, regulator or court will agree with you, pay you, or respond in
        any time. Estimates, such as the connection check, are planning aids and not predictions. Where we could
        not find a reported figure, the page says it is our assumption.
      </p>

      <h2>5. We are not liable</h2>
      <p>
        To the extent permitted by law, reviewthengo and its owner are not liable for any loss, cost or damage that
        comes from using this site or relying on it, including a missed flight, a rejected claim, a missed
        deadline or an incorrect figure. You use the site at your own risk. Some places do not allow certain limits,
        so this applies only where it is allowed.
      </p>

      <h2>6. Your information</h2>
      <p>
        What you type into the tools stays in your browser and is not sent to us or saved. The site records
        anonymous counts of how often a tool is used. See the <a href="/privacy-policy">privacy policy</a>.
      </p>

      <h2>7. Other websites</h2>
      <p>
        We link to government and other sites. A link is not an endorsement, and we are not responsible for their
        content.
      </p>

      <h2>8. Corrections and contact</h2>
      <p>
        If you find something wrong, tell us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We list
        fixes openly on the <a href="/corrections">corrections page</a> with the date.
      </p>
    </main>
  );
}
