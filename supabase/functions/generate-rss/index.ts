// RSS 2.0 feed for The Compass blog. Combines DB-backed blog_posts and the
// hardcoded static articles served by articles-feed, sorted newest first,
// capped at 50 items, returned with a 1-hour cache.
//
// Live at: /functions/v1/generate-rss
// Aliased on the canonical domain at: /rss.xml (static snapshot in public/)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Inlined snapshot of supabase/functions/articles-feed/static-articles.json
// (cross-function imports aren't supported by the edge bundler).
const staticArticlesData = [
  { slug: "2026-travel-trends-whycations-glowcations-microvacations", title: "2026 Travel Trends: Purpose-Driven Whycations, Glowcations & Microvacations - How Canadians Can Jump In", excerpt: "Hilton, Conde Nast, and Expedia highlight the rise of intentional travel. Here's what Whycations, Glowcations, and Microvacations mean for Canadian travelers.", author: "Tom", datePublished: "January 27, 2026", category: "Guides" },
  { slug: "japan-top-destination-canadians-2026", title: "Why Japan Is the #1 Destination Canadians Are Booking for 2026 (And How to Go on a Budget)", excerpt: "Japan is exploding as the number one trending international destination for Canadians heading into 2026. Here's why and how to make it affordable.", author: "Tom", datePublished: "January 26, 2026", category: "Destinations" },
  { slug: "domestic-canada-boom-banff-lake-louise-2026", title: "Domestic Canada Boom: Banff, Lake Louise, and Why More Canadians Are Staying Home in 2026", excerpt: "With shifting attitudes toward U.S. travel and a desire for meaningful escapes, destinations like Banff and Lake Louise are seeing renewed interest across all seasons.", author: "Tom", datePublished: "January 27, 2026", category: "Guides" },
  { slug: "travel-insurance-what-you-need", title: "Travel Insurance: What You Really Need", excerpt: "Understanding coverage options and why the right policy can save your trip.", author: "Tom", datePublished: "November 15, 2024", category: "Insurance" },
  { slug: "why-canadians-skipping-us-2026", title: "Why Snowbirds and Canadians Are Skipping the US More in 2026 (And Where They're Going Instead)", excerpt: "Data shows Canadian travel to the US is down sharply. Here's why snowbirds are rethinking their winter escapes and the destinations offering better value.", author: "Tom", datePublished: "January 27, 2026", category: "Guides" },
  { slug: "canadian-at-par-deal-las-vegas", title: "The Canadian At-Par Deal in Las Vegas: What It Is, Who It's For, and Why I'm Not Sure It Changes Much", excerpt: "A few downtown Las Vegas casinos are accepting Canadian dollars at par, but is it really worth changing your travel plans for?", author: "Tom", datePublished: "January 26, 2026", category: "Deals" },
  { slug: "group-travel-2026-who-uses-it-why-booming", title: "Group Travel in 2026: Who Uses It, Why It's Booming, and How It Fits Canadian Travelers", excerpt: "Group travel is making a strong comeback in 2026. From friends reunions to destination weddings, here's who's booking and why it works for Ontario travelers.", author: "Tom", datePublished: "January 28, 2026", category: "Guides" },
  { slug: "westjet-seat-squeeze-passengers-said-no", title: "WestJet Tried to Squeeze in More Seats for Cheaper Fares... But Passengers Said No Way!", excerpt: "WestJet's experiment with tighter seats grabbed headlines in early 2026. Here's what happened, why passengers pushed back, and tips for your next booking.", author: "Tom", datePublished: "January 29, 2026", category: "News" },
  { slug: "rome-trevi-fountain-fee-genius-or-ripoff", title: "Rome Just Charged 2 Euros to See the Trevi Fountain: Is This Genius or a Total Rip-Off?", excerpt: "Rome rolled out a 2-euro fee for close-up Trevi Fountain access. Here's how it works, why they did it, and tips for your Italy trip from Ontario.", author: "Tom", datePublished: "February 2, 2026", category: "News" },
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE = "https://www.reviewthengo.com";
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type StaticArticle = {
  slug: string;
  title: string;
  excerpt?: string;
  author?: string;
  datePublished?: string;
  category?: string;
};

const STATIC_ARTICLES: StaticArticle[] = staticArticlesData as StaticArticle[];

const escapeXml = (s: string): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Best-effort RFC-822 conversion. Accepts ISO timestamps, "YYYY-MM-DD", or
// "Month D, YYYY" strings. Falls back to "now" if parsing fails so the feed
// always validates.
const toRfc822 = (input?: string): string => {
  if (!input) return new Date().toUTCString();
  const d = new Date(input);
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
};

type FeedItem = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  pubDate: string; // raw, parsed in toRfc822
  category: string;
  sortDate: number; // for ordering
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, author, date_published, updated_at, category, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    const dbItems: FeedItem[] = (posts || [])
      .filter((p: any) => typeof p.slug === "string" && SAFE_SLUG.test(p.slug))
      .map((p: any) => {
        const raw = p.date_published || p.updated_at || p.created_at || "";
        const parsed = new Date(raw);
        return {
          slug: p.slug,
          title: p.title || "Untitled",
          excerpt: p.excerpt || "",
          author: p.author || "Tom",
          pubDate: raw,
          category: p.category || "Travel",
          sortDate: isNaN(parsed.getTime()) ? 0 : parsed.getTime(),
        };
      });

    const dbSlugs = new Set(dbItems.map((i) => i.slug));
    const staticItems: FeedItem[] = STATIC_ARTICLES
      .filter((a) => SAFE_SLUG.test(a.slug) && !dbSlugs.has(a.slug))
      .map((a) => {
        const raw = a.datePublished || "";
        const parsed = new Date(raw);
        return {
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt || "",
          author: a.author || "Tom",
          pubDate: raw,
          category: a.category || "Travel",
          sortDate: isNaN(parsed.getTime()) ? 0 : parsed.getTime(),
        };
      });

    const all = [...dbItems, ...staticItems]
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 50);

    const lastBuild = new Date().toUTCString();

    const itemsXml = all
      .map((item) => {
        const url = `${BASE}/compass/${item.slug}`;
        return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(item.excerpt)}</description>
      <pubDate>${toRfc822(item.pubDate)}</pubDate>
      <author>noreply@reviewthengo.com (${escapeXml(item.author)})</author>
      <category>${escapeXml(item.category)}</category>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>The Compass by ReviewThenGo</title>
    <link>${BASE}/compass</link>
    <description>Travel guides, destination journalism, and Canadian travel news.</description>
    <language>en-us</language>
    <copyright>Copyright ${new Date().getFullYear()} ReviewThenGo</copyright>
    <managingEditor>noreply@reviewthengo.com (Tom)</managingEditor>
    <webMaster>noreply@reviewthengo.com (Tom)</webMaster>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>ReviewThenGo Compass RSS Generator</generator>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE}/favicon.png</url>
      <title>The Compass by ReviewThenGo</title>
      <link>${BASE}/compass</link>
    </image>
${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: any) {
    return new Response(`Error generating RSS: ${e?.message || String(e)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
