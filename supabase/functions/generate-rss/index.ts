// RSS 2.0 feed for The Compass blog. Combines DB-backed blog_posts and the
// hardcoded static articles served by articles-feed, sorted newest first,
// capped at 50 items, returned with a 1-hour cache.
//
// Live at: /functions/v1/generate-rss
// Aliased on the canonical domain at: /rss.xml (static snapshot in public/)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import staticArticlesData from "../articles-feed/static-articles.json" with { type: "json" };

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
