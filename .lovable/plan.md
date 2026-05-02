I checked the live site the same way as before using AI crawler User-Agents. It is still returning the JavaScript shell:

```text
<body>
  <noscript>...</noscript>
  <div id="root"></div>
</body>
```

So I will not treat the current state as fixed. The implementation needs to produce real HTML for bots and then be verified against the published domain.

Plan:

1. Add real static HTML snapshots for key public routes
   - Generate crawlable HTML files in `public/` for:
     - Home page
     - Tool pages: `/safety`, `/gear`, `/best-time`, `/itinerary`, `/currency`, `/flights`, `/travel-intel`, `/search`, `/guides`, `/destinations`, `/compass`
   - Each file will include actual headings, explanatory body text, internal links, canonical tags, and JSON-LD.
   - This gives AI crawlers a non-JavaScript page they can read without relying on React hydration.

2. Serve static snapshots to AI crawlers before React boots
   - Add a tiny script in `index.html` that runs before the React app.
   - It will detect AI and non-JS crawler User-Agents such as GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, AppleBot, Bingbot, and similar.
   - If the visitor is a crawler and a matching static snapshot exists, it will redirect to the HTML snapshot.
   - Normal users will continue seeing the regular React site.

3. Fix review pages specifically
   - Current review pages are especially important because `/review/:slug` is what your sitemap lists.
   - I will extend the existing `articles-feed` backend function so it can render `/review/:slug` content as clean static HTML from `cached_reviews`, including:
     - Property name
     - Location
     - Summary
     - Ratings
     - Pros and cons if available
     - Tips
     - Full review text
     - Canonical link back to the public review URL
     - Review/Hotel JSON-LD with aggregate rating when available
   - Then the crawler redirect will send AI bots from `/review/<slug>` to the static crawler version for that slug.

4. Improve the fallback `<noscript>` content
   - Replace the current one-paragraph fallback with a real crawlable homepage fallback:
     - H1
     - Travel tool descriptions
     - Links to the sitemap, Compass, destination reviews, and major tool pages
   - This is not the main fix, but it helps any crawler or browser that does not run scripts.

5. Keep robots and sitemap aligned
   - Confirm `public/robots.txt` points to `https://www.reviewthengo.com/sitemap.xml`.
   - Keep the dynamic sitemap reference too, because it already includes database-backed review URLs.
   - Do not add GitHub Actions prerendering, because this site is served by Lovable Cloud, so generated files in GitHub would not automatically be served by the live domain.

6. Test like an AI crawler before reporting success
   - After implementing, I will test the published/preview output with curl using AI User-Agents, not just trust the code.
   - I will check at least:
     - `GPTBot` against the homepage
     - `PerplexityBot` against a review page
     - `ClaudeBot` against a tool page
   - I will specifically verify the response contains real HTML content such as `<h1>`, readable body sections, links, and JSON-LD, and does not just show `<div id="root"></div>`.
   - I will only say it is fixed if those tests show static readable HTML.