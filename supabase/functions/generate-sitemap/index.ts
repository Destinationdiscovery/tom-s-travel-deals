import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE = "https://www.reviewthengo.com";

// Public static routes derived from src/App.tsx (excludes admin/auth/private/dynamic-only).
const STATIC_URLS: { loc: string; changefreq: string; priority: string }[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/destinations", changefreq: "weekly", priority: "0.9" },
  { loc: "/compass", changefreq: "daily", priority: "0.9" },
  { loc: "/guides", changefreq: "weekly", priority: "0.8" },
  { loc: "/gear", changefreq: "weekly", priority: "0.9" },
  { loc: "/best-time", changefreq: "weekly", priority: "0.9" },
  { loc: "/itinerary", changefreq: "weekly", priority: "0.9" },
  { loc: "/currency", changefreq: "weekly", priority: "0.9" },
  { loc: "/flights", changefreq: "weekly", priority: "0.9" },
  { loc: "/safety", changefreq: "weekly", priority: "0.8" },
  { loc: "/travel-intel", changefreq: "monthly", priority: "0.8" },
  { loc: "/about", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "monthly", priority: "0.5" },
  { loc: "/compare", changefreq: "monthly", priority: "0.5" },
  { loc: "/search", changefreq: "monthly", priority: "0.5" },
  { loc: "/promo", changefreq: "monthly", priority: "0.4" },
  { loc: "/install", changefreq: "yearly", priority: "0.3" },
  { loc: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/affiliate-disclosure", changefreq: "yearly", priority: "0.3" },
];

// File-based content (src/data/destinationHubs.ts, hardcoded compass slugs).
// Append here when new file-based pages are added.
const DESTINATION_HUB_CITIES = [
  "cancun","bali","tokyo","paris","london","new-york","bangkok","rome","punta-cana",
  "miami","las-vegas","barcelona","amsterdam","maldives","santorini","costa-rica",
  "hawaii","lisbon","prague","dubai","jamaica","mexico-city","vancouver","montreal","banff",
];

const STATIC_DESTINATION_REVIEWS = [
  "mexico-barcelo-riviera","cuba-vila-gale","curacao-blue-bay","vegas-bellagio","cruise-experience",
];

const STATIC_GEAR_REVIEWS = [
  "travel-converter-cuba-europe","packing-cubes","airplane-phone-holder-mount",
  "inflatable-water-hammock","thermacell-patio-shield-mosquito-repellent",
  "cruise-cabin-shoe-organizer","liquid-iv-sugar-free-electrolyte",
];

const STATIC_COMPASS_ARTICLES = [
  "2026-travel-trends-whycations-glowcations-microvacations",
  "japan-top-destination-canadians-2026",
  "domestic-canada-boom-banff-lake-louise-2026",
  "travel-insurance-what-you-need",
  "why-canadians-skipping-us-2026",
  "canadian-at-par-deal-las-vegas",
  "group-travel-2026-who-uses-it-why-booming",
  "westjet-seat-squeeze-passengers-said-no",
  "rome-trevi-fountain-fee-genius-or-ripoff",
];

// Sanitization
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function safePathSegment(slug: unknown): string | null {
  if (typeof slug !== "string") return null;
  if (!SAFE_SLUG.test(slug)) return null;
  return xmlEscape(encodeURIComponent(slug));
}

function toIsoDate(value: unknown): string {
  const today = new Date().toISOString().split("T")[0];
  if (!value || typeof value !== "string") return today;
  const d = new Date(value);
  if (isNaN(d.getTime())) return today;
  return d.toISOString().split("T")[0];
}

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

async function fetchAllPaginated<T>(
  fetcher: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>
): Promise<T[]> {
  const PAGE = 1000;
  const all: T[] = [];
  let from = 0;
  for (let i = 0; i < 50; i++) { // hard cap 50k rows safety
    const { data, error } = await fetcher(from, from + PAGE - 1);
    if (error) {
      console.error("Pagination error:", error);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date().toISOString().split("T")[0];
    const seen = new Set<string>();
    const urls: UrlEntry[] = [];

    const push = (entry: UrlEntry) => {
      if (seen.has(entry.loc)) return;
      seen.add(entry.loc);
      urls.push(entry);
    };

    // 1. Static routes
    for (const u of STATIC_URLS) {
      push({ loc: u.loc, lastmod: today, changefreq: u.changefreq, priority: u.priority });
    }

    // 2. File-based content
    for (const city of DESTINATION_HUB_CITIES) {
      const safe = safePathSegment(city);
      if (safe) push({ loc: `/destinations/city/${safe}`, lastmod: today, changefreq: "monthly", priority: "0.8" });
    }
    for (const slug of STATIC_DESTINATION_REVIEWS) {
      const safe = safePathSegment(slug);
      if (safe) push({ loc: `/destinations/${safe}`, lastmod: today, changefreq: "monthly", priority: "0.8" });
    }
    for (const slug of STATIC_GEAR_REVIEWS) {
      const safe = safePathSegment(slug);
      if (safe) push({ loc: `/gear/${safe}`, lastmod: today, changefreq: "monthly", priority: "0.7" });
    }
    for (const slug of STATIC_COMPASS_ARTICLES) {
      const safe = safePathSegment(slug);
      if (safe) push({ loc: `/compass/${safe}`, lastmod: today, changefreq: "monthly", priority: "0.7" });
    }

    // 3. Dynamic content from DB

    // blog_posts -> /compass/{slug}
    const blogPosts = await fetchAllPaginated<{ slug: string; updated_at: string | null; created_at: string | null }>(
      (from, to) =>
        supabase
          .from("blog_posts")
          .select("slug, updated_at, created_at")
          .order("updated_at", { ascending: false })
          .range(from, to) as any
    );
    for (const p of blogPosts) {
      const safe = safePathSegment(p.slug);
      if (!safe) continue;
      push({
        loc: `/compass/${safe}`,
        lastmod: toIsoDate(p.updated_at ?? p.created_at),
        changefreq: "weekly",
        priority: "0.8",
      });
    }

    // cached_reviews -> /review/{slug}
    const cachedReviews = await fetchAllPaginated<{ slug: string; created_at: string | null }>(
      (from, to) =>
        supabase
          .from("cached_reviews")
          .select("slug, created_at")
          .order("created_at", { ascending: false })
          .range(from, to) as any
    );
    for (const r of cachedReviews) {
      const safe = safePathSegment(r.slug);
      if (!safe) continue;
      push({
        loc: `/review/${safe}`,
        lastmod: toIsoDate(r.created_at),
        changefreq: "monthly",
        priority: "0.7",
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${BASE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: any) {
    console.error("Sitemap generation failed:", e);
    return new Response(`Error generating sitemap: ${e?.message || String(e)}`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
