

# Phase 4: Social Sharing, Cross-Linking & Final Polish

This final phase adds social sharing to review pages, cross-links between sections for better discoverability, and polishes remaining rough edges.

**What's NOT touched:** All admin/dashboard pages remain completely unchanged.

---

## 1. Social Sharing Buttons on Review Pages

Replace the placeholder "Share" button on `DestinationReview.tsx` with working social share functionality:
- Share to Twitter/X (pre-filled with review title + link)
- Share to Facebook
- Copy link to clipboard
- Uses the Web Share API on mobile (native share sheet) with fallback buttons on desktop
- Styled as a small horizontal button group in the summary card

**File:** `src/pages/DestinationReview.tsx` -- replace Share button with working share dropdown

---

## 2. Cross-Linking: Gear Recommendations on Review Pages

Add a "Recommended Gear" callout card in the review sidebar (below AffiliateLinks):
- Shows 3 gear category suggestions relevant to travel (e.g., "Packing Cubes," "Universal Adapter," "Water Hammock")
- Each links to the `/gear` page
- Simple card with icons and links, no complex logic

**File:** `src/pages/DestinationReview.tsx` -- add gear cross-link card in sidebar

---

## 3. Cross-Linking: Related Reviews on Destination Pages

Add a "You Might Also Like" section at the bottom of each review page:
- Shows up to 3 other reviews from the hardcoded `reviews` object (excluding the current one)
- Simple card layout with destination name, rating, and "Read Review" link

**File:** `src/pages/DestinationReview.tsx` -- add related reviews section before comments

---

## 4. Cross-Linking: Homepage Section Connectors

Add subtle cross-link text between homepage sections:
- After Reviews section: "Need gear for your trip? Check our Travel Gear picks" linking to gear section
- After Deals section: "Read honest reviews before you book" linking to reviews section
- Small, inline text links with arrows -- not intrusive

**File:** `src/pages/Index.tsx` -- add cross-link connectors between sections

---

## 5. "Deals" Nav Link Smooth Scroll

Currently the header "Deals" link points to `/#deals`. Fix it so:
- On the homepage, it smooth-scrolls to the `#travel-deals` section
- On other pages, it navigates to `/#travel-deals` (which will scroll on load)

**File:** `src/components/Header.tsx` -- handle Deals link scroll behavior
**File:** `src/pages/Index.tsx` -- add scroll-on-load for hash

---

## 6. Email Capture in Footer

Add an inline email signup form to the footer (in addition to the popup):
- Small "Get Weekly Deals" input + subscribe button in the brand column
- Reuses the same `subscribe` edge function
- Provides a second capture point for users who scroll all the way down

**File:** `src/components/Footer.tsx` -- add inline email form

---

## 7. Final Style Polish

- Ensure the "Save" button on review pages uses `localStorage` to persist saved state (currently it's a no-op placeholder)
- Add a subtle scroll-to-top button that appears when user scrolls down on long review pages

**File:** `src/pages/DestinationReview.tsx` -- wire Save button to localStorage
**File:** `src/components/ScrollToTop.tsx` -- already exists, ensure it's included on review pages

---

## Technical Summary

### Files Modified
- `src/pages/DestinationReview.tsx` -- social sharing, gear cross-links, related reviews, save button
- `src/pages/Index.tsx` -- cross-link connectors between sections, hash scroll
- `src/components/Header.tsx` -- Deals link smooth scroll handling
- `src/components/Footer.tsx` -- inline email signup form

### Files NOT Touched
- All files under `src/components/dashboard/`
- All admin pages
- All edge functions
- `src/index.css`, `tailwind.config.ts`
- All Phase 1/2/3 components (HeroSection, TrustBadges, etc.)
- Database tables (reuses existing `subscribe` edge function)

### No New Database Changes
- Email signups from the footer reuse the existing `subscribe` edge function

