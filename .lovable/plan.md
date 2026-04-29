# Fully Dynamic SEO Sitemap

Goal: Submit `https://www.reviewthengo.com/sitemap.xml` once in Google Search Console. Google auto-discovers new database content forever via the dynamic sitemap declared in `robots.txt`, with zero manual maintenance.

## Architecture

```text
GSC submission         ──►  https://www.reviewthengo.com/sitemap.xml   (static fallback, core pages)
robots.txt declares    ──►  https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-sitemap  (dynamic, all DB content)
Googlebot reads robots.txt and crawls BOTH sitemaps automatically.
```

## 1. Rewrite `supabase/functions/generate-sitemap/index.ts`

Replace the existing hand-curated `STATIC_URLS` list with a generated sitemap that pulls all public-facing content from the database every request.

**Static routes** (derived from `src/App.tsx`, excluding admin/auth/private routes):
- `/`, `/destinations`, `/compass`, `/guides`, `/gear`, `/best-time`, `/itinerary`, `/currency`, `/flights`, `/safety`, `/travel-intel`, `/about`, `/contact`, `/compare`, `/search`, `/promo`, `/install`, `/privacy-policy`, `/affiliate-disclosure`
- Excluded (private/admin/auth-gated/dynamic-only): `/gear-admin`, `/my-reviews`, `/my-trips`, `/my-saves`, `/booking/:bookingNumber`, `/client/:clientSlug`, `/quote/:token`, `/properties/:city/:name`, `/top/:location`, `/reviews/:query`

**Dynamic content** (publicly readable per RLS):
- `cached_reviews` → `/review/{slug}` — public SELECT policy. Use `created_at` as `lastmod` (no `updated_at` column).
- `blog_posts` → `/compass/{slug}` — public SELECT policy. Use `updated_at` as `lastmod`.
- Hardcoded compass slugs from `src/data/compassArticles.ts` and destination hubs from `src/data/destinationHubs.ts` will be merged in (these are file-based, not DB) so they stay covered as the lists evolve. The function reads them via a small static import list maintained in the function file (one-time copy of current slugs, plus a comment telling future-me to append new ones — or alternatively we could store these in DB later).

Excluded by RLS / privacy:
- `client_quotes` (token-gated, `noindex` style — skip)
- `bookings`, `booking_details`, `email_log`, `profiles`, `user_*` (private)
- `featured_*`, `banner_deals`, `agent_*` (admin content, not standalone pages)

**Sanitization** (applied to every dynamic value before XML injection):
```ts
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_ID   = /^[A-Za-z0-9_-]+$/;
function safeLoc(path: string) {
  // XML-escape & + < > " '
  return path.replace(/&/g, "&amp;").replace(/</g, "&lt;")
             .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
// Slugs validated against SAFE_SLUG, then encodeURIComponent, then safeLoc.
// Records that fail validation are silently skipped.
```

**Lastmod**: `record.updated_at ?? record.created_at ?? today` formatted as `YYYY-MM-DD`.

**Response headers**:
```
Content-Type: application/xml; charset=utf-8
Cache-Control: public, max-age=3600
Access-Control-Allow-Origin: *
```

**Pagination**: Supabase caps queries at 1000 rows. The function will page through `cached_reviews` and `blog_posts` in 1000-row batches until exhausted, so it scales past 1000 records.

**Base URL**: `https://www.reviewthengo.com` (hardcoded constant).

## 2. `supabase/config.toml`

Already has `[functions.generate-sitemap] verify_jwt = false` (twice — will dedupe to one block). No changes needed beyond cleanup.

## 3. Slim `public/sitemap.xml` to a static fallback

Reduce to ~20 core static pages only (the route list above). This is the URL submitted to GSC. It satisfies GSC's same-domain requirement and serves as a safety net if the edge function ever fails.

## 4. Update `public/robots.txt`

Replace the current `Sitemap:` lines with:
```
Sitemap: https://www.reviewthengo.com/sitemap.xml
Sitemap: https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-sitemap
```
(Removes the stale `article-urls.txt` reference.)

## Files Changed

- `supabase/functions/generate-sitemap/index.ts` — full rewrite, dynamic + paginated + sanitized
- `supabase/config.toml` — dedupe duplicate `[functions.generate-sitemap]` block
- `public/sitemap.xml` — slim to core static fallback
- `public/robots.txt` — declare both sitemaps

## Verification After Deploy

1. `curl https://iomrjljlydboniioohkv.supabase.co/functions/v1/generate-sitemap` — confirm valid XML, includes recent `cached_reviews` and `blog_posts` slugs.
2. `curl https://www.reviewthengo.com/sitemap.xml` — confirm fallback served.
3. `curl https://www.reviewthengo.com/robots.txt` — confirm both `Sitemap:` lines present.
4. Submit `https://www.reviewthengo.com/sitemap.xml` in GSC. Done forever.
