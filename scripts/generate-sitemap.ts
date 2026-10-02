// Writes public/sitemap.xml with the pages that exist now, including every article.
// Runs via the predev / prebuild hooks in package.json. No network needed.
// When you add a page (not an article), add it to PAGES below. Articles are picked up from src/content/articles.
// When a page's content really changes, update its date. Honest dates help search engines trust the site.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";

const SITE = "https://www.reviewthengo.com";
const PAGES: { path: string; lastmod: string }[] = [
  { path: "/", lastmod: "2026-10-02" },
  { path: "/flight-claims", lastmod: "2026-10-02" },
  { path: "/insurance-appeal", lastmod: "2026-10-02" },
  { path: "/connection-check", lastmod: "2026-10-02" },
  { path: "/about", lastmod: "2026-10-02" },
  { path: "/corrections", lastmod: "2026-10-02" },
  { path: "/disclaimer", lastmod: "2026-10-02" },
  { path: "/privacy-policy", lastmod: "2026-10-02" },
];
const OUT_PATH = resolve("public/sitemap.xml");
const ARTICLES_DIR = resolve("src/content/articles");

const articles: { path: string; lastmod: string }[] = [];
if (existsSync(ARTICLES_DIR)) {
  for (const file of readdirSync(ARTICLES_DIR)) {
    if (!file.endsWith(".md")) continue;
    const text = readFileSync(resolve(ARTICLES_DIR, file), "utf-8");
    const checked = /^checked:\s*(\d{4}-\d{2}-\d{2})\s*$/m.exec(text)?.[1];
    if (!checked) continue; // skipped by the site as well, so keep it out of the sitemap
    articles.push({ path: `/articles/${file.replace(/\.md$/, "")}`, lastmod: checked });
  }
}
articles.sort((a, b) => a.path.localeCompare(b.path));

const latest = articles.map((a) => a.lastmod).sort().pop() ?? "2026-10-02";
const all = [...PAGES, { path: "/articles", lastmod: latest }, ...articles];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  all.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${p.lastmod}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, xml);
console.log(`sitemap.xml written (${all.length} pages, ${articles.length} articles)`);
