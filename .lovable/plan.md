
# Destination Search: Loading Graphic and Clear Previous Search

## What Changes

### 1. Show loading stages graphic while searching
When a search is in progress, replace the results area with a search-specific loading stages component -- similar to the existing `ReviewLoadingStages` but with search-relevant steps like "Searching destinations...", "Comparing ratings...", "Building your list...". This reuses the same visual pattern (progress bar, staged checklist, travel tip) that the review pages use.

### 2. Clear previous results when starting a new search
The hook already clears results at the start of `search()` (line 23-24 in the hook). The issue is that the example chips only show when `results.length === 0 && !isLoading`, so they reappear correctly. The main change is ensuring the loading graphic replaces the old results immediately when a new search starts, giving a clean visual reset.

## Technical Details

### New component: `src/components/SearchLoadingStages.tsx`
A lighter variant of `ReviewLoadingStages` with search-specific stages:
- "Searching destinations..." (Search icon, 2s)
- "Comparing ratings and reviews..." (Star icon, 3s)  
- "Finding the best matches..." (MapPin icon, 3s)
- "Building your list..." (Sparkles icon, 0s -- stays active until results arrive)

Includes the same progress bar, "Did you know?" travel tip, and animated checkmarks. Reuses `Progress` component and the same icon set.

### File: `src/pages/TravelSearch.tsx`
- Import `SearchLoadingStages`
- When `isLoading` is true, render `SearchLoadingStages` in place of the results grid
- The hook already clears results/citations on new search, so the old results disappear immediately
- Add a "New Search" or "Clear" button near the results count that resets results and shows the chips again

### File: `src/hooks/useTravelSearch.ts`
- Add a `clearResults` function that resets `results`, `citations`, and `error` to their initial state
- Export it alongside the existing returns

### Files unchanged
- `ReviewLoadingStages.tsx` stays as-is (used for review generation)
- Hook already clears on new search -- just adding an explicit clear function
