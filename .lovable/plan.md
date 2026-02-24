

# SEO Optimization for Dynamic Content

Ensure every new blog post and deal you create from the dashboard is fully SEO-optimized and discoverable by Google.

---

## 1. Dynamic Sitemap via Backend Function

**Problem:** The current `sitemap.xml` is a static file. New blog posts you publish from the dashboard will never appear in Google's index unless manually added.

**Solution:** Create a backend function (`generate-sitemap`) that dynamically builds the sitemap by combining all static routes with blog posts from the database. The function will be called at `/functions/v1/generate-sitemap` and return valid XML. Update `robots.txt` to point to this dynamic sitemap URL.

---

## 2. Fix JSON-LD Description Bug for Database Blog Posts

**Problem:** In `CompassArticle.tsx`, the second `useEffect` that creates BlogPosting JSON-LD uses `article.content?.[0]` for the description field. Database blog posts have `richContent` blocks instead of `content` paragraphs, so this field ends up empty -- meaning Google gets no description in the structured data.

**Fix:** Update the JSON-LD description to use `article.excerpt` as the primary source, falling back to the first text block in `richContent`, then `content[0]`.

---

## 3. SEO Keywords / Tags Field in Blog Post Creator

**Problem:** When you write a blog about Mexico, there's no way to add SEO-relevant keywords like "Mexico all-inclusive 2026" or "best Cancun resorts". These help Google understand the topic.

**Solution:** Add a "SEO Tags" field to the `BlogPostCreator` form (comma-separated keywords). Store them in a new `tags` column on the `blog_posts` table. Render them as `<meta name="keywords">` on the article page.

---

## 4. Remove Duplicate JSON-LD (Use SEOHead Instead)

**Problem:** `CompassArticle.tsx` creates JSON-LD in two places: once via `<SEOHead jsonLd={...}>` (breadcrumbs) and once via a manual `useEffect` that appends a script tag. This causes duplicate structured data and the manual one has the description bug. 

**Fix:** Remove the manual `useEffect` JSON-LD injection and pass the BlogPosting JSON-LD through the existing `<SEOHead jsonLd={...}>` prop instead. This centralizes all structured data in one place.

---

## 5. Add `dateModified` to Blog Post JSON-LD

**Problem:** Google prefers seeing `dateModified` alongside `datePublished` in BlogPosting structured data. Currently only `datePublished` is present.

**Fix:** Include the `updated_at` timestamp from the database (or `date_published` as fallback) in the JSON-LD output.

---

## Technical Details

### Database Migration
- Add `tags text[]` column to `blog_posts` table (nullable, default empty array)

### New Backend Function
- `supabase/functions/generate-sitemap/index.ts` -- queries `blog_posts` table, merges with hardcoded static routes, returns XML sitemap

### Files Modified
- `src/components/dashboard/BlogPostCreator.tsx` -- add tags/keywords input field
- `src/pages/CompassArticle.tsx` -- fix JSON-LD to use SEOHead prop, use excerpt for description, add dateModified
- `src/components/SEOHead.tsx` -- support array of JSON-LD objects (already supports this)
- `public/robots.txt` -- update sitemap URL to point to the dynamic function
- `public/sitemap.xml` -- keep as a fallback but the primary will be the dynamic one

### What This Means for Your Mexico Blog Post
When you publish a Mexico blog post from the dashboard:
- It will automatically appear in the dynamic sitemap within minutes
- Google will see full BlogPosting structured data with your title, description, image, author, and publish date
- Your SEO tags ("Mexico resort 2026", "Cancun all-inclusive") will be in the page meta
- The canonical URL, OG image, and Twitter card will all be set correctly
- No manual code changes needed -- just publish and it's optimized

