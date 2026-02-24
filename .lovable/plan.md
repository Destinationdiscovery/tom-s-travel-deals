

# Phase 2: Homepage Redesign — Hero, Sections, CTAs & Trust Elements

Building on the Phase 1 foundation (colors, fonts, header, footer), this phase transforms the homepage into a high-converting affiliate funnel with a stunning hero, stronger CTAs, trust badges, and urgency elements.

**What's NOT touched:** All admin/dashboard pages remain completely unchanged.

---

## 1. Expanded Hero Section with Rotating Background Images

**Current:** Small 240-280px hero with static beach image and minimal text.

**New:** Full-impact 420-500px hero with:
- Rotating background images cycling every 5 seconds with smooth crossfade (using existing assets: `hero-beach.jpg`, `snowbird-beach-sunset.jpg`, `snowbird-caribbean-aerial.jpg`, `deal-santorini.jpg`, `japan-tokyo-skyline.jpg`)
- Headline: "Honest Travel Reviews, Deals & Insights for Canadians"
- Subtext: "Real reviews from a Toronto-based travel consultant. Find your perfect trip."
- Integrated search bar (moved FROM the Reviews section INTO the hero) with placeholder "Search a hotel, resort, or destination..."
- Large warm-orange CTA button: "Find Your Next Trip" linking to Expedia deals
- "Powered by Expedia" badge below the CTA
- Subtle dark gradient overlay for text readability

**File:** `src/components/HeroSection.tsx` -- full rewrite

---

## 2. Trust Badges Bar (New Component)

A horizontal bar just below the hero showing trust signals:
- "100% Honest Reviews" (with Shield icon)
- "Canadian Traveler Focused" (with MapPin icon)
- "Expedia Partner" (with badge icon)
- "10,000+ Travelers Helped" (with Users icon)

Styled as a clean white bar with subtle icons and text, providing instant credibility.

**File:** `src/components/TrustBadges.tsx` -- new component

---

## 3. Reviews Section Enhancements

**Current:** Has its own search bar + 4-column card grid with text-only cards.

**Changes:**
- Remove the inline search bar (moved to hero)
- Keep the review cards but upgrade the "Book on Expedia" link to a prominent warm-orange button: "Book on Expedia -- Save Now"
- Add hover effect with slight scale and shadow
- Keep the existing data fetching and suggestion logic -- just pass search state down from Index

**File:** `src/components/RecentReviewsHomepage.tsx` -- refactored

---

## 4. Deals Section Enhancements

**Current:** Grid of deal cards with discount badges.

**Changes:**
- Add urgency text to deal cards: "Limited Time" badge next to the discount badge
- Change "View Deal" link to a warm-orange button: "Grab This Deal -- Save X%"
- Add a subtle pulsing animation to the discount badge
- Keep all existing data and affiliate links unchanged

**File:** `src/components/TravelDealsSection.tsx` -- enhanced

---

## 5. Gear Section Enhancements

**Current:** Category cards with search bar.

**Changes:**
- Upgrade "Find Gear" button to warm-orange styling
- Add "Shop Gear" warm-orange buttons on category cards
- Keep all existing search/packing list functionality

**File:** `src/components/GearPreviewSection.tsx` -- enhanced

---

## 6. Intel Section Enhancements

**Current:** Tabbed search with category cards.

**Changes:**
- Style the "Check" buttons in warm-orange
- Keep all existing search/intel functionality

**File:** `src/components/IntelPreviewSection.tsx` -- minor style updates

---

## 7. Blog Section Enhancements

**Current:** 3-column article cards.

**Changes:**
- Add embedded "Find Deals" warm-orange button (instead of small text link) when a destination is detected
- Keep all existing data and routing

**File:** `src/components/BlogPreviewSection.tsx` -- enhanced

---

## 8. Affiliate Disclosure Banner (New Component)

A small, dismissible banner at the top of the homepage (below header):
- Text: "This site contains affiliate links -- we earn a commission at no extra cost to you."
- Link to /affiliate-disclosure
- Dismissible with X button (stored in sessionStorage)

**File:** `src/components/AffiliateDisclosureBanner.tsx` -- new component

---

## 9. Homepage Layout Update

Update Index.tsx to:
- Add the TrustBadges component below the hero
- Add the AffiliateDisclosureBanner at the top
- Pass search state from hero down to RecentReviewsHomepage
- Add cross-links between sections (e.g., "Related Gear" link from reviews to gear section)

**File:** `src/pages/Index.tsx` -- updated

---

## Technical Summary

### Files Created
- `src/components/TrustBadges.tsx` -- trust signal bar
- `src/components/AffiliateDisclosureBanner.tsx` -- dismissible affiliate notice

### Files Modified
- `src/components/HeroSection.tsx` -- full rewrite with rotating images, search bar, CTA
- `src/components/RecentReviewsHomepage.tsx` -- remove search (moved to hero), upgrade CTA buttons
- `src/components/TravelDealsSection.tsx` -- urgency text, orange CTA buttons
- `src/components/GearPreviewSection.tsx` -- orange button styling
- `src/components/IntelPreviewSection.tsx` -- orange button styling
- `src/components/BlogPreviewSection.tsx` -- upgrade deal links to buttons
- `src/pages/Index.tsx` -- add new components, wire search state from hero to reviews

### Files NOT Touched
- All files under `src/components/dashboard/`
- All admin pages (GearAdmin, BookingReport, ClientFile, etc.)
- All edge functions and database tables
- `src/components/AffiliateLinks.tsx` (affiliate logic unchanged)
- `src/index.css`, `tailwind.config.ts` (Phase 1 styling stays)
- `src/components/Header.tsx`, `src/components/Footer.tsx` (Phase 1 work stays)

