

# Add Homepage View Tracking to Site Analytics

## Problem
The homepage (`/`) doesn't track page views. Only individual review pages call `track-review-view`. The analytics dashboard only shows property review slugs, not the homepage.

## Fix

### 1. Track Homepage Views in `src/pages/Index.tsx`
- Import `supabase` from `@/integrations/supabase/client`
- Add a `useEffect` on mount that calls `supabase.functions.invoke("track-review-view", { body: { slug: "homepage" } })` (fire-and-forget)
- This inserts/increments a `review_views` row with slug `"homepage"`

### 2. Optionally Track Other Tool Pages
Add the same one-liner to other high-traffic pages so they also appear in analytics:
- `src/pages/BestTime.tsx` → slug: `"best-time"`
- `src/pages/Itinerary.tsx` → slug: `"itinerary"`
- `src/pages/Flights.tsx` → slug: `"flights"`
- `src/pages/Gear.tsx` → slug: `"gear"`
- `src/pages/Currency.tsx` → slug: `"currency"`
- `src/pages/Safety.tsx` → slug: `"safety"`
- `src/pages/TravelIntel.tsx` → slug: `"travel-intel"`
- `src/pages/Compare.tsx` → slug: `"my-saves"`
- `src/pages/Compass.tsx` → slug: `"compass"`

Each page gets a simple `useEffect` with the fire-and-forget call.

### Files

| File | Action |
|------|--------|
| `src/pages/Index.tsx` | Add homepage view tracking on mount |
| `src/pages/BestTime.tsx` | Add page view tracking |
| `src/pages/Itinerary.tsx` | Add page view tracking |
| `src/pages/Flights.tsx` | Add page view tracking |
| `src/pages/Gear.tsx` | Add page view tracking |
| `src/pages/Currency.tsx` | Add page view tracking |
| `src/pages/Safety.tsx` | Add page view tracking |
| `src/pages/TravelIntel.tsx` | Add page view tracking |
| `src/pages/Compare.tsx` | Add page view tracking |
| `src/pages/Compass.tsx` | Add page view tracking |

