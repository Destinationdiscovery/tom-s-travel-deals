import { createFileRoute } from "@tanstack/react-router";
import { ArticleList } from "@/components/site/Articles";
import { pageHead } from "@/lib/seo";
import { ARTICLES } from "@/lib/articles-data";
import toolsCss from "../tools.css?url";

const TITLE = "Articles: Travel Rules, Dated and Sourced | reviewthengo";
const DESCRIPTION =
  "Guides and dated updates on flight compensation (EU261, UK261, APPR), EES, ETIAS and travel insurance appeals. Each article names its source and the day we checked it.";

export const Route = createFileRoute("/articles")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/articles",
      modified: ARTICLES.map((a) => a.checked).sort().pop() ?? "2026-10-02",
      css: toolsCss,
      crumbs: [
        { name: "Home", path: "/" },
        { name: "Articles", path: "/articles" },
      ],
    }),
  component: ArticleList,
});
