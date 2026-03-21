

# Fix: Auto-Generate Review When Not Found in Cache

## Problem
When clicking "Review It" on a Featured Deal card, the AIReview page navigates to `/review/:slug` and only looks up the `cached_reviews` table. If no cached review exists (which is the case for most deals), it shows "Couldn't Generate Review — Review not found."

## Fix

### `src/pages/AIReview.tsx`
- When the DB lookup returns no cached review (`data` is null), instead of showing an error, automatically call `supabase.functions.invoke("generate-review", { body: { propertyName } })` using the slug converted back to a readable name (replace hyphens with spaces, title-case)
- Show the existing loading skeleton while generating
- Once the review is generated and returned (the edge function also caches it), set it as the review state
- Only show "Review not found" error if the generate-review call itself fails

This matches the existing behavior of the homepage hero search — just triggered automatically from the slug instead of user input.

## Files

| File | Action |
|------|--------|
| `src/pages/AIReview.tsx` | Add auto-generate fallback when cached review not found |

