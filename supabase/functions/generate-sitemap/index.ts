import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STATIC_URLS = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/destinations", changefreq: "weekly", priority: "0.9" },
  { loc: "/gear", changefreq: "weekly", priority: "0.9" },
  { loc: "/best-time", changefreq: "weekly", priority: "0.9" },
  { loc: "/itinerary", changefreq: "weekly", priority: "0.9" },
  { loc: "/currency", changefreq: "weekly", priority: "0.9" },
  { loc: "/flights", changefreq: "weekly", priority: "0.9" },
  { loc: "/safety", changefreq: "weekly", priority: "0.8" },
  { loc: "/compass", changefreq: "weekly", priority: "0.9" },
  { loc: "/guides", changefreq: "weekly", priority: "0.8" },
  { loc: "/travel-intel", changefreq: "monthly", priority: "0.8" },
  { loc: "/about", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "monthly", priority: "0.5" },
  { loc: "/compare", changefreq: "monthly", priority: "0.6" },
  { loc: "/search", changefreq: "monthly", priority: "0.6" },
  { loc: "/install", changefreq: "monthly", priority: "0.5" },
  { loc: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/affiliate-disclosure", changefreq: "yearly", priority: "0.3" },
  // Destination reviews
  { loc: "/destinations/mexico-barcelo-riviera", changefreq: "monthly", priority: "0.8" },
  { loc: "/destinations/cuba-vila-gale", changefreq: "monthly", priority: "0.8" },
  { loc: "/destinations/curacao-blue-bay", changefreq: "monthly", priority: "0.8" },
  { loc: "/destinations/vegas-bellagio", changefreq: "monthly", priority: "0.8" },
  { loc: "/destinations/cruise-experience", changefreq: "monthly", priority: "0.8" },
  // Gear reviews
  { loc: "/gear/travel-converter-cuba-europe", changefreq: "monthly", priority: "0.7" },
  { loc: "/gear/packing-cubes", changefreq: "monthly", priority: "0.7" },
  { loc: "/gear/airplane-phone-holder-mount", changefreq: "monthly", priority: "0.7" },
  { loc: "/gear/inflatable-water-hammock", changefreq: "monthly", priority: "0.7" },
  { loc: "/gear/thermacell-patio-shield-mosquito-repellent", changefreq: "monthly", priority: "0.7" },
  { loc: "/gear/cruise-cabin-shoe-organizer", changefreq: "monthly", priority: "0.7" },
  { loc: "/gear/liquid-iv-sugar-free-electrolyte", changefreq: "monthly", priority: "0.7" },
  // Hardcoded blog articles
  { loc: "/compass/2026-travel-trends-whycations-glowcations-microvacations", changefreq: "monthly", priority: "0.7" },
  { loc: "/compass/japan-top-destination-canadians-2026", changefreq: "monthly", priority: "0.7" },
  { loc: "/compass/domestic-canada-boom-banff-lake-louise-2026", changefreq: "monthly", priority: "0.7" },
  { loc: "/compass/travel-insurance-what-you-need", changefreq: "monthly", priority: "0.7" },
  { loc: "/compass/why-canadians-skipping-us-2026", changefreq: "monthly", priority: "0.7" },
  { loc: "/compass/canadian-at-par-deal-las-vegas", changefreq: "monthly", priority: "0.7" },
  { loc: "/compass/group-travel-2026-who-uses-it-why-booming", changefreq: "monthly", priority: "0.7" },
  { loc: "/compass/westjet-seat-squeeze-passengers-said-no", changefreq: "monthly", priority: "0.7" },
  { loc: "/compass/rome-trevi-fountain-fee-genius-or-ripoff", changefreq: "monthly", priority: "0.7" },
];

const BASE = "https://www.reviewthengo.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all blog post slugs from DB
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .order("created_at", { ascending: false });

    // Collect DB slugs (skip any that duplicate static entries)
    const staticSlugs = new Set(STATIC_URLS.map((u) => u.loc));
    const dbEntries = (posts || [])
      .filter((p: any) => !staticSlugs.has(`/compass/${p.slug}`))
      .map((p: any) => ({
        loc: `/compass/${p.slug}`,
        changefreq: "weekly",
        priority: "0.8",
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
      }));

    const allUrls = [...STATIC_URLS, ...dbEntries];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u: any) =>
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
  } catch (e) {
    return new Response(`Error generating sitemap: ${e.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
