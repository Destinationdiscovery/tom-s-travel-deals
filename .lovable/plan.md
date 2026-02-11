

# Clear Results on Search Type Change

This adds one behavioral requirement to the unified search bar plan (already approved):

## What happens when the user changes the search type selector

When the user scrolls back up to the hero search bar and picks a different search type from the dropdown:

1. **Clear all visible results** -- call `clearReview()` in Index.tsx so the review card, error message, or any loaded content disappears immediately
2. **Clear the search input** -- reset the query text to empty so the new placeholder text is visible
3. **Page returns to its default state** -- the "Recently Reviewed" section reappears below the hero (the normal idle state), ready for the user to type a new query
4. **When they submit the new search**, the loading animation kicks in as usual (ReviewLoadingStages for destination reviews, or navigation to /gear or /travel-intel for other types)

## Technical detail

In `HeroSection.tsx`, the `searchType` state change handler will:
- Reset `query` to `""`
- Call a new `onSearchTypeChange` callback prop passed from `Index.tsx`

In `Index.tsx`, the `onSearchTypeChange` handler will:
- Call `clearReview()` (which already sets review to null and error to null)
- This automatically brings back `RecentlyReviewedSection` since the render condition `!review && !isLoading && !error` becomes true

No new dependencies or files needed -- this is a small addition wired into the same components being modified in the unified search bar plan.
