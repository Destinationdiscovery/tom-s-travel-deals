

## Replace Static Suggestions with Google Places Autocomplete

### What Changes

Instead of querying a small database table for autocomplete, the search bar will call **Google's Places Autocomplete API** in real-time. When you type "bell", you'll instantly see "Bellagio Las Vegas", "Bellaggio Italy", "Bell Tower Hotel" and dozens of other real places worldwide -- not just 20 hand-picked entries.

### How It Works

1. User starts typing in the search bar (2+ characters)
2. A backend function calls Google Places Autocomplete API with the query
3. Results come back instantly showing real hotels, resorts, destinations
4. User picks a suggestion (or types their own), then clicks "Explore reviews" to generate the AI review via Perplexity (existing flow, unchanged)

### What You'll Need

A **Google Places API key** from the Google Cloud Console. Google offers $200/month free credit which covers roughly 11,000-28,000 autocomplete requests -- more than enough for a travel blog.

### Changes

| Action | File / Resource | What Changes |
|--------|----------------|--------------|
| New secret | Backend | Store `GOOGLE_PLACES_API_KEY` securely |
| New function | `supabase/functions/places-autocomplete/index.ts` | Edge function that proxies Google Places Autocomplete requests, filtering for travel-relevant place types (hotels, resorts, landmarks, cities) |
| Update config | `supabase/config.toml` | Register the new function with `verify_jwt = false` |
| Rewrite | `src/hooks/useSearchSuggestions.ts` | Call the new edge function instead of querying the database; fall back to database results if the API call fails |
| Minor update | `src/components/HeroSection.tsx` | Update the suggestion display to show the richer data from Google (e.g., secondary text like city/country) |

### Technical Details

**Edge Function** (`places-autocomplete/index.ts`):
- Receives `{ input: "bell" }` from the frontend
- Calls `https://places.googleapis.com/v1/places:autocomplete` (new Google Places API)
- Filters by `includedPrimaryTypes` for lodging, tourist attractions, and localities
- Returns an array of `{ placeId, mainText, secondaryText }` suggestions
- Wrapped in try/catch with proper CORS headers

**Updated Hook** (`useSearchSuggestions.ts`):
- Calls the edge function via `supabase.functions.invoke("places-autocomplete", { body: { input: query } })`
- 300ms debounce (same as current)
- Falls back to querying `search_suggestions` + `cached_reviews` tables if the API call fails
- Returns unified suggestion objects for the dropdown

**Suggestion Dropdown** (`HeroSection.tsx`):
- Shows the place name (main text) prominently
- Shows location context (secondary text like "Las Vegas, NV, USA") in smaller text below
- Existing click-to-search behavior remains the same

The existing review generation flow (Perplexity AI) and caching logic are completely unchanged -- this only upgrades the autocomplete/typeahead experience.
