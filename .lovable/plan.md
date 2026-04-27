## Goal

Close out Claude's two final asks so AI crawlers (Googlebot, Perplexity, GPTBot) can reliably discover and read full article bodies for every Compass post.

## What's already confirmed working

I just tested the edge function directly for `why-canadians-skipping-us-2026`:

- Returns `200` with full plain HTML
- Includes the complete article body (679 words) inside the JSON-LD `articleBody` field
- Includes the full body again as visible `<p>` and `<h2>` HTML in `<article>`
- Title, description, canonical, OG tags, and `BlogPosting` schema all present

So Claude's first ask ("confirm `?slug=` returns full body text") is already satisfied. No code changes needed for that.

## Change needed: alternate link to the crawler feed

Add a `<link rel="alternate" type="text/html" href="...articles-feed?slug=<slug>">` tag in the `<head>` of every Compass article page. This tells crawlers exactly where the JS-free version lives, so bots that hit `/compass/<slug>` cold can follow the link to the fully-rendered body without needing to discover the edge function on their own.

### Implementation

1. Extend `SEOHead` (`src/components/SEOHead.tsx`) with a new optional prop:
   - `alternateUrls?: { href: string; type?: string; hreflang?: string; rel?: string }[]`
   - Render each as `<link rel={rel || "alternate"} type={type} hreflang={hreflang} href={href} />` inside the existing `<Helmet>`.

2. In `src/pages/CompassArticle.tsx`, where `<SEOHead ... />` is rendered for an article, pass:
   ```ts
   alternateUrls={[{
     href: `https://iomrjljlydboniioohkv.supabase.co/functions/v1/articles-feed?slug=${encodeURIComponent(slug)}`,
     type: "text/html",
   }]}
   ```

3. Mirror the same alternate link inside the JSON-LD `BlogPosting` object that `CompassArticle` already builds, by adding:
   ```ts
   "sameAs": [crawlerUrl]
   ```
   so the crawler URL is also reachable from the structured data.

### Why this is the right shape

- `rel="alternate"` is the standard signal Googlebot, Bingbot, and most AI crawlers honor for "same content, different representation."
- It does not change canonicalization (the `<link rel="canonical">` still points to `https://www.reviewthengo.com/compass/<slug>`), so the SPA URL remains the indexable one in search results.
- It just gives non-JS bots a documented path to the static body.

## Files touched

- `src/components/SEOHead.tsx` — add `alternateUrls` prop + render
- `src/pages/CompassArticle.tsx` — pass the alternate URL for the current slug + add `sameAs` to JSON-LD

## Verification after deploy

1. View source on `https://www.reviewthengo.com/compass/why-canadians-skipping-us-2026` and confirm `<link rel="alternate" type="text/html" href="https://iomrjljlydboniioohkv.supabase.co/functions/v1/articles-feed?slug=why-canadians-skipping-us-2026" />` is present in `<head>`.
2. Confirm the same URL is also present inside the `BlogPosting` JSON-LD `sameAs` array.
3. In Google Search Console URL Inspection → "Test live URL" → "View tested page" → "More info" → "HTTP response", the alternate link should be discoverable.

## What this does not do

This will not force Google to index the article instantly. The "URL is unknown to Google" message in Search Console resolves on Google's own crawl schedule. What this change does is make sure that when a crawler does arrive, it has an explicit, documented path to the full body — which is what was missing.
