
# Fix Things to Do + Redesign Gear Cards + Affiliate Check

## 1. Fix "Things to Do Nearby" -- Exclude On-Site Activities

**File:** `supabase/functions/generate-review/index.ts` (line 178)

Replace the current `thingsToDo` instruction in the Perplexity prompt with explicit rules:
- Activities must be **outside** the property -- independent businesses/attractions in the surrounding area
- Never recommend on-site amenities (resort spa, pool bar, hotel restaurant, beach club, etc.)
- Each activity should require at least a short walk or drive away from the property
- Use real specific names, not generic descriptions

## 2. Redesign Gear Packing Cards -- Remove Images, Add Rich Info

**File:** `src/pages/Gear.tsx` -- `PackingResultCard` component (lines 65-114)

Remove the entire image section (lines 70-94) and redesign to a clean text-based card:
- **Category badge** in top-right corner (keep existing color system)
- **Product name** bold and prominent
- **Brand** small and muted below name
- **Price range** displayed as dollar-sign indicators (convert "$10-$20" to "$", "$20-$50" to "$$", etc.) with the actual range shown beside it
- **Reason/description** in muted text
- **"Get it on Amazon"** outline button + **"Review This"** primary button at bottom
- No image area at all -- clean card matching Destination Search style
- Remove the `imgError` state since images are gone

## 3. Affiliate Link Status

All affiliate links were verified in a previous check:
- **Geni.us links**: Active and redirecting (now removed with the gear reviews cleanup)
- **Amazon Associate tags** (CA: gen80s01-20, US: destinati0a78-20, GB: uktripreviews-21): Active, generated dynamically in `AffiliateLinks.tsx`
- **Expedia/Hotels.com/VRBO**: CJ redirect links with PID 101645364 are correctly structured and active
- No code changes needed for affiliate links

## Technical Summary

| File | Change |
|------|--------|
| `supabase/functions/generate-review/index.ts` | Update thingsToDo prompt to exclude on-site activities |
| `src/pages/Gear.tsx` | Remove image section from PackingResultCard, add dollar-sign price display |
