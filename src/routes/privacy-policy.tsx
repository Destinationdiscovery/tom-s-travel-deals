import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

const TITLE = "Privacy policy | reviewthengo";
const DESCRIPTION =
  "How reviewthengo collects, uses, and protects the information of visitors and subscribers.";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/privacy-policy` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy-policy` }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <main className="plain">
      <h1>Privacy policy</h1>
      <p className="when">Last updated: October 2026</p>

      <h2>1. Information we collect</h2>
      <p>
        We collect information you give us directly, such as your email address when you sign up for
        alerts. We also automatically collect certain information when you visit the site, including
        your IP address, browser type, and the pages you view.
      </p>

      <h2>2. How we use your information</h2>
      <p>
        We use this information to run and improve the site, to send alerts and updates you asked
        for, to respond to messages, and to understand how the site is used.
      </p>

      <h2>3. Cookies and tracking</h2>
      <p>
        We use Google Analytics to understand how the site is used. The site may also load Google
        AdSense, which can use cookies to serve and measure ads. If we add affiliate links, the
        partner may set tracking cookies and we may earn a commission if you buy through them.
      </p>

      <h2>4. Third-party services</h2>
      <p>
        The site links to third-party websites, including government and travel sites. They have
        their own privacy policies, and we are not responsible for their practices.
      </p>

      <h2>5. Data security</h2>
      <p>
        We take reasonable steps to protect your information. No method of transmission over the
        internet is completely secure, so we cannot guarantee absolute security.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask to see, correct, or delete your personal information at any time. If you
        subscribed to alerts, you can unsubscribe at any time using the link in each email.
      </p>

      {CONTACT_EMAIL ? (
        <>
          <h2>7. Contact us</h2>
          <p>
            Questions about this policy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </>
      ) : null}
    </main>
  );
}
