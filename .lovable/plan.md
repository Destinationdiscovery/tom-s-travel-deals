

# Fix Gear Product Image Matching

## Problem
1. The keyword matching in the edge function is too strict -- "carry-on" (hyphenated) doesn't match "carry on" (spaces), so the image never attaches.
2. No packing cubes image mapping exists in the database.

## Changes

### 1. Fix keyword matching in edge function (`supabase/functions/travel-gear-intel/index.ts`)
Update `attachProductImages` and `attachSingleProductImage` to normalize both the product name and keyword before comparing -- strip hyphens and extra spaces so "carry-on" matches "carry on".

```
// Before:
itemName.includes(row.product_keyword.toLowerCase())

// After: normalize by replacing hyphens with spaces
const normalize = (s: string) => s.toLowerCase().replace(/-/g, " ");
normalize(itemName).includes(normalize(row.product_keyword))
```

### 2. Add packing cubes image to the library
- Upload the existing `src/assets/gear-packing-cubes-main.jpg` to the `gear-images` storage bucket
- Insert a `gear_product_images` row mapping keyword **"packing cubes"** to the public URL

### 3. Clear the cache entry
- Delete the current cached result for "beach vacation mexico" so the next search fetches fresh results with images properly attached

## Technical details
- The normalize function will be extracted as a shared helper used by both `attachProductImages` and `attachSingleProductImage`
- Redeploy the `travel-gear-intel` edge function after the fix
