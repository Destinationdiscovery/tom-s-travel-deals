

# Fix Trip Planner Toolkit: Images, Back Buttons

## Issues
1. **No product images on packing list cards** — Perplexity returns fake/broken image URLs, and the `gear_product_images` DB table is likely empty. The `imageUrl` from Perplexity is unreliable.
2. **"Back to Featured Gear" text** — Should say "Back to Home" in both the homepage preview section and the `/gear` page.
3. **No "Back to Home" link on `/gear` page** — Needs a persistent back-to-home navigation.

## Fixes

### 1. Product Images — Use Amazon Image Search Fallback
**File: `supabase/functions/travel-gear-intel/index.ts`**
- After Perplexity returns items, for any item missing a valid `imageUrl`, construct a search URL to fetch an image via a lightweight image proxy approach.
- Better approach: Use the product name to build a direct Amazon product image search URL via the existing `gear-image-proxy` edge function (if it exists) or simply accept that Perplexity images are unreliable and show a styled placeholder with the category icon (which already works — the cards show the icon when `imageUrl` is falsy).
- **Root fix**: The Perplexity model likely returns fabricated URLs. Update the edge function to strip out any `imageUrl` that doesn't pass a basic URL validation, and instead rely on the `gear_product_images` DB table or the category icon fallback.

Actually, looking at the screenshot more carefully — the cards DO show but with empty gray boxes, meaning `imageUrl` IS being returned (so the `{item.imageUrl && ...}` block renders) but the actual URL is broken/404.

**File: `src/components/gear/GearResults.tsx`**
- In `PackingResultCard`, improve the `onError` handler: instead of just hiding the broken image, remove the entire image container and show the category icon fallback. Use state to track image load failure.

### 2. Back Button Text Updates
**File: `src/components/GearPreviewSection.tsx`** (line 116)
- Change "Back to Featured Gear" → "Back to Home"

**File: `src/pages/Gear.tsx`** (line 141)  
- Change "Back to Featured Gear" → "Back to Home"
- Change `handleBackToCards` behavior to navigate to `/` instead of just clearing results

### 3. Add Persistent "Back to Home" on `/gear` Page
**File: `src/pages/Gear.tsx`**
- Add a "Back to Home" link (using `Link` from react-router-dom) at the top of the content area, always visible regardless of results state

## Files

| File | Action |
|------|--------|
| `src/components/gear/GearResults.tsx` | Fix broken image fallback with state-based error handling |
| `src/components/GearPreviewSection.tsx` | Change back button text to "Back to Home" |
| `src/pages/Gear.tsx` | Add persistent "Back to Home" link, change back button behavior |

## Order
1. GearResults.tsx — fix image error handling
2. GearPreviewSection.tsx — back button text
3. Gear.tsx — back to home link + navigation

