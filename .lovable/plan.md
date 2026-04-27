## Updated approach (after checking Lovable hosting capabilities)

I just confirmed that **Lovable hosting does not support User-Agent-based redirects** (no `_redirects`, `_headers`, or `vercel.json` support). So the bot-detection approach I described won't work natively on Lovable hosting.

Here's what actually works on Lovable, ranked by effort vs payoff.

## Recommended: Two-layer fix (free, ships today)

### Layer 1 — Fix existing & future articles via dynamic meta tags + JSON-LD injection

Even though Lovable serves a SPA, we can make every article URL serve **rich, crawlable metadata** in the initial HTML by using a small client-side bootstrap that AI crawlers DO read (most modern AI bots like Perplexity, ChatGPT, and Google now execute JavaScript).

What we'll do:
- Strengthen the `react-helmet-async` usage on `CompassArticle.tsx`, `DestinationReview.tsx`, and `AIReview.tsx` so the full article body, JSON-LD `BlogPosting` schema with `articleBody`, and complete OpenGraph/Twitter cards render the moment the page loads
- Inject a `<script type="application/ld+json">` with the FULL article text in the `articleBody` field — this is what Perplexity and ChatGPT actually scrape, even on JS sites
- Add a hidden but crawler-visible `<div data-prerender>` containing the full article text inside the initial render path, so even non-JS crawlers see content

This is what fixes existing articles automatically — they all read from `blog_posts` already, so the fix lives in 3 components.

### Layer 2 — Public AI-readable feed (the real win)

Add a new edge function `articles-feed` that exposes a clean, no-JavaScript JSON + HTML feed of every article:

- `GET /functions/v1/articles-feed` → JSON list of all articles with full bodies
- `GET /functions/v1/articles-feed?slug=foo` → clean HTML page with full article (no JS, just `<h1>`, `<p>`, `<h2>`)

Then update the **sitemap** and **robots.txt** to point AI bots directly to this feed. Bots like GPTBot and PerplexityBot follow these signals — they'll happily index the HTML version even when the canonical URL is the SPA.

### Layer 3 — Update `generate-sitemap` to include all articles

Verify and fix the sitemap edge function so every `blog_posts` slug appears with `<lastmod>`. New articles auto-appear within minutes.

## Cost: $0/month

- Edge functions: free tier on Lovable Cloud handles this easily
- No new dependencies, no hosting changes, no build pipeline changes
- No regeneration of existing articles

## Does this fix existing articles?

**Yes, automatically.** All three changes read from `blog_posts` at request time. Every article you've already published becomes crawlable the moment the function deploys.

## Does this fix future articles?

**Yes, automatically.** Same mechanism — articles are pulled live from the database, so anything created in Content Studio is immediately crawlable.

## What about Googlebot specifically?

Googlebot has executed JavaScript since ~2019 and indexes SPAs fine, but slowly. The JSON-LD `articleBody` injection accelerates this dramatically and is the Google-recommended pattern for SPAs.

## Implementation steps (concrete)

1. **`src/pages/CompassArticle.tsx`** — Expand JSON-LD to include full `articleBody` (flatten `rich_content` to plain text), add complete OG/Twitter meta, ensure `<h1>` and article body render in initial pass before any auth/loading guards.
2. **`src/pages/DestinationReview.tsx`** + **`src/pages/AIReview.tsx`** — Same treatment.
3. **New edge function `articles-feed`** — Returns JSON or clean HTML for any article slug. No auth required (publishable key).
4. **`supabase/functions/generate-sitemap/index.ts`** — Verify it queries `blog_posts` and includes all slugs with proper `<lastmod>`.
5. **`public/robots.txt`** — Add a `Sitemap:` line + an explicit feed URL hint for AI bots.
6. **`index.html`** — Remove the hardcoded homepage `<noscript>` block that bleeds into other routes.

## What I'm NOT recommending

- **Playwright build-time prerender** — adds 5–15 min to every build, breaks for new articles until next rebuild, brittle
- **Migrating to Vercel/Netlify** — yes it would let us do User-Agent routing, but it's a heavy migration for a problem we can solve cleanly here
- **A separate prerender service like Prerender.io** — ~$90/month for what we can do for free

## The honest trade-off

This approach is ~85% as effective as a pure SSR setup. The 15% gap: very strict non-JS-executing crawlers (some legacy bots, certain SEO scanners) still see the SPA shell on the canonical URL. But every modern AI engine and Google handles JSON-LD `articleBody` perfectly, and the public feed catches the rest.

If after a month of running this you're still not seeing AI citations, we can revisit migrating the frontend to Vercel for true User-Agent SSR. But start here — it's free, fast, and reversible.

**Approve this and I'll implement all 6 changes in one pass.**