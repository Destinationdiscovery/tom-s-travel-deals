## Goal

Make every Compass article and destination review body visible to AI crawlers on a **single fetch**, not just after following individual links. Current state: each article body is already rendered by `articles-feed?slug=...`, but the index only shows titles + excerpts.

## Changes

### 1. `supabase/functions/articles-feed/index.ts`

Add an `?expand=1` mode (works for both `compass` and `type=destinations`):

- **Compass expanded view**: fetches every blog_post + every static article and renders each one's full body (heading, text, image, FAQ blocks) sequentially in a single HTML document, with `<article id="slug-...">` anchors and a table of contents at the top.
- **Destinations expanded view**: same, but pulls `cached_reviews.full_review`, tips, ratings for every row and inlines them.
- Caps response at ~500 articles (already the query limit). Adds `Cache-Control: public, max-age=1800`.
- Keeps existing per-slug routes unchanged.

### 2. `index.html` static fallback

Replace the two existing feed links with three each so non-JS bots see the expanded body URL directly:

- "All Compass articles (full text)" -> `articles-feed?expand=1`
- "All Compass articles (index)" -> `articles-feed`
- "All destination reviews (full text)" -> `articles-feed?type=destinations&expand=1`
- "All destination reviews (index)" -> `articles-feed?type=destinations`

### 3. `public/robots.txt`

Add two `Sitemap:` style hint comments pointing at the expanded feeds so crawlers that read robots discover them. Plain comments only (no spec change).

### 4. `supabase/functions/generate-sitemap/index.ts` (verify only)

Confirm the sitemap already lists every individual `/compass/:slug` and `/destinations/:slug` so Googlebot still gets canonical URLs. No code change unless it's missing entries; will report back after reading.

## Out of scope

- No Cloudflare prerender / Firecrawl. Static expanded HTML covers the same crawler need.
- No changes to React routes or SEOHead.
- No design changes (the expanded view is intentionally plain HTML for bots).

## Test plan

1. Deploy edge function.
2. `curl` `articles-feed?expand=1` and confirm every article slug appears with full body text.
3. `curl` `articles-feed?type=destinations&expand=1` and confirm every cached review appears.
4. View-source on `index.html` and confirm the new links resolve.
