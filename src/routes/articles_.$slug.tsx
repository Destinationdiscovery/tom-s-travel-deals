import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticleView } from "@/components/site/Articles";
import { ARTICLES } from "@/lib/articles-data";
import { findArticle } from "@/lib/articles";
import { pageHead } from "@/lib/seo";
import toolsCss from "../tools.css?url";

export const Route = createFileRoute("/articles_/$slug")({
  loader: ({ params }) => {
    const article = findArticle(ARTICLES, params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return {};
    return pageHead({
      title: `${a.title} | reviewthengo`,
      description: a.description,
      path: `/articles/${a.slug}`,
      modified: a.checked,
      published: a.published,
      type: "Article",
      css: toolsCss,
      crumbs: [
        { name: "Home", path: "/" },
        { name: "Articles", path: "/articles" },
        { name: a.title, path: `/articles/${a.slug}` },
      ],
    });
  },
  component: ArticleRoute,
});

function ArticleRoute() {
  const { article } = Route.useLoaderData();
  return <ArticleView article={article} />;
}
