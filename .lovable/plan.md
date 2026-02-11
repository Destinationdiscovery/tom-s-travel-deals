

## Fix: Amazon Creators API Images Not Loading

### Root Cause
The edge function logs show two errors:
1. `Failed to parse AMAZON_ASSOCIATE_TAGS` — the secret value is not valid JSON
2. `No Amazon affiliate tag for country: CA` — since parsing fails, enrichment is completely skipped

The `enrichWithAmazonImages` function has an early return (`if (!tag) return items`) when no tag is found, so the Amazon Creators API is never called at all.

### Fix Steps

**1. Fix the `AMAZON_ASSOCIATE_TAGS` secret**
The secret must be valid JSON. It needs to be re-set with this exact format:
```
{"CA":"gen80s01-20","US":"destinati0a78-20","GB":"uktripreviews-21"}
```
(No extra quotes, no wrapping — just the raw JSON object)

**2. Clear stale cache**
Old cached results from before the API integration don't have Amazon images. Run a SQL migration to clear the `gear_intel_cache` table so fresh searches trigger the enrichment pipeline:
```sql
DELETE FROM gear_intel_cache;
```

**3. Add resilience — don't skip enrichment when tag is missing**
Update `supabase/functions/travel-gear-intel/index.ts` to make the enrichment more resilient:
- If `AMAZON_ASSOCIATE_TAGS` fails to parse, hardcode the known tags as a fallback directly in the function code so the API still gets called
- This prevents a misconfigured secret from silently breaking all product images

### Files to Change

**`supabase/functions/travel-gear-intel/index.ts`**
- Add hardcoded fallback tags after the JSON parse attempt:
  ```
  const DEFAULT_TAGS = { CA: "gen80s01-20", US: "destinati0a78-20", GB: "uktripreviews-21" };
  ```
- If `amazonTags` is empty after parsing, fall back to `DEFAULT_TAGS`
- This ensures the Amazon API is always called regardless of secret format issues

**Database migration**
- `DELETE FROM gear_intel_cache;` to clear stale results without Amazon images

**Re-deploy `travel-gear-intel`**

### Expected Result
After these changes, searching on the Gear page will:
1. Get product names from Perplexity
2. Successfully call the Amazon Creators API for each product
3. Return official `m.media-amazon.com` image URLs and direct product page links
4. Display real product photos instead of fallback category icons
