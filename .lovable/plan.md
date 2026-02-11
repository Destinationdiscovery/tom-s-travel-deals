

# Destination Search

A new page at `/search` where users type natural-language queries like "adults only resorts in Punta Cana" and get a list of matching properties. Each result has a "Review It" button that triggers the existing review generation flow.

## User Flow

1. User clicks "Destination Search" in the top toolbar (or hero nav)
2. Lands on `/search` with a large search input and example query chips
3. Types a query and hits search
4. Gets 8-10 results as cards showing name, location, rating, description, price range, and best-for tags
5. Clicks "Review It" on any result -- navigates to home page and auto-triggers `generate-review` for that property, landing them on `/review/{slug}`

## Changes

### 1. New edge function
**File:** `supabase/functions/travel-search/index.ts`
- Calls Perplexity with a prompt optimized for returning a structured JSON list of 8-10 real properties matching the query
- Each result: `name`, `location`, `type`, `rating`, `description`, `bestFor` tags, `priceRange`
- Uses existing `PERPLEXITY_API_KEY` (already configured)

### 2. New hook
**File:** `src/hooks/useTravelSearch.ts`
- Manages query, results, loading, and error state
- Calls the `travel-search` edge function
- Returns typed results array

### 3. New page
**File:** `src/pages/TravelSearch.tsx`
- Header and Footer (matching existing pages)
- Search bar with placeholder: "Try: adults only resorts in Punta Cana"
- Example query chips below (e.g., "Beach resorts in Cancun", "Boutique hotels in Paris", "Family resorts in Jamaica")
- Results grid (1-2-3 column responsive)
- Each card shows: name, location, star rating, 1-2 sentence description, best-for tags, price range
- **"Review It" button** on each card -- navigates to `/review/{slug}` after triggering review generation

### 4. Header -- Add nav link
**File:** `src/components/Header.tsx`
- Add `{ to: "/search", label: "Destination Search" }` to the `navLinks` array (first position so it's prominent)

### 5. Hero section -- Add nav link
**File:** `src/components/HeroSection.tsx`
- Add "Destination Search" to the `heroNavLinks` array

### 6. Routing
**File:** `src/App.tsx`
- Add route: `<Route path="/search" element={<TravelSearch />} />`
- Import `TravelSearch` component

## Technical Details

### Edge function prompt strategy
The Perplexity prompt instructs the model to search for real, currently operating properties and return structured JSON. Uses `response_format` with `json_schema` for reliable parsing, plus the existing regex-based JSON repair as a fallback.

### "Review It" button behavior
When clicked, navigates to the Index page with a query parameter (e.g., `/?search=PropertyName`). The Index page detects this parameter and auto-triggers `generateReview`. Alternatively, the search page can call `generate-review` directly and navigate to `/review/{slug}` once the review is ready -- this keeps the user on the search page with a loading state on that specific card.

The second approach (call directly from search page) is cleaner:
- User clicks "Review It"
- That card shows a loading spinner
- Once the review is generated, navigate to `/review/{slug}`
- Uses the existing `useGenerateReview` hook

### No caching needed
Search results are ephemeral exploration. Individual reviews are already cached by `generate-review`.

