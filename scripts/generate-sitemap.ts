// Writes public/sitemap.xml with only the pages that exist now.
// Runs via the predev / prebuild hooks in package.json. No network needed.
// When you add a page, add it to PAGES below. When a page's content really changes, update its date.
// Honest dates help search engines trust the freshness of the site.

import { writeFileSync, mkdirSync } from "fs";
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
  { path: "/privacy-policy", lastmod: "2026-10-02" }
];
const OUT_PATH = resolve("public/sitemap.xml");

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  PAGES.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${p.lastmod}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, xml);
console.log(`sitemap.xml written (${PAGES.length} pages)`);
