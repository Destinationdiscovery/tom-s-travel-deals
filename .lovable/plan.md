

## Promo Walkthrough Tweaks

Two quick fixes:

### 1. Faster review scroll

The auto-scroll during the REVIEW stage currently moves at `1.5px` every `50ms`. Increase the speed to `3px` per tick and reduce the REVIEW stage duration from 6s to 4s so it feels snappier for a promo.

**File**: `src/components/PromoDemoWalkthrough.tsx`
- Line 85: Change REVIEW timeout from `6000` to `4000`
- Line 168: Change scroll increment from `1.5` to `3`

### 2. Move the Skip button away from the save badge

The Skip button is `fixed bottom-8 right-8` which overlaps with the `PromoSaveBadge` (also `fixed bottom-6 right-6`). Move the Skip button to the **top-right** corner instead.

**File**: `src/components/PromoSlideshow.tsx`
- Line 22: Change `bottom-8 right-8` to `top-8 right-8`

