

# Homepage Tool Sections + Simplified Header Navigation

## Problem
11 nav links crammed into the header is overwhelming. Need a cleaner nav and better tool discovery.

## Approach
1. Simplify header to 6 items with a "Tools" dropdown for all 6 tool pages
2. Add 4 new homepage mini-sections (Best Time, Itinerary, Currency, Flights) matching existing preview section style
3. Then build remaining phases (Safety Scores, Trending Queries, SEO Polish) into the new layout

---

## Part A: Simplify Header Navigation

### `src/components/Header.tsx`
- Reduce `navLinks` to: Home, Destinations, Blog, Guides, Deals
- Add a "Tools" dropdown (using existing `DropdownMenu` UI component) containing:
  - Trip Planner (`/gear`)
  - Best Time (`/best-time`)
  - Itinerary (`/itinerary`)
  - Currency (`/currency`)
  - Flights (`/flights`)
  - Intel (`/travel-intel`)
- Each dropdown item has a small icon (Backpack, Calendar, Map, DollarSign, Plane, Brain)
- Mobile sheet: show tools as a collapsible sub-group

## Part B: Homepage Mini-Sections (4 new)

Each follows the same pattern as `GearPreviewSection` / `IntelPreviewSection`: heading, subtitle, 1-2 example cards or a mini search box, and a "Try It →" link.

### New: `src/components/BestTimePreviewSection.tsx`
- "Best Time to Visit" heading
- 3 destination chips (Japan, Bali, Paris) that link to `/best-time?q=...`
- "Find your perfect travel window →" CTA

### New: `src/components/ItineraryPreviewSection.tsx`
- "AI Itinerary Builder" heading
- 3 example chips (Tokyo 5 days, Paris weekend, Bali 7 days)
- "Build your itinerary →" CTA

### New: `src/components/CurrencyPreviewSection.tsx`
- "Currency Tracker" heading
- 3 popular currency chips (Mexico Peso, Euro, Japanese Yen)
- "Check exchange rates →" CTA

### New: `src/components/FlightsPreviewSection.tsx`
- "Flight Deals Finder" heading
- 3 route chips (NYC→Paris, LA→Tokyo, Toronto→Cancun)
- "Find flight deals →" CTA

### Update: `src/pages/Index.tsx`
Add the 4 new sections between existing content. Updated order:
```text
Hero + Search
TrustBadges
AI Review Result
HowItWorks
TravelersAskSection
RecentReviewsHomepage
TravelDealsSection
GearPreviewSection (Trip Planner)
BestTimePreviewSection    ← NEW
ItineraryPreviewSection   ← NEW
CurrencyPreviewSection    ← NEW
FlightsPreviewSection     ← NEW
IntelPreviewSection
BlogPreviewSection
HomepageFAQ
```

### Update: `src/components/Footer.tsx`
- Add all tool links under an "Tools" column

## Part C: Remaining Phases (built after layout)

### Phase 8: Safety Scores
- New page `/safety` + edge function (not in header — added to Tools dropdown)
- New `SafetyPreviewSection` on homepage

### Phase 9: Trending Queries
- New `TrendingQueriesSection` component on homepage
- 50 hardcoded evergreen queries, shows 8 randomly, links to appropriate tool pages

### Phase 10: SEO Polish
- Update `generate-sitemap` to include all tool URLs
- Add internal cross-links between tool pages
- Update Footer with complete tool links

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/Header.tsx` | Simplify to 5 links + Tools dropdown |
| `src/components/BestTimePreviewSection.tsx` | New — homepage preview |
| `src/components/ItineraryPreviewSection.tsx` | New — homepage preview |
| `src/components/CurrencyPreviewSection.tsx` | New — homepage preview |
| `src/components/FlightsPreviewSection.tsx` | New — homepage preview |
| `src/pages/Index.tsx` | Add 4 new preview sections |
| `src/components/Footer.tsx` | Add Tools column with all tool links |
| `src/pages/Safety.tsx` | New — Phase 8 (not yet) |
| `supabase/functions/safety-intel/index.ts` | New — Phase 8 (not yet) |

## Build Order
1. Header simplification (Tools dropdown)
2. 4 homepage preview sections
3. Update Index.tsx layout
4. Footer update
5. Phase 8: Safety Scores (page + edge function + preview section)
6. Phase 9: Trending Queries section
7. Phase 10: SEO polish

