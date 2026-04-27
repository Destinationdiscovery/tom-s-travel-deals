Claude is partly right, but not about everything:

- The live sitemap is accessible now at `https://www.reviewthengo.com/sitemap.xml` and returns `200` with XML content. It includes 110 URLs, including `/compass/why-canadians-skipping-us-2026`.
- The direct crawler feed is deployed and works for database blog posts, for example:
  `https://iomrjljlydboniioohkv.supabase.co/functions/v1/articles-feed?slug=cheapest-month-to-fly-europe-canada`
- The gap is that the crawler feed only looks in the database for `/compass/:slug` articles. Your older 9 static Compass articles live in `src/data/compassArticles.ts`, so the feed returns `Not found` for `why-canadians-skipping-us-2026` even though the normal React page renders in the browser.
- The raw `/compass/...` page source still being the SPA shell is expected on Lovable hosting. The intended crawler solution is the direct plain-HTML feed, plus sitemap discovery, not server-rendering every SPA route.

Plan to complete the fix:

1. Extend the crawler feed to include the 9 static Compass articles
   - Update `supabase/functions/articles-feed/index.ts` so static articles like `why-canadians-skipping-us-2026` render as plain HTML just like database articles.
   - Include title, excerpt, author, date, body text, canonical URL, and `BlogPosting` JSON-LD with `articleBody`.
   - Keep database articles working exactly as they do now.

2. Keep the sitemap valid and crawler-friendly
   - Verify `public/sitemap.xml` remains valid XML and includes all 110 URLs.
   - Fix any invalid sitemap URL entries discovered during validation, especially the malformed Edinburgh title-style URL currently visible in the sitemap if it is present in the database feed.
   - Keep `robots.txt` pointing to the standard sitemap URL.

3. Add clear test URLs for Claude/GSC checks
   - Confirm these direct crawler-feed URLs return full static HTML:
     - `https://iomrjljlydboniioohkv.supabase.co/functions/v1/articles-feed?slug=why-canadians-skipping-us-2026`
     - `https://iomrjljlydboniioohkv.supabase.co/functions/v1/articles-feed?slug=cheapest-month-to-fly-europe-canada`
   - Confirm the first one contains the article title, article body, canonical link to the live article, and JSON-LD `articleBody`.

4. Important note about Google indexing
   - Google indexing is not instant. Even after the sitemap/feed is correct, Google may take days or weeks to show individual articles in `site:` search.
   - After this fix is published, the correct next step is to resubmit the sitemap in Google Search Console and use URL Inspection on a few article URLs.

Technical details:

- No database schema changes are needed.
- No secrets are needed.
- The backend function will deploy automatically after the code change.
- The static `public/sitemap.xml` update still requires publishing the frontend for the custom domain copy to change.
- This will not turn the React SPA article URL itself into server-rendered HTML. On Lovable hosting, raw source for `/compass/:slug` will still be the app shell. The fix is to make the crawler-specific feed complete, discoverable, and testable.