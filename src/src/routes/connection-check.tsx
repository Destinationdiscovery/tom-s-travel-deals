import { createFileRoute } from "@tanstack/react-router";
import ConnectionCheck from "@/components/site/ConnectionCheck";
import { FAQ_CONNECTION } from "@/lib/faq";
import { pageHead } from "@/lib/seo";
import toolsCss from "../tools.css?url";

const TITLE = "EES Wait Times and Schengen Connection Time | reviewthengo";
const DESCRIPTION =
  "Worried about EES wait times on a Schengen connection? Estimate how much time border checks may need, with sourced wait times and clear assumptions.";

export const Route = createFileRoute("/connection-check")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/connection-check",
      modified: "2026-10-02",
      css: toolsCss,
      faq: FAQ_CONNECTION,
      crumbs: [
        { name: "Home", path: "/" },
        { name: "Connection check", path: "/connection-check" },
      ],
    }),
  component: ConnectionCheck,
});
