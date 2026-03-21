

# Reorder Homepage: Tools First, Deals After

## Change
Move all the new tool preview sections (Trip Planner, Best Time, Itinerary, Currency, Flights, Intel) and Trending Queries up — right after TravelersAskSection. Push RecentReviewsHomepage, TravelDealsSection, and BlogPreviewSection down below the tools.

## New Section Order in `src/pages/Index.tsx`

```text
Hero + Search
TrustBadges
AI Review Result
HowItWorks
TravelersAskSection

GearPreviewSection (Trip Planner)    ← tools block starts
BestTimePreviewSection
ItineraryPreviewSection
CurrencyPreviewSection
FlightsPreviewSection
IntelPreviewSection
TrendingQueriesSection               ← tools block ends

RecentReviewsHomepage                ← deals/content below
TravelDealsSection
BlogPreviewSection
HomepageFAQ
```

Remove the `SectionConnector` that linked gear — no longer needed since Trip Planner now appears right after the question cards.

## Files

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Reorder sections, remove SectionConnector |

