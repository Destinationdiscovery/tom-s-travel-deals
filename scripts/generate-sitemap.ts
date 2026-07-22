// Fetches the dynamic sitemap from the generate-sitemap Edge Function
// and writes it to public/sitemap.xml so it's served from our own domain.
// Runs via predev / prebuild hooks in package.json.

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const EDGE_URL =
  "https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-sitemap";
const OUT_PATH = resolve("public/sitemap.xml");

async function main() {
  try {
    const res = await fetch(EDGE_URL);
    if (!res.ok) throw new Error(`Edge function returned ${res.status}`);
    const xml = await res.text();
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, xml);
    console.log(`sitemap.xml written (${xml.length} bytes)`);
  } catch (err) {
    console.warn(`[generate-sitemap] failed: ${(err as Error).message}`);
    console.warn("[generate-sitemap] continuing without regenerating sitemap");
  }
}

main();
