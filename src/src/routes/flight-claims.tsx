import { createFileRoute } from "@tanstack/react-router";
import FlightClaims from "@/components/site/FlightClaims";
import { FAQ_CLAIMS } from "@/lib/faq";
import { pageHead } from "@/lib/seo";
import toolsCss from "../tools.css?url";

const TITLE = "Flight Delay Compensation: EU261, UK261, APPR, US | reviewthengo";
const DESCRIPTION =
  "Flight delayed or cancelled? See which rules may apply under EU261, UK261, Canada's APPR and US rules: amounts, deadlines, where to file, and wording to send.";

export const Route = createFileRoute("/flight-claims")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/flight-claims",
      modified: "2026-10-02",
      css: toolsCss,
      faq: FAQ_CLAIMS,
      crumbs: [
        { name: "Home", path: "/" },
        { name: "Flight claim guide", path: "/flight-claims" },
      ],
    }),
  component: FlightClaims,
});
