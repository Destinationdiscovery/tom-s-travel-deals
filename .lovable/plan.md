## Goal

Strip every Expedia / Hotels.com / VRBO booking link, banner, sidebar, button, and CTA from the public site so reviews are pure reviews. Amazon-powered gear pages and links stay untouched.

## What gets removed

**Components (delete entirely):**
- `src/components/AffiliateLinks.tsx`
- `src/components/InlineAffiliateCTA.tsx`
- `src/components/ExpediaSearchWidget.tsx`
- `src/components/TravelDealsSection.tsx`
- `src/components/reviews/BookingSidebar.tsx`
- `src/components/TopDestinationCard.tsx` (Expedia "Check rates" link is core; card no longer needed)

**Removed usages / CTAs in pages and components:**
- `src/pages/Index.tsx` — drop `<TravelDealsSection />`
- `src/pages/AIReview.tsx` and `src/components/AIReviewResult.tsx` — remove `InlineAffiliateCTA` banners and `AffiliateLinks` sidebar; tighten layout (single column where sidebar was)
- `src/pages/DestinationReview.tsx` — remove two `InlineAffiliateCTA` banners and the `AffiliateLinks` sidebar
- `src/pages/Reviews.tsx` — remove `BookingSidebar`; convert layout to single column
- `src/pages/Compare.tsx` — remove `AffiliateLinks`
- `src/pages/TopDestinations.tsx` — remove `AffiliateLinks`
- `src/pages/Flights.tsx` — strip Expedia deep-link buttons (page kept as informational tool)
- `src/pages/MyTrips.tsx`, `src/pages/MyReviews.tsx` — remove "Book on Expedia" links from saved cards
- `src/components/HeroSection.tsx` — remove Expedia CTA / link
- `src/components/Header.tsx` — remove `ExpediaSearchWidget` trigger and dialog
- `src/components/RecentReviewsHomepage.tsx`, `src/components/BlogPreviewSection.tsx`, `src/components/destinations/DestinationCard.tsx`, `src/components/review/ThingsToDoSection.tsx`, `src/components/reviews/HotelResultCard.tsx` — remove any Expedia/booking buttons or "Save Now / Book on" links
- `src/components/ReviewLoadingStages.tsx`, `src/components/SearchLoadingStages.tsx` — remove Expedia links/sponsor lines

**Loose ends:**
- `src/hooks/useGearIntel.ts` uses `detectCountry` for Amazon TLD logic. Move `detectCountry` into a small util `src/lib/geo.ts` so Amazon gear keeps working after `AffiliateLinks.tsx` is deleted.
- Remove `trackAffiliateClick` calls tied to Expedia/Hotels/VRBO. Keep the analytics function itself for Amazon usage.
- `src/components/AffiliateDisclosureBanner.tsx` and `src/pages/AffiliateDisclosure.tsx` stay (still relevant for Amazon).

## What stays

- All Amazon gear pages (`/gear`, `GearAdmin`, `GearImageManager`) and Amazon affiliate links inside `useGearIntel` / `GearResults`.
- `BookingSidebar`'s "Need travel gear?" link is preserved indirectly because the gear page itself is unchanged.
- All review content, ratings, FAQs, related reviews, AuthorBio, internal linking.

## Verification

1. `rg -i "expedia|hotels\.com|vrbo|bookingsidebar|affiliatelinks|inlineaffiliatecta|expediasearchwidget|traveldealssection" src` returns only Amazon-unrelated stragglers (ideally nothing).
2. Build passes.
3. Visit `/`, `/review/:slug`, `/reviews`, `/compare`, `/destinations`, `/top-destinations`, `/flights`, `/my-trips` — confirm zero "Book on …" buttons; gear pages unchanged.

Approve and I'll execute.