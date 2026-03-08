

# Plan: Add Real Resort Photos to Blog-Style Quotes

## Approach

Use the same Google Places API photo lookup already used in `generate-review` — the `fetchPlacePhotos()` function searches Google Places for the resort name and returns photo references. These get served via the existing `place-photos` edge function proxy.

## Changes

### `supabase/functions/generate-quote/index.ts`

1. Copy the `fetchPlacePhotos()` helper from `generate-review/index.ts` (Google Places Text Search API, returns photo reference names)
2. After parsing the AI response, extract `metadata.resort_name` and call `fetchPlacePhotos(resortName, 4)` to get 3-4 real resort photos
3. Build image URLs using the existing `place-photos` proxy: `${SUPABASE_URL}/functions/v1/place-photos?name=${photoRef}`
4. Inject the images into the markdown at natural breakpoints (after the intro paragraph, near accommodation details) as standard markdown `![Resort photo](url)`
5. Return the enriched markdown in the response

No frontend changes needed — `react-markdown` already renders `<img>` tags from markdown image syntax.

| File | Change |
|------|--------|
| `supabase/functions/generate-quote/index.ts` | Add `fetchPlacePhotos()`, inject real Google Places photos into markdown |

