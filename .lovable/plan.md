

# Plan: Fix the 40 unindexed pages flagged by Google Search Console

## What Google is actually telling us

| GSC reason | Count | Real cause on your site |
|---|---|---|
| Discovered – currently not indexed | 34 | Google found dynamic, low-content URLs (`/reviews/:query`, `/review/:slug`, `/top/:location`) that look thin/duplicative. It is choosing not to spend crawl budget on them. |
| Duplicate without user-selected canonical | 3 | A few pages don't emit an explicit `<link rel="canonical">`, so Google sees `www` vs non-www, trailing-slash and query variants and can't pick a winner. |
| Page with redirect | 2 | `reviewthengo.com` → `www.reviewthengo.com` (this is correct and expected) and `/destinations` (route was deleted but is still in the sitemap and linked from the 404 page, so it now returns the SPA shell that effectively renders 404). |
| Crawled – currently not indexed | 1 | One URL was crawled and judged low-quality. Same root cause as the bucket of 34. |

So the fix is three buckets of work:
1. Stop publishing URLs Google should not be indexing.
2. Make every real page emit a clean canonical so duplicates collapse.
3. Clean up the dead `/destinations` route everywhere.

## Files to change

### A. Sitemap hygiene (stop advertising dead/thin URLs)

| File | Change |
|---|---|
| `public/sitemap.xml` | Remove `/destinations` (route no longer exists). Remove `/search`, `/install`, `/compare`, `/travel-intel` if you don't want them ranked separately, OR keep but verify each renders content. Replace this static file outright by fetching the dynamic version once and committing the result, so the file matches what `generate-sitemap` would produce. |
| `supabase/functions/generate-sitemap/index.ts` | Remove `/destinations` from `STATIC_URLS`. Add `/my-saves` only if we want it ranked (it's user-specific, so leave out). Keep dynamic blog post slugs. |

### B. Mark thin / dynamic / private pages `noindex`

These pages are crawlable today but should never compete in Google's index:

| Route | Why noindex | How |
|---|---|---|
| `/reviews/:query` (`Reviews.tsx`) | Auto-runs `travel-search` for any slug — infinite low-content URL space, exactly what Google calls "Discovered, not indexed". | Add `noindex` via `SEOHead` until we whitelist a curated set. |
| `/review/:slug` (`AIReview.tsx`) | Auto-generates a review for ANY slug on first hit — same infinite URL space problem. Cache hits are fine but uncached ones are spam-shaped from Google's POV. | Add `noindex` ONLY when the review came from a fresh AI generation (or when cache miss). For cached, manually-shared URLs that already exist in `cached_reviews`, leave indexable. Simpler: noindex everything under `/review/:slug` and rely on `/destinations/:slug` (the curated set) for SEO. |
| `/top/:location` (`TopDestinations.tsx`) | Same dynamic AI page. | `noindex`. |
| `/properties/:city/:name` (`PropertyRedirect.tsx`) | Pure redirect page. | `noindex` (already a redirect, but add for safety). |
| `/my-reviews`, `/my-trips`, `/my-saves`, `/compare`, `/search`, `/promo`, `/install`, `/booking/:n`, `/client/:slug`, `/quote/:token`, `/gear-admin` | Private / utility / personal pages. | Add `SEOHead noindex` to each. |

### C. Add explicit canonicals on every real public page

`SEOHead` already emits `<link rel="canonical">` when a `url` prop is passed. Audit and pass `url` on every public page that currently omits it (Index, Compass, Compass article, Gear, Best Time, Itinerary, Currency, Flights, Safety, Guides, About, Contact, Travel Intel, Privacy, Affiliate Disclosure, Destination review). This collapses the "Duplicate without user-selected canonical" bucket.

### D. Kill remaining `/destinations` references

| File | Change |
|---|---|
| `src/pages/NotFound.tsx` | Replace `/destinations` link with `/` or `/compass`. |
| Any footer / nav / 404 popular-links / sitemap files | Search and remove. |

### E. Add a 410 / clean fallback for `/destinations`

Since the route is deleted, hits currently render the SPA which client-side routes to NotFound. That's fine for SEO once the link is removed from the sitemap and NotFound, because Google will eventually drop it from its index. No server-side redirect needed.

## Result

- **Sitemap shrinks from 41 to ~32 real, high-value URLs**, all of which return 200 and have unique content.
- **34 "Discovered, not indexed" URLs become explicit `noindex`**, so Google stops counting them as failures and reallocates crawl budget to your real pages (blog, gear reviews, destination reviews).
- **3 duplicate-canonical issues resolve** because every public page now declares its own canonical.
- **2 redirect issues** — one (`reviewthengo.com` → `www`) is the correct, expected redirect; the other (`/destinations`) disappears once we remove the sitemap entry and internal link.
- Net effect over the next 2–4 weekly crawls: indexed count climbs from 6 toward ~30, "not indexed" drops from 40 toward single digits.

## Out of scope

- Building a real `/destinations` index page (separate decision).
- Writing more content to make `/reviews/:query` worth indexing (separate decision — for now we hide it).
- Submitting an updated sitemap in GSC (you'll do that manually after deploy).

