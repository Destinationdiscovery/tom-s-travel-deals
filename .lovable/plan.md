

# Phase 6: Accessibility, Mobile UX, Structured Data & Monetization Hardening

With SEO, performance, analytics, and content cross-linking now complete, this phase focuses on the remaining high-impact areas: accessibility compliance, mobile experience refinement, richer structured data for search engines, and monetization improvements.

---

## Part A: Accessibility (a11y) Improvements

**Problem:** Several interactive elements lack proper ARIA labels, focus management, and keyboard navigation. The email popup traps focus visually but not programmatically. Color contrast in some muted text may not meet WCAG AA.

### Changes:

1. **Focus trap on EmailCapturePopup** -- When the popup opens, focus moves to the email input. Pressing Escape dismisses it. Tab stays within the popup while it's open.

2. **Skip-to-content link** -- Add a visually hidden "Skip to main content" link at the top of `Header.tsx` that becomes visible on focus, allowing keyboard users to bypass navigation.

3. **ARIA improvements across components:**
   - `HeroSection.tsx` -- add `aria-label` to the carousel and slide indicators
   - `TravelDealsSection.tsx` -- add `role="list"` and `role="listitem"` to deal cards
   - `ImageLightbox` -- add `aria-label` to navigation buttons and `role="dialog"` with `aria-modal`

4. **Improved color contrast** -- Audit and bump `text-primary-foreground/60` and `text-muted-foreground` values in the footer and sidebar where contrast ratios fall below 4.5:1

**Files modified:** `src/components/EmailCapturePopup.tsx`, `src/components/Header.tsx`, `src/components/HeroSection.tsx`, `src/components/TravelDealsSection.tsx`, `src/components/ui/image-lightbox.tsx`, `src/index.css`

---

## Part B: Mobile UX Refinements

**Problem:** Several components work on mobile but aren't optimized for touch. The review page sidebar stacks below the main content on mobile, pushing affiliate links far down. The hero search input is small on mobile devices.

### Changes:

1. **Sticky mobile CTA bar on review pages** -- Add a fixed bottom bar on mobile (below `md` breakpoint) with "Book Now" linking to Expedia and "Save" button. Hidden on desktop where the sidebar handles this.

2. **Hero search input sizing** -- Increase tap target height on mobile from `h-10` to `h-12`, add larger text.

3. **Mobile-optimized deal cards** -- Make deal cards in `TravelDealsSection.tsx` horizontally scrollable on mobile instead of stacking vertically, with snap scrolling.

4. **Touch-friendly gallery** -- Add swipe support to the `ImageLightbox` using touch events for navigating between images.

**Files modified:** `src/pages/DestinationReview.tsx`, `src/components/HeroSection.tsx`, `src/components/TravelDealsSection.tsx`, `src/components/ui/image-lightbox.tsx`

---

## Part C: Rich Structured Data (JSON-LD)

**Problem:** Only the review page has JSON-LD. Missing structured data on homepage, destinations listing, gear page, and blog articles reduces search result richness.

### Changes:

1. **Homepage** -- Add `Organization` and `WebSite` JSON-LD with `SearchAction` (enables Google sitelinks search box).

2. **Destinations listing page** -- Add `ItemList` JSON-LD with each destination as a `ListItem`.

3. **Compass articles** -- Add `Article` JSON-LD with author, datePublished, image, and headline.

4. **Gear page** -- Add `WebPage` JSON-LD with description.

5. **Breadcrumb JSON-LD** -- Already partially implemented on review pages; extend to use the `SEOHead` component to inject `BreadcrumbList` JSON-LD automatically when breadcrumb props are provided.

**Files modified:** `src/pages/Index.tsx`, `src/pages/Destinations.tsx`, `src/pages/CompassArticle.tsx`, `src/pages/Gear.tsx`, `src/components/SEOHead.tsx`

---

## Part D: Monetization Hardening

**Problem:** Affiliate links are static and don't account for user geography consistently. Deal prices have no urgency mechanism beyond a static "Limited Time" badge. No tracking on the "Search" widget interactions.

### Changes:

1. **Countdown timers on deals** -- Add a configurable expiration date to each deal in `TravelDealsSection.tsx`. Display a countdown ("Ends in 2d 14h") next to the discount badge. When expired, hide the deal or show "Expired."

2. **Track Expedia search widget usage** -- Fire an analytics event when users open the Expedia search widget and when they submit a search.

3. **"Book Now" deep links on review pages** -- Add a prominent "Check Prices on Expedia" button in the review summary card that uses the geo-aware deep link builder already in `AffiliateLinks.tsx`.

4. **Affiliate link click confirmation** -- When a user clicks an affiliate link, briefly show a toast confirming they're being redirected to the partner site (builds trust and reduces accidental clicks on mobile).

**Files modified:** `src/components/TravelDealsSection.tsx`, `src/components/ExpediaSearchWidget.tsx`, `src/pages/DestinationReview.tsx`, `src/components/AffiliateLinks.tsx`

---

## Part E: 404 Page Enhancement

**Problem:** The current `NotFound.tsx` is a dead end with no recovery path for users who land on broken links.

### Changes:

- Add a search bar to `NotFound.tsx` so users can find what they were looking for
- Add links to popular destinations, recent reviews, and the homepage
- Add SEOHead with appropriate noindex meta tag

**Files modified:** `src/pages/NotFound.tsx`

---

## Part F: Print Stylesheet for Review Pages

**Problem:** When users print or "Save as PDF" a review page, the header, footer, popups, and floating buttons all print, creating a messy output.

### Changes:

- Add `@media print` styles to hide the header, footer, email popup, scroll-to-top button, affiliate sidebar, and floating badges when printing
- Ensure the review content, gallery, and tips print cleanly

**Files modified:** `src/index.css`

---

## Technical Summary

### No New Dependencies

### Files Modified (14-16)
- `src/components/EmailCapturePopup.tsx` -- focus trap, Escape key handling
- `src/components/Header.tsx` -- skip-to-content link
- `src/components/HeroSection.tsx` -- ARIA labels, mobile input sizing
- `src/components/TravelDealsSection.tsx` -- ARIA roles, mobile scroll, countdown timers
- `src/components/ui/image-lightbox.tsx` -- ARIA dialog, swipe support
- `src/components/ExpediaSearchWidget.tsx` -- analytics tracking
- `src/components/AffiliateLinks.tsx` -- click confirmation toast
- `src/components/SEOHead.tsx` -- breadcrumb JSON-LD support
- `src/pages/Index.tsx` -- Organization/WebSite JSON-LD
- `src/pages/Destinations.tsx` -- ItemList JSON-LD
- `src/pages/DestinationReview.tsx` -- sticky mobile CTA, "Check Prices" button
- `src/pages/CompassArticle.tsx` -- Article JSON-LD
- `src/pages/Gear.tsx` -- WebPage JSON-LD
- `src/pages/NotFound.tsx` -- search bar, popular links, SEOHead
- `src/index.css` -- print styles, contrast fixes

### Files NOT Touched
- All admin/dashboard pages
- All edge functions
- Database tables
- `tailwind.config.ts`

### What This Unlocks
- **WCAG AA compliance** for keyboard and screen reader users
- **Google rich results** with Organization, Article, ItemList, and BreadcrumbList structured data
- **Mobile conversion uplift** with sticky CTA bar and touch-optimized gallery
- **Deal urgency** with countdown timers driving faster click decisions
- **Clean PDF exports** of reviews for offline sharing
- **Better bounce recovery** from the enhanced 404 page

