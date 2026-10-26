import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

const TARGET =
  "https://muse.ai/s/taylor-and-alexa-wedding-resorts-wxh6xgxigxxxfrxpw/iG1BkIkjZ_udHZt4IWcKZd0bPMRSkmAGvFFfzTVDX0o";
const CANONICAL = "https://www.reviewthengo.com/taylor-and-alexa";

export const Route = createFileRoute("/taylor-and-alexa")({
  head: () => ({
    meta: [
      { title: "Taylor and Alexa Wedding Resorts" },
      {
        name: "description",
        content:
          "Three resorts compared for Taylor and Alexa, Grand Palladium Punta Cana, Zemi Miches, and Riu Guanacaste.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Taylor and Alexa Wedding Resorts" },
      {
        property: "og:description",
        content:
          "Three resorts compared for Taylor and Alexa, Grand Palladium Punta Cana, Zemi Miches, and Riu Guanacaste.",
      },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: TaylorRedirect,
});

function TaylorRedirect() {
  useEffect(() => {
    window.location.replace(TARGET);
  }, []);
  return (
    <main>
      <div className="wrap toolhead">
        <p className="eyebrow">TravelOnly With Tom</p>
        <h1>Taylor and Alexa Wedding Resorts</h1>
        <p>
          Opening the wedding resorts page. If it does not open,{" "}
          <a href={TARGET}>continue to the wedding resorts page</a>.
        </p>
      </div>
    </main>
  );
}
