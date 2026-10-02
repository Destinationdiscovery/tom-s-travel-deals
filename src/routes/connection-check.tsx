import { createFileRoute } from "@tanstack/react-router";
import ConnectionCheck from "@/components/site/ConnectionCheck";
import { SITE_URL } from "@/lib/site";
import toolsCss from "../tools.css?url";

const TITLE = "Schengen connection check: how much time may border checks need? | reviewthengo";
const DESCRIPTION =
  "Changing planes into or out of Schengen? Estimate how much time EES border checks may need and how your connection holds up. Every figure is labelled reported or assumed, with sources and the date checked.";

export const Route = createFileRoute("/connection-check")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/connection-check` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/connection-check` },
      { rel: "stylesheet", href: toolsCss },
    ],
  }),
  component: ConnectionCheck,
});
