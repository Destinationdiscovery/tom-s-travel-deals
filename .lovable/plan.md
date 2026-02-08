

## Fix: Make the Sidebar Static (Remove Sticky Scroll)

### The Problem

The "Rating Breakdown" card in the review sidebar has `sticky top-28` applied to it (line 198 of `AIReviewResult.tsx`). This causes it to follow the user as they scroll down the page, eventually overlapping the "Best For" tags and the Location Map card below it.

### The Fix

Remove the `sticky top-28` class from the Rating Breakdown card so the entire sidebar stays in its natural position on the page -- no floating, no overlapping.

### File Change

| File | Change |
|------|--------|
| `src/components/AIReviewResult.tsx` | Line 198: Remove `sticky top-28` from the Rating Breakdown card's className, changing it from `"bg-card rounded-2xl p-6 shadow-soft sticky top-28"` to `"bg-card rounded-2xl p-6 shadow-soft"` |

That's it -- a single class removal. Everything else stays the same.

