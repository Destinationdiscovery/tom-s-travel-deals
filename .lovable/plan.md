

# Redesigned Promo Walkthrough (~7-8 seconds)

## New Flow

The promo will be a rapid-fire showcase of all major features, keeping the branded intro but making everything much snappier.

### Timeline (approximate)

| Time | Stage | Duration | What's shown |
|------|-------|----------|-------------|
| 0.0s | HERO_REVEAL | 1.2s | Logo animates in with tagline over beach background |
| 1.2s | REVIEW_FLASH | 1.2s | Quick flash of a resort review card (Sandals Royal Barbados) with rating, photos, auto-scroll |
| 2.4s | INTEL_FLASH | 1.5s | "Cuba" typed into Travel Intel search, then 3 quick tab flashes: Requirements bullet list, Advisory level badge, News headlines -- cycling through each tab ~0.5s |
| 3.9s | GEAR_FLASH | 1.0s | A gear review card flashes in (e.g., packing cubes with star rating and verdict) |
| 4.9s | COMPARE_FLASH | 1.0s | Side-by-side comparison cards with verdict banner |
| 5.9s | BRANDING | 1.5s | "REVIEW THEN GO" logo + tagline fade in on black |
| ~7.4s | Loop/End | -- | Loops or fades out |

Total: ~7.4 seconds

## New Scenes to Create

### 1. PromoIntelScene (new component)
A mock Travel Intel results panel showing:
- A search bar with "Cuba" already typed
- Three tabs (Requirements / Advisories / News) that auto-switch
- Each tab shows 3-4 bullet points of mock static content
- Styled to match the real Travel Intel page

### 2. PromoGearScene (new component)  
A mock gear review card showing:
- Product image (using existing packing cubes asset)
- Product name, star rating, short verdict
- Quick fade-in, hold, fade-out

## Changes to Existing Files

### `PromoDemoWalkthrough.tsx` -- Full rewrite of stage machine
- New stages: `HERO_REVEAL`, `REVIEW_FLASH`, `INTEL_FLASH`, `GEAR_FLASH`, `COMPARE_FLASH`, `BRANDING`
- Remove the slow typing/suggestions/loading/save sequences
- All transitions are fast cross-fades (300-400ms)
- No typing animation, no loading stages, no save animation
- Hero reveal is shortened to 1.2s (from 2s + typing time)

### `PromoReviewScene.tsx` -- Minor tweaks
- Remove the save button (not needed in quick flash)
- Auto-scroll will be faster

### `PromoCompareScene.tsx` -- No changes needed, just shown briefly

### `PromoSaveBadge.tsx` -- No longer used in the new flow

### `PromoSlideshow.tsx` -- No changes needed

## Technical Details

### New stage type:
```
type Stage =
  | "HERO_REVEAL"
  | "REVIEW_FLASH"
  | "INTEL_FLASH"
  | "GEAR_FLASH"
  | "COMPARE_FLASH"
  | "BRANDING";
```

### New files:
- `src/components/promo/PromoIntelScene.tsx` -- Mock travel intel with tab cycling
- `src/components/promo/PromoGearScene.tsx` -- Mock gear review card

### Modified files:
- `src/components/PromoDemoWalkthrough.tsx` -- Rewritten stage machine with fast timings
- `src/components/promo/PromoReviewScene.tsx` -- Remove save button, speed up scroll

### Assets used:
- Existing Cuba gallery images for intel scene background feel
- `gear-packing-cubes-main.jpg` for gear scene
- `hero-beach.jpg` for hero (unchanged)

