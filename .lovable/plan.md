

# Plan: Master SEO/UX Overhaul — Realistic, Stack-Aware Implementation

You uploaded a 15-section master prompt. A large portion of it is **already live** on your site (canonicals, OG/Twitter tags, JSON-LD Organization/WebSite/WebApplication, FAQ schema on homepage, dynamic sitemap edge function, robots.txt with all AI bots allowed, Compass blog with author/breadcrumbs/related posts, sticky search, redesigned footer, AuthorBio, EmailCapturePopup, lazy images, etc.).

This plan implements **only the real, remaining gaps** that are achievable in a Vite + React SPA. I'm flagging things that are in the prompt but **not possible** in this stack so you don't expect them.

---

## What CANNOT be done in this stack (and why)

| Prompt asks for | Why it can't ship as written |
|---|---|
| **Section 1: True SSR / SSG** | Lovable runs React + Vite as a client SPA. There is no Next.js / Remix / Astro available. Closest approximation: the rich `<noscript>` block already in `index.html` (which Googlebot reads), per-page `react-helmet-async` titles/meta (already present), and the dynamic edge sitemap. Modern Googlebot DOES execute JS, so the SPA is indexable — your `cached_reviews` and `blog_posts` rows are already getting crawled. |
| **Section 14: server-side trailing-slash + www→non-www 301s** | We don't control the edge/CDN rewrite layer. The `www` canonical is enforced via `<link rel="canonical">` (already in `SEOHead`), which is what Google honors. |

I'll add prerendering of the homepage's critical content into the static HTML shell to improve LCP, but full per-route SSG isn't on the table. If you ever want true SSG, it's a stack migration, not a feature.

---

## What's already done — no work needed

- Per-page `<title>`, meta description, canonical, OG, Twitter Card via `SEOHead`
- Organization, WebSite, WebApplication, FAQPage, Article, BreadcrumbList JSON-LD
- Dynamic `sitemap.xml` edge function pulling DB blog posts
- `robots.txt` allowing GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, etc.
- Compass blog: per-article SEO, BlogPosting JSON-LD, author byline, related posts, ToC
- `noindex` on thin/dynamic routes (`/reviews/:query`, `/review/:slug`, `/top/:location`, `/my-saves`, etc.)
- Footer 4-column layout, AuthorBio, AffiliateDisclosureBanner, sticky search, EmailCapturePopup
- 8-tool grid (`ToolsDirectorySection`), TrustBadges, BlogPreviewSection, FAQ on homepage

---

## Real gaps to fix

### 1. About page — add Person + Organization JSON-LD
`src/pages/About.tsx` currently sets only basic `SEOHead` (no schema). Add Person schema for Tom (jobTitle, knowsAbout, worksFor) and Organization schema, plus `editorial standards` + `media/press contact` paragraphs the prompt calls out. This is the single biggest E-E-A-T win remaining.

### 2. Accessibility — Skip-to-main link + nav landmarks
- Add `<a href="#main-content" class="skip-link">Skip to main content</a>` as the first focusable element in `Header.tsx`.
- Add `aria-label="Main navigation"` to Header `<nav>` and `aria-label="Footer navigation"` to Footer `<nav>`.
- Audit icon-only buttons in `Header.tsx` and `ComparisonFloatingBadge.tsx` for missing `aria-label`.
- Confirm `<main id="main-content">` already exists on every page (it does on Index — propagate to all pages missing it).

### 3. Destination hub pages — programmatic SEO scaffold
Build a single dynamic route `/destinations/:city` that renders a hub for any city in a hardcoded whitelist. Component reads city from URL, looks up a metadata table (one TS file: name, country, hero image, summary, best months), and renders:
- H1, hero, summary card
- 6 tool quick-links (pre-loaded with that city): `/best-time/:city`, `/itinerary?dest=:city`, `/safety/:city`, `/flights?to=:city`, `/travel-intel?dest=:city`, `/gear?dest=:city`
- "Top hotels in [City]" — pulls from `cached_reviews` filtered by city (or fallback to 3 trending queries)
- Related Compass posts tagged with the city
- FAQPage schema with 3 city-specific Qs
- BreadcrumbList schema, canonical, OG

Launch with the 25 cities from your prompt (Cancun, Bali, Tokyo, Paris, London, NYC, Bangkok, Rome, Punta Cana, Miami, Vegas, Barcelona, Amsterdam, Maldives, Santorini, Costa Rica, Hawaii, Lisbon, Prague, Dubai, Jamaica, Mexico City, Vancouver, Montreal, Banff). Add all 25 to `generate-sitemap` so they enter the index.

This is the biggest *new* SEO win — 25 keyword-targeted, internally-linked landing pages.

### 4. Lead magnet — wire the existing email popup to deliver a packing-list PDF
- `EmailCapturePopup` already captures emails. Add a `lead_magnet` column (or use existing `source_page`) and trigger the existing `send-welcome-email` edge function with a download link to `/lead-magnets/ultimate-carry-on-packing-list.pdf` (you'll upload the PDF to `/public/lead-magnets/`).
- Add a homepage section "Get the free Ultimate Carry-On Packing List" above the footer with a dedicated email input that posts to the same `subscribe` endpoint with `lead_magnet=carry-on-packing-list`.

### 5. Default 1200×630 OG image
`og-image.jpg` is referenced in `SEOHead` and `index.html` but I'll verify it exists at `/public/og-image.jpg`. If missing or not 1200×630, generate a branded one (logo + tagline on travel background) and drop it in `/public/`.

### 6. GA4 custom events
Wire the events the prompt calls out into existing `src/lib/analytics.ts`:
- `tool_search` (fires from each tool's search handler)
- `affiliate_click` (already partly tracked — confirm coverage on Booking/Expedia/Amazon clicks)
- `email_signup` (fire from `subscribe` success)
- `blog_read` (fire from `CompassArticle` on mount)
- `property_saved` (fire from `SaveReviewButton`)
- `itinerary_generated` (fire from `Itinerary.tsx` success)

### 7. Sitemap parity + replace static file with edge-fed snapshot
- `public/sitemap.xml` still hardcodes `/destinations`. Add the 25 new destination hubs.
- Long-term: have `vercel.json`/edge function serve `/sitemap.xml` straight from `generate-sitemap` so static and dynamic never drift. (Today `public/sitemap.xml` is the one Google fetches because it's served by the static layer first.)

### 8. Image dimensions audit (CLS)
Spot-fix `<img>` tags missing `width`/`height` on the homepage hero (`HeroSection`), `Destinations` hero, `About` hero, and all `DestinationCard`s. This is purely a CLS / Core Web Vitals fix.

---

## Out of scope (deferred, by your prompt's standards)

- True SSR — would require migrating off Lovable's React+Vite stack.
- Universal autocomplete grouped by tool intent in the hero — your existing `useSearchSuggestions` already handles places; intent-grouping is a separate future task.
- Replacing Compass pagination with infinite scroll — you already have pagination, which is correct for SEO.
- Pinterest/Instagram/TikTok/Reddit social links — only add if you actually have those accounts (let me know).
- "As seen in" press logos — leave the stat-strip wording you already have until you have real press.

---

## Files I'll touch (when you approve)

- `src/pages/About.tsx` — add Person + Organization JSON-LD, editorial standards, press section
- `src/components/Header.tsx` + `src/components/Footer.tsx` — skip link, aria-labels
- `src/App.tsx` — add `/destinations/:city` route
- `src/pages/DestinationHub.tsx` (NEW) — the programmatic hub page
- `src/data/destinationHubs.ts` (NEW) — 25-city metadata
- `src/components/EmailCapturePopup.tsx` + `src/components/LeadMagnetSection.tsx` (NEW) — packing-list lead magnet wiring
- `src/lib/analytics.ts` + 6 component touch-ups for GA4 events
- `public/sitemap.xml` + `supabase/functions/generate-sitemap/index.ts` — add 25 hubs
- `public/lead-magnets/ultimate-carry-on-packing-list.pdf` (you provide; or I generate a placeholder)
- A handful of `<img>` tags to add explicit width/height for CLS

Estimated scope: ~12 files edited, 3 new files, 1 new edge route. No DB schema changes required (existing `subscribers` table already has the columns we need).

