// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Fetches the live sitemap from the generate-sitemap Edge Function and
// writes it to public/sitemap.xml so it is served from the project's own
// domain (https://www.reviewthengo.com/sitemap.xml). This is required
// because Google Search Console does not reliably follow cross-domain
// redirects for sitemaps.

import { writeFileSync } from "fs";
import { resolve } from "path";

const EDGE_FUNCTION_URL =
  "https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-sitemap";

const FALLBACK = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.reviewthengo.com/</loc></url>
</urlset>`;

async function main() {
  let xml = FALLBACK;
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      headers: { Accept: "application/xml" },
    });
    if (res.ok) {
      const body = await res.text();
      if (body.trim().startsWith("<?xml")) {
        xml = body;
        console.log(`sitemap.xml fetched from edge function (${body.length} bytes)`);
      } else {
        console.warn("sitemap edge function did not return XML, using fallback");
      }
    } else {
      console.warn(`sitemap edge function returned ${res.status}, using fallback`);
    }
  } catch (err) {
    console.warn("sitemap fetch failed, using fallback:", err);
  }
  writeFileSync(resolve("public/sitemap.xml"), xml);
}

main();
