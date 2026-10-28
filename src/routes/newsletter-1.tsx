import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";

const TARGET =
  "https://muse.ai/s/travelonly-with-tom-newsletter-first-xaxj6xgxr34xgwdw/d0XBDpzjIkcy4KQnofLLL2bhKZyY_fxDefkz9blFSoA";
const CANONICAL = "https://www.reviewthengo.com/newsletter-1";
const OG_IMAGE = "https://www.reviewthengo.com/newsletter-first-edition-og.jpg";
const TITLE = "TravelOnly With Tom Newsletter, First Edition";
const DESCRIPTION =
  "Mexico in winter, a December packing list, ETIAS in plain language, UK ETA, the free Trip Packer, and a deal window ending October 31.";
const COUNTER_API = "https://countapi.mileshilliard.com/api/v1/hit";
const COUNTER_KEY = "reviewthengo-newsletter-1";
// To see the total clicks without adding one, open:
// https://countapi.mileshilliard.com/api/v1/get/reviewthengo-newsletter-1
// Do not open the /hit/ URL to check, that adds 1.

export const Route = createFileRoute("/newsletter-1")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "reviewthengo" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: TITLE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: TITLE },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: NewsletterRedirect,
});

function NewsletterRedirect() {
  const countedRef = useRef(false);
  useEffect(() => {
    if (countedRef.current) return;
    countedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const rawSource = params.get("src") || params.get("utm_source") || "";
    const source = rawSource
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 32);
    const keys = [COUNTER_KEY];
    if (source) keys.push(`${COUNTER_KEY}-src-${source}`);
    const hits = keys.map((key) =>
      fetch(`${COUNTER_API}/${key}`, {
        cache: "no-store",
        keepalive: true,
      }).catch(() => undefined)
    );
    const timeout = new Promise((resolve) => setTimeout(resolve, 500));
    Promise.race([Promise.allSettled(hits), timeout]).finally(() => {
      window.location.replace(TARGET);
    });
  }, []);
  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">TravelOnly With Tom</p>
        <h1>Newsletter, First Edition</h1>
        <p>
          Opening the newsletter. If it does not open,{" "}
          <a href={TARGET}>continue to the newsletter</a>.
        </p>
      </div>
    </main>
  );
}
