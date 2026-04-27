## The Problem

Google Search Console is reading `https://www.reviewthengo.com/sitemap.xml` successfully, but that file is the **stale static version** in `/public` — it only contains 61 URLs (mostly hardcoded base routes + a handful of old article slugs).

Meanwhile, your `generate-sitemap` edge function dynamically pulls from the database and returns **110 URLs**, including all 49 blog posts and current destination/gear/AI reviews.

GSC won't accept the edge function URL directly because it lives on `supabase.co` (cross-domain sitemaps are rejected unless added via robots.txt + cross-submit verification — fragile).

So Google currently has no idea ~49 of your articles/reviews exist.

## The Fix

Make `https://www.reviewthengo.com/sitemap.xml` always return the live, dynamic, complete list — without you having to do anything when new content is published.

### Approach: Auto-regenerating static sitemap

Lovable hosts a static SPA, so we can't proxy server-side at the `/sitemap.xml` path. Instead, we'll regenerate the static file from the database on a schedule.

**Steps:**

1. **Create a new edge function `sync-sitemap`** that:
   - Runs the same query logic as `generate-sitemap` (blog_posts, cached_reviews, hardcoded routes)
   - Writes the resulting XML to a public storage bucket OR returns it for the cron job to handle
   - Better approach: have it call the Lovable Cloud Storage API to overwrite a file

2. **Simpler, more reliable alternative — Sitemap Index pattern:**
   - Keep `/public/sitemap.xml` as a **sitemap index** that points to two child sitemaps
   - One child = static base routes (already on your domain)
   - Second child = `https://www.reviewthengo.com/sitemap-articles.xml` which is **also a static file**, regenerated automatically
   
   The catch: regenerating still needs a build step.

3. **Best approach for Lovable hosting — just rebuild the static file when content changes:**
   - Update the existing blog post creation flow (the `generate-blog-post` edge function and the admin UI) to call a regenerate-sitemap helper after each new post is created
   - That helper writes the freshly built XML to `/public/sitemap.xml` via a commit-triggering mechanism — but this requires a code change deploy, which isn't automatic on Lovable

### Recommended path (pragmatic):

**Manual one-time refresh + automation hook**

- **Step A (immediate):** I'll regenerate `/public/sitemap.xml` right now with the full 110 URLs from the DB. You publish, resubmit in GSC → all articles get discovered within days.
- **Step B (automation):** Add a button in your admin Content Studio called **"Refresh Sitemap"** that calls a new edge function which writes the updated XML directly to a public storage bucket at `https://...supabase.co/storage/v1/object/public/sitemaps/sitemap.xml`. You then update `public/sitemap.xml` once to be a redirect/reference, OR I keep it simple: every time you publish a new article, you click "Refresh Sitemap" and I'll show you when to republish the project.

Honestly though, **Step A alone** solves 95% of this for the next 6 months. You don't publish so often that staleness is a daily problem. New articles get crawled via your `articles-feed` and via internal links from `/compass` anyway.

### What I'll do now:

1. Query the DB for every blog post slug, destination review slug, AI review slug, gear slug
2. Rewrite `/public/sitemap.xml` with all 110 URLs (with proper `lastmod` dates from the DB)
3. You publish the project → GSC re-reads it → discovers all missing articles
4. Optionally: I add an admin "Refresh Sitemap" button that re-queries the DB and regenerates the file (still requires a publish to take effect on the live domain)

## Result

- GSC sees all 49 blog posts + all reviews → indexed within days
- Going forward, run "Refresh Sitemap" + Publish whenever you publish a batch of new articles
- Cost: $0
