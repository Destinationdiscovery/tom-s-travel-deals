
# Plan: Route Broad / Listicle Searches to a List View Instead of an Empty Property Page

## What's happening

You searched **"world's best golf resorts"** in the hero search. The hero hands every query to `generate-review`, which expects a single property name. With a listicle/category query, the AI cannot return a real property, so the page renders with an empty Quick Verdict ("/5 Overall", no pros, no cons) like in your screenshot.

The site already has the right infrastructure for these queries:
- **`/reviews/:query`** route → `Reviews.tsx` → uses `travel-search` edge function → returns a ranked list of matching properties as `HotelResultCard`s (the same UX used by `TrendingQueriesSection` links).

We just need the hero (and any other primary search) to **detect intent** and route accordingly.

## Intent detection (lightweight, in-browser)

Treat a query as a **listicle / broad search** if it matches any of these:
- Contains words like: `best`, `top`, `cheapest`, `luxury`, `family`, `adults only`, `all-inclusive`, `boutique`, `resorts`, `hotels`, `villas`, `worth`, `vs`, `compare`, `things to do`, `where to stay`, `near`
- Starts with a question word: `what`, `where`, `how`, `is`, `are`, `which`
- Is more than 5 words
- Contains a plural property keyword: `resorts`, `hotels`, `villas`, `hostels`, `cruises`

Otherwise treat it as a **single property** query (e.g. "Atlantis Bahamas", "Hotel Bel-Air") and use the current `generate-review` flow.

This is a pure helper (no AI call, no latency). Tunable list lives in one file.

## Files touched

| File | Change |
|---|---|
| `src/lib/searchIntent.ts` (new) | Tiny helper `classifySearchIntent(query): "listicle" \| "property"`. Single source of truth for the keyword list. |
| `src/pages/Index.tsx` | In `handleHeroSearch`, classify the query. If `listicle` → `navigate('/reviews/<slugified-query>')`. If `property` → existing `generateReview(query)` flow. |
| `src/components/reviews/StickySearchBar.tsx` (any other primary search inputs that hit generate-review) | Use the same helper so behavior is consistent across the site. |
| `src/components/AIReviewResult.tsx` | Defensive fallback: if `generate-review` returns an empty/zero-rating result (e.g. `overallRating === 0` and no `summary`), render a friendly "We couldn't find a single property matching that. Try browsing list results instead →" card with a button that navigates to `/reviews/<slug>`. This catches edge cases the classifier misses. |

## Result for your example

Searching **"world's best golf resorts"** will now route to **`/reviews/worlds-best-golf-resorts`**, where `Reviews.tsx` calls `travel-search` and renders a real ranked list of golf resorts as cards (Pebble Beach, St Andrews, Bandon Dunes, etc.) with "Review It" buttons that drill into a real single-property review.

## Out of scope

- Changing the `travel-search` edge function itself (it already handles broad queries well).
- AI-based intent classification (the keyword heuristic is enough for 95% of cases and is free + instant).
