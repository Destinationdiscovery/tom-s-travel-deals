

# Fix: Discount Percentage and Pricing Display for Weekly-Only Deals

The issue appears in both the admin dashboard (`FeaturedDealsManager.tsx`) and the homepage (`TravelDealsSection.tsx`). When a deal only has weekly prices, the discount badge shows "NaN% OFF" and "$0/night" because:

1. `originalPrice` and `salePrice` are 0, causing division by zero
2. The nightly price line renders regardless

## Changes

### 1. `src/components/TravelDealsSection.tsx`

**DiscountBadge (line 59-75):** Update to accept optional weekly prices. Calculate percentage from nightly if both > 0, else from weekly if both > 0. This requires passing weekly price data into the badge.

- Add `originalPriceWeekly` and `salePriceWeekly` to `FeaturedDeal` interface (numeric fields)
- Read `original_price_weekly` and `sale_price_weekly` from DB in the fetch logic
- Update `DiscountBadge` to accept and use weekly fallback:
  ```
  hasNightly = original > 0 && sale > 0
  hasWeekly = originalWeekly > 0 && saleWeekly > 0
  use nightly if hasNightly, else weekly if hasWeekly, else hide badge
  ```
- Pass the correct original/sale values to `DiscountBadge`

**Pricing display (lines 188-198):** Conditionally render nightly vs weekly:
- Only show nightly row if `originalLabel` doesn't contain "$0"
- Only show weekly row if weekly labels exist
- Essentially: if nightly prices are 0, skip that row entirely

### 2. `src/components/dashboard/FeaturedDealsManager.tsx`

The admin preview already has the fix from the last diff. No changes needed here.

### Summary of touched files
- `src/components/TravelDealsSection.tsx` — fix discount badge calculation and conditional price row rendering

