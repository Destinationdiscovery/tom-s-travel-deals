

# Phase 5: SEO, Performance, Analytics, Content Architecture & Conversion Optimization

This is a comprehensive upgrade covering all remaining optimization areas to maximize the site's organic traffic, affiliate revenue, and user engagement.

---

## Part A: SEO — Dynamic Meta Tags & Open Graph

**Problem:** Every page shares the same static meta tags from `index.html`. Social shares always show the same generic title/image regardless of which page is shared.

**Solution:** Install `react-helmet-async` and add dynamic `<title>`, `<meta description>`, and Open Graph tags to every route.

### Changes:
- Install `react-helmet-async` package
- Wrap `App.tsx` with `<HelmetProvider>`
- Create a reusable `<SEOHead>` component that accepts title, description, image, and URL props
- Add `<SEOHead>` to every page:
  - `DestinationReview.tsx` — title: "[Property] Review | ReviewThenGo", description from review summary, image from review hero
  - `Destinations.tsx` — "Destination Reviews | ReviewThenGo"
  - `Compass.tsx` / `CompassArticle.tsx` — article-specific titles and excerpts
  - `Gear.tsx` — "Travel Gear Reviews | ReviewThenGo"
  - `TravelIntel.tsx` — "Travel Intel | ReviewThenGo"
  - `About.tsx`, `Contact.tsx`, `Compare.tsx`, `Index.tsx` — appropriate page-specific tags
- Update `index.html` OG image from the placeholder Lovable image to a proper branded image

**Files created:** `src/components/SEOHead.tsx`
**Files modified:** `src/App.tsx`, `src/pages/Index.tsx`, `src/pages/DestinationReview.tsx`, `src/pages/Destinations.tsx`, `src/pages/Compass.tsx`, `src/pages/CompassArticle.tsx`, `src/pages/Gear.tsx`, `src/pages/TravelIntel.tsx`, `src/pages/About.tsx`, `src/pages/Contact.tsx`, `src/pages/Compare.tsx`, `index.html`

---

## Part B: Performance — Lazy Loading & Image Optimization

**Problem:** `DestinationReview.tsx` eagerly imports 60+ images at the top of the file, inflating the initial bundle. The hero carousel preloads 5 large images simultaneously. Gallery images load all at once.

### Changes:

1. **Gallery images — native lazy loading**
   - Add `loading="lazy"` to all gallery `<img>` tags in `DestinationReview.tsx`
   - Add `loading="lazy"` to related review card images
   - Add `loading="lazy"` to Compass article card images

2. **Hero carousel — preload only current slide**
   - In `HeroSection.tsx`, set `loading="lazy"` on non-active slides and `loading="eager"` only on the first slide

3. **Route-level code splitting**
   - Convert all page imports in `App.tsx` to `React.lazy()` with `<Suspense>` fallback
   - This ensures the 60+ image imports in `DestinationReview.tsx` only load when that route is visited

4. **Font loading optimization**
   - Move Google Fonts from CSS `@import` to `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html` to eliminate render blocking

**Files modified:** `src/App.tsx`, `src/pages/DestinationReview.tsx`, `src/components/HeroSection.tsx`, `src/index.css`, `index.html`, `src/pages/Compass.tsx`

---

## Part C: Affiliate Click Tracking via Google Analytics

**Problem:** Google Analytics is installed but only tracks pageviews. Zero visibility into which affiliate links generate clicks, from which pages, or which platforms perform best.

### Changes:

1. **Create a tracking utility**
   - New file `src/lib/analytics.ts` with a `trackAffiliateClick(platform, page, position)` function
   - Calls `gtag('event', 'affiliate_click', { platform, page, position })` 
   - Gracefully no-ops if gtag is not available

2. **Wire tracking to all affiliate touchpoints**
   - `AffiliateLinks.tsx` — track clicks on Expedia, Hotels.com, VRBO buttons with position "sidebar"
   - `InlineAffiliateCTA.tsx` — track with position "inline_banner" or "inline_compact"
   - `TravelDealsSection.tsx` — track each deal click with deal name and position "deals_grid"
   - `DestinationCard.tsx` — track with position "destination_card"
   - `HeroSection.tsx` — track "Find Your Next Trip" CTA with position "hero"
   - `Footer.tsx` — track Expedia badge click with position "footer"

3. **Track email signups as conversions**
   - `EmailCapturePopup.tsx` — fire `gtag('event', 'email_signup', { source: 'popup' })`
   - `Footer.tsx` — fire `gtag('event', 'email_signup', { source: 'footer' })`

**Files created:** `src/lib/analytics.ts`
**Files modified:** `src/components/AffiliateLinks.tsx`, `src/components/InlineAffiliateCTA.tsx`, `src/components/TravelDealsSection.tsx`, `src/components/destinations/DestinationCard.tsx`, `src/components/HeroSection.tsx`, `src/components/Footer.tsx`, `src/components/EmailCapturePopup.tsx`

---

## Part D: Exit-Intent Email Capture

**Problem:** The email popup only triggers on a 30-second timer. Users who bounce quickly are never captured.

### Changes:
- Add a `mouseleave` event listener on `document.documentElement` in `EmailCapturePopup.tsx`
- If the user's mouse moves above the viewport (exit intent), show the popup immediately
- Still respect the 7-day localStorage dismissal
- On mobile (no mouse), keep the 30-second timer as fallback

**Files modified:** `src/components/EmailCapturePopup.tsx`

---

## Part E: Breadcrumbs on Review & Article Pages

**Problem:** No breadcrumb navigation for SEO crawling or user orientation on deep pages.

### Changes:
- Add breadcrumbs to `DestinationReview.tsx`: Home > Destinations > [Property Name]
- Add breadcrumbs to `CompassArticle.tsx`: Home > Blog > [Article Title]
- Uses the existing `src/components/ui/breadcrumb.tsx` component
- Include JSON-LD `BreadcrumbList` structured data for Google

**Files modified:** `src/pages/DestinationReview.tsx`, `src/pages/CompassArticle.tsx`

---

## Part F: Fix Placeholder Social Links

**Problem:** Footer social links (Twitter, Instagram) point to `href="#"` — broken links that hurt trust and SEO.

### Changes:
- Update Twitter link to `https://x.com/TomLaracyTravel` (matching the existing meta tag)
- Update Instagram link to a real URL or remove if no account exists (will use a placeholder prompt for the user)

**Files modified:** `src/components/Footer.tsx`

---

## Part G: Sitemap Auto-Generation Enhancement

**Problem:** `public/sitemap.xml` is static and must be manually updated when new reviews or articles are added.

### Changes:
- Create a helper comment in `public/sitemap.xml` documenting which URLs need to be added when new content is created
- Add any missing URLs from current routes (e.g., `/about`, `/contact`, `/compare`, `/search`, `/affiliate-disclosure`)

**Files modified:** `public/sitemap.xml`

---

## Technical Summary

### New Dependencies
- `react-helmet-async` — for dynamic meta tags

### Files Created (2)
- `src/components/SEOHead.tsx` — reusable SEO meta tag component
- `src/lib/analytics.ts` — affiliate click + conversion tracking utility

### Files Modified (18+)
- `src/App.tsx` — HelmetProvider wrapper, React.lazy code splitting
- `index.html` — font preconnect, updated OG image
- `src/index.css` — remove render-blocking Google Fonts import
- `src/pages/Index.tsx` — SEOHead
- `src/pages/DestinationReview.tsx` — SEOHead, breadcrumbs, lazy images
- `src/pages/Destinations.tsx` — SEOHead
- `src/pages/Compass.tsx` — SEOHead, lazy images
- `src/pages/CompassArticle.tsx` — SEOHead, breadcrumbs
- `src/pages/Gear.tsx` — SEOHead
- `src/pages/TravelIntel.tsx` — SEOHead
- `src/pages/About.tsx` — SEOHead
- `src/pages/Contact.tsx` — SEOHead
- `src/pages/Compare.tsx` — SEOHead
- `src/components/AffiliateLinks.tsx` — click tracking
- `src/components/InlineAffiliateCTA.tsx` — click tracking
- `src/components/TravelDealsSection.tsx` — click tracking
- `src/components/destinations/DestinationCard.tsx` — click tracking
- `src/components/HeroSection.tsx` — lazy loading, click tracking
- `src/components/Footer.tsx` — click tracking, fix social links, email tracking
- `src/components/EmailCapturePopup.tsx` — exit intent, signup tracking
- `public/sitemap.xml` — add missing URLs

### Files NOT Touched
- All admin/dashboard pages
- All edge functions
- Database tables (no new tables needed)
- `tailwind.config.ts`, core styling

### What This Unlocks
- **Google Analytics dashboard** will show affiliate click data by platform, page, and position
- **Social shares** will display proper titles, descriptions, and images
- **Page speed** improves significantly with lazy loading and code splitting
- **Bounce recovery** via exit-intent email capture
- **SEO crawlability** improves with breadcrumbs and structured data

