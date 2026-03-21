

# Phase 3: Schema & Structured Data + Quick Verdict

## Overview
Add AggregateRating and Review JSON-LD schema to review pages, add a "Quick Verdict" summary block at the top of AI-generated reviews, and create property-style URL redirects.

## Changes

### 1. Quick Verdict Block on AI Review Pages
**File: `src/components/AIReviewResult.tsx`**
- Add a new "Quick Verdict" card at the very top of the review (before the summary card)
- Shows: Overall score, top 3 pros, top 3 cons (derived from ratings), "Worth booking if" (from bestFor), review sources note
- Structured with bold headings and bullet points so AI can quote verbatim

### 2. SEOHead on AI Review Pages
**File: `src/pages/AIReview.tsx`**
- Add `<SEOHead>` with:
  - Title: `"{property_name} Real Reviews 2026 | ReviewThenGo"`
  - Description from summary
  - `aggregateRating` prop (overallRating, ratings count derived from data)
  - `faq` prop with 3 auto-generated Q&As (e.g. "Is {property} worth it?", "What do travelers say about {property}?", "What's the rating for {property}?")
  - BreadcrumbList schema (Home > Reviews > {property_name})
  - URL set to `/review/{slug}`

### 3. SEOHead on Destination Review Pages
**File: `src/pages/DestinationReview.tsx`**
- Add `aggregateRating` prop to existing SEOHead (using the review's rating + ratings object)
- Add `faq` prop with destination-specific Q&As

### 4. Property-Style URL Redirects
**File: `src/App.tsx`**
- Add route: `/properties/:city/:name` that redirects to `/review/:name` (simple redirect component)
- This gives crawlers a clean property-hierarchy URL pattern

### 5. Destinations Hub Enhancement
**File: `src/pages/Destinations.tsx`**
- Add A-Z letter filter bar at top
- Add region filter chips (Caribbean, North America, Europe, Asia, etc.)
- Add SearchAction schema for the search bar

## Files

| File | Action |
|------|--------|
| `src/components/AIReviewResult.tsx` | Add Quick Verdict block |
| `src/components/QuickVerdict.tsx` | New — reusable verdict component |
| `src/pages/AIReview.tsx` | Add SEOHead with aggregateRating + FAQ schema |
| `src/pages/DestinationReview.tsx` | Add aggregateRating + FAQ to existing SEOHead |
| `src/App.tsx` | Add `/properties/:city/:name` redirect route |
| `src/pages/Destinations.tsx` | Add A-Z filter + region chips |

## Order
1. Create QuickVerdict component
2. Integrate into AIReviewResult
3. Add SEOHead to AIReview.tsx
4. Add schema to DestinationReview.tsx
5. Add property URL redirect
6. Enhance Destinations hub

