// Loads every Markdown file in src/content/articles when the site is built.
import { buildIndex } from "@/lib/articles";

const files = import.meta.glob("../content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const built = buildIndex(files);
if (built.problems.length > 0) {
  console.warn("Articles skipped because of a problem:\n" + built.problems.join("\n"));
}

export const ARTICLES = built.articles;
