// Writes public/sitemap.xml with only the pages that exist now.
// Runs via the predev / prebuild hooks in package.json. No network needed.
// When you add a page, add its path to PAGES below.

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const SITE = "https://www.reviewthengo.com";
const PAGES = ["/", "/flight-claims", "/insurance-appeal", "/connection-check", "/disclaimer", "/privacy-policy"];
const OUT_PATH = resolve("public/sitemap.xml");

const today = new Date().toISOString().slice(0, 10);
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  PAGES.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, xml);
console.log(`sitemap.xml written (${PAGES.length} pages)`);
