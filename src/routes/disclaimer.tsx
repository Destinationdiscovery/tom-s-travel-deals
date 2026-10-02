import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

// NOTE: This page states how the site works. It is not a substitute for a lawyer's review.
// Have a licensed professional in your jurisdiction read it before you rely on it.

const TITLE = "Disclaimer | reviewthengo";
const DESCRIPTION =
  "reviewthengo gives legal information, not legal advice. We do not file or send anything for you, and we cannot promise any outcome.";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/disclaimer` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/disclaimer` }],
  }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <main className="plain">
      <h1>Disclaimer</h1>
      <p className="when">Last updated: October 2026</p>

      <h2>1. Information, not advice</h2>
      <p>
        reviewthengo publishes information about travel rules and consumer rights, and tools that help you
        organise your own facts. It is legal information, not legal advice. We are not a law firm, and nothing here
        creates a lawyer and client relationship.
      </p>

      <h2>2. We do not act for you</h2>
      <p>
        We do not file, send or negotiate any claim, complaint or appeal for you. Sample wording is a starting
        point. You check it, edit it, and send it yourself. We never ask for or hold your claim documents.
      </p>

      <h2>3. Official rules come first</h2>
      <p>
        Regulations and the decisions of regulators, ombudsmen and courts override anything on this site. Each rule
        shows its sources and the date we last checked it. Rules change, and some figures come from press reports,
        which we label. Check the official source before you rely on anything.
      </p>

      <h2>4. No guarantee</h2>
      <p>
        We cannot promise that an airline, insurer, regulator or court will agree with you, pay you, or respond in
        any time. Estimates, such as the connection check, are planning aids and not predictions. Where we could
        not find a reported figure, the page says it is our assumption.
      </p>

      <h2>5. Your information</h2>
      <p>
        What you type into the tools stays in your browser and is not sent to us or saved. The site records
        anonymous counts of how often a tool is used. See the <a href="/privacy-policy">privacy policy</a>.
      </p>

      <h2>6. Other websites</h2>
      <p>
        We link to government and other sites. A link is not an endorsement, and we are not responsible for their
        content.
      </p>

      <h2>7. Limits on our responsibility</h2>
      <p>
        The site is provided as it is. To the extent the law allows, we are not responsible for losses that come
        from relying on it. Some places do not allow certain limits, so this applies only where it is allowed.
      </p>

      <h2>8. Corrections</h2>
      <p>
        If you find something wrong, tell us. We list corrections openly with the date.
        {CONTACT_EMAIL ? (
          <>
            {" "}
            Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </>
        ) : null}
      </p>
    </main>
  );
}
