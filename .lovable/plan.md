
# Fix: Auto-Scroll to Results After Search

## Problem

When clicking "Find Gear" (or any other search button), the search executes successfully and results render below the hero section. But since the hero takes up the full viewport height (`min-h-screen`), the results are invisible below the fold and the page never scrolls down to show them.

## Solution

Add auto-scroll behavior in `Index.tsx` so that after any search is triggered, the page smoothly scrolls down to the results area.

## Technical Detail

**File: `src/pages/Index.tsx`**

1. Add a `useRef` for the results container area (a div wrapping all results below the hero)
2. In `handleInlineSearch` and `handleSearch`, after triggering the search, scroll to that ref with a small delay (to let the loading state render first)
3. Use `scrollIntoView({ behavior: "smooth", block: "start" })` for a smooth transition

The ref target will be a wrapper `<div ref={resultsRef}>` placed right after the `HeroSection` component, encompassing all the result sections (AIReviewResult, intel results, gear results, etc.).

A short `setTimeout` (~100ms) ensures the loading indicator has rendered before scrolling.
