

# Remove Google Flights + Fix Expedia Affiliate Links on Flights Page

## Problem
1. The "Ready to book?" section on `/flights` shows a Google Flights link (no affiliate revenue).
2. The Expedia Flights link uses a plain `expedia.com/Flights` URL with no affiliate tracking.

## Changes

### `src/pages/Flights.tsx`
- Import `detectCountry, EXPEDIA_LINKS` from `@/components/AffiliateLinks` and `trackAffiliateClick` from `@/lib/analytics`
- Replace `buildExpediaFlightUrl` to use the affiliate base URL: `EXPEDIA_LINKS[detectCountry()]` + `?destination=` + encoded route
- In the "Ready to book?" card, remove the Google Flights link and the separator dot
- Add `onClick` handler with `trackAffiliateClick("Expedia", "/flights", "flight_book_cta")`

### `src/components/FlightsPreviewSection.tsx`
- Update subtitle: remove "and Google Flights" so it just says "with links to book on Expedia."

### `src/data/compassArticles.ts`
- The Japan article mentions "Google Flights" in prose. Leave as-is since it's editorial content recommending tools to readers, not a CTA link.

## Files

| File | Action |
|------|--------|
| `src/pages/Flights.tsx` | Use affiliate Expedia URL, remove Google Flights link |
| `src/components/FlightsPreviewSection.tsx` | Update subtitle text |

