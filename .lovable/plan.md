

User wants the homepage "From the Blog" section to:
1. Always show the 3 latest published articles (auto-update with new posts)
2. Be SEO optimized
3. Be in the sitemap

Let me check the current state. From the files visible:

**BlogPreviewSection.tsx** — already merges hardcoded `compassArticles` + DB `blog_posts`, dedupes by slug (DB wins), sorts by `datePublished` desc, slices top 3. So new DB posts DO appear automatically. Good.

**generate-sitemap edge function** — already pulls all blog_posts slugs from DB and adds them to the sitemap with lastmod dates. Good.

**SEO** — Need to confirm:
- Homepage has BlogPreviewSection mounted
- Articles have proper JSON-LD on individual pages (CompassArticle)
- Sitemap includes new posts (yes, via DB query in edge function)

Issues to verify/fix:
1. `staleTime: 5 * 60 * 1000` means freshly published posts may take up to 5 min to show on homepage for users with cached query. But this is per-session, not bad.
2. The query orders by `date_published` (text field) which could sort lexicographically wrong if dates aren't ISO. Need to verify format.
3. Need to add `ItemList` JSON-LD on homepage for the blog preview section to be SEO-optimized
4. Need to verify Index.tsx mounts BlogPreviewSection

Let me check Index.tsx and CompassArticle to see what's there before planning.

Actually, the user's ask is short: "make sure latest articles update + SEO optimized + sitemap + show 3 latest". Most of this is already done. The plan should:
- Verify/confirm what's already working
- Add ItemList JSON-LD schema for the homepage blog section (SEO improvement)
- Ensure date_published sorts correctly (use created_at as tiebreaker, or order by created_at)
- Make sure homepage section actually appears in Index.tsx

Let me check Index.tsx quickly.
