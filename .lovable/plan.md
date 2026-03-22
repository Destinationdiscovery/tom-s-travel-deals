

# SEO Audit: What's Already Done vs. What's Left

## Already Implemented (No Changes Needed)
- SEOHead component with react-helmet-async on every page ✅
- JSON-LD: Organization, TravelAgency, WebSite, WebApplication, FAQPage ✅
- Canonical tags via SEOHead on every page ✅
- robots.txt allowing GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot ✅
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>` tags ✅
- Skip-to-content link ✅
- `<noscript>` block with full site content for AI crawlers ✅
- Alt text on hero images ✅
- `loading="lazy"` on below-fold images (14+ files) ✅
- Viewport meta tag ✅
- Preconnect for Google Fonts ✅
- E-E-A-T credibility banner + "Updated March 2026" badge ✅
- Internal linking with descriptive anchor text ✅
- Keywords meta tag ✅
- FAQ schema ✅

## Actual Remaining Gaps (5 items)

### 1. Standardize all URLs to `www.reviewthengo.com`
`SEOHead.tsx` uses `https://reviewthengo.com` (no www) as BASE_URL. The Organization schema in Index.tsx uses `www.`. This inconsistency confuses crawlers about canonical authority.

**Fix**: Update `SEOHead.tsx` BASE_URL and DEFAULT_IMAGE to use `www.reviewthengo.com`. Update WebSite and WebApplication schema URLs in `Index.tsx`. Update OG image URLs in `index.html`.

### 2. Fix stale fallback document.titles
Two files still have old branding:
- `BookingReport.tsx`: "ReviewThenGo.com | Real Reviews, Tested Gear & Travel Insights"
- `DestinationReview.tsx`: Same old string

**Fix**: Update both to "ReviewThenGo: All-in-One Travel Planner"

### 3. Add `<link rel="preload">` for critical font
Google Fonts stylesheet is render-blocking. Add a preload hint for the most critical font weight.

**Fix**: Add `<link rel="preload" as="style">` for the Google Fonts CSS in `index.html`

### 4. Add WebSite `SearchAction` with www URL
The SearchAction target URL in Index.tsx uses non-www. Standardize.

### 5. PopularSavesSection schema URLs
Uses `reviewthengo.com` without www.

## Files to Change

| File | Change |
|------|--------|
| `src/components/SEOHead.tsx` | BASE_URL → `https://www.reviewthengo.com` |
| `src/pages/Index.tsx` | Standardize WebSite + WebApplication URLs to www |
| `src/components/PopularSavesSection.tsx` | URL to www |
| `index.html` | OG image URLs to www, add font preload |
| `src/pages/BookingReport.tsx` | Fix fallback document.title |
| `src/pages/DestinationReview.tsx` | Fix fallback document.title |

All changes are invisible to users — no visual or functional impact.

