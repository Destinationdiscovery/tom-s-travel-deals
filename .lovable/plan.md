

# Next Phase: Expand to "Travel Answer Engine" — Trip Planner + Best Time + Homepage Cards

Given the massive scope of the user's prompt, here are the most logical and impactful items to build now, prioritized by what adds the most value with existing infrastructure.

---

## What We're Building (3 Items)

### 1. Rename "Gear" → "Trip Planner" + Expand Functionality
The existing `/gear` page already generates packing lists via Perplexity. We rename it and reposition it as a broader trip planning tool.

**File: `src/pages/Gear.tsx`** (keep filename, update content)
- Change page title/hero from "Travel Gear" to "Trip Planner Toolkit"
- Update subtitle: "Enter your trip → Get a personalized packing list, weather tips, and gear recommendations"
- Update search placeholder: "Where are you going? e.g. Cancun beach trip August"

**File: `src/components/Header.tsx`**
- Rename nav link from "Gear" to "Trip Planner"
- Keep route as `/gear` (avoid breaking existing URLs)

**File: `src/components/GearPreviewSection.tsx`**
- Rename section heading from "Travel Gear" to "Trip Planner Toolkit"
- Update subtitle to "Pack smart for any trip — get personalized gear lists"

**File: `src/components/Footer.tsx`**
- Update "Travel Gear" link text to "Trip Planner"

### 2. New "Best Time to Visit" Tool Page
A new AI-powered page at `/best-time` where users type a country/city and get best months, weather, crowds, and flight price trends — all via Perplexity.

**New file: `src/pages/BestTime.tsx`**
- Hero with search: "Where do you want to go?"
- Calls a new edge function that returns structured data: best months, weather by season, crowd levels, flight price trends, local events
- Results rendered as a clean card layout with weather icons, price indicators, and a verdict

**New file: `supabase/functions/best-time-intel/index.ts`**
- Uses Perplexity sonar model
- Prompt: "Best time to visit [destination] in 2026. Return JSON with: bestMonths, weather by season, crowdLevels, flightPriceTrends, localEvents, verdict"
- Structured output via response_format json_schema

**File: `src/App.tsx`**
- Add route: `/best-time` → BestTime page

**File: `src/components/Header.tsx`**
- Add "Best Time" to nav links

### 3. Expand Homepage Question Cards to Include New Tools
Update the "What Travelers Ask Us" section to include Trip Planner and Best Time queries alongside review queries — routing to the appropriate tool page.

**File: `src/components/TravelersAskSection.tsx`**
- Expand `ALL_QUERIES` to 16 items mixing all three types:
  - Reviews: "Best hotels Paris", "Is Bali worth it 2026?", etc. → `/reviews/:slug`
  - Trip Planner: "Cancun beach trip packing", "Italy August wedding trip" → `/gear?q=...`
  - Best Time: "Best time to visit Japan", "Best time Bali" → `/best-time?q=...`
- Add small icon/tag on each card showing the type (review, packing, calendar)
- Show 8 of 16 randomly

### 4. Update Hero Tagline to "Answer Engine" Positioning
**File: `src/components/HeroSection.tsx`**
- Change H1: "Answers Every Travel Question Before You Book"
- Change subtitle: "Reviews, packing lists, best times to visit, and more — all powered by AI, all in one place."
- Change search placeholder: "Ask anything: hotel reviews, packing lists, best time to visit..."

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/HeroSection.tsx` | Update tagline + subtitle to answer-engine positioning |
| `src/components/Header.tsx` | Rename "Gear" → "Trip Planner", add "Best Time" nav link |
| `src/components/Footer.tsx` | Rename "Travel Gear" → "Trip Planner" |
| `src/pages/Gear.tsx` | Rebrand to "Trip Planner Toolkit" (keep route) |
| `src/components/GearPreviewSection.tsx` | Rename section heading |
| `src/components/TravelersAskSection.tsx` | Expand to 16 cards with mixed tool types |
| `src/pages/BestTime.tsx` | **New** — Best Time to Visit tool page |
| `supabase/functions/best-time-intel/index.ts` | **New** — Perplexity-powered best-time data |
| `src/App.tsx` | Add `/best-time` route |

## Order
1. Hero tagline update
2. Rename Gear → Trip Planner (Header, Footer, page, preview section)
3. Create best-time-intel edge function
4. Create BestTime page + route
5. Expand TravelersAskSection with mixed query types

