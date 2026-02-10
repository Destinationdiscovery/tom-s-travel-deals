

## Gear Page Fixes (6 Changes)

### 1. Fix Product Images - New Approach with Google Custom Search

Perplexity cannot reliably return working image URLs. The new approach: create a dedicated `gear-product-image` edge function that uses Google Custom Search JSON API to find real product images.

- Uses your existing `GOOGLE_PLACES_API_KEY` (same Google Cloud project)
- Requires one new secret: `GOOGLE_CSE_ID` (a free Programmable Search Engine ID you create at https://programmablesearchengine.google.com/)
- The edge function takes a product name, searches Google Images, and returns the first result URL
- Frontend calls this for each product in the packing list after results load

**Flow**: Packing list loads -> for each item without an image, call the image function in parallel -> update cards as images arrive.

Also remove imageUrl from the Perplexity prompts entirely (stop asking it to hallucinate URLs).

### 2. Remove Em-dash from Empty State

Change the empty state text from:
> "Describe your trip above and we'll recommend the best gear -- with full AI reviews on demand."

To:
> "Describe your trip above and we'll recommend the best gear with real Amazon reviews on demand."

### 3. Change "AI reviews" to "real Amazon reviews"

In the empty state and packing list description, replace references to "AI-powered product review" and "AI reviews" with "real Amazon reviews" language. In the review panel, change "Compiled from Real Product Reviews" to "Compiled from Real Amazon Reviews" and remove the sub-text about "AI-curated summary".

### 4. Add Search Button to Right Side of Input

Add a clickable arrow/search button inside the search input on the right side (like the reference screenshot shows). This gives users a clear way to submit besides pressing Enter.

### 5. Clear Previous Results on New Search

In the `fetchPackingList` function in the hook, add `setPackingData(null)` at the start so old results disappear and the loading animation shows again (same as first search).

### 6. Remove Search Icon from Input

Remove the `Search` icon that currently sits inside the left side of the search input in the hero section.

---

### Technical Detail

| Action | File | Change |
|--------|------|--------|
| Create | `supabase/functions/gear-product-image/index.ts` | New edge function: takes product name, returns image URL via Google Custom Search |
| Modify | `supabase/functions/travel-gear-intel/index.ts` | Remove imageUrl from Perplexity prompts and validation logic |
| Modify | `src/hooks/useGearIntel.ts` | Add `setPackingData(null)` at start of `fetchPackingList`; add image fetching logic |
| Modify | `src/pages/Gear.tsx` | Remove Search icon from input; add submit button; update copy (em-dash, AI reviews text); remove "AI-curated" text from review panel |
| Secret | `GOOGLE_CSE_ID` | User needs to provide a Google Programmable Search Engine ID (free) |

