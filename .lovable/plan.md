

# Swap Trending Queries with Trip Planner + Rename to "Trip Packing Toolkit"

## Changes

### 1. Swap section order in `src/pages/Index.tsx`
Move `TrendingQueriesSection` to where `GearPreviewSection` currently sits (right after `TravelersAskSection`), and move `GearPreviewSection` to where `TrendingQueriesSection` was (after `IntelPreviewSection`).

New order:
```text
TravelersAskSection
TrendingQueriesSection    ← moved up
BestTimePreviewSection
ItineraryPreviewSection
CurrencyPreviewSection
FlightsPreviewSection
IntelPreviewSection
GearPreviewSection        ← moved down
```

### 2. Rename "Trip Planner Toolkit" → "Trip Packing Toolkit" everywhere

| File | What changes |
|------|-------------|
| `src/components/GearPreviewSection.tsx` | Heading: "Trip Packing Toolkit", link text: "Pack Your Trip →", button: "Search" instead of "Find Gear", back button: "Back to Trip Packing Toolkit" |
| `src/pages/Gear.tsx` | H1: "Trip Packing Toolkit", SEO title/description, schema name, back button text: "Back to Trip Packing Toolkit" |
| `src/components/Header.tsx` | Tools dropdown label: "Trip Packing" |
| `src/components/Footer.tsx` | Link label: "Trip Packing Toolkit" |

### 3. Button text change
- "Find Gear" → "Search" (in GearPreviewSection search bar)
- Gear.tsx search button already says "Search" so no change needed there

