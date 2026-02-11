

# Replace Amazon Creators API with Perplexity Image URLs

## Summary
Remove the failing Amazon Creators API code and update Perplexity prompts to return product image URLs directly. Keep Amazon affiliate search links for monetization.

## Changes

### File: `supabase/functions/travel-gear-intel/index.ts`

**1. Remove Amazon Creators API code**
- Delete the OAuth token cache, `getAmazonOAuthToken`, `searchAmazonProduct`, `enrichWithAmazonImages`, and `enrichSingleProduct` functions (lines ~17-177)
- Delete the `VERSION_REGION` mapping since it's only used by the Creators API

**2. Update Perplexity prompts to request image URLs**
- "must-haves" prompt: Change `"Do NOT include imageUrl"` to ask Perplexity to include an `imageUrl` field with a direct URL to a product image found on the web (Amazon listing images, manufacturer photos, retailer sites)
- "review" prompt: Same change -- add `imageUrl` to the expected JSON output
- System message: Remove the `"Do NOT include imageUrl"` instruction

**3. Simplify the enrichment/post-processing section**
- After parsing the Perplexity response, just build Amazon affiliate search URLs (`/s?k=ProductName&tag=yourtag`) for each item
- No API calls needed -- just string construction using `MARKETPLACE_CONFIG` and `amazonTags`

**4. Keep existing infrastructure**
- `MARKETPLACE_CONFIG` (domain mapping) stays for building affiliate URLs
- `amazonTags` parsing stays for affiliate tag lookup
- `VACATION_CATEGORIES` and `detectVacationType` stay unchanged

### Post-deploy steps
- Clear `gear_intel_cache` table
- Redeploy the `travel-gear-intel` edge function

### No frontend changes needed
The UI already renders `imageUrl` on gear items and reviews -- it just hasn't been receiving any data because the Amazon API was failing.

