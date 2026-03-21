

# Add Back Navigation Buttons

## Problem
After clicking a question card → `/reviews/best-golf-resorts`, there's no way to go back to the homepage. After clicking "Review It" → `/review/pebble-beach`, there's no way to go back to the search results.

## Changes

### 1. `src/pages/Reviews.tsx`
- Add a "← Back to Home" button/link below the header (above the H1), using `navigate("/")` or a `<Link to="/">`

### 2. `src/pages/AIReview.tsx`
- Add a "← Back to Results" button below the header that uses `navigate(-1)` (browser back) to return to wherever the user came from (search results or homepage)

Both will be simple text links with an ArrowLeft icon, styled consistently, placed right after the Header component inside the main container.

## Files

| File | Action |
|------|--------|
| `src/pages/Reviews.tsx` | Add back-to-home link |
| `src/pages/AIReview.tsx` | Add back-to-results link |

