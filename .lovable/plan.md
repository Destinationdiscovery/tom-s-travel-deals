
# Quote Builder Search Upgrade: Autocomplete + Recent Reviews Refresh

## Overview

Two changes to the Quote Builder's Step 1 (Resort Selection):

1. **Add Google Places autocomplete** to the search input -- identical to the user-facing search on the homepage/destinations page. As you type, suggestions appear in a dropdown. Clicking a suggestion triggers the review generation.

2. **Recent reviews list** -- remove the old cached reviews that show with the plain card style. Instead, only show reviews fetched from `cached_reviews` using a cleaner card style with star ratings, location, and the "recently reviewed" label. Future reviews you generate will automatically appear here.

## Technical Details

### File: `src/components/dashboard/QuoteBuilder.tsx`

**Search with Autocomplete:**
- Import and use the existing `useSearchSuggestions` hook (same one the homepage uses)
- Add `showSuggestions` state to control dropdown visibility
- Replace the plain `Input` with a search input that shows a suggestions dropdown as you type (Google Places results with resort/hotel names)
- Clicking a suggestion sets the query and triggers `generateReview(name)`, same as the homepage flow
- Keep the Search button for manual submission
- Keep Enter key support

**Recent Reviews Cards:**
- Update the cached reviews cards to show star ratings (from `review_data.overallRating`) and a cleaner visual style matching the homepage review cards
- Show property name, location, and star rating in each card
- These pull from `cached_reviews` ordered by `created_at desc`, so any new reviews you generate will automatically appear at the top

### No database changes needed
### No new files needed

The `useSearchSuggestions` hook already handles the Google Places API call via the `places-autocomplete` edge function with debouncing and fallback to local database search.
