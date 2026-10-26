import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

const TARGET =
  "https://muse.ai/s/travelonly-with-tom-newsletter-first-xaxj6xgxr34xgwdw/d0XBDpzjIkcy4KQnofLLL2bhKZyY_fxDefkz9blFSoA";

export const Route = createFileRoute("/newsletter-1")({
  head: () =>
    pageHead({
      title: "TravelOnly With Tom Newsletter, First Edition",
      description:
        "Mexico in winter, a December packing list, ETIAS in plain language, UK ETA, the free Trip Packer, and a deal window ending October 31.",
      path: "/newsletter-1",
      modified: "2026-10-26",
    }),
  component: NewsletterRedirect,
});

function NewsletterRedirect() {
  useEffect(() => {
    window.location.replace(TARGET);
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
