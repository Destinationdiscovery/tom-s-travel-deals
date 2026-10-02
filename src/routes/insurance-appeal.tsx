import { createFileRoute } from "@tanstack/react-router";
import AppealPack from "@/components/site/AppealPack";
import { SITE_URL } from "@/lib/site";
import toolsCss from "../tools.css?url";

const TITLE = "Travel insurance claim denied? Build your appeal from your own policy wording | reviewthengo";
const DESCRIPTION =
  "Insurer denied trip delay or cancellation expenses? Build an appeal letter from your own policy wording, see the policy words worth checking, and see the published complaint route for Canada, the UK, the US and Australia.";

export const Route = createFileRoute("/insurance-appeal")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/insurance-appeal` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/insurance-appeal` },
      { rel: "stylesheet", href: toolsCss },
    ],
  }),
  component: AppealPack,
});
