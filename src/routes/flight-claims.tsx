import { createFileRoute } from "@tanstack/react-router";
import FlightClaims from "@/components/site/FlightClaims";
import { SITE_URL } from "@/lib/site";
import toolsCss from "../tools.css?url";

const TITLE = "Flight delayed or cancelled? Rules, deadlines and wording to claim | reviewthengo";
const DESCRIPTION =
  "See which published rules may apply to a delayed, cancelled or overbooked flight (Canada, EU, UK, US), the amounts and deadlines, where to file, and sample wording you can edit and send. Every rule is dated and sourced.";

export const Route = createFileRoute("/flight-claims")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/flight-claims` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/flight-claims` },
      { rel: "stylesheet", href: toolsCss },
    ],
  }),
  component: FlightClaims,
});
