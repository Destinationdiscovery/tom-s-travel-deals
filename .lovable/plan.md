# Tool Pages Audit + Currency Bug Fix

## Issues found

### 1. Currency edge function fails on multi-word queries (BUG)
The user's screenshot shows "Edge Function returned a non-2xx status code" when typing **"USD to MXN"**. Confirmed by direct curl test:
- `query: "USD to MXN"` -> 400 error: `Currency "USD TO MXN" not found`
- `query: "Mexico"` -> 200 OK
- `query: "MXN"` -> works

**Root cause**: `supabase/functions/currency-tracker/index.ts` only handles single-word inputs. It does `query.toUpperCase().trim()` and looks up the result in a country/currency map. Phrases like "USD to MXN", "USD to Mexican Peso", or "100 euros in yen" all fail.

This is also why the AEO example cards on the Currency page break: their `ctaQuery` values are `"USD to MXN"`, `"EUR to JPY"`, `"USD to THB"` - all multi-word.

**Fix**: In `currency-tracker/index.ts`, parse the query to extract the target currency:
- Strip leading "USD to ", "1 USD = ", "convert ... to ", "X EUR in ", etc.
- Match the last 3-letter code in the string against currency codes (e.g., "USD to MXN" -> "MXN").
- Fall back to the existing country/currency map for words like "Mexico" or "yen".
- If nothing matches, return the existing helpful 400 error.

### 2. Card clickability audit results
Going page-by-page through every card-like element on each tool page:

**Already clickable (good)**:
- Homepage `ToolsDirectorySection` tool cards -> Link to each tool
- AEO example cards (all 8 pages) -> Link with prefilled query
- Destinations grid: `DestinationCard` -> review page
- Gear "Featured Gear" cards -> Amazon affiliate link (when `affiliateUrl` set), otherwise inert div (intentional placeholder)
- Gear `PackingResultCard` -> "Review This" button + Amazon link
- Flights deal cards -> Expedia CTA below the list

**Cards that are currently NOT clickable but should be** (small fixes):
- **BestTime page** "Local Events & Festivals" cards: pure info, no obvious destination. Leave as-is (no good link target).
- **BestTime page** Season cards: info-only. Leave as-is.
- **Safety page** "Common Scams" cards: info-only. Leave as-is.
- **Safety page** Category score cards: info-only. Leave as-is.
- **Itinerary page** Day cards / activities: info-only. Leave as-is.
- **Currency page** Conversion table cells: info-only. Leave as-is.
- **Flights page** individual `deal` cards: currently static. **Make these click through to the Expedia booking URL** (same destination as the existing "Book on Expedia" CTA), since that is the only meaningful action.
- **Flights page** "Ready to book?" card: already has the link, fine.
- **TravelIntel** news article cards: title is already a link. Make the **whole news card clickable** when `article.url` exists (currently only the title is the link).

### 3. Verified working edge functions (live curl tests)
- `currency-tracker` -> works for "Mexico", fails for "USD to MXN" (fix above)
- `best-time-intel` -> 200 OK, returns full structured data for "Bali"
- `flight-deals` -> 200 OK, returns deals for "NYC to Paris"
- `generate-itinerary` -> 200 OK, returns 5-day Tokyo plan
- `safety-intel` -> 200 OK, returns Bali safety scores
- `travel-intel` (requirements/advisories/news) -> already in production use, last verified working
- `travel-gear-intel` (used by /gear) -> already in production use
- `generate-review` (used by /destinations search) -> already in production use

All currently return 2xx for valid inputs. Only the currency multi-word bug needs a code fix.

## Changes

1. **`supabase/functions/currency-tracker/index.ts`**
   - Add a parsing step before the lookup: extract a 3-letter currency code from anywhere in the query (regex `/\b[A-Z]{3}\b/i`), and only fall back to country lookup if no code is found.
   - Strip filler words ("to", "in", "convert", "rate", numbers) before the country-name lookup.
   - Keep existing behavior and error message for unmatched input.

2. **`src/pages/Flights.tsx`**
   - Wrap each deal card in an `<a>` to the Expedia route URL with `trackAffiliateClick("Expedia", "/flights", "flight_deal_card")` on click. Add hover lift + cursor-pointer.

3. **`src/components/intel/IntelResults.tsx`**
   - In `NewsResult`, wrap each article card in an `<a href={article.url}>` when `article.url` is present (with hover affordance). Keep the title link visible for clarity but rely on outer link for click target. Remove the now-redundant inner `<a>` to avoid nested anchors.

4. **No-op pages** (Best Time, Safety, Itinerary, Currency, Destinations, Gear): all interactive cards already have a click target. Info-only result cards stay non-interactive (clicking them would have no meaningful destination).

## Out of scope
- Visual redesign of result cards
- Adding new sections to AEO content
- Re-running every edge function in every locale (already verified the representative requests above)
