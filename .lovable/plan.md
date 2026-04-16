

# Fix Sitemap & Robots.txt for Full Blog Discoverability

## What's Already Working
- Content Studio saves articles to DB ✓
- Dynamic sitemap edge function queries `blog_posts` table and includes all slugs ✓
- Each article gets its own URL at `/compass/{slug}` with proper JSON-LD schema ✓

## What Needs Fixing

### 1. Sitemap Base URL Mismatch
`supabase/functions/generate-sitemap/index.ts` line 53: Change `BASE` from `https://reviewthengo.com` to `https://www.reviewthengo.com`

### 2. Replace Static Sitemap with Redirect
`public/sitemap.xml` — replace the stale hardcoded file with a minimal sitemap index that points to the dynamic edge function. This way crawlers hitting `/sitemap.xml` get directed to the live, auto-updating source.

### 3. Update robots.txt
`public/robots.txt` — update the Sitemap directive to reference `https://www.reviewthengo.com/sitemap.xml` as the canonical entry point.

### 4. Expand noscript Block
`index.html` — add links to key blog articles in the noscript block so AI bots that skip JavaScript can still discover them.

## After This Fix
Every article you create in the Content Studio will automatically:
- Appear in the dynamic sitemap with the correct `www` canonical URL
- Be reachable by all crawlers via robots.txt → sitemap → article URL chain
- Have proper Article JSON-LD schema (already working)

| File | Change |
|------|--------|
| `supabase/functions/generate-sitemap/index.ts` | Fix BASE URL to `www.reviewthengo.com` |
| `public/sitemap.xml` | Replace with sitemap index pointing to edge function |
| `public/robots.txt` | Update Sitemap directive to canonical domain |
| `index.html` | Add blog article links to noscript block |

