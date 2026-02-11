

## Replace Google Custom Search with Free Image Alternative

The current product image approach uses Google Custom Search API (paid, currently returning 403 errors). We'll replace it with a free solution using **DuckDuckGo Instant Answer API images** combined with **direct Amazon product image URLs** constructed from search results -- but the simplest and most reliable free approach is to use the **Perplexity API itself** to search for product image URLs, since you already pay for that call.

### Approach: Use Perplexity's Built-in Search + Fallback Icons

Instead of making a separate API call per product for images, we'll:

1. **Keep the Perplexity-generated `imageUrl`** from the AI response as-is (it sometimes works)
2. **Remove the `product-image-search` edge function call** from `travel-gear-intel` -- no more Google CSE dependency
3. **Add a nicer fallback UI** in the frontend when images fail to load (category-based icons instead of a blank gray box)
4. **Clear the `gear_intel_cache` table** so stale entries without images are purged

This eliminates the paid Google API dependency entirely. Product images will come from Perplexity's web search (which often includes real image URLs), and when those fail, users see a clean category-themed fallback instead of broken images.

### Files to Change

**`supabase/functions/travel-gear-intel/index.ts`**
- Remove the entire `fetchProductImage` function and all calls to `product-image-search`
- Remove the image-fetching loop (lines ~319-350) that calls the Google CSE function
- Keep the `imageUrl` field that Perplexity already returns in its JSON response

**`src/pages/Gear.tsx`**
- Update the `PackingResultCard` fallback (when `imageUrl` is missing or errors) to show a styled category icon (e.g., a suitcase for Packing, a plug for Tech) instead of a plain gray box with a generic Package icon
- Same treatment for the review detail view's product image fallback

**Database: Clear stale cache**
- Run a migration to `DELETE FROM public.gear_intel_cache;` so old entries without images are refreshed on next search

**`supabase/functions/product-image-search/index.ts`**
- This function can be deleted since it's no longer called

**`supabase/config.toml`**
- Remove the `[functions.product-image-search]` entry

### Result
- No more Google CSE costs or 403 errors
- Images come free via Perplexity (already paid for)
- Clean fallback UI when images are unavailable
- Simpler architecture (one fewer edge function)
