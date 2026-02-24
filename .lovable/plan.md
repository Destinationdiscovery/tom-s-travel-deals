
# Fix: Discount Calculation and Remove "CUSTOM" Badge

## Changes to `src/components/dashboard/FeaturedDealsManager.tsx`

### 1. Remove "CUSTOM" badge
Delete the badge element (lines 188-190) that shows "CUSTOM" on overridden cards. Also remove the related description text on line 177 mentioning "Custom overrides are marked with a badge."

### 2. Fix discount percentage calculation (line 182)
Replace the current calculation that divides by `slot.originalPrice` (which can be 0) with fallback logic:
- Use nightly prices if both are greater than 0
- Otherwise use weekly prices if both are greater than 0
- Default to 0% if neither are available

### 3. Conditionally show nightly pricing (lines 201-204)
Only render the nightly price row when `slot.originalPrice > 0 && slot.salePrice > 0`, so weekly-only deals don't show "$0/night".
