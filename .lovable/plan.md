

# Add "Destination Search" to Hero Dropdown Menu

## What's changing

Adding the existing "Destination Search" feature (e.g. "adults only resorts in Punta Cana") as a new option in the hero search dropdown, so it works inline just like gear, advisories, requirements, and news.

## Technical Detail

### 1. `src/components/HeroSection.tsx`
- Add `"search"` to the `SearchType` union: `"destination" | "search" | "gear" | "requirements" | "advisories" | "news"`
- Add a new entry in `searchTypeConfigs`:
  - Label: "Destination Search"
  - Placeholder: `'e.g. "Adults only in Punta Cana" or "Beach resorts in Cancun"'`
  - Button label: "Search"

### 2. `src/pages/Index.tsx`
- Import `useTravelSearch` hook
- Add the `travelSearch` hook instance
- Add `travelSearch.clearResults()` to the `clearAllResults` function
- Handle `type === "search"` in `handleInlineSearch` -- call `travelSearch.search(query)`
- Add a `handleReviewFromSearch` function (clicking "Review It" on a search result card triggers `generateReview`)
- Update `hasAnyResults` to include `travelSearch.results.length > 0`
- Update `isAnyLoading` to include `travelSearch.isLoading`
- Add render sections for:
  - Loading: show `SearchLoadingStages` when `travelSearch.isLoading`
  - Results: show a grid of result cards (reusing the card layout from `TravelSearch.tsx`) with "Review It" buttons
  - Error: show error message
  - Citations: show source links

### 3. Clearing behavior
- `clearAllResults` will call `travelSearch.clearResults()` alongside the existing clears
- Switching search types or starting any new search will wipe travel search results too

No new components needed -- the result cards will be rendered directly in `Index.tsx` using the same Card/Badge/Star pattern from the existing `/search` page.

