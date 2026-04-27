// Public, crawler-friendly feed of all blog articles + destination reviews.
// Returns clean static HTML (no JavaScript) so AI bots that don't execute JS
// (and non-JS crawlers in general) can index full article bodies.
//
// Routes:
//   GET /articles-feed                       -> HTML index of all articles
//   GET /articles-feed?slug=<slug>           -> HTML page for one article
//   GET /articles-feed?format=json           -> JSON list of all articles
//   GET /articles-feed?slug=<slug>&format=json -> JSON for one article
//   GET /articles-feed?type=destinations     -> HTML index of destination reviews
//   GET /articles-feed?type=destinations&slug=<slug> -> HTML for one destination

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import staticArticlesData from "./static-articles.json" with { type: "json" };

// Hardcoded blog articles that live in src/data/compassArticles.ts (not in the DB).
// They get the same plain-HTML treatment as DB-backed articles so AI crawlers
// can index every published Compass post.
type StaticArticle = {
  slug: string;
  title: string;
  excerpt?: string;
  author?: string;
  datePublished?: string;
  readTime?: string;
  category?: string;
  richContent?: any[];
  content?: string[];
};
const STATIC_ARTICLES: StaticArticle[] = staticArticlesData as StaticArticle[];
const STATIC_BY_SLUG = new Map(STATIC_ARTICLES.map((a) => [a.slug, a]));

// Convert a hardcoded article into the same shape used for DB blog_posts so
// renderArticleHtml(...) can format it without changes.
const staticToPost = (a: StaticArticle) => {
  // Strip "__IMG__xxxImg" placeholders left over from the build extraction
  // so the crawler HTML doesn't show broken image src values.
  const blocks = (a.richContent || []).filter((b: any) => {
    if (b?.type === "image") {
      const v = String(b.value ?? b.content ?? "");
      return v && !v.startsWith("__IMG__");
    }
    return true;
  });
  // If richContent is empty but content[] exists (older articles), turn each
  // string into a text block.
  const enrichedBlocks = blocks.length
    ? blocks
    : (a.content || []).map((t) => ({ type: "text", value: t }));
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || "",
    author: a.author || "Tom",
    date_published: a.datePublished || "",
    updated_at: a.datePublished || "",
    hero_image_url: "",
    rich_content: enrichedBlocks,
    faq_items: [],
    tags: a.category ? [a.category] : [],
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE = "https://www.reviewthengo.com";

const escapeHtml = (s: string): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripMarkdown = (s: string): string =>
  String(s ?? "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/[#>`_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Render a single rich_content block as static HTML
const renderBlock = (block: any): string => {
  if (!block) return "";
  const text = block.value ?? block.content ?? "";
  switch (block.type) {
    case "heading":
      return `<h2>${escapeHtml(stripMarkdown(text))}</h2>`;
    case "image":
      return text
        ? `<figure><img src="${escapeHtml(text)}" alt="${escapeHtml(block.caption || "")}" />${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ""}</figure>`
        : "";
    case "text":
    default:
      return `<p>${escapeHtml(stripMarkdown(text))}</p>`;
  }
};

const renderArticleHtml = (post: any): string => {
  const title = escapeHtml(post.title || "Untitled");
  const author = escapeHtml(post.author || "ReviewThenGo");
  const date = escapeHtml(post.date_published || "");
  const excerpt = escapeHtml(post.excerpt || "");
  const heroImg = post.hero_image_url
    ? `<figure><img src="${escapeHtml(post.hero_image_url)}" alt="${title}" /></figure>`
    : "";
  const blocks: any[] = Array.isArray(post.rich_content) ? post.rich_content : [];
  const body = blocks.map(renderBlock).join("\n");
  const faqHtml = Array.isArray(post.faq_items) && post.faq_items.length > 0
    ? `<section><h2>Frequently Asked Questions</h2>${post.faq_items
        .map((f: any) => `<h3>${escapeHtml(f.question || "")}</h3><p>${escapeHtml(f.answer || "")}</p>`)
        .join("")}</section>`
    : "";
  const canonical = `${BASE}/compass/${encodeURIComponent(post.slug)}`;
  const articleBodyText = blocks
    .filter((b) => b.type !== "image")
    .map((b) => stripMarkdown(b.value ?? b.content ?? ""))
    .filter(Boolean)
    .join("\n\n");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    image: post.hero_image_url || undefined,
    datePublished: post.date_published,
    dateModified: post.updated_at || post.date_published,
    author: { "@type": "Person", name: post.author || "ReviewThenGo" },
    publisher: {
      "@type": "Organization",
      name: "ReviewThenGo",
      logo: { "@type": "ImageObject", url: `${BASE}/favicon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    inLanguage: "en-US",
    articleBody: articleBodyText,
    wordCount: articleBodyText.split(/\s+/).filter(Boolean).length,
    keywords: Array.isArray(post.tags) ? post.tags.join(", ") : undefined,
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} | ReviewThenGo</title>
<meta name="description" content="${excerpt}" />
<link rel="canonical" href="${canonical}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${excerpt}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonical}" />
${post.hero_image_url ? `<meta property="og:image" content="${escapeHtml(post.hero_image_url)}" />` : ""}
<meta name="twitter:card" content="summary_large_image" />
<meta name="robots" content="index, follow" />
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<nav><a href="${BASE}/">ReviewThenGo Home</a> &gt; <a href="${BASE}/compass">Blog</a> &gt; <a href="${canonical}">${title}</a></nav>
<article>
<header>
<h1>${title}</h1>
<p>By <span>${author}</span> &middot; <time>${date}</time></p>
${excerpt ? `<p><em>${excerpt}</em></p>` : ""}
</header>
${heroImg}
<section>
${body}
</section>
${faqHtml}
<footer>
<p>Read this article with the full interactive experience at <a href="${canonical}">${canonical}</a>.</p>
<p><a href="${BASE}/compass">Back to all articles</a></p>
</footer>
</article>
</body>
</html>`;
};

const renderDestinationHtml = (rev: any): string => {
  const title = escapeHtml(rev.property_name || "Review");
  const location = escapeHtml(rev.location || "");
  const slug = encodeURIComponent(rev.slug);
  const canonical = `${BASE}/destinations/${slug}`;
  const review = Array.isArray(rev.full_review) ? rev.full_review : [];
  const tips = Array.isArray(rev.tips) ? rev.tips : [];
  const ratings = rev.ratings && typeof rev.ratings === "object" ? rev.ratings : {};
  const ratingHtml = Object.keys(ratings).length
    ? `<section><h2>Ratings</h2><ul>${Object.entries(ratings)
        .map(([k, v]) => `<li>${escapeHtml(k)}: ${escapeHtml(String(v))}/5</li>`)
        .join("")}</ul></section>`
    : "";
  const body = review.map((p: string) => `<p>${escapeHtml(stripMarkdown(p))}</p>`).join("\n");
  const tipsHtml = tips.length
    ? `<section><h2>Tips</h2><ul>${tips.map((t: string) => `<li>${escapeHtml(stripMarkdown(t))}</li>`).join("")}</ul></section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title} Review${location ? ` - ${location}` : ""} | ReviewThenGo</title>
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index, follow" />
</head>
<body>
<nav><a href="${BASE}/">Home</a> &gt; <a href="${BASE}/destinations">Destinations</a> &gt; <a href="${canonical}">${title}</a></nav>
<article>
<h1>${title}${location ? ` - ${location}` : ""}</h1>
${ratingHtml}
<section><h2>Review</h2>${body}</section>
${tipsHtml}
<footer><p>Full interactive review at <a href="${canonical}">${canonical}</a></p></footer>
</article>
</body>
</html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const format = url.searchParams.get("format") || "html";
    const type = url.searchParams.get("type") || "compass";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ---- Destination reviews branch ----
    if (type === "destinations") {
      if (slug) {
        const { data, error } = await supabase
          .from("cached_reviews")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          return new Response("Not found", { status: 404, headers: corsHeaders });
        }
        if (format === "json") {
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
          });
        }
        return new Response(renderDestinationHtml(data), {
          headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      }

      const { data: list } = await supabase
        .from("cached_reviews")
        .select("slug, property_name, location")
        .order("created_at", { ascending: false })
        .limit(500);
      const items = list || [];
      if (format === "json") {
        return new Response(JSON.stringify({ count: items.length, items }), {
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
        });
      }
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>All Destination Reviews | ReviewThenGo</title></head><body><h1>All Destination Reviews</h1><ul>${items
        .map(
          (p: any) =>
            `<li><a href="${BASE}/destinations/${encodeURIComponent(p.slug)}">${escapeHtml(p.property_name)}${p.location ? ` - ${escapeHtml(p.location)}` : ""}</a> &middot; <a href="?type=destinations&slug=${encodeURIComponent(p.slug)}">crawler view</a></li>`
        )
        .join("\n")}</ul></body></html>`;
      return new Response(html, {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    // ---- Compass blog branch (default) ----
    if (slug) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return new Response("Not found", { status: 404, headers: corsHeaders });
      }
      if (format === "json") {
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
        });
      }
      return new Response(renderArticleHtml(data), {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    // List all posts
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, date_published, hero_image_url, author, updated_at")
      .order("date_published", { ascending: false })
      .limit(500);
    const list = posts || [];

    if (format === "json") {
      return new Response(JSON.stringify({ count: list.length, items: list }), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=1800" },
      });
    }

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>All ReviewThenGo Articles | Crawler Feed</title>
<meta name="description" content="Plain-text feed of every article on ReviewThenGo, optimized for AI crawlers and search engine indexing." />
<link rel="canonical" href="${BASE}/compass" />
<meta name="robots" content="index, follow" />
</head>
<body>
<h1>All ReviewThenGo Articles</h1>
<p>This is a static, JavaScript-free feed of every article on ReviewThenGo. Each link below leads to the full article rendered as plain HTML for crawlers. Real users should visit the canonical pages on <a href="${BASE}/compass">${BASE}/compass</a>.</p>
<ul>
${list
  .map(
    (p: any) =>
      `<li><a href="${BASE}/compass/${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a> <small>(${escapeHtml(p.date_published || "")})</small> &middot; <a href="?slug=${encodeURIComponent(p.slug)}">crawler view</a><br/><span>${escapeHtml(p.excerpt || "")}</span></li>`
  )
  .join("\n")}
</ul>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=1800" },
    });
  } catch (e: any) {
    return new Response(`Error: ${e?.message || String(e)}`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
