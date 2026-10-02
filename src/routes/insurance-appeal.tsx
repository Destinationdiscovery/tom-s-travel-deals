import { createFileRoute } from "@tanstack/react-router";
import AppealPack from "@/components/site/AppealPack";
import { FAQ_APPEAL } from "@/lib/faq";
import { pageHead } from "@/lib/seo";
import toolsCss from "../tools.css?url";

const TITLE = "Travel Insurance Claim Denied? Build Your Appeal | reviewthengo";
const DESCRIPTION =
  "Travel insurer denied delay or cancellation costs? Build an appeal from your own policy wording and see the complaint route for Canada, UK, US and Australia.";

export const Route = createFileRoute("/insurance-appeal")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/insurance-appeal",
      modified: "2026-10-02",
      css: toolsCss,
      faq: FAQ_APPEAL,
      crumbs: [
        { name: "Home", path: "/" },
        { name: "Insurance appeal pack", path: "/insurance-appeal" },
      ],
    }),
  component: AppealPack,
});
