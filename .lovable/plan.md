

# Add Per-Week Pricing to Featured Deals Manager

## Overview
Add weekly pricing fields alongside the existing per-night fields in the deal edit form. This gives you the flexibility to display either nightly or weekly pricing for each deal.

## Changes

### 1. Database Migration
Add four new columns to the `featured_deals` table:
- `original_price_weekly` (numeric, nullable) -- original weekly price
- `sale_price_weekly` (numeric, nullable) -- sale weekly price
- `original_label_weekly` (text, nullable) -- e.g. "$2,730/week"
- `sale_label_weekly` (text, nullable) -- e.g. "$1,743/week"

### 2. Edit Form Update
**File:** `src/components/dashboard/FeaturedDealsManager.tsx`

- Add two new fields to the form state: `originalPriceWeekly` and `salePriceWeekly`
- Add a new row in the inline edit form below the per-night prices labeled "Original $/week" and "Sale $/week"
- On save, compute the weekly labels (e.g. `$1,743/week`) and include them in the database payload
- In the card preview (non-editing view), show the weekly price below the nightly price when set

### 3. Homepage Display Update
**File:** `src/components/TravelDealsSection.tsx`

- Read the new weekly fields from database overrides
- When weekly prices exist, display them as a second line below the nightly pricing (e.g. showing both "$249/night" and "$1,743/week")

## Technical Details

- Weekly fields are optional/nullable so existing deals continue working unchanged
- The weekly discount badge percentage will be calculated the same way as nightly
- Labels are auto-generated from the numeric values on save (formatted with commas for readability)
- The `DEFAULTS` array in `FeaturedDealsManager` will include `originalPriceWeekly: null` and `salePriceWeekly: null` defaults

