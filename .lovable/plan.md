## The honest answer first

**You don't actually need to migrate hosting or run Playwright at build time.** There's a much simpler approach that fixes existing articles AND future ones automatically — with zero ongoing cost and no extra tools.

## The approach: Bot-detecting edge function (SSR-on-demand)

Instead of pre-building HTML for every article (which slows builds and breaks when content changes), we add a single edge function that intercepts requests from AI crawlers and search engines and serves them fully rendered HTML on the fly. Real users still get the fast SPA.

### How it works

```text
User browser     → index.html (SPA)        ← unchanged, fast
GPTBot/Googlebot → ssr-proxy edge function → fully rendered HTML
                       ↓
                   reads blog_posts table directly
                   returns <html> with full article text + meta tags
```

When a bot like GPTBot, ClaudeBot, PerplexityBot, or Googlebot hits `/compass/some-slug`:
1. Lovable's CDN routes the request through a rewrite rule
2. The `ssr-proxy` edge function detects the bot via User-Agent
3. It queries `blog_posts` for that slug, generates a complete HTML page (title, meta tags, JSON-LD, full article body, author, date)
4. Returns it as static HTML

Real users never touch the function — they get the normal SPA.

## Cost breakdown

| Item | Cost |
|---|---|
| Edge function invocations (bot traffic only) | Included in Lovable Cloud free tier (covers ~500K requests/mo) |
| Database reads | Already free, just SELECT queries |
| Hosting changes | None — stays on Lovable |
| Build time | Unchanged (no Playwright, no prerender step) |
| Migration | None |

**Realistic monthly cost: $0** unless your bot traffic exceeds hundreds of thousands of crawls. AI bots crawl maybe 10–100x per article per month — well within free tier.

## What this fixes

**Existing articles:** Fixed immediately the moment the function deploys. No regeneration needed. Every article already in `blog_posts` becomes crawlable instantly.

**Future articles:** Fixed automatically. The function reads from the database in real time, so any new article published through the Content Studio is crawlable the moment it's saved.

**Other dynamic pages (also fixed):**
- `/compass/:slug` — blog articles
- `/destinations/:slug` — destination reviews
- `/review/:slug` — AI reviews (from cached_reviews)
- Static pages (`/`, `/compass`, `/guides`, `/gear`, etc.) — served with proper meta tags

## Technical implementation

### 1. New edge function: `ssr-proxy`
- Detects bots via User-Agent regex (`GPTBot|ClaudeBot|PerplexityBot|Googlebot|bingbot|facebookexternalhit|Twitterbot|LinkedInBot|Bytespider|Applebot`, etc.)
- Routes by path:
  - `/compass/:slug` → query `blog_posts`, render article HTML with `<h1>`, full body, JSON-LD `BlogPosting`, OpenGraph tags, canonical URL
  - `/destinations/:slug` → query `cached_reviews`, render review HTML
  - `/` and other static routes → render with proper title/description meta
- Uses the existing `rich_content` JSONB to flatten article body into clean HTML paragraphs and headings
- Returns `Cache-Control: public, max-age=3600` so the CDN caches per-bot responses

### 2. Routing config: `public/_redirects` (or equivalent)
Add a rule that proxies bot User-Agents to the edge function before the SPA loads. Lovable hosting supports header/UA-based redirects via a redirects file.

### 3. Update `generate-sitemap` edge function
Already exists — verify it pulls all `blog_posts` slugs dynamically and update if not, so AI bots discover new articles.

### 4. Clean up `index.html`
Remove the hardcoded homepage `<noscript>` content that currently leaks into every route's source. Replace with a neutral fallback.

### 5. Verify with curl
After deploy, test:
```bash
curl -A "GPTBot" https://www.reviewthengo.com/compass/some-slug
```
Should return full article HTML, not the SPA shell.

## Why this beats the Playwright approach

| | Playwright prerender | Bot-detecting SSR |
|---|---|---|
| Fixes existing articles | Only after rebuild | Instantly on deploy |
| Fixes new articles | Need rebuild every time | Automatic, real-time |
| Build time impact | +2–10 minutes | Zero |
| Maintenance | Brittle (browser updates, timeouts) | Simple SQL + HTML |
| Cost | Free but slow | Free and fast |
| Hosting changes | None | None |

## What you'd need to approve

Three concrete changes:
1. New edge function `ssr-proxy` (~200 lines)
2. A `public/_redirects` rule for bot User-Agents
3. Minor cleanup of `index.html` `<noscript>` block

After deploy, every article — existing and future — becomes visible to ChatGPT, Perplexity, Claude, Google, and Bing without you doing anything per-article.

**Recommendation:** Approve this plan, skip the Playwright/migration path entirely.