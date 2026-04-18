
User shows Google Search Console:
- keywordarchitect.com/sitemap.xml: 14 pages discovered ✓
- reviewthengo.com/sitemap.xml: "Sitemap index processed successfully" but 0 pages discovered, 0-0 of 0 in "Sitemaps read" table

Also shows a 404 page screenshot - likely they tried to visit /sitemap.xml in browser and got 404, OR the sitemap is being served but is empty/invalid.

Key clue: GSC says "Sitemap **index** processed successfully" - this means Google thinks reviewthengo.com/sitemap.xml is a sitemap INDEX file (which points to other sitemaps), not a regular sitemap. But there are no child sitemaps, hence 0 discovered.

Let me check what's actually being served. Two possible files:
1. public/sitemap.xml (static) - listed in files
2. supabase/functions/generate-sitemap/index.ts (dynamic edge function)

The static public/sitemap.xml gets served at reviewthengo.com/sitemap.xml. The edge function lives at the supabase functions URL, NOT at /sitemap.xml on the main domain. So Google is reading the static file in public/sitemap.xml.

I need to check public/sitemap.xml content. If it's a sitemap index pointing nowhere, that explains the 0 pages.

Let me view it.
